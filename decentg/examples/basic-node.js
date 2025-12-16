/**
 * Example: Basic Node Setup
 * This example shows how to create and start a basic DecentG mesh node
 */

const DecentG = require('../index');

async function main() {
  console.log('Starting DecentG Mesh Node...\n');
  
  // Create a new node with custom configuration
  const node = new DecentG({
    configPath: './config.json'
  });
  
  // Setup event handlers
  node.on('started', () => {
    console.log('✓ Node started successfully!');
    console.log(`  Node ID: ${node.nodeId}`);
    console.log(`  Network ID: ${node.config.network.networkId}`);
    console.log(`  Mesh Port: ${node.config.network.meshPort}`);
    console.log(`  API Port: ${node.config.network.apiPort}`);
  });
  
  node.on('peer:connected', (peer) => {
    console.log(`\n✓ New peer connected!`);
    console.log(`  Peer ID: ${peer.id}`);
    console.log(`  Address: ${peer.address}:${peer.port}`);
  });
  
  node.on('peer:disconnected', (peerId) => {
    console.log(`\n✗ Peer disconnected: ${peerId}`);
  });
  
  node.on('ue:registered', (ueInfo) => {
    console.log(`\n✓ UE registered: ${ueInfo.supi}`);
  });
  
  node.on('routing:updated', (routingTable) => {
    console.log(`\n✓ Routing table updated (${routingTable.size} routes)`);
  });
  
  // Start the node
  try {
    await node.start();
    
    console.log('\n--- Node is running ---');
    console.log('Press Ctrl+C to stop\n');
    
    // Periodically display status
    setInterval(() => {
      const status = node.getStatus();
      console.log('\n--- Status Update ---');
      console.log(`Peers: ${status.peers}`);
      console.log(`Routes: ${status.routes}`);
      console.log(`5G Core: ${status.fiveGCore ? status.fiveGCore.connected : 'disabled'}`);
    }, 30000);
    
  } catch (error) {
    console.error('Failed to start node:', error);
    process.exit(1);
  }
  
  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n\nShutting down gracefully...');
    await node.stop();
    console.log('✓ Node stopped');
    process.exit(0);
  });
}

main();
