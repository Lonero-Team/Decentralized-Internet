/**
 * Router Module
 * Implements intelligent routing algorithms for packet forwarding across the mesh
 */

const EventEmitter = require('eventemitter2').EventEmitter2;

class RouterModule extends EventEmitter {
  constructor(options) {
    super();
    
    this.nodeId = options.nodeId;
    this.algorithm = options.algorithm || 'dijkstra';
    
    this.routingTable = new Map();
    this.linkState = new Map();
    this.neighbors = new Map();
    
    this.updateInterval = null;
    
    console.log(`[Router] Initialized with algorithm: ${this.algorithm}`);
  }
  
  /**
   * Start the router
   */
  async start() {
    console.log(`[Router] Starting...`);
    
    // Start routing table updates
    this.startRoutingUpdates();
    
    console.log(`[Router] Started`);
  }
  
  /**
   * Start routing table updates
   */
  startRoutingUpdates() {
    this.updateInterval = setInterval(() => {
      this.updateRoutingTable();
    }, 15000); // Update every 15 seconds
  }
  
  /**
   * Update routing table
   */
  updateRoutingTable() {
    console.log(`[Router] Updating routing table...`);
    
    // Compute routes based on selected algorithm
    switch (this.algorithm) {
      case 'dijkstra':
        this.computeDijkstra();
        break;
      case 'bellman-ford':
        this.computeBellmanFord();
        break;
      case 'distance-vector':
        this.computeDistanceVector();
        break;
      default:
        this.computeDijkstra();
    }
    
    this.emit('route:updated', this.routingTable);
  }
  
  /**
   * Compute routes using Dijkstra's algorithm
   */
  computeDijkstra() {
    const distances = new Map();
    const previous = new Map();
    const unvisited = new Set();
    
    // Initialize
    distances.set(this.nodeId, 0);
    unvisited.add(this.nodeId);
    
    this.neighbors.forEach((cost, neighbor) => {
      distances.set(neighbor, cost);
      previous.set(neighbor, this.nodeId);
      unvisited.add(neighbor);
    });
    
    // Add nodes from link state
    this.linkState.forEach((neighbors, node) => {
      if (!distances.has(node)) {
        distances.set(node, Infinity);
      }
      unvisited.add(node);
    });
    
    // Main loop
    while (unvisited.size > 0) {
      // Find node with minimum distance
      let minNode = null;
      let minDist = Infinity;
      
      unvisited.forEach(node => {
        const dist = distances.get(node) || Infinity;
        if (dist < minDist) {
          minDist = dist;
          minNode = node;
        }
      });
      
      if (minNode === null || minDist === Infinity) {
        break;
      }
      
      unvisited.delete(minNode);
      
      // Update neighbors
      const nodeNeighbors = this.linkState.get(minNode) || new Map();
      nodeNeighbors.forEach((cost, neighbor) => {
        if (unvisited.has(neighbor)) {
          const alt = minDist + cost;
          if (alt < (distances.get(neighbor) || Infinity)) {
            distances.set(neighbor, alt);
            previous.set(neighbor, minNode);
          }
        }
      });
    }
    
    // Build routing table
    this.routingTable.clear();
    
    distances.forEach((distance, destination) => {
      if (destination !== this.nodeId && distance !== Infinity) {
        // Find next hop
        let nextHop = destination;
        let current = destination;
        
        while (previous.has(current) && previous.get(current) !== this.nodeId) {
          current = previous.get(current);
          nextHop = current;
        }
        
        this.routingTable.set(destination, {
          destination: destination,
          nextHop: nextHop,
          cost: distance,
          hops: this.countHops(destination, previous)
        });
      }
    });
    
    console.log(`[Router] Routing table updated (${this.routingTable.size} routes)`);
  }
  
  /**
   * Count hops to destination
   */
  countHops(destination, previous) {
    let hops = 0;
    let current = destination;
    
    while (previous.has(current) && current !== this.nodeId) {
      hops++;
      current = previous.get(current);
    }
    
    return hops;
  }
  
  /**
   * Compute routes using Bellman-Ford algorithm
   */
  computeBellmanFord() {
    const distances = new Map();
    const previous = new Map();
    
    // Initialize distances
    distances.set(this.nodeId, 0);
    
    const allNodes = new Set([this.nodeId]);
    this.neighbors.forEach((cost, neighbor) => allNodes.add(neighbor));
    this.linkState.forEach((neighbors, node) => allNodes.add(node));
    
    allNodes.forEach(node => {
      if (node !== this.nodeId) {
        distances.set(node, Infinity);
      }
    });
    
    // Relax edges
    const maxIterations = allNodes.size - 1;
    for (let i = 0; i < maxIterations; i++) {
      let updated = false;
      
      // Process direct neighbors
      this.neighbors.forEach((cost, neighbor) => {
        if (cost < distances.get(neighbor)) {
          distances.set(neighbor, cost);
          previous.set(neighbor, this.nodeId);
          updated = true;
        }
      });
      
      // Process link state information
      this.linkState.forEach((neighbors, node) => {
        const nodeDist = distances.get(node);
        if (nodeDist !== Infinity) {
          neighbors.forEach((cost, neighbor) => {
            const alt = nodeDist + cost;
            if (alt < distances.get(neighbor)) {
              distances.set(neighbor, alt);
              previous.set(neighbor, node);
              updated = true;
            }
          });
        }
      });
      
      if (!updated) break;
    }
    
    // Build routing table (similar to Dijkstra)
    this.routingTable.clear();
    
    distances.forEach((distance, destination) => {
      if (destination !== this.nodeId && distance !== Infinity) {
        let nextHop = destination;
        let current = destination;
        
        while (previous.has(current) && previous.get(current) !== this.nodeId) {
          current = previous.get(current);
          nextHop = current;
        }
        
        this.routingTable.set(destination, {
          destination: destination,
          nextHop: nextHop,
          cost: distance,
          hops: this.countHops(destination, previous)
        });
      }
    });
    
    console.log(`[Router] Routing table updated with Bellman-Ford (${this.routingTable.size} routes)`);
  }
  
  /**
   * Compute routes using Distance Vector algorithm
   */
  computeDistanceVector() {
    // Simple distance vector routing
    this.routingTable.clear();
    
    this.neighbors.forEach((cost, neighbor) => {
      this.routingTable.set(neighbor, {
        destination: neighbor,
        nextHop: neighbor,
        cost: cost,
        hops: 1
      });
    });
    
    console.log(`[Router] Routing table updated with Distance Vector (${this.routingTable.size} routes)`);
  }
  
  /**
   * Update neighbor cost
   */
  updateNeighbor(neighborId, cost) {
    this.neighbors.set(neighborId, cost);
    console.log(`[Router] Updated neighbor ${neighborId} with cost ${cost}`);
  }
  
  /**
   * Remove neighbor
   */
  removeNeighbor(neighborId) {
    this.neighbors.delete(neighborId);
    this.linkState.delete(neighborId);
    console.log(`[Router] Removed neighbor ${neighborId}`);
    this.updateRoutingTable();
  }
  
  /**
   * Update route from link state advertisement
   */
  updateRoute(fromNode, linkStateInfo) {
    this.linkState.set(fromNode, new Map(Object.entries(linkStateInfo)));
    this.updateRoutingTable();
  }
  
  /**
   * Remove peer route
   */
  removePeerRoute(peerId) {
    this.removeNeighbor(peerId);
    this.routingTable.delete(peerId);
  }
  
  /**
   * Get next hop for destination
   */
  getNextHop(destination) {
    const route = this.routingTable.get(destination);
    return route ? route.nextHop : null;
  }
  
  /**
   * Get routing table
   */
  getRoutingTable() {
    const routes = [];
    
    this.routingTable.forEach((route, destination) => {
      routes.push({
        destination: destination,
        nextHop: route.nextHop,
        cost: route.cost,
        hops: route.hops
      });
    });
    
    return routes;
  }
  
  /**
   * Forward packet
   */
  forwardPacket(packet) {
    const destination = packet.destination;
    const nextHop = this.getNextHop(destination);
    
    if (nextHop) {
      console.log(`[Router] Forwarding packet to ${destination} via ${nextHop}`);
      this.emit('packet:forward', {
        packet: packet,
        nextHop: nextHop
      });
      return true;
    } else {
      console.warn(`[Router] No route to destination: ${destination}`);
      this.emit('packet:dropped', packet);
      return false;
    }
  }
  
  /**
   * Stop the router
   */
  async stop() {
    console.log(`[Router] Stopping...`);
    
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    
    this.routingTable.clear();
    this.linkState.clear();
    this.neighbors.clear();
    
    console.log(`[Router] Stopped`);
  }
}

module.exports = RouterModule;
