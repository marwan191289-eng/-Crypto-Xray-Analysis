
export interface SystemNode {
  name: string;
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  latency: number;
  load: number;
  details: string;
}

export interface ArchitectureTelemetry {
  api: SystemNode;
  socket: SystemNode;
  database: SystemNode;
  cache: SystemNode;
  uptime: string;
  throughput: string;
}

export interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  history: { 
    time: string; 
    open: number; 
    high: number; 
    low: number; 
    close: number; 
    price: number; 
    volume: number 
  }[];
}

export interface AIScenario {
  type: 'BULLISH' | 'BEARISH' | 'RANGE';
  probability: number;
  targetPrice: number;
  description: string;
}

export interface NewsImpact {
  event: string;
  expectedVolatility: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  bias: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  timeUntil: string;
}

export interface MLPrediction {
  predictedPrice: number;
  direction: 'UP' | 'DOWN' | 'SIDEWAYS';
  probability: number;
  patternDetected: string;
  patternDetectedAr: string;
  timeframe: string;
  reasoning: string;
  reasoningAr: string;
  neuralWeights?: number[];
  ensembleVotes: {
    lstm: 'BUY' | 'SELL' | 'HOLD';
    xgboost: 'BUY' | 'SELL' | 'HOLD';
    transformer: 'BUY' | 'SELL' | 'HOLD';
  };
  scenarios: AIScenario[];
  newsImpact: NewsImpact[];
}

export interface WhaleBearMetrics {
  netflowHistory: { time: string; inflow: number; outflow: number; net: number }[];
  marketCycle: 'ACCUMULATION' | 'MARK-UP' | 'DISTRIBUTION' | 'MARK-DOWN';
  cycleProgress: number; // 0-100
  stopHuntZones: { price: number; volume: number; type: 'LONG_HUNT' | 'SHORT_HUNT' }[];
  whaleSentiment: 'DOMINANT_BUY' | 'NEUTRAL' | 'DOMINANT_SELL';
}

export interface LiquidityFlow {
  cvd: number[];
  volumeImbalance: number; // -100 to 100
  spotFlow: number;
  futuresFlow: number;
  orderBlocks: {
    type: 'BULLISH' | 'BEARISH';
    price: number;
    volume: number;
    mitigated: boolean;
  }[];
  fvg: {
    top: number;
    bottom: number;
    type: 'BISI' | 'SIBI';
  }[];
}

export interface TechnicalMetrics {
  rsi: number;
  macd: { line: number; signal: number; hist: number };
  bollinger: { upper: number; middle: number; lower: number };
  ema20: number;
  ema50: number;
  vwap: number;
  atr: number;
  structure: {
    type: 'BOS' | 'CHoCH' | 'NONE';
    direction: 'BULLISH' | 'BEARISH';
    price: number;
  }[];
  supplyDemand: {
    type: 'SUPPLY' | 'DEMAND';
    priceRange: [number, number];
    strength: number;
  }[];
}

export interface CEXMetrics {
  openInterest: number;
  openInterestChange: number;
  fundingRate: number;
  longShortRatio: number;
  liquidations24h: {
    longs: number;
    shorts: number;
    total: number;
  };
  volatility: number;
}

export interface WhaleTransaction {
  id: string;
  amount: number;
  amountUsd: number;
  from: 'WALLET' | 'EXCHANGE';
  to: 'WALLET' | 'EXCHANGE';
  fromLabel?: string;
  toLabel?: string;
  timestamp: string;
  hash: string;
}

export interface OnChainMetrics {
  exchangeInflow: number;
  exchangeOutflow: number;
  netFlow: number;
  mempoolSize: number;
  activeAddresses24h: number;
  whaleTransactions: WhaleTransaction[];
  coinDaysDestroyed: number;
  dormancy: number;
}

export interface SocialMetrics {
  xSentiment: number;
  redditSentiment: number;
  telegramVolume: number;
  googleTrendsScore: number;
  trendingKeywords: string[];
  socialVolume24h: number;
}

export interface AIAnalysis {
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  score: number;
  confidence: number;
  reasoningEn: string;
  reasoningAr: string;
  keyLevels: { support: number[]; resistance: number[] };
  liquidationZones?: { price: number; volume: number; type: 'LONG' | 'SHORT' }[];
  signal: 'STRONG BUY' | 'BUY' | 'WAIT' | 'SELL' | 'STRONG SELL';
  volatilityIndex?: number;
  timestamp?: string;
  isFallback?: boolean;
}

export interface BlockchainStats {
  ethGasPrice: number;
  btcHashrate: string;
  totalMarketCap: number;
  activeAddresses: number;
  btcDominance?: number;
  globalVolume?: number;
  fearGreed?: {
    value: number;
    label: string;
  };
}

export interface BacktestResult {
  netProfit: number;
  winRate: number;
  totalTrades: number;
  maxDrawdown: number;
  equityCurve: { time: string; balance: number }[];
  trades: { time: string; type: 'BUY' | 'SELL'; price: number; balance: number }[];
}

export type StrategyType = 'SMA_CROSSOVER' | 'RSI_REVERSAL' | 'EMA_TREND' | 'MACD_CROSSOVER' | 'BOLLINGER_BANDS';
