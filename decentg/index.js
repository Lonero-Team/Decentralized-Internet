/**
 * DecentG - Hybrid Mesh Network
 * Main entry point for the hybrid mesh network combining P2P with Open5gs/Free5gc
 */

const EventEmitter = require('eventemitter2').EventEmitter2;
const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuidv4');
const fs = require('fs');
const path = require('path');

// Import core modules
const MeshController = require('./src/mesh-controller');
const FiveGCoreInterface = require('./src/5g-core-interface');
const PeeringManager = require('./src/peering-manager');
const RouterModule = require('./src/router-module');
const NodeDiscovery = require('./src/node-discovery');

class DecentG extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.config = this.loadConfig(options.configPath || './config.json');
    this.nodeId = uuidv4();
    this.options = { ...this.config, ...options };
    
    // Initialize components
    this.meshController = null;
    this.fiveGCore = null;
    this.peeringManager = null;
    this.router = null;
    this.discovery = null;
    this.apiServer = null;
    
    this.isRunning = false;
    this.peers = new Map();
    this.routingTable = new Map();
    
    console.log(`[DecentG] Node initialized with ID: ${this.nodeId}`);
  }
  
  /**
   * Load configuration from file
   */
  loadConfig(configPath) {
    try {
      const configData = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(configData);
    } catch (error) {
      console.warn(`[DecentG] Could not load config from ${configPath}, using defaults`);
      return this.getDefaultConfig();
    }
  }
  
  /**
   * Get default configuration
   */
  getDefaultConfig() {
    return {
      network: {
        meshPort: 8000,
        apiPort: 3000,
        networkId: 'decentg-mesh-001',
        host: '0.0.0.0'
      },
      open5gs: {
        enabled: true,
        amfHost: '127.0.0.1',
        amfPort: 38412
      },
      free5gc: {
        enabled: false
      },
      mesh: {
        maxPeers: 50,
        peerTimeout: 30000,
        discoveryInterval: 10000
      }
    };
  }
  
  /**
   * Initialize all components
   */
  async initialize() {
    console.log('[DecentG] Initializing components...');
    
    // Initialize Mesh Controller
    this.meshController = new MeshController({
      nodeId: this.nodeId,
      port: this.config.network.meshPort,
      maxPeers: this.config.mesh.maxPeers,
      networkId: this.config.network.networkId
    });
    
    // Initialize 5G Core Interface
    this.fiveGCore = new FiveGCoreInterface({
      open5gs: this.config.open5gs,
      free5gc: this.config.free5gc,
      nodeId: this.nodeId
    });
    
    // Initialize Peering Manager
    this.peeringManager = new PeeringManager({
      nodeId: this.nodeId,
      meshController: this.meshController,
      maxPeers: this.config.mesh.maxPeers
    });
    
    // Initialize Router Module
    this.router = new RouterModule({
      nodeId: this.nodeId,
      algorithm: this.config.routing?.algorithm || 'dijkstra'
    });
    
    // Initialize Node Discovery
    this.discovery = new NodeDiscovery({
      nodeId: this.nodeId,
      networkId: this.config.network.networkId,
      discoveryInterval: this.config.mesh.discoveryInterval
    });
    
    // Setup event handlers
    this.setupEventHandlers();
    
    console.log('[DecentG] Components initialized successfully');
  }
  
  /**
   * Setup event handlers between components
   */
  setupEventHandlers() {
    // Mesh Controller events
    this.meshController.on('peer:connected', (peer) => {
      console.log(`[DecentG] Peer connected: ${peer.id}`);
      this.peers.set(peer.id, peer);
      this.emit('peer:connected', peer);
    });
    
    this.meshController.on('peer:disconnected', (peerId) => {
      console.log(`[DecentG] Peer disconnected: ${peerId}`);
      this.peers.delete(peerId);
      this.router.removePeerRoute(peerId);
      this.emit('peer:disconnected', peerId);
    });
    
    this.meshController.on('message:received', (data) => {
      this.handleMessage(data);
    });
    
    // Discovery events
    this.discovery.on('peer:discovered', (peerInfo) => {
      console.log(`[DecentG] Peer discovered: ${peerInfo.address}:${peerInfo.port}`);
      this.peeringManager.connectToPeer(peerInfo);
    });
    
    // 5G Core events
    this.fiveGCore.on('registration:success', (ueInfo) => {
      console.log(`[DecentG] UE registered: ${ueInfo.supi}`);
      this.emit('ue:registered', ueInfo);
    });
    
    // Router events
    this.router.on('route:updated', (routingTable) => {
      this.routingTable = routingTable;
      this.emit('routing:updated', routingTable);
    });
  }
  
  /**
   * Handle incoming messages
   */
  handleMessage(data) {
    const { type, payload, from } = data;
    
    switch (type) {
      case 'route:update':
        this.router.updateRoute(from, payload);
        break;
      case 'peer:status':
        this.peeringManager.updatePeerStatus(from, payload);
        break;
      case 'data:forward':
        this.router.forwardPacket(payload);
        break;
      default:
        console.log(`[DecentG] Unknown message type: ${type}`);
    }
  }
  
  /**
   * Start the mesh network
   */
  async start() {
    if (this.isRunning) {
      console.warn('[DecentG] Node is already running');
      return;
    }
    
    try {
      console.log('[DecentG] Starting hybrid mesh network...');
      
      // Initialize components if not done
      if (!this.meshController) {
        await this.initialize();
      }
      
      // Start mesh controller
      await this.meshController.start();
      
      // Start 5G core interface
      await this.fiveGCore.connect();
      
      // Start peering manager
      await this.peeringManager.start();
      
      // Start node discovery
      await this.discovery.start();
      
      // Start router
      await this.router.start();
      
      // Start API server
      await this.startApiServer();
      
      this.isRunning = true;
      
      console.log('[DecentG] Hybrid mesh network started successfully');
      console.log(`[DecentG] Mesh Port: ${this.config.network.meshPort}`);
      console.log(`[DecentG] API Port: ${this.config.network.apiPort}`);
      console.log(`[DecentG] Node ID: ${this.nodeId}`);
      console.log(`[DecentG] Network ID: ${this.config.network.networkId}`);
      
      this.emit('started');
    } catch (error) {
      console.error('[DecentG] Failed to start:', error);
      throw error;
    }
  }
  
  /**
   * Start API server
   */
  async startApiServer() {
    this.apiServer = express();
    this.apiServer.use(bodyParser.json());
    
    // Status endpoint
    this.apiServer.get('/api/status', (req, res) => {
      res.json({
        nodeId: this.nodeId,
        networkId: this.config.network.networkId,
        isRunning: this.isRunning,
        peersConnected: this.peers.size,
        uptime: process.uptime(),
        fiveGCoreStatus: this.fiveGCore.getStatus()
      });
    });
    
    // Peers endpoint
    this.apiServer.get('/api/peers', (req, res) => {
      const peersList = Array.from(this.peers.values()).map(peer => ({
        id: peer.id,
        address: peer.address,
        port: peer.port,
        latency: peer.latency,
        connected: peer.connected
      }));
      res.json({ peers: peersList });
    });
    
    // Connect to peer endpoint
    this.apiServer.post('/api/peer/connect', async (req, res) => {
      const { address, port } = req.body;
      try {
        await this.peeringManager.connectToPeer({ address, port });
        res.json({ success: true, message: 'Connection initiated' });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
    
    // Routing table endpoint
    this.apiServer.get('/api/routes', (req, res) => {
      const routes = this.router.getRoutingTable();
      res.json({ routes });
    });
    
    // 5G status endpoint
    this.apiServer.get('/api/5g/status', (req, res) => {
      const status = this.fiveGCore.getDetailedStatus();
      res.json(status);
    });
    
    // Mesh topology endpoint
    this.apiServer.get('/api/topology', (req, res) => {
      const topology = this.meshController.getTopology();
      res.json(topology);
    });
    
    return new Promise((resolve, reject) => {
      this.apiServer.listen(this.config.network.apiPort, this.config.network.host, (err) => {
        if (err) reject(err);
        else {
          console.log(`[DecentG] API server listening on port ${this.config.network.apiPort}`);
          resolve();
        }
      });
    });
  }
  
  /**
   * Stop the mesh network
   */
  async stop() {
    if (!this.isRunning) {
      console.warn('[DecentG] Node is not running');
      return;
    }
    
    console.log('[DecentG] Stopping hybrid mesh network...');
    
    // Stop all components
    if (this.discovery) await this.discovery.stop();
    if (this.router) await this.router.stop();
    if (this.peeringManager) await this.peeringManager.stop();
    if (this.fiveGCore) await this.fiveGCore.disconnect();
    if (this.meshController) await this.meshController.stop();
    
    this.isRunning = false;
    this.emit('stopped');
    
    console.log('[DecentG] Hybrid mesh network stopped');
  }
  
  /**
   * Get current node status
   */
  getStatus() {
    return {
      nodeId: this.nodeId,
      networkId: this.config.network.networkId,
      isRunning: this.isRunning,
      peers: this.peers.size,
      routes: this.routingTable.size,
      fiveGCore: this.fiveGCore ? this.fiveGCore.getStatus() : null
    };
  }
}

// Export the main class
module.exports = DecentG;

// If run directly, start a node
if (require.main === module) {
  const node = new DecentG();
  
  node.start().catch(error => {
    console.error('[DecentG] Fatal error:', error);
    process.exit(1);
  });
  
  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n[DecentG] Received SIGINT, shutting down gracefully...');
    await node.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    console.log('\n[DecentG] Received SIGTERM, shutting down gracefully...');
    await node.stop();
    process.exit(0);
  });
}
