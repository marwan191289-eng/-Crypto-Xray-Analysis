
import React from 'react';
import { WhaleBearMetrics, WhaleTransaction } from '../types';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, ReferenceLine } from 'recharts';
import { ShieldAlert, TrendingUp, TrendingDown, Target, Info, Activity, Ship, AlertCircle, Map, Crosshair, Zap } from 'lucide-react';

interface Props {
  metrics?: WhaleBearMetrics;
  whaleTx: WhaleTransaction[];
  symbol: string;
  isLoading: boolean;
  t: any;
}

const WhaleBearForensics: React.FC<Props> = ({ metrics, whaleTx, symbol, isLoading, t }) => {
  if (isLoading || !metrics) {
    return (
      <div className="glass-card rounded-[4rem] p-12 animate-pulse space-y-8">
        <div className="h-10 w-64 bg-slate-800 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="h-80 bg-slate-800 rounded-[3rem]" />
          <div className="h-80 bg-slate-800 rounded-[3rem]" />
        </div>
      </div>
    );
  }

  const cycleColors = {
    'ACCUMULATION': 'text-emerald-400',
    'MARK-UP': 'text-indigo-400',
    'DISTRIBUTION': 'text-rose-400',
    'MARK-DOWN': 'text-amber-400'
  };

  return (
    <div className="glass-card rounded-[4rem] p-12 border-2 border-white/5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform">
        <Ship className="w-64 h-64 text-indigo-400" />
      </div>

      <div className="flex items-center gap-6 mb-12">
        <div className="p-5 bg-indigo-500/15 rounded-3xl border border-indigo-500/30 shadow-2xl">
          <ShieldAlert className="w-8 h-8 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">{t.whaleBearMatrix}</h3>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mt-3 italic">{t.smartMoneyNetflow}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        <div className="bg-slate-950/40 p-10 rounded-[3.5rem] border border-white/5 shadow-2xl xl:col-span-2 text-start">
          <div className="flex items-center justify-between mb-10 flex-wrap gap-6">
             <div>
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">{t.exchangeInventory}</span>
               <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter">{t.exchangeNetflow} ({t.past12Hours})</h4>
             </div>
             <div className="flex gap-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.outflow}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.inflow}</span>
                </div>
             </div>
          </div>
          
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.netflowHistory}>
                <XAxis dataKey="time" hide />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const net = payload[0].payload.net;
                      return (
                        <div className="bg-slate-950 border border-white/10 p-5 rounded-2xl shadow-3xl backdrop-blur-xl">
                          <p className="text-[11px] font-black text-slate-500 uppercase mb-3 border-b border-white/10 pb-2">{payload[0].payload.time}</p>
                          <div className={`text-sm font-black font-mono ${net > 0 ? 'text-rose-400' : 'text-emerald-400'} flex items-center gap-2`}>
                            {t.net}: {net > 0 ? '+' : ''}${(net / 1000000).toFixed(2)}M
                            {net > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={0} stroke="#1e293b" strokeDasharray="3 3" />
                <Bar dataKey="net" radius={[6, 6, 0, 0]}>
                  {metrics.netflowHistory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.net > 0 ? '#f43f5e' : '#10b981'} opacity={0.7} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center text-[11px] font-black text-slate-600 uppercase tracking-widest">
            <span className="italic">{t.past12Hours}</span>
            <span className="flex items-center gap-3 text-emerald-400"><AlertCircle className="w-4 h-4" /> {t.accumTrend}</span>
          </div>
        </div>

        <div className="bg-slate-950/40 p-10 rounded-[3.5rem] border border-white/5 shadow-2xl flex flex-col justify-between text-start relative overflow-hidden">
           <div className="relative z-10">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">{t.wyckoffAnalysis}</span>
             <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-10">{t.wyckoffPhase}</h4>
             
             <div className="space-y-10">
                <div className="text-center bg-black/20 p-8 rounded-[2.5rem] border border-white/5">
                   <div className={`text-4xl font-black italic tracking-tighter uppercase ${cycleColors[metrics.marketCycle] || 'text-white'}`}>
                     {t[metrics.marketCycle] || metrics.marketCycle}
                   </div>
                   <p className="text-[11px] text-slate-500 font-bold uppercase mt-4 tracking-[0.4em] opacity-60 italic">{t.phaseProgress}: {metrics.cycleProgress}%</p>
                </div>
                
                <div className="relative h-3 bg-slate-900 rounded-full overflow-hidden border border-white/5 shadow-inner">
                  <div className={`absolute h-full shadow-[0_0_15px_currentColor] transition-all duration-1000 ${cycleColors[metrics.marketCycle]?.replace('text-', 'bg-')}`} style={{ width: `${metrics.cycleProgress}%` }} />
                </div>

                <div className="grid grid-cols-4 gap-2 text-[9px] font-black text-slate-600 uppercase text-center italic tracking-widest">
                   <span className={metrics.marketCycle === 'ACCUMULATION' ? 'text-white' : ''}>{t.ACC}</span>
                   <span className={metrics.marketCycle === 'MARK-UP' ? 'text-white' : ''}>{t['M-UP']}</span>
                   <span className={metrics.marketCycle === 'DISTRIBUTION' ? 'text-white' : ''}>{t.DIST}</span>
                   <span className={metrics.marketCycle === 'MARK-DOWN' ? 'text-white' : ''}>{t['M-DN']}</span>
                </div>
             </div>
           </div>

           <div className="mt-12 p-6 bg-indigo-500/10 border border-indigo-500/30 rounded-3xl relative z-10 backdrop-blur-md">
              <div className="flex items-center gap-4 mb-3">
                 <Ship className="w-5 h-5 text-indigo-400" />
                 <span className="text-[12px] font-black text-white uppercase tracking-widest italic">{t.whaleBias}</span>
              </div>
              <span className="text-2xl font-black text-indigo-400 font-mono italic uppercase tracking-tighter">{t.dominantAccum}</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12">
        <div className="bg-slate-950/40 p-10 rounded-[4rem] border border-white/5 relative overflow-hidden text-start shadow-2xl">
           <div className="flex items-center justify-between mb-10">
             <h4 className="text-[14px] font-black text-white uppercase tracking-[0.4em] flex items-center gap-4">
               <Activity className="w-6 h-6 text-emerald-400" /> {t.highValueFlows}
             </h4>
             <div className="flex items-center gap-3">
               <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
               <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{t.liveFeed}</span>
             </div>
           </div>

           <div className="space-y-5 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
             {whaleTx.map((tx) => (
               <div key={tx.id} className="p-6 bg-slate-900/60 rounded-[2rem] border border-white/5 hover:border-indigo-500/30 transition-all flex justify-between items-center group/tx shadow-lg">
                  <div className="flex items-center gap-6">
                    <div className={`p-4 rounded-2xl ${tx.from === 'EXCHANGE' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                       {tx.from === 'EXCHANGE' ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                    </div>
                    <div className="text-start">
                       <div className="flex items-center gap-3 mb-2">
                          <span className={`text-[12px] font-black ${tx.from === 'EXCHANGE' ? 'text-rose-400' : 'text-emerald-400'}`}>{tx.fromLabel}</span>
                          <span className="text-slate-700 font-black">→</span>
                          <span className={`text-[12px] font-black ${tx.to === 'EXCHANGE' ? 'text-rose-400' : 'text-emerald-400'}`}>{tx.toLabel}</span>
                       </div>
                       <span className="text-[10px] font-mono text-slate-500 uppercase font-black tracking-widest">{tx.hash}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-indigo-400 font-mono tracking-tighter">{tx.amount.toFixed(1)} {symbol}</span>
                    <p className="text-[10px] text-slate-600 font-bold uppercase mt-2 italic">${(tx.amountUsd / 1000000).toFixed(2)}M USD</p>
                  </div>
               </div>
             ))}
           </div>
        </div>

        <div className="bg-slate-950/40 p-10 rounded-[4rem] border border-white/5 relative overflow-hidden text-start shadow-2xl">
           <div className="flex items-center justify-between mb-10">
             <h4 className="text-[14px] font-black text-white uppercase tracking-[0.4em] flex items-center gap-4">
               <Crosshair className="w-6 h-6 text-rose-500" /> {t.liquidityHunt}
             </h4>
             <Map className="w-6 h-6 text-slate-700 opacity-40" />
           </div>

           <div className="space-y-8">
              {metrics.stopHuntZones.map((zone, i) => (
                <div key={i} className={`p-8 rounded-[3rem] border-2 relative overflow-hidden group/zone transition-all hover:scale-[1.02] ${zone.type === 'LONG_HUNT' ? 'bg-rose-500/5 border-rose-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
                   <div className="absolute top-0 right-0 p-6 opacity-5">
                     <Target className={`w-24 h-24 ${zone.type === 'LONG_HUNT' ? 'text-rose-500' : 'text-emerald-500'}`} />
                   </div>
                   <div className="flex justify-between items-end relative z-10">
                      <div>
                        <span className={`text-[11px] font-black uppercase tracking-widest block mb-3 italic ${zone.type === 'LONG_HUNT' ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {t[zone.type] || zone.type.replace('_', ' ')}
                        </span>
                        <span className="text-4xl font-black text-white font-mono tracking-tighter">${zone.price.toLocaleString()}</span>
                      </div>
                      <div className="text-right">
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">{t.targetVolume}</span>
                         <span className="text-2xl font-black text-indigo-400 font-mono tracking-tighter">{zone.volume} {symbol}</span>
                      </div>
                   </div>
                   <div className="mt-6 flex items-center gap-4 pt-6 border-t border-white/5">
                      <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
                      <p className="text-[10px] text-slate-500 font-black uppercase italic leading-relaxed">{t.stopHuntAlert}</p>
                   </div>
                </div>
              ))}
              <div className="p-6 bg-slate-900/60 rounded-[2rem] border-2 border-dashed border-white/5 text-center">
                 <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.4em] italic animate-pulse">{t.scanningSecondary}</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default WhaleBearForensics;
