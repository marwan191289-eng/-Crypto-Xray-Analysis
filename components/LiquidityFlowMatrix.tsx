
import React, { useMemo } from 'react';
import { MarketData, LiquidityFlow } from '../types';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Waves, Droplets, Zap, Target, Box, ArrowRightLeft, ShieldAlert } from 'lucide-react';

interface Props {
  data: MarketData;
  isLoading: boolean;
  t: any;
}

const LiquidityFlowMatrix: React.FC<Props> = ({ data, isLoading, t }) => {
  const flowData = useMemo((): LiquidityFlow => {
    const latest = data.price;
    return {
      cvd: Array.from({ length: 20 }, (_, i) => Math.sin(i * 0.5) * 50 + (i * 10)),
      volumeImbalance: (Math.random() - 0.5) * 160,
      spotFlow: 45 + Math.random() * 55,
      futuresFlow: 60 + Math.random() * 40,
      orderBlocks: [
        { type: 'BEARISH', price: latest * 1.04, volume: 1250, mitigated: false },
        { type: 'BULLISH', price: latest * 0.96, volume: 2100, mitigated: true }
      ],
      fvg: [
        { top: latest * 1.02, bottom: latest * 1.015, type: 'SIBI' }
      ]
    };
  }, [data]);

  const cvdSeries = useMemo(() => flowData.cvd.map((val, i) => ({ step: i, value: val })), [flowData]);

  if (isLoading) return <div className="h-96 animate-pulse bg-slate-900/50 rounded-[4rem]" />;

  return (
    <div className="glass-card rounded-[4rem] p-12 border-2 border-white/5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:rotate-12 transition-transform">
        <ArrowRightLeft className="w-64 h-64 text-emerald-400" />
      </div>

      <div className="flex items-center gap-6 mb-12">
        <div className="p-5 bg-emerald-500/15 rounded-3xl border border-emerald-500/30 shadow-2xl">
          <Droplets className="w-8 h-8 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">{t.liquidityMatrix}</h3>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mt-3">{t.cvdDivergence} / {t.smcLayer}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="bg-slate-950/40 p-8 rounded-[3rem] border border-white/5 shadow-2xl lg:col-span-2 text-start">
          <div className="flex items-center justify-between mb-8">
             <div>
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Cumulative Volume Delta</span>
               <h4 className="text-xl font-black text-white uppercase italic tracking-tighter">{t.cvdDivergence}</h4>
             </div>
             <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.aggressiveBuying}</span>
               </div>
             </div>
          </div>
          
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cvdSeries}>
                <defs>
                  <linearGradient id="cvdGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="value" stroke="#10b981" fill="url(#cvdGrad)" strokeWidth={3} isAnimationActive={true} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-950 border border-emerald-500/30 p-3 rounded-xl shadow-2xl">
                          <span className="text-emerald-400 font-mono font-black">{t.delta}: {payload[0].value}</span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-950/40 p-8 rounded-[3rem] border border-white/5 shadow-2xl flex flex-col justify-between text-start">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.spotVsFutures}</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          
          <div className="space-y-10">
             <div className="space-y-3">
                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                  <span className="text-slate-400">Spot Flow</span>
                  <span className="text-white">{flowData.spotFlow.toFixed(1)}%</span>
                </div>
                <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 shadow-glow" style={{ width: `${flowData.spotFlow}%` }} />
                </div>
             </div>

             <div className="space-y-3">
                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                  <span className="text-slate-400">Futures Flow</span>
                  <span className="text-white">{flowData.futuresFlow.toFixed(1)}%</span>
                </div>
                <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 shadow-glow" style={{ width: `${flowData.futuresFlow}%` }} />
                </div>
             </div>

             <div className="p-5 bg-rose-500/5 border border-rose-500/20 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                   <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest">{t.volumeImbalance}</span>
                   <span className="text-xs font-black text-white font-mono">{flowData.volumeImbalance > 0 ? '+' : ''}{flowData.volumeImbalance.toFixed(0)}%</span>
                </div>
                <div className="text-[8px] text-slate-600 font-bold uppercase leading-relaxed">
                  {/* Fixed 'lang' variable by using 't.lang' */}
                  {t.lang === 'ar' ? 'أوامر السوق البيعية تتجاوز كثافة طلبات الشراء بفرق كبير.' : 'Aggressive sell-side market orders exceeding limit bid density by significant margin.'}
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-10">
        <div className="bg-slate-950/40 p-10 rounded-[3.5rem] border border-white/5 relative overflow-hidden text-start">
          <div className="flex items-center justify-between mb-10">
            <h4 className="text-[13px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
              <Box className="w-5 h-5 text-indigo-400" /> {t.smartMoneyBlocks}
            </h4>
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{t.institutionalFootprints}</span>
          </div>
          
          <div className="space-y-5">
            {flowData.orderBlocks.map((ob, i) => (
              <div key={i} className="group/ob relative">
                <div className={`flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all duration-500 ${ob.type === 'BULLISH' ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/50' : 'bg-rose-500/5 border-rose-500/20 hover:border-rose-500/50'}`}>
                  <div className="flex items-center gap-6">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${ob.type === 'BULLISH' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
                      {ob.type[0]}
                    </div>
                    <div>
                      <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest block mb-1">{t.orderBlock}</span>
                      <span className="text-xl font-black text-white font-mono">${ob.price.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-slate-400 block mb-1">{t.liquidity}</span>
                    <span className="text-sm font-black text-indigo-400 font-mono">{ob.volume} BTC</span>
                  </div>
                  {ob.mitigated && (
                    <div className="absolute -top-2 -right-2 bg-slate-950 border border-white/10 px-3 py-1 rounded-lg text-[8px] font-black text-slate-500 uppercase italic">{t.mitigated}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-950/40 p-10 rounded-[3.5rem] border border-white/5 relative overflow-hidden text-start">
          <div className="flex items-center justify-between mb-10">
            <h4 className="text-[13px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
              <Target className="w-5 h-5 text-rose-400" /> {t.efficiencyGaps}
            </h4>
            <ShieldAlert className="w-5 h-5 text-slate-700" />
          </div>
          
          <div className="space-y-6">
             {flowData.fvg.map((f, i) => (
               <div key={i} className="p-8 bg-indigo-500/5 border-2 border-dashed border-indigo-500/20 rounded-[2.5rem] group hover:border-indigo-500/40 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{t.magnetZoneDetected}</span>
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" />
                  </div>
                  <div className="flex items-end justify-between">
                     <div>
                       <span className="text-xs text-slate-500 uppercase font-black tracking-widest block mb-2">{t.priceImbalance}</span>
                       <span className="text-2xl font-black text-white font-mono tracking-tighter">
                         ${f.bottom.toLocaleString()} <span className="text-indigo-500/40 mx-2">—</span> ${f.top.toLocaleString()}
                       </span>
                     </div>
                     <div className="text-right">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">{t.gapType}</span>
                        <span className="text-sm font-black text-indigo-300 uppercase italic">{f.type}</span>
                     </div>
                  </div>
               </div>
             ))}
             <p className="text-[9px] text-slate-600 font-bold uppercase italic leading-relaxed text-center px-10">
               {/* Fixed 'lang' variable by using 't.lang' */}
               {t.lang === 'ar' ? '*تمثل فجوات القيمة العادلة مناطق ذات سيولة منخفضة قد يعود لها السعر لملء الطلبات.' : '*Fair Value Gaps represent areas of low liquidity where price is likely to revisit to fill orders.'}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiquidityFlowMatrix;
