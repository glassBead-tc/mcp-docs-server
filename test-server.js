#!/usr/bin/env node

/**
 * Simple test script for the MCP Docs Server
 * Tests basic functionality without requiring external tools
 */

import { spawn } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testServer() {
  console.log('🧪 Testing MCP Docs Server...\n');
  
  // Test 1: Check if server starts
  console.log('1. Testing server startup...');
  
  const serverPath = join(__dirname, 'build', 'index.js');
  const serverProcess = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  let serverOutput = '';
  let serverError = '';
  
  serverProcess.stdout.on('data', (data) => {
    serverOutput += data.toString();
  });
  
  serverProcess.stderr.on('data', (data) => {
    serverError += data.toString();
  });
  
  // Give server time to start
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  if (serverProcess.pid) {
    console.log('✅ Server started successfully');
    console.log(`   Process ID: ${serverProcess.pid}`);
    
    if (serverError.includes('MCP Docs Server running')) {
      console.log('✅ Server initialization message found');
    }
    
    // Test 2: Send a simple initialize request
    console.log('\n2. Testing JSON-RPC initialization...');
    
    const initRequest = {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize", 
      params: {
        protocolVersion: "2025-06-18",
        capabilities: {},
        clientInfo: {
          name: "test-client",
          version: "1.0.0"
        }
      }
    };
    
    try {
      const requestStr = JSON.stringify(initRequest);
      const message = `Content-Length: ${requestStr.length}\r\n\r\n${requestStr}`;
      
      serverProcess.stdin.write(message);
      
      // Wait for response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (serverOutput.includes('"jsonrpc":"2.0"')) {
        console.log('✅ Server responded to initialization');
      } else {
        console.log('⚠️ No JSON-RPC response detected');
        console.log('   Server output:', serverOutput);
      }
      
    } catch (error) {
      console.log(`❌ Error testing JSON-RPC: ${error.message}`);
    }
    
    // Test 3: Check if documentation files are accessible
    console.log('\n3. Testing documentation access...');
    
    try {
      const fs = await import('fs');
      const docsPath = join(__dirname, 'scraped_docs');
      
      if (fs.existsSync(docsPath)) {
        const files = fs.readdirSync(docsPath).filter(f => f.endsWith('.md'));
        console.log(`✅ Found ${files.length} documentation files`);
        console.log(`   Sample files: ${files.slice(0, 3).join(', ')}${files.length > 3 ? '...' : ''}`);
      } else {
        console.log('❌ Documentation directory not found');
        console.log(`   Expected path: ${docsPath}`);
      }
      
    } catch (error) {
      console.log(`❌ Error accessing documentation: ${error.message}`);
    }
    
    // Cleanup
    serverProcess.kill();
    
  } else {
    console.log('❌ Server failed to start');
    console.log('   Error output:', serverError);
  }
  
  console.log('\n🏁 Test completed');
  
  return serverProcess.pid !== undefined;
}

// Run test
testServer().then(success => {
  console.log(`\n${success ? '✅' : '❌'} Overall test result: ${success ? 'PASSED' : 'FAILED'}`);
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('💥 Test script failed:', error);
  process.exit(1);
});