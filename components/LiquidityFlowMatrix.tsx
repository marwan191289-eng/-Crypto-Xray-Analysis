
import React, { useMemo } from 'react';
import { MarketData, LiquidityFlow } from '../types';
import { AreaChart, Area, ResponsiveContainer, Tooltip, ReferenceLine, XAxis, YAxis } from 'recharts';
import { 
  Droplets, Zap, Target, Box, ArrowRightLeft, ShieldAlert, 
  TrendingUp, TrendingDown, Activity, Layers, Scan, Waves,
  Magnet, Cuboid, Clock, ArrowUpRight, ArrowDownRight, Eye
} from 'lucide-react';

interface Props {
  data: MarketData;
  isLoading: boolean;
  t: any;
}

const RadialGauge = ({ value }: { value: number }) => {
  const normalized = Math.min(Math.max(value, -100), 100);
  const rotation = ((normalized + 100) / 200) * 180;
  const color = normalized > 10 ? '#10b981' : normalized < -10 ? '#f43f5e' : '#fbbf24';
  
  return (
    <div className="relative w-full h-32 flex flex-col items-center justify-end overflow-hidden">
      <div className="absolute bottom-0 w-64 h-32 bg-slate-800/30 rounded-t-full border-t border-l border-r border-white/5 overflow-hidden">
         {Array.from({ length: 9 }).map((_, i) => (
           <div 
             key={i} 
             className="absolute bottom-0 left-1/2 w-0.5 h-full bg-slate-700/20 origin-bottom"
             style={{ transform: `translateX(-50%) rotate(${(i * 22.5) - 90}deg)` }}
           />
         ))}
      </div>
      <div 
        className="absolute bottom-0 left-1/2 w-64 h-32 bg-gradient-to-r from-rose-500/20 via-amber-400/20 to-emerald-500/20 rounded-t-full -translate-x-1/2"
        style={{ 
            maskImage: 'radial-gradient(circle at bottom center, transparent 60%, black 60%)',
            WebkitMaskImage: 'radial-gradient(circle at bottom center, transparent 60%, black 60%)'
        }}
      ></div>
      <div 
        className="absolute bottom-0 left-1/2 w-1 h-28 bg-white origin-bottom transition-transform duration-1000 ease-out z-10"
        style={{ 
            transform: `translateX(-50%) rotate(${rotation - 90}deg)`,
            boxShadow: `0 0 15px ${color}`
        }}
      >
        <div className="w-3 h-3 bg-white rounded-full absolute -top-1 left-1/2 -translate-x-1/2 shadow-[0_0_10px_white]"></div>
      </div>
      <div className="absolute bottom-0 w-4 h-2 bg-slate-900 z-20"></div>
      <div className="absolute bottom-2 left-6 text-[9px] font-black text-rose-500 uppercase tracking-widest">Sell</div>
      <div className="absolute bottom-2 right-6 text-[9px] font-black text-emerald-500 uppercase tracking-widest">Buy</div>
    </div>
  );
};

const LiquidityFlowMatrix: React.FC<Props> = ({ data, isLoading, t }) => {
  const metrics = useMemo((): LiquidityFlow => {
    const cvdSeries = Array.from({ length: 30 }, (_, i) => {
        const trend = Math.sin(i * 0.2) * 25;
        const noise = (Math.random() - 0.5) * 10;
        return trend + noise;
    });

    return {
      cvd: cvdSeries,
      volumeImbalance: (Math.random() - 0.5) * 60,
      spotFlow: 45 + Math.random() * 20,
      futuresFlow: 45 + Math.random() * 20,
      orderBlocks: [
        { type: 'BEARISH', price: data.price * 1.008, volume: 1450, mitigated: false },
        { type: 'BULLISH', price: data.price * 0.992, volume: 2100, mitigated: true },
        { type: 'BULLISH', price: data.price * 0.985, volume: 3500, mitigated: false }
      ],
      fvg: [
        { top: data.price * 1.015, bottom: data.price * 1.012, type: 'SIBI' },
        { top: data.price * 0.995, bottom: data.price * 0.998, type: 'BISI' }
      ]
    };
  }, [data]);

  const cvdChartData = useMemo(() => metrics.cvd.map((val, i) => ({ step: i, value: val })), [metrics]);

  if (isLoading) return (
    <div className="bg-slate-950/40 rounded-[2rem] md:rounded-[4rem] p-6 md:p-12 border border-white/5 animate-pulse min-h-[500px]">
        <div className="h-10 w-1/3 bg-slate-800 rounded-2xl mb-12"></div>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="col-span-12 xl:col-span-8 h-80 bg-slate-800 rounded-[3rem]"></div>
            <div className="col-span-12 xl:col-span-4 h-80 bg-slate-800 rounded-[3rem]"></div>
        </div>
    </div>
  );

  const isBuying = metrics.volumeImbalance > 0;
  const cvdTrend = metrics.cvd[metrics.cvd.length - 1] > metrics.cvd[0] ? 'up' : 'down';
  const cvdColor = cvdTrend === 'up' ? '#10b981' : '#f43f5e';

  return (
    <div className="cyber-card rounded-[2rem] md:rounded-[4rem] p-6 md:p-12 relative overflow-hidden group border" style={{ borderColor: 'var(--border-line)' }}>
      <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
        <ArrowRightLeft className="w-96 h-96 text-emerald-400" />
      </div>

      {/* Header - Unified for All Devices */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-12 relative z-10 gap-6">
        <div className="flex items-center gap-6">
          <div className="p-5 bg-emerald-500/10 rounded-3xl border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
            <Droplets className="w-8 h-8 text-emerald-400" />
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase italic leading-none">{t.liquidityMatrix}</h3>
            <div className="flex items-center justify-center md:justify-start gap-3 mt-3">
              <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">{t.cvdDivergence}</span>
              <div className="h-px w-8 bg-slate-700"></div>
              <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">{t.smcLayer}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-black/20 px-6 py-3 rounded-2xl border border-white/5 backdrop-blur-md">
           <Activity className="w-5 h-5 text-emerald-500 animate-pulse" />
           <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{t.forensicHubActive}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        
        {/* CVD Chart Section */}
        <div className="xl:col-span-8 bg-slate-950/40 p-6 md:p-8 rounded-[2.5rem] md:rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden flex flex-col justify-between group/chart hover:border-white/10 transition-colors">
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-soft-light"></div>
           
           <div className="flex items-start justify-between mb-8 relative z-10">
             <div>
               <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Cumulative Volume Delta</span>
               <h4 className="text-lg md:text-xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                  {t.cvdDivergence}
                  <div className={`px-2 py-0.5 text-[8px] md:text-[9px] rounded border ${isBuying ? 'border-emerald-500/30 text-emerald-500' : 'border-rose-500/30 text-rose-500'}`}>
                    {isBuying ? 'ACCUMULATION' : 'DISTRIBUTION'}
                  </div>
               </h4>
             </div>
             
             <div className="text-right">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Net Flow</span>
                <span className={`text-xl md:text-2xl font-mono font-black ${metrics.cvd[metrics.cvd.length-1] > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {metrics.cvd[metrics.cvd.length-1].toFixed(2)}
                </span>
             </div>
          </div>
          
          <div className="h-64 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%" minHeight={250}>
              <AreaChart data={cvdChartData}>
                <defs>
                  <linearGradient id="cvdGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={cvdColor} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={cvdColor} stopOpacity={0}/>
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
                  stroke={cvdColor}
                  strokeWidth={3} 
                  fill="url(#cvdGradient)"
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 flex justify-between items-center text-[8px] font-black text-slate-600 uppercase tracking-widest relative z-10">
             <span>Forensic Liquidity Waveform</span>
             <span className={isBuying ? 'text-emerald-500 animate-pulse' : 'text-rose-500 animate-pulse'}>{t.liveFeed}</span>
          </div>
        </div>

        {/* Pressure Gauge Section */}
        <div className="xl:col-span-4 bg-slate-950/40 p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border border-white/5 shadow-2xl flex flex-col text-start relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03]">
             <Zap className="w-32 h-32 text-white" />
          </div>

          <div className="relative z-10 mb-2">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.volumeImbalance}</span>
              <span className={`text-xl font-black font-mono tracking-tighter ${isBuying ? 'text-emerald-400' : 'text-rose-400'}`}>
                {metrics.volumeImbalance > 0 ? '+' : ''}{metrics.volumeImbalance.toFixed(1)}%
              </span>
            </div>
            
            <div className="mb-6 py-2">
              <RadialGauge value={metrics.volumeImbalance} />
            </div>

            <p className="text-[9px] text-slate-500 font-bold uppercase mt-1 italic leading-relaxed text-center">
              {t.lang === 'ar' ? 'ضغط أوامر السوق المكتشف' : 'Systemic Market Pressure Detected'}
            </p>
          </div>

          <div className="space-y-4 relative z-10 flex-1 flex flex-col justify-end">
             <div className="space-y-4">
                <div className="flex justify-between items-center text-[9px] font-black text-slate-500 uppercase tracking-widest">
                   <span>Order Flow Origin</span>
                   <Layers className="w-3 h-3 text-indigo-400" />
                </div>
                
                <div className="bg-slate-900/60 rounded-2xl p-4 border border-white/5 space-y-4 shadow-inner">
                    <div className="space-y-1.5">
                       <div className="flex justify-between items-end">
                          <span className="text-[9px] font-bold text-slate-400">SPOT DEPTH</span>
                          <span className="text-[10px] font-mono text-white">{metrics.spotFlow.toFixed(1)}%</span>
                       </div>
                       <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 shadow-[0_0_8px_#6366f1]" style={{ width: `${metrics.spotFlow}%` }}></div>
                       </div>
                    </div>
                    <div className="space-y-1.5">
                       <div className="flex justify-between items-end">
                          <span className="text-[9px] font-bold text-slate-400">PERP LEVERAGE</span>
                          <span className="text-[10px] font-mono text-white">{metrics.futuresFlow.toFixed(1)}%</span>
                       </div>
                       <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 shadow-[0_0_8px_#10b981]" style={{ width: `${metrics.futuresFlow}%` }}></div>
                       </div>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Structural Map Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-10">
        
        {/* Order Blocks */}
        <div className="bg-slate-950/40 p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border border-white/5 relative overflow-hidden text-start shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-[13px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
              <Box className="w-5 h-5 text-indigo-400" /> {t.smartMoneyBlocks}
            </h4>
            <div className="flex items-center gap-2">
                <Cuboid className="w-4 h-4 text-slate-600" />
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">SMC Protocol</span>
            </div>
          </div>
          
          <div className="space-y-4 max-h-[450px] overflow-y-auto custom-scrollbar pr-2">
            {metrics.orderBlocks.map((ob, i) => (
              <div key={i} className={`group/ob relative p-1 rounded-[2rem] bg-gradient-to-br ${ob.type === 'BULLISH' ? 'from-emerald-500/20 to-emerald-900/5' : 'from-rose-500/20 to-rose-900/5'} transition-all duration-500`}>
                <div className="absolute inset-0 bg-black/60 rounded-[2rem] m-[1px]"></div>
                <div className="relative p-6 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <span className={`p-2.5 rounded-xl ${ob.type === 'BULLISH' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                {ob.type === 'BULLISH' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                            </span>
                            <div>
                                <span className={`text-[12px] font-black uppercase tracking-[0.2em] block ${ob.type === 'BULLISH' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {ob.type === 'BULLISH' ? t.demandZone : t.supplyZone}
                                </span>
                                <span className={`text-[9px] font-bold uppercase ${ob.mitigated ? 'text-slate-600 line-through' : 'text-slate-400'}`}>{ob.mitigated ? t.mitigated : 'FRESH'}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-[11px] font-mono font-black text-white">${ob.price.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                       <div className={`h-full ${ob.type === 'BULLISH' ? 'bg-emerald-500' : 'bg-rose-500'}`} style={{ width: `${(ob.volume / 4000) * 100}%` }}></div>
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FVGs */}
        <div className="bg-slate-950/40 p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border border-white/5 relative overflow-hidden text-start shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-[13px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
              <Target className="w-5 h-5 text-indigo-400" /> {t.efficiencyGaps}
            </h4>
            <ShieldAlert className="w-5 h-5 text-slate-700 opacity-50" />
          </div>
          
          <div className="space-y-4 max-h-[450px] overflow-y-auto custom-scrollbar pr-2">
             {metrics.fvg.map((f, i) => (
               <div key={i} className={`relative p-6 rounded-[2.5rem] bg-slate-900/40 border hover:border-indigo-500/30 transition-all group overflow-hidden border-white/5 shadow-inner`}>
                  <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:scale-125 transition-transform">
                    <Waves className="w-20 h-20 text-indigo-400" />
                  </div>

                  <div className="flex justify-between items-center relative z-10">
                      <div className="flex items-center gap-4">
                          <div className={`p-2.5 rounded-xl ${f.type === 'BISI' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                              {f.type === 'BISI' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                          </div>
                          <div>
                              <span className={`text-[12px] font-black uppercase tracking-[0.2em] block ${f.type === 'BISI' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                  {f.type} GAP
                              </span>
                              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{t.magnetZone}</span>
                          </div>
                      </div>
                      <div className="text-right">
                         <span className="text-[11px] font-mono font-black text-white block">${f.bottom.toLocaleString()}</span>
                         <span className="text-[11px] font-mono font-black text-white/50 block">${f.top.toLocaleString()}</span>
                      </div>
                  </div>
               </div>
             ))}
             
             <div className="mt-8 flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                <ShieldAlert className="w-4 h-4 text-slate-500 mt-0.5" />
                <p className="text-[9px] text-slate-500 font-bold uppercase italic leading-relaxed">
                  {t.lang === 'ar' 
                    ? '*تمثل فجوات القيمة العادلة مناطق ذات سيولة منخفضة، مما يجذب السعر لإعادة التوازن عاجلاً أم آجلاً.' 
                    : '*Fair Value Gaps indicate imbalances acting as institutional magnets for impending price rebalancing.'}
                </p>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LiquidityFlowMatrix;
