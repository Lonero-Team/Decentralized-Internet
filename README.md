# Decentralized Internet SDK 💻  
![npm](https://img.shields.io/npm/dt/decentralized-internet?label=NPM%20Downloads) [![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FLonero-Team%2FDecentralized-Internet.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2FLonero-Team%2FDecentralized-Internet?ref=badge_shield)
| ![Crates.io](https://img.shields.io/crates/d/decentralized-internet?label=crates.io%20Downloads) | [![Discord](https://img.shields.io/discord/639489591664967700)](https://discord.gg/buTafPc) | [![Gitter](https://img.shields.io/gitter/room/Decentralized-Internet/community)](https://gitter.im/Decentralized-Internet/community?source=orgpage) | [![Read the Docs](https://img.shields.io/readthedocs/lonero)](https://lonero.readthedocs.io/en/latest/)

> **A comprehensive framework for building peer-to-peer, blockchain-enabled, and distributed computing applications with hybrid mesh networking, 5G core integration, and AI-powered automation.**

## Why? 🙋

The internet today suffers from fundamental architectural limitations:
- **Centralization**: Monopolized by central authorities and corporations
- **Legacy Infrastructure**: Dependent on outdated telecom towers, routing systems, and switches
- **Vulnerability**: Single points of failure and censorship
- **Scalability**: Limited by traditional client-server architecture

The Decentralized Internet SDK addresses these challenges by providing a complete toolkit for building the next generation of distributed applications.

## What? 😕

The Decentralized Internet SDK is a comprehensive software development kit for creating decentralized web applications, distributed computing systems, and peer-to-peer networks. It combines multiple technologies into a unified framework:

- **P2P Networking**: Build mesh networks with automatic peer discovery
- **Blockchain Infrastructure**: Deploy custom blockchains and cryptocurrency sidechains
- **Distributed Computing**: Leverage GridBee and ClusterPost for parallel processing
- **5G Core Integration**: Hybrid mesh networks using Open5gs and Free5gc
- **AI Automation**: OpenPeerAI Cloud-Agents for intelligent network optimization

**Distribution**: Available through NPM, Crates.io, and multiple platform-specific packages

## Architecture Overview 🏗️

The SDK is organized into modular components that work independently or together:

```
Decentralized Internet SDK
├── Core Libraries
│   ├── P2P Networking (WebRTC, libp2p)
│   ├── Blockchain (Lotion, Tendermint, LNRChain)
│   ├── Distributed Computing (GridBee, ClusterPost)
│   └── Cryptography (Bitcoin-peg, Bitcoin-protocol)
│
├── DecentG - Hybrid Mesh Network
│   ├── Mesh Controller (TCP/UDP networking)
│   ├── 5G Core Interface (Open5gs/Free5gc)
│   ├── Peering Manager (Open peering protocol)
│   ├── Router Module (Dynamic routing)
│   ├── Node Discovery (Multicast discovery)
│   └── Security Manager (Authentication/encryption)
│
├── UI Dashboard (Electron)
│   ├── Component Management
│   ├── Real-time Monitoring
│   ├── Cloud Agents Integration
│   ├── Network Visualization
│   └── Centralized Logging
│
├── Theia IDE Extension
│   ├── SDK-aware development
│   ├── Component launcher
│   ├── Template generator
│   └── Integrated debugging
│
└── Supporting Packages
    ├── P2Talk (GSM alternative)
    ├── P2Shop (Decentralized marketplace)
    ├── P2PWiki (Distributed wiki)
    └── BigchainDB (Decentralized database)
```

## Features 📋

### Network & Communication
- ✅ **Hybrid Mesh Networking**: Combine traditional TCP/UDP with 5G core networks
- ✅ **Peer Discovery**: Automatic node discovery via multicast and DHT
- ✅ **Open Peering**: Establish connections without central coordination
- ✅ **Dynamic Routing**: Adaptive routing based on network topology
- ✅ **Offline-First**: Build networks that function without internet connectivity

### Blockchain & Consensus
- ✅ **Custom Blockchains**: Deploy application-specific blockchains
- ✅ **Cryptocurrency Sidechains**: Create tokens using Lotion or Tendermint
- ✅ **Smart Contracts**: LNRChain smart contract platform
- ✅ **Bitcoin Integration**: Bitcoin-peg for bridging to Bitcoin network
- ✅ **Consensus Protocols**: Tendermint BFT, Proof-of-Work, custom consensus

### Distributed Computing
- ✅ **GridBee Framework**: Browser-based grid computing (Haxe 4.3.3)
- ✅ **ClusterPost**: High-performance computing cluster management
- ✅ **BOINC Integration**: Connect to BOINC distributed computing projects
- ✅ **Task Scheduling**: Parallel processing with job queuing
- ✅ **Resource Allocation**: Intelligent workload distribution

### 5G & Telecommunications
- ✅ **Open5gs Integration**: Open-source 5G core network
- ✅ **Free5gc Support**: Alternative 5G core implementation
- ✅ **UE Simulation**: User equipment registration and management
- ✅ **PDU Sessions**: Packet data unit session establishment
- ✅ **Network Functions**: AMF, SMF, UPF, NRF support

### AI & Automation
- ✅ **Cloud Agents**: OpenPeerAI-powered automation
- ✅ **Network Optimization**: AI-driven network tuning
- ✅ **Intelligent Routing**: ML-based route selection
- ✅ **Resource Prediction**: Predictive resource allocation
- ✅ **Anomaly Detection**: Automated threat detection

### Developer Tools
- ✅ **Unified Dashboard**: Electron-based control panel
- ✅ **Theia IDE**: Custom IDE with SDK integration
- ✅ **Real-time Monitoring**: System and network metrics
- ✅ **Component Management**: Start/stop all SDK components
- ✅ **Template Generator**: Quick project scaffolding

<p align="center">
<img src="https://cdn.hackaday.io/images/1385851589324799605.png" width="512">
</p>

## Technical Foundation 🔧

The SDK integrates and extends several open-source projects:

### Core Components
- **[Lotion](https://github.com/nomic-io/lotion)**: JavaScript blockchain framework
- **[Tendermint](https://tendermint.com/)**: BFT consensus engine
- **[ClusterPost](https://github.com/juanprietob/clusterpost)**: Distributed computing platform
- **[GridBee](https://github.com/BME-IK/gridbee-framework)**: Web-based grid computing (upgraded to Haxe 4.3.3)
- **[Bitcoin-peg](https://www.npmjs.com/package/bitcoin-peg)**: Bitcoin integration layer

### 5G Core Networks
- **[Open5gs](https://open5gs.org/)**: Open-source 5G core network
- **[Free5gc](https://free5gc.org/)**: Open-source 5G core network implementation

### AI & Automation
- **[OpenPeerAI Cloud-Agents](https://huggingface.co/OpenPeerAI/Cloud-Agents)**: AI-powered network automation

### Novel Contributions
- **DecentG**: Hybrid mesh network combining P2P with 5G core
- **UI Dashboard**: Unified management interface for all SDK components
- **Theia IDE Extension**: SDK-integrated development environment
- **LNRChain**: Custom blockchain implementation
- **P2Talk**: Peer-to-peer communication (GSM alternative)

## Design Philosophy 🎯

1. **Modularity**: Components work independently or together
2. **Interoperability**: Standard protocols for cross-platform compatibility
3. **Resilience**: No single points of failure
4. **Scalability**: Horizontal scaling through distributed architecture
5. **Privacy**: End-to-end encryption and decentralized identity
6. **Accessibility**: Easy-to-use tools for developers of all skill levels

## Use Cases 💡

- **Decentralized Social Networks**: Build censorship-resistant platforms
- **Edge Computing**: Deploy compute resources at network edge
- **IoT Networks**: Connect devices without central servers
- **Community Networks**: Create local mesh networks
- **Disaster Recovery**: Maintain connectivity during infrastructure failure
- **Private Clouds**: Deploy on-premise distributed systems
- **Research Computing**: Leverage distributed computing for science
- **Cryptocurrency Projects**: Launch custom blockchain networks

## Research & Publications 📚

### Whitepapers
- [Lonero Whitepaper (Original)](https://www.academia.edu/37041064/Lonero_Whitepaper_v1) - Foundational architecture
- [CrowdCoin Scientific Whitepaper](https://www.academia.edu/37832290/CrowdCoin_Scientific_Whitepaper) - Economic model

### Academic Context
This project builds upon decades of distributed systems research, including:
- Peer-to-peer networking (BitTorrent, IPFS)
- Byzantine fault tolerance (PBFT, Tendermint)
- Distributed hash tables (Kademlia, Chord)
- Grid computing (BOINC, Folding@home)
- Software-defined networking (OpenFlow, SDN)

## Project Governance 👥

**Maintained by**: [The Lonero Dev Team](https://github.com/lonero-team) and [StarkDrones](https://starkdrones.org/home/os)

**Community**:
- Discord: [Join our server](https://discord.gg/buTafPc)
- Gitter: [Chat with developers](https://gitter.im/Decentralized-Internet/community)
- Documentation: [Read the Docs](https://lonero.readthedocs.io/)

This project was created to support a new internet: more open, free, and censorship-resistant. An internet that doesn't rely on telecom towers, outdated grids, or legacy infrastructure. We believe P2P compatibility and grid computing are essential for the future of networked communication.

[![UsageHeader](https://raw.githubusercontent.com/Mentors4EDU/Images/master/UsageGuideHead.png)](https://lonero.readthedocs.io/en/latest/Decentralized%20Internet%20Docs/Critical%20Components.html)

[![InstallHeader](https://raw.githubusercontent.com/Mentors4EDU/Images/master/Installation-head.png)](https://lonero.readthedocs.io/en/latest/Decentralized%20Internet%20Docs/Main%20Installation%20Methods.html)

---
###### App to add GitHub metrics tracking to select repos [here](https://github.com/apps/decentralized-internet) | [BitBucket](https://bitbucket.org/gamer456148/decentralized-internet/src/master/) | [Learning Lab](https://lab.github.com/Lonero-Team/build-a-dapp/)  
###### See original compatibility status update [here](https://www.minds.com/newsfeed/1040672641569824768?referrer=LoneroLNR) | *See [NPM v.](https://www.npmjs.com/package/decentralized-internet?activeTab=versions)Updates*

#### For Mac Users:
[![MAC](https://jaywcjlove.github.io/sb/download/macos.svg)](https://github.com/Lonero-Team/Decentralized-Internet/releases/download/v1.0_mac/Decentralized-Internet.dmg)
##### Sketch Plugin: `wget https://git.io/Jv2pk`

###### Latest Git Release Package [here](https://github.com/Lonero-Team/Decentralized-Internet/releases/tag/v3.6.9)  
[![Gitpod ready-to-code](https://img.shields.io/badge/Gitpod-ready--to--code-blue?logo=gitpod)](https://gitpod.io/#https://github.com/Lonero-Team/Decentralized-Internet)

## License
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FLonero-Team%2FDecentralized-Internet.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2FLonero-Team%2FDecentralized-Internet?ref=badge_large)
