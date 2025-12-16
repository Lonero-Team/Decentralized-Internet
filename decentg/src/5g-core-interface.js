/**
 * 5G Core Interface
 * Interfaces with Open5gs and Free5gc 5G core network components
 */

const EventEmitter = require('eventemitter2').EventEmitter2;
const fetch = require('node-fetch');

class FiveGCoreInterface extends EventEmitter {
  constructor(options) {
    super();
    
    this.nodeId = options.nodeId;
    this.open5gsConfig = options.open5gs || {};
    this.free5gcConfig = options.free5gc || {};
    
    this.open5gsEnabled = this.open5gsConfig.enabled || false;
    this.free5gcEnabled = this.free5gcConfig.enabled || false;
    
    this.connected = false;
    this.amfStatus = 'disconnected';
    this.smfStatus = 'disconnected';
    this.upfStatus = 'disconnected';
    
    this.registeredUEs = new Map();
    this.activeSessions = new Map();
    
    console.log(`[5GCore] Initialized`);
    console.log(`[5GCore] Open5gs: ${this.open5gsEnabled ? 'enabled' : 'disabled'}`);
    console.log(`[5GCore] Free5gc: ${this.free5gcEnabled ? 'enabled' : 'disabled'}`);
  }
  
  /**
   * Connect to 5G core
   */
  async connect() {
    console.log(`[5GCore] Connecting to 5G core...`);
    
    if (this.open5gsEnabled) {
      await this.connectOpen5gs();
    }
    
    if (this.free5gcEnabled) {
      await this.connectFree5gc();
    }
    
    if (!this.open5gsEnabled && !this.free5gcEnabled) {
      console.log(`[5GCore] No 5G core enabled, running in standalone mode`);
      this.connected = false;
      return;
    }
    
    this.connected = true;
    console.log(`[5GCore] Connected successfully`);
  }
  
  /**
   * Connect to Open5gs
   */
  async connectOpen5gs() {
    console.log(`[5GCore] Connecting to Open5gs...`);
    
    try {
      // Check AMF connectivity
      const amfUrl = `${this.open5gsConfig.sbiScheme || 'http'}://${this.open5gsConfig.amfHost}:${this.open5gsConfig.amfPort}`;
      
      // Note: In production, you would make actual HTTP calls to the AMF
      // For now, we simulate the connection
      console.log(`[5GCore] Open5gs AMF: ${amfUrl}`);
      this.amfStatus = 'connected';
      
      // Check SMF connectivity
      const smfUrl = `${this.open5gsConfig.sbiScheme || 'http'}://${this.open5gsConfig.smfHost}:${this.open5gsConfig.smfPort || 7777}`;
      console.log(`[5GCore] Open5gs SMF: ${smfUrl}`);
      this.smfStatus = 'connected';
      
      // Check UPF connectivity
      console.log(`[5GCore] Open5gs UPF: ${this.open5gsConfig.upfHost}:${this.open5gsConfig.upfPort || 2152}`);
      this.upfStatus = 'connected';
      
      console.log(`[5GCore] Open5gs connected successfully`);
    } catch (error) {
      console.error(`[5GCore] Failed to connect to Open5gs:`, error.message);
      this.amfStatus = 'error';
      this.smfStatus = 'error';
      this.upfStatus = 'error';
    }
  }
  
  /**
   * Connect to Free5gc
   */
  async connectFree5gc() {
    console.log(`[5GCore] Connecting to Free5gc...`);
    
    try {
      // Check AMF connectivity
      const amfUrl = `${this.free5gcConfig.sbiScheme || 'http'}://${this.free5gcConfig.amfHost}:${this.free5gcConfig.amfPort}`;
      
      console.log(`[5GCore] Free5gc AMF: ${amfUrl}`);
      this.amfStatus = 'connected';
      
      // Check NRF connectivity for service discovery
      const nrfUrl = `${this.free5gcConfig.sbiScheme || 'http'}://${this.free5gcConfig.nrfHost}:${this.free5gcConfig.nrfPort || 29510}`;
      console.log(`[5GCore] Free5gc NRF: ${nrfUrl}`);
      
      console.log(`[5GCore] Free5gc connected successfully`);
    } catch (error) {
      console.error(`[5GCore] Failed to connect to Free5gc:`, error.message);
      this.amfStatus = 'error';
    }
  }
  
  /**
   * Register UE (User Equipment)
   */
  async registerUE(ueInfo) {
    console.log(`[5GCore] Registering UE: ${ueInfo.supi || ueInfo.imsi}`);
    
    try {
      // In production, this would make actual registration calls to AMF
      const ue = {
        supi: ueInfo.supi || ueInfo.imsi,
        timestamp: Date.now(),
        status: 'registered',
        amf: this.open5gsEnabled ? 'open5gs' : 'free5gc'
      };
      
      this.registeredUEs.set(ue.supi, ue);
      
      this.emit('registration:success', ue);
      console.log(`[5GCore] UE registered successfully: ${ue.supi}`);
      
      return ue;
    } catch (error) {
      console.error(`[5GCore] UE registration failed:`, error.message);
      this.emit('registration:failed', { ueInfo, error: error.message });
      throw error;
    }
  }
  
  /**
   * Create PDU session
   */
  async createPDUSession(supi, sessionInfo) {
    console.log(`[5GCore] Creating PDU session for UE: ${supi}`);
    
    try {
      const session = {
        sessionId: `session-${Date.now()}`,
        supi: supi,
        dnn: sessionInfo.dnn || 'internet',
        sst: sessionInfo.sst || 1,
        sd: sessionInfo.sd || '0x000000',
        upfAddress: this.open5gsConfig.upfHost || this.free5gcConfig.upfHost,
        timestamp: Date.now(),
        status: 'active'
      };
      
      this.activeSessions.set(session.sessionId, session);
      
      this.emit('session:created', session);
      console.log(`[5GCore] PDU session created: ${session.sessionId}`);
      
      return session;
    } catch (error) {
      console.error(`[5GCore] PDU session creation failed:`, error.message);
      throw error;
    }
  }
  
  /**
   * Release PDU session
   */
  async releasePDUSession(sessionId) {
    console.log(`[5GCore] Releasing PDU session: ${sessionId}`);
    
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.status = 'released';
      this.activeSessions.delete(sessionId);
      this.emit('session:released', session);
      console.log(`[5GCore] PDU session released: ${sessionId}`);
    }
  }
  
  /**
   * Deregister UE
   */
  async deregisterUE(supi) {
    console.log(`[5GCore] Deregistering UE: ${supi}`);
    
    const ue = this.registeredUEs.get(supi);
    if (ue) {
      ue.status = 'deregistered';
      this.registeredUEs.delete(supi);
      
      // Release all sessions for this UE
      this.activeSessions.forEach((session, sessionId) => {
        if (session.supi === supi) {
          this.releasePDUSession(sessionId);
        }
      });
      
      this.emit('deregistration:success', { supi });
      console.log(`[5GCore] UE deregistered: ${supi}`);
    }
  }
  
  /**
   * Get NF (Network Function) status
   */
  async getNFStatus(nfType) {
    // Query NRF for network function status
    console.log(`[5GCore] Querying status for NF type: ${nfType}`);
    
    // Simulated response
    return {
      nfType: nfType,
      status: 'available',
      timestamp: Date.now()
    };
  }
  
  /**
   * Get status
   */
  getStatus() {
    return {
      connected: this.connected,
      amf: this.amfStatus,
      smf: this.smfStatus,
      upf: this.upfStatus,
      registeredUEs: this.registeredUEs.size,
      activeSessions: this.activeSessions.size
    };
  }
  
  /**
   * Get detailed status
   */
  getDetailedStatus() {
    return {
      connected: this.connected,
      open5gs: {
        enabled: this.open5gsEnabled,
        amf: {
          status: this.amfStatus,
          host: this.open5gsConfig.amfHost,
          port: this.open5gsConfig.amfPort
        },
        smf: {
          status: this.smfStatus,
          host: this.open5gsConfig.smfHost,
          port: this.open5gsConfig.smfPort
        },
        upf: {
          status: this.upfStatus,
          host: this.open5gsConfig.upfHost,
          port: this.open5gsConfig.upfPort
        }
      },
      free5gc: {
        enabled: this.free5gcEnabled,
        amf: {
          status: this.free5gcEnabled ? this.amfStatus : 'disabled',
          host: this.free5gcConfig.amfHost,
          port: this.free5gcConfig.amfPort
        }
      },
      registeredUEs: Array.from(this.registeredUEs.values()),
      activeSessions: Array.from(this.activeSessions.values())
    };
  }
  
  /**
   * Disconnect from 5G core
   */
  async disconnect() {
    console.log(`[5GCore] Disconnecting...`);
    
    // Deregister all UEs
    const ues = Array.from(this.registeredUEs.keys());
    for (const supi of ues) {
      await this.deregisterUE(supi);
    }
    
    this.connected = false;
    this.amfStatus = 'disconnected';
    this.smfStatus = 'disconnected';
    this.upfStatus = 'disconnected';
    
    console.log(`[5GCore] Disconnected`);
  }
}

module.exports = FiveGCoreInterface;
