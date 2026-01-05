
import { GoogleGenAI, Type } from "@google/genai";
import { MLPrediction, MarketData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const wait = (ms: number) => new Promise(res => setTimeout(res, ms));

const inferenceWithRetry = async (marketData: MarketData, retries = 3, backoff = 1000): Promise<MLPrediction> => {
  try {
    const historySnippet = marketData.history.slice(-20).map(h => ({
      o: h.open, h: h.high, l: h.low, c: h.close
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Perform a quantum neural ensemble inference on ${marketData.symbol}. Data: ${JSON.stringify(historySnippet)}.
      Requirement: Provide analysis in BOTH Arabic and English.
      1. Get consensus from LSTM, XGBoost, and Transformer agents.
      2. Generate 3 scenarios (Bullish, Bearish, Range) with probability weights.
      3. Predict market reaction to potential news events (CPI, FOMC).
      4. Simulate neural connection weights for visualization.`,
      config: {
        systemInstruction: "You are an Elite Quantitative Forecasting Engine. You MUST provide 'reasoningAr' and 'patternDetectedAr' in professional Arabic financial terminology. Return strictly JSON matching the schema.",
        responseMimeType: "application/json",
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

    return JSON.parse(response.text || '{}') as MLPrediction;
  } catch (error: any) {
    if (retries > 0 && (error.status === 429 || error.message?.includes('429'))) {
      console.warn(`Rate limit hit in ML Inference. Retrying in ${backoff}ms...`);
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
    console.error("ML Inference failed finally:", error);
    return {
      predictedPrice: marketData.price,
      direction: 'SIDEWAYS',
      probability: 0,
      patternDetected: 'Quota Exceeded',
      patternDetectedAr: 'تجاوزت الحصة المسموح بها',
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
