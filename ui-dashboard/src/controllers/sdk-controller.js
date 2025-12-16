/**
 * SDK Controller
 * Manages all Decentralized Internet SDK components
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const ps = require('ps-node');

class SDKController {
  constructor(io) {
    this.io = io;
    this.components = new Map();
    this.processes = new Map();
    this.logs = new Map();
    this.rootDir = path.join(__dirname, '..', '..', '..');
    
    // Define SDK components
    this.componentConfigs = {
      'decentg': {
        name: 'DecentG Mesh Network',
        path: path.join(this.rootDir, 'decentg'),
        startCommand: 'node',
        startArgs: ['index.js'],
        port: 3000,
        status: 'stopped'
      },
      'clusterpost': {
        name: 'ClusterPost',
        path: path.join(this.rootDir, 'clusterpost'),
        startCommand: 'node',
        startArgs: ['index.js'],
        port: 8180,
        status: 'stopped',
        env: { NODE_ENV: 'production' }
      },
      'gridbee': {
        name: 'GridBee Framework',
        path: path.join(this.rootDir, 'gridbee-framework-old'),
        startCommand: 'haxe',
        startArgs: ['compile.hxml'],
        status: 'stopped'
      },
      'p2talk': {
        name: 'P2Talk (GSM Alternative)',
        path: path.join(this.rootDir, 'packages', 'p2talk'),
        startCommand: 'node',
        startArgs: ['lib/p2p.js'],
        port: 8000,
        status: 'stopped'
      },
      'lnrchain': {
        name: 'LNRChain',
        path: path.join(this.rootDir, 'LNRChain'),
        startCommand: 'node',
        startArgs: ['app.js'],
        status: 'stopped'
      },
      'bigchaindb': {
        name: 'BigchainDB',
        path: path.join(this.rootDir, 'clusterpost', 'bigchaindb'),
        startCommand: 'docker-compose',
        startArgs: ['up', '-d'],
        status: 'stopped'
      }
    };
    
    // Initialize component status
    this.componentConfigs.forEach((config, name) => {
      this.components.set(name, { ...config });
      this.logs.set(name, []);
    });
  }
  
  /**
   * Get status of all components
   */
  async getStatus() {
    const status = {};
    
    for (const [name, config] of this.components.entries()) {
      const isRunning = await this.isProcessRunning(name);
      status[name] = {
        name: config.name,
        status: isRunning ? 'running' : 'stopped',
        port: config.port,
        path: config.path
      };
    }
    
    return status;
  }
  
  /**
   * Check if a process is running
   */
  async isProcessRunning(componentName) {
    const processInfo = this.processes.get(componentName);
    if (!processInfo || !processInfo.pid) {
      return false;
    }
    
    return new Promise((resolve) => {
      ps.lookup({ pid: processInfo.pid }, (err, resultList) => {
        if (err || !resultList || resultList.length === 0) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }
  
  /**
   * Start a component
   */
  async startComponent(componentName, config = {}) {
    console.log(`Starting component: ${componentName}`);
    
    const componentConfig = this.components.get(componentName);
    if (!componentConfig) {
      throw new Error(`Component ${componentName} not found`);
    }
    
    // Check if already running
    if (await this.isProcessRunning(componentName)) {
      throw new Error(`Component ${componentName} is already running`);
    }
    
    // Check if path exists
    if (!fs.existsSync(componentConfig.path)) {
      throw new Error(`Component path ${componentConfig.path} does not exist`);
    }
    
    // Spawn process
    const env = { ...process.env, ...componentConfig.env, ...config.env };
    
    const childProcess = spawn(
      componentConfig.startCommand,
      componentConfig.startArgs,
      {
        cwd: componentConfig.path,
        env: env,
        shell: true
      }
    );
    
    // Store process info
    this.processes.set(componentName, {
      process: childProcess,
      pid: childProcess.pid,
      startTime: Date.now()
    });
    
    // Handle stdout
    childProcess.stdout.on('data', (data) => {
      const log = {
        time: new Date().toISOString(),
        type: 'stdout',
        message: data.toString()
      };
      this.addLog(componentName, log);
      this.io.emit('component-log', { component: componentName, log });
    });
    
    // Handle stderr
    childProcess.stderr.on('data', (data) => {
      const log = {
        time: new Date().toISOString(),
        type: 'stderr',
        message: data.toString()
      };
      this.addLog(componentName, log);
      this.io.emit('component-log', { component: componentName, log });
    });
    
    // Handle exit
    childProcess.on('exit', (code) => {
      console.log(`Component ${componentName} exited with code ${code}`);
      this.processes.delete(componentName);
      
      const status = { component: componentName, code };
      this.io.emit('component-stopped', status);
    });
    
    // Handle errors
    childProcess.on('error', (error) => {
      console.error(`Error starting ${componentName}:`, error);
      this.io.emit('component-error', {
        component: componentName,
        error: error.message
      });
    });
    
    // Update status
    componentConfig.status = 'running';
    this.io.emit('component-started', { component: componentName });
    
    return {
      pid: childProcess.pid,
      startTime: Date.now()
    };
  }
  
  /**
   * Stop a component
   */
  async stopComponent(componentName) {
    console.log(`Stopping component: ${componentName}`);
    
    const processInfo = this.processes.get(componentName);
    if (!processInfo) {
      throw new Error(`Component ${componentName} is not running`);
    }
    
    return new Promise((resolve, reject) => {
      const { process: childProcess } = processInfo;
      
      // Try graceful shutdown first
      childProcess.kill('SIGTERM');
      
      // Force kill after 10 seconds
      const killTimeout = setTimeout(() => {
        childProcess.kill('SIGKILL');
      }, 10000);
      
      childProcess.on('exit', () => {
        clearTimeout(killTimeout);
        this.processes.delete(componentName);
        
        const componentConfig = this.components.get(componentName);
        if (componentConfig) {
          componentConfig.status = 'stopped';
        }
        
        this.io.emit('component-stopped', { component: componentName });
        resolve();
      });
    });
  }
  
  /**
   * Start all components
   */
  async startAll() {
    console.log('Starting all components...');
    
    for (const [name] of this.components.entries()) {
      try {
        await this.startComponent(name);
      } catch (error) {
        console.error(`Failed to start ${name}:`, error.message);
      }
    }
  }
  
  /**
   * Stop all components
   */
  async stopAll() {
    console.log('Stopping all components...');
    
    const promises = [];
    for (const [name] of this.processes.entries()) {
      promises.push(this.stopComponent(name).catch(err => {
        console.error(`Failed to stop ${name}:`, err.message);
      }));
    }
    
    await Promise.all(promises);
  }
  
  /**
   * Get logs for a component
   */
  getLogs(componentName, limit = 100) {
    const logs = this.logs.get(componentName) || [];
    return logs.slice(-limit);
  }
  
  /**
   * Add log entry
   */
  addLog(componentName, log) {
    const logs = this.logs.get(componentName) || [];
    logs.push(log);
    
    // Keep only last 1000 logs
    if (logs.length > 1000) {
      logs.shift();
    }
    
    this.logs.set(componentName, logs);
  }
  
  /**
   * Cleanup
   */
  async cleanup() {
    await this.stopAll();
  }
}

module.exports = SDKController;
