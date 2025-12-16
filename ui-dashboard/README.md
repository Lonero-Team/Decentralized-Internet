# Decentralized Internet UI Dashboard

Complete control panel for managing all Decentralized Internet SDK components with real-time monitoring, AI-powered automation, and network visualization.

## Features

✨ **Unified Control Panel**
- Start/stop all SDK components from one interface
- Real-time status monitoring
- Component-specific configuration

🤖 **Cloud Agents Integration**
- OpenPeerAI Cloud-Agents for AI-powered automation
- Network optimization
- Intelligent peer discovery
- Route analysis and optimization
- Resource allocation
- Deployment automation

📊 **Real-Time Monitoring**
- System performance metrics (CPU, Memory)
- Network activity tracking
- Component health monitoring
- Historical data visualization

🕸️ **Network Visualization**
- Interactive mesh network graph
- Peer connection mapping
- Latency visualization
- Topology analysis

📝 **Centralized Logging**
- Component-specific logs
- Real-time log streaming
- Log filtering and search

## Installation

```bash
cd ui-dashboard
npm install
```

## Usage

### Start the Dashboard

```bash
npm start
```

The dashboard will launch in Electron and the backend server will start on port 9000.

### Web-Only Mode

```bash
npm run web
```

Access at: `http://localhost:8080`

## Supported Components

The dashboard can manage the following SDK components:

- **DecentG** - Hybrid mesh network with 5G core integration
- **ClusterPost** - Distributed computing cluster management
- **GridBee** - Web-based grid computing framework
- **P2Talk** - P2P communication (GSM alternative)
- **LNRChain** - Blockchain implementation
- **BigchainDB** - Decentralized database

## Architecture

```
ui-dashboard/
├── main.js                    # Electron main process
├── preload.js                 # Electron preload script
├── package.json               # Dependencies
├── public/                    # Frontend assets
│   ├── index.html            # Main HTML
│   ├── styles.css            # Styling
│   └── app.js                # Frontend logic
└── src/
    ├── controllers/
    │   └── sdk-controller.js  # Component management
    └── services/
        ├── monitoring-service.js    # Metrics collection
        └── cloud-agents-service.js  # AI automation
```

## API Endpoints

### GET /api/status
Get status of all components

### POST /api/start/:component
Start a specific component

### POST /api/stop/:component
Stop a specific component

### GET /api/logs/:component
Get logs for a component

### GET /api/monitoring/metrics
Get real-time metrics

### POST /api/cloud-agents/execute
Execute an AI automation task

## Cloud Agents Tasks

- **Network Optimization** - AI-powered network configuration optimization
- **Peer Discovery** - Intelligent peer discovery and analysis
- **Route Analysis** - Routing efficiency analysis and recommendations
- **Deployment Automation** - Automated deployment planning
- **Resource Allocation** - Optimal resource allocation strategies
- **AI Inference** - General AI-powered analysis

## Configuration

Backend port can be changed via environment variable:

```bash
PORT=9000 npm start
```

## Development

### Run in Development Mode

```bash
npm run dev
```

This enables hot reloading and developer tools.

### Build for Production

```bash
npm run build
```

Creates distributable packages for Windows, macOS, and Linux.

## Screenshots

### Dashboard
![Dashboard View](docs/dashboard.png)

### Network Map
![Network Visualization](docs/network.png)

### Cloud Agents
![AI Automation](docs/cloud-agents.png)

## Requirements

- Node.js >= 14.0.0
- Electron >= 28.0.0
- Network connectivity for component management

## Troubleshooting

### Components won't start

1. Check if paths in `sdk-controller.js` are correct
2. Verify Node.js/Haxe are installed
3. Check component-specific dependencies

### Dashboard won't connect

1. Verify backend is running on port 9000
2. Check firewall settings
3. Look for errors in console (F12)

### Charts not displaying

1. Ensure Chart.js is loaded
2. Check browser console for errors
3. Verify metrics are being received

## License

MIT License - See LICENSE file

## Support

For issues and questions:
- GitHub Issues: https://github.com/Lonero-Team/Decentralized-Internet/issues
- Documentation: https://lonero.readthedocs.io/

## Credits

Built for the Decentralized Internet SDK by the Lonero Team
Powered by OpenPeerAI Cloud-Agents: https://huggingface.co/OpenPeerAI/Cloud-Agents
