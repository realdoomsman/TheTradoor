// ============================================================
// TheTradoor.fun Terminal — Shared Type Definitions
// ============================================================

// --- Transaction Classification ---
export type TransactionType = 'SWAP' | 'TRANSFER' | 'BURN' | 'TAX_INFLOW' | 'UNKNOWN';
export type TransactionSource = 'JUPITER' | 'RAYDIUM' | 'ORCA' | 'SYSTEM' | 'UNKNOWN';

// --- Trade Models ---
export type TradeAction = 'OPEN' | 'CLOSED';
export type ArchiveTag = 'HIMOTHY' | 'PROFIT' | 'REKT';
export type TradeStatus = 'LIVE' | 'CLOSED';

export interface Trade {
  id: string;
  tokenMint: string;
  tokenSymbol: string;
  tokenName: string | null;
  action: TradeAction;
  entryTimestamp: number;
  entrySolAmount: number;
  entryMarketCap: number | null;
  entryPrice: number | null;
  exitTimestamp: number | null;
  exitSolAmount: number | null;
  exitMarketCap: number | null;
  exitPrice: number | null;
  netPnlSol: number | null;
  roiPercent: number | null;
  holdDurationSec: number | null;
  archiveTag: ArchiveTag | null;
  traderMemo: string | null;
}

export interface LiveTrade extends Trade {
  currentPrice: number;
  currentMarketCap: number;
  currentRoi: number;
  status: 'LIVE';
}

export interface ClosedTrade extends Trade {
  exitTimestamp: number;
  exitSolAmount: number;
  netPnlSol: number;
  roiPercent: number;
  holdDurationSec: number;
  archiveTag: ArchiveTag;
  status: 'CLOSED';
}

// --- Burn Records ---
export interface BurnRecord {
  id: string;
  timestamp: number;
  tradoorAmount: number;
  solValueAtBurn: number;
  usdValueAtBurn: number | null;
  txSignature: string;
  solscanUrl: string;
}

// --- Global Metrics ---
export interface GlobalMetrics {
  totalWalletValueSol: number;
  totalWalletValueUsd: number;
  totalSolProfitGenerated: number;
  lifetimeRoiPercent: number;
  profitFactor: number;
  winRate: number;
  totalTradesClosed: number;
  totalWins: number;
  totalLosses: number;
  totalTradoorBurned: number;
  burnSupplyPercent: number;
  taxInflowRateSolHr: number;
  lastUpdated: string;
}

// --- Wallet Info ---
export interface WalletInfo {
  balanceSol: number;
  balanceUsd: number;
  solPrice: number;
}

// --- API Responses ---
export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  totalPages: number;
  totalCount: number;
}

export interface ApiError {
  error: string;
  message: string;
}

// --- Helius Parsed Transaction Types ---
export interface HeliusTokenTransfer {
  fromUserAccount: string;
  toUserAccount: string;
  fromTokenAccount: string;
  toTokenAccount: string;
  tokenAmount: number;
  mint: string;
  tokenStandard: string;
}

export interface HeliusNativeTransfer {
  fromUserAccount: string;
  toUserAccount: string;
  amount: number;
}

export interface HeliusSwapEvent {
  nativeInput?: { account: string; amount: string };
  nativeOutput?: { account: string; amount: string };
  tokenInputs: Array<{
    userAccount: string;
    tokenAccount: string;
    rawTokenAmount: { tokenAmount: string; decimals: number };
    mint: string;
  }>;
  tokenOutputs: Array<{
    userAccount: string;
    tokenAccount: string;
    rawTokenAmount: { tokenAmount: string; decimals: number };
    mint: string;
  }>;
}

export interface HeliusTransaction {
  signature: string;
  slot: number;
  timestamp: number;
  fee: number;
  feePayer: string;
  description: string;
  type: string;
  source: string;
  tokenTransfers: HeliusTokenTransfer[];
  nativeTransfers: HeliusNativeTransfer[];
  events: {
    swap?: HeliusSwapEvent;
  };
  instructions: Array<{
    programId: string;
    data?: string;
    accounts?: string[];
    innerInstructions?: Array<{
      programId: string;
      data?: string;
      accounts?: string[];
    }>;
  }>;
  accountData: Array<{
    account: string;
    nativeBalanceChange: number;
    tokenBalanceChanges: Array<{
      userAccount: string;
      tokenAccount: string;
      mint: string;
      rawTokenAmount: { tokenAmount: string; decimals: number };
    }>;
  }>;
}

// --- DEXScreener Types ---
export interface DexScreenerPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceNative: string;
  priceUsd: string;
  volume: {
    h24: number;
    h6: number;
    h1: number;
  };
  priceChange: {
    h24: number;
    h6: number;
    h1: number;
  };
  liquidity: {
    usd: number;
    base: number;
    quote: number;
  };
  fdv: number;
  marketCap: number;
  pairCreatedAt: number;
}

// --- SSE Event Types ---
export interface TransactionEvent {
  type: 'new-transaction';
  data: {
    signature: string;
    txType: TransactionType;
    timestamp: number;
    description: string;
  };
}

// --- Config ---
export interface AppConfig {
  masterWalletAddress: string;
  tradoorTokenMint: string;
  burnAddress: string;
  heliusApiKey: string;
  heliusRpcUrl: string;
  heliusWsUrl: string;
  isDemoMode: boolean;
}
