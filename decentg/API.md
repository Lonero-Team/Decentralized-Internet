# DecentG API Documentation

## REST API Endpoints

The DecentG mesh network exposes a REST API for monitoring and management.

### Base URL
```
http://localhost:3000/api
```

---

## Endpoints

### 1. Get Node Status

Get the current status of the mesh node.

**Endpoint:** `GET /api/status`

**Response:**
```json
{
  "nodeId": "uuid-here",
  "networkId": "decentg-mesh-001",
  "isRunning": true,
  "peersConnected": 5,
  "uptime": 12345.67,
  "fiveGCoreStatus": {
    "connected": true,
    "amf": "connected",
    "smf": "connected",
    "upf": "connected",
    "registeredUEs": 2,
    "activeSessions": 3
  }
}
```

---

### 2. List Peers

Get a list of all connected peers.

**Endpoint:** `GET /api/peers`

**Response:**
```json
{
  "peers": [
    {
      "id": "peer-uuid-1",
      "address": "192.168.1.10",
      "port": 8000,
      "latency": 12,
      "connected": true
    },
    {
      "id": "peer-uuid-2",
      "address": "192.168.1.11",
      "port": 8000,
      "latency": 8,
      "connected": true
    }
  ]
}
```

---

### 3. Connect to Peer

Initiate a connection to a remote peer.

**Endpoint:** `POST /api/peer/connect`

**Request Body:**
```json
{
  "address": "192.168.1.20",
  "port": 8000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Connection initiated"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Max peers reached"
}
```

---

### 4. Get Routing Table

Retrieve the current routing table.

**Endpoint:** `GET /api/routes`

**Response:**
```json
{
  "routes": [
    {
      "destination": "peer-uuid-1",
      "nextHop": "peer-uuid-1",
      "cost": 1,
      "hops": 1
    },
    {
      "destination": "peer-uuid-3",
      "nextHop": "peer-uuid-2",
      "cost": 2,
      "hops": 2
    }
  ]
}
```

---

### 5. Get 5G Core Status

Get detailed status of the 5G core network functions.

**Endpoint:** `GET /api/5g/status`

**Response:**
```json
{
  "connected": true,
  "open5gs": {
    "enabled": true,
    "amf": {
      "status": "connected",
      "host": "127.0.0.1",
      "port": 38412
    },
    "smf": {
      "status": "connected",
      "host": "127.0.0.1",
      "port": 7777
    },
    "upf": {
      "status": "connected",
      "host": "127.0.0.1",
      "port": 2152
    }
  },
  "free5gc": {
    "enabled": false
  },
  "registeredUEs": [
    {
      "supi": "imsi-001010000000001",
      "timestamp": 1639683456789,
      "status": "registered",
      "amf": "open5gs"
    }
  ],
  "activeSessions": [
    {
      "sessionId": "session-1639683456789",
      "supi": "imsi-001010000000001",
      "dnn": "internet",
      "sst": 1,
      "sd": "0x000000",
      "upfAddress": "127.0.0.1",
      "timestamp": 1639683456789,
      "status": "active"
    }
  ]
}
```

---

### 6. Get Mesh Topology

Get the current mesh network topology.

**Endpoint:** `GET /api/topology`

**Response:**
```json
{
  "nodes": [
    {
      "id": "node-uuid-self",
      "type": "self"
    },
    {
      "id": "peer-uuid-1",
      "type": "peer",
      "address": "192.168.1.10",
      "port": 8000
    }
  ],
  "edges": [
    {
      "from": "node-uuid-self",
      "to": "peer-uuid-1",
      "latency": 12
    }
  ]
}
```

---

## Events

The DecentG node emits various events that can be listened to:

### Node Events

```javascript
node.on('started', () => {
  console.log('Node started');
});

node.on('stopped', () => {
  console.log('Node stopped');
});
```

### Peer Events

```javascript
node.on('peer:connected', (peer) => {
  console.log('Peer connected:', peer.id);
});

node.on('peer:disconnected', (peerId) => {
  console.log('Peer disconnected:', peerId);
});
```

### 5G Core Events

```javascript
node.on('ue:registered', (ueInfo) => {
  console.log('UE registered:', ueInfo.supi);
});

node.fiveGCore.on('session:created', (session) => {
  console.log('PDU session created:', session.sessionId);
});

node.fiveGCore.on('session:released', (session) => {
  console.log('PDU session released:', session.sessionId);
});
```

### Routing Events

```javascript
node.on('routing:updated', (routingTable) => {
  console.log('Routing table updated');
});
```

---

## Error Handling

All API endpoints return appropriate HTTP status codes:

- `200 OK` - Request successful
- `400 Bad Request` - Invalid request parameters
- `500 Internal Server Error` - Server error

Error responses include a JSON body with error details:

```json
{
  "success": false,
  "error": "Error message here"
}
```
