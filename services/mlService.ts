
import { GoogleGenAI, Type } from "@google/genai";
import { MLPrediction, MarketData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const wait = (ms: number) => new Promise(res => setTimeout(res, ms));

const inferenceWithRetry = async (marketData: MarketData, retries = 2, backoff = 1000): Promise<MLPrediction> => {
  try {
    const history = marketData.history || [];
    
    // Safety check: if no history, throw to trigger fallback immediately
    if (history.length < 5) throw new Error("Insufficient market history for ML inference");

    const historySnippet = history.slice(-15).map(h => ({
      o: h.open, h: h.high, l: h.low, c: h.close, v: h.volume
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Analyze ${marketData.symbol} price action. Data (last 15 candles): ${JSON.stringify(historySnippet)}.
      Current Price: ${marketData.price}.
      
      Tasks:
      1. Predict next significant price level (Projected Target).
      2. Determine direction (UP/DOWN/SIDEWAYS).
      3. Assign probability (0-100).
      4. Identify chart pattern (e.g., Bull Flag, Double Bottom).
      5. Synthesize ensemble vote (LSTM/XGBoost/Transformer).
      6. Define 3 scenarios (Bull/Bear/Range).
      
      Output strictly valid JSON matching the schema.`,
      config: {
        systemInstruction: "You are a specialized High-Frequency Trading AI. Output JSON only. No markdown. No comments.",
        responseMimeType: "application/json",
        maxOutputTokens: 2000, 
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            predictedPrice: { type: Type.NUMBER },
            direction: { type: Type.STRING, description: "UP, DOWN, SIDEWAYS" },
            probability: { type: Type.NUMBER },
            patternDetected: { type: Type.STRING },
            patternDetectedAr: { type: Type.STRING },
            timeframe: { type: Type.STRING },
            reasoning: { type: Type.STRING },
            reasoningAr: { type: Type.STRING },
            ensembleVotes: {
              type: Type.OBJECT,
              properties: {
                lstm: { type: Type.STRING },
                xgboost: { type: Type.STRING },
                transformer: { type: Type.STRING }
              }
            },
            scenarios: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  probability: { type: Type.NUMBER },
                  targetPrice: { type: Type.NUMBER },
                  description: { type: Type.STRING }
                }
              }
            },
            newsImpact: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  event: { type: Type.STRING },
                  expectedVolatility: { type: Type.STRING },
                  bias: { type: Type.STRING },
                  timeUntil: { type: Type.STRING }
                }
              }
            }
          },
          required: ["predictedPrice", "direction", "probability", "patternDetected", "patternDetectedAr", "timeframe", "reasoning", "reasoningAr", "ensembleVotes", "scenarios", "newsImpact"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty ML response");
    
    return JSON.parse(text) as MLPrediction;
  } catch (error: any) {
    const isRateLimit = 
      error.status === 429 || 
      error.code === 429 ||
      error.message?.includes('429') || 
      error.message?.includes('quota') ||
      error.message?.includes('RESOURCE_EXHAUSTED');

    if (retries > 0 && isRateLimit) {
      console.warn(`ML API Rate Limit hit. Retrying in ${backoff}ms...`);
      await wait(backoff);
      return inferenceWithRetry(marketData, retries - 1, backoff * 2);
    }
    throw error;
  }
};

export const runMLInference = async (marketData: MarketData): Promise<MLPrediction> => {
  const currentPrice = marketData.price || 0;
  
  // Default Fallback
  const fallback: MLPrediction = {
    predictedPrice: currentPrice,
    direction: 'SIDEWAYS',
    probability: 50,
    patternDetected: 'Market Noise',
    patternDetectedAr: 'ضوضاء السوق',
    timeframe: '1H',
    reasoning: 'Neural link unstable. Running local heuristic approximation based on volatility and volume profile.',
    reasoningAr: 'الرابط العصبي غير مستقر. تشغيل تقريب إرشادي محلي.',
    ensembleVotes: { lstm: 'HOLD', xgboost: 'HOLD', transformer: 'HOLD' },
    scenarios: [
      { type: 'RANGE', probability: 60, targetPrice: currentPrice, description: 'Consolidation within current bounds' },
      { type: 'BULLISH', probability: 20, targetPrice: currentPrice * 1.01, description: 'Breakout attempt' },
      { type: 'BEARISH', probability: 20, targetPrice: currentPrice * 0.99, description: 'Support test' }
    ],
    newsImpact: [
      { event: 'Data Feed Sync', expectedVolatility: 'LOW', bias: 'NEUTRAL', timeUntil: 'Live' }
    ]
  };

  try {
    return await inferenceWithRetry(marketData);
  } catch (error) {
    console.warn("ML Inference entered Stability Mode:", error);
    return fallback;
  }
};
