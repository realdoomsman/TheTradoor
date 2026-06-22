// ============================================================
// Transaction Classifier — Separates tax inflows, trades, burns
// ============================================================

import type { HeliusTransaction, TransactionType, AppConfig } from '@/types';

// SOL-equivalent threshold below which a $TRADOOR transfer is classified as tax inflow
const TAX_INFLOW_THRESHOLD_LAMPORTS = 500_000_000; // 0.5 SOL in lamports

// Known burn/incinerator addresses
const KNOWN_BURN_ADDRESSES = [
  '1nc1nerator11111111111111111111111111111111',
  '11111111111111111111111111111111',
];

// Jupiter program ID
const JUPITER_PROGRAM_ID = 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4';

// SPL Token program IDs
const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';

export function classifyTransaction(
  tx: HeliusTransaction,
  config: AppConfig
): TransactionType {
  // 1. Check for BURN — $TRADOOR transfers to burn address or SPL burn instruction
  if (isBurnTransaction(tx, config)) {
    return 'BURN';
  }

  // 2. Check for SWAP — Jupiter or DEX swap
  if (isSwapTransaction(tx)) {
    return 'SWAP';
  }

  // 3. Check for TAX_INFLOW — small $TRADOOR deposits to master wallet
  if (isTaxInflow(tx, config)) {
    return 'TAX_INFLOW';
  }

  // 4. Check for general transfers
  if (tx.tokenTransfers.length > 0 || tx.nativeTransfers.length > 0) {
    return 'TRANSFER';
  }

  return 'UNKNOWN';
}

function isBurnTransaction(tx: HeliusTransaction, config: AppConfig): boolean {
  // Check if any token transfer sends $TRADOOR to a known burn address
  const hasBurnTransfer = tx.tokenTransfers.some(
    (transfer) =>
      transfer.mint === config.tradoorTokenMint &&
      KNOWN_BURN_ADDRESSES.includes(transfer.toUserAccount)
  );

  if (hasBurnTransfer) return true;

  // Check for SPL burn instructions
  const hasBurnInstruction = tx.instructions.some((ix) => {
    if (ix.programId === TOKEN_PROGRAM_ID) {
      // Look for burn instruction in raw data (Helius may not parse all)
      return false; // Enhanced API usually catches this via type field
    }
    return false;
  });

  if (hasBurnInstruction) return true;

  // Check Helius type classification
  if (tx.type === 'BURN' || tx.type === 'TOKEN_BURN') {
    return true;
  }

  return false;
}

function isSwapTransaction(tx: HeliusTransaction): boolean {
  // Check if source is a known DEX
  const DEX_SOURCES = [
    'JUPITER', 'RAYDIUM', 'ORCA', 'PUMP_FUN', 'PUMP_AMM',
    'METEORA', 'MOONSHOT', 'BONKSWAP', 'LIFINITY', 'ALDRIN',
  ];
  if (DEX_SOURCES.includes(tx.source)) {
    return true;
  }

  // Check for Jupiter program in instructions
  const hasJupiterInstruction = tx.instructions.some(
    (ix) => ix.programId === JUPITER_PROGRAM_ID
  );
  if (hasJupiterInstruction) return true;

  // Check for swap events
  if (tx.events?.swap) {
    return true;
  }

  // Check Helius type
  if (tx.type === 'SWAP') {
    return true;
  }

  // Fallback: if source is a DEX-like source and has both SOL + token movement,
  // treat it as a swap even if Helius typed it as UNKNOWN
  if (tx.source.includes('PUMP') || tx.source.includes('SWAP') || tx.source.includes('AMM')) {
    const hasTokenTransfer = tx.tokenTransfers.length > 0;
    const hasNativeTransfer = tx.nativeTransfers.some(t => t.amount > 1_000_000); // > 0.001 SOL
    if (hasTokenTransfer && hasNativeTransfer) return true;
  }

  return false;
}

function isTaxInflow(tx: HeliusTransaction, config: AppConfig): boolean {
  // Look for small $TRADOOR token transfers TO the master wallet
  const tradoorInflows = tx.tokenTransfers.filter(
    (transfer) =>
      transfer.mint === config.tradoorTokenMint &&
      transfer.toUserAccount === config.masterWalletAddress &&
      transfer.fromUserAccount !== config.masterWalletAddress
  );

  if (tradoorInflows.length === 0) return false;

  // Check if the total native transfer value is below threshold
  const totalNativeIn = tx.nativeTransfers
    .filter((t) => t.toUserAccount === config.masterWalletAddress)
    .reduce((sum, t) => sum + t.amount, 0);

  // If native SOL amount is small, it's likely a tax inflow
  if (totalNativeIn < TAX_INFLOW_THRESHOLD_LAMPORTS) {
    return true;
  }

  return false;
}

// Extract swap details from a classified SWAP transaction
export interface SwapDetails {
  direction: 'BUY' | 'SELL';
  tokenMint: string;
  solAmount: number; // in SOL
  tokenAmount: number;
  memo: string | null;
}

export function extractSwapDetails(
  tx: HeliusTransaction,
  config: AppConfig
): SwapDetails | null {
  const WSOL_MINT = 'So11111111111111111111111111111111111111112';

  // Use swap events if available
  if (tx.events?.swap) {
    const swap = tx.events.swap;
    const nativeIn = swap.nativeInput
      ? Number(swap.nativeInput.amount) / 1e9
      : 0;
    const nativeOut = swap.nativeOutput
      ? Number(swap.nativeOutput.amount) / 1e9
      : 0;

    if (nativeIn > 0 && swap.tokenOutputs.length > 0) {
      // SOL -> Token (BUY)
      const output = swap.tokenOutputs[0];
      return {
        direction: 'BUY',
        tokenMint: output.mint,
        solAmount: nativeIn,
        tokenAmount: Number(output.rawTokenAmount.tokenAmount) / Math.pow(10, output.rawTokenAmount.decimals),
        memo: extractMemo(tx),
      };
    }

    if (nativeOut > 0 && swap.tokenInputs.length > 0) {
      // Token -> SOL (SELL)
      const input = swap.tokenInputs[0];
      return {
        direction: 'SELL',
        tokenMint: input.mint,
        solAmount: nativeOut,
        tokenAmount: Number(input.rawTokenAmount.tokenAmount) / Math.pow(10, input.rawTokenAmount.decimals),
        memo: extractMemo(tx),
      };
    }
  }

  // Fallback: analyze token transfers
  const solTransfersOut = tx.nativeTransfers.filter(
    (t) => t.fromUserAccount === config.masterWalletAddress
  );
  const solTransfersIn = tx.nativeTransfers.filter(
    (t) => t.toUserAccount === config.masterWalletAddress
  );
  const tokenTransfersIn = tx.tokenTransfers.filter(
    (t) =>
      t.toUserAccount === config.masterWalletAddress &&
      t.mint !== WSOL_MINT &&
      t.mint !== config.tradoorTokenMint
  );
  const tokenTransfersOut = tx.tokenTransfers.filter(
    (t) =>
      t.fromUserAccount === config.masterWalletAddress &&
      t.mint !== WSOL_MINT &&
      t.mint !== config.tradoorTokenMint
  );

  if (solTransfersOut.length > 0 && tokenTransfersIn.length > 0) {
    const totalSolOut = solTransfersOut.reduce((s, t) => s + t.amount, 0) / 1e9;
    return {
      direction: 'BUY',
      tokenMint: tokenTransfersIn[0].mint,
      solAmount: totalSolOut,
      tokenAmount: tokenTransfersIn[0].tokenAmount,
      memo: extractMemo(tx),
    };
  }

  if (tokenTransfersOut.length > 0 && solTransfersIn.length > 0) {
    const totalSolIn = solTransfersIn.reduce((s, t) => s + t.amount, 0) / 1e9;
    return {
      direction: 'SELL',
      tokenMint: tokenTransfersOut[0].mint,
      solAmount: totalSolIn,
      tokenAmount: tokenTransfersOut[0].tokenAmount,
      memo: extractMemo(tx),
    };
  }

  return null;
}

function extractMemo(tx: HeliusTransaction): string | null {
  // Look for memo program instructions
  const MEMO_PROGRAMS = [
    'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr',
    'Memo1UhkJBfCR1MNqSiManQm92dqWKPmp764DGkyy5Dw',
    'MemoSq4gqABAXybJpSojGzR2YJX843wZz554T3k9dJ1',
  ];

  for (const ix of tx.instructions) {
    if (MEMO_PROGRAMS.includes(ix.programId) && ix.data) {
      try {
        return Buffer.from(ix.data, 'base64').toString('utf-8');
      } catch {
        return ix.data;
      }
    }
  }

  return null;
}

// Extract burn details from a classified BURN transaction
export interface BurnDetails {
  tradoorAmount: number;
  solValueAtBurn: number;
}

export function extractBurnDetails(
  tx: HeliusTransaction,
  config: AppConfig
): BurnDetails | null {
  // Find $TRADOOR transfers to burn address
  const burnTransfers = tx.tokenTransfers.filter(
    (t) =>
      t.mint === config.tradoorTokenMint &&
      KNOWN_BURN_ADDRESSES.includes(t.toUserAccount)
  );

  if (burnTransfers.length > 0) {
    const totalBurned = burnTransfers.reduce((sum, t) => sum + t.tokenAmount, 0);
    // Estimate SOL value from native transfers in the same tx
    const totalNativeSpent = tx.nativeTransfers
      .filter((t) => t.fromUserAccount === config.masterWalletAddress)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      tradoorAmount: totalBurned,
      solValueAtBurn: totalNativeSpent / 1e9,
    };
  }

  return null;
}
