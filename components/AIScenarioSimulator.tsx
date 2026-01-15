
import React, { useState, useEffect, useMemo } from 'react';
import { MLPrediction } from '../types';
import { 
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, ReferenceLine, 
  Tooltip, ComposedChart, Line, Scatter, Cell, LineChart
} from 'recharts';
import { 
  Brain, Zap, AlertTriangle, TrendingUp, TrendingDown, Target, 
  Newspaper, Clock, Activity, Share2, Hexagon, GitMerge,
  Maximize, Minimize, GitPullRequest, Radio
} from 'lucide-react';

interface Props {
  prediction?: MLPrediction;
  currentPrice: number;
  isLoading: boolean;
  t: any;
}

// --- Helper Components ---

const PulseNode = ({ active, color, label, icon: Icon }: any) => (
  <div className="flex flex-col items-center gap-3 relative group z-10">
    <div className={`relative p-4 rounded-2xl border-2 transition-all duration-300 ${active ? `bg-${color}-500/10 border-${color}-500/50 shadow-[0_0_30px_rgba(var(--${color}-rgb),0.3)] scale-110` : 'bg-slate-900 border-white/10'}`}>
      <Icon className={`w-6 h-6 ${active ? `text-${color}-400` : 'text-slate-500'}`} />
      {active && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-${color}-400 opacity-75`}></span>
          <span className={`relative inline-flex rounded-full h-3 w-3 bg-${color}-500`}></span>
        </span>
      )}
    </div>
    <span className={`text-[10px] font-black uppercase tracking-widest bg-black/50 px-2 py-1 rounded border border-white/5 ${active ? 'text-white' : 'text-slate-600'}`}>{label}</span>
  </div>
);

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
    }, 800);
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
          probability: p.probability * (1 + (Math.random() - 0.5) * 0.02)
       })));
    }, 100);

    return () => clearInterval(waveInterval);
  }, [prediction, frame]); // Re-gen on frame update sparingly or just separate effect

  if (isLoading || !prediction) {
    return (
      <div className="bg-slate-950/40 rounded-[2rem] md:rounded-[4rem] p-6 md:p-12 border border-white/5 animate-pulse min-h-[600px]">
         <div className="flex items-center gap-6 mb-12">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl"></div>
            <div className="w-64 h-8 bg-slate-800 rounded-xl"></div>
         </div>
      </div>
    );
  }

  // --- Dynamic Styles ---
  const getVoteColor = (vote: string) => {
    if (vote === 'BUY') return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (vote === 'SELL') return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
    return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
  };

  // Helper for Chart inside component to avoid import issues if any
  const MiniChart = ({ type }: { type: string }) => {
     const color = type === 'BULLISH' ? '#10b981' : type === 'BEARISH' ? '#f43f5e' : '#6366f1';
     const data = Array.from({length: 15}, (_, i) => ({
        val: 50 + (type === 'BULLISH' ? i*2 : type === 'BEARISH' ? -i*2 : Math.sin(i)*5) + Math.random()*5
     }));
     
     return (
        <div className="h-12 w-full mt-4 mask-gradient-b opacity-50">
           <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                 <defs>
                    <linearGradient id={`grad-${type}`} x1="0" y1="0" x2="0" y2="1">
                       <stop offset="0%" stopColor={color} stopOpacity={0.4}/>
                       <stop offset="100%" stopColor={color} stopOpacity={0}/>
                    </linearGradient>
                 </defs>
                 <Area type="monotone" dataKey="val" stroke={color} fill={`url(#grad-${type})`} strokeWidth={2} isAnimationActive={false} />
              </AreaChart>
           </ResponsiveContainer>
        </div>
     )
  };

  return (
    <div className="cyber-card rounded-[2rem] md:rounded-[4rem] p-6 md:p-12 border border-white/5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform">
        <Brain className="w-64 h-64 text-indigo-400" />
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-8 md:mb-12 relative z-10">
        <div className="flex items-center gap-6">
          <div className="p-5 bg-indigo-500/10 rounded-3xl border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.15)] relative">
            <GitMerge className="w-8 h-8 text-indigo-400 relative z-10" />
            <div className="absolute inset-0 bg-indigo-500/20 blur-xl animate-pulse"></div>
          </div>
          <div>
            <h3 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase italic leading-none">{t.quantumIntelligence}</h3>
            <div className="flex items-center gap-3 mt-3">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">{t.ensembleVoting}</span>
               <div className="h-px w-8 bg-slate-700"></div>
               <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                 <Radio className="w-3 h-3 animate-ping" /> Live Inference
               </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 flex items-center gap-3">
              <Activity className="w-4 h-4 text-indigo-400" />
              <div className="flex flex-col">
                 <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Active Threads</span>
                 <span className="text-xs font-mono font-black text-white">128 / 128</span>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 relative z-10">
        
        {/* COL 1: Neural Ensemble Visualizer (Left) */}
        <div className="xl:col-span-5 bg-slate-950/40 p-6 md:p-8 rounded-[2rem] md:rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden flex flex-col justify-between">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.05),transparent_70%)]"></div>
           
           <div className="flex justify-between items-start mb-8 relative z-10">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                 <Share2 className="w-4 h-4 text-indigo-400" /> {t.neuralSynapseActivationMap}
              </span>
           </div>

           {/* The Neural Triangle */}
           <div className="flex-1 relative flex items-center justify-center min-h-[300px]">
              {/* Connector SVG Layer */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
                 <line x1="50%" y1="20%" x2="20%" y2="80%" stroke="#6366f1" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse" />
                 <line x1="50%" y1="20%" x2="80%" y2="80%" stroke="#6366f1" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse" />
                 <line x1="20%" y1="80%" x2="80%" y2="80%" stroke="#6366f1" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse" />
                 
                 {/* Data Flow Particles */}
                 <circle r="3" fill="#fff">
                    <animateMotion dur="2s" repeatCount="indefinite" path="M 50 20 L 20 80" />
                 </circle>
                 <circle r="3" fill="#fff">
                    <animateMotion dur="1.5s" repeatCount="indefinite" path="M 80 80 L 50 20" />
                 </circle>
              </svg>

              {/* Nodes */}
              <div className="absolute top-[10%] left-1/2 -translate-x-1/2">
                 <PulseNode active={activeModel === 2} color="indigo" label="Transformer" icon={Brain} />
                 <div className={`mt-2 text-center text-xs font-black px-3 py-1 rounded border backdrop-blur-md ${getVoteColor(prediction.ensembleVotes.transformer)}`}>
                    {prediction.ensembleVotes.transformer}
                 </div>
              </div>
              
              <div className="absolute bottom-[10%] left-[10%]">
                 <PulseNode active={activeModel === 0} color="emerald" label="LSTM (Time)" icon={Clock} />
                 <div className={`mt-2 text-center text-xs font-black px-3 py-1 rounded border backdrop-blur-md ${getVoteColor(prediction.ensembleVotes.lstm)}`}>
                    {prediction.ensembleVotes.lstm}
                 </div>
              </div>

              <div className="absolute bottom-[10%] right-[10%]">
                 <PulseNode active={activeModel === 1} color="amber" label="XGBoost (Pattern)" icon={Hexagon} />
                 <div className={`mt-2 text-center text-xs font-black px-3 py-1 rounded border backdrop-blur-md ${getVoteColor(prediction.ensembleVotes.xgboost)}`}>
                    {prediction.ensembleVotes.xgboost}
                 </div>
              </div>

              {/* Center Core */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/4 z-0">
                 <div className="w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl animate-pulse"></div>
              </div>
           </div>
           
           <div className="mt-4 flex justify-between items-center bg-black/20 p-4 rounded-2xl border border-white/5">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t.modelConsensus}</span>
              <div className="flex items-center gap-2">
                 <div className="h-1.5 w-24 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 animate-[shimmer_2s_infinite]" style={{ width: '85%' }}></div>
                 </div>
                 <span className="text-[10px] font-mono font-bold text-white">85% Match</span>
              </div>
           </div>
        </div>

        {/* COL 2: Probability Density Field (Right) */}
        <div className="xl:col-span-7 flex flex-col gap-8">
           
           {/* Bell Curve Chart */}
           <div className="bg-slate-950/40 p-6 md:p-8 rounded-[2rem] md:rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden h-[350px] flex flex-col">
              <div className="flex justify-between items-start mb-4 relative z-10">
                 <div>
                    <h4 className="text-[13px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                       <Target className="w-5 h-5 text-indigo-400" /> Probability Density Field
                    </h4>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1 block">Quantum Superposition of Price Outcomes</span>
                 </div>
                 <span className="text-2xl font-black font-mono text-white tracking-tighter">${prediction.predictedPrice.toFixed(2)}</span>
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
                       />
                       <Tooltip 
                          content={({ active, payload }) => {
                             if (active && payload && payload.length) {
                                return (
                                   <div className="bg-slate-900 border border-white/10 p-2 rounded-lg shadow-xl">
                                      <p className="text-[10px] font-mono text-white">Price: ${payload[0].payload.price.toFixed(2)}</p>
                                      <p className="text-[10px] font-mono text-indigo-400">Prob: {(payload[0].payload.probability * 100).toFixed(4)}%</p>
                                   </div>
                                )
                             }
                             return null;
                          }}
                       />
                       <ReferenceLine x={prediction.predictedPrice} stroke="#fff" strokeDasharray="3 3" />
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
                 
                 {/* Overlay Text */}
                 <div className="absolute top-4 right-4 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-lg">
                    <span className="text-[9px] font-black text-indigo-300 uppercase tracking-widest animate-pulse">Live Gaussian Flux</span>
                 </div>
              </div>
           </div>

           {/* Event Horizon Timeline */}
           <div className="bg-slate-950/40 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-white/5 relative overflow-hidden flex-1">
              <div className="flex items-center gap-3 mb-6">
                 <Clock className="w-5 h-5 text-amber-400" />
                 <h4 className="text-[11px] font-black text-white uppercase tracking-[0.3em]">{t.eventResponseMatrix}</h4>
              </div>
              
              <div className="relative h-20 w-full flex items-center">
                 {/* Timeline Line */}
                 <div className="absolute left-0 right-0 h-0.5 bg-slate-800 top-1/2 -translate-y-1/2"></div>
                 
                 {/* Events */}
                 {prediction.newsImpact.map((news, i) => {
                    const offset = (i + 1) * 20; // Simulated time offset
                    const size = news.expectedVolatility === 'HIGH' ? 12 : news.expectedVolatility === 'EXTREME' ? 16 : 8;
                    const color = news.bias === 'POSITIVE' ? 'bg-emerald-500' : news.bias === 'NEGATIVE' ? 'bg-rose-500' : 'bg-slate-500';
                    
                    return (
                       <div 
                          key={i} 
                          className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center group/event cursor-pointer hover:z-20 transition-all"
                          style={{ left: `${offset}%` }}
                       >
                          <div className={`rounded-full border-4 border-slate-950 ${color} shadow-[0_0_15px_currentColor] transition-transform group-hover/event:scale-150`} style={{ width: size * 2, height: size * 2 }}></div>
                          
                          {/* Tooltip */}
                          <div className="absolute top-full mt-4 opacity-0 group-hover/event:opacity-100 transition-opacity bg-slate-900/90 border border-white/10 p-3 rounded-xl w-48 text-center backdrop-blur-md pointer-events-none z-20">
                             <span className="text-[10px] font-black text-white uppercase block mb-1">{news.event}</span>
                             <span className={`text-[9px] font-bold uppercase ${color.replace('bg-', 'text-')}`}>{news.expectedVolatility} VOLATILITY</span>
                             <span className="text-[8px] text-slate-500 block mt-1">{t.lang === 'ar' ? 'خلال' : 'In'}: {news.timeUntil}</span>
                          </div>
                          
                          {/* Connection Line */}
                          <div className="h-4 w-px bg-slate-700 absolute top-full"></div>
                       </div>
                    )
                 })}
              </div>
           </div>

        </div>
      </div>

      {/* Bottom: Monte Carlo Paths */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
         {prediction.scenarios.map((s, i) => (
            <div key={i} className={`p-6 rounded-[2rem] md:rounded-[2.5rem] border relative overflow-hidden transition-all duration-500 hover:-translate-y-1 ${s.type === 'BULLISH' ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40' : s.type === 'BEARISH' ? 'bg-rose-500/5 border-rose-500/20 hover:border-rose-500/40' : 'bg-indigo-500/5 border-indigo-500/20 hover:border-indigo-500/40'}`}>
               <div className="flex justify-between items-start mb-4">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border ${s.type === 'BULLISH' ? 'text-emerald-400 border-emerald-500/30' : s.type === 'BEARISH' ? 'text-rose-400 border-rose-500/30' : 'text-indigo-400 border-indigo-500/30'}`}>
                     {t[s.type] || s.type}
                  </span>
                  <span className="text-xl font-black font-mono text-white">{s.probability}%</span>
               </div>
               
               <MiniChart type={s.type} />
               
               <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{t.targetProjection}</span>
                  <span className="text-sm font-black font-mono text-white">${s.targetPrice.toLocaleString()}</span>
               </div>
            </div>
         ))}
      </div>

    </div>
  );
};

export default AIScenarioSimulator;
