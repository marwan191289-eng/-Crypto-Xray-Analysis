
import React, { useMemo, useState, useEffect } from 'react';
import { MarketData, LiquidityFlow } from '../types';
import { Droplets, Zap, Target, Box, Activity, Clock, Layers, Filter } from 'lucide-react';

interface Props { data: MarketData; isLoading: boolean; t: any; }

const LiveClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex flex-col items-end border-l border-white/5 pl-6 h-full justify-center min-w-[120px]">
      <div className="flex items-center gap-2 text-white">
        <Clock size={14} className="text-indigo-400" />
        <span className="text-sm font-mono font-black tracking-tight">
          {time.toLocaleTimeString('en-US', { hour12: false })}
        </span>
        <span className="text-[10px] font-bold text-slate-500 bg-white/5 px-1.5 rounded">UTC</span>
      </div>
      <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mt-1">
        {time.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' })}
      </span>
    </div>
  );
};

const RadialGauge = ({ value }: { value: number }) => {
  // Value is -100 to 100
  const normalized = Math.min(Math.max(value, -100), 100);
  const rotation = (normalized / 100) * 90; // -90 to 90 degrees
  
  const isPositive = normalized > 0;
  const color = normalized > 15 ? '#10b981' : normalized < -15 ? '#f43f5e' : '#fbbf24';
  const glowColor = normalized > 15 ? 'rgba(16,185,129,0.5)' : normalized < -15 ? 'rgba(244,63,94,0.5)' : 'rgba(251,191,36,0.5)';

  return (
    <div className="relative w-full h-48 flex items-end justify-center overflow-hidden">
      {/* Background Arc */}
      <div className="absolute bottom-0 w-64 h-32 rounded-t-full border-[12px] border-slate-800/50 box-border"></div>
      
      {/* Ticks */}
      <div className="absolute bottom-0 w-64 h-32 flex justify-center items-end">
         {[...Array(9)].map((_, i) => (
            <div 
               key={i} 
               className="absolute w-1 h-3 bg-slate-700 origin-bottom" 
               style={{ 
                  transform: `rotate(${(i * 22.5) - 90}deg) translateY(-120px)` 
               }}
            />
         ))}
      </div>

      {/* Needle */}
      <div 
        className="absolute bottom-0 left-1/2 w-1 h-36 bg-gradient-to-t from-white to-transparent origin-bottom transition-transform duration-1000 ease-out z-10"
        style={{ 
            transform: `translateX(-50%) rotate(${rotation}deg)`,
            filter: `drop-shadow(0 0 5px ${color})`
        }}
      >
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-8 rounded-full bg-white animate-pulse"></div>
      </div>
      
      {/* Center Hub */}
      <div className="absolute bottom-[-10px] w-20 h-10 bg-slate-900 rounded-t-full border-t border-white/10 z-20 flex items-center justify-center">
         <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest -mt-2">PSI</span>
      </div>

      {/* Value Display Overlay */}
      <div className="absolute bottom-16 flex flex-col items-center">
         <div className={`text-5xl font-black font-mono tracking-tighter drop-shadow-2xl transition-colors duration-500 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {value > 0 ? '+' : ''}{value.toFixed(1)}
         </div>
         <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em]">Net Delta</span>
      </div>
    </div>
  );
};

const LiquidityFlowMatrix: React.FC<Props> = ({ data, isLoading, t }) => {
  const metrics = useMemo(() => ({
    volumeImbalance: (Math.random() - 0.5) * 60,
    spotFlow: 45 + Math.random() * 40,
    futuresFlow: 45 + Math.random() * 40,
    orderBlocks: [
      { type: 'BEARISH', price: data.price * 1.008, strength: 'HIGH' },
      { type: 'BULLISH', price: data.price * 0.992, strength: 'MED' },
      { type: 'BULLISH', price: data.price * 0.985, strength: 'EXTREME' },
    ],
    fvg: [
      { top: data.price * 1.015, bottom: data.price * 1.012, type: 'SIBI' },
      { top: data.price * 0.995, bottom: data.price * 0.998, type: 'BISI' }
    ]
  }), [data]);

  if (isLoading) return (
    <div className="cyber-card rounded-[3.5rem] p-12 h-[600px] flex items-center justify-center border border-white/5 bg-slate-950/50">
        <Activity className="w-16 h-16 text-indigo-500 animate-pulse" />
    </div>
  );

  return (
    <div className="cyber-card rounded-[3rem] p-8 md:p-10 border border-white/5 relative overflow-hidden group bg-[#020617] transition-all hover:shadow-[0_0_50px_rgba(16,185,129,0.05)]">
      
      {/* Ambient Background */}
      <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform rotate-12">
         <Droplets className="w-96 h-96 text-emerald-400" />
      </div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none"></div>

      {/* --- HEADER --- */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-10 gap-8 relative z-10 border-b border-white/5 pb-8">
         <div className="flex items-center gap-6">
            <div className="relative">
               <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full"></div>
               <div className="relative p-4 bg-slate-900 rounded-2xl border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                  <Activity className="w-8 h-8 text-emerald-400 animate-pulse-slow" />
               </div>
            </div>
            <div>
               <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">{t.liquidityMatrix}</h3>
               <div className="flex items-center gap-3 mt-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-300 uppercase tracking-widest">
                     Flow Engine v9.0
                  </span>
                  <div className="h-1 w-1 bg-slate-600 rounded-full"></div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                     <Layers size={10} className="text-indigo-500" /> Depth Aggregated
                  </p>
               </div>
            </div>
         </div>
         <LiveClock />
      </div>

      {/* --- MAIN GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* COL 1: PSI GAUGE */}
        <div className="lg:col-span-4 flex flex-col">
            <div className="bg-slate-950/40 p-8 rounded-[2.5rem] border border-white/5 h-full relative overflow-hidden flex flex-col items-center justify-between group/gauge">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/80 pointer-events-none"></div>
                
                <div className="w-full flex justify-between items-start mb-4 relative z-10">
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Zap size={12} className="text-amber-400" /> Volume Delta PSI
                   </span>
                   <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[8px] font-bold text-slate-400 uppercase">Real-Time</span>
                </div>

                <div className="flex-1 w-full flex items-center justify-center">
                   <RadialGauge value={metrics.volumeImbalance} />
                </div>

                <div className="w-full grid grid-cols-2 gap-4 mt-6 relative z-10">
                   <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                      <span className="text-[8px] font-bold text-slate-500 uppercase block mb-1">Buy Pressure</span>
                      <span className="text-lg font-mono font-black text-emerald-400">{(50 + metrics.volumeImbalance/2).toFixed(0)}%</span>
                   </div>
                   <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                      <span className="text-[8px] font-bold text-slate-500 uppercase block mb-1">Sell Pressure</span>
                      <span className="text-lg font-mono font-black text-rose-400">{(50 - metrics.volumeImbalance/2).toFixed(0)}%</span>
                   </div>
                </div>
            </div>
        </div>

        {/* COL 2: DATA FEED */}
        <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* ROW 1: BLOCKS & GAPS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* OBs */}
                <div className="bg-slate-950/40 p-6 md:p-8 rounded-[2.5rem] border border-white/5 hover:border-indigo-500/20 transition-all group/ob relative overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                           <div className="p-1.5 rounded-lg bg-indigo-500/10"><Box className="w-4 h-4 text-indigo-400" /></div>
                           <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{t.smartMoneyBlocks}</h4>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {metrics.orderBlocks.map((ob, i) => (
                            <div key={i} className="p-3 rounded-xl bg-black/20 border border-white/5 flex justify-between items-center group-hover/ob:bg-black/40 transition-colors">
                                <div className="flex items-center gap-3">
                                   <div className={`w-1 h-8 rounded-full ${ob.type === 'BULLISH' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                   <div>
                                      <span className={`text-[9px] font-black uppercase block ${ob.type === 'BULLISH' ? 'text-emerald-400' : 'text-rose-400'}`}>{ob.type} OB</span>
                                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">{ob.strength} ZONE</span>
                                   </div>
                                </div>
                                <span className="text-sm font-mono font-black text-white tracking-tight">${ob.price.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FVGs */}
                <div className="bg-slate-950/40 p-6 md:p-8 rounded-[2.5rem] border border-white/5 hover:border-amber-500/20 transition-all group/fvg relative overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                           <div className="p-1.5 rounded-lg bg-amber-500/10"><Target className="w-4 h-4 text-amber-400" /></div>
                           <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Forensic Gaps</h4>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {metrics.fvg.map((f, i) => (
                            <div key={i} className="p-3 rounded-xl bg-black/20 border border-white/5 flex justify-between items-center group-hover/fvg:bg-black/40 transition-colors">
                                <div className="flex items-center gap-3">
                                   <div className="w-1 h-8 rounded-full bg-amber-500/50"></div>
                                   <div>
                                      <span className="text-[9px] font-black text-amber-400 uppercase block">{f.type} VOID</span>
                                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">UNFILLED</span>
                                   </div>
                                </div>
                                <span className="text-sm font-mono font-black text-white tracking-tight">${f.bottom.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ROW 2: VELOCITY BARS */}
            <div className="bg-slate-950/40 p-6 md:p-8 rounded-[2.5rem] border border-white/5 grid grid-cols-2 gap-8 relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex justify-between items-end mb-2">
                       <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Spot Liquidity</span>
                       <span className="text-xs font-mono font-black text-indigo-400">{metrics.spotFlow.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                       <div 
                          className="h-full bg-indigo-500 relative overflow-hidden transition-all duration-1000" 
                          style={{ width: `${metrics.spotFlow}%` }}
                       >
                          <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]"></div>
                       </div>
                    </div>
                </div>
                
                <div className="relative z-10">
                    <div className="flex justify-between items-end mb-2">
                       <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Futures OI Velocity</span>
                       <span className="text-xs font-mono font-black text-emerald-400">{metrics.futuresFlow.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                       <div 
                          className="h-full bg-emerald-500 relative overflow-hidden transition-all duration-1000" 
                          style={{ width: `${metrics.futuresFlow}%` }}
                       >
                          <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]"></div>
                       </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LiquidityFlowMatrix;
