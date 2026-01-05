
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
      <div className="card animate-pulse space-y-8 min-h-[500px] border-accent/20">
        <div className="h-10 w-1/4 bg-slate-800/40 rounded-xl"></div>
        <div className="h-40 w-full bg-slate-800/20 rounded-[2.5rem]"></div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="card overflow-hidden transition-all duration-700 min-w-0 border-white/10 shadow-2xl">
      {/* Header Section */}
      <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between bg-white/5 -mx-6 -mt-6 mb-8 flex-wrap gap-4">
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

      <div className="space-y-10 text-left w-full max-w-6xl mx-auto overflow-hidden">
        
        {/* Signal & Core Confidence */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          <div className="lg:col-span-8 space-y-4 min-w-0">
             <div className="flex items-center gap-3 px-2">
               <Target className="w-4 h-4 text-accent" />
               <span className="text-[10px] font-black text-muted uppercase tracking-[0.5em] opacity-60">{t.neuralConsensusSignal}</span>
             </div>
             <div className={`rounded-[2.5rem] py-12 px-10 text-center transition-all duration-700 border-2 bg-slate-900/60 border-white/5 shadow-inner overflow-hidden flex items-center justify-center`}>
               <div className="scale-110 md:scale-125 transform">
                 <SignalBadge signal={analysis.signal || 'WAIT'} />
               </div>
             </div>
          </div>
          
          <div className="lg:col-span-4 grid grid-cols-1 gap-4 min-w-0">
            <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 flex flex-col justify-center overflow-hidden">
              <div className="flex items-center gap-3 mb-3 opacity-40">
                <Activity className="w-4 h-4 text-accent" />
                <span className="text-[9px] font-black text-muted uppercase tracking-widest truncate">{t.engineConfidence}</span>
              </div>
              <span className="text-4xl font-black font-mono tracking-tighter text-white truncate">{analysis.confidence}%</span>
            </div>
            <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 flex flex-col justify-center overflow-hidden">
              <div className="flex items-center gap-3 mb-3 opacity-40">
                <Crosshair className="w-4 h-4 text-gold" />
                <span className="text-[9px] font-black text-muted uppercase tracking-widest truncate">{t.convictionWeight}</span>
              </div>
              <span className="text-4xl font-black font-mono tracking-tighter text-white truncate">{analysis.score}</span>
            </div>
          </div>
        </div>

        {/* Reasoning Block - Dual Language Analysis */}
        <div className="bg-bg/60 p-8 md:p-10 rounded-[3rem] relative overflow-hidden border border-white/10 backdrop-blur-3xl shadow-3xl min-w-0 space-y-8">
          <Quote className="absolute top-6 right-10 w-24 h-24 text-white opacity-[0.03] pointer-events-none" />
          
          <div className="space-y-6 relative z-10">
            <div className="flex items-center gap-3">
              <Languages className="w-4 h-4 text-accent" />
              <h4 className="text-[11px] font-black text-accent uppercase tracking-[0.5em]">{t.forensicLogicSummary}</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Arabic Reasoning */}
              <div className="space-y-3" dir="rtl">
                <span className="text-[8px] font-black text-muted uppercase tracking-widest block opacity-40">{t.arabicForensicLog}</span>
                <p className="text-lg text-text-bright font-bold leading-relaxed italic break-words font-sans">
                  "{analysis.reasoningAr}"
                </p>
              </div>
              
              {/* English Reasoning */}
              <div className="space-y-3" dir="ltr">
                <span className="text-[8px] font-black text-muted uppercase tracking-widest block opacity-40">{t.englishForensicLog}</span>
                <p className="text-lg text-text-bright font-bold leading-relaxed italic break-words font-sans">
                  "{analysis.reasoningEn}"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Liquidity Levels */}
        <div className="space-y-6 pt-4 pb-4 overflow-hidden">
           <div className="flex items-center gap-3 px-2">
             <Zap className="w-5 h-5 text-gold animate-pulse" />
             <span className="text-[11px] font-black text-gold uppercase tracking-[0.4em] italic text-glow-gold truncate">{t.structuralLiquidityZones}</span>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="p-8 bg-success/5 border-2 border-success/15 rounded-[2.5rem] flex items-center justify-between hover:bg-success/10 transition-all shadow-xl overflow-hidden min-w-0">
                <div className="text-start overflow-hidden flex-1">
                   <span className="text-[10px] font-black text-success uppercase tracking-[0.3em] block mb-2 truncate">{t.primarySupport}</span>
                   <span className="text-3xl font-black font-mono text-white tracking-tighter block truncate">${analysis.keyLevels.support[0]?.toLocaleString() || '--'}</span>
                </div>
                <TrendingUp className="w-10 h-10 text-success opacity-20 flex-shrink-0" />
             </div>
             <div className="p-8 bg-danger/5 border-2 border-danger/15 rounded-[2.5rem] flex items-center justify-between hover:bg-danger/10 transition-all shadow-xl overflow-hidden min-w-0">
                <div className="text-start overflow-hidden flex-1">
                   <span className="text-[10px] font-black text-danger uppercase tracking-[0.3em] block mb-2 truncate">{t.primaryResistance}</span>
                   <span className="text-3xl font-black font-mono text-white tracking-tighter block truncate">${analysis.keyLevels.resistance[0]?.toLocaleString() || '--'}</span>
                </div>
                <TrendingDown className="w-10 h-10 text-danger opacity-20 flex-shrink-0" />
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TradeXrayAI;
