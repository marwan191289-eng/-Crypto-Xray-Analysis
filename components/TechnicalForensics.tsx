import React, { useMemo, useState, useEffect } from 'react';
import { MarketData } from '../types';
import { 
  Activity, Gauge, TrendingUp, TrendingDown, Target, Zap, 
  Waves, Layers, Scan, Crosshair, BarChart2, GitCommit, 
  ArrowUpRight, ArrowDownRight, Minus, Microscope,
  CircuitBoard, Binary, Share2, AlignCenter
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  ReferenceLine, ComposedChart, Bar, Line, Cell, Scatter, BarChart
} from 'recharts';

interface TechProps {
  data: MarketData;
  isLoading: boolean;
  t: any;
}

// --- Technical Analysis Engines ---
const calculateRSI = (prices: number[], period = 14) => {
  if (prices.length < period + 1) return { value: 50, history: [] };
  
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff >= 0) gains += diff; else losses -= diff;
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;

  const rsiHistory = [];

  for (let i = period + 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    avgGain = (avgGain * (period - 1) + (diff > 0 ? diff : 0)) / period;
    avgLoss = (avgLoss * (period - 1) + (diff < 0 ? -diff : 0)) / period;
    
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));
    rsiHistory.push({ time: i, value: rsi });
  }

  return { 
    value: rsiHistory[rsiHistory.length - 1]?.value || 50, 
    history: rsiHistory.slice(-30) 
  };
};

const calculateMACD = (prices: number[]) => {
  const ema = (data: number[], period: number) => {
    const k = 2 / (period + 1);
    let curr = data[0];
    const res = [curr];
    for(let i=1; i<data.length; i++) {
      curr = (data[i] * k) + (curr * (1 - k));
      res.push(curr);
    }
    return res;
  };

  const ema12 = ema(prices, 12);
  const ema26 = ema(prices, 26);
  const macdLine = ema12.map((v, i) => v - ema26[i]);
  const signalLine = ema(macdLine, 9);
  const histogram = macdLine.map((v, i) => v - signalLine[i]);

  const history = macdLine.slice(-30).map((_, i) => {
    const idx = macdLine.length - 30 + i;
    return {
      time: i,
      macd: macdLine[idx],
      signal: signalLine[idx],
      hist: histogram[idx]
    };
  });

  return {
    value: macdLine[macdLine.length - 1],
    signal: signalLine[signalLine.length - 1],
    hist: histogram[histogram.length - 1],
    history
  };
};

const calculateBollinger = (prices: number[], period = 20) => {
  const slice = prices.slice(-period);
  const mean = slice.reduce((a,b) => a+b, 0) / period;
  const variance = slice.reduce((a,b) => a + Math.pow(b - mean, 2), 0) / period;
  const stdDev = Math.sqrt(variance);
  return {
    upper: mean + (2 * stdDev),
    middle: mean,
    lower: mean - (2 * stdDev),
    bandwidth: ((mean + 2*stdDev) - (mean - 2*stdDev)) / mean
  };
};

const TechnicalForensics: React.FC<TechProps> = ({ data, isLoading, t }) => {
  // Live Simulation State
  const [livePrice, setLivePrice] = useState(data.price);
  const [activeFrame, setActiveFrame] = useState(0);
  const [phasePulse, setPhasePulse] = useState(0);

  // Simulate Live Price & Structure Updates
  useEffect(() => {
    if (data.price) setLivePrice(data.price);
    
    const interval = setInterval(() => {
      setLivePrice(prev => prev * (1 + (Math.random() - 0.5) * 0.0005));
      setActiveFrame(prev => (prev + 1) % 60); // 60 frame cycle
      setPhasePulse(prev => (prev + 5) % 100);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [data.price]);

  const metrics = useMemo(() => {
    if (!data.history || data.history.length < 30) return null;

    const prices = data.history.map(h => h.close);
    // Inject live price into calculations for responsiveness
    const livePrices = [...prices.slice(1), livePrice];
    
    const highs = data.history.map(h => h.high);
    const lows = data.history.map(h => h.low);
    const latestPrice = livePrices[livePrices.length - 1];

    const rsi = calculateRSI(livePrices);
    const macd = calculateMACD(livePrices);
    const bb = calculateBollinger(livePrices);
    
    // VWAP
    let cumVol = 0;
    let cumVolPrice = 0;
    data.history.forEach(h => {
      const typical = (h.high + h.low + h.close) / 3;
      cumVol += h.volume;
      cumVolPrice += typical * h.volume;
    });
    const vwap = cumVolPrice / cumVol;

    // Structural Analysis
    const isImpulse = Math.abs(latestPrice - vwap) > (latestPrice * 0.005);
    const trendDir = latestPrice > vwap ? 'BULLISH' : 'BEARISH';
    const phase = isImpulse ? 'EXPANSION' : 'RETRACEMENT';

    // Simulated Multi-Timeframe Alignment (Randomized for demo dynamics based on trend)
    const ltf = trendDir === 'BULLISH' ? Math.random() > 0.3 : Math.random() < 0.3;
    const mtf = trendDir === 'BULLISH' ? Math.random() > 0.2 : Math.random() < 0.2;
    const htf = trendDir === 'BULLISH' ? Math.random() > 0.4 : Math.random() < 0.4;
    const alignmentScore = (ltf ? 1 : 0) + (mtf ? 1 : 0) + (htf ? 1 : 0);

    return {
      rsi,
      macd,
      bb,
      vwap,
      trend: trendDir,
      phase,
      alignment: { ltf, mtf, htf, score: alignmentScore },
      pivots: {
        r1: latestPrice * 1.015,
        s1: latestPrice * 0.985
      },
      latestPrice
    };
  }, [data, livePrice]);

  if (isLoading || !metrics) return (
    <div className="bg-slate-950/40 rounded-[4rem] p-12 border border-white/5 animate-pulse min-h-[500px]">
       <div className="flex items-center gap-4 mb-12">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl"></div>
          <div className="w-64 h-8 bg-slate-800 rounded-xl"></div>
       </div>
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-96 bg-slate-800 rounded-[3rem]"></div>
          <div className="h-96 bg-slate-800 rounded-[3rem]"></div>
       </div>
    </div>
  );

  const rsiColor = metrics.rsi.value > 70 ? '#f43f5e' : metrics.rsi.value < 30 ? '#10b981' : '#6366f1';
  const phaseColor = metrics.phase === 'EXPANSION' ? (metrics.trend === 'BULLISH' ? 'text-emerald-400' : 'text-rose-400') : 'text-amber-400';
  const phaseBg = metrics.phase === 'EXPANSION' ? (metrics.trend === 'BULLISH' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30') : 'bg-amber-500/10 border-amber-500/30';

  return (
    <div className="cyber-card rounded-[4rem] p-12 border border-white/5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform">
        <Microscope className="w-64 h-64 text-indigo-400" />
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 relative z-10">
        <div className="flex items-center gap-6">
          <div className="p-5 bg-indigo-500/10 rounded-3xl border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.15)] relative">
            <Scan className="w-8 h-8 text-indigo-400 relative z-10" />
            <div className="absolute inset-0 bg-indigo-500/20 blur-xl animate-pulse"></div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">{t.technicalForensics}</h3>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mt-3 flex items-center gap-2">
              <GitCommit className="w-3 h-3" /> Structural Phase Logic v2.4
            </p>
          </div>
        </div>
        
        <div className="flex gap-4">
           <div className={`px-6 py-3 rounded-2xl border flex items-center gap-4 transition-all duration-1000 ${phaseBg}`}>
              <div className="relative">
                 <Activity className={`w-5 h-5 ${phaseColor}`} />
                 <div className={`absolute inset-0 ${phaseColor} blur-lg opacity-50 animate-pulse`}></div>
              </div>
              <div>
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-0.5">Structural Phase</span>
                 <span className={`text-xs font-black uppercase tracking-widest ${phaseColor} animate-pulse`}>{metrics.trend} {metrics.phase}</span>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 relative z-10">
        
        {/* COL 1: Structural Phase Engine (Enhanced) */}
        <div className="xl:col-span-7 flex flex-col gap-8">
           
           {/* Structure Hologram */}
           <div className="bg-slate-950/40 p-10 rounded-[3.5rem] border border-white/5 relative overflow-hidden group/holo min-h-[400px] flex flex-col">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/holo:opacity-10 transition-opacity">
                 <Layers className="w-40 h-40 text-white" />
              </div>
              
              <div className="flex justify-between items-start mb-8 relative z-10">
                 <div className="flex items-center gap-4">
                    <Crosshair className="w-5 h-5 text-indigo-400 animate-[spin_10s_linear_infinite]" />
                    <span className="text-[12px] font-black text-white uppercase tracking-[0.4em]">Forensic Structure Scan</span>
                 </div>
                 <div className="flex gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></div>
                    <span className="text-[9px] font-mono font-bold text-indigo-400">LIVE FEED</span>
                 </div>
              </div>

              {/* Dynamic Structure Visualizer */}
              <div className="flex-1 relative w-full bg-slate-900/30 rounded-3xl border border-white/5 overflow-hidden p-6 flex flex-col justify-center items-center">
                 {/* Grid Lines */}
                 <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                 
                 {/* Central Phase Orb */}
                 <div className="relative z-10 flex flex-col items-center">
                    <div className={`w-32 h-32 rounded-full border-2 flex items-center justify-center relative transition-all duration-1000 ${metrics.phase === 'EXPANSION' ? 'border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.2)]' : 'border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.2)]'}`}>
                       <div className={`absolute inset-2 rounded-full border border-dashed opacity-50 animate-[spin_20s_linear_infinite] ${metrics.phase === 'EXPANSION' ? 'border-emerald-400' : 'border-amber-400'}`}></div>
                       <div className={`absolute inset-0 rounded-full opacity-20 animate-pulse ${metrics.phase === 'EXPANSION' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                       
                       <div className="text-center">
                          <span className={`text-4xl font-black font-mono tracking-tighter block ${metrics.phase === 'EXPANSION' ? 'text-emerald-400' : 'text-amber-400'}`}>
                             {metrics.phase === 'EXPANSION' ? 'IMP' : 'COR'}
                          </span>
                          <span className="text-[8px] font-black uppercase tracking-widest text-white/50">Mode</span>
                       </div>
                    </div>
                    
                    {/* Live Structure DNA Strip */}
                    <div className="mt-8 flex items-center gap-1">
                       {Array.from({length: 12}).map((_, i) => (
                          <div 
                             key={i}
                             className={`h-8 w-2 rounded-sm transition-all duration-300 ${i === Math.floor(activeFrame / 5) ? 'scale-y-150 bg-white shadow-glow' : 'bg-slate-800/50'}`}
                             style={{ opacity: 1 - (i * 0.05) }}
                          />
                       ))}
                    </div>
                    <span className="mt-2 text-[9px] font-black text-slate-500 uppercase tracking-[0.5em] animate-pulse">Processing Structure...</span>
                 </div>

                 {/* Floating Labels */}
                 <div className="absolute top-4 left-4">
                    <span className="text-[9px] font-bold text-slate-600 uppercase block">Swing High</span>
                    <span className="text-xs font-mono text-white">${(metrics.latestPrice * 1.005).toFixed(2)}</span>
                 </div>
                 <div className="absolute bottom-4 right-4 text-right">
                    <span className="text-[9px] font-bold text-slate-600 uppercase block">Swing Low</span>
                    <span className="text-xs font-mono text-white">${(metrics.latestPrice * 0.995).toFixed(2)}</span>
                 </div>
              </div>
           </div>

           {/* Fractal Alignment Matrix */}
           <div className="bg-slate-950/40 p-8 rounded-[3rem] border border-white/5 relative overflow-hidden flex items-center justify-between shadow-lg">
              <div className="flex flex-col gap-2">
                 <h4 className="text-[11px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-2">
                    <CircuitBoard className="w-4 h-4 text-accent" /> Fractal Alignment
                 </h4>
                 <div className="flex items-center gap-2">
                    <div className={`h-1.5 rounded-full transition-all duration-1000 ${metrics.alignment.score === 3 ? 'w-24 bg-emerald-500' : metrics.alignment.score === 0 ? 'w-24 bg-rose-500' : 'w-12 bg-amber-500'}`}></div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                       {metrics.alignment.score === 3 ? 'FULL SYNC' : metrics.alignment.score === 0 ? 'FULL SYNC' : 'MIXED'}
                    </span>
                 </div>
              </div>

              <div className="flex gap-6">
                 {[
                    { label: 'LTF 5m', active: metrics.alignment.ltf },
                    { label: 'MTF 1H', active: metrics.alignment.mtf },
                    { label: 'HTF 4H', active: metrics.alignment.htf }
                 ].map((tf, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 group/tf">
                       <div className={`w-3 h-3 rounded-full shadow-[0_0_10px_currentColor] transition-all duration-500 ${tf.active ? (metrics.trend === 'BULLISH' ? 'bg-emerald-500 text-emerald-500' : 'bg-rose-500 text-rose-500') : 'bg-slate-700 text-slate-700'}`}></div>
                       <span className={`text-[9px] font-black uppercase tracking-wider transition-colors ${tf.active ? 'text-white' : 'text-slate-600'}`}>{tf.label}</span>
                       <div className={`h-px w-8 transition-all ${tf.active ? 'bg-current scale-100' : 'bg-slate-800 scale-0'}`}></div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* COL 2: Forensic Oscillators */}
        <div className="xl:col-span-5 flex flex-col gap-8">
           
           {/* RSI Forensic */}
           <div className="bg-slate-950/40 p-8 rounded-[3rem] border border-white/5 relative overflow-hidden group/card flex-1">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                   <Waves className="w-4 h-4 text-indigo-400" /> RSI Momentum
                </span>
                <span className={`text-3xl font-black font-mono tracking-tighter`} style={{ color: rsiColor }}>
                  {metrics.rsi.value.toFixed(1)}
                </span>
              </div>
              <div className="h-32 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.rsi.history}>
                    <defs>
                       <linearGradient id="rsiGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={rsiColor} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={rsiColor} stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <ReferenceLine y={70} stroke="#f43f5e" strokeDasharray="3 3" opacity={0.5} />
                    <ReferenceLine y={30} stroke="#10b981" strokeDasharray="3 3" opacity={0.5} />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke={rsiColor} 
                      strokeWidth={3} 
                      fill="url(#rsiGrad)" 
                      animationDuration={500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between mt-2 text-[8px] font-black text-slate-600 uppercase tracking-widest">
                <span className="text-emerald-500/80">Oversold (30)</span>
                <span className="text-rose-500/80">Overbought (70)</span>
              </div>
           </div>

           {/* MACD Forensic */}
           <div className="bg-slate-950/40 p-8 rounded-[3rem] border border-white/5 relative overflow-hidden group/card flex-1">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                   <Binary className="w-4 h-4 text-amber-400" /> MACD
                </span>
                <div className={`text-xl font-black font-mono tracking-tighter ${metrics.macd.hist > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {metrics.macd.hist > 0 ? '+' : ''}{metrics.macd.hist.toFixed(4)}
                </div>
              </div>
              <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.macd.history}>
                    <Bar dataKey="hist" radius={[2, 2, 0, 0]}>
                      {metrics.macd.history.map((entry, index) => (
                        <Cell 
                           key={`cell-${index}`} 
                           fill={entry.hist > 0 ? '#10b981' : '#f43f5e'} 
                           opacity={0.6 + (Math.abs(entry.hist) * 10)}
                        />
                      ))}
                    </Bar>
                    <ReferenceLine y={0} stroke="#334155" strokeDasharray="3 3" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* Volatility Bandwidth */}
           <div className="bg-slate-950/40 p-8 rounded-[3rem] border border-white/5 relative overflow-hidden flex items-center justify-between">
              <div className="flex flex-col gap-1">
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Zap className="w-3 h-3 text-white" /> Volatility
                 </span>
                 <div className="text-2xl font-black text-white font-mono">{metrics.bb.bandwidth.toFixed(3)}</div>
              </div>
              <div className="h-16 w-32">
                 <div className="flex items-end justify-between h-full gap-1">
                    {Array.from({length: 8}).map((_, i) => (
                       <div 
                          key={i} 
                          className="w-full bg-amber-500/20 rounded-t-sm transition-all duration-500"
                          style={{ 
                             height: `${20 + Math.random() * 80}%`,
                             backgroundColor: i > 5 ? '#fbbf24' : 'rgba(251, 191, 36, 0.2)'
                          }}
                       ></div>
                    ))}
                 </div>
              </div>
           </div>

        </div>
      </div>

      {/* Footer: Pivot Points Scanner */}
      <div className="mt-10 pt-10 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
         <div className="bg-slate-900/30 rounded-3xl p-6 border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20">
                  <ArrowDownRight className="w-5 h-5 text-rose-500" />
               </div>
               <div>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Supply Zone (R1)</span>
                  <span className="text-lg font-black text-white font-mono">${metrics.pivots.r1.toFixed(2)}</span>
               </div>
            </div>
            <div className="text-right">
               <span className="text-[9px] font-bold text-rose-400 uppercase tracking-widest">Resistance</span>
            </div>
         </div>

         <div className="bg-slate-900/30 rounded-3xl p-6 border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <ArrowUpRight className="w-5 h-5 text-emerald-500" />
               </div>
               <div>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Demand Zone (S1)</span>
                  <span className="text-lg font-black text-white font-mono">${metrics.pivots.s1.toFixed(2)}</span>
               </div>
            </div>
            <div className="text-right">
               <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Support</span>
            </div>
         </div>
      </div>

    </div>
  );
};

export default TechnicalForensics;