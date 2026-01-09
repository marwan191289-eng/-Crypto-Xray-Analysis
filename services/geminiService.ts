
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysis, MarketData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const wait = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- Forensic Calculation Helpers ---

const calculateRSI = (prices: number[], period: number = 14): number => {
  if (prices.length < period + 1) return 50;
  let gains = 0;
  let losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff >= 0) gains += diff; else losses -= diff;
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period + 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    avgGain = (avgGain * (period - 1) + (diff > 0 ? diff : 0)) / period;
    avgLoss = (avgLoss * (period - 1) + (diff < 0 ? -diff : 0)) / period;
  }
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
};

const calculateVolatility = (prices: number[]): number => {
  if (prices.length < 2) return 0;
  // Calculate logarithmic returns for better precision
  const returns = prices.slice(1).map((p, i) => Math.log(p / prices[i]));
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
  return Math.sqrt(variance) * 100; 
};

const analyzeVolumeTrend = (history: any[]): string => {
  if (history.length < 10) return "STABLE";
  const recentVol = history.slice(-3).reduce((acc, h) => acc + h.volume, 0) / 3;
  const avgVol = history.slice(-10).reduce((acc, h) => acc + h.volume, 0) / 10;
  
  if (recentVol > avgVol * 1.5) return "SPIKING (High Activity)";
  if (recentVol > avgVol * 1.1) return "RISING";
  if (recentVol < avgVol * 0.7) return "DECAYING (Low Liquidity)";
  return "STABLE";
};

// -------------------------------------

const analyzeWithRetry = async (marketData: MarketData, retries = 3, backoff = 1000): Promise<AIAnalysis> => {
  // 1. Calculate Forensic Metrics locally
  const closingPrices = marketData.history.map(h => h.close);
  const rsi = calculateRSI(closingPrices);
  const volatility = calculateVolatility(closingPrices);
  const volumeTrend = analyzeVolumeTrend(marketData.history);

  try {
    // 2. Construct Enhanced Context for the AI
    const technicalContext = `
    FORENSIC DATA POINTS:
    - Calculated RSI (14): ${rsi.toFixed(2)}
    - Hourly Realized Volatility: ${volatility.toFixed(3)}%
    - Volume Anomaly Status: ${volumeTrend}
    - 24h Range: ${marketData.low24h} - ${marketData.high24h}
    - Current Price: ${marketData.price}
    `;

    // 3. Prompt Construction
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Analyze ${marketData.symbol}/USDT using the following forensic data:
      ${technicalContext}

      ROLE: You are "BullBearEye TradeXray", an elite institutional trading algorithm.

      TASK: Provide a deep forensic trade analysis focusing on hidden market mechanics.
      
      MANDATORY FORENSIC INDICATORS TO DISCUSS IN REASONING:
      1. **Order Book Imbalance**: Infer buy/sell wall pressure based on the price proximity to 24h highs/lows and volatility.
      2. **CVD Divergence (Cumulative Volume Delta)**: Analyze if volume trends (Rising/Decaying) confirm or contradict the price action.
      3. **Volatility Spikes**: Interpret the volatility score. Is it a breakout precursor or noise?
      4. **Liquidation Clusters**: Identify high-leverage liquidation clusters (Long/Short) with estimated volume.
      
      OUTPUT REQUIREMENTS:
      1. **Reasoning**: Must be provided in BOTH Arabic (using professional financial terminology like "السيولة", "الفجوة السعرية", "زخم") and English.
      2. **Key Levels**: Specific Support/Resistance vectors.
      3. **Liquidation Zones**: Top 3 critical price levels where liquidations are likely, including type (LONG/SHORT) and volume estimates.
      4. **Signal**: ONE of: STRONG BUY, BUY, WAIT, SELL, STRONG SELL.
      5. **Scores**: Sentiment, Score (0-100), Confidence (0-100).`,
      config: {
        responseMimeType: "application/json",
        maxOutputTokens: 8192, // Increased limit to prevent JSON truncation
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentiment: { type: Type.STRING, description: "BULLISH, BEARISH, NEUTRAL" },
            score: { type: Type.NUMBER },
            confidence: { type: Type.NUMBER },
            reasoningEn: { type: Type.STRING, description: "Professional technical analysis in English including Order Book, CVD, and Volatility insights." },
            reasoningAr: { type: Type.STRING, description: "Professional technical analysis in Arabic including Order Book, CVD, and Volatility insights." },
            signal: { type: Type.STRING },
            keyLevels: {
              type: Type.OBJECT,
              properties: {
                support: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                resistance: { type: Type.ARRAY, items: { type: Type.NUMBER } }
              },
              required: ["support", "resistance"]
            },
            liquidationZones: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  price: { type: Type.NUMBER },
                  volume: { type: Type.NUMBER },
                  type: { type: Type.STRING, description: "LONG or SHORT" }
                }
              }
            }
          },
          required: ["sentiment", "score", "confidence", "reasoningEn", "reasoningAr", "keyLevels", "liquidationZones", "signal"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");

    const data = JSON.parse(text) as AIAnalysis;
    return {
      ...data,
      volatilityIndex: volatility, // Inject calculated volatility
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isFallback: false
    };
  } catch (error: any) {
    // Robust rate limit detection
    const isRateLimit = 
      error.status === 429 || 
      error.code === 429 ||
      error.message?.includes('429') || 
      error.message?.includes('quota') || 
      error.message?.includes('RESOURCE_EXHAUSTED') ||
      error.response?.status === 429;

    if (retries > 0 && (isRateLimit || error.status === 503)) {
      console.warn(`Gemini API Rate Limit hit. Retrying in ${backoff}ms...`);
      await wait(backoff);
      return analyzeWithRetry(marketData, retries - 1, backoff * 2);
    }
    throw error;
  }
};

export const analyzeMarket = async (marketData: MarketData): Promise<AIAnalysis> => {
  try {
    return await analyzeWithRetry(marketData);
  } catch (error) {
    // Log as warning instead of error to not alarm users in console
    console.warn("AI Analysis entered Fallback Mode (Quota/Network):", error instanceof Error ? error.message : "Rate Limited");
    
    // Recalculate local metrics for fallback
    const closingPrices = marketData.history.map(h => h.close);
    const volatility = calculateVolatility(closingPrices);
    
    return {
      sentiment: 'NEUTRAL',
      score: 50,
      confidence: 30,
      reasoningEn: "Forensic analysis temporarily unavailable due to high network load. Displaying calculated technical fallback data based on local indicators.",
      reasoningAr: "التحليل الجنائي غير متاح مؤقتاً بسبب ضغط الشبكة. يتم عرض البيانات الفنية المحسوبة محلياً بناءً على المؤشرات المتاحة.",
      signal: 'WAIT',
      volatilityIndex: volatility,
      keyLevels: { support: [marketData.price * 0.95], resistance: [marketData.price * 1.05] },
      liquidationZones: [
        { price: marketData.price * 1.02, volume: 500000, type: 'SHORT' },
        { price: marketData.price * 0.98, volume: 450000, type: 'LONG' }
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isFallback: true
    };
  }
};
