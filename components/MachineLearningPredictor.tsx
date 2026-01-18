
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { MLPrediction } from '../types';
import { 
  Cpu, TrendingUp, TrendingDown, GitMerge, Layers, ArrowRight, 
  Info, Activity, Scan, Zap, Sparkles, Clock, Target, 
  BarChart3, Brain, Network, Minus, RefreshCcw, Atom, Share2, Hexagon,
  Radar, Terminal, FileCode, Search, Lock, Database
} from 'lucide-react';
import { 
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, 
  ReferenceLine, Scatter, ComposedChart, Line
} from 'recharts';

interface MLProps {
  prediction?: MLPrediction;
  isLoading: boolean;
  currentPrice?: number;
  t: any;
  onValidate?: () => void;
}

// --- Ultra Elegant Live Clock ---
const LiveClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex flex-col items-end border-l border-white/5 pl-6 h-full justify-center min-w-[140px]">
      <div className="flex items-center gap-2.5 text-white">
        <Clock size={14} className="text-indigo-400" />
        <span className="text-sm font-mono font-black tracking-tight leading-none">
          {time.toLocaleTimeString('en-US', { hour12: false })}
        </span>
        <span className="text-[9px] font-bold text-slate-500 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">UTC</span>
      </div>
      <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.25em] mt-1.5">
        {time.toLocaleDateString('en-US', { weekday: 'long', day: '2-digit', month: 'short' })}
      </span>
    </div>
  );
};

// --- Sophisticated Voting Node ---
const PulseNode = ({ active, color, label, icon: Icon, vote }: any) => {
  const voteColor = vote === 'BUY' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : 
                    vote === 'SELL' ? 'text-rose-400 border-rose-500/30 bg-rose-500/10' : 
                    'text-amber-400 border-amber-500/30 bg-amber-500/10';
  
  const activeGlow = active ? `shadow-[0_0_20px_rgba(var(--${color}-rgb),0.3)] border-${color}-500/50 bg-${color}-500/10` : 'border-white/5 bg-slate-900';

  return (
    <div className="flex flex-col items-center gap-3 relative group z-10 transition-all duration-500">
      <div className={`relative p-4 rounded-2xl border transition-all duration-500 ${active ? `scale-110 border-indigo-400/50 bg-indigo-500/10 shadow-[0_0_25px_rgba(99,102,241,0.3)]` : 'border-white/10 bg-[#0B1221]'}`}>
        <Icon className={`w-5 h-5 ${active ? 'text-indigo-300' : 'text-slate-600'}`} />
        {active && (
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
          </span>
        )}
      </div>
      <div className="flex flex-col items-center gap-1.5">
         <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${active ? 'text-white' : 'text-slate-600'}`}>{label}</span>
         <div className={`text-[8px] font-black font-mono px-3 py-1 rounded border uppercase tracking-wider ${voteColor} transition-all duration-300`}>
            {vote}
         </div>
      </div>
    </div>
  );
};

// --- Cognitive Tensor Field Component ---
const CognitiveTensorField = ({ prediction, currentPrice }: { prediction?: MLPrediction, currentPrice?: number }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [activeNodes, setActiveNodes] = useState<number[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate Neural Grid (Hexagons)
    const interval = setInterval(() => {
      // Random active nodes
      const newActive = Array.from({ length: 12 }, () => Math.floor(Math.random() * 64));
      setActiveNodes(newActive);

      // Generate Logs
      const actions = [
        "Re-calibrating LSTM weights...", 
        "Scanning Order Block liquidity...",
        "Cross-verifying MACD divergence...",
        "Fetching On-Chain inflow metrics...",
        "Detecting High-Frequency Trading clusters...",
        "Optimizing Gradient Descent...",
        "Parsing Social Sentiment tensors...",
        "Calculating Volatility Skew..."
      ];
      const newLog = `[${new Date().toLocaleTimeString([],{hour12:false})}] ${actions[Math.floor(Math.random() * actions.length)]}`;
      setLogs(prev => [newLog, ...prev].slice(0, 8));
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#020617] rounded-[3rem] p-1 border border-white/5 relative overflow-hidden h-[450px] shadow-inner group/tensor flex flex-col">
       
       {/* Background Grid FX */}
       <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:30px_30px] opacity-30 pointer-events-none"></div>
       <div className="absolute top-0 left-0 w-full h-[1px] bg-indigo-500/30 animate-[scan_3s_linear_infinite] pointer-events-none z-0"></div>

       {/* Header */}
       <div className="relative z-10 px-8 pt-8 pb-4 flex justify-between items-start border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
          <div>
             <h4 className="text-[11px] font-black text-indigo-300 uppercase tracking-[0.25em] flex items-center gap-2 mb-1.5">
                <Brain size={14} className="text-indigo-400" /> Cognitive Tensor Field
             </h4>
             <div className="flex items-center gap-3">
                <span className="text-[9px] font-mono text-slate-500 font-bold flex items-center gap-1.5">
                   <Zap size={10} className="text-amber-400" /> Processing Power: 128 TFLOPS
                </span>
             </div>
          </div>
          <div className="flex flex-col items-end">
             <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Active Learning</span>
             </div>
          </div>
       </div>

       <div className="flex-1 relative z-10 p-8 flex gap-8">
          
          {/* LEFT: NEURAL GRID */}
          <div className="flex-1 relative border border-white/5 rounded-2xl bg-black/40 overflow-hidden flex items-center justify-center">
             <div className="grid grid-cols-8 gap-2 p-4">
                {Array.from({ length: 64 }).map((_, i) => (
                   <div 
                      key={i} 
                      className={`w-3 h-3 md:w-4 md:h-4 rounded-sm transition-all duration-300 ${activeNodes.includes(i) ? 'bg-indigo-500 shadow-[0_0_10px_#6366f1] scale-110' : 'bg-slate-800/40'}`}
                   ></div>
                ))}
             </div>
             
             {/* Central Processor Overlay */}
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-32 h-32 border border-indigo-500/30 rounded-full animate-[spin_10s_linear_infinite] flex items-center justify-center backdrop-blur-[1px]">
                   <div className="w-24 h-24 border border-indigo-400/20 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
                </div>
             </div>
          </div>

          {/* RIGHT: TERMINAL & METRICS */}
          <div className="w-64 flex flex-col gap-4">
             
             {/* Live Analysis Log */}
             <div className="flex-1 bg-black/60 rounded-2xl border border-white/10 p-4 font-mono text-[9px] relative overflow-hidden flex flex-col">
                <div className="absolute inset-0 bg-indigo-500/5 pointer-events-none"></div>
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/5 text-slate-500 font-bold uppercase tracking-wider">
                   <span className="flex items-center gap-1.5"><Terminal size={10} /> System Log</span>
                   <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                </div>
                <div className="flex-1 overflow-hidden flex flex-col gap-1.5">
                   {logs.map((log, i) => (
                      <div key={i} className="text-slate-300 animate-[slideIn_0.2s_ease-out]">
                         <span className="text-indigo-500 mr-2">{'>'}</span>{log}
                      </div>
                   ))}
                </div>
             </div>

             {/* Resources */}
             <div className="bg-slate-900/60 rounded-2xl border border-white/5 p-4 space-y-3">
                <div>
                   <div className="flex justify-between text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">
                      <span>Neural Load</span>
                      <span className="text-white">88%</span>
                   </div>
                   <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 animate-[shimmer_2s_infinite]" style={{ width: '88%' }}></div>
                   </div>
                </div>
                <div>
                   <div className="flex justify-between text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">
                      <span>Forensic Depth</span>
                      <span className="text-white">L4 Deep</span>
                   </div>
                   <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 animate-[shimmer_3s_infinite]" style={{ width: '92%' }}></div>
                   </div>
                </div>
             </div>

          </div>
       </div>
    </div>
  );
};

const MachineLearningPredictor: React.FC<MLProps> = ({ prediction, isLoading, currentPrice, t, onValidate }) => {
  // Live Simulation State
  const [frame, setFrame] = useState(0);
  const [activeModel, setActiveModel] = useState(0); // 0: LSTM, 1: XGB, 2: Transformer

  // Simulate Live "Thinking"
  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(f => f + 1);
      setActiveModel(Math.floor(Math.random() * 3));
    }, 2000); 
    return () => clearInterval(interval);
  }, []);

  if (isLoading || !prediction) {
    return (
      <div className="bg-slate-950/40 rounded-[3rem] p-12 border border-white/5 animate-pulse min-h-[600px] flex items-center justify-center">
         <div className="flex flex-col items-center gap-8">
            <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full animate-pulse"></div>
                <Atom className="w-24 h-24 text-indigo-500 animate-[spin_10s_linear_infinite] relative z-10" />
            </div>
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] animate-pulse">Calculating Quantum States...</span>
         </div>
      </div>
    );
  }

  // Mini Chart for Scenarios
  const MiniChart = ({ type }: { type: string }) => {
     const color = type === 'BULLISH' ? '#10b981' : type === 'BEARISH' ? '#f43f5e' : '#6366f1';
     const data = useMemo(() => Array.from({length: 20}, (_, i) => ({
        val: 50 + (type === 'BULLISH' ? i*3 : type === 'BEARISH' ? -i*3 : Math.sin(i)*10) + Math.random()*10
     })), [type]);
     
     return (
        <div className="h-16 w-full mt-6 mask-gradient-b opacity-50 grayscale group-hover/pod:grayscale-0 transition-all duration-500">
           <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                 <defs>
                    <linearGradient id={`grad-${type}`} x1="0" y1="0" x2="0" y2="1">
                       <stop offset="0%" stopColor={color} stopOpacity={0.4}/>
                       <stop offset="100%" stopColor={color} stopOpacity={0}/>
                    </linearGradient>
                 </defs>
                 <Area 
                    type="monotone" 
                    dataKey="val" 
                    stroke={color} 
                    fill={`url(#grad-${type})`} 
                    strokeWidth={2} 
                    isAnimationActive={false} 
                 />
              </AreaChart>
           </ResponsiveContainer>
        </div>
     )
  };

  const isUp = prediction.direction === 'UP';
  const colorClass = isUp ? 'text-emerald-400' : prediction.direction === 'DOWN' ? 'text-rose-400' : 'text-amber-400';

  return (
    <div className="cyber-card rounded-[3rem] p-10 border border-white/5 relative overflow-hidden group bg-[#020617] shadow-2xl transition-all duration-700 hover:shadow-[0_0_60px_rgba(99,102,241,0.05)]">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 p-16 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform rotate-12 duration-1000">
        <Brain className="w-96 h-96 text-indigo-400" />
      </div>
      <div className="absolute -left-20 top-1/2 w-80 h-80 bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none"></div>

      {/* --- HEADER --- */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-12 gap-8 relative z-10 border-b border-white/5 pb-8">
        <div className="flex items-center gap-8">
          <div className="relative">
             <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full"></div>
             <div className="relative p-5 bg-slate-900 rounded-[1.25rem] border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.15)] group-hover:border-indigo-500/50 transition-colors">
                <Network className="w-8 h-8 text-indigo-400 animate-pulse-slow" />
             </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none mb-2">{t.neuralForecast}</h3>
            <div className="flex items-center gap-4">
               <span className="px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-black text-indigo-300 uppercase tracking-widest">
                  v4.2 Ensemble
               </span>
               <div className="h-4 w-px bg-white/10"></div>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Activity size={12} className="text-emerald-500" /> Inference Active
               </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-8 self-end xl:self-auto">
           <div className="text-right hidden lg:block">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Model Confidence</span>
              <span className="text-3xl font-black font-mono text-white tracking-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{prediction.probability}%</span>
           </div>
           <div className="h-10 w-px bg-white/10 hidden lg:block"></div>
           <LiveClock />
        </div>
      </div>

      {/* --- MAIN GRID --- */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 relative z-10">
          
          {/* LEFT COL: METRICS & CHART */}
          <div className="xl:col-span-8 flex flex-col gap-8">
             
             {/* Key Metrics Row */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Detected Pattern */}
                <div className="bg-slate-950/40 p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group/pattern hover:border-indigo-500/30 transition-all">
                   <div className="flex justify-between items-start mb-6">
                      <div className="p-3 bg-white/5 rounded-2xl border border-white/5"><Scan size={20} className="text-slate-400" /></div>
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Algo Pattern</span>
                   </div>
                   <div className="relative z-10">
                      <span className="text-2xl font-black text-white uppercase tracking-tight block mb-2 leading-none">{prediction.patternDetected || "Consolidation"}</span>
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">High Probability Setup</span>
                   </div>
                   <div className="absolute right-0 bottom-0 p-6 opacity-5 pointer-events-none"><Layers size={100} /></div>
                </div>

                {/* Projected Target */}
                <div className="bg-slate-950/40 p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group/target hover:border-white/20 transition-all flex flex-col justify-center">
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover/target:animate-[scan_1.5s_ease-in-out_infinite]"></div>
                   <div className="flex justify-between items-center mb-2">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Projected Target</span>
                      <Target size={16} className={colorClass} />
                   </div>
                   <div className={`text-5xl font-black font-mono ${colorClass} tracking-tighter drop-shadow-[0_0_15px_currentColor]`}>
                      ${prediction.predictedPrice.toLocaleString()}
                   </div>
                </div>
             </div>

             {/* Cognitive Tensor Field (Replacing Chart) */}
             <CognitiveTensorField prediction={prediction} currentPrice={currentPrice} />
          </div>

          {/* RIGHT COL: CONSENSUS & SCENARIOS */}
          <div className="xl:col-span-4 flex flex-col gap-8">
             
             {/* Reasoning Block */}
             <div className="bg-slate-950/40 p-8 rounded-[2.5rem] border border-white/5 hover:border-white/10 transition-all group/reasoning relative overflow-hidden">
                <div className="absolute -right-4 -top-4 opacity-10 rotate-12"><Sparkles size={80} className="text-white" /></div>
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
                   <Brain size={12} className="text-indigo-400" /> AI Logic Synthesis
                </h4>
                <div className="relative z-10 border-l-2 border-indigo-500/30 pl-4 py-1">
                   <p className="text-[11px] text-slate-300 leading-relaxed font-bold line-clamp-5 opacity-90 font-mono">
                      "{prediction.reasoning}"
                   </p>
                </div>
             </div>

             {/* Neural Topology (Ensemble Consensus) */}
             <div className="bg-slate-950/40 p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden min-h-[350px] flex flex-col">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.05),transparent_70%)] pointer-events-none"></div>
                
                <div className="flex justify-between items-start mb-8 relative z-10">
                   <div>
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.25em] flex items-center gap-2 mb-1">
                         <Share2 className="w-3 h-3 text-indigo-400" /> Neural Topology
                      </span>
                      <h4 className="text-lg font-black text-white uppercase tracking-tighter">Consensus Engine</h4>
                   </div>
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></div>
                </div>

                {/* The Neural Triangle Viz */}
                <div className="flex-1 relative flex items-center justify-center">
                   {/* Connector Lines */}
                   <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
                      <defs>
                         <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0" />
                            <stop offset="50%" stopColor="#6366f1" stopOpacity="1" />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                         </linearGradient>
                      </defs>
                      <path d="M 150 40 L 60 180" stroke="url(#lineGrad)" strokeWidth="1" strokeDasharray="4 4" className="animate-[pulse_3s_infinite]" />
                      <path d="M 150 40 L 240 180" stroke="url(#lineGrad)" strokeWidth="1" strokeDasharray="4 4" className="animate-[pulse_3s_infinite]" />
                      <path d="M 60 180 L 240 180" stroke="url(#lineGrad)" strokeWidth="1" strokeDasharray="4 4" className="animate-[pulse_3s_infinite]" />
                   </svg>

                   {/* Nodes positioned in triangle */}
                   <div className="absolute top-[0%] left-1/2 -translate-x-1/2">
                      <PulseNode active={activeModel === 2} color="indigo" label="Transformer" icon={Brain} vote={prediction.ensembleVotes.transformer} />
                   </div>
                   
                   <div className="absolute bottom-[10%] left-[0%]">
                      <PulseNode active={activeModel === 0} color="emerald" label="LSTM" icon={Clock} vote={prediction.ensembleVotes.lstm} />
                   </div>

                   <div className="absolute bottom-[10%] right-[0%]">
                      <PulseNode active={activeModel === 1} color="amber" label="XGBoost" icon={Hexagon} vote={prediction.ensembleVotes.xgboost} />
                   </div>

                   {/* Center Core */}
                   <div className="absolute top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 flex flex-col items-center">
                      <div className="w-24 h-24 bg-indigo-500/5 rounded-full blur-xl animate-pulse absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                      <div className="relative z-10 bg-slate-900 border border-indigo-500/30 p-3 rounded-full shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                         <Atom className="w-6 h-6 text-white animate-[spin_8s_linear_infinite]" />
                      </div>
                   </div>
                </div>
             </div>
          </div>
      </div>

      {/* --- SCENARIO PODS --- */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
         {prediction.scenarios.map((s, i) => {
            const isBull = s.type === 'BULLISH';
            const isBear = s.type === 'BEARISH';
            const accentColor = isBull ? 'emerald' : isBear ? 'rose' : 'indigo';
            const borderColor = isBull ? 'border-emerald-500/20' : isBear ? 'border-rose-500/20' : 'border-indigo-500/20';
            const bgColor = isBull ? 'bg-emerald-500/5' : isBear ? 'bg-rose-500/5' : 'bg-indigo-500/5';
            
            return (
            <div key={i} className={`p-8 rounded-[2.5rem] border ${borderColor} ${bgColor} relative overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl group/pod`}>
               <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="flex items-center gap-3">
                     <span className={`w-2.5 h-2.5 rounded-full ${isBull ? 'bg-emerald-500' : isBear ? 'bg-rose-500' : 'bg-indigo-500'} animate-pulse shadow-[0_0_10px_currentColor]`}></span>
                     <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isBull ? 'text-emerald-400' : isBear ? 'text-rose-400' : 'text-indigo-400'}`}>
                        {t[s.type] || s.type}
                     </span>
                  </div>
                  <span className="text-4xl font-black font-mono text-white tracking-tighter opacity-90">{s.probability}%</span>
               </div>
               
               <MiniChart type={s.type} />
               
               <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-end relative z-10">
                  <div>
                     <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block mb-1">{t.targetProjection}</span>
                     <span className="text-xl font-black font-mono text-white tracking-tight">${s.targetPrice.toLocaleString()}</span>
                  </div>
                  <div className={`p-2 rounded-xl bg-white/5 border border-white/5 group-hover/pod:bg-white/10 transition-colors`}>
                     <ArrowRight className={`w-4 h-4 ${isBull ? 'text-emerald-500 -rotate-45' : isBear ? 'text-rose-500 rotate-45' : 'text-indigo-500'}`} />
                  </div>
               </div>
               
               {/* Hover Effect Glow */}
               <div className={`absolute inset-0 bg-gradient-to-br from-transparent to-${accentColor}-500/10 opacity-0 group-hover/pod:opacity-100 transition-opacity duration-500 pointer-events-none`}></div>
            </div>
         )})}
      </div>

      {/* --- FOOTER ACTION --- */}
      <div className="mt-12 pt-8 border-t border-white/5 flex justify-center relative z-10">
          <button 
             onClick={onValidate} 
             className="px-12 py-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-[10px] font-black uppercase tracking-[0.25em] text-white transition-all flex items-center gap-4 hover:scale-105 group/btn active:scale-95 hover:border-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]"
          >
             {isLoading ? (
                <>PROCESSING <RefreshCcw size={14} className="animate-spin text-indigo-400" /></>
             ) : (
                <>{t.validateCognitiveInference} <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform text-indigo-400" /></>
             )}
          </button>
      </div>
    </div>
  );
};

export default MachineLearningPredictor;
