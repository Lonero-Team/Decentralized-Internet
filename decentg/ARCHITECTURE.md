# DecentG Architecture

## Overview

DecentG is a hybrid mesh network that combines peer-to-peer (P2P) mesh networking with 5G core network capabilities (Open5gs/Free5gc) to create a private, distributed network infrastructure for open peering.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     DecentG Node                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │   Mesh       │  │   Peering    │  │   5G Core       │  │
│  │   Controller │◄─┤   Manager    │  │   Interface     │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
│         │                  │                   │            │
│         ▼                  ▼                   ▼            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Event Bus (EventEmitter2)               │  │
│  └──────────────────────────────────────────────────────┘  │
│         │                  │                   │            │
│         ▼                  ▼                   ▼            │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │   Node       │  │   Router     │  │   API Server    │  │
│  │   Discovery  │  │   Module     │  │   (Express)     │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
         │                        │                    │
         ▼                        ▼                    ▼
    UDP/Multicast            TCP/P2P              Open5gs/Free5gc
    (Discovery)              (Mesh)               (5G Core)
```

## Core Components

### 1. Mesh Controller (`mesh-controller.js`)

**Responsibilities:**
- Manages TCP connections between peers
- Handles UDP-based discovery responses
- Maintains peer registry
- Broadcasts messages to all peers
- Validates handshakes and network IDs

**Key Features:**
- TCP server for persistent peer connections
- UDP socket for discovery messages
- Connection lifecycle management
- Peer validation and authentication
- Message broadcasting

**Protocols:**
- TCP on port 8000 (configurable)
- UDP on port 8001 (mesh port + 1)

### 2. 5G Core Interface (`5g-core-interface.js`)

**Responsibilities:**
- Interfaces with Open5gs AMF, SMF, UPF
- Interfaces with Free5gc AMF, NRF
- UE (User Equipment) registration/deregistration
- PDU session management
- Network Function status monitoring

**Key Features:**
- Dual support for Open5gs and Free5gc
- UE registration tracking
- Session lifecycle management
- SBI (Service Based Interface) communication
- Network Function discovery

**5G Network Functions:**
- AMF: Access and Mobility Management
- SMF: Session Management Function
- UPF: User Plane Function
- NRF: Network Repository Function

### 3. Peering Manager (`peering-manager.js`)

**Responsibilities:**
- Manages open peering relationships
- Creates and enforces peering agreements
- Heartbeat monitoring
- Peer blacklisting
- Stale peer cleanup

**Key Features:**
- Peering agreement contracts
- Bandwidth and data limit enforcement
- Priority-based routing
- Automatic failover
- Peer statistics tracking

**Peering Agreement Structure:**
```javascript
{
  peerId: 'peer-uuid',
  terms: {
    bandwidthLimit: null,
    dataLimit: null,
    priority: 'normal',
    routeSharing: true
  },
  status: 'active',
  createdAt: timestamp
}
```

### 4. Router Module (`router-module.js`)

**Responsibilities:**
- Computes optimal routes through mesh
- Maintains routing tables
- Implements routing algorithms
- Forwards packets between nodes

**Routing Algorithms:**

#### Dijkstra's Algorithm (Default)
- Shortest path first algorithm
- Best for static or semi-static topologies
- Low computational overhead
- Optimal path selection

#### Bellman-Ford Algorithm
- Distributed distance-vector
- Handles negative edge weights
- More robust but slower
- Better for dynamic topologies

#### Distance Vector
- Simple hop-based routing
- Minimal overhead
- Best for small networks

**Routing Table Entry:**
```javascript
{
  destination: 'node-uuid',
  nextHop: 'next-node-uuid',
  cost: 5,
  hops: 3
}
```

### 5. Node Discovery (`node-discovery.js`)

**Responsibilities:**
- Discovers nodes on local network
- Multicast-based peer discovery
- Periodic discovery broadcasts
- Stale node cleanup

**Key Features:**
- UDP multicast on 239.255.255.250:9999
- Automatic peer detection
- Network ID validation
- Response-based discovery confirmation

**Discovery Protocol:**
```javascript
// Discovery broadcast
{
  type: 'discovery',
  nodeId: 'uuid',
  networkId: 'network-id',
  timestamp: 1234567890
}

// Discovery response
{
  type: 'discovery:response',
  nodeId: 'uuid',
  networkId: 'network-id',
  port: 8000
}
```

## Data Flow

### Peer Connection Flow

```
Node A                     Node B
  │                          │
  ├──► TCP Connect ─────────►│
  │                          │
  │◄──── Handshake ──────────┤
  │                          │
  ├──► Handshake ───────────►│
  │                          │
  │◄──── Connected ──────────┤
  │                          │
  ├──► Heartbeat ───────────►│
  │                          │
  │◄──── Heartbeat ──────────┤
```

### Routing Update Flow

```
Node A                 Router               Node B
  │                      │                    │
  ├─► Route Update ─────►│                    │
  │                      │                    │
  │                      ├─ Compute Routes ─►│
  │                      │                    │
  │◄──── Updated Table ──┤                    │
  │                      │                    │
  │                      ├─ Broadcast Update ►│
```

### UE Registration Flow

```
Node         5G Core Interface       Open5gs/Free5gc
  │                 │                      │
  ├─► Register UE ──►│                     │
  │                  │                     │
  │                  ├──► AMF Request ────►│
  │                  │                     │
  │                  │◄─── AMF Response ───┤
  │                  │                     │
  │◄─── UE Info ─────┤                     │
  │                  │                     │
  ├─► Create PDU ───►│                     │
  │                  │                     │
  │                  ├──► SMF Request ────►│
  │                  │                     │
  │                  │◄─── Session Info ───┤
```

## Network Topology

### Mesh Network

```
        Node A ◄────────► Node B
          │                 │
          │                 │
          ▼                 ▼
        Node C ◄────────► Node D
                            │
                            │
                            ▼
                          Node E
```

### Hybrid Architecture

```
┌──────────────────────────────────────────┐
│         P2P Mesh Network Layer           │
│  (Nodes connected via TCP/UDP)           │
└──────────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────┐
│         5G Core Network Layer            │
│  (Open5gs/Free5gc)                       │
│                                          │
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐    │
│  │ AMF │  │ SMF │  │ UPF │  │ NRF │    │
│  └─────┘  └─────┘  └─────┘  └─────┘    │
└──────────────────────────────────────────┘
```

## Scalability

### Horizontal Scaling

- Add more nodes to expand mesh coverage
- Automatic peer discovery and connection
- Dynamic routing table updates
- Load distribution across peers

### Vertical Scaling

- Increase max peers per node
- Optimize routing algorithm
- Tune heartbeat intervals
- Adjust discovery frequency

## Security Considerations

### Network Security

- Network ID validation
- Peer authentication via handshake
- Optional TLS for TCP connections
- Blacklist for malicious peers

### 5G Security

- SUPI encryption
- AKA (Authentication and Key Agreement)
- SEAF (Security Anchor Function)
- Integrity protection

## Performance Characteristics

### Latency

- Direct peer connection: ~1-5ms
- 2-hop routing: ~5-15ms
- 3-hop routing: ~15-30ms

### Throughput

- TCP mesh: Limited by network bandwidth
- UDP discovery: Minimal overhead
- Routing updates: ~1KB per update

### Resource Usage

- Memory: ~50-100MB per node
- CPU: <5% idle, <20% under load
- Network: ~1-10Mbps depending on traffic

## Extension Points

### Custom Routing Algorithms

```javascript
class CustomRouter extends RouterModule {
  computeCustomAlgorithm() {
    // Implement custom routing logic
  }
}
```

### Custom Peering Policies

```javascript
class CustomPeeringManager extends PeeringManager {
  validatePeeringTerms(terms) {
    // Implement custom validation
  }
}
```

### 5G Extensions

```javascript
class Custom5GInterface extends FiveGCoreInterface {
  handleCustomNF(nfType) {
    // Handle custom network functions
  }
}
```
