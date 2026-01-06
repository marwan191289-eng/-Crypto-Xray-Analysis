
import React from 'react';
import { AIAnalysis } from '../types';
import { Brain, Target, Quote, Activity, Crosshair, ShieldCheck, Zap, TrendingUp, TrendingDown, Languages } from 'lucide-react';
import { SignalBadge } from './MarketUI';

interface TradeXrayAIProps {
  analysis?: AIAnalysis;
  isLoading: boolean;
  t: any;
}

const TradeXrayAI: React.FC<TradeXrayAIProps> = ({ analysis, isLoading, t }) => {
  if (isLoading && !analysis) {
    return (
      <div className="cyber-card animate-pulse space-y-8 min-h-[500px] border-accent/20 rounded-[4rem] p-12">
        <div className="h-10 w-1/4 bg-slate-800/40 rounded-xl"></div>
        <div className="h-40 w-full bg-slate-800/20 rounded-[2.5rem]"></div>
      </div>
    );
  }

  if (!analysis) return null;

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (analysis.confidence / 100) * circumference;

  return (
    <div className="cyber-card overflow-hidden transition-all duration-700 min-w-0 border-white/10 shadow-2xl rounded-[4rem] p-12">
      {/* Header Section */}
      <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between bg-white/5 -mx-12 -mt-12 mb-12 flex-wrap gap-4">
        <div className="flex items-center gap-5 min-w-0">
          <div className="w-14 h-14 xray-btn rounded-[1.5rem] flex items-center justify-center flex-shrink-0">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <div className="text-start overflow-hidden">
            <h2 className="heading text-2xl tracking-tighter uppercase italic leading-none truncate">{t.quantumNeuralInterpretation}</h2>
            <span className="text-[9px] text-muted font-black uppercase tracking-[0.4em] mt-2 block opacity-50 italic truncate">{t.cognitiveForecastMatrix}</span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6 flex-shrink-0">
           <div className="flex flex-col items-end">
             <span className="text-[8px] font-black text-muted uppercase tracking-widest mb-1">{t.inferenceEngineLabel}</span>
             <span className="text-[10px] font-black text-success uppercase">{t.g8Stable}</span>
           </div>
           <div className="p-3 bg-success/10 rounded-2xl border border-success/20">
             <ShieldCheck className="w-6 h-6 text-success animate-pulse" />
           </div>
        </div>
      </div>

      <div className="space-y-12 text-left w-full max-w-6xl mx-auto overflow-hidden">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main Signal Display */}
          <div className="lg:col-span-7 space-y-6 min-w-0">
             <div className="flex items-center gap-3 px-2">
               <Target className="w-4 h-4 text-accent" />
               <span className="text-[10px] font-black text-muted uppercase tracking-[0.5em] opacity-60">{t.neuralConsensusSignal}</span>
             </div>
             <div className={`rounded-[3rem] py-16 px-12 text-center transition-all duration-700 border-2 bg-slate-900/60 border-white/5 shadow-inner overflow-hidden flex items-center justify-center`}>
               <div className="scale-110 md:scale-125 transform">
                 <SignalBadge signal={analysis.signal || 'WAIT'} />
               </div>
             </div>
          </div>
          
          {/* Circular Confidence &conviction block */}
          <div className="lg:col-span-5 min-w-0 flex flex-col justify-center">
            <div className="relative group overflow-hidden bg-gradient-to-br from-indigo-500/10 to-transparent border-2 border-white/10 rounded-[3rem] p-10 h-full flex flex-col items-center justify-center shadow-2xl" style={{ backgroundImage: 'radial-gradient(circle at top right, var(--accent-glow), transparent 70%)' }}>
               <div className="absolute top-0 right-0 p-8 opacity-5">
                 <Crosshair className="w-24 h-24 text-white" />
               </div>
               
               <div className="flex flex-col md:flex-row items-center gap-10 w-full relative z-10">
                 {/* Circular progress */}
                 <div className="relative w-40 h-40 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="80"
                        cy="80"
                        r={radius}
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="10"
                        fill="transparent"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r={radius}
                        stroke="var(--accent)"
                        strokeWidth="10"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        style={{ 
                          filter: 'drop-shadow(0 0 8px var(--accent))',
                          transition: 'stroke-dashoffset 1.5s ease-in-out' 
                        }}
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center text-center">
                      <span className="text-3xl font-black font-mono text-white leading-none">{analysis.confidence}%</span>
                      <span className="text-[8px] font-black text-muted uppercase mt-2 tracking-widest">{t.engineConfidence}</span>
                    </div>
                 </div>

                 <div className="flex-1 space-y-8 w-full text-start">
                   <div className="pt-8 md:pt-0">
                     <div className="flex items-center gap-3 mb-3 opacity-40">
                       <Crosshair className="w-4 h-4 text-gold" />
                       <span className="text-[9px] font-black text-muted uppercase tracking-widest truncate">{t.convictionWeight}</span>
                     </div>
                     <div className="flex items-baseline gap-4">
                       <span className="text-4xl font-black font-mono tracking-tighter text-gold truncate">{analysis.score}</span>
                       <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-gold shadow-[0_0_10px_var(--gold-glow)]" style={{ width: `${analysis.score}%` }}></div>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Reasoning Block */}
        <div className="bg-bg/60 p-8 md:p-12 rounded-[3.5rem] relative overflow-hidden border-2 border-white/10 backdrop-blur-3xl shadow-3xl min-w-0 space-y-10">
          <Quote className="absolute top-6 right-10 w-24 h-24 text-white opacity-[0.03] pointer-events-none" />
          
          <div className="space-y-8 relative z-10">
            <div className="flex items-center gap-4">
              <Languages className="w-5 h-5 text-accent" />
              <h4 className="text-[12px] font-black text-accent uppercase tracking-[0.5em]">{t.forensicLogicSummary}</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4" dir="rtl">
                <span className="text-[9px] font-black text-muted uppercase tracking-widest block opacity-40">{t.arabicLog}</span>
                <p className="text-xl text-text-bright font-bold leading-relaxed italic break-words font-sans">
                  "{analysis.reasoningAr}"
                </p>
              </div>
              <div className="space-y-4" dir="ltr">
                <span className="text-[9px] font-black text-muted uppercase tracking-widest block opacity-40">{t.englishLog}</span>
                <p className="text-xl text-text-bright font-bold leading-relaxed italic break-words font-sans">
                  "{analysis.reasoningEn}"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Liquidity Levels */}
        <div className="space-y-8 pt-4 pb-4 overflow-hidden">
           <div className="flex items-center gap-4 px-2">
             <Zap className="w-6 h-6 text-gold animate-pulse" />
             <span className="text-[12px] font-black text-gold uppercase tracking-[0.4em] italic text-glow-gold truncate">{t.structuralLiquidityZones}</span>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="p-10 bg-success/5 border-2 border-success/15 rounded-[3rem] flex items-center justify-between hover:bg-success/10 transition-all shadow-xl overflow-hidden min-w-0">
                <div className="text-start overflow-hidden flex-1">
                   <span className="text-[11px] font-black text-success uppercase tracking-[0.3em] block mb-3 truncate">{t.primarySupport}</span>
                   <span className="text-4xl font-black font-mono text-white tracking-tighter block truncate">${analysis.keyLevels.support[0]?.toLocaleString() || '--'}</span>
                </div>
                <TrendingUp className="w-12 h-12 text-success opacity-20 flex-shrink-0" />
             </div>
             <div className="p-10 bg-danger/5 border-2 border-danger/15 rounded-[3rem] flex items-center justify-between hover:bg-danger/10 transition-all shadow-xl overflow-hidden min-w-0">
                <div className="text-start overflow-hidden flex-1">
                   <span className="text-[11px] font-black text-danger uppercase tracking-[0.3em] block mb-3 truncate">{t.primaryResistance}</span>
                   <span className="text-4xl font-black font-mono text-white tracking-tighter block truncate">${analysis.keyLevels.resistance[0]?.toLocaleString() || '--'}</span>
                </div>
                <TrendingDown className="w-12 h-12 text-danger opacity-20 flex-shrink-0" />
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TradeXrayAI;
