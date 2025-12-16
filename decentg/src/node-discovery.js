/**
 * Node Discovery
 * Handles discovery of other nodes in the mesh network
 */

const EventEmitter = require('eventemitter2').EventEmitter2;
const dgram = require('dgram');

class NodeDiscovery extends EventEmitter {
  constructor(options) {
    super();
    
    this.nodeId = options.nodeId;
    this.networkId = options.networkId;
    this.discoveryInterval = options.discoveryInterval || 10000;
    
    this.multicastAddress = '239.255.255.250';
    this.multicastPort = 9999;
    
    this.socket = null;
    this.discoveryTimer = null;
    this.discoveredNodes = new Map();
    
    console.log(`[Discovery] Initialized for network ${this.networkId}`);
  }
  
  /**
   * Start node discovery
   */
  async start() {
    console.log(`[Discovery] Starting...`);
    
    // Create UDP socket for multicast
    this.socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });
    
    return new Promise((resolve, reject) => {
      this.socket.on('error', (error) => {
        console.error(`[Discovery] Socket error:`, error);
        reject(error);
      });
      
      this.socket.on('message', (msg, rinfo) => {
        this.handleDiscoveryMessage(msg, rinfo);
      });
      
      this.socket.bind(this.multicastPort, () => {
        try {
          this.socket.addMembership(this.multicastAddress);
          this.socket.setMulticastTTL(128);
          console.log(`[Discovery] Listening on multicast ${this.multicastAddress}:${this.multicastPort}`);
          
          // Start periodic discovery broadcasts
          this.startDiscoveryBroadcasts();
          
          resolve();
        } catch (error) {
          console.error(`[Discovery] Failed to setup multicast:`, error);
          reject(error);
        }
      });
    });
  }
  
  /**
   * Start periodic discovery broadcasts
   */
  startDiscoveryBroadcasts() {
    // Send initial discovery message
    this.sendDiscoveryMessage();
    
    // Schedule periodic broadcasts
    this.discoveryTimer = setInterval(() => {
      this.sendDiscoveryMessage();
    }, this.discoveryInterval);
    
    console.log(`[Discovery] Broadcasting every ${this.discoveryInterval}ms`);
  }
  
  /**
   * Send discovery message
   */
  sendDiscoveryMessage() {
    const message = {
      type: 'discovery',
      nodeId: this.nodeId,
      networkId: this.networkId,
      timestamp: Date.now()
    };
    
    const buffer = Buffer.from(JSON.stringify(message));
    
    this.socket.send(buffer, 0, buffer.length, this.multicastPort, this.multicastAddress, (error) => {
      if (error) {
        console.error(`[Discovery] Failed to send discovery message:`, error.message);
      }
    });
  }
  
  /**
   * Handle incoming discovery messages
   */
  handleDiscoveryMessage(msg, rinfo) {
    try {
      const message = JSON.parse(msg.toString());
      
      // Ignore our own messages
      if (message.nodeId === this.nodeId) {
        return;
      }
      
      // Ignore messages from different networks
      if (message.networkId !== this.networkId) {
        return;
      }
      
      if (message.type === 'discovery') {
        this.handleDiscovery(message, rinfo);
      } else if (message.type === 'discovery:response') {
        this.handleDiscoveryResponse(message, rinfo);
      }
    } catch (error) {
      // Ignore malformed messages
    }
  }
  
  /**
   * Handle discovery message
   */
  handleDiscovery(message, rinfo) {
    const nodeKey = `${message.nodeId}`;
    
    // Update or add discovered node
    const nodeInfo = {
      nodeId: message.nodeId,
      address: rinfo.address,
      port: message.port || 8000,
      lastSeen: Date.now(),
      timestamp: message.timestamp
    };
    
    const isNew = !this.discoveredNodes.has(nodeKey);
    this.discoveredNodes.set(nodeKey, nodeInfo);
    
    if (isNew) {
      console.log(`[Discovery] Discovered new node: ${message.nodeId} at ${rinfo.address}`);
      this.emit('peer:discovered', nodeInfo);
    } else {
      this.emit('peer:updated', nodeInfo);
    }
    
    // Send response
    this.sendDiscoveryResponse(rinfo);
  }
  
  /**
   * Send discovery response
   */
  sendDiscoveryResponse(rinfo) {
    const response = {
      type: 'discovery:response',
      nodeId: this.nodeId,
      networkId: this.networkId,
      timestamp: Date.now()
    };
    
    const buffer = Buffer.from(JSON.stringify(response));
    
    this.socket.send(buffer, 0, buffer.length, rinfo.port, rinfo.address, (error) => {
      if (error) {
        console.error(`[Discovery] Failed to send response:`, error.message);
      }
    });
  }
  
  /**
   * Handle discovery response
   */
  handleDiscoveryResponse(message, rinfo) {
    const nodeKey = `${message.nodeId}`;
    
    const nodeInfo = {
      nodeId: message.nodeId,
      address: rinfo.address,
      port: message.port || 8000,
      lastSeen: Date.now(),
      timestamp: message.timestamp
    };
    
    const isNew = !this.discoveredNodes.has(nodeKey);
    this.discoveredNodes.set(nodeKey, nodeInfo);
    
    if (isNew) {
      console.log(`[Discovery] Node responded: ${message.nodeId} at ${rinfo.address}`);
      this.emit('peer:discovered', nodeInfo);
    }
  }
  
  /**
   * Get discovered nodes
   */
  getDiscoveredNodes() {
    return Array.from(this.discoveredNodes.values());
  }
  
  /**
   * Clean up stale nodes
   */
  cleanupStaleNodes() {
    const now = Date.now();
    const timeout = 60000; // 60 seconds
    
    this.discoveredNodes.forEach((node, key) => {
      if (now - node.lastSeen > timeout) {
        console.log(`[Discovery] Removing stale node: ${node.nodeId}`);
        this.discoveredNodes.delete(key);
        this.emit('peer:lost', node);
      }
    });
  }
  
  /**
   * Stop node discovery
   */
  async stop() {
    console.log(`[Discovery] Stopping...`);
    
    // Stop discovery broadcasts
    if (this.discoveryTimer) {
      clearInterval(this.discoveryTimer);
      this.discoveryTimer = null;
    }
    
    // Close socket
    if (this.socket) {
      await new Promise(resolve => {
        try {
          this.socket.dropMembership(this.multicastAddress);
        } catch (error) {
          // Ignore error
        }
        
        this.socket.close(() => {
          console.log(`[Discovery] Socket closed`);
          resolve();
        });
      });
      
      this.socket = null;
    }
    
    this.discoveredNodes.clear();
    
    console.log(`[Discovery] Stopped`);
  }
}

module.exports = NodeDiscovery;
