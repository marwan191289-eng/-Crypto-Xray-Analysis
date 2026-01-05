
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysis, MarketData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const wait = (ms: number) => new Promise(res => setTimeout(res, ms));

const analyzeWithRetry = async (marketData: MarketData, retries = 3, backoff = 1000): Promise<AIAnalysis> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Analyze ${marketData.symbol}/USDT. Price: ${marketData.price}. 24h Change: ${marketData.change24h}%.
      Requirement: Provide a professional forensic trade analysis for institutional traders.
      1. Reasoning must be provided in BOTH Arabic (professional financial terminology) and English.
      2. Provide specific S/R levels.
      3. Signal must be one of: STRONG BUY, BUY, WAIT, SELL, STRONG SELL.
      4. Score and Confidence (0-100).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sentiment: { type: Type.STRING, description: "BULLISH, BEARISH, NEUTRAL" },
            score: { type: Type.NUMBER },
            confidence: { type: Type.NUMBER },
            reasoningEn: { type: Type.STRING, description: "Professional technical analysis in English" },
            reasoningAr: { type: Type.STRING, description: "Professional technical analysis in Arabic using institutional terms" },
            signal: { type: Type.STRING },
            keyLevels: {
              type: Type.OBJECT,
              properties: {
                support: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                resistance: { type: Type.ARRAY, items: { type: Type.NUMBER } }
              },
              required: ["support", "resistance"]
            }
          },
          required: ["sentiment", "score", "confidence", "reasoningEn", "reasoningAr", "keyLevels", "signal"]
        }
      }
    });

    const data = JSON.parse(response.text || '{}') as AIAnalysis;
    return {
      ...data,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  } catch (error: any) {
    if (retries > 0 && (error.status === 429 || error.message?.includes('429'))) {
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
    return {
      sentiment: 'NEUTRAL',
      score: 50,
      confidence: 30,
      reasoningEn: "Analysis temporarily unavailable due to API rate limits.",
      reasoningAr: "التحليل غير متاح مؤقتاً بسبب قيود الخدمة. يرجى المحاولة لاحقاً.",
      signal: 'WAIT',
      keyLevels: { support: [marketData.price * 0.95], resistance: [marketData.price * 1.05] },
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  }
};
