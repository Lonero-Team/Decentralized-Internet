/**
 * Basic test for the DecentG hybrid mesh network
 */

const DecentG = require('../index');

async function runTest() {
  console.log('=== DecentG Mesh Network Test ===\n');
  
  try {
    // Create first node
    console.log('Creating Node 1...');
    const node1 = new DecentG({
      configPath: '../config.json'
    });
    
    // Setup event listeners
    node1.on('started', () => {
      console.log('✓ Node 1 started successfully');
    });
    
    node1.on('peer:connected', (peer) => {
      console.log(`✓ Node 1: Peer connected - ${peer.id}`);
    });
    
    node1.on('peer:disconnected', (peerId) => {
      console.log(`✗ Node 1: Peer disconnected - ${peerId}`);
    });
    
    // Start node 1
    await node1.start();
    
    console.log('\n--- Node 1 Status ---');
    console.log(node1.getStatus());
    
    // Wait a bit before testing API
    setTimeout(async () => {
      console.log('\n--- Testing API ---');
      
      const fetch = require('node-fetch');
      
      try {
        // Test status endpoint
        const statusResponse = await fetch('http://localhost:3000/api/status');
        const status = await statusResponse.json();
        console.log('API Status:', status);
        
        // Test peers endpoint
        const peersResponse = await fetch('http://localhost:3000/api/peers');
        const peers = await peersResponse.json();
        console.log('API Peers:', peers);
        
        // Test 5G status endpoint
        const fiveGResponse = await fetch('http://localhost:3000/api/5g/status');
        const fiveGStatus = await fiveGResponse.json();
        console.log('API 5G Status:', fiveGStatus);
        
        console.log('\n✓ All tests passed!');
      } catch (error) {
        console.error('API test error:', error.message);
      }
      
      // Stop node after tests
      console.log('\nStopping node...');
      await node1.stop();
      console.log('✓ Node stopped successfully');
      
      process.exit(0);
    }, 3000);
    
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

// Run the test
runTest();
