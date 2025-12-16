# Decentralized Internet Theia Extension

Custom Theia extension that integrates the Decentralized Internet SDK into the IDE, providing component management, monitoring, and SDK-specific development tools.

## Features

- **SDK Dashboard Widget** - Visual component manager with real-time status
- **Component Control** - Start/stop SDK components directly from IDE
- **Real-time Metrics** - Live system and network metrics display
- **Component Logs** - View logs for any SDK component
- **Template Generator** - Quick scaffolding for SDK patterns
- **Menu Integration** - SDK menu items in View menu

## Commands

- `Open SDK Dashboard` - Opens the main dashboard widget
- `Start SDK Component` - Start a specific component
- `Stop SDK Component` - Stop a running component
- `New SDK Template` - Create from SDK template
- `View Component Logs` - Display logs for a component

## Keyboard Shortcuts

- `Ctrl+Alt+M` - Open Mesh Network Visualizer
- `Ctrl+Alt+5` - Open 5G Core Monitor
- `Ctrl+Alt+B` - Open Blockchain Explorer
- `Ctrl+Alt+C` - Open ClusterPost Dashboard
- `Ctrl+Alt+S` - Start Component
- `Ctrl+Alt+T` - SDK Terminal

## Installation

This extension is automatically loaded when you start the Theia IDE from the `.theia` folder.

## Development

### Build Extension

```bash
cd .theia/extensions/decentralized-internet
yarn install
yarn build
```

### Watch Mode

```bash
yarn watch
```

## Architecture

- `decentralized-internet-frontend-module.ts` - Module registration
- `decentralized-internet-manager.ts` - Communication with UI Dashboard backend
- `decentralized-internet-contribution.ts` - Command contributions
- `decentralized-internet-menu.ts` - Menu contributions
- `decentralized-internet-widget.ts` - React-based dashboard widget

## Requirements

- UI Dashboard must be running on port 9000
- Socket.IO connection to http://localhost:9000

## License

MIT
