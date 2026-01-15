
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { WhaleBearMetrics, WhaleTransaction } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, ReferenceLine, 
  AreaChart, Area, ComposedChart, Line
} from 'recharts';
import { 
  ShieldAlert, TrendingUp, TrendingDown, Target, Info, Activity, Ship, 
  AlertCircle, Map, Crosshair, Zap, Radar, Anchor, Radio, Skull
} from 'lucide-react';

interface Props {
  metrics?: WhaleBearMetrics;
  whaleTx: WhaleTransaction[];
  symbol: string;
  isLoading: boolean;
  currentPrice?: number;
  t: any;
}

const WhaleBearForensics: React.FC<Props> = ({ metrics, whaleTx, symbol, isLoading, currentPrice, t }) => {
  // --- Live Simulation State ---
  const [pressure, setPressure] = useState(50); // 0 (Bear) to 100 (Bull)
  const [liveNetflow, setLiveNetflow] = useState<any[]>([]);
  const [liveTx, setLiveTx] = useState<WhaleTransaction[]>([]);
  const [radarPing, setRadarPing] = useState(0);

  // Initialize Data
  useEffect(() => {
    if (metrics?.netflowHistory) {
      setLiveNetflow(metrics.netflowHistory);
    }
    if (whaleTx) {
      setLiveTx(whaleTx);
    }
  }, [metrics, whaleTx]);

  // --- Real-time Engine ---
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Oscillate Pressure
      setPressure(prev => {
        const volatility = Math.random() > 0.9 ? 15 : 2; // Occasional spikes
        const change = (Math.random() - 0.5) * volatility;
        return Math.max(0, Math.min(100, prev + change));
      });

      // 2. Radar Ping Animation
      setRadarPing(prev => (prev + 1) % 100);

      // 3. Inject Fake Live Transactions
      if (Math.random() > 0.85) {
        const type = Math.random() > 0.5 ? 'buy' : 'sell';
        const amount = Math.random() * 1000 + 100;
        const newTx: WhaleTransaction = {
          id: Math.random().toString(36).substring(7),
          amount,
          amountUsd: amount * (currentPrice || 50000),
          from: type === 'buy' ? 'EXCHANGE' : 'WALLET',
          to: type === 'buy' ? 'WALLET' : 'EXCHANGE',
          fromLabel: type === 'buy' ? 'Binance' : 'Whale 0x...',
          toLabel: type === 'buy' ? 'Cold Storage' : 'Coinbase',
          timestamp: new Date().toLocaleTimeString(),
          hash: '0x' + Math.random().toString(16).substring(2, 8) + '...'
        };
        setLiveTx(prev => [newTx, ...prev].slice(0, 10)); // Keep last 10
      }

      // 4. Update Netflow Data (Simulate Ticker)
      setLiveNetflow(prev => {
        if (prev.length === 0) return prev;
        const last = { ...prev[prev.length - 1] };
        // Jitter the last bar
        last.net += (Math.random() - 0.5) * 500000;
        return [...prev.slice(0, -1), last];
      });

    }, 1000);

    return () => clearInterval(interval);
  }, [currentPrice]);

  if (isLoading || !metrics) {
    return (
      <div className="bg-slate-950/40 rounded-[2rem] md:rounded-[4rem] p-6 md:p-12 border border-white/5 animate-pulse min-h-[600px]">
        <div className="h-10 w-64 bg-slate-800 rounded-2xl mb-12" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="h-80 bg-slate-800 rounded-[3rem]" />
          <div className="h-80 bg-slate-800 rounded-[3rem]" />
        </div>
      </div>
    );
  }

  const pressureColor = pressure > 60 ? '#10b981' : pressure < 40 ? '#f43f5e' : '#fbbf24';
  const cycleColors: Record<string, string> = {
    'ACCUMULATION': 'text-emerald-400',
    'MARK-UP': 'text-indigo-400',
    'DISTRIBUTION': 'text-rose-400',
    'MARK-DOWN': 'text-amber-400'
  };

  return (
    <div className="cyber-card rounded-[2rem] md:rounded-[4rem] p-6 md:p-12 border border-white/5 relative overflow-hidden group">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
        <Ship className="w-96 h-96 text-indigo-400" />
      </div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-soft-light pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-12 relative z-10 gap-6">
        <div className="flex items-center gap-6">
          <div className="p-5 bg-indigo-500/10 rounded-3xl border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.15)] relative overflow-hidden">
            <Anchor className="w-8 h-8 text-indigo-400 relative z-10" />
            <div className="absolute inset-0 bg-indigo-500/20 blur-xl animate-pulse"></div>
          </div>
          <div>
            <h3 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase italic leading-none">{t.whaleBearMatrix}</h3>
            <div className="flex items-center gap-3 mt-3">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">{t.smartMoneyNetflow}</span>
               <div className="h-px w-8 bg-slate-700"></div>
               <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                 <Radio className="w-3 h-3 animate-ping" /> {t.liveFeed}
               </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-slate-950/50 px-6 py-3 rounded-2xl border border-white/5">
           <div className="flex flex-col items-end">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Whale Dominance</span>
              <span className={`text-sm font-black font-mono ${pressure > 50 ? 'text-emerald-400' : 'text-rose-400'}`}>
                 {pressure > 50 ? 'BULLS ' : 'BEARS '}{Math.abs(pressure - 50).toFixed(1)}%
              </span>
           </div>
           <Activity className={`w-6 h-6 ${pressure > 50 ? 'text-emerald-400' : 'text-rose-400'}`} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12 relative z-10">
        
        {/* COL 1: Netflow & Pressure */}
        <div className="xl:col-span-2 flex flex-col gap-10">
           
           {/* Netflow Chart */}
           <div className="bg-slate-950/40 p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden group/chart">
              <div className="flex justify-between items-start mb-8">
                 <div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">{t.exchangeInventory}</span>
                    <h4 className="text-lg md:text-2xl font-black text-white uppercase italic tracking-tighter">{t.exchangeNetflow}</h4>
                 </div>
                 <div className="flex flex-col md:flex-row gap-2 md:gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                       <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                       <span className="text-[9px] font-black text-emerald-400 uppercase">Outflow (Bullish)</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-rose-500/10 rounded-lg border border-rose-500/20">
                       <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                       <span className="text-[9px] font-black text-rose-400 uppercase">Inflow (Bearish)</span>
                    </div>
                 </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={liveNetflow} barSize={12}>
                    <defs>
                       <linearGradient id="barBull" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="100%" stopColor="#10b981" stopOpacity={0.2}/>
                       </linearGradient>
                       <linearGradient id="barBear" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.8}/>
                          <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.2}/>
                       </linearGradient>
                    </defs>
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const net = payload[0].payload.net;
                          return (
                            <div className="bg-slate-900 border border-white/10 p-3 rounded-xl shadow-xl backdrop-blur-md">
                              <span className={`text-xs font-black font-mono ${net > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                {net > 0 ? '+' : ''}${(net / 1000000).toFixed(2)}M
                              </span>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <ReferenceLine y={0} stroke="#334155" strokeDasharray="3 3" />
                    <Bar dataKey="net" radius={[4, 4, 4, 4]} animationDuration={500}>
                      {liveNetflow.map((entry, index) => (
                        <Cell 
                           key={`cell-${index}`} 
                           fill={entry.net > 0 ? 'url(#barBear)' : 'url(#barBull)'} 
                           stroke={entry.net > 0 ? '#f43f5e' : '#10b981'}
                           strokeWidth={1}
                           strokeOpacity={0.5}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* Whale Pressure Gauge & Wyckoff */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              
              {/* Pressure Gauge */}
              <div className="bg-slate-950/40 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center text-center">
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest absolute top-8 left-8">{t.whaleBias}</span>
                 
                 <div className="relative w-64 h-32 mt-8 overflow-hidden">
                    {/* Gauge Arc */}
                    <div className="absolute w-64 h-64 rounded-full border-[12px] border-slate-800 border-t-transparent border-l-transparent -rotate-45" style={{ transform: 'rotate(-45deg)' }}></div>
                    <div className="absolute w-64 h-64 rounded-full border-[12px] border-transparent border-t-emerald-500 border-r-emerald-500" 
                         style={{ 
                             transform: `rotate(${-45 + (pressure/100)*90}deg)`, 
                             opacity: 0.3
                         }}></div>
                    
                    {/* Needle */}
                    <div 
                        className="absolute bottom-0 left-1/2 w-1 h-28 bg-white origin-bottom transition-transform duration-1000 ease-out z-10 shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                        style={{ transform: `translateX(-50%) rotate(${(pressure / 100) * 180 - 90}deg)` }}
                    >
                        <div className="w-4 h-4 bg-white rounded-full absolute -top-2 left-1/2 -translate-x-1/2"></div>
                    </div>
                    
                    <div className="absolute bottom-0 left-0 text-[10px] font-black text-rose-500 uppercase tracking-widest">Sell Wall</div>
                    <div className="absolute bottom-0 right-0 text-[10px] font-black text-emerald-500 uppercase tracking-widest">Buy Wall</div>
                 </div>
                 
                 <div className="mt-4">
                    <span className="text-3xl font-black font-mono tracking-tighter" style={{ color: pressureColor }}>{pressure.toFixed(1)}</span>
                    <span className="text-[9px] font-black text-slate-500 uppercase block tracking-widest">Pressure Index</span>
                 </div>
              </div>

              {/* Wyckoff Phase */}
              <div className="bg-slate-950/40 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden flex flex-col justify-center">
                 <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none"></div>
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">{t.wyckoffAnalysis}</span>
                 
                 <div className="text-center py-6">
                    <div className={`text-2xl md:text-3xl font-black italic tracking-tighter uppercase mb-2 ${cycleColors[metrics.marketCycle]}`}>
                       {t[metrics.marketCycle] || metrics.marketCycle}
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden mb-2">
                       <div 
                          className={`h-full transition-all duration-1000 relative overflow-hidden ${cycleColors[metrics.marketCycle]?.replace('text-', 'bg-')}`} 
                          style={{ width: `${metrics.cycleProgress}%` }}
                       >
                          <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]"></div>
                       </div>
                    </div>
                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.3em] italic">{t.phaseProgress}: {metrics.cycleProgress.toFixed(0)}%</span>
                 </div>
              </div>

           </div>
        </div>

        {/* COL 2: Live Hunt Radar & Feed */}
        <div className="flex flex-col gap-10">
           
           {/* Liquidity Hunt Radar */}
           <div className="bg-slate-950/40 p-6 md:p-8 rounded-[2rem] md:rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden flex flex-col h-[400px]">
              <div className="flex justify-between items-center mb-6 relative z-10">
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Crosshair className="w-4 h-4 text-rose-500 animate-pulse" /> {t.liquidityHunt}
                 </span>
                 <span className="text-xs font-mono font-black text-white">${currentPrice?.toLocaleString()}</span>
              </div>

              {/* Radar Visual */}
              <div className="flex-1 relative border-l border-slate-800 ml-4 my-4">
                 {/* Center Line (Current Price) */}
                 <div className="absolute top-1/2 left-0 w-full h-px bg-indigo-500/50 z-10 flex items-center">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full -ml-1 shadow-[0_0_10px_#6366f1]"></div>
                    <span className="ml-2 text-[9px] font-black text-indigo-400 bg-black/50 px-1 rounded">CURRENT</span>
                 </div>

                 {/* Stop Hunt Zones */}
                 {metrics.stopHuntZones.map((zone, i) => {
                    if (!currentPrice) return null;
                    const diff = ((zone.price - currentPrice) / currentPrice) * 100;
                    // Scale position: +/- 2% maps to +/- 45% height
                    const topPos = 50 - (diff * 25); 
                    const isLong = zone.type === 'LONG_HUNT';
                    
                    return (
                       <div 
                          key={i} 
                          className="absolute left-0 w-full flex items-center transition-all duration-1000 group/zone cursor-crosshair"
                          style={{ top: `${Math.max(10, Math.min(90, topPos))}%` }}
                       >
                          <div className={`h-px w-8 ${isLong ? 'bg-emerald-500/50' : 'bg-rose-500/50'}`}></div>
                          <div className={`relative p-3 rounded-xl border backdrop-blur-md transition-transform group-hover/zone:scale-110 ${isLong ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'}`}>
                             <div className={`absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${isLong ? 'bg-emerald-500' : 'bg-rose-500'} animate-ping`}></div>
                             <div className="flex flex-col">
                                <span className={`text-[9px] font-black uppercase ${isLong ? 'text-emerald-400' : 'text-rose-400'}`}>
                                   {isLong ? 'LONG LIQ' : 'SHORT LIQ'}
                                </span>
                                <span className="text-xs font-mono font-black text-white">${zone.price.toLocaleString()}</span>
                                <span className="text-[8px] font-mono text-slate-400">{zone.volume} Vol</span>
                             </div>
                          </div>
                       </div>
                    );
                 })}
                 
                 {/* Radar Scanner Line */}
                 <div 
                    className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent z-0 pointer-events-none"
                    style={{ top: `${radarPing}%`, opacity: 0.3 }}
                 ></div>
              </div>
           </div>

           {/* Live Transactions Feed */}
           <div className="bg-slate-950/40 p-6 md:p-8 rounded-[2rem] md:rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden flex-1 min-h-[300px] flex flex-col">
              <div className="flex items-center justify-between mb-6">
                 <h4 className="text-[12px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                    <Zap className="w-4 h-4 text-amber-400" /> Live Feed
                 </h4>
                 <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></div>
              </div>

              <div className="flex-1 overflow-hidden relative">
                 <div className="absolute inset-0 overflow-y-auto custom-scrollbar pr-2 space-y-3 mask-gradient-b">
                    {liveTx.map((tx, i) => (
                       <div 
                          key={tx.id + i} 
                          className="flex justify-between items-center p-4 bg-slate-900/50 rounded-2xl border border-white/5 hover:bg-white/5 transition-colors animate-[slideIn_0.3s_ease-out]"
                       >
                          <div className="flex items-center gap-3">
                             <div className={`p-2 rounded-lg ${tx.from === 'EXCHANGE' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                {tx.from === 'EXCHANGE' ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                             </div>
                             <div className="flex flex-col">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{tx.from === 'EXCHANGE' ? 'DUMP' : 'ACCUM'}</span>
                                <span className="text-[8px] font-mono text-slate-600">{tx.timestamp}</span>
                             </div>
                          </div>
                          <div className="text-right">
                             <span className="text-sm font-black font-mono text-white tracking-tighter block">{tx.amount.toFixed(1)} {symbol}</span>
                             <span className="text-[8px] font-bold text-slate-500 uppercase">${(tx.amountUsd / 1000).toFixed(1)}K</span>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
};

export default WhaleBearForensics;
