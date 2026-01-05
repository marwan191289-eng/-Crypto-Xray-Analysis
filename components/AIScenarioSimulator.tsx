
import React from 'react';
import { MLPrediction } from '../types';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Brain, Zap, AlertTriangle, TrendingUp, TrendingDown, Target, Newspaper, Clock, Activity } from 'lucide-react';

interface Props {
  prediction?: MLPrediction;
  currentPrice: number;
  isLoading: boolean;
  t: any;
}

const AIScenarioSimulator: React.FC<Props> = ({ prediction, currentPrice, isLoading, t }) => {
  if (isLoading || !prediction) {
    return <div className="h-96 animate-pulse bg-slate-950/50 rounded-[4rem] border border-white/5" />;
  }

  const getVoteColor = (vote: string) => {
    if (vote === 'BUY') return 'text-emerald-400';
    if (vote === 'SELL') return 'text-rose-400';
    return 'text-slate-400';
  }

  const getVolatilityColor = (vol: string) => {
    if (vol === 'EXTREME') return 'text-rose-500 bg-rose-500/10 border-rose-500/30';
    if (vol === 'HIGH') return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
    return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30';
  }

  return (
    <div className="glass-card rounded-[4rem] p-12 border-2 border-white/5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform">
        <Brain className="w-64 h-64 text-indigo-400" />
      </div>

      <div className="flex items-center gap-6 mb-12">
        <div className="p-5 bg-indigo-500/15 rounded-3xl border border-indigo-500/30 shadow-2xl">
          <Brain className="w-8 h-8 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">{t.quantumIntelligence}</h3>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mt-3 italic">{t.ensembleVoting} / {t.likelyScenarios}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        <div className="bg-slate-950/60 p-10 rounded-[3.5rem] border border-white/5 shadow-2xl flex flex-col justify-between text-start">
           <div>
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">{t.modelConsensus}</span>
             <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-10">{t.ensembleVoting}</h4>
             
             <div className="space-y-6">
                {[
                  { name: `LSTM (${t.temporal})`, vote: prediction.ensembleVotes.lstm, desc: 'Sequence Memory' },
                  { name: `XGBoost (${t.tabular})`, vote: prediction.ensembleVotes.xgboost, desc: 'Gradient Boosting' },
                  { name: `Transformer (Global)`, vote: prediction.ensembleVotes.transformer, desc: t.attentionMatrix }
                ].map((m, i) => (
                  <div key={i} className="flex items-center justify-between p-6 bg-slate-900/60 rounded-2xl border border-white/5 transition-all hover:bg-black/40">
                    <div>
                      <span className="text-[13px] font-black text-white block mb-1">{m.name}</span>
                      <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest italic">{m.desc}</span>
                    </div>
                    <div className={`text-[12px] font-black font-mono px-5 py-2 rounded-xl bg-black/40 border border-white/10 shadow-inner ${getVoteColor(m.vote)}`}>
                      {t[m.vote.toLowerCase()] || m.vote}
                    </div>
                  </div>
                ))}
             </div>
           </div>
           
           <div className="mt-12 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl shadow-inner">
              <div className="flex items-center gap-4 mb-3">
                 <Zap className="w-5 h-5 text-emerald-400 animate-pulse" />
                 <span className="text-[12px] font-black text-white uppercase tracking-widest italic">{t.engineConfidence}</span>
              </div>
              <span className="text-2xl font-black text-emerald-400 font-mono italic tracking-tighter">78.4% {t.match}</span>
           </div>
        </div>

        <div className="bg-slate-950/60 p-10 rounded-[3.5rem] border border-white/5 shadow-2xl xl:col-span-2 text-start">
          <div className="flex items-center justify-between mb-10">
             <div>
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">{t.monteCarloProjection}</span>
               <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter">{t.likelyScenarios}</h4>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {prediction.scenarios.map((s, i) => (
               <div key={i} className="p-10 bg-slate-900/60 rounded-[3rem] border border-white/5 group/scen hover:border-indigo-500/40 transition-all flex flex-col justify-between shadow-lg">
                  <div className="flex justify-between items-start mb-8">
                     <span className={`text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-xl italic ${s.type === 'BULLISH' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : s.type === 'BEARISH' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'}`}>
                       {t[s.type] || s.type}
                     </span>
                     <span className="text-2xl font-black font-mono text-white tracking-tighter">{s.probability}%</span>
                  </div>
                  <div>
                    <span className="text-3xl font-black font-mono text-white tracking-tighter block mb-4 italic">${s.targetPrice.toLocaleString()}</span>
                    <p className="text-[11px] text-slate-500 font-bold uppercase italic leading-relaxed opacity-80">{s.description}</p>
                  </div>
                  <div className="mt-10 h-2 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-white/5 shadow-inner">
                    <div 
                      className={`h-full transition-all duration-1000 shadow-[0_0_10px_currentColor] ${s.type === 'BULLISH' ? 'bg-emerald-500' : s.type === 'BEARISH' ? 'bg-rose-500' : 'bg-indigo-500'}`} 
                      style={{ width: `${s.probability}%` }} 
                    />
                  </div>
               </div>
             ))}
          </div>
        </div>
      </div>

      <div className="mt-12 pt-12 border-t border-white/5 text-start">
        <div className="flex items-center gap-5 mb-12">
          <Newspaper className="w-8 h-8 text-indigo-400" />
          <h4 className="text-lg font-black text-white uppercase tracking-[0.4em] italic">{t.eventResponseMatrix}</h4>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
           {prediction.newsImpact.map((news, i) => (
             <div key={i} className="bg-slate-950/40 p-10 rounded-[3rem] border border-white/5 flex items-center justify-between group/news hover:border-indigo-500/40 transition-all shadow-xl">
                <div className="flex items-center gap-8">
                  <div className="p-5 bg-slate-900 rounded-3xl border border-white/5 group-hover/news:scale-110 transition-transform shadow-inner">
                    <Clock className="w-6 h-6 text-slate-500" />
                  </div>
                  <div>
                    <span className="text-lg font-black text-white uppercase tracking-wider italic leading-none">{news.event}</span>
                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                       <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-xl border italic shadow-inner ${getVolatilityColor(news.expectedVolatility)}`}>
                         {t[news.expectedVolatility] || news.expectedVolatility} {t.volatility}
                       </span>
                       <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest italic">{t.lang === 'ar' ? 'خلال' : 'In'}: {news.timeUntil}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                   <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block mb-3 italic">{t.predictedBias}</span>
                   <div className={`flex items-center gap-4 font-black italic tracking-tighter text-lg ${news.bias === 'POSITIVE' ? 'text-emerald-400' : news.bias === 'NEGATIVE' ? 'text-rose-400' : 'text-indigo-400'}`}>
                      {news.bias === 'POSITIVE' ? <TrendingUp className="w-6 h-6" /> : news.bias === 'NEGATIVE' ? <TrendingDown className="w-6 h-6" /> : <Activity className="w-6 h-6" />}
                      {t[news.bias] || news.bias}
                   </div>
                </div>
             </div>
           ))}
           <div className="bg-indigo-500/5 p-10 rounded-[3rem] border-2 border-dashed border-indigo-500/20 flex items-center justify-center shadow-inner">
              <p className="text-[12px] text-slate-600 font-black uppercase tracking-[0.5em] italic animate-pulse">{t.macroCorrelation}</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AIScenarioSimulator;
