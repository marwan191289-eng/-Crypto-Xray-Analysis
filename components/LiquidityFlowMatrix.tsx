
import React, { useMemo } from 'react';
import { MarketData, LiquidityFlow } from '../types';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine, BarChart, Bar, Cell } from 'recharts';
import { Waves, Droplets, Zap, Target, Box, ArrowRightLeft, ShieldAlert, TrendingUp, TrendingDown, Activity, Layers } from 'lucide-react';

interface Props {
  data: MarketData;
  isLoading: boolean;
  t: any;
}

const LiquidityFlowMatrix: React.FC<Props> = ({ data, isLoading, t }) => {
  const flowData = useMemo((): LiquidityFlow => {
    const latest = data.price;
    // Generate CVD data that oscillates around zero
    const cvdData = Array.from({ length: 30 }, (_, i) => {
      const trend = Math.sin(i * 0.2) * 20;
      const noise = (Math.random() - 0.5) * 10;
      return trend + noise;
    });

    return {
      cvd: cvdData,
      volumeImbalance: (Math.random() - 0.5) * 60, // -30 to +30 range
      spotFlow: 45 + Math.random() * 20,
      futuresFlow: 45 + Math.random() * 20,
      orderBlocks: [
        { type: 'BEARISH', price: latest * 1.008, volume: 1450, mitigated: false },
        { type: 'BULLISH', price: latest * 0.992, volume: 2100, mitigated: true },
        { type: 'BULLISH', price: latest * 0.985, volume: 3500, mitigated: false }
      ],
      fvg: [
        { top: latest * 1.015, bottom: latest * 1.012, type: 'SIBI' },
        { top: latest * 0.995, bottom: latest * 0.998, type: 'BISI' }
      ]
    };
  }, [data]);

  const cvdSeries = useMemo(() => flowData.cvd.map((val, i) => ({ step: i, value: val })), [flowData]);

  if (isLoading) return <div className="h-96 animate-pulse bg-slate-900/50 rounded-[4rem]" />;

  const imbalanceColor = flowData.volumeImbalance > 0 ? '#10b981' : '#f43f5e';
  const imbalancePercent = Math.min(Math.abs(flowData.volumeImbalance) * 3, 100);

  return (
    <div className="cyber-card rounded-[4rem] p-12 relative overflow-hidden group border" style={{ borderColor: 'var(--border-line)' }}>
      <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
        <ArrowRightLeft className="w-96 h-96 text-emerald-400" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-12 relative z-10">
        <div className="flex items-center gap-6">
          <div className="p-5 bg-emerald-500/10 rounded-3xl border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
            <Droplets className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">{t.liquidityMatrix}</h3>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">{t.cvdDivergence}</span>
              <div className="h-px w-8 bg-slate-700"></div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">{t.smcLayer}</span>
            </div>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-4 bg-black/20 px-6 py-3 rounded-2xl border border-white/5 backdrop-blur-md">
           <Activity className="w-5 h-5 text-emerald-500 animate-pulse" />
           <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{t.forensicHubActive}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        
        {/* CVD Chart Section */}
        <div className="xl:col-span-8 bg-slate-950/40 p-8 rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden flex flex-col justify-between group/chart">
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-soft-light"></div>
           
           <div className="flex items-center justify-between mb-8 relative z-10">
             <div>
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Cumulative Volume Delta</span>
               <h4 className="text-xl font-black text-white uppercase italic tracking-tighter">{t.cvdDivergence}</h4>
             </div>
             <div className="flex items-center gap-4">
               <div className="px-4 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                 {t.aggressiveBuying}
               </div>
             </div>
          </div>
          
          <div className="h-64 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cvdSeries}>
                <defs>
                  <linearGradient id="cvdBull" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="cvdBear" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <ReferenceLine y={0} stroke="#334155" strokeDasharray="3 3" />
                <Tooltip 
                  cursor={{ stroke: '#fff', strokeWidth: 1, strokeDasharray: '4 4' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const val = payload[0].value as number;
                      return (
                        <div className="bg-slate-950/90 border border-white/10 p-4 rounded-2xl shadow-3xl backdrop-blur-xl">
                          <span className={`text-sm font-mono font-black ${val >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {t.delta}: {val.toFixed(2)}
                          </span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="url(#cvdStroke)"
                  fill="url(#cvdBull)" // Recharts handles split gradient manually usually, keeping simple for this update
                  strokeWidth={3} 
                  strokeOpacity={0}
                />
                {/* Visual hack for split colors - simplified for React rendering stability */}
                 <Area type="monotone" dataKey="value" stroke="#10b981" fill="url(#cvdBull)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 flex justify-between items-center text-[10px] font-black text-slate-600 uppercase tracking-widest relative z-10">
             <span>T-30m</span>
             <span>T-15m</span>
             <span>{t.mid}</span>
             <span className="text-emerald-500 animate-pulse">{t.liveFeed}</span>
          </div>
        </div>

        {/* Pressure Gauge Section */}
        <div className="xl:col-span-4 bg-slate-950/40 p-10 rounded-[3.5rem] border border-white/5 shadow-2xl flex flex-col text-start relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03]">
             <Zap className="w-32 h-32 text-white" />
          </div>

          <div className="relative z-10 mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.volumeImbalance}</span>
              <span className={`text-xl font-black font-mono tracking-tighter ${flowData.volumeImbalance > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {flowData.volumeImbalance > 0 ? '+' : ''}{flowData.volumeImbalance.toFixed(1)}%
              </span>
            </div>
            {/* Center-zero progress bar */}
            <div className="h-3 bg-slate-900 rounded-full relative overflow-hidden border border-white/5">
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20 z-10"></div>
              <div 
                className={`absolute top-0 bottom-0 transition-all duration-700 shadow-[0_0_15px_currentColor] ${flowData.volumeImbalance > 0 ? 'bg-emerald-500 left-1/2 rounded-r-full' : 'bg-rose-500 right-1/2 rounded-l-full'}`}
                style={{ width: `${imbalancePercent / 2}%` }}
              />
            </div>
            <p className="text-[9px] text-slate-500 font-bold uppercase mt-3 italic leading-relaxed">
              {t.lang === 'ar' ? 'اختلال هيكلي في أوامر السوق' : 'Structural imbalance in market orders detected.'}
            </p>
          </div>

          <div className="space-y-6 relative z-10 flex-1 flex flex-col justify-end">
             <div className="p-5 rounded-3xl bg-indigo-500/5 border border-indigo-500/10">
                <div className="flex justify-between items-center mb-3">
                   <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">{t.spotVsFutures}</span>
                   <Layers className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="flex gap-2 h-16 items-end">
                   <div className="flex-1 flex flex-col gap-2 group/bar">
                      <div className="w-full bg-slate-900 rounded-t-xl relative overflow-hidden h-full">
                         <div className="absolute bottom-0 w-full bg-indigo-400 transition-all duration-1000 group-hover/bar:bg-indigo-300" style={{ height: `${flowData.spotFlow}%` }} />
                      </div>
                      <span className="text-[9px] font-black text-center text-slate-500 uppercase">Spot</span>
                   </div>
                   <div className="flex-1 flex flex-col gap-2 group/bar">
                      <div className="w-full bg-slate-900 rounded-t-xl relative overflow-hidden h-full">
                         <div className="absolute bottom-0 w-full bg-emerald-400 transition-all duration-1000 group-hover/bar:bg-emerald-300" style={{ height: `${flowData.futuresFlow}%` }} />
                      </div>
                      <span className="text-[9px] font-black text-center text-slate-500 uppercase">Perp</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Structural Map Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-10">
        
        {/* Order Blocks */}
        <div className="bg-slate-950/40 p-10 rounded-[3.5rem] border border-white/5 relative overflow-hidden text-start shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-[13px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
              <Box className="w-5 h-5 text-indigo-400" /> {t.smartMoneyBlocks}
            </h4>
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{t.institutionalFootprints}</span>
          </div>
          
          <div className="space-y-4">
            {flowData.orderBlocks.map((ob, i) => (
              <div key={i} className="group/ob relative">
                <div className={`flex items-center justify-between p-5 rounded-[2rem] border transition-all duration-500 relative overflow-hidden ${ob.type === 'BULLISH' ? 'bg-emerald-500/5 border-emerald-500/10 hover:border-emerald-500/40' : 'bg-rose-500/5 border-rose-500/10 hover:border-rose-500/40'}`}>
                  {/* Background Progress Bar for Volume */}
                  <div className={`absolute left-0 top-0 bottom-0 opacity-10 transition-all duration-1000 ${ob.type === 'BULLISH' ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${Math.min(ob.volume / 40, 100)}%` }} />
                  
                  <div className="flex items-center gap-5 relative z-10">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ob.type === 'BULLISH' ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                       {ob.type === 'BULLISH' ? <TrendingUp className="w-5 h-5 text-emerald-400" /> : <TrendingDown className="w-5 h-5 text-rose-400" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${ob.type === 'BULLISH' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {ob.type === 'BULLISH' ? t.demandZone : t.supplyZone}
                        </span>
                        {ob.mitigated && <span className="text-[8px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md uppercase font-bold">{t.mitigated}</span>}
                      </div>
                      <span className="text-lg font-black text-white font-mono">${ob.price.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="text-right relative z-10">
                    <span className="text-[9px] font-black text-slate-500 block mb-1 uppercase tracking-widest">{t.liquidity}</span>
                    <span className="text-xs font-black text-indigo-200 font-mono">{ob.volume.toLocaleString()} units</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FVGs */}
        <div className="bg-slate-950/40 p-10 rounded-[3.5rem] border border-white/5 relative overflow-hidden text-start shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-[13px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
              <Target className="w-5 h-5 text-indigo-400" /> {t.efficiencyGaps}
            </h4>
            <ShieldAlert className="w-5 h-5 text-slate-700 opacity-50" />
          </div>
          
          <div className="space-y-4">
             {flowData.fvg.map((f, i) => (
               <div key={i} className="p-6 bg-indigo-500/5 border border-dashed border-indigo-500/20 rounded-[2.5rem] group hover:border-indigo-500/40 transition-all flex justify-between items-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:scale-125 transition-transform">
                    <Waves className="w-16 h-16 text-indigo-400" />
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                       <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                       <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">{t.gapType}: {f.type}</span>
                    </div>
                    <span className="text-xl font-black text-white font-mono tracking-tighter">
                       ${f.bottom.toLocaleString()} <span className="text-indigo-500 mx-1">-</span> ${f.top.toLocaleString()}
                    </span>
                  </div>

                  <div className="relative z-10 text-right">
                    <div className="px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                      <span className="text-[9px] font-black text-indigo-200 uppercase tracking-widest">{t.magnetZone}</span>
                    </div>
                  </div>
               </div>
             ))}
             
             <div className="mt-6 flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                <ShieldAlert className="w-4 h-4 text-slate-400 mt-0.5" />
                <p className="text-[9px] text-slate-500 font-bold uppercase italic leading-relaxed">
                  {t.lang === 'ar' 
                    ? '*تمثل فجوات القيمة العادلة مناطق ذات سيولة منخفضة، مما يجذب السعر لإعادة التوازن.' 
                    : '*Fair Value Gaps represent low liquidity nodes acting as high-probability price magnets for rebalancing.'}
                </p>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LiquidityFlowMatrix;
