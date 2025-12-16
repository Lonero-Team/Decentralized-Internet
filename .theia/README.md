# Decentralized Internet IDE

Custom Eclipse Theia-based IDE tailored for Decentralized Internet SDK development with built-in tools for mesh networking, 5G core configuration, and distributed computing.

## Features

### 🚀 SDK-Aware Development Environment
- Integrated terminal with SDK command shortcuts
- Custom snippets for mesh network, blockchain, and P2P code
- Built-in documentation browser
- Component template generator

### 🔧 Mesh Network Tools
- Visual mesh topology editor
- Peer connection testing tools
- Network performance analyzer
- Route path visualizer

### 📡 5G Core Configuration
- Open5gs/Free5gc configuration editor with validation
- UE registration wizard
- PDU session testing interface
- Network function status monitor

### ⚡ Distributed Computing Features
- ClusterPost job submission interface
- GridBee worker management
- Task scheduler and monitor
- Resource allocation viewer

### 🔗 Blockchain Integration
- Smart contract editor for LNRChain
- Transaction builder and tester
- Block explorer integration
- Consensus algorithm simulator

## Installation

### Prerequisites

- Node.js >= 18.0.0
- Yarn >= 1.22.0
- Python >= 3.8 (for native dependencies)
- C++ build tools (Windows: Visual Studio Build Tools, Linux: gcc/g++)

### Install Dependencies

```bash
cd .theia
yarn install
```

This will download and install all Theia dependencies plus custom plugins.

## Usage

### Start the IDE

```bash
yarn start
```

The IDE will be available at: `http://localhost:3000`

### Development Mode with Auto-Reload

```bash
yarn start:watch
```

### Build Production Version

```bash
yarn package
```

## Custom Extensions

The IDE includes custom Theia extensions located in `extensions/`:

### Decentralized Internet Extension
**Location:** `extensions/decentralized-internet/`

Features:
- SDK version manager
- Component launcher
- Configuration validator
- Template generator

### Mesh Network Extension
**Location:** `extensions/mesh-network/`

Features:
- Network topology visualizer
- Peer discovery tool
- Connection debugger
- Latency analyzer

### 5G Core Extension
**Location:** `extensions/5g-core/`

Features:
- Configuration editor for Open5gs/Free5gc
- UE simulator
- Network function monitor
- NGAP/PFCP packet inspector

### Blockchain Extension
**Location:** `extensions/blockchain/`

Features:
- Smart contract templates
- Transaction builder
- Block explorer
- Mining simulator

## Keyboard Shortcuts

### General
- `Ctrl+Shift+P` / `Cmd+Shift+P` - Command Palette
- `Ctrl+P` / `Cmd+P` - Quick File Open
- `Ctrl+Shift+F` / `Cmd+Shift+F` - Search in Workspace

### SDK Specific
- `Ctrl+Alt+M` - Open Mesh Network Visualizer
- `Ctrl+Alt+5` - Open 5G Core Monitor
- `Ctrl+Alt+B` - Open Blockchain Explorer
- `Ctrl+Alt+C` - Open ClusterPost Dashboard
- `Ctrl+Alt+S` - Start Component
- `Ctrl+Alt+T` - SDK Terminal

## Configuration

### Custom Settings

Edit `.theia/settings.json`:

```json
{
  "decentralizedInternet.sdkPath": "../",
  "decentralizedInternet.autoStart": ["decentg"],
  "meshNetwork.defaultPort": 8765,
  "meshNetwork.discoveryProtocol": "udp",
  "5gCore.preferredCore": "open5gs",
  "5gCore.amfAddress": "127.0.0.1:38412",
  "blockchain.defaultChain": "lnrchain",
  "clusterPost.serverUrl": "http://localhost:8180"
}
```

### Custom Keybindings

Edit `.theia/keybindings.json`:

```json
[
  {
    "command": "meshNetwork.visualize",
    "key": "ctrl+alt+m"
  },
  {
    "command": "5gCore.monitor",
    "key": "ctrl+alt+5"
  }
]
```

## Templates

The IDE includes templates for common SDK patterns:

### Mesh Network Component
```javascript
// File -> New -> SDK Template -> Mesh Network Component
const { MeshController } = require('decentralized-internet');

class MyMeshComponent {
  constructor(config) {
    this.mesh = new MeshController(config);
  }
  
  async start() {
    await this.mesh.initialize();
    await this.mesh.start();
  }
}
```

### 5G Core Handler
```javascript
// File -> New -> SDK Template -> 5G Core Handler
const { FiveGCoreInterface } = require('decentralized-internet');

class My5GHandler {
  constructor(config) {
    this.core = new FiveGCoreInterface(config);
  }
  
  async registerUE(supi, key) {
    return await this.core.registerUE(supi, key);
  }
}
```

### Blockchain Smart Contract
```javascript
// File -> New -> SDK Template -> Smart Contract
const { LNRChain } = require('decentralized-internet');

class MyContract extends LNRChain.Contract {
  constructor() {
    super('MyContract');
  }
  
  execute(transaction) {
    // Contract logic
  }
}
```

## Plugins

The IDE automatically downloads and configures these VS Code plugins:

- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **GitLens** - Enhanced Git integration
- **REST Client** - API testing
- **Docker** - Container management

Add custom plugins in `package.json`:

```json
"theiaPlugins": {
  "my-plugin": "https://open-vsx.org/api/publisher/plugin/version/file.vsix"
}
```

## Architecture

```
.theia/
├── package.json              # Dependencies and configuration
├── settings.json             # IDE settings
├── keybindings.json          # Custom keybindings
├── plugins/                  # VS Code plugins
├── extensions/               # Custom Theia extensions
│   ├── decentralized-internet/
│   ├── mesh-network/
│   ├── 5g-core/
│   └── blockchain/
└── resources/                # Assets and documentation
```

## Building Custom Extensions

### Create New Extension

```bash
cd .theia/extensions
yo @theia/extension decentralized-internet-my-extension
```

### Extension Structure

```
my-extension/
├── package.json
├── src/
│   ├── browser/              # Frontend code
│   │   ├── my-contribution.ts
│   │   └── my-frontend-module.ts
│   └── node/                 # Backend code
│       ├── my-backend.ts
│       └── my-backend-module.ts
└── README.md
```

### Register Extension

Add to `.theia/package.json`:

```json
"dependencies": {
  "decentralized-internet-my-extension": "file:./extensions/my-extension"
}
```

## Troubleshooting

### IDE won't start

1. Clear build cache: `yarn clean`
2. Reinstall dependencies: `yarn install`
3. Check Node.js version: `node --version` (must be >= 18)

### Extensions not loading

1. Download plugins: `yarn download:plugins`
2. Check `plugins/` directory exists
3. Verify network connectivity

### Performance issues

1. Increase Node.js memory: `NODE_OPTIONS=--max-old-space-size=4096 yarn start`
2. Disable unused extensions in settings
3. Close unused terminals

### Build errors on Windows

1. Install Visual Studio Build Tools
2. Run in Administrator PowerShell
3. Set Python path: `npm config set python python3`

## Development

### Watch Mode

```bash
yarn watch
```

Automatically rebuilds on file changes.

### Debug Mode

```bash
yarn start --log-level=debug
```

Enables verbose logging.

### Test Extensions

```bash
cd extensions/my-extension
yarn test
```

## Contributing

When developing custom extensions:

1. Follow Theia extension architecture guidelines
2. Use TypeScript for type safety
3. Add tests for all features
4. Update documentation

## Resources

- [Theia Documentation](https://theia-ide.org/docs/)
- [Extension Development Guide](https://theia-ide.org/docs/authoring_extensions/)
- [API Reference](https://eclipse-theia.github.io/theia/)
- [Decentralized Internet SDK Docs](https://lonero.readthedocs.io/)

## License

MIT License - See LICENSE file

## Support

- GitHub Issues: https://github.com/Lonero-Team/Decentralized-Internet/issues
- Theia Spectrum: https://spectrum.chat/theia
- SDK Documentation: https://lonero.readthedocs.io/
