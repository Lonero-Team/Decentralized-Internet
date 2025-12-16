/**
 * Mesh Controller
 * Manages the mesh topology, node registration, and P2P connections
 */

const EventEmitter = require('eventemitter2').EventEmitter2;
const net = require('net');
const dgram = require('dgram');
const { v4: uuidv4 } = require('uuidv4');

class MeshController extends EventEmitter {
  constructor(options) {
    super();
    
    this.nodeId = options.nodeId;
    this.port = options.port || 8000;
    this.maxPeers = options.maxPeers || 50;
    this.networkId = options.networkId;
    
    this.peers = new Map();
    this.tcpServer = null;
    this.udpSocket = null;
    this.isRunning = false;
    
    console.log(`[MeshController] Initialized for node ${this.nodeId}`);
  }
  
  /**
   * Start the mesh controller
   */
  async start() {
    console.log(`[MeshController] Starting on port ${this.port}...`);
    
    // Start TCP server for persistent connections
    await this.startTcpServer();
    
    // Start UDP socket for discovery and broadcast
    await this.startUdpSocket();
    
    this.isRunning = true;
    
    console.log(`[MeshController] Started successfully`);
  }
  
  /**
   * Start TCP server
   */
  async startTcpServer() {
    return new Promise((resolve, reject) => {
      this.tcpServer = net.createServer((socket) => {
        this.handleNewConnection(socket);
      });
      
      this.tcpServer.on('error', (error) => {
        console.error(`[MeshController] TCP server error:`, error);
        reject(error);
      });
      
      this.tcpServer.listen(this.port, () => {
        console.log(`[MeshController] TCP server listening on port ${this.port}`);
        resolve();
      });
    });
  }
  
  /**
   * Start UDP socket
   */
  async startUdpSocket() {
    return new Promise((resolve, reject) => {
      this.udpSocket = dgram.createSocket('udp4');
      
      this.udpSocket.on('message', (msg, rinfo) => {
        this.handleUdpMessage(msg, rinfo);
      });
      
      this.udpSocket.on('error', (error) => {
        console.error(`[MeshController] UDP socket error:`, error);
        reject(error);
      });
      
      this.udpSocket.bind(this.port + 1, () => {
        console.log(`[MeshController] UDP socket listening on port ${this.port + 1}`);
        resolve();
      });
    });
  }
  
  /**
   * Handle new TCP connection
   */
  handleNewConnection(socket) {
    const connectionId = uuidv4();
    
    console.log(`[MeshController] New connection: ${socket.remoteAddress}:${socket.remotePort}`);
    
    let peer = {
      id: connectionId,
      socket: socket,
      address: socket.remoteAddress,
      port: socket.remotePort,
      connected: true,
      connectedAt: Date.now(),
      lastHeartbeat: Date.now()
    };
    
    socket.on('data', (data) => {
      this.handlePeerData(peer, data);
    });
    
    socket.on('error', (error) => {
      console.error(`[MeshController] Peer ${peer.id} error:`, error.message);
    });
    
    socket.on('close', () => {
      console.log(`[MeshController] Peer ${peer.id} disconnected`);
      this.removePeer(peer.id);
    });
    
    // Send handshake
    this.sendHandshake(socket);
  }
  
  /**
   * Send handshake message
   */
  sendHandshake(socket) {
    const handshake = {
      type: 'handshake',
      nodeId: this.nodeId,
      networkId: this.networkId,
      timestamp: Date.now()
    };
    
    socket.write(JSON.stringify(handshake) + '\n');
  }
  
  /**
   * Handle data from peer
   */
  handlePeerData(peer, data) {
    try {
      const messages = data.toString().split('\n').filter(m => m.trim());
      
      messages.forEach(msgStr => {
        const message = JSON.parse(msgStr);
        
        switch (message.type) {
          case 'handshake':
            this.handleHandshake(peer, message);
            break;
          case 'heartbeat':
            peer.lastHeartbeat = Date.now();
            break;
          case 'route:update':
          case 'peer:status':
          case 'data:forward':
            this.emit('message:received', {
              type: message.type,
              payload: message.payload,
              from: peer.id
            });
            break;
          default:
            console.log(`[MeshController] Unknown message type: ${message.type}`);
        }
      });
    } catch (error) {
      console.error(`[MeshController] Error parsing peer data:`, error.message);
    }
  }
  
  /**
   * Handle handshake from peer
   */
  handleHandshake(peer, message) {
    if (message.networkId !== this.networkId) {
      console.warn(`[MeshController] Peer ${message.nodeId} has wrong network ID`);
      peer.socket.end();
      return;
    }
    
    peer.id = message.nodeId;
    peer.networkId = message.networkId;
    
    if (this.peers.size >= this.maxPeers) {
      console.warn(`[MeshController] Max peers reached, rejecting ${peer.id}`);
      peer.socket.end();
      return;
    }
    
    this.peers.set(peer.id, peer);
    console.log(`[MeshController] Peer ${peer.id} added to mesh`);
    
    this.emit('peer:connected', peer);
  }
  
  /**
   * Handle UDP messages
   */
  handleUdpMessage(msg, rinfo) {
    try {
      const message = JSON.parse(msg.toString());
      
      if (message.type === 'discovery' && message.networkId === this.networkId) {
        // Respond to discovery request
        const response = {
          type: 'discovery:response',
          nodeId: this.nodeId,
          networkId: this.networkId,
          port: this.port
        };
        
        this.udpSocket.send(
          JSON.stringify(response),
          rinfo.port,
          rinfo.address
        );
      }
    } catch (error) {
      // Ignore malformed UDP messages
    }
  }
  
  /**
   * Connect to a remote peer
   */
  connectToPeer(address, port) {
    return new Promise((resolve, reject) => {
      if (this.peers.size >= this.maxPeers) {
        reject(new Error('Max peers reached'));
        return;
      }
      
      const socket = net.connect(port, address, () => {
        console.log(`[MeshController] Connected to ${address}:${port}`);
        this.handleNewConnection(socket);
        resolve();
      });
      
      socket.on('error', (error) => {
        console.error(`[MeshController] Connection error to ${address}:${port}:`, error.message);
        reject(error);
      });
    });
  }
  
  /**
   * Remove peer
   */
  removePeer(peerId) {
    const peer = this.peers.get(peerId);
    if (peer) {
      if (peer.socket) {
        peer.socket.destroy();
      }
      this.peers.delete(peerId);
      this.emit('peer:disconnected', peerId);
    }
  }
  
  /**
   * Broadcast message to all peers
   */
  broadcast(message) {
    const msgStr = JSON.stringify(message) + '\n';
    
    this.peers.forEach(peer => {
      if (peer.connected && peer.socket) {
        try {
          peer.socket.write(msgStr);
        } catch (error) {
          console.error(`[MeshController] Error broadcasting to peer ${peer.id}:`, error.message);
        }
      }
    });
  }
  
  /**
   * Send message to specific peer
   */
  sendToPeer(peerId, message) {
    const peer = this.peers.get(peerId);
    if (peer && peer.connected && peer.socket) {
      try {
        peer.socket.write(JSON.stringify(message) + '\n');
        return true;
      } catch (error) {
        console.error(`[MeshController] Error sending to peer ${peerId}:`, error.message);
        return false;
      }
    }
    return false;
  }
  
  /**
   * Get mesh topology
   */
  getTopology() {
    const nodes = [];
    const edges = [];
    
    // Add this node
    nodes.push({
      id: this.nodeId,
      type: 'self'
    });
    
    // Add peers
    this.peers.forEach(peer => {
      nodes.push({
        id: peer.id,
        type: 'peer',
        address: peer.address,
        port: peer.port
      });
      
      edges.push({
        from: this.nodeId,
        to: peer.id,
        latency: peer.latency || 0
      });
    });
    
    return { nodes, edges };
  }
  
  /**
   * Stop the mesh controller
   */
  async stop() {
    console.log(`[MeshController] Stopping...`);
    
    // Close all peer connections
    this.peers.forEach(peer => {
      if (peer.socket) {
        peer.socket.end();
      }
    });
    this.peers.clear();
    
    // Close TCP server
    if (this.tcpServer) {
      await new Promise(resolve => {
        this.tcpServer.close(() => {
          console.log(`[MeshController] TCP server closed`);
          resolve();
        });
      });
    }
    
    // Close UDP socket
    if (this.udpSocket) {
      await new Promise(resolve => {
        this.udpSocket.close(() => {
          console.log(`[MeshController] UDP socket closed`);
          resolve();
        });
      });
    }
    
    this.isRunning = false;
    console.log(`[MeshController] Stopped`);
  }
}

module.exports = MeshController;
