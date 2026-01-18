
import React, { useState, useEffect } from 'react';
import { AIAnalysis } from '../types';
import { 
  Target, Brain, Activity, TrendingUp, TrendingDown, 
  AlertTriangle, Zap, ScanLine, Info, X, Clock, 
  ChevronRight, Lock, Hash, Cpu, Layers, Disc, Globe,
  ShieldCheck, ShieldAlert, BarChart3, Scan
} from 'lucide-react';

interface TradeXrayAIProps {
  analysis?: AIAnalysis;
  isLoading: boolean;
  t: any;
  currentPrice?: number;
}

// -- LIVE CLOCK COMPONENT --
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

const TradeXrayAI: React.FC<TradeXrayAIProps> = ({ analysis, isLoading, t }) => {
  if (isLoading || !analysis) {
    return (
      <div className="cyber-card rounded-[2.5rem] border border-white/5 h-[500px] flex flex-col items-center justify-center relative overflow-hidden group bg-slate-950/50">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay"></div>
         
         <div className="relative z-10 flex flex-col items-center gap-6">
            <div className="w-20 h-20 relative">
               <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full border-t-emerald-500 animate-spin"></div>
               <div className="absolute inset-2 border-4 border-emerald-500/20 rounded-full border-b-emerald-400 animate-[spin_1.5s_linear_infinite_reverse]"></div>
               <Brain className="w-8 h-8 text-emerald-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            
            <div className="text-center space-y-2">
               <h3 className="text-lg font-black text-white uppercase tracking-widest">Initializing Forensic Core</h3>
               <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Scanning Market Vectors...</p>
            </div>
         </div>
      </div>
    );
  }

  const getSignalConfig = (sig: string) => {
    const s = sig.toUpperCase();
    if (s.includes('BUY')) return { 
        color: 'text-emerald-400', 
        borderColor: 'border-emerald-500/30', 
        bgColor: 'bg-emerald-500/5',
        shadow: 'shadow-[0_0_50px_rgba(16,185,129,0.15)]',
        glow: 'drop-shadow-[0_0_15px_rgba(16,185,129,0.6)]',
        accent: 'bg-emerald-500',
        icon: TrendingUp
    };
    if (s.includes('SELL')) return { 
        color: 'text-rose-400', 
        borderColor: 'border-rose-500/30', 
        bgColor: 'bg-rose-500/5',
        shadow: 'shadow-[0_0_50px_rgba(244,63,94,0.15)]',
        glow: 'drop-shadow-[0_0_15px_rgba(244,63,94,0.6)]',
        accent: 'bg-rose-500',
        icon: TrendingDown 
    };
    return { 
        color: 'text-amber-400', 
        borderColor: 'border-amber-500/30', 
        bgColor: 'bg-amber-500/5',
        shadow: 'shadow-[0_0_50px_rgba(251,191,36,0.15)]',
        glow: 'drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]',
        accent: 'bg-amber-500',
        icon: Activity 
    };
  };

  const config = getSignalConfig(analysis.signal);
  const SignalIcon = config.icon;

  return (
    <div className="cyber-card rounded-[3rem] p-8 md:p-10 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all duration-700 bg-[#020617]">
      
      {/* Background Atmosphere */}
      <div className={`absolute -top-[20%] -right-[10%] w-[600px] h-[600px] blur-[150px] rounded-full opacity-10 pointer-events-none ${config.accent}`}></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>

      {/* --- Header Section --- */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-10 gap-8 relative z-10 border-b border-white/5 pb-8">
         <div className="flex items-center gap-6">
            <div className="relative">
               <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full"></div>
               <div className="relative p-4 bg-slate-900 rounded-2xl border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                  <Brain className="w-8 h-8 text-emerald-400 animate-pulse-slow" />
               </div>
            </div>
            <div>
               <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">{t.quantumNeuralInterpretation}</h3>
               <div className="flex items-center gap-3 mt-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-300 uppercase tracking-widest">
                     AI-9000 Node
                  </span>
                  <div className="h-1 w-1 bg-slate-600 rounded-full"></div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                     <Lock size={10} className="text-indigo-500" /> Secure Stream
                  </p>
               </div>
            </div>
         </div>
         <LiveClock />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 relative z-10">
         
         {/* COL 1: Neural Core & Signal (Left) */}
         <div className={`xl:col-span-4 rounded-[2.5rem] p-1 relative overflow-hidden border ${config.borderColor} ${config.bgColor} transition-all duration-500 group/core`}>
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover/core:opacity-100 transition-opacity"></div>
            
            <div className="h-full bg-[#030712]/90 backdrop-blur-xl rounded-[2.3rem] p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
               
               {/* Core Visual */}
               <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
                  <div className={`absolute inset-0 rounded-full border border-dashed ${config.color} opacity-20 animate-[spin_10s_linear_infinite]`}></div>
                  <div className={`absolute inset-4 rounded-full border border-dotted ${config.color} opacity-40 animate-[spin_15s_linear_infinite_reverse]`}></div>
                  <div className={`absolute inset-0 rounded-full ${config.accent} opacity-5 blur-2xl animate-pulse`}></div>
                  
                  {/* Central Icon */}
                  <div className="relative z-10 bg-[#0B1221] p-6 rounded-full border border-white/5 shadow-2xl">
                     <SignalIcon size={48} className={config.color} />
                  </div>

                  {/* Orbiting Particles */}
                  <div className="absolute w-full h-full animate-[spin_3s_linear_infinite]">
                     <div className={`w-2 h-2 rounded-full ${config.accent} absolute top-0 left-1/2 -translate-x-1/2 shadow-[0_0_10px_currentColor]`}></div>
                  </div>
               </div>

               <div className="space-y-2 relative z-10">
                  <div className="flex items-center justify-center gap-2 mb-2">
                     <ScanLine size={12} className="text-slate-500" />
                     <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Verdict</span>
                  </div>
                  <h2 className={`text-5xl font-black italic tracking-tighter uppercase ${config.color} ${config.glow}`}>
                     {analysis.signal}
                  </h2>
               </div>

               {/* Metrics Mini-Grid */}
               <div className="grid grid-cols-2 gap-px bg-white/5 rounded-2xl overflow-hidden w-full mt-8 border border-white/5">
                  <div className="bg-black/20 p-4 flex flex-col items-center">
                     <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Score</span>
                     <span className="text-xl font-mono font-black text-white">{analysis.score}</span>
                  </div>
                  <div className="bg-black/20 p-4 flex flex-col items-center">
                     <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Conf</span>
                     <span className="text-xl font-mono font-black text-white">{analysis.confidence}%</span>
                  </div>
               </div>
            </div>
         </div>

         {/* COL 2: Intelligence Brief (Center) */}
         <div className="xl:col-span-5 flex flex-col gap-6">
            {/* English Logic */}
            <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-white/5 shadow-inner relative overflow-hidden group/text hover:border-indigo-500/20 transition-all flex-1">
               <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover/text:scale-110 transition-transform"><Globe className="w-32 h-32" /></div>
               <div className="flex items-center gap-3 mb-4">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10"><Cpu size={14} className="text-indigo-400" /></div>
                  <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Logic Synthesis (EN)</h4>
               </div>
               <p className="text-[11px] font-mono text-slate-400 leading-relaxed relative z-10 border-l-2 border-indigo-500/30 pl-4 py-1">
                  {analysis.reasoningEn}
               </p>
            </div>

            {/* Arabic Logic */}
            <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-white/5 shadow-inner relative overflow-hidden group/text hover:border-emerald-500/20 transition-all flex-1">
               <div className="absolute top-0 left-0 p-6 opacity-[0.03] group-hover/text:scale-110 transition-transform"><Layers className="w-32 h-32" /></div>
               <div className="flex items-center gap-3 mb-4 justify-end">
                  <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Logic Synthesis (AR)</h4>
                  <div className="p-1.5 rounded-lg bg-emerald-500/10"><Hash size={14} className="text-emerald-400" /></div>
               </div>
               <p className="text-[11px] font-sans font-bold text-slate-400 leading-relaxed relative z-10 border-r-2 border-emerald-500/30 pr-4 py-1 text-right" dir="rtl">
                  {analysis.reasoningAr}
               </p>
            </div>
         </div>

         {/* COL 3: Tactical Data (Right) */}
         <div className="xl:col-span-3 flex flex-col gap-4">
            
            {/* Key Levels Card */}
            <div className="bg-[#050912] p-6 rounded-[2rem] border border-white/5 shadow-lg">
               <div className="flex items-center gap-2 mb-6">
                  <Target size={14} className="text-indigo-400" />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.25em]">Strategic Levels</span>
               </div>
               
               <div className="space-y-4">
                  <div className="relative pl-4 group/res">
                     <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-rose-500/30 rounded-full group-hover/res:bg-rose-500 transition-colors"></div>
                     <span className="text-[8px] font-bold text-rose-400 uppercase tracking-widest block mb-1">Resistance Vector</span>
                     <div className="text-xs font-mono font-black text-white">{analysis.keyLevels.resistance.map(l => l.toLocaleString()).join(' / ')}</div>
                  </div>
                  <div className="relative pl-4 group/sup">
                     <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-500/30 rounded-full group-hover/sup:bg-emerald-500 transition-colors"></div>
                     <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest block mb-1">Support Vector</span>
                     <div className="text-xs font-mono font-black text-white">{analysis.keyLevels.support.map(l => l.toLocaleString()).join(' / ')}</div>
                  </div>
               </div>
            </div>

            {/* Liquidation Hotspots */}
            <div className="bg-[#050912] p-6 rounded-[2rem] border border-white/5 shadow-lg flex-1">
               <div className="flex items-center gap-2 mb-6">
                  <AlertTriangle size={14} className="text-amber-400" />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.25em]">Liq. Clusters</span>
               </div>
               
               <div className="space-y-2.5">
                  {analysis.liquidationZones?.map((zone, i) => (
                     <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group/liq">
                        <div className="flex items-center gap-2">
                           <div className={`w-1.5 h-1.5 rounded-full ${zone.type === 'LONG' ? 'bg-emerald-500' : 'bg-rose-500'} group-hover/liq:animate-pulse`}></div>
                           <span className="text-[9px] font-bold text-slate-300 uppercase">{zone.type}</span>
                        </div>
                        <div className="text-right">
                           <span className="block text-[10px] font-mono font-black text-white">${zone.price.toLocaleString()}</span>
                           <span className="block text-[8px] font-mono text-slate-600">Vol: {(zone.volume/1000).toFixed(1)}K</span>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

         </div>
      </div>
    </div>
  );
};

export default TradeXrayAI;
