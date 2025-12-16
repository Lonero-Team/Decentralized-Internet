/**
 * Peering Manager
 * Manages open peering relationships between mesh nodes
 */

const EventEmitter = require('eventemitter2').EventEmitter2;

class PeeringManager extends EventEmitter {
  constructor(options) {
    super();
    
    this.nodeId = options.nodeId;
    this.meshController = options.meshController;
    this.maxPeers = options.maxPeers || 50;
    
    this.peerInfo = new Map();
    this.peeringAgreements = new Map();
    this.blacklist = new Set();
    
    this.heartbeatInterval = null;
    this.cleanupInterval = null;
    
    console.log(`[PeeringManager] Initialized for node ${this.nodeId}`);
  }
  
  /**
   * Start the peering manager
   */
  async start() {
    console.log(`[PeeringManager] Starting...`);
    
    // Start heartbeat monitoring
    this.startHeartbeat();
    
    // Start cleanup routine
    this.startCleanup();
    
    console.log(`[PeeringManager] Started`);
  }
  
  /**
   * Start heartbeat monitoring
   */
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeats();
    }, 5000); // Send heartbeat every 5 seconds
  }
  
  /**
   * Send heartbeats to all peers
   */
  sendHeartbeats() {
    const heartbeat = {
      type: 'heartbeat',
      nodeId: this.nodeId,
      timestamp: Date.now(),
      peers: this.meshController.peers.size
    };
    
    this.meshController.broadcast(heartbeat);
  }
  
  /**
   * Start cleanup routine
   */
  startCleanup() {
    this.cleanupInterval = setInterval(() => {
      this.cleanupStalePeers();
    }, 30000); // Cleanup every 30 seconds
  }
  
  /**
   * Clean up stale peers
   */
  cleanupStalePeers() {
    const now = Date.now();
    const timeout = 60000; // 60 seconds timeout
    
    this.peerInfo.forEach((info, peerId) => {
      if (now - info.lastSeen > timeout) {
        console.log(`[PeeringManager] Removing stale peer: ${peerId}`);
        this.removePeer(peerId);
      }
    });
  }
  
  /**
   * Connect to a peer
   */
  async connectToPeer(peerAddress) {
    const { address, port } = peerAddress;
    
    console.log(`[PeeringManager] Connecting to peer: ${address}:${port}`);
    
    // Check blacklist
    const addressKey = `${address}:${port}`;
    if (this.blacklist.has(addressKey)) {
      console.warn(`[PeeringManager] Peer ${addressKey} is blacklisted`);
      throw new Error('Peer is blacklisted');
    }
    
    // Check if we're at max peers
    if (this.meshController.peers.size >= this.maxPeers) {
      console.warn(`[PeeringManager] Max peers reached`);
      throw new Error('Max peers reached');
    }
    
    try {
      await this.meshController.connectToPeer(address, port);
      console.log(`[PeeringManager] Connected to peer: ${address}:${port}`);
    } catch (error) {
      console.error(`[PeeringManager] Failed to connect to ${address}:${port}:`, error.message);
      throw error;
    }
  }
  
  /**
   * Create peering agreement
   */
  async createPeeringAgreement(peerId, terms) {
    console.log(`[PeeringManager] Creating peering agreement with ${peerId}`);
    
    const agreement = {
      peerId: peerId,
      nodeId: this.nodeId,
      terms: terms || {
        bandwidthLimit: null,
        dataLimit: null,
        priority: 'normal',
        routeSharing: true
      },
      status: 'active',
      createdAt: Date.now()
    };
    
    this.peeringAgreements.set(peerId, agreement);
    
    // Send agreement to peer
    const message = {
      type: 'peering:agreement',
      payload: agreement
    };
    
    this.meshController.sendToPeer(peerId, message);
    
    this.emit('agreement:created', agreement);
    console.log(`[PeeringManager] Peering agreement created with ${peerId}`);
    
    return agreement;
  }
  
  /**
   * Update peer status
   */
  updatePeerStatus(peerId, status) {
    const info = this.peerInfo.get(peerId) || {};
    
    info.peerId = peerId;
    info.lastSeen = Date.now();
    info.status = status;
    
    this.peerInfo.set(peerId, info);
  }
  
  /**
   * Get peer info
   */
  getPeerInfo(peerId) {
    return this.peerInfo.get(peerId);
  }
  
  /**
   * Get all peering agreements
   */
  getPeeringAgreements() {
    return Array.from(this.peeringAgreements.values());
  }
  
  /**
   * Revoke peering agreement
   */
  async revokePeeringAgreement(peerId) {
    console.log(`[PeeringManager] Revoking peering agreement with ${peerId}`);
    
    const agreement = this.peeringAgreements.get(peerId);
    if (agreement) {
      agreement.status = 'revoked';
      agreement.revokedAt = Date.now();
      
      // Notify peer
      const message = {
        type: 'peering:revoked',
        payload: { peerId: this.nodeId }
      };
      
      this.meshController.sendToPeer(peerId, message);
      
      this.peeringAgreements.delete(peerId);
      this.emit('agreement:revoked', agreement);
      
      console.log(`[PeeringManager] Peering agreement revoked with ${peerId}`);
    }
  }
  
  /**
   * Blacklist a peer
   */
  blacklistPeer(address, port) {
    const addressKey = `${address}:${port}`;
    this.blacklist.add(addressKey);
    console.log(`[PeeringManager] Blacklisted peer: ${addressKey}`);
    this.emit('peer:blacklisted', { address, port });
  }
  
  /**
   * Remove peer from blacklist
   */
  removeFromBlacklist(address, port) {
    const addressKey = `${address}:${port}`;
    this.blacklist.delete(addressKey);
    console.log(`[PeeringManager] Removed peer from blacklist: ${addressKey}`);
    this.emit('peer:unblacklisted', { address, port });
  }
  
  /**
   * Remove peer
   */
  removePeer(peerId) {
    this.peerInfo.delete(peerId);
    this.peeringAgreements.delete(peerId);
    console.log(`[PeeringManager] Removed peer: ${peerId}`);
  }
  
  /**
   * Get peer statistics
   */
  getPeerStatistics(peerId) {
    const info = this.peerInfo.get(peerId);
    const agreement = this.peeringAgreements.get(peerId);
    
    return {
      peerId: peerId,
      info: info,
      agreement: agreement,
      hasAgreement: !!agreement,
      agreementStatus: agreement ? agreement.status : 'none'
    };
  }
  
  /**
   * Get all peer statistics
   */
  getAllPeerStatistics() {
    const stats = [];
    
    this.meshController.peers.forEach((peer, peerId) => {
      stats.push(this.getPeerStatistics(peerId));
    });
    
    return stats;
  }
  
  /**
   * Stop the peering manager
   */
  async stop() {
    console.log(`[PeeringManager] Stopping...`);
    
    // Clear intervals
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    // Revoke all agreements
    const peerIds = Array.from(this.peeringAgreements.keys());
    for (const peerId of peerIds) {
      await this.revokePeeringAgreement(peerId);
    }
    
    console.log(`[PeeringManager] Stopped`);
  }
}

module.exports = PeeringManager;
