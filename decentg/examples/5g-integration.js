/**
 * Example: 5G Core Integration
 * This example shows how to use DecentG with Open5gs
 */

const DecentG = require('../index');

async function main() {
  console.log('=== DecentG with 5G Core Integration ===\n');
  
  // Create node with 5G core enabled
  const node = new DecentG({
    configPath: './config.json'
  });
  
  // Setup 5G-specific event handlers
  node.on('ue:registered', (ueInfo) => {
    console.log(`\n✓ UE Registered!`);
    console.log(`  SUPI: ${ueInfo.supi}`);
    console.log(`  AMF: ${ueInfo.amf}`);
    console.log(`  Timestamp: ${new Date(ueInfo.timestamp).toISOString()}`);
  });
  
  node.fiveGCore.on('session:created', (session) => {
    console.log(`\n✓ PDU Session Created!`);
    console.log(`  Session ID: ${session.sessionId}`);
    console.log(`  SUPI: ${session.supi}`);
    console.log(`  DNN: ${session.dnn}`);
    console.log(`  SST: ${session.sst}`);
  });
  
  node.fiveGCore.on('session:released', (session) => {
    console.log(`\n✗ PDU Session Released: ${session.sessionId}`);
  });
  
  try {
    // Start the node
    await node.start();
    
    console.log('\n✓ Node started with 5G core integration\n');
    
    // Display 5G status
    const fiveGStatus = node.fiveGCore.getDetailedStatus();
    console.log('--- 5G Core Status ---');
    console.log(JSON.stringify(fiveGStatus, null, 2));
    
    // Simulate UE registration after 3 seconds
    setTimeout(async () => {
      console.log('\n--- Simulating UE Registration ---\n');
      
      const ueInfo = {
        supi: 'imsi-001010000000001',
        plmn: { mcc: '001', mnc: '01' }
      };
      
      try {
        const registeredUE = await node.fiveGCore.registerUE(ueInfo);
        
        // Create PDU session
        setTimeout(async () => {
          console.log('\n--- Creating PDU Session ---\n');
          
          const session = await node.fiveGCore.createPDUSession(registeredUE.supi, {
            dnn: 'internet',
            sst: 1,
            sd: '0x000001'
          });
          
          console.log('✓ PDU Session established successfully');
          
          // Release session after 10 seconds
          setTimeout(async () => {
            console.log('\n--- Releasing PDU Session ---\n');
            await node.fiveGCore.releasePDUSession(session.sessionId);
          }, 10000);
          
        }, 3000);
        
      } catch (error) {
        console.error('UE registration failed:', error);
      }
    }, 3000);
    
    console.log('Press Ctrl+C to stop\n');
    
  } catch (error) {
    console.error('Failed to start:', error);
    process.exit(1);
  }
  
  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n\nShutting down...');
    await node.stop();
    console.log('✓ Stopped');
    process.exit(0);
  });
}

main();
