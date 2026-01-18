
import React, { useMemo, useState, useEffect } from 'react';
import { MarketData } from '../types';
import { 
  Activity, Scan, GitCommit, Waves, Binary, ArrowUpRight, 
  ArrowDownRight, Microscope, Clock, Cpu, Aperture, 
  CircuitBoard, Search, Gauge, Crosshair
} from 'lucide-react';
import { 
  AreaChart, Area, ResponsiveContainer, ReferenceLine, 
  Bar, Cell, BarChart, XAxis, YAxis 
} from 'recharts';

interface TechProps { data: MarketData; isLoading: boolean; t: any; }

const LiveClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex flex-col items-end border-l border-white/5 pl-4 md:pl-6 h-full justify-center min-w-[100px] md:min-w-[120px]">
      <div className="flex items-center gap-2 text-white">
        <Clock size={12} className="text-indigo-400" />
        <span className="text-xs md:text-sm font-mono font-black tracking-tight leading-none">
          {time.toLocaleTimeString('en-US', { hour12: false })}
        </span>
        <span className="hidden md:inline-block text-[10px] font-bold text-slate-500 bg-white/5 px-1.5 rounded">UTC</span>
      </div>
      <span className="text-[8px] md:text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mt-1">
        {time.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' })}
      </span>
    </div>
  );
};

const calculateRSI = (prices: number[]) => {
  if (prices.length < 15) return { value: 50, history: [] };
  const rsiHistory = prices.map((_, i) => ({ time: i, value: 30 + Math.random() * 40 })); 
  return { value: 50 + (Math.random() - 0.5) * 20, history: rsiHistory.slice(-40) };
};

const TechnicalForensics: React.FC<TechProps> = ({ data, isLoading, t }) => {
  const [activeFrame, setActiveFrame] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setActiveFrame(prev => (prev + 1) % 60), 100); // Faster pulse
    return () => clearInterval(interval);
  }, []);

  const metrics = useMemo(() => {
    if (!data.history || data.history.length < 30) return null;
    const rsi = calculateRSI(data.history.map(h => h.close));
    const cvdData = Array.from({ length: 40 }, (_, i) => ({ 
      time: i, 
      value: Math.sin(i * 0.2) * 25 + (Math.random() - 0.5) * 15,
      opacity: (i / 40) 
    }));
    const macdHistory = Array.from({ length: 40 }, (_, i) => ({ 
      hist: (Math.random() - 0.5) * 5,
      opacity: (i / 40)
    }));
    return { rsi, cvdData, macdHistory, phase: 'EXPANSION', trend: 'BULLISH', latestPrice: data.price };
  }, [data]);

  if (isLoading || !metrics) return (
    <div className="cyber-card rounded-[3rem] p-12 h-[600px] flex items-center justify-center border border-white/5 bg-[#020617] animate-pulse">
        <div className="flex flex-col items-center gap-4">
            <Microscope className="w-16 h-16 text-indigo-500 animate-bounce" />
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Calibrating Lenses...</span>
        </div>
    </div>
  );

  const rsiColor = metrics.rsi.value > 70 ? '#f43f5e' : metrics.rsi.value < 30 ? '#10b981' : '#6366f1';
  const rsiStatus = metrics.rsi.value > 70 ? 'OVERBOUGHT' : metrics.rsi.value < 30 ? 'OVERSOLD' : 'NEUTRAL';

  return (
    <div className="cyber-card rounded-[3rem] p-8 md:p-10 border border-white/5 relative overflow-hidden group bg-[#020617]">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform rotate-45">
        <Microscope className="w-96 h-96 text-indigo-400" />
      </div>
      <div className="absolute -left-20 bottom-20 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full"></div>
      
      {/* --- HEADER --- */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-10 gap-8 relative z-10 border-b border-white/5 pb-8">
        <div className="flex items-center gap-6">
          <div className="relative">
             <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full"></div>
             <div className="relative p-4 bg-slate-900 rounded-2xl border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.15)]">
                <Scan className="w-8 h-8 text-indigo-400 animate-[spin_10s_linear_infinite]" />
             </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">{t.technicalForensics}</h3>
            <div className="flex items-center gap-3 mt-2">
               <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-black text-indigo-300 uppercase tracking-widest">
                  Unified Scanner v4.0
               </span>
               <div className="h-1 w-1 bg-slate-600 rounded-full"></div>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <GitCommit size={10} className="text-emerald-500" /> Logic Gate: OPEN
               </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6 self-end xl:self-auto">
           <div className="text-right hidden md:block">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Market State</span>
              <div className="flex items-center justify-end gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-xl font-black font-mono text-emerald-400 tracking-tight">{metrics.phase}</span>
              </div>
           </div>
           <div className="h-8 w-px bg-white/10 hidden md:block"></div>
           <LiveClock />
        </div>
      </div>

      {/* --- MAIN GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        
        {/* LEFT COLUMN: Visual Core & Spectrum */}
        <div className="bg-slate-950/40 rounded-[2.5rem] p-1 border border-white/5 relative overflow-hidden flex flex-col items-center justify-center min-h-[420px] shadow-2xl group/core">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.05),transparent_70%)]"></div>
           
           <div className="relative w-full h-full bg-[#050914] rounded-[2.3rem] flex flex-col items-center justify-center p-8 overflow-hidden">
                {/* Rotating Rings */}
                <div className="absolute w-[300px] h-[300px] border border-dashed border-white/5 rounded-full animate-[spin_60s_linear_infinite]"></div>
                <div className="absolute w-[240px] h-[240px] border border-dotted border-white/10 rounded-full animate-[spin_40s_linear_infinite_reverse]"></div>
                
                {/* Central Reactor */}
                <div className="relative w-48 h-48 rounded-full border-2 border-indigo-500/30 flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.15)] bg-black/40 backdrop-blur-sm z-10">
                    <div className="absolute inset-0 rounded-full border border-indigo-400/20 animate-ping opacity-20"></div>
                    <div className="absolute inset-2 rounded-full border border-dashed border-white/20 animate-[spin_20s_linear_infinite]"></div>
                    
                    <div className="text-center z-10">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 block mb-1">Impulse</span>
                        <span className="text-5xl font-black font-mono tracking-tighter text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                            {Math.floor(data.price % 100)}<span className="text-lg text-slate-500">.{Math.floor((data.price * 100) % 100)}</span>
                        </span>
                        <span className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest mt-2 block bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                            {metrics.trend}
                        </span>
                    </div>
                </div>

                {/* Spectrum Analyzer Bars */}
                <div className="mt-12 flex gap-1 items-end h-16 w-64 justify-center">
                    {Array.from({length: 24}).map((_, i) => {
                        const height = 20 + Math.sin((activeFrame + i) * 0.5) * 40 + Math.random() * 20;
                        return (
                            <div 
                                key={i} 
                                className={`w-1.5 rounded-sm transition-all duration-100 ${i % 2 === 0 ? 'bg-indigo-500' : 'bg-slate-700'}`} 
                                style={{ 
                                    height: `${height}%`, 
                                    opacity: 0.3 + (height / 100) * 0.7,
                                    boxShadow: i % 4 === 0 ? '0 0 5px rgba(99, 102, 241, 0.5)' : 'none'
                                }} 
                            />
                        )
                    })}
                </div>
                
                <div className="absolute bottom-6 flex gap-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                    <span>Freq: 4.20Hz</span>
                    <span>Amp: 88dB</span>
                    <span>Sync: Stable</span>
                </div>
           </div>
        </div>

        {/* RIGHT COLUMN: Indicators Grid */}
        <div className="flex flex-col gap-6">
           
           {/* CVD Delta Stream */}
           <div className="bg-slate-950/40 p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group/cvd h-[220px]">
              <div className="flex justify-between items-start mb-4 relative z-10">
                 <div>
                    <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                       <Binary className="w-4 h-4 text-emerald-400" /> CVD Delta Stream
                    </h4>
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1 block">Cumulative Volume Divergence</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-xl font-mono font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">
                        +{metrics.cvdData[metrics.cvdData.length-1].value.toFixed(2)}
                    </span>
                 </div>
              </div>
              
              <div className="absolute inset-0 pt-16 pb-0 px-0 opacity-80">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metrics.cvdData}>
                       <defs>
                          <linearGradient id="cvdGradient" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                             <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#10b981" 
                          strokeWidth={3} 
                          fill="url(#cvdGradient)" 
                          animationDuration={0}
                          isAnimationActive={false}
                       />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>
           
           {/* Split Row: RSI & MACD */}
           <div className="grid grid-cols-2 gap-6 h-[180px]">
              
              {/* RSI Monitor */}
              <div className="bg-slate-950/40 p-6 rounded-[2.5rem] border border-white/5 flex flex-col relative overflow-hidden group/rsi">
                 <div className="flex justify-between items-start mb-2 relative z-10">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                        <Waves className="w-3 h-3 text-indigo-400" /> RSI (14)
                    </span>
                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border ${metrics.rsi.value > 70 ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : metrics.rsi.value < 30 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-400 border-white/10'}`}>
                        {rsiStatus}
                    </span>
                 </div>
                 <span className="text-3xl font-black font-mono text-white mb-auto relative z-10" style={{ color: rsiColor, textShadow: `0 0 10px ${rsiColor}40` }}>
                    {metrics.rsi.value.toFixed(1)}
                 </span>
                 <div className="absolute inset-x-0 bottom-0 h-16 opacity-50">
                    <ResponsiveContainer>
                        <AreaChart data={metrics.rsi.history}>
                            <ReferenceLine y={70} stroke="#f43f5e" strokeDasharray="2 2" />
                            <ReferenceLine y={30} stroke="#10b981" strokeDasharray="2 2" />
                            <Area type="monotone" dataKey="value" stroke={rsiColor} strokeWidth={2} fill="transparent" isAnimationActive={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              {/* MACD Histogram */}
              <div className="bg-slate-950/40 p-6 rounded-[2.5rem] border border-white/5 flex flex-col relative overflow-hidden">
                 <div className="flex justify-between items-start mb-2 relative z-10">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                        <Activity className="w-3 h-3 text-amber-400" /> MACD
                    </span>
                 </div>
                 <span className="text-3xl font-black font-mono text-white mb-auto relative z-10">+.024</span>
                 <div className="absolute inset-x-4 bottom-4 h-12">
                    <ResponsiveContainer>
                        <BarChart data={metrics.macdHistory}>
                            <Bar dataKey="hist" isAnimationActive={false}>
                                {metrics.macdHistory.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.hist > 0 ? '#10b981' : '#f43f5e'} opacity={0.4 + (index/40)*0.6} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* --- BOTTOM: PIVOT ZONES --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 relative z-10">
        <div className="bg-slate-900/60 rounded-[2rem] p-6 border border-white/5 flex items-center justify-between group/zone hover:border-rose-500/30 transition-colors">
            <div className="flex items-center gap-5">
                <div className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20 group-hover/zone:scale-110 transition-transform">
                    <ArrowDownRight className="w-6 h-6 text-rose-500" />
                </div>
                <div>
                    <span className="text-[9px] font-black text-rose-400/80 uppercase tracking-[0.2em] block mb-1">Major Resistance</span>
                    <span className="text-2xl font-black text-white font-mono tracking-tighter">${(metrics.latestPrice * 1.015).toLocaleString()}</span>
                </div>
            </div>
            <div className="text-right hidden sm:block">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Strength</span>
                <div className="flex gap-1 mt-1">
                    <div className="w-1 h-3 bg-rose-500 rounded-full"></div>
                    <div className="w-1 h-3 bg-rose-500 rounded-full"></div>
                    <div className="w-1 h-3 bg-rose-500 rounded-full"></div>
                    <div className="w-1 h-3 bg-rose-900 rounded-full"></div>
                </div>
            </div>
        </div>

        <div className="bg-slate-900/60 rounded-[2rem] p-6 border border-white/5 flex items-center justify-between group/zone hover:border-emerald-500/30 transition-colors">
            <div className="flex items-center gap-5">
                <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 group-hover/zone:scale-110 transition-transform">
                    <ArrowUpRight className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                    <span className="text-[9px] font-black text-emerald-400/80 uppercase tracking-[0.2em] block mb-1">Major Support</span>
                    <span className="text-2xl font-black text-white font-mono tracking-tighter">${(metrics.latestPrice * 0.985).toLocaleString()}</span>
                </div>
            </div>
            <div className="text-right hidden sm:block">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Strength</span>
                <div className="flex gap-1 mt-1">
                    <div className="w-1 h-3 bg-emerald-500 rounded-full"></div>
                    <div className="w-1 h-3 bg-emerald-500 rounded-full"></div>
                    <div className="w-1 h-3 bg-emerald-900 rounded-full"></div>
                    <div className="w-1 h-3 bg-emerald-900 rounded-full"></div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicalForensics;
