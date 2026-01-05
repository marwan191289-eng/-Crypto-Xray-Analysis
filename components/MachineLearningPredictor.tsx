
import React, { useState, useMemo } from 'react';
import { MLPrediction } from '../types';
import { Cpu, Zap, Binary, ChevronRight, Share2, ShieldCheck, Activity, Target, Network, Info, TrendingUp, TrendingDown, Languages } from 'lucide-react';

interface MLProps {
  prediction?: MLPrediction;
  isLoading: boolean;
  currentPrice?: number;
  t: any;
  onValidate?: () => void;
}

const MachineLearningPredictor: React.FC<MLProps> = ({ prediction, isLoading, currentPrice, t, onValidate }) => {
  if (isLoading && !prediction) {
    return (
      <div className="bg-slate-900/80 border-2 border-slate-800 rounded-[3.5rem] p-14 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-2 bg-indigo-500/10">
          <div className="h-full bg-indigo-500 w-1/4 animate-[loading_2s_infinite] shadow-[0_0_20px_#6366f1]"></div>
        </div>
        <div className="flex flex-col items-center justify-center py-28 space-y-10">
          <div className="relative">
             <Binary className="w-20 h-20 text-indigo-500 animate-pulse" />
             <div className="absolute inset-0 bg-indigo-500/30 blur-2xl rounded-full animate-ping"></div>
          </div>
          <p className="text-[14px] font-black text-slate-400 uppercase tracking-[0.8em] animate-pulse">{t.neuralWeights}</p>
        </div>
      </div>
    );
  }

  if (!prediction) return null;

  const isUp = prediction.direction === 'UP';
  const isDown = prediction.direction === 'DOWN';

  return (
    <div className="bg-slate-900/90 border-2 border-slate-800 rounded-[4rem] p-12 shadow-3xl relative overflow-hidden group">
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-600/15 blur-[100px] rounded-full group-hover:bg-indigo-600/20 transition-all duration-1000 animate-pulse"></div>
      
      <div className="flex items-center justify-between mb-12 relative z-10">
        <div className="flex items-center gap-6">
          <div className="p-5 bg-indigo-500/15 rounded-3xl border-2 border-indigo-500/30 shadow-3xl">
            <Cpu className="w-10 h-10 text-indigo-400" />
          </div>
          <div className="text-start">
            <h3 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">{t.neuralForecast}</h3>
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em] mt-3">{t.inferenceEngineLabel}</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-4 bg-slate-950/80 px-6 py-3 rounded-2xl border-2 border-white/5 shadow-2xl backdrop-blur-md">
          <Activity className="w-5 h-5 text-emerald-500" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.g8Stable}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-stretch relative z-10">
        <div className="space-y-10 flex flex-col">
          <div className="bg-slate-950/70 border-2 border-white/5 rounded-[3.5rem] p-10 relative flex-1 shadow-2xl backdrop-blur-xl text-start">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em] block mb-6 italic opacity-70">{t.targetProjectionHorizon}</span>
            <div className="flex items-end gap-6 mb-4">
              <span className={`text-6xl font-black font-mono tracking-tighter ${isUp ? 'text-emerald-400' : isDown ? 'text-rose-400' : 'text-indigo-400'}`}>
                ${prediction.predictedPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <div className={`mb-2 px-4 py-1.5 rounded-2xl text-[12px] font-black border-2 shadow-2xl transform hover:scale-110 transition-transform ${isUp ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : isDown ? 'bg-rose-500/20 text-rose-400 border-rose-500/50' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                {t[prediction.direction.toLowerCase()] || prediction.direction}
              </div>
            </div>
          </div>

          <div className="px-4 text-start">
            <div className="space-y-4 w-full">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest block italic">{t.structuralIntegrityConfidence}</span>
                <span className={`text-3xl font-black font-mono ${isUp ? 'text-emerald-400' : isDown ? 'text-rose-400' : 'text-indigo-400'}`}>{prediction.probability}%</span>
              </div>
              <div className="h-5 bg-slate-950 rounded-full overflow-hidden relative border-2 border-white/5 shadow-inner p-1">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 relative ${isUp ? 'bg-emerald-500' : isDown ? 'bg-rose-500' : 'bg-indigo-500'}`} 
                  style={{ width: `${prediction.probability}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-950/40 border-2 border-white/5 rounded-[4rem] p-12 relative overflow-hidden h-full flex flex-col shadow-2xl backdrop-blur-3xl group/pattern text-start">
          <div className="flex items-center gap-5 mb-8">
            <div className="w-10 h-10 rounded-[1rem] bg-indigo-500/20 flex items-center justify-center border border-indigo-500/40">
              <Languages className="w-5 h-5 text-indigo-400" />
            </div>
            <h4 className="text-[14px] font-black text-slate-400 uppercase tracking-[0.4em]">{t.patternSynthesis}</h4>
          </div>
          
          <div className="mb-6">
            <div className="text-3xl font-black text-white italic tracking-tighter uppercase mb-2">
              {prediction.patternDetected}
            </div>
            <div className="text-2xl font-black text-accent italic tracking-tighter uppercase border-b border-white/5 pb-4" dir="rtl">
              {prediction.patternDetectedAr}
            </div>
          </div>

          <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-5">
            <p className="text-[15px] text-slate-400 font-bold leading-relaxed italic" dir="ltr">
              "{prediction.reasoning}"
            </p>
            <p className="text-[15px] text-text-bright font-bold leading-relaxed italic" dir="rtl">
              "{prediction.reasoningAr}"
            </p>
          </div>

          <div className="space-y-8 mt-10 border-t-2 border-white/5 pt-10">
            <div className="flex items-center justify-between text-[11px] font-black text-slate-600 uppercase tracking-[0.5em]">
               <span className="flex items-center gap-4">
                 <Activity className="w-5 h-5 text-indigo-500" /> {t.statisticalHorizon}
               </span>
               <span className="text-white bg-slate-900 px-5 py-2 rounded-2xl border-2 border-white/10 shadow-3xl italic">{t.next} {prediction.timeframe}</span>
            </div>
            <button 
              onClick={onValidate}
              className="w-full py-6 bg-indigo-600/15 hover:bg-indigo-600/25 border-2 border-indigo-500/30 rounded-3xl text-[12px] font-black uppercase tracking-[0.5em] text-indigo-300 transition-all flex items-center justify-center gap-6 group/btn"
            >
              {t.validateCognitiveInference} <ChevronRight className={`w-6 h-6 group-hover/btn:translate-x-3 transition-transform ${t.lang === 'ar' ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-10 border-t-2 border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 px-4 relative z-10 text-start">
        <div className="flex items-center gap-4 text-[11px] font-bold text-slate-600 uppercase tracking-[0.4em] italic">
          <ShieldCheck className="w-5 h-5 text-emerald-500" /> 
          {t.neuralIntegrity}
        </div>
        <button className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.6em] flex items-center gap-5 hover:text-white transition-all duration-500 group shadow-lg">
          <Share2 className="w-5 h-5 group-hover:scale-150 transition-all" /> 
          {t.exportMultiLayer}
        </button>
      </div>
    </div>
  );
};

export default MachineLearningPredictor;
