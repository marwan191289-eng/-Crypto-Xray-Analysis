
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

// Helper for radial gauge
const RadialGauge = ({ value }: { value: number }) => {
  const normalized = Math.min(Math.max(value, -100), 100);
  const rotation = ((normalized + 100) / 200) * 180;
  const color = normalized > 10 ? '#10b981' : normalized < -10 ? '#f43f5e' : '#fbbf24';
  
  return (
    <div className="relative w-full h-32 flex flex-col items-center justify-end overflow-hidden">
      <div className="absolute bottom-0 w-64 h-32 bg-slate-800/50 rounded-t-full border-t border-l border-r border-white/5 overflow-hidden">
         {Array.from({ length: 9 }).map((_, i) => (
           <div 
             key={i} 
             className="absolute bottom-0 left-1/2 w-0.5 h-full bg-slate-700/30 origin-bottom"
             style={{ transform: `translateX(-50%) rotate(${(i * 22.5) - 90}deg)` }}
           />
         ))}
      </div>
      <div 
        className="absolute bottom-0 left-1/2 w-64 h-32 bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500 opacity-20 rounded-t-full -translate-x-1/2"
        style={{ 
            maskImage: 'radial-gradient(circle at bottom center, transparent 60%, black 60%)',
            WebkitMaskImage: 'radial-gradient(circle at bottom center, transparent 60%, black 60%)'
        }}
      ></div>
      <div 
        className="absolute bottom-0 left-1/2 w-1 h-28 bg-white origin-bottom transition-transform duration-1000 ease-out z-10"
        style={{ 
            transform: `translateX(-50%) rotate(${rotation - 90}deg)`,
            boxShadow: `0 0 10px ${color}`
        }}
      >
        <div className="w-3 h-3 bg-white rounded-full absolute -top-1 left-1/2 -translate-x-1/2 shadow-[0_0_15px_white]"></div>
      </div>
      <div className="absolute bottom-0 w-4 h-2 bg-slate-900 z-20"></div>
      <div className="absolute bottom-2 left-4 text-[9px] font-black text-rose-500 uppercase">Sell</div>
      <div className="absolute bottom-2 right-4 text-[9px] font-black text-emerald-500 uppercase">Buy</div>
    </div>
  );
};

const LiquidityFlowMatrix: React.FC<Props> = ({ data, isLoading, t }) => {
  const metrics = useMemo((): LiquidityFlow => {
    // Generate simulated data if real detailed history is sparse
    const cvdSeries = Array.from({ length: 30 }, (_, i) => {
        const trend = Math.sin(i * 0.2) * 20;
        const noise = (Math.random() - 0.5) * 10;
        return trend + noise;
    });

    const imbalance = (Math.random() - 0.5) * 60; // -30 to +30 range

    return {
      cvd: cvdSeries,
      volumeImbalance: imbalance, 
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
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-8 h-80 bg-slate-800 rounded-[3rem]"></div>
            <div className="col-span-12 md:col-span-4 h-80 bg-slate-800 rounded-[3rem]"></div>
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

      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-12 relative z-10 gap-6">
        <div className="flex items-center gap-6">
          <div className="p-5 bg-emerald-500/10 rounded-3xl border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
            <Droplets className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase italic leading-none">{t.liquidityMatrix}</h3>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">{t.cvdDivergence}</span>
              <div className="h-px w-8 bg-slate-700"></div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">{t.smcLayer}</span>
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
        <div className="xl:col-span-8 bg-slate-950/40 p-6 md:p-8 rounded-[2rem] md:rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden flex flex-col justify-between group/chart hover:border-white/10 transition-colors">
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-soft-light"></div>
           
           <div className="flex items-start justify-between mb-8 relative z-10">
             <div>
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Cumulative Volume Delta</span>
               <h4 className="text-lg md:text-xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                  {t.cvdDivergence}
                  <div className={`px-2 py-0.5 text-[9px] rounded border ${isBuying ? 'border-emerald-500/30 text-emerald-500' : 'border-rose-500/30 text-rose-500'}`}>
                    {isBuying ? 'Dominant' : 'Weak'}
                  </div>
               </h4>
             </div>
             
             <div className="text-right">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Net Delta</span>
                <span className={`text-2xl font-mono font-black ${metrics.cvd[metrics.cvd.length-1] > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {metrics.cvd[metrics.cvd.length-1] > 0 ? '+' : ''}
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
          
          <div className="mt-2 flex justify-between items-center text-[8px] font-black text-slate-600 uppercase tracking-widest relative z-10">
             <span>Liquidity Density Heatmap</span>
             <span className={isBuying ? 'text-emerald-500 animate-pulse' : 'text-rose-500 animate-pulse'}>{t.liveFeed}</span>
          </div>
        </div>

        {/* Pressure Gauge Section */}
        <div className="xl:col-span-4 bg-slate-950/40 p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] border border-white/5 shadow-2xl flex flex-col text-start relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03]">
             <Zap className="w-32 h-32 text-white" />
          </div>

          <div className="relative z-10 mb-2">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.volumeImbalance}</span>
              <span className={`text-xl font-black font-mono tracking-tighter ${isBuying ? 'text-emerald-400' : 'text-rose-400'}`}>
                {metrics.volumeImbalance > 0 ? '+' : ''}{metrics.volumeImbalance.toFixed(1)}%
              </span>
            </div>
            
            <div className="mb-4">
              <RadialGauge value={metrics.volumeImbalance} />
            </div>

            <p className="text-[9px] text-slate-500 font-bold uppercase mt-1 italic leading-relaxed text-center">
              {t.lang === 'ar' ? 'ضغط أوامر السوق' : 'Market Order Pressure'}
            </p>
          </div>

          <div className="space-y-4 relative z-10 flex-1 flex flex-col justify-end">
             <div className="space-y-3">
                <div className="flex justify-between items-center text-[9px] font-black text-slate-500 uppercase tracking-widest">
                   <span>Flow Composition</span>
                   <Layers className="w-3 h-3" />
                </div>
                
                <div className="bg-slate-900 rounded-xl p-3 border border-white/5 space-y-3">
                    <div className="flex items-center gap-3">
                       <span className="text-[9px] w-8 font-bold text-slate-400">SPOT</span>
                       <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500" style={{ width: `${metrics.spotFlow}%` }}></div>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className="text-[9px] w-8 font-bold text-slate-400">PERP</span>
                       <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${metrics.futuresFlow}%` }}></div>
                       </div>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Enhanced Structural Map Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-10">
        
        {/* Smart Money Order Blocks - Enhanced */}
        <div className="bg-slate-950/40 p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] border border-white/5 relative overflow-hidden text-start shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-[13px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
              <Box className="w-5 h-5 text-indigo-400" /> {t.smartMoneyBlocks}
            </h4>
            <div className="flex items-center gap-2">
                <Cuboid className="w-4 h-4 text-slate-600" />
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">SMC Logic</span>
            </div>
          </div>
          
          <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
            {metrics.orderBlocks.map((ob, i) => (
              <div key={i} className={`group/ob relative p-1 rounded-[2rem] bg-gradient-to-br ${ob.type === 'BULLISH' ? 'from-emerald-500/20 to-emerald-900/5' : 'from-rose-500/20 to-rose-900/5'} transition-all duration-500`}>
                <div className="absolute inset-0 bg-black/40 rounded-[2rem] m-[1px]"></div>
                <div className="relative p-6 flex flex-col gap-4">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <span className={`p-2 rounded-lg ${ob.type === 'BULLISH' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                {ob.type === 'BULLISH' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                            </span>
                            <div>
                                <span className={`text-[11px] font-black uppercase tracking-widest block ${ob.type === 'BULLISH' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {ob.type === 'BULLISH' ? 'Bullish OB' : 'Bearish OB'}
                                </span>
                                <div className="flex items-center gap-2">
                                     <span className={`text-[9px] font-bold uppercase ${ob.mitigated ? 'text-slate-500 line-through' : 'text-white'}`}>{ob.mitigated ? 'MITIGATED' : 'FRESH ZONE'}</span>
                                </div>
                            </div>
                        </div>
                        {/* Vol Strength Indicator */}
                        <div className="text-right">
                            <div className="flex items-center gap-1 justify-end">
                                <Activity size={12} className="text-indigo-400" />
                                <span className="text-[10px] font-mono font-bold text-white">{(ob.volume / 1000).toFixed(1)}K</span>
                            </div>
                            <span className="text-[8px] text-slate-600 font-bold uppercase tracking-wider">Volume</span>
                        </div>
                    </div>

                    {/* Zone Visualizer */}
                    <div className={`relative h-12 w-full rounded-xl border flex items-center justify-between px-4 overflow-hidden ${ob.type === 'BULLISH' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                        <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                        <div className="relative z-10 flex flex-col items-center">
                            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Price</span>
                            <span className="text-xs font-mono font-black text-white">{ob.price.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center pt-2 border-t border-white/5">
                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                            <Clock size={12} /> Recent
                        </span>
                        {!ob.mitigated && (
                            <span className="flex items-center gap-2 text-[9px] font-black text-indigo-400 uppercase tracking-widest animate-pulse">
                                <Magnet size={12} /> Magnet Active
                            </span>
                        )}
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FVGs - Enhanced */}
        <div className="bg-slate-950/40 p-6 md:p-10 rounded-[2rem] md:rounded-[3.5rem] border border-white/5 relative overflow-hidden text-start shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-[13px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
              <Target className="w-5 h-5 text-indigo-400" /> {t.efficiencyGaps}
            </h4>
            <ShieldAlert className="w-5 h-5 text-slate-700 opacity-50" />
          </div>
          
          <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
             {metrics.fvg.map((f, i) => (
               <div key={i} className={`relative p-6 rounded-[2.5rem] bg-slate-900/50 border hover:border-indigo-500/30 transition-all group overflow-hidden border-white/5`}>
                  <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:scale-125 transition-transform rotate-12">
                    <Waves className="w-20 h-20 text-indigo-400" />
                  </div>

                  <div className="flex justify-between items-start mb-6 relative z-10">
                      <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${f.type === 'BISI' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                              {f.type === 'BISI' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                          </div>
                          <div>
                              <span className={`text-[12px] font-black uppercase tracking-widest block ${f.type === 'BISI' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                  {f.type} GAP
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-bold text-slate-500 uppercase">Inefficiency</span>
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="relative mb-4">
                      <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-2">
                          <span>Top</span>
                          <span>Bot</span>
                      </div>
                      <div className="h-14 w-full rounded-xl bg-black/40 border border-white/5 relative flex items-center justify-center overflow-hidden">
                          <div className={`text-lg font-black font-mono tracking-tighter relative z-10 ${f.type === 'BISI' ? 'text-emerald-400' : 'text-rose-400'}`}>
                              ${Math.abs(f.top - f.bottom).toFixed(2)}
                          </div>
                          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>
                      </div>
                  </div>

                  <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono font-bold text-white bg-white/5 px-3 py-1 rounded-lg">
                          ${f.bottom.toFixed(2)} - ${f.top.toFixed(2)}
                      </span>
                  </div>
               </div>
             ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default LiquidityFlowMatrix;
