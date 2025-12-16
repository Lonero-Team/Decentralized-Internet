/**
 * Monitoring Service
 * Real-time monitoring of network, processes, and system metrics
 */

const os = require('os');
const axios = require('axios');

class MonitoringService {
  constructor(io) {
    this.io = io;
    this.monitoringInterval = null;
    this.metrics = {
      system: {},
      network: {},
      components: {},
      history: []
    };
  }
  
  /**
   * Start monitoring
   */
  startMonitoring() {
    console.log('Starting monitoring service...');
    
    // Initial metrics collection
    this.collectMetrics();
    
    // Collect metrics every 5 seconds
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
    }, 5000);
  }
  
  /**
   * Stop monitoring
   */
  stopMonitoring() {
    console.log('Stopping monitoring service...');
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }
  
  /**
   * Collect all metrics
   */
  async collectMetrics() {
    const timestamp = Date.now();
    
    // System metrics
    const systemMetrics = this.getSystemMetrics();
    
    // Network metrics
    const networkMetrics = await this.getNetworkMetrics();
    
    // Component metrics
    const componentMetrics = await this.getComponentMetrics();
    
    // Store current metrics
    this.metrics = {
      system: systemMetrics,
      network: networkMetrics,
      components: componentMetrics,
      timestamp
    };
    
    // Add to history
    this.metrics.history.push({
      timestamp,
      cpu: systemMetrics.cpu,
      memory: systemMetrics.memory.usedPercent,
      network: networkMetrics.connections
    });
    
    // Keep only last 100 entries (8 minutes at 5s intervals)
    if (this.metrics.history.length > 100) {
      this.metrics.history.shift();
    }
    
    // Emit to clients
    this.io.emit('metrics-update', this.metrics);
  }
  
  /**
   * Get system metrics
   */
  getSystemMetrics() {
    const cpus = os.cpus();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    
    // Calculate CPU usage
    let totalIdle = 0;
    let totalTick = 0;
    
    cpus.forEach(cpu => {
      for (let type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });
    
    const cpuUsage = 100 - ~~(100 * totalIdle / totalTick);
    
    return {
      cpu: cpuUsage,
      memory: {
        total: totalMem,
        used: usedMem,
        free: freeMem,
        usedPercent: ((usedMem / totalMem) * 100).toFixed(2)
      },
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname(),
      uptime: os.uptime()
    };
  }
  
  /**
   * Get network metrics
   */
  async getNetworkMetrics() {
    const networkInterfaces = os.networkInterfaces();
    const interfaces = [];
    
    for (const [name, addrs] of Object.entries(networkInterfaces)) {
      const ipv4 = addrs.find(addr => addr.family === 'IPv4');
      if (ipv4) {
        interfaces.push({
          name,
          address: ipv4.address,
          netmask: ipv4.netmask,
          mac: ipv4.mac
        });
      }
    }
    
    // Try to get mesh network status from DecentG
    let meshStatus = null;
    try {
      const response = await axios.get('http://localhost:3000/api/status', {
        timeout: 1000
      });
      meshStatus = response.data;
    } catch (error) {
      // DecentG not running or not responding
    }
    
    // Try to get ClusterPost status
    let clusterpostStatus = null;
    try {
      const response = await axios.get('http://localhost:8180/executionserver', {
        timeout: 1000
      });
      clusterpostStatus = response.data;
    } catch (error) {
      // ClusterPost not running or not responding
    }
    
    return {
      interfaces,
      mesh: meshStatus,
      clusterpost: clusterpostStatus,
      connections: this.countActiveConnections()
    };
  }
  
  /**
   * Count active network connections
   */
  countActiveConnections() {
    // This is a simplified version
    // In production, you'd use netstat or similar
    return Math.floor(Math.random() * 50) + 10; // Placeholder
  }
  
  /**
   * Get component-specific metrics
   */
  async getComponentMetrics() {
    const components = {};
    
    // DecentG metrics
    try {
      const decentgStatus = await axios.get('http://localhost:3000/api/status', {
        timeout: 1000
      });
      
      const decentgPeers = await axios.get('http://localhost:3000/api/peers', {
        timeout: 1000
      });
      
      const decentgRoutes = await axios.get('http://localhost:3000/api/routes', {
        timeout: 1000
      });
      
      components.decentg = {
        status: 'running',
        peers: decentgPeers.data.peers.length,
        routes: decentgRoutes.data.routes.length,
        uptime: decentgStatus.data.uptime
      };
    } catch (error) {
      components.decentg = {
        status: 'stopped',
        peers: 0,
        routes: 0
      };
    }
    
    // ClusterPost metrics (placeholder)
    components.clusterpost = {
      status: 'stopped',
      jobs: 0,
      nodes: 0
    };
    
    // GridBee metrics (placeholder)
    components.gridbee = {
      status: 'stopped',
      workers: 0,
      tasks: 0
    };
    
    return components;
  }
  
  /**
   * Get current metrics
   */
  getMetrics() {
    return this.metrics;
  }
  
  /**
   * Get metrics history
   */
  getHistory(duration = 300000) { // 5 minutes default
    const cutoff = Date.now() - duration;
    return this.metrics.history.filter(entry => entry.timestamp >= cutoff);
  }
}

module.exports = MonitoringService;
