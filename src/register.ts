/**
 * ERC-8004 Agent Registration Script
 * 
 * Uses the Agent0 SDK (https://sdk.ag0.xyz/) for registration.
 * The SDK handles:
 * - Two-step registration flow (mint → upload → setAgentURI)
 * - IPFS uploads via Pinata
 * - Proper metadata format with registrations array
 * 
 * Requirements:
 * - PRIVATE_KEY in .env (wallet with ETH for gas)
 * - PINATA_JWT in .env (for IPFS uploads)
 * - RPC_URL in .env (optional, defaults to public endpoint)
 * 
 * Run with: npm run register
 */

import 'dotenv/config';
import { SDK } from 'agent0-sdk';

// ============================================================================
// Agent Configuration
// ============================================================================

const AGENT_CONFIG = {
  name: 'BaseMagic MCP',
  description: 'AI-powered MCP server on Base with x402 payments, Builder Codes, and ERC-8004 identity.',
  image: 'https://raw.githubusercontent.com/nanduchahal/BaseMagic/main/branding/logo.png',
  // Update these URLs when you deploy your agent
  a2aEndpoint: 'https://basemagic-mcp.example.com/.well-known/agent-card.json',
  mcpEndpoint: 'https://basemagic-mcp.example.com/mcp',
};

// ============================================================================
// Main Registration Flow
// ============================================================================

async function main() {
  // Validate environment
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('PRIVATE_KEY not set in .env');
  }

  const pinataJwt = process.env.PINATA_JWT;
  if (!pinataJwt) {
    throw new Error('PINATA_JWT not set in .env');
  }

  const rpcUrl = process.env.RPC_URL || 'https://mainnet.base.org';

  // Initialize SDK
  console.log('🔧 Initializing Agent0 SDK...');
  const sdk = new SDK({
    chainId: 8453,
    rpcUrl,
    signer: privateKey,
    ipfs: 'pinata',
    pinataJwt,
  });

  // Create agent
  console.log('📝 Creating agent...');
  const agent = sdk.createAgent(
    AGENT_CONFIG.name,
    AGENT_CONFIG.description,
    AGENT_CONFIG.image
  );

  // Configure endpoints
  console.log('🔗 Setting A2A endpoint...');
  await agent.setA2A(AGENT_CONFIG.a2aEndpoint);
  console.log('🔗 Setting MCP endpoint...');
  await agent.setMCP(AGENT_CONFIG.mcpEndpoint);

  // Configure trust models
  console.log('🔐 Setting trust models...');
  agent.setTrust(true, true, false);

  // Set status flags
  // Best practice: Keep active=false until your agent is production-ready
  // Change to true when you're ready for users to discover your agent
  agent.setActive(false);
  agent.setX402Support(true);

  // Optional: Add OASF skills and domains for better discoverability
  // Browse taxonomy: https://github.com/agntcy/oasf
  // agent.addSkill('natural_language_processing/natural_language_generation/summarization');
  // agent.addDomain('technology/software_engineering');

  // Register on-chain with IPFS
  console.log('⛓️  Registering agent on Base Mainnet...');
  console.log('   This will:');
  console.log('   1. Mint agent NFT on-chain');
  console.log('   2. Upload metadata to IPFS');
  console.log('   3. Set agent URI on-chain');
  console.log('');

  const txHandle = await agent.registerIPFS();
  const { result } = await txHandle.waitMined();

  // Set agent wallet via ERC-8004 v2 setAgentWallet() (not deprecated metadata)
  // This uses EIP-712 signature verification for security
  console.log('');
  console.log('🔐 Setting agent wallet via setAgentWallet()...');
  const walletTx = await agent.setWallet('0x18e8c4603F7C2043333d0ed9bFD82B93176A2e40');
  if (walletTx) {
    await walletTx.waitMined();
  }

  // Output results
  console.log('');
  console.log('✅ Agent registered successfully!');
  console.log('');
  console.log('🆔 Agent ID:', result.agentId);
  console.log('📄 Agent URI:', result.agentURI);
  console.log('');
  console.log('🌐 View your agent on 8004scan:');
  const agentIdNum = result.agentId?.split(':')[1] || result.agentId;
  console.log(`   https://www.8004scan.io/agents/base/${agentIdNum}`);
  console.log('');
  console.log('📋 Next steps:');
  console.log('   1. Update AGENT_CONFIG endpoints with your production URLs');
  console.log('   2. Run `npm run start:a2a` to start your A2A server');
  console.log('   3. Deploy your agent to a public URL');
}

main().catch((error) => {
  console.error('❌ Registration failed:', error.message || error);
  process.exit(1);
});
