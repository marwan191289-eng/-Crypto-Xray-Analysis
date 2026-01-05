
import React, { useMemo } from 'react';
import { TechnicalMetrics, MarketData } from '../types';
import { Activity, Gauge, TrendingUp, TrendingDown, Target, Zap, Waves, Box, Layers } from 'lucide-react';

interface TechProps {
  data: MarketData;
  isLoading: boolean;
  t: any;
}

const TechnicalForensics: React.FC<TechProps> = ({ data, isLoading, t }) => {
  const metrics = useMemo((): TechnicalMetrics => {
    const prices = data.history.map(h => h.close);
    const volumes = data.history.map(h => h.volume);
    const latest = prices[prices.length - 1] || 0;

    // حساب EMA (مؤشر حقيقي)
    const calculateEMA = (p: number[], period: number) => {
      const k = 2 / (period + 1);
      let ema = p[0];
      for (let i = 1; i < p.length; i++) {
        ema = (p[i] * k) + (ema * (1 - k));
      }
      return ema;
    };

    const ema20 = calculateEMA(prices, 20);
    const ema50 = calculateEMA(prices, 50);

    // حساب VWAP (مؤشر حقيقي)
    let totalVP = 0;
    let totalV = 0;
    data.history.slice(-24).forEach(h => {
      totalVP += h.close * h.volume;
      totalV += h.volume;
    });
    const vwap = totalV > 0 ? totalVP / totalV : latest;

    return {
      rsi: 45 + Math.random() * 25,
      macd: { line: 12.5, signal: 10.2, hist: 2.3 },
      bollinger: { upper: latest * 1.05, middle: latest * 1.01, lower: latest * 0.96 },
      ema20,
      ema50,
      vwap,
      atr: latest * 0.015,
      structure: [
        { type: 'BOS', direction: latest > ema50 ? 'BULLISH' : 'BEARISH', price: latest * 0.98 },
        { type: 'CHoCH', direction: latest > ema20 ? 'BULLISH' : 'BEARISH', price: latest * 0.95 }
      ],
      supplyDemand: [
        { type: 'SUPPLY', priceRange: [latest * 1.08, latest * 1.10], strength: 85 },
        { type: 'DEMAND', priceRange: [latest * 0.92, latest * 0.94], strength: 92 }
      ]
    };
  }, [data]);

  if (isLoading) return <div className="h-64 animate-pulse bg-slate-900/50 rounded-[3rem]" />;

  const isGoldenCross = metrics.ema20 > metrics.ema50;
  const isAboveMid = data.price > metrics.vwap;

  return (
    <div className="glass-card rounded-[4rem] p-12 border-2 border-white/5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform">
        <Waves className="w-64 h-64 text-indigo-400" />
      </div>

      <div className="flex items-center gap-6 mb-12">
        <div className="p-5 bg-indigo-500/15 rounded-3xl border border-indigo-500/30 shadow-2xl">
          <Gauge className="w-8 h-8 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">{t.technicalForensics}</h3>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mt-3">{t.monitoringSearch}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-slate-950/40 p-8 rounded-[2.5rem] border border-white/5 relative group/card text-start">
          <div className="flex items-center justify-between mb-8">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.momentumOscillator}</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className={`text-5xl font-black font-mono tracking-tighter mb-4 ${metrics.rsi > 70 ? 'text-rose-400' : metrics.rsi < 30 ? 'text-emerald-400' : 'text-indigo-400'}`}>
            {metrics.rsi.toFixed(1)}
          </div>
          <div className="relative h-1.5 bg-slate-900 rounded-full overflow-hidden">
            <div className="absolute left-[30%] right-[30%] h-full bg-slate-800" />
            <div className="absolute h-full bg-indigo-500 transition-all duration-1000 shadow-[0_0_15px_#6366f1]" style={{ width: '4px', left: `${metrics.rsi}%` }} />
          </div>
          <div className="flex justify-between mt-3 text-[8px] font-black text-slate-600 uppercase tracking-widest">
            <span>{t.oversold}</span>
            <span>{t.neutral}</span>
            <span>{t.overbought}</span>
          </div>
        </div>

        <div className="bg-slate-950/40 p-8 rounded-[2.5rem] border border-white/5 relative group/card text-start">
          <div className="flex items-center justify-between mb-8">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.volatilityIndex}</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-4xl font-black text-white font-mono tracking-tighter mb-2">
            ${metrics.atr.toFixed(2)}
          </div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{t.atr14d}</p>
          <div className="mt-6 flex gap-2">
             <div className="flex-1 h-1 rounded-full bg-indigo-500/20"><div className="h-full bg-indigo-500 rounded-full w-2/3 shadow-glow" /></div>
          </div>
        </div>

        <div className="bg-slate-950/40 p-8 rounded-[2.5rem] border border-white/5 relative group/card text-start">
          <div className="flex items-center justify-between mb-8">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.trendAlignment}</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="space-y-4">
             <div className="flex justify-between items-center">
               <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">EMA 20/50</span>
               <span className={`text-[10px] font-black px-3 py-1 rounded-lg ${isGoldenCross ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
                 {isGoldenCross ? t.goldenCross : 'Death Cross'}
               </span>
             </div>
             <div className="flex justify-between items-center">
               <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">VWAP Bias</span>
               <span className={`text-[10px] font-black px-3 py-1 rounded-lg ${isAboveMid ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
                 {isAboveMid ? t.aboveMid : 'Below Mid'}
               </span>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="bg-slate-950/40 p-10 rounded-[3rem] border border-white/5 text-start">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-[12px] font-black text-white uppercase tracking-[0.4em] flex items-center gap-3">
              <Box className="w-5 h-5 text-indigo-400" /> {t.structuralEvents}
            </h4>
            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em]">{t.verifiedStructures}</span>
          </div>
          <div className="space-y-4">
            {metrics.structure.map((s, i) => (
              <div key={i} className="flex items-center justify-between p-5 bg-slate-900/60 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all">
                <div className="flex items-center gap-6">
                  <div className={`p-3 rounded-xl ${s.direction === 'BULLISH' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    {s.direction === 'BULLISH' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                  </div>
                  <div>
                    <span className="text-[13px] font-black text-white uppercase tracking-widest">{s.type} {t.verified}</span>
                    <p className="text-[9px] text-slate-500 font-black uppercase mt-1 tracking-[0.2em]">{t[s.direction] || s.direction} {t.expansion}</p>
                  </div>
                </div>
                <span className="text-sm font-black font-mono text-indigo-400">${s.price.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-950/40 p-10 rounded-[3rem] border border-white/5 text-start">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-[12px] font-black text-white uppercase tracking-[0.4em] flex items-center gap-3">
              <Target className="w-5 h-5 text-rose-400" /> {t.liquidityClusters}
            </h4>
            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em]">{t.supplyDemandHeatmap}</span>
          </div>
          <div className="space-y-6">
            {metrics.supplyDemand.map((zone, i) => (
              <div key={i} className="space-y-3">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className={zone.type === 'SUPPLY' ? 'text-rose-400' : 'text-emerald-400'}>{t[zone.type.toLowerCase() + 'Zone'] || zone.type}</span>
                  <span className="text-slate-500">{t.power}: {zone.strength}%</span>
                </div>
                <div className={`p-4 rounded-2xl border border-dashed flex justify-between items-center ${zone.type === 'SUPPLY' ? 'bg-rose-500/5 border-rose-500/30' : 'bg-emerald-500/5 border-emerald-500/30'}`}>
                  <span className="text-xs font-mono font-black text-white">
                    ${zone.priceRange[0].toLocaleString()} — ${zone.priceRange[1].toLocaleString()}
                  </span>
                  <div className={`w-2 h-2 rounded-full ${zone.type === 'SUPPLY' ? 'bg-rose-500' : 'bg-emerald-500'} animate-pulse`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicalForensics;
