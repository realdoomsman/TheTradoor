import type { AppConfig } from '@/types';

/**
 * Reads process.env and returns a typed AppConfig.
 * Demo mode is activated when the Helius API key is still a placeholder or suspended.
 * Wallet balance + SOL price can work without Helius (via public RPC + DexScreener).
 */
export function getConfig(): AppConfig {
  const heliusApiKey = process.env.HELIUS_API_KEY || '<placeholder>';
  const walletAddress = process.env.MASTER_WALLET_ADDRESS || '';

  // Only fully live when we have a real Helius key AND wallet
  const hasRealHelius =
    !!heliusApiKey &&
    heliusApiKey !== '<placeholder>' &&
    heliusApiKey.length > 10;

  const hasRealWallet =
    !!walletAddress &&
    walletAddress !== '<MASTER_WALLET_PUBKEY>' &&
    walletAddress.length > 30;

  // Demo mode for trade parsing (needs Helius enhanced API)
  // But wallet balance works regardless (uses public RPC fallback)
  const isDemoMode = !hasRealHelius || !hasRealWallet;

  return {
    masterWalletAddress: walletAddress,
    tradoorTokenMint: process.env.TRADOOR_TOKEN_MINT || '',
    burnAddress:
      process.env.BURN_ADDRESS ||
      '1nc1nerator11111111111111111111111111111111',
    heliusApiKey,
    heliusRpcUrl: process.env.HELIUS_RPC_URL || '',
    heliusWsUrl: process.env.HELIUS_WS_URL || '',
    isDemoMode,
  };
}
