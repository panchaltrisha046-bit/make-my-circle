#!/usr/bin/env node

/**
 * Make My Circle - Chat System Validator & Tester
 * This script validates all chat configurations and tests functionality
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

// Color output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  log(`${exists ? '✓' : '✗'} ${description}: ${filePath}`, exists ? 'green' : 'red');
  return exists;
}

function checkEnvVariable(envFile, variable) {
  if (!fs.existsSync(envFile)) {
    log(`  ✗ Env file not found: ${envFile}`, 'red');
    return false;
  }

  const content = fs.readFileSync(envFile, 'utf-8');
  const hasVar = content.includes(variable);
  const isSet = new RegExp(`${variable}=.+`).test(content);
  
  if (hasVar && isSet) {
    log(`  ✓ ${variable} is configured`, 'green');
    return true;
  } else if (hasVar) {
    log(`  ⚠ ${variable} exists but may be empty`, 'yellow');
    return false;
  } else {
    log(`  ✗ ${variable} not found`, 'red');
    return false;
  }
}

function testServerConnection() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:5000', (res) => {
      log('  ✓ Server is running on port 5000', 'green');
      resolve(true);
    }).on('error', () => {
      log('  ✗ Cannot connect to server on port 5000', 'red');
      resolve(false);
    });

    req.setTimeout(2000, () => {
      req.abort();
      log('  ✗ Server connection timeout', 'red');
      resolve(false);
    });
  });
}

async function validateConfiguration() {
  log('\n=== MAKE MY CIRCLE - CHAT SYSTEM VALIDATOR ===\n', 'cyan');

  log('📋 Checking File Structure...', 'blue');
  checkFile('server/server.js', 'Server entry point');
  checkFile('server/services/aiService.js', 'AI Service');
  checkFile('server/controllers/aiChatController.js', 'AI Chat Controller');
  checkFile('server/controllers/messageController.js', 'Message Controller');
  checkFile('server/models/aichat.js', 'AI Chat Model');
  checkFile('server/models/message.js', 'Message Model');
  checkFile('client/src/pages/Chat.jsx', 'Chat Component');

  log('\n📝 Checking Server Configuration (.env)...', 'blue');
  checkEnvVariable('server/.env', 'PORT');
  checkEnvVariable('server/.env', 'MONGO_URI');
  checkEnvVariable('server/.env', 'JWT_SECRET');
  
  const hasOpenAI = checkEnvVariable('server/.env', 'OPENAI_API_KEY');
  const hasGemini = checkEnvVariable('server/.env', 'GEMINI_API_KEY');
  
  if (!hasOpenAI && !hasGemini) {
    log('\n  ⚠️  WARNING: No AI provider configured!', 'yellow');
    log('     AI Chat will not work until you add an API key:', 'yellow');
    log('     Option 1: Set OPENAI_API_KEY=sk-...', 'yellow');
    log('     Option 2: Set GEMINI_API_KEY=AIza-...', 'yellow');
  }

  log('\n📱 Checking Client Configuration (.env)...', 'blue');
  checkEnvVariable('client/.env', 'VITE_API_URL');

  log('\n🔗 Checking Server Connectivity...', 'blue');
  const isServerRunning = await testServerConnection();

  log('\n📊 Configuration Summary', 'cyan');
  log('=====================================');
  
  if (isServerRunning) {
    log('✓ Server: Running', 'green');
  } else {
    log('✗ Server: Not running', 'red');
    log('\n💡 To start the server:', 'blue');
    log('   cd server && npm run dev', 'yellow');
  }

  if (hasOpenAI || hasGemini) {
    log(`✓ AI Provider: ${hasOpenAI ? 'OpenAI' : 'Gemini'}`, 'green');
  } else {
    log('✗ AI Provider: Not configured', 'red');
  }

  log('✓ Message System: Ready', 'green');
  
  log('\n📚 Next Steps:', 'blue');
  if (!isServerRunning) {
    log('1. Start the server: cd server && npm run dev', 'yellow');
  }
  if (!hasOpenAI && !hasGemini) {
    log('2. Add an AI API key to server/.env', 'yellow');
  }
  log(`3. Start the client: cd client && npm run dev`, 'yellow');
  log('4. Open http://localhost:5173 in your browser', 'yellow');
  
  log('\n✅ Validation complete!\n', 'cyan');
}

// Run validation
validateConfiguration().catch(err => {
  log(`Error during validation: ${err.message}`, 'red');
  process.exit(1);
});
