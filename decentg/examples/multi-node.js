/**
 * Example: Multi-Node Mesh Network
 * This example demonstrates running multiple nodes to form a mesh network
 */

const DecentG = require('../index');

async function createNode(id, meshPort, apiPort) {
  const config = {
    network: {
      meshPort: meshPort,
      apiPort: apiPort,
      networkId: 'decentg-mesh-001',
      host: '0.0.0.0'
    },
    open5gs: {
      enabled: false
    },
    free5gc: {
      enabled: false
    },
    mesh: {
      maxPeers: 50,
      peerTimeout: 30000,
      discoveryInterval: 10000
    }
  };
  
  const node = new DecentG(config);
  
  node.on('started', () => {
    console.log(`[Node ${id}] Started on ports ${meshPort}/${apiPort}`);
  });
  
  node.on('peer:connected', (peer) => {
    console.log(`[Node ${id}] Peer connected: ${peer.id}`);
  });
  
  node.on('peer:disconnected', (peerId) => {
    console.log(`[Node ${id}] Peer disconnected: ${peerId}`);
  });
  
  await node.start();
  
  return node;
}

async function main() {
  console.log('=== Starting Multi-Node Mesh Network ===\n');
  
  const nodes = [];
  
  try {
    // Create 3 nodes
    console.log('Creating nodes...\n');
    
    const node1 = await createNode(1, 8000, 3000);
    nodes.push(node1);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const node2 = await createNode(2, 8001, 3001);
    nodes.push(node2);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const node3 = await createNode(3, 8002, 3002);
    nodes.push(node3);
    
    console.log('\n✓ All nodes started!\n');
    
    // Connect node 2 to node 1
    console.log('Connecting nodes...\n');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    await node2.peeringManager.connectToPeer({
      address: '127.0.0.1',
      port: 8000
    });
    
    // Connect node 3 to node 2
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await node3.peeringManager.connectToPeer({
      address: '127.0.0.1',
      port: 8001
    });
    
    console.log('\n✓ Mesh network established!\n');
    
    // Display status every 10 seconds
    setInterval(() => {
      console.log('\n--- Network Status ---');
      nodes.forEach((node, index) => {
        const status = node.getStatus();
        console.log(`Node ${index + 1}: ${status.peers} peers, ${status.routes} routes`);
      });
    }, 10000);
    
    console.log('Press Ctrl+C to stop all nodes\n');
    
  } catch (error) {
    console.error('Error:', error);
    
    // Cleanup
    for (const node of nodes) {
      await node.stop();
    }
    
    process.exit(1);
  }
  
  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n\nStopping all nodes...');
    
    for (const node of nodes) {
      await node.stop();
    }
    
    console.log('✓ All nodes stopped');
    process.exit(0);
  });
}

main();
