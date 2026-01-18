
import React, { useState, useEffect, useMemo } from 'react';
import { MLPrediction } from '../types';
import { 
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, ReferenceLine, 
  Tooltip, ComposedChart, Line, Scatter, Cell
} from 'recharts';
import { 
  Brain, Zap, AlertTriangle, TrendingUp, TrendingDown, Target, 
  Newspaper, Clock, Activity, Share2, Hexagon, GitMerge,
  Maximize, Minimize, GitPullRequest, Radio, Layers, Atom, ArrowUpRight
} from 'lucide-react';

interface Props {
  prediction?: MLPrediction;
  currentPrice: number;
  isLoading: boolean;
  t: any;
}

// --- Helper Components ---

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

const PulseNode = ({ active, color, label, icon: Icon, vote }: any) => {
  const voteColor = vote === 'BUY' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : 
                    vote === 'SELL' ? 'text-rose-400 border-rose-500/30 bg-rose-500/10' : 
                    'text-amber-400 border-amber-500/30 bg-amber-500/10';
  
  return (
    <div className="flex flex-col items-center gap-3 relative group z-10">
      <div className={`relative p-3 md:p-4 rounded-2xl border-2 transition-all duration-500 ${active ? `bg-${color}-500/10 border-${color}-500/50 shadow-[0_0_30px_rgba(var(--${color}-rgb),0.3)] scale-110` : 'bg-slate-900 border-white/10'}`}>
        <Icon className={`w-5 h-5 md:w-6 md:h-6 ${active ? `text-${color}-400` : 'text-slate-500'}`} />
        {active && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-${color}-400 opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 bg-${color}-500`}></span>
          </span>
        )}
      </div>
      <div className="flex flex-col items-center">
         <span className={`text-[9px] font-black uppercase tracking-widest mb-1 ${active ? 'text-white' : 'text-slate-600'}`}>{label}</span>
         <div className={`text-[8px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${voteColor}`}>
            {vote}
         </div>
      </div>
    </div>
  );
};

const AIScenarioSimulator: React.FC<Props> = ({ prediction, currentPrice, isLoading, t }) => {
  // Live Simulation State
  const [frame, setFrame] = useState(0);
  const [probabilityCurve, setProbabilityCurve] = useState<any[]>([]);
  const [activeModel, setActiveModel] = useState(0); // 0: LSTM, 1: XGB, 2: Transformer

  // Simulate Live "Thinking"
  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(f => f + 1);
      setActiveModel(Math.floor(Math.random() * 3));
    }, 1200); // Slower switching for better readability
    return () => clearInterval(interval);
  }, []);

  // Generate Gaussian Curve for Probability Field
  useEffect(() => {
    if (!prediction) return;
    
    const generateCurve = () => {
      const mean = prediction.predictedPrice;
      const sigma = prediction.predictedPrice * 0.02; // 2% volatility width
      const points = [];
      const steps = 40;
      const range = sigma * 3.5;
      
      for (let i = -steps; i <= steps; i++) {
        const x = mean + (i / steps) * range;
        const exponent = -((x - mean) ** 2) / (2 * sigma ** 2);
        let prob = Math.exp(exponent);
        
        // Add "Live" noise
        prob *= (1 + (Math.random() - 0.5) * 0.05);
        
        points.push({ price: x, probability: prob });
      }
      return points;
    };

    setProbabilityCurve(generateCurve());
    
    const waveInterval = setInterval(() => {
       setProbabilityCurve(prev => prev.map(p => ({
          ...p,
          probability: p.probability * (1 + (Math.random() - 0.5) * 0.05) // More pronounced breathing
       })));
    }, 200);

    return () => clearInterval(waveInterval);
  }, [prediction]);

  if (isLoading || !prediction) {
    return (
      <div className="bg-slate-950/40 rounded-[2rem] md:rounded-[4rem] p-6 md:p-12 border border-white/5 animate-pulse min-h-[600px] flex items-center justify-center">
         <div className="flex flex-col items-center gap-6">
            <Atom className="w-20 h-20 text-indigo-500 animate-spin-slow" />
            <span className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em]">Calculating Quantum States...</span>
         </div>
      </div>
    );
  }

  // Helper for Chart inside component
  const MiniChart = ({ type }: { type: string }) => {
     const color = type === 'BULLISH' ? '#10b981' : type === 'BEARISH' ? '#f43f5e' : '#6366f1';
     const data = useMemo(() => Array.from({length: 20}, (_, i) => ({
        val: 50 + (type === 'BULLISH' ? i*3 : type === 'BEARISH' ? -i*3 : Math.sin(i)*10) + Math.random()*10
     })), [type]);
     
     return (
        <div className="h-16 w-full mt-4 mask-gradient-b opacity-60">
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

  return (
    <div className="cyber-card rounded-[2rem] md:rounded-[3rem] p-8 border border-white/5 relative overflow-hidden group bg-[#020617]">
      <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform">
        <Brain className="w-64 h-64 text-indigo-400" />
      </div>

      {/* --- HEADER --- */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-10 gap-8 relative z-10 border-b border-white/5 pb-8">
        <div className="flex items-center gap-6">
          <div className="relative">
             <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full"></div>
             <div className="relative p-4 bg-slate-900 rounded-2xl border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.15)]">
                <GitMerge className="w-8 h-8 text-indigo-400 animate-pulse" />
             </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">{t.quantumIntelligence}</h3>
            <div className="flex items-center gap-3 mt-2">
               <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-black text-indigo-300 uppercase tracking-widest">
                  {t.ensembleVoting}
               </span>
               <div className="h-1 w-1 bg-slate-600 rounded-full"></div>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Radio size={10} className="text-emerald-500 animate-ping" /> Live Inference
               </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6 self-end xl:self-auto">
           <div className="text-right hidden md:block">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Active Threads</span>
              <div className="flex items-center justify-end gap-2">
                 <Activity size={12} className="text-indigo-400" />
                 <span className="text-xl font-black font-mono text-white tracking-tight">128/128</span>
              </div>
           </div>
           <div className="h-8 w-px bg-white/10 hidden md:block"></div>
           <LiveClock />
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 relative z-10">
        
        {/* COL 1: Neural Ensemble Visualizer (Left) */}
        <div className="xl:col-span-5 bg-slate-950/40 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden flex flex-col justify-between group/ensemble">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.05),transparent_70%)]"></div>
           
           <div className="flex justify-between items-start mb-8 relative z-10">
              <div>
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-1">
                    <Share2 className="w-3 h-3 text-indigo-400" /> {t.neuralSynapseActivationMap}
                 </span>
                 <h4 className="text-lg font-black text-white uppercase tracking-tighter">Consensus Engine</h4>
              </div>
              <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                 <span className="text-[9px] font-black text-indigo-300 uppercase tracking-wider animate-pulse">Running</span>
              </div>
           </div>

           {/* The Neural Triangle */}
           <div className="flex-1 relative flex items-center justify-center min-h-[350px]">
              {/* Connector SVG Layer */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                 <defs>
                    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                       <stop offset="0%" stopColor="#6366f1" stopOpacity="0" />
                       <stop offset="50%" stopColor="#6366f1" stopOpacity="1" />
                       <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                    </linearGradient>
                 </defs>
                 <line x1="50%" y1="20%" x2="20%" y2="80%" stroke="url(#lineGrad)" strokeWidth="1" strokeDasharray="4,4" className="animate-[pulse_3s_infinite]" />
                 <line x1="50%" y1="20%" x2="80%" y2="80%" stroke="url(#lineGrad)" strokeWidth="1" strokeDasharray="4,4" className="animate-[pulse_3s_infinite]" />
                 <line x1="20%" y1="80%" x2="80%" y2="80%" stroke="url(#lineGrad)" strokeWidth="1" strokeDasharray="4,4" className="animate-[pulse_3s_infinite]" />
                 
                 {/* Data Flow Particles */}
                 <circle r="2" fill="#fff" filter="drop-shadow(0 0 4px #fff)">
                    <animateMotion dur="4s" repeatCount="indefinite" path="M 50 20 L 20 80 L 80 80 Z" />
                 </circle>
                 <circle r="2" fill="#818cf8" filter="drop-shadow(0 0 4px #818cf8)">
                    <animateMotion dur="3s" repeatCount="indefinite" path="M 80 80 L 50 20 L 20 80 Z" />
                 </circle>
              </svg>

              {/* Nodes */}
              <div className="absolute top-[5%] left-1/2 -translate-x-1/2 transition-transform duration-700 hover:scale-110">
                 <PulseNode active={activeModel === 2} color="indigo" label="Transformer" icon={Brain} vote={prediction.ensembleVotes.transformer} />
              </div>
              
              <div className="absolute bottom-[10%] left-[5%] transition-transform duration-700 hover:scale-110">
                 <PulseNode active={activeModel === 0} color="emerald" label="LSTM (Time)" icon={Clock} vote={prediction.ensembleVotes.lstm} />
              </div>

              <div className="absolute bottom-[10%] right-[5%] transition-transform duration-700 hover:scale-110">
                 <PulseNode active={activeModel === 1} color="amber" label="XGBoost (Pattern)" icon={Hexagon} vote={prediction.ensembleVotes.xgboost} />
              </div>

              {/* Center Core */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/3 z-0 flex flex-col items-center">
                 <div className="w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl animate-pulse absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                 <div className="relative z-10 bg-slate-900 border border-indigo-500/30 p-4 rounded-full shadow-[0_0_40px_rgba(99,102,241,0.2)]">
                    <Atom className="w-8 h-8 text-white animate-[spin_10s_linear_infinite]" />
                 </div>
                 <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mt-3 bg-black/40 px-2 py-1 rounded">Consensus Core</span>
              </div>
           </div>
           
           <div className="mt-4 bg-black/20 p-4 rounded-2xl border border-white/5 relative overflow-hidden">
              <div className="flex justify-between items-center relative z-10">
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t.modelConsensus}</span>
                 <span className="text-lg font-mono font-black text-white tracking-tight">85.4%</span>
              </div>
              <div className="h-1 w-full bg-slate-800 rounded-full mt-2 overflow-hidden">
                 <div className="h-full bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500 animate-[shimmer_2s_infinite]" style={{ width: '85.4%' }}></div>
              </div>
           </div>
        </div>

        {/* COL 2: Probability & Events (Right) */}
        <div className="xl:col-span-7 flex flex-col gap-8">
           
           {/* Probability Field */}
           <div className="bg-slate-950/40 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden h-[380px] flex flex-col group/prob">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none"></div>
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                 <div>
                    <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2 mb-1">
                       <Target className="w-4 h-4 text-indigo-400" /> Probability Density Field
                    </h4>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Quantum Superposition of Price Outcomes</span>
                 </div>
                 <div className="flex flex-col items-end">
                    <span className="text-[8px] font-black text-indigo-300 uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded animate-pulse mb-1">
                       Gaussian Flux
                    </span>
                    <span className="text-2xl font-black font-mono text-white tracking-tighter">${prediction.predictedPrice.toLocaleString()}</span>
                 </div>
              </div>

              <div className="flex-1 w-full relative z-10">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={probabilityCurve}>
                       <defs>
                          <linearGradient id="probGrad" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#6366f1" stopOpacity={0.6}/>
                             <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <XAxis 
                          dataKey="price" 
                          stroke="#475569" 
                          fontSize={10} 
                          tickFormatter={(val) => val.toFixed(0)} 
                          minTickGap={30}
                          axisLine={false}
                          tickLine={false}
                          dy={10}
                          fontFamily="monospace"
                          fontWeight={700}
                       />
                       <Tooltip 
                          content={({ active, payload }) => {
                             if (active && payload && payload.length) {
                                return (
                                   <div className="bg-slate-900 border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-md">
                                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Projection</p>
                                      <p className="text-sm font-mono font-black text-white mb-1">${payload[0].payload.price.toFixed(2)}</p>
                                      <p className="text-[10px] font-mono font-bold text-indigo-400">Prob: {(payload[0].payload.probability * 100).toFixed(4)}%</p>
                                   </div>
                                )
                             }
                             return null;
                          }}
                          cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1, strokeDasharray: '4 4' }}
                       />
                       <ReferenceLine x={prediction.predictedPrice} stroke="#fff" strokeDasharray="3 3" label={{ position: 'insideTop', value: 'TARGET', fill: '#fff', fontSize: 10, fontWeight: 900, dy: 10 }} />
                       {currentPrice && (
                          <ReferenceLine x={currentPrice} stroke="#10b981" strokeDasharray="3 3" label={{ position: 'insideTop', value: 'CURRENT', fill: '#10b981', fontSize: 10, fontWeight: 900, dy: 10 }} />
                       )}
                       <Area 
                          type="monotone" 
                          dataKey="probability" 
                          stroke="#6366f1" 
                          strokeWidth={3} 
                          fill="url(#probGrad)" 
                          animationDuration={0} // Disable animation for smoother live updates
                          isAnimationActive={false}
                       />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* Event Horizon Timeline */}
           <div className="bg-slate-950/40 p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden flex-1 group/timeline">
              <div className="flex items-center gap-3 mb-8">
                 <Clock className="w-5 h-5 text-amber-400" />
                 <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">{t.eventResponseMatrix}</h4>
              </div>
              
              <div className="relative h-24 w-full flex items-center">
                 {/* Timeline Line */}
                 <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 top-1/2 -translate-y-1/2"></div>
                 
                 {/* Events */}
                 {prediction.newsImpact.map((news, i) => {
                    const offset = 15 + (i * 25); // Spacing
                    const size = news.expectedVolatility === 'HIGH' ? 14 : news.expectedVolatility === 'EXTREME' ? 18 : 10;
                    const color = news.bias === 'POSITIVE' ? 'bg-emerald-500' : news.bias === 'NEGATIVE' ? 'bg-rose-500' : 'bg-slate-500';
                    const glow = news.bias === 'POSITIVE' ? 'shadow-[0_0_20px_rgba(16,185,129,0.4)]' : news.bias === 'NEGATIVE' ? 'shadow-[0_0_20px_rgba(244,63,94,0.4)]' : 'shadow-[0_0_20px_rgba(148,163,184,0.2)]';
                    
                    return (
                       <div 
                          key={i} 
                          className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center group/event cursor-pointer z-10"
                          style={{ left: `${offset}%` }}
                       >
                          {/* Orb */}
                          <div className={`rounded-full border-4 border-slate-950 ${color} ${glow} transition-all duration-300 group-hover/event:scale-125`} style={{ width: size * 2, height: size * 2 }}></div>
                          
                          {/* Info Card (Hover) */}
                          <div className="absolute top-full mt-4 opacity-0 group-hover/event:opacity-100 transition-all duration-300 transform translate-y-2 group-hover/event:translate-y-0 bg-slate-900 border border-white/10 p-4 rounded-xl w-56 text-center backdrop-blur-xl shadow-2xl z-20 pointer-events-none">
                             <div className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1">{t.lang === 'ar' ? 'خلال' : 'In'}: {news.timeUntil}</div>
                             <span className="text-[10px] font-black text-white uppercase block mb-2 leading-tight">{news.event}</span>
                             <div className={`text-[8px] font-bold uppercase inline-block px-2 py-0.5 rounded border ${color.replace('bg-', 'text-').replace('500', '400')} border-white/10`}>
                                {news.expectedVolatility} VOLATILITY
                             </div>
                          </div>
                          
                          {/* Connection Line */}
                          <div className="h-4 w-px bg-white/10 absolute top-full transition-all group-hover/event:h-6 group-hover/event:bg-white/30"></div>
                       </div>
                    )
                 })}
              </div>
           </div>

        </div>
      </div>

      {/* --- SCENARIO PODS --- */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
         {prediction.scenarios.map((s, i) => {
            const isBull = s.type === 'BULLISH';
            const isBear = s.type === 'BEARISH';
            const accentColor = isBull ? 'emerald' : isBear ? 'rose' : 'indigo';
            const borderColor = isBull ? 'border-emerald-500/20' : isBear ? 'border-rose-500/20' : 'border-indigo-500/20';
            const bgColor = isBull ? 'bg-emerald-500/5' : isBear ? 'bg-rose-500/5' : 'bg-indigo-500/5';
            
            return (
            <div key={i} className={`p-6 rounded-[2.5rem] border ${borderColor} ${bgColor} relative overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl group/pod`}>
               <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex items-center gap-2">
                     <span className={`w-2 h-2 rounded-full ${isBull ? 'bg-emerald-500' : isBear ? 'bg-rose-500' : 'bg-indigo-500'} animate-pulse`}></span>
                     <span className={`text-[10px] font-black uppercase tracking-widest ${isBull ? 'text-emerald-400' : isBear ? 'text-rose-400' : 'text-indigo-400'}`}>
                        {t[s.type] || s.type}
                     </span>
                  </div>
                  <span className="text-3xl font-black font-mono text-white tracking-tighter opacity-90">{s.probability}%</span>
               </div>
               
               <MiniChart type={s.type} />
               
               <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-end relative z-10">
                  <div>
                     <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block mb-1">{t.targetProjection}</span>
                     <span className="text-lg font-black font-mono text-white tracking-tight">${s.targetPrice.toLocaleString()}</span>
                  </div>
                  <ArrowUpRight className={`w-5 h-5 ${isBull ? 'text-emerald-500' : isBear ? 'text-rose-500 rotate-90' : 'text-indigo-500'}`} />
               </div>
               
               {/* Hover Effect Glow */}
               <div className={`absolute inset-0 bg-gradient-to-br from-transparent to-${accentColor}-500/10 opacity-0 group-hover/pod:opacity-100 transition-opacity duration-500`}></div>
            </div>
         )})}
      </div>

    </div>
  );
};

export default AIScenarioSimulator;
