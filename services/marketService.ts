
import { MarketData, BlockchainStats, CEXMetrics, OnChainMetrics, WhaleTransaction, SocialMetrics, WhaleBearMetrics } from '../types';

const BINANCE_BASE = 'https://api.binance.com/api/v3';
const BINANCE_FUTURES_BASE = 'https://fapi.binance.com/fapi/v1';

export const fetchMarketData = async (symbol: string): Promise<Partial<MarketData>> => {
  try {
    const tickerResponse = await fetch(`${BINANCE_BASE}/ticker/24hr?symbol=${symbol}USDT`);
    const ticker = await tickerResponse.json();
    return {
      symbol: symbol,
      price: parseFloat(ticker.lastPrice),
      change24h: parseFloat(ticker.priceChangePercent),
      high24h: parseFloat(ticker.highPrice),
      low24h: parseFloat(ticker.lowPrice),
      volume24h: parseFloat(ticker.quoteVolume)
    };
  } catch (error) {
    console.error(`Failed to fetch Binance data for ${symbol}:`, error);
    return {};
  }
};

export const fetchWhaleBearMetrics = async (symbol: string, price: number): Promise<WhaleBearMetrics> => {
  const history = Array.from({ length: 12 }, (_, i) => {
    const bias = Math.sin(i * 0.5); 
    const inflow = (Math.random() * 20000000) + (bias > 0 ? bias * 10000000 : 0);
    const outflow = (Math.random() * 20000000) + (bias < 0 ? Math.abs(bias) * 12000000 : 0);
    return {
      time: `${11 - i}H`,
      inflow,
      outflow,
      net: inflow - outflow
    };
  });
  const avgNet = history.reduce((acc, curr) => acc + curr.net, 0) / history.length;
  let cycle: any = 'ACCUMULATION';
  if (avgNet > 5000000) cycle = 'MARK-UP';
  else if (avgNet < -5000000) cycle = 'DISTRIBUTION';
  else if (Math.random() > 0.8) cycle = 'MARK-DOWN';

  return {
    netflowHistory: history,
    marketCycle: cycle,
    cycleProgress: 45 + Math.random() * 40,
    stopHuntZones: [
      { price: price * 0.985, volume: 4500, type: 'LONG_HUNT' },
      { price: price * 1.015, volume: 3800, type: 'SHORT_HUNT' }
    ],
    whaleSentiment: avgNet > 0 ? 'DOMINANT_BUY' : 'DOMINANT_SELL'
  };
};

export const fetchOnChainMetrics = async (symbol: string): Promise<OnChainMetrics> => {
  const generateWhaleTx = (): WhaleTransaction => {
    const amount = 50 + Math.random() * 500;
    const isExchangeFrom = Math.random() > 0.6;
    const isExchangeTo = !isExchangeFrom && Math.random() > 0.3;
    return {
      id: Math.random().toString(36).substring(7),
      amount: amount,
      amountUsd: amount * (symbol === 'BTC' ? 95000 : 3500),
      from: isExchangeFrom ? 'EXCHANGE' : 'WALLET',
      to: isExchangeTo ? 'EXCHANGE' : 'WALLET',
      fromLabel: isExchangeFrom ? 'Binance' : 'Whale Entity',
      toLabel: isExchangeTo ? 'Coinbase' : 'Cold Storage',
      timestamp: new Date().toLocaleTimeString(),
      hash: '0x' + Math.random().toString(16).substring(2, 10) + '...'
    };
  };
  const inflow = Math.random() * 50000000;
  const outflow = Math.random() * 48000000;
  return {
    exchangeInflow: inflow,
    exchangeOutflow: outflow,
    netFlow: inflow - outflow,
    mempoolSize: 15000 + Math.floor(Math.random() * 10000),
    activeAddresses24h: 850000 + Math.floor(Math.random() * 200000),
    whaleTransactions: Array.from({ length: 5 }, generateWhaleTx),
    coinDaysDestroyed: 1200000 + Math.random() * 500000,
    dormancy: 0.5 + Math.random() * 0.8
  };
};

export const fetchSocialMetrics = async (symbol: string): Promise<SocialMetrics> => {
  const keywords = ['Accumulation', 'Breakout', 'Bullish', 'FOMO', 'HODL', 'Liquidity', 'Mainnet', 'Mooon', 'Pump', 'Reversal'];
  return {
    xSentiment: 45 + Math.random() * 40,
    redditSentiment: 50 + Math.random() * 35,
    telegramVolume: 1200 + Math.floor(Math.random() * 5000),
    googleTrendsScore: 30 + Math.floor(Math.random() * 70),
    trendingKeywords: keywords.sort(() => 0.5 - Math.random()).slice(0, 4),
    socialVolume24h: 15000 + Math.floor(Math.random() * 100000)
  };
};

export const fetchCEXMetrics = async (symbol: string): Promise<CEXMetrics> => {
  try {
    const [oiRes, fundingRes] = await Promise.all([
      fetch(`${BINANCE_FUTURES_BASE}/openInterest?symbol=${symbol}USDT`).catch(() => null),
      fetch(`${BINANCE_FUTURES_BASE}/premiumIndex?symbol=${symbol}USDT`).catch(() => null)
    ]);
    const oiData = oiRes ? await oiRes.json() : { openInterest: "0" };
    const fundingData = fundingRes ? await fundingRes.json() : { lastFundingRate: "0.0001" };
    const baseOI = parseFloat(oiData.openInterest) || (Math.random() * 500000000);
    return {
      openInterest: baseOI,
      openInterestChange: (Math.random() - 0.5) * 5,
      fundingRate: parseFloat(fundingData.lastFundingRate) * 100,
      longShortRatio: 1.2 + (Math.random() - 0.5) * 0.8,
      liquidations24h: {
        longs: Math.random() * 1000000,
        shorts: Math.random() * 1000000,
        total: Math.random() * 2000000
      },
      volatility: 1.5 + Math.random() * 2.5
    };
  } catch (error) {
    return { openInterest: 0, openInterestChange: 0, fundingRate: 0.01, longShortRatio: 1.0, liquidations24h: { longs: 0, shorts: 0, total: 0 }, volatility: 0 };
  }
};

export const fetchHistory = async (symbol: string, interval: string = '1h', limit: number = 60) => {
  try {
    const response = await fetch(`${BINANCE_BASE}/klines?symbol=${symbol}USDT&interval=${interval}&limit=${limit}`);
    const data = await response.json();
    return data.map((d: any) => ({
      time: new Date(d[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      open: parseFloat(d[1]),
      high: parseFloat(d[2]),
      low: parseFloat(d[3]),
      close: parseFloat(d[4]),
      price: parseFloat(d[4]), 
      volume: parseFloat(d[5]),
      timestamp: d[0] // Added raw timestamp for better sorting/keying
    }));
  } catch (error) {
    console.error(`Failed to fetch history for ${symbol}:`, error);
    return [];
  }
};

export const fetchBlockchainStats = async (): Promise<Partial<BlockchainStats>> => {
  const jitter = (base: number, pct: number) => base * (1 + (Math.random() - 0.5) * pct);
  
  let fgValue = Math.floor(jitter(50, 0.1));
  let fgLabel = 'Neutral';
  let gasPrice = Math.floor(jitter(15, 0.2));
  let totalCap = jitter(2.85, 0.01);
  let globalVol = jitter(85.4, 0.05);
  let btcDom = jitter(58.2, 0.005);

  try {
    const fgResponse = await fetch('https://api.alternative.me/fng/?limit=1');
    if (fgResponse.ok) {
      const fgData = await fgResponse.json();
      if (fgData.data && fgData.data[0]) {
        fgValue = parseInt(fgData.data[0].value);
        fgLabel = fgData.data[0].value_classification;
      }
    }
  } catch (e) { console.warn("F&G stream unavailable, using fallback."); }

  try {
    const globalResponse = await fetch('https://api.coingecko.com/api/v3/global');
    if (globalResponse.ok) {
      const gData = await globalResponse.json();
      if (gData.data) {
        totalCap = gData.data.total_market_cap.usd / 1e12;
        globalVol = gData.data.total_volume.usd / 1e9;
        btcDom = gData.data.market_cap_percentage.btc;
      }
    }
  } catch (e) { console.warn("CoinGecko Global stream unavailable, using fallback."); }

  if (fgLabel === 'Neutral') {
      if (fgValue > 75) fgLabel = 'Extreme Greed';
      else if (fgValue > 55) fgLabel = 'Greed';
      else if (fgValue < 25) fgLabel = 'Extreme Fear';
      else if (fgValue < 45) fgLabel = 'Fear';
  }

  return { 
    ethGasPrice: gasPrice, 
    totalMarketCap: totalCap, 
    activeAddresses: 1280000 + Math.floor(Math.random() * 60000),
    btcDominance: btcDom,
    globalVolume: globalVol,
    fearGreed: { value: fgValue, label: fgLabel } 
  };
};
