
import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Clock, Activity, Hash, AlertCircle, Scan, Zap, ArrowRight, Radio } from 'lucide-react';
import { AIAnalysis } from '../types';

export interface SignalLog {
  id: number;
  time: string;
  type: string;
  price: number;
  score: number;
  symbol: string;
}

interface TradingSignalsProps {
  currentAnalysis?: AIAnalysis;
  history: SignalLog[];
  t: any;
}

const LiveSessionClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-end">
      <span className="text-xs font-mono font-black text-white leading-none tracking-tight">
        {time.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })} <span className="text-slate-500 text-[10px]">UTC</span>
      </span>
      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
        {time.toLocaleDateString([], { month: 'short', day: '2-digit', year: 'numeric' })}
      </span>
    </div>
  );
};

const TradingSignals: React.FC<TradingSignalsProps> = ({ currentAnalysis, history, t }) => {
  // Helper for colors & config
  const getSignalConfig = (signal: string) => {
    const s = signal.toUpperCase();
    if (s.includes('BUY')) return { 
      bg: 'bg-emerald-500/10', 
      border: 'border-emerald-500/30', 
      text: 'text-emerald-400',
      icon: TrendingUp,
      shadow: 'shadow-[0_0_40px_rgba(16,185,129,0.15)]',
      gradient: 'from-emerald-500/20 to-transparent'
    };
    if (s.includes('SELL')) return { 
      bg: 'bg-rose-500/10', 
      border: 'border-rose-500/30', 
      text: 'text-rose-400',
      icon: TrendingDown,
      shadow: 'shadow-[0_0_40px_rgba(244,63,94,0.15)]',
      gradient: 'from-rose-500/20 to-transparent'
    };
    return { 
      bg: 'bg-amber-500/10', 
      border: 'border-amber-500/30', 
      text: 'text-amber-400',
      icon: Minus,
      shadow: 'shadow-[0_0_40px_rgba(251,191,36,0.15)]',
      gradient: 'from-amber-500/20 to-transparent'
    };
  };

  const currentStyle = currentAnalysis ? getSignalConfig(currentAnalysis.signal) : getSignalConfig('WAIT');
  const Icon = currentStyle.icon;

  return (
    <div className="cyber-card rounded-[3rem] p-8 md:p-10 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all duration-500">
      
      {/* Background Ambient Effect */}
      <div className={`absolute -right-20 -top-20 w-96 h-96 bg-gradient-to-br ${currentStyle.gradient} blur-[100px] opacity-20 pointer-events-none rounded-full`}></div>

      <div className="flex flex-col xl:flex-row gap-10 h-full relative z-10">
        
        {/* Left: Current Signal Hero (Active State) */}
        <div className={`flex-1 rounded-[2.5rem] relative overflow-hidden flex flex-col justify-between transition-all duration-500 group/hero border ${currentStyle.border} ${currentStyle.bg} ${currentStyle.shadow}`}>
           
           {/* Scanline Overlay */}
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none"></div>
           <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent opacity-0 group-hover/hero:opacity-20 transition-opacity duration-700 pointer-events-none"></div>
           
           {/* Hero Content */}
           <div className="relative z-10 p-8 md:p-12 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
              
              {/* Top Badge */}
              <div className="absolute top-6 left-0 right-0 flex justify-center">
                 <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/20 backdrop-blur-md border ${currentStyle.border}`}>
                    <Activity className={`w-3.5 h-3.5 ${currentStyle.text} animate-pulse`} />
                    <span className={`text-[10px] font-black uppercase tracking-[0.25em] ${currentStyle.text}`}>Active Signal</span>
                 </div>
              </div>

              {/* Central Signal Typography */}
              <div className="relative">
                 {/* Background Watermark Icon */}
                 <Icon className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 opacity-[0.03] scale-150 pointer-events-none ${currentStyle.text}`} />
                 
                 <div className={`text-6xl lg:text-7xl font-black italic tracking-tighter uppercase mb-4 drop-shadow-2xl transition-transform duration-500 group-hover/hero:scale-105 ${currentStyle.text}`} style={{ textShadow: '0 0 30px currentColor' }}>
                    {currentAnalysis?.signal || 'WAITING'}
                 </div>
              </div>

              {/* Data Grid */}
              <div className="mt-8 grid grid-cols-2 gap-px bg-white/10 rounded-2xl overflow-hidden border border-white/5 w-full max-w-[320px]">
                 <div className="bg-black/40 p-4 flex flex-col items-center gap-1 hover:bg-white/5 transition-colors group/stat">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest group-hover/stat:text-white transition-colors">Score</span>
                    <span className="text-2xl font-mono font-black text-white">{currentAnalysis?.score || 0}</span>
                 </div>
                 <div className="bg-black/40 p-4 flex flex-col items-center gap-1 hover:bg-white/5 transition-colors group/stat">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest group-hover/stat:text-white transition-colors">Confidence</span>
                    <span className="text-2xl font-mono font-black text-white">{currentAnalysis?.confidence || 0}%</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Right: Signal History Feed */}
        <div className="flex-1 flex flex-col min-h-[350px]">
           {/* Header */}
           <div className="flex items-start justify-between mb-6 pb-4 border-b border-white/5">
              <div className="flex flex-col">
                 <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-2.5">
                    <Hash className="w-4 h-4 text-indigo-400" /> Session Feed
                 </h3>
                 <div className="flex items-center gap-2 mt-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Live Stream Active</span>
                 </div>
              </div>
              
              {/* Real-time Clock Component */}
              <LiveSessionClock />
           </div>

           {/* Feed Container */}
           <div className="flex-1 relative overflow-hidden bg-slate-950/30 rounded-[2rem] border border-white/5">
              <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-2 space-y-2">
                 {history.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-4 opacity-50">
                       <div className="p-4 bg-white/5 rounded-full"><Scan className="w-8 h-8 animate-spin-slow" /></div>
                       <span className="text-[10px] font-black uppercase tracking-[0.2em]">Awaiting Data Stream...</span>
                    </div>
                 ) : (
                    history.map((log) => {
                       const style = getSignalConfig(log.type);
                       const LogIcon = style.icon;
                       return (
                          <div key={log.id} className="group/item flex items-center justify-between p-3.5 rounded-2xl bg-black/40 border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all animate-[slideIn_0.3s_ease-out]">
                             
                             {/* Icon & Type */}
                             <div className="flex items-center gap-4">
                                <div className={`p-2.5 rounded-xl border ${style.bg} ${style.border} ${style.text} group-hover/item:scale-110 transition-transform`}>
                                   <LogIcon size={16} strokeWidth={3} />
                                </div>
                                <div className="flex flex-col">
                                   <span className={`text-[10px] font-black uppercase tracking-widest leading-tight ${style.text}`}>{log.type}</span>
                                   <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-[11px] font-black text-white font-mono">{log.symbol}</span>
                                      <span className="text-[10px] font-mono text-slate-500">@ ${log.price.toLocaleString()}</span>
                                   </div>
                                </div>
                             </div>

                             {/* Time & Score */}
                             <div className="text-right flex flex-col justify-center h-full">
                                <span className="text-[10px] font-mono font-bold text-slate-400 flex items-center gap-1.5 justify-end mb-0.5 group-hover/item:text-white transition-colors">
                                   {log.time}
                                </span>
                                <div className="flex items-center justify-end gap-1.5">
                                   <span className="text-[8px] font-black text-slate-600 uppercase tracking-wider">Score</span>
                                   <span className={`text-[10px] font-black font-mono ${log.score > 70 ? 'text-emerald-400' : log.score < 40 ? 'text-rose-400' : 'text-amber-400'}`}>{log.score}</span>
                                </div>
                             </div>
                          </div>
                       );
                    })
                 )}
              </div>
              
              {/* Fade at bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#010204] to-transparent pointer-events-none"></div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TradingSignals;
