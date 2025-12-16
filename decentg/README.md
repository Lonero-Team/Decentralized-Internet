# DecentG - Hybrid Mesh Network for Open Peering

## Overview
DecentG is a hybrid mesh network implementation that combines the Decentralized-Internet SDK with Open5gs and Free5gc to create a private, distributed 5G network infrastructure for open peering.

## Features

- **Hybrid Mesh Architecture**: Combines P2P mesh networking with 5G core network capabilities
- **Open5gs Integration**: Interfaces with Open5gs 5G core network components
- **Free5gc Support**: Compatible with Free5gc implementation for enhanced redundancy
- **Decentralized Peering**: Utilizes the Decentralized-Internet SDK for distributed node discovery
- **Private Network**: Secure, private mesh network for controlled environments
- **Dynamic Routing**: Adaptive routing algorithms for optimal path selection
- **Fault Tolerance**: Self-healing mesh topology with automatic failover

## Architecture

```
┌─────────────────────────────────────────────────────┐
│          DecentG Hybrid Mesh Network                │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────┐         ┌─────────────┐          │
│  │  P2P Mesh   │◄───────►│  5G Core    │          │
│  │  Network    │         │  (Open5gs/  │          │
│  │  Layer      │         │  Free5gc)   │          │
│  └─────────────┘         └─────────────┘          │
│         │                       │                   │
│         ▼                       ▼                   │
│  ┌──────────────────────────────────┐              │
│  │    Decentralized-Internet SDK    │              │
│  │  - Node Discovery                │              │
│  │  - P2P Communication             │              │
│  │  - Distributed Routing           │              │
│  └──────────────────────────────────┘              │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Components

### 1. Mesh Network Controller
Manages the mesh topology, node registration, and peer discovery.

### 2. 5G Core Interface
Interfaces with Open5gs/Free5gc for:
- AMF (Access and Mobility Management Function)
- SMF (Session Management Function)
- UPF (User Plane Function)
- NRF (Network Repository Function)

### 3. Peering Manager
Handles open peering relationships between mesh nodes.

### 4. Router Module
Implements intelligent routing algorithms for packet forwarding across the mesh.

## Installation

```bash
cd decentg
npm install
```

## Configuration

Create a `config.json` file:

```json
{
  "network": {
    "meshPort": 8000,
    "apiPort": 3000,
    "networkId": "decentg-mesh-001"
  },
  "open5gs": {
    "enabled": true,
    "amfHost": "127.0.0.1",
    "amfPort": 38412,
    "smfHost": "127.0.0.1",
    "nrfHost": "127.0.0.1",
    "nrfPort": 7777
  },
  "free5gc": {
    "enabled": false,
    "amfHost": "127.0.0.1",
    "amfPort": 38412
  },
  "mesh": {
    "maxPeers": 50,
    "peerTimeout": 30000,
    "discoveryInterval": 10000,
    "autoConnect": true
  }
}
```

## Usage

### Start the Mesh Network

```bash
npm start
```

### Start with PM2 (Production)

```bash
npm run prod
```

### Connect to Existing Mesh

```javascript
const DecentG = require('./index');

const node = new DecentG({
  networkId: 'decentg-mesh-001',
  seedPeers: ['192.168.1.10:8000', '192.168.1.11:8000']
});

node.start();
```

## API Endpoints

- `GET /api/status` - Get node status
- `GET /api/peers` - List connected peers
- `POST /api/peer/connect` - Connect to a peer
- `GET /api/routes` - View routing table
- `GET /api/5g/status` - Get 5G core status

## Requirements

- Node.js >= 14.0.0
- Open5gs or Free5gc installed (optional, for full 5G functionality)
- Network connectivity between mesh nodes

## License

MIT License

## Contributing

Contributions are welcome! Please submit pull requests to the main Decentralized-Internet repository.
