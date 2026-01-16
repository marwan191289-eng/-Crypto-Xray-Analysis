
import React, { useState, useEffect, useMemo } from 'react';
import { AIAnalysis } from '../types';
import { 
  Brain, Target, Activity, Crosshair, ShieldCheck, Zap, 
  TrendingUp, TrendingDown, Languages, AlertTriangle, Cpu, Network, Scan, Radio, Layers,
  Terminal, Shield
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

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
      setData(prev => [...prev.slice(1), { v: 30 + Math.random() * 70 }]);
    }, 100);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="h-12 w-full opacity-50">
      <ResponsiveContainer width="100%" height="100%"><BarChart data={data}><Bar dataKey="v" isAnimationActive={false}>{data.map((entry, index) => <Cell key={`cell-${index}`} fill={`rgba(59, 130, 246, ${0.2 + (entry.v / 200)})`} />)}</Bar></BarChart></ResponsiveContainer>
    </div>
  );
};

const TradeXrayAI: React.FC<TradeXrayAIProps> = ({ analysis, isLoading, t, currentPrice }) => {
  const [activeTab, setActiveTab] = useState<'reasoning' | 'levels' | 'zones'>('reasoning');

  if (isLoading && !analysis) return <div className="min-h-[600px] animate-pulse bg-slate-900 rounded-[3.5rem]"></div>;
  if (!analysis) return null;

  const signalMap: Record<string, { color: string, glow: string, label: string, border: string, shadow: string }> = {
    'STRONG BUY': { color: 'text-emerald-400', glow: 'rgba(16, 185, 129, 0.4)', label: 'STRONG BUY', border: 'border-emerald-500', shadow: 'shadow-emerald-500/20' },
    'BUY': { color: 'text-emerald-400', glow: 'rgba(16, 185, 129, 0.2)', label: 'BUY', border: 'border-emerald-400', shadow: 'shadow-emerald-400/10' },
    'STRONG SELL': { color: 'text-rose-500', glow: 'rgba(244, 63, 94, 0.4)', label: 'STRONG SELL', border: 'border-rose-600', shadow: 'shadow-rose-600/20' },
    'SELL': { color: 'text-rose-400', glow: 'rgba(244, 63, 94, 0.2)', label: 'SELL', border: 'border-rose-500', shadow: 'shadow-rose-500/10' },
    'WAIT': { color: 'text-amber-400', glow: 'rgba(251, 191, 36, 0.2)', label: 'WAIT', border: 'border-amber-500', shadow: 'shadow-amber-500/10' },
  };

  const sig = signalMap[analysis.signal] || signalMap['WAIT'];

  return (
    <div className="cyber-card overflow-hidden transition-all duration-700 min-w-0 border-white/10 shadow-3xl rounded-[3.5rem] p-0 relative group">
      <div className="bg-black/40 border-b border-white/5 px-10 py-5 flex justify-between items-center backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Activity className="w-4 h-4 text-accent animate-pulse" />
          <span className="text-[10px] font-black text-muted uppercase tracking-[0.3em]">{t.quantumNeuralInterpretation}</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[9px] font-mono font-bold text-slate-400">G8-INFERENCE CORE v2.8</span>
          </div>
        </div>
      </div>

      <div className="p-10 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
           <div className="lg:col-span-7 relative">
              <div className="relative z-10 p-12 rounded-[3.5rem] border-2 border-white/5 bg-slate-900/60 backdrop-blur-xl flex flex-col items-center justify-center text-center overflow-hidden" style={{ boxShadow: `0 0 50px ${sig.glow}` }}>
                 <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-[200%] w-full animate-[scan_4s_linear_infinite] pointer-events-none opacity-20"></div>
                 <div className="mb-8 relative"><Target className={`w-16 h-16 ${sig.color} opacity-80`} /><div className={`absolute inset-0 ${sig.color} blur-2xl opacity-40 animate-pulse`}></div></div>
                 <h2 className={`text-5xl lg:text-7xl font-black italic tracking-tighter uppercase leading-none drop-shadow-lg ${sig.color}`}>{t[sig.label.replace(' ', '').toLowerCase()] || sig.label}</h2>
              </div>
           </div>
           <div className="lg:col-span-5 grid grid-cols-1 gap-6">
              <div className="bg-slate-950/60 border border-white/10 p-8 rounded-[2.5rem] relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.engineConfidence}</span>
                  <ShieldCheck className="w-5 h-5 text-accent" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-white font-mono tracking-tighter">{analysis.confidence}%</span>
                </div>
                <div className="mt-4 h-1.5 w-full bg-slate-900 rounded-full overflow-hidden shadow-inner">
                  <div className="h-full bg-accent transition-all duration-1000 shadow-[0_0_10px_#3b82f6]" style={{ width: `${analysis.confidence}%` }}></div>
                </div>
              </div>
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
           </div>
        </div>

        <div className="bg-black/20 border-2 border-white/5 rounded-[3.5rem] overflow-hidden shadow-2xl">
           <div className="flex border-b border-white/5 bg-white/[0.02]">
              <button onClick={() => setActiveTab('reasoning')} className={`flex-1 py-6 text-[11px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 ${activeTab === 'reasoning' ? 'bg-accent/10 text-accent border-b-2 border-accent' : 'text-slate-500 hover:text-slate-300'}`}>
                <Terminal className="w-4 h-4" /> {t.forensicLogicSummary}
              </button>
              <button onClick={() => setActiveTab('zones')} className={`flex-1 py-6 text-[11px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 ${activeTab === 'zones' ? 'bg-accent/10 text-accent border-b-2 border-accent' : 'text-slate-500 hover:text-slate-300'}`}>
                <Crosshair className="w-4 h-4" /> {t.liquidationZones}
              </button>
           </div>
           <div className="p-10 min-h-[400px] relative">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none"></div>
              {activeTab === 'reasoning' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-[fadeIn_0.5s_ease-out]">
                   {/* Arabic Reasoning Container */}
                   <div className={`relative group/reason p-8 rounded-[2.5rem] bg-gradient-to-br from-white/[0.04] to-transparent border border-white/5 shadow-2xl overflow-hidden transition-all duration-500 hover:border-white/20`} dir="rtl">
                      <div className={`absolute top-0 bottom-0 right-0 w-1.5 rounded-full ${sig.border.replace('border-', 'bg-')} shadow-[0_0_20px_currentColor] opacity-60 group-hover/reason:opacity-100 transition-opacity`}></div>
                      <div className="absolute -bottom-10 -left-10 opacity-5 group-hover/reason:opacity-10 transition-opacity rotate-12">
                        <Brain className="w-40 h-40" />
                      </div>
                      <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-accent/10 rounded-xl border border-accent/20">
                          <Radio className="w-4 h-4 text-accent animate-pulse" />
                        </div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{t.arabicLog}</span>
                      </div>
                      <p className="text-2xl text-text-bright font-black leading-[1.6] tracking-tight relative z-10 font-sans italic pr-6 group-hover/reason:text-white transition-colors">
                        "{analysis.reasoningAr}"
                      </p>
                      <div className="mt-8 flex items-center gap-2 opacity-30">
                        <div className="h-1 w-12 bg-white/20 rounded-full"></div>
                        <div className="h-1 w-1 bg-white/20 rounded-full"></div>
                      </div>
                   </div>

                   {/* English Reasoning Container */}
                   <div className={`relative group/reason p-8 rounded-[2.5rem] bg-gradient-to-bl from-white/[0.04] to-transparent border border-white/5 shadow-2xl overflow-hidden transition-all duration-500 hover:border-white/20`} dir="ltr">
                      <div className={`absolute top-0 bottom-0 left-0 w-1.5 rounded-full ${sig.border.replace('border-', 'bg-')} shadow-[0_0_20px_currentColor] opacity-60 group-hover/reason:opacity-100 transition-opacity`}></div>
                      <div className="absolute -bottom-10 -right-10 opacity-5 group-hover/reason:opacity-10 transition-opacity -rotate-12">
                        <Shield className="w-40 h-40" />
                      </div>
                      <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-accent/10 rounded-xl border border-accent/20">
                          <Radio className="w-4 h-4 text-accent animate-pulse" />
                        </div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{t.englishLog}</span>
                      </div>
                      <p className="text-2xl text-text-bright font-black leading-[1.6] tracking-tight relative z-10 font-sans italic pl-6 group-hover/reason:text-white transition-colors">
                        "{analysis.reasoningEn}"
                      </p>
                      <div className="mt-8 flex items-center gap-2 opacity-30">
                        <div className="h-1 w-12 bg-white/20 rounded-full"></div>
                        <div className="h-1 w-1 bg-white/20 rounded-full"></div>
                      </div>
                   </div>
                </div>
              )}
              {activeTab === 'zones' && (
                <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
                   {analysis.liquidationZones?.map((zone, i) => (
                     <div key={i} className="flex items-center justify-between p-8 rounded-[2rem] border border-white/5 bg-slate-900/40 hover:bg-slate-900/70 transition-all hover:border-white/20 group/zone shadow-xl">
                        <div className="flex items-center gap-8">
                          <div className={`p-5 rounded-2xl shadow-lg border transition-all group-hover/zone:scale-110 ${zone.type === 'SHORT' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-rose-500/10' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/10'}`}>
                            <AlertTriangle className="w-7 h-7" />
                          </div>
                          <div>
                            <span className={`text-[12px] font-black uppercase tracking-[0.2em] block mb-2 ${zone.type === 'SHORT' ? 'text-rose-400' : 'text-emerald-400'}`}>
                              {zone.type === 'SHORT' ? t.shortLiq : t.longLiq}
                            </span>
                            <span className="text-4xl font-black text-white font-mono tracking-tighter drop-shadow-md">
                              ${zone.price.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] block mb-2">Liquidity Delta</span>
                          <span className="text-2xl font-black font-mono text-indigo-300 tabular-nums">
                            {zone.volume.toLocaleString()} <span className="text-xs text-slate-600">LOTS</span>
                          </span>
                        </div>
                     </div>
                   ))}
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default TradeXrayAI;
