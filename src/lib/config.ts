import type { AppConfig } from '@/types';

/**
 * Reads process.env and returns a typed AppConfig.
 * Demo mode activates when any critical piece is missing:
 * - Helius API key
 * - Master wallet address
 * - TRADOOR token mint address
 * 
 * Wallet balance + SOL price still work in demo mode (via public RPC).
 */
export function getConfig(): AppConfig {
  const heliusApiKey = process.env.HELIUS_API_KEY || '<placeholder>';
  const walletAddress = process.env.MASTER_WALLET_ADDRESS || '';
  const tradoorMint = process.env.TRADOOR_TOKEN_MINT || '';

  const hasRealHelius =
    !!heliusApiKey &&
    heliusApiKey !== '<placeholder>' &&
    heliusApiKey.length > 10;

  const hasRealWallet =
    !!walletAddress &&
    walletAddress !== '<MASTER_WALLET_PUBKEY>' &&
    walletAddress.length > 30;

  const hasRealMint =
    !!tradoorMint &&
    tradoorMint !== '<TRADOOR_MINT_ADDRESS>' &&
    tradoorMint.length > 30;

  // All three must be real for live mode
  const isDemoMode = !hasRealHelius || !hasRealWallet || !hasRealMint;

  if (isDemoMode && typeof globalThis !== 'undefined') {
    const reasons = [];
    if (!hasRealHelius) reasons.push('HELIUS_API_KEY');
    if (!hasRealWallet) reasons.push('MASTER_WALLET_ADDRESS');
    if (!hasRealMint) reasons.push('TRADOOR_TOKEN_MINT');
    console.log(`[config] Demo mode — missing: ${reasons.join(', ')}`);
  }

  return {
    masterWalletAddress: walletAddress,
    tradoorTokenMint: tradoorMint,
    burnAddress:
      process.env.BURN_ADDRESS ||
      '1nc1nerator11111111111111111111111111111111',
    heliusApiKey,
    heliusRpcUrl: process.env.HELIUS_RPC_URL || '',
    heliusWsUrl: process.env.HELIUS_WS_URL || '',
    isDemoMode,
  };
}
