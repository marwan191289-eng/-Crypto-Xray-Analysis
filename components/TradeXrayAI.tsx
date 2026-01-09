
import React, { useState, useEffect, useMemo } from 'react';
import { AIAnalysis } from '../types';
import { 
  Brain, Target, Quote, Activity, Crosshair, ShieldCheck, Zap, 
  TrendingUp, TrendingDown, Languages, AlertTriangle, ChevronDown, 
  Info, Cpu, Network, Scan, Radio, Lock, BarChart3, Layers
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis } from 'recharts';

interface TradeXrayAIProps {
  analysis?: AIAnalysis;
  isLoading: boolean;
  t: any;
  currentPrice?: number;
}

const NeuralActivityChart = () => {
  const [data, setData] = useState(Array(30).fill(0).map(() => ({ v: Math.random() * 100 })));

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        const next = [...prev.slice(1), { v: 30 + Math.random() * 70 }];
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-12 w-full opacity-50">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <Bar dataKey="v" fill="#3B82F6" radius={[2, 2, 0, 0]} isAnimationActive={false}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={`rgba(59, 130, 246, ${0.2 + (entry.v / 200)})`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const LiveLevelTracker = ({ current, support, resistance }: { current: number, support: number, resistance: number }) => {
  if (!support || !resistance || !current) return null;
  
  const range = resistance - support;
  const position = Math.min(Math.max((current - support) / range, 0), 1) * 100;
  
  return (
    <div className="relative h-4 bg-slate-900/50 rounded-full border border-white/10 overflow-visible mt-2 group">
      {/* Track */}
      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500/50 to-rose-500/50 -translate-y-1/2"></div>
      
      {/* Support Marker */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center">
         <div className="w-1.5 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981]"></div>
         <span className="absolute top-full mt-2 text-[9px] font-mono text-emerald-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">S: {support.toLocaleString()}</span>
      </div>

      {/* Resistance Marker */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 flex flex-col items-center">
         <div className="w-1.5 h-3 bg-rose-500 rounded-full shadow-[0_0_10px_#f43f5e]"></div>
         <span className="absolute top-full mt-2 text-[9px] font-mono text-rose-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">R: {resistance.toLocaleString()}</span>
      </div>

      {/* Current Price Cursor */}
      <div 
        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_15px_white] z-10 border-2 border-slate-900 cursor-help transition-all duration-300"
        style={{ left: `${position}%` }}
      >
        <div className="absolute inset-0 bg-accent rounded-full animate-ping opacity-50"></div>
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-accent px-2 py-0.5 rounded text-[9px] font-black text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          ${current.toLocaleString()}
        </div>
      </div>
    </div>
  );
};

const TradeXrayAI: React.FC<TradeXrayAIProps> = ({ analysis, isLoading, t, currentPrice }) => {
  const [expandedReasoning, setExpandedReasoning] = useState(false);
  const [activeTab, setActiveTab] = useState<'reasoning' | 'levels' | 'zones'>('reasoning');

  // Simulated Live Metrics
  const [inferenceLatency, setInferenceLatency] = useState(120);
  const [tensorOps, setTensorOps] = useState(4.2);

  useEffect(() => {
    const timer = setInterval(() => {
      setInferenceLatency(prev => 100 + Math.random() * 50);
      setTensorOps(prev => 4 + Math.random());
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading && !analysis) {
    return (
      <div className="bg-slate-950/40 animate-pulse space-y-8 min-h-[600px] border border-white/5 rounded-[4rem] p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>
        <div className="flex items-center gap-6 mb-12">
           <div className="w-16 h-16 bg-slate-800/50 rounded-3xl"></div>
           <div className="h-8 w-64 bg-slate-800/50 rounded-xl"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="h-64 bg-slate-800/30 rounded-[3rem]"></div>
           <div className="h-64 bg-slate-800/30 rounded-[3rem]"></div>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  // Signal Styles
  const signalMap: Record<string, { color: string, bg: string, glow: string, label: string }> = {
    'STRONG BUY': { color: 'text-emerald-400', bg: 'bg-emerald-500/10', glow: 'shadow-[0_0_50px_rgba(16,185,129,0.4)]', label: 'STRONG BUY' },
    'BUY': { color: 'text-emerald-400', bg: 'bg-emerald-500/10', glow: 'shadow-[0_0_30px_rgba(16,185,129,0.2)]', label: 'BUY' },
    'STRONG SELL': { color: 'text-rose-500', bg: 'bg-rose-500/10', glow: 'shadow-[0_0_50px_rgba(244,63,94,0.4)]', label: 'STRONG SELL' },
    'SELL': { color: 'text-rose-400', bg: 'bg-rose-500/10', glow: 'shadow-[0_0_30px_rgba(244,63,94,0.2)]', label: 'SELL' },
    'WAIT': { color: 'text-amber-400', bg: 'bg-amber-500/10', glow: 'shadow-[0_0_30px_rgba(251,191,36,0.2)]', label: 'WAIT' },
  };

  const sig = signalMap[analysis.signal] || signalMap['WAIT'];
  const volatilityVal = analysis.volatilityIndex || 0;
  const isHighVol = volatilityVal > 3.0;

  return (
    <div className={`cyber-card overflow-hidden transition-all duration-700 min-w-0 border-white/10 shadow-3xl rounded-[4rem] p-0 relative group ${analysis.isFallback ? 'border-amber-500/30' : ''}`}>
      
      {/* Top Status Bar */}
      <div className="bg-black/40 border-b border-white/5 px-10 py-4 flex justify-between items-center backdrop-blur-md">
        <div className="flex items-center gap-4">
           <Activity className="w-4 h-4 text-accent animate-pulse" />
           <span className="text-[10px] font-black text-muted uppercase tracking-[0.3em]">{t.quantumNeuralInterpretation}</span>
        </div>
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2">
             <Cpu className="w-3.5 h-3.5 text-slate-500" />
             <span className="text-[9px] font-mono font-bold text-slate-400">{tensorOps.toFixed(1)} T-Ops</span>
           </div>
           <div className="flex items-center gap-2">
             <Network className="w-3.5 h-3.5 text-slate-500" />
             <span className="text-[9px] font-mono font-bold text-slate-400">{inferenceLatency.toFixed(0)}ms</span>
           </div>
           {analysis.isFallback && (
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[9px] font-black rounded uppercase border border-amber-500/30 animate-pulse">Fallback Mode</span>
           )}
        </div>
      </div>

      <div className="p-10 lg:p-14 space-y-12">
        
        {/* Main Signal Core */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
           
           {/* Left: Signal Hologram */}
           <div className="lg:col-span-7 relative">
              <div className={`relative z-10 p-12 rounded-[3.5rem] border-2 border-white/5 bg-slate-900/60 backdrop-blur-xl flex flex-col items-center justify-center text-center overflow-hidden transition-all duration-500 ${sig.glow}`}>
                 {/* Animated Scan Line */}
                 <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-[200%] w-full animate-[scan_4s_linear_infinite] pointer-events-none"></div>
                 
                 <div className="mb-6 relative">
                    <Target className={`w-16 h-16 ${sig.color} opacity-80`} />
                    <div className={`absolute inset-0 ${sig.color} blur-2xl opacity-40 animate-pulse`}></div>
                 </div>

                 <h2 className={`text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none mb-4 drop-shadow-lg ${sig.color}`}>
                   {t[sig.label.replace(' ', '').toLowerCase()] || sig.label}
                 </h2>
                 
                 <div className="flex items-center gap-4 mt-4 px-6 py-2 rounded-full bg-black/40 border border-white/10">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{t.neuralConsensusSignal}</span>
                    <div className={`w-2 h-2 rounded-full ${sig.color} shadow-[0_0_10px_currentColor] animate-pulse`}></div>
                 </div>
              </div>

              {/* Live Price Context */}
              {currentPrice && (
                <div className="mt-8 px-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.priceStructure}</span>
                    <span className="text-xs font-mono font-black text-white">${currentPrice.toLocaleString()}</span>
                  </div>
                  <LiveLevelTracker 
                    current={currentPrice} 
                    support={analysis.keyLevels.support[0]} 
                    resistance={analysis.keyLevels.resistance[0]} 
                  />
                </div>
              )}
           </div>

           {/* Right: Metrics Grid */}
           <div className="lg:col-span-5 grid grid-cols-1 gap-6">
              
              {/* Confidence Card */}
              <div className="bg-slate-950/60 border border-white/10 p-8 rounded-[2.5rem] relative overflow-hidden">
                 <div className="flex justify-between items-start mb-6">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.engineConfidence}</span>
                    <ShieldCheck className="w-5 h-5 text-accent" />
                 </div>
                 <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-white font-mono tracking-tighter">{analysis.confidence}%</span>
                    <span className="text-[10px] font-black text-accent uppercase tracking-widest">High Fidelity</span>
                 </div>
                 <div className="mt-4 h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-accent transition-all duration-1000" style={{ width: `${analysis.confidence}%` }}></div>
                 </div>
              </div>

              {/* Sentiment Score */}
              <div className="bg-slate-950/60 border border-white/10 p-8 rounded-[2.5rem] relative overflow-hidden">
                 <div className="flex justify-between items-start mb-6">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.aiSentimentScore}</span>
                    <Brain className="w-5 h-5 text-gold" />
                 </div>
                 <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-white font-mono tracking-tighter">{analysis.score}</span>
                    <span className="text-[10px] font-black text-gold uppercase tracking-widest">/ 100</span>
                 </div>
                 <NeuralActivityChart />
              </div>

              {/* Volatility */}
              <div className={`bg-slate-950/60 border p-8 rounded-[2.5rem] relative overflow-hidden transition-colors ${isHighVol ? 'border-rose-500/30' : 'border-white/10'}`}>
                 <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.volatilityIndex}</span>
                    <Zap className={`w-5 h-5 ${isHighVol ? 'text-rose-500' : 'text-emerald-400'}`} />
                 </div>
                 <div className="flex items-center gap-4">
                    <span className={`text-3xl font-black font-mono tracking-tighter ${isHighVol ? 'text-rose-500' : 'text-emerald-400'}`}>{volatilityVal.toFixed(2)}%</span>
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${isHighVol ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                      {isHighVol ? t.high : t.low}
                    </span>
                 </div>
              </div>

           </div>
        </div>

        {/* Tabbed Intelligence Section */}
        <div className="bg-black/20 border-2 border-white/5 rounded-[3.5rem] overflow-hidden">
           {/* Tab Headers */}
           <div className="flex border-b border-white/5">
              <button 
                onClick={() => setActiveTab('reasoning')}
                className={`flex-1 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${activeTab === 'reasoning' ? 'bg-accent/10 text-accent border-b-2 border-accent' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
              >
                <Languages className="w-4 h-4" /> {t.forensicLogicSummary}
              </button>
              <button 
                onClick={() => setActiveTab('zones')}
                className={`flex-1 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${activeTab === 'zones' ? 'bg-accent/10 text-accent border-b-2 border-accent' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
              >
                <Crosshair className="w-4 h-4" /> {t.liquidationZones}
              </button>
              <button 
                onClick={() => setActiveTab('levels')}
                className={`flex-1 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${activeTab === 'levels' ? 'bg-accent/10 text-accent border-b-2 border-accent' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
              >
                <Layers className="w-4 h-4" /> {t.structuralLiquidityZones}
              </button>
           </div>

           {/* Tab Content */}
           <div className="p-10 min-h-[300px]">
              
              {activeTab === 'reasoning' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-[fadeIn_0.5s_ease-out]">
                   <div className="space-y-4" dir="rtl">
                      <div className="flex items-center gap-2 mb-2 opacity-50">
                        <Radio className="w-3 h-3 text-accent" />
                        <span className="text-[9px] font-black text-muted uppercase tracking-widest">{t.arabicLog}</span>
                      </div>
                      <p className="text-lg text-text-bright font-bold leading-relaxed italic opacity-90">
                        "{analysis.reasoningAr}"
                      </p>
                   </div>
                   <div className="space-y-4" dir="ltr">
                      <div className="flex items-center gap-2 mb-2 opacity-50">
                        <Radio className="w-3 h-3 text-accent" />
                        <span className="text-[9px] font-black text-muted uppercase tracking-widest">{t.englishLog}</span>
                      </div>
                      <p className="text-lg text-text-bright font-bold leading-relaxed italic opacity-90">
                        "{analysis.reasoningEn}"
                      </p>
                   </div>
                </div>
              )}

              {activeTab === 'zones' && (
                <div className="space-y-4 animate-[fadeIn_0.5s_ease-out]">
                   {analysis.liquidationZones?.map((zone, i) => {
                     const proximity = currentPrice ? Math.abs(currentPrice - zone.price) / currentPrice : 1;
                     const isClose = proximity < 0.02;
                     return (
                       <div key={i} className={`flex items-center justify-between p-6 rounded-3xl border transition-all ${isClose ? 'bg-accent/10 border-accent/40 shadow-[0_0_20px_rgba(59,130,246,0.15)]' : 'bg-slate-900/50 border-white/5'}`}>
                          <div className="flex items-center gap-6">
                             <div className={`p-3 rounded-2xl ${zone.type === 'SHORT' ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                <AlertTriangle className="w-5 h-5" />
                             </div>
                             <div>
                                <span className={`text-[11px] font-black uppercase tracking-widest block mb-1 ${zone.type === 'SHORT' ? 'text-rose-400' : 'text-emerald-400'}`}>{zone.type === 'SHORT' ? t.shortLiq : t.longLiq}</span>
                                <span className="text-2xl font-black text-white font-mono tracking-tighter">${zone.price.toLocaleString()}</span>
                             </div>
                          </div>
                          <div className="text-right">
                             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">{t.estLiqVolume}</span>
                             <span className="text-lg font-black font-mono text-white">{zone.volume.toLocaleString()}</span>
                          </div>
                       </div>
                     );
                   })}
                   {(!analysis.liquidationZones || analysis.liquidationZones.length === 0) && (
                     <div className="text-center py-10 text-slate-500 font-black uppercase tracking-widest opacity-50">{t.scanningSecondary}</div>
                   )}
                </div>
              )}

              {activeTab === 'levels' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-[fadeIn_0.5s_ease-out]">
                   <div className="bg-emerald-500/5 border border-emerald-500/10 p-8 rounded-[2.5rem] relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                        <TrendingUp className="w-24 h-24 text-emerald-500" />
                      </div>
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block mb-4">{t.primarySupport}</span>
                      <div className="space-y-2 relative z-10">
                        {analysis.keyLevels.support.slice(0, 3).map((lvl, i) => (
                          <div key={i} className="flex justify-between items-center border-b border-emerald-500/10 pb-2 last:border-0">
                            <span className="text-xl font-black font-mono text-white">${lvl.toLocaleString()}</span>
                            <span className="text-[9px] font-bold text-emerald-500/60">S{i+1}</span>
                          </div>
                        ))}
                      </div>
                   </div>

                   <div className="bg-rose-500/5 border border-rose-500/10 p-8 rounded-[2.5rem] relative overflow-hidden group hover:border-rose-500/30 transition-all">
                      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                        <TrendingDown className="w-24 h-24 text-rose-500" />
                      </div>
                      <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest block mb-4">{t.primaryResistance}</span>
                      <div className="space-y-2 relative z-10">
                        {analysis.keyLevels.resistance.slice(0, 3).map((lvl, i) => (
                          <div key={i} className="flex justify-between items-center border-b border-rose-500/10 pb-2 last:border-0">
                            <span className="text-xl font-black font-mono text-white">${lvl.toLocaleString()}</span>
                            <span className="text-[9px] font-bold text-rose-500/60">R{i+1}</span>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>
              )}
           </div>
        </div>

      </div>
    </div>
  );
};

export default TradeXrayAI;
