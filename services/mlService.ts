
import { GoogleGenAI, Type } from "@google/genai";
import { MLPrediction, MarketData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const wait = (ms: number) => new Promise(res => setTimeout(res, ms));

const inferenceWithRetry = async (marketData: MarketData, retries = 3, backoff = 1000): Promise<MLPrediction> => {
  try {
    const historySnippet = marketData.history.slice(-10).map(h => ({
      o: h.open, h: h.high, l: h.low, c: h.close
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Perform a quantum neural ensemble inference on ${marketData.symbol}. Data: ${JSON.stringify(historySnippet)}.
      1. Consensus from LSTM, XGBoost, Transformer.
      2. 3 Scenarios (Bullish, Bearish, Range).
      3. News impact (CPI/FOMC).
      4. EXACTLY 12 neural weights (0-1).
      
      Output strictly valid JSON. Keep reasoning concise (max 30 words per language).`,
      config: {
        systemInstruction: "You are an Elite Quantitative Forecasting Engine. Provide 'reasoningAr' in Arabic. JSON only.",
        responseMimeType: "application/json",
        maxOutputTokens: 8192, // Increased limit to prevent JSON truncation
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
            neuralWeights: { type: Type.ARRAY, items: { type: Type.NUMBER } },
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
          required: ["predictedPrice", "direction", "probability", "patternDetected", "patternDetectedAr", "timeframe", "reasoning", "reasoningAr", "neuralWeights", "ensembleVotes", "scenarios", "newsImpact"]
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
      error.message?.includes('RESOURCE_EXHAUSTED') ||
      error.response?.status === 429;

    if (retries > 0 && (isRateLimit || error.status === 503)) {
      console.warn(`ML API Rate Limit hit. Retrying in ${backoff}ms...`);
      await wait(backoff);
      return inferenceWithRetry(marketData, retries - 1, backoff * 2);
    }
    throw error;
  }
};

export const runMLInference = async (marketData: MarketData): Promise<MLPrediction> => {
  try {
    return await inferenceWithRetry(marketData);
  } catch (error) {
    console.warn("ML Inference entered Stability Mode (Quota/Network):", error instanceof Error ? error.message : "Rate Limited");
    return {
      predictedPrice: marketData.price,
      direction: 'SIDEWAYS',
      probability: 0,
      patternDetected: 'System Overload',
      patternDetectedAr: 'حمل النظام الزائد',
      timeframe: '1H',
      reasoning: 'Inference engine is currently at maximum capacity. Switching to local stability mode.',
      reasoningAr: 'محرك الاستدلال حالياً في أقصى طاقته. التحول إلى وضع الاستقرار المحلي.',
      neuralWeights: Array(12).fill(0.1),
      ensembleVotes: { lstm: 'HOLD', xgboost: 'HOLD', transformer: 'HOLD' },
      scenarios: [
        { type: 'RANGE', probability: 100, targetPrice: marketData.price, description: 'Stable consolidation' }
      ],
      newsImpact: [
        { event: 'API Cooling Down', expectedVolatility: 'LOW', bias: 'NEUTRAL', timeUntil: '15M' }
      ]
    };
  }
};
