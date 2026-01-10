
import React, { useState, useEffect, useMemo } from 'react';
import { MLPrediction } from '../types';
import { 
  Cpu, Zap, Binary, ChevronRight, Share2, ShieldCheck, Activity, 
  Target, Network, Info, TrendingUp, TrendingDown, Languages, 
  GitMerge, Layers, Brain, Terminal, ScanFace
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine } from 'recharts';

interface MLProps {
  prediction?: MLPrediction;
  isLoading: boolean;
  currentPrice?: number;
  t: any;
  onValidate?: () => void;
}

// --- Sub-Component: Neural Activation Grid ---
const NeuralGrid = () => {
  const [cells, setCells] = useState(Array(48).fill(0));

  useEffect(() => {
    const interval = setInterval(() => {
      setCells(prev => prev.map(() => Math.random() > 0.7 ? Math.random() : 0));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-12 gap-1 h-12 w-full opacity-60">
      {cells.map((val, i) => (
        <div 
          key={i} 
          className="rounded-[1px] transition-all duration-300"
          style={{ 
            backgroundColor: val > 0 ? `rgba(99, 102, 241, ${val})` : 'rgba(30, 41, 59, 0.3)',
            boxShadow: val > 0.8 ? '0 0 4px #6366f1' : 'none',
            transform: val > 0.9 ? 'scale(1.2)' : 'scale(1)'
          }}
        />
      ))}
    </div>
  );
};

// --- Sub-Component: Confidence Heartbeat ---
const ConfidenceHeartbeat = ({ baseConfidence }: { baseConfidence: number }) => {
  const [data, setData] = useState(Array(30).fill({ val: baseConfidence }));

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        const noise = (Math.random() - 0.5) * 4;
        const newVal = Math.min(100, Math.max(0, baseConfidence + noise));
        return [...prev.slice(1), { val: newVal }];
      });
    }, 100);
    return () => clearInterval(interval);
  }, [baseConfidence]);

  return (
    <div className="h-10 w-32">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.4}/>
              <stop offset="100%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Area 
            type="monotone" 
            dataKey="val" 
            stroke="#10b981" 
            strokeWidth={2} 
            fill="url(#confGrad)" 
            isAnimationActive={false} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const MachineLearningPredictor: React.FC<MLProps> = ({ prediction, isLoading, currentPrice, t, onValidate }) => {
  // Live Simulation State
  const [inferenceTime, setInferenceTime] = useState(12);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setInferenceTime(prev => Math.max(8, Math.min(25, prev + (Math.random() - 0.5) * 5)));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading && !prediction) {
    return (
      <div className="bg-slate-900/80 border-2 border-slate-800 rounded-[2rem] md:rounded-[3.5rem] p-6 md:p-14 relative overflow-hidden shadow-2xl min-h-[600px] flex flex-col items-center justify-center">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>
        <div className="relative z-10 flex flex-col items-center gap-8">
           <div className="w-24 h-24 relative">
              <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full animate-[spin_3s_linear_infinite]"></div>
              <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-[spin_1s_linear_infinite]"></div>
              <Brain className="absolute inset-0 m-auto w-10 h-10 text-indigo-400 animate-pulse" />
           </div>
           <div className="flex flex-col items-center gap-2">
              <span className="text-xl font-black text-white uppercase tracking-widest animate-pulse">Initializing Tensor Cores</span>
              <span className="text-xs font-mono text-indigo-400">Loading Weights: 8.4B Parameters</span>
           </div>
        </div>
      </div>
    );
  }

  if (!prediction) return null;

  const isUp = prediction.direction === 'UP';
  const isDown = prediction.direction === 'DOWN';
  const directionColor = isUp ? 'text-emerald-400' : isDown ? 'text-rose-400' : 'text-amber-400';
  const directionBg = isUp ? 'bg-emerald-500/10' : isDown ? 'bg-rose-500/10' : 'bg-amber-500/10';
  const directionBorder = isUp ? 'border-emerald-500/30' : isDown ? 'border-rose-500/30' : 'border-amber-500/30';

  // Ensemble Data Preparation
  const ensembleData = [
    { name: 'LSTM (Time)', vote: prediction.ensembleVotes.lstm, score: prediction.ensembleVotes.lstm === 'BUY' ? 85 : prediction.ensembleVotes.lstm === 'SELL' ? 15 : 50 },
    { name: 'XGB (Pattern)', vote: prediction.ensembleVotes.xgboost, score: prediction.ensembleVotes.xgboost === 'BUY' ? 92 : prediction.ensembleVotes.xgboost === 'SELL' ? 8 : 45 },
    { name: 'Transformer', vote: prediction.ensembleVotes.transformer, score: prediction.ensembleVotes.transformer === 'BUY' ? 78 : prediction.ensembleVotes.transformer === 'SELL' ? 22 : 55 },
  ];

  return (
    <div className="bg-slate-900/90 border-2 border-slate-800 rounded-[2rem] md:rounded-[4rem] p-6 md:p-12 shadow-3xl relative overflow-hidden group">
      {/* Background FX */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full group-hover:bg-indigo-600/20 transition-all duration-1000 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-50"></div>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 md:mb-12 relative z-10 gap-6">
        <div className="flex items-center gap-6">
          <div className="p-5 bg-indigo-500/10 rounded-3xl border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.15)] relative overflow-hidden">
            <Cpu className="w-10 h-10 text-indigo-400 relative z-10" />
            <div className="absolute inset-0 bg-indigo-500/20 blur-xl animate-pulse"></div>
          </div>
          <div className="text-start">
            <h3 className="text-2xl md:text-4xl font-black text-white tracking-tighter uppercase italic leading-none">{t.neuralForecast}</h3>
            <div className="flex items-center gap-4 mt-3">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{t.inferenceEngineLabel} v4.2</span>
               <div className="h-3 w-px bg-slate-700"></div>
               <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></div>
                  TENSOR CORES ACTIVE
               </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
           <div className="flex flex-col items-end">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Inference Latency</span>
              <span className="text-xl font-mono font-black text-indigo-300">{inferenceTime.toFixed(0)}ms</span>
           </div>
           <div className="p-3 bg-slate-950/50 rounded-2xl border border-white/10">
              <Activity className="w-6 h-6 text-indigo-500 animate-pulse" />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 relative z-10">
        
        {/* LEFT COLUMN: Prediction Core */}
        <div className="xl:col-span-5 flex flex-col gap-8">
           
           {/* Main Prediction Card */}
           <div className={`bg-slate-950/60 p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] border relative overflow-hidden transition-all duration-500 flex flex-col justify-between h-full shadow-2xl ${directionBorder}`}>
              <div className={`absolute top-0 right-0 p-12 opacity-[0.05] transition-transform duration-700 ${isUp ? 'rotate-0' : 'rotate-180'}`}>
                 <TrendingUp className={`w-64 h-64 ${directionColor}`} />
              </div>

              <div>
                 <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] block mb-6">{t.targetProjection}</span>
                 <div className="flex items-baseline gap-4 mb-2">
                    <span className={`text-4xl md:text-6xl font-black font-mono tracking-tighter ${directionColor} drop-shadow-lg`}>
                       ${prediction.predictedPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className={`px-4 py-1.5 rounded-xl text-[12px] font-black uppercase tracking-widest border backdrop-blur-md ${directionBg} ${directionColor} ${directionBorder}`}>
                       {t[prediction.direction.toLowerCase()] || prediction.direction}
                    </div>
                    {prediction.direction !== 'SIDEWAYS' && (
                       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          {Math.abs(((prediction.predictedPrice - (currentPrice || 0)) / (currentPrice || 1)) * 100).toFixed(2)}% {isUp ? 'Upside' : 'Downside'}
                       </span>
                    )}
                 </div>
              </div>

              <div className="mt-10 pt-10 border-t border-white/5">
                 <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Model Confidence</span>
                    <span className="text-2xl font-black font-mono text-white">{prediction.probability}%</span>
                 </div>
                 <div className="relative h-4 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                    <div 
                       className={`absolute top-0 left-0 h-full transition-all duration-1000 ${isUp ? 'bg-emerald-500' : isDown ? 'bg-rose-500' : 'bg-amber-500'}`}
                       style={{ width: `${prediction.probability}%` }}
                    >
                       <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    </div>
                 </div>
                 <div className="mt-4 flex justify-between items-center">
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Live Fluctuations</span>
                    <ConfidenceHeartbeat baseConfidence={prediction.probability} />
                 </div>
              </div>
           </div>

        </div>

        {/* RIGHT COLUMN: Pattern & Logic */}
        <div className="xl:col-span-7 flex flex-col gap-8">
           
           {/* Pattern Recognition Card */}
           <div className="bg-slate-950/40 border border-white/5 rounded-[2rem] md:rounded-[3.5rem] p-6 md:p-10 relative overflow-hidden flex flex-col shadow-lg group/pattern">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                       <ScanFace className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h4 className="text-[12px] font-black text-white uppercase tracking-[0.3em]">{t.patternSynthesis}</h4>
                 </div>
                 <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest animate-pulse border border-indigo-500/30 px-3 py-1 rounded-lg bg-indigo-500/5">Match Found</div>
              </div>

              <div className="relative z-10 mb-8">
                 <h3 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter mb-2 group-hover/pattern:text-indigo-300 transition-colors">
                    {prediction.patternDetected}
                 </h3>
                 <p className="text-xl font-black text-slate-500 uppercase tracking-tight" dir="rtl">
                    {prediction.patternDetectedAr}
                 </p>
              </div>

              <div className="flex-1 bg-black/20 rounded-3xl p-6 border border-white/5 overflow-y-auto custom-scrollbar relative">
                 <div className="flex gap-4">
                    <div className="flex flex-col items-center gap-1 pt-1">
                       <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366f1]"></div>
                       <div className="w-px h-full bg-indigo-500/20"></div>
                    </div>
                    <div className="space-y-4">
                       <p className="text-[13px] text-slate-300 font-bold leading-relaxed font-mono">
                          <span className="text-indigo-400 mr-2">{'>'}</span>{prediction.reasoning}
                       </p>
                       <p className="text-[14px] text-slate-400 font-bold leading-relaxed font-sans" dir="rtl">
                          {prediction.reasoningAr}
                       </p>
                    </div>
                 </div>
              </div>
           </div>

           {/* Ensemble Consensus Visualizer */}
           <div className="bg-slate-950/40 border border-white/5 rounded-[2rem] md:rounded-[3rem] p-6 md:p-8 relative overflow-hidden flex flex-col justify-center">
              <div className="flex justify-between items-center mb-6">
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <GitMerge className="w-4 h-4 text-white" /> {t.ensembleVoting}
                 </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {ensembleData.map((model, i) => (
                    <div key={i} className="bg-slate-900/50 rounded-2xl p-4 border border-white/5 flex flex-col gap-3 group/model hover:border-indigo-500/30 transition-all">
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{model.name}</span>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${model.vote === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : model.vote === 'SELL' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                             {model.vote}
                          </span>
                       </div>
                       <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div 
                             className={`h-full transition-all duration-1000 ${model.vote === 'BUY' ? 'bg-emerald-500' : model.vote === 'SELL' ? 'bg-rose-500' : 'bg-amber-500'}`} 
                             style={{ width: `${model.score}%` }}
                          />
                       </div>
                    </div>
                 ))}
              </div>
           </div>

        </div>
      </div>

      {/* Footer: Neural Activation Grid & Validation */}
      <div className="mt-12 pt-10 border-t-2 border-white/5 grid grid-cols-1 md:grid-cols-2 gap-10 items-center relative z-10">
         <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center text-[9px] font-black text-slate-500 uppercase tracking-widest">
               <span className="flex items-center gap-2"><Layers className="w-3 h-3" /> Neural Layer Activation</span>
               <span className="text-indigo-400 animate-pulse">Processing...</span>
            </div>
            <NeuralGrid />
         </div>

         <div className="flex justify-end">
            <button 
              onClick={onValidate}
              className="w-full md:w-auto px-10 py-5 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 rounded-3xl text-[11px] font-black uppercase tracking-[0.3em] text-indigo-300 transition-all flex items-center justify-center gap-4 group/btn hover:scale-105 hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]"
            >
              {t.validateCognitiveInference} <ChevronRight className={`w-4 h-4 group-hover/btn:translate-x-2 transition-transform ${t.lang === 'ar' ? 'rotate-180' : ''}`} />
            </button>
         </div>
      </div>

    </div>
  );
};

export default MachineLearningPredictor;
