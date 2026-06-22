-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "signature" TEXT NOT NULL,
    "blockTime" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "feeLamports" INTEGER NOT NULL,
    "memo" TEXT,
    "rawJson" TEXT NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Trade" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tokenMint" TEXT NOT NULL,
    "tokenSymbol" TEXT NOT NULL,
    "tokenName" TEXT,
    "action" TEXT NOT NULL,
    "entryTxId" TEXT,
    "entryTimestamp" INTEGER NOT NULL,
    "entrySolAmount" REAL NOT NULL,
    "entryMarketCap" REAL,
    "entryPrice" REAL,
    "exitTxId" TEXT,
    "exitTimestamp" INTEGER,
    "exitSolAmount" REAL,
    "exitMarketCap" REAL,
    "exitPrice" REAL,
    "netPnlSol" REAL,
    "roiPercent" REAL,
    "holdDurationSec" INTEGER,
    "archiveTag" TEXT,
    "traderMemo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Trade_entryTxId_fkey" FOREIGN KEY ("entryTxId") REFERENCES "Transaction" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Trade_exitTxId_fkey" FOREIGN KEY ("exitTxId") REFERENCES "Transaction" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Burn" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transactionId" TEXT NOT NULL,
    "timestamp" INTEGER NOT NULL,
    "tradoorAmount" REAL NOT NULL,
    "solValueAtBurn" REAL NOT NULL,
    "usdValueAtBurn" REAL,
    "jupiterRouteJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Burn_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TaxInflow" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transactionId" TEXT NOT NULL,
    "timestamp" INTEGER NOT NULL,
    "solAmount" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TaxInflow_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GlobalMetrics" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "totalWalletValueSol" REAL NOT NULL DEFAULT 0,
    "totalWalletValueUsd" REAL NOT NULL DEFAULT 0,
    "totalSolProfitGenerated" REAL NOT NULL DEFAULT 0,
    "lifetimeRoiPercent" REAL NOT NULL DEFAULT 0,
    "profitFactor" REAL NOT NULL DEFAULT 0,
    "winRate" REAL NOT NULL DEFAULT 0,
    "totalTradesClosed" INTEGER NOT NULL DEFAULT 0,
    "totalWins" INTEGER NOT NULL DEFAULT 0,
    "totalLosses" INTEGER NOT NULL DEFAULT 0,
    "totalTradoorBurned" REAL NOT NULL DEFAULT 0,
    "burnSupplyPercent" REAL NOT NULL DEFAULT 0,
    "taxInflowRateSolHr" REAL NOT NULL DEFAULT 0,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_signature_key" ON "Transaction"("signature");

-- CreateIndex
CREATE UNIQUE INDEX "Trade_entryTxId_key" ON "Trade"("entryTxId");

-- CreateIndex
CREATE UNIQUE INDEX "Trade_exitTxId_key" ON "Trade"("exitTxId");

-- CreateIndex
CREATE UNIQUE INDEX "Burn_transactionId_key" ON "Burn"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "TaxInflow_transactionId_key" ON "TaxInflow"("transactionId");
