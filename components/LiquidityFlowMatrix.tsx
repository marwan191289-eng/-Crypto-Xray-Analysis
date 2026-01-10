
import React, { useMemo } from 'react';
import { MarketData } from '../types';
import { AreaChart, Area, ResponsiveContainer, Tooltip, ReferenceLine, XAxis, YAxis, Cell } from 'recharts';
import { 
  Droplets, Zap, Target, Box, ArrowRightLeft, ShieldAlert, 
  TrendingUp, TrendingDown, Activity, Layers, Scan, Waves,
  Magnet, GitCommit, Disc, AlignCenter, Cuboid, RefreshCw, Lock,
  Clock, ArrowUpRight, ArrowDownRight, Eye
} from 'lucide-react';

interface Props {
  data: MarketData;
  isLoading: boolean;
  t: any;
}

// Helper for radial gauge
const RadialGauge = ({ value, label }: { value: number, label: string }) => {
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
        className="absolute bottom-0 left-1/2 w-64 h-32 bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500 opacity-20 rounded-t-full -translate-x-1/2 mask-radial-gauge"
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
  const metrics = useMemo(() => {
    if (!data.history || data.history.length < 30) return null;

    // --- 1. CVD Calculation ---
    let cumulativeDelta = 0;
    const cvdSeries = data.history.map(h => {
      const range = h.high - h.low;
      const body = h.close - h.open;
      const rawDelta = range === 0 ? 0 : (body / range) * h.volume;
      const delta = rawDelta * 0.6; 
      cumulativeDelta += delta;
      
      return { 
        time: h.time, 
        value: cumulativeDelta, 
        delta: rawDelta,
        price: h.close
      };
    });

    // --- 2. Volume Imbalance ---
    const recentHistory = data.history.slice(-15);
    const buyVol = recentHistory.reduce((acc, h) => h.close >= h.open ? acc + h.volume : acc, 0);
    const sellVol = recentHistory.reduce((acc, h) => h.close < h.open ? acc + h.volume : acc, 0);
    const totalVol = buyVol + sellVol;
    const imbalanceRatio = totalVol === 0 ? 0 : ((buyVol - sellVol) / totalVol) * 100;

    // --- 3. Advanced Order Block Detection (SMC) ---
    const obs = [];
    const len = data.history.length;
    
    // Scan backwards to find valid unmitigated or recently mitigated blocks
    for (let i = len - 3; i > 5; i--) {
        const curr = data.history[i];
        
        // Bullish OB Detection: Last Down Candle before aggressive Up Move
        if (curr.close < curr.open) {
            let displacement = false;
            let structureBreak = false;
            let highestAfter = -Infinity;

            // Check next 3 candles for displacement (strong impulsive move)
            for(let j=1; j<=3; j++) {
                if (i+j >= len) break;
                const next = data.history[i+j];
                if (next.close > next.open && (next.close - next.open) > (curr.high - curr.low) * 1.2) {
                    displacement = true;
                }
                if (next.high > highestAfter) highestAfter = next.high;
            }

            // Check if structure was broken (simplified local high break)
            const recentHigh = Math.max(data.history[i-1].high, data.history[i-2].high);
            if (highestAfter > recentHigh) structureBreak = true;

            if (displacement && structureBreak) {
                // Check Mitigation status
                let mitigated = false;
                let touchCount = 0;
                let active = true;
                let liveTesting = false;

                for(let k = i + 2; k < len; k++) {
                    const future = data.history[k];
                    // Mitigation: Price wicks into the OB body/range
                    if (future.low <= curr.high && future.high >= curr.low) {
                        mitigated = true;
                        touchCount++;
                    }
                    // Invalidation: Candle closes below OB low
                    if (future.close < curr.low) active = false;
                }

                // Check live price status
                if (data.price <= curr.high && data.price >= curr.low) liveTesting = true;

                if (active) {
                    obs.push({
                        type: 'BULLISH' as const,
                        top: curr.high,
                        bottom: curr.low,
                        eq: (curr.high + curr.low) / 2,
                        price: curr.high,
                        volStrength: (curr.volume / (totalVol/15)).toFixed(1), // Relative volume
                        mitigated,
                        touchCount,
                        liveTesting,
                        age: len - i
                    });
                }
            }
        }

        // Bearish OB Detection: Last Up Candle before aggressive Down Move
        if (curr.close > curr.open) {
            let displacement = false;
            let structureBreak = false;
            let lowestAfter = Infinity;

            for(let j=1; j<=3; j++) {
                if (i+j >= len) break;
                const next = data.history[i+j];
                if (next.close < next.open && (next.open - next.close) > (curr.high - curr.low) * 1.2) {
                    displacement = true;
                }
                if (next.low < lowestAfter) lowestAfter = next.low;
            }

            const recentLow = Math.min(data.history[i-1].low, data.history[i-2].low);
            if (lowestAfter < recentLow) structureBreak = true;

            if (displacement && structureBreak) {
                let mitigated = false;
                let touchCount = 0;
                let active = true;
                let liveTesting = false;

                for(let k = i + 2; k < len; k++) {
                    const future = data.history[k];
                    if (future.high >= curr.low && future.low <= curr.high) {
                        mitigated = true;
                        touchCount++;
                    }
                    if (future.close > curr.high) active = false;
                }

                if (data.price >= curr.low && data.price <= curr.high) liveTesting = true;

                if (active) {
                    obs.push({
                        type: 'BEARISH' as const,
                        top: curr.high,
                        bottom: curr.low,
                        eq: (curr.high + curr.low) / 2,
                        price: curr.low,
                        volStrength: (curr.volume / (totalVol/15)).toFixed(1),
                        mitigated,
                        touchCount,
                        liveTesting,
                        age: len - i
                    });
                }
            }
        }
        if (obs.length >= 6) break;
    }

    // --- 4. Advanced FVG Detection with Fill Tracking ---
    const fvgs = [];
    for (let i = len - 2; i >= 2; i--) {
      const curr = data.history[i];     // The middle candle of the 3-candle sequence formation? 
      // Actually FVG is formed by Candle 1 (i-1), Candle 2 (i), Candle 3 (i+1 in formation, but here i is index in history)
      // Let's use indices i (current/formation end), i-1 (gap), i-2 (start).
      // Formation: Candle A (i-2), Candle B (i-1), Candle C (i).
      
      const cA = data.history[i-2]; // Left
      const cB = data.history[i-1]; // Middle (Gap Candle)
      const cC = data.history[i];   // Right (Completion)

      // BISI (Buy Side Imbalance Sell Side Inefficiency) - Bullish FVG
      // Gap between cA.High and cC.Low
      if (cC.low > cA.high && cB.close > cB.open) {
          const gapTop = cC.low;
          const gapBottom = cA.high;
          const gapSize = gapTop - gapBottom;
          
          // Check fill status by looking at candles AFTER i
          let filledAmount = 0;
          let fullyFilled = false;
          let lowestWick = gapTop;

          for(let k = i + 1; k < len; k++) {
              const future = data.history[k];
              if (future.low < lowestWick) lowestWick = future.low;
              if (future.low <= gapBottom) fullyFilled = true;
          }
          
          // Current price fill check
          if (data.price < lowestWick) lowestWick = data.price;

          const filledRange = gapTop - Math.max(lowestWick, gapBottom);
          const fillPct = Math.min(100, Math.max(0, (filledRange / gapSize) * 100));

          if (!fullyFilled) {
              fvgs.push({
                  type: 'BISI' as const,
                  top: gapTop,
                  bottom: gapBottom,
                  price: (gapTop + gapBottom) / 2,
                  strength: Math.min(((gapSize) / data.price) * 2000, 100),
                  fillPct,
                  isLive: data.price >= gapBottom && data.price <= gapTop
              });
          }
      }

      // SIBI (Sell Side Imbalance Buy Side Inefficiency) - Bearish FVG
      // Gap between cA.Low and cC.High
      if (cC.high < cA.low && cB.close < cB.open) {
          const gapTop = cA.low;
          const gapBottom = cC.high;
          const gapSize = gapTop - gapBottom;

          let filledAmount = 0;
          let fullyFilled = false;
          let highestWick = gapBottom;

          for(let k = i + 1; k < len; k++) {
              const future = data.history[k];
              if (future.high > highestWick) highestWick = future.high;
              if (future.high >= gapTop) fullyFilled = true;
          }

          if (data.price > highestWick) highestWick = data.price;

          const filledRange = Math.min(highestWick, gapTop) - gapBottom;
          const fillPct = Math.min(100, Math.max(0, (filledRange / gapSize) * 100));

          if (!fullyFilled) {
              fvgs.push({
                  type: 'SIBI' as const,
                  top: gapTop,
                  bottom: gapBottom,
                  price: (gapTop + gapBottom) / 2,
                  strength: Math.min(((gapSize) / data.price) * 2000, 100),
                  fillPct,
                  isLive: data.price >= gapBottom && data.price <= gapTop
              });
          }
      }
      if (fvgs.length >= 5) break;
    }

    // --- 5. Flow & Correlation ---
    let correlationScore = 0;
    for(let i=1; i<cvdSeries.length; i++) {
        const priceChange = cvdSeries[i].price - cvdSeries[i-1].price;
        const cvdChange = cvdSeries[i].value - cvdSeries[i-1].value;
        if ((priceChange > 0 && cvdChange > 0) || (priceChange < 0 && cvdChange < 0)) {
            correlationScore++;
        }
    }
    const correlation = (correlationScore / (cvdSeries.length - 1)) * 100;

    const spotStrength = 50 + (imbalanceRatio * 0.4);
    const futuresStrength = 50 + (imbalanceRatio * 0.6) + (Math.random() * 5); 

    return {
      cvdSeries,
      imbalanceRatio,
      fvgs,
      obs: obs.sort((a,b) => a.age - b.age),
      spotFlow: Math.min(100, Math.max(0, spotStrength)),
      futuresFlow: Math.min(100, Math.max(0, futuresStrength)),
      correlation
    };
  }, [data]);

  if (isLoading || !metrics) return (
    <div className="bg-slate-950/40 rounded-[4rem] p-12 border border-white/5 animate-pulse min-h-[500px]">
        <div className="h-10 w-1/3 bg-slate-800 rounded-2xl mb-12"></div>
        <div className="grid grid-cols-12 gap-8">
            <div className="col-span-8 h-80 bg-slate-800 rounded-[3rem]"></div>
            <div className="col-span-4 h-80 bg-slate-800 rounded-[3rem]"></div>
        </div>
    </div>
  );

  const isBuying = metrics.imbalanceRatio > 0;
  const cvdTrend = metrics.cvdSeries[metrics.cvdSeries.length - 1].value > metrics.cvdSeries[0].value ? 'up' : 'down';
  const cvdColor = cvdTrend === 'up' ? '#10b981' : '#f43f5e';

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
        <div className="xl:col-span-8 bg-slate-950/40 p-8 rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden flex flex-col justify-between group/chart hover:border-white/10 transition-colors">
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-soft-light"></div>
           
           <div className="flex items-start justify-between mb-8 relative z-10">
             <div>
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Cumulative Volume Delta</span>
               <h4 className="text-xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                  {t.cvdDivergence}
                  <div className={`px-2 py-0.5 text-[9px] rounded border ${metrics.correlation > 50 ? 'border-emerald-500/30 text-emerald-500' : 'border-rose-500/30 text-rose-500'}`}>
                    {metrics.correlation > 50 ? 'Correlated' : 'Divergent'}
                  </div>
               </h4>
             </div>
             
             <div className="text-right">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Net Delta</span>
                <span className={`text-2xl font-mono font-black ${metrics.cvdSeries[metrics.cvdSeries.length-1].value > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {metrics.cvdSeries[metrics.cvdSeries.length-1].value > 0 ? '+' : ''}
                    {metrics.cvdSeries[metrics.cvdSeries.length-1].value.toFixed(2)}
                </span>
             </div>
          </div>
          
          <div className="h-64 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%" minHeight={250}>
              <AreaChart data={metrics.cvdSeries}>
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
          
          <div className="relative z-10 mt-4 h-4 w-full bg-slate-900 rounded-md overflow-hidden flex items-stretch">
             {metrics.cvdSeries.map((p, i) => (
                <div 
                  key={i} 
                  className="flex-1 opacity-80"
                  style={{ 
                    backgroundColor: Math.abs(p.delta) > 5000 
                      ? (p.delta > 0 ? '#10b981' : '#f43f5e') 
                      : (p.delta > 0 ? '#064e3b' : '#881337') 
                  }}
                />
             ))}
          </div>
          <div className="mt-2 flex justify-between items-center text-[8px] font-black text-slate-600 uppercase tracking-widest relative z-10">
             <span>Liquidity Density Heatmap</span>
             <span className={isBuying ? 'text-emerald-500 animate-pulse' : 'text-rose-500 animate-pulse'}>{t.liveFeed}</span>
          </div>
        </div>

        {/* Pressure Gauge Section */}
        <div className="xl:col-span-4 bg-slate-950/40 p-10 rounded-[3.5rem] border border-white/5 shadow-2xl flex flex-col text-start relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03]">
             <Zap className="w-32 h-32 text-white" />
          </div>

          <div className="relative z-10 mb-2">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.volumeImbalance}</span>
              <span className={`text-xl font-black font-mono tracking-tighter ${isBuying ? 'text-emerald-400' : 'text-rose-400'}`}>
                {metrics.imbalanceRatio > 0 ? '+' : ''}{metrics.imbalanceRatio.toFixed(1)}%
              </span>
            </div>
            
            <div className="mb-4">
              <RadialGauge value={metrics.imbalanceRatio} label="Pressure" />
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
        <div className="bg-slate-950/40 p-10 rounded-[3.5rem] border border-white/5 relative overflow-hidden text-start shadow-2xl">
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
            {metrics.obs.map((ob, i) => (
              <div key={i} className={`group/ob relative p-1 rounded-[2rem] bg-gradient-to-br ${ob.liveTesting ? 'from-amber-500/30 to-amber-900/10' : ob.type === 'BULLISH' ? 'from-emerald-500/20 to-emerald-900/5' : 'from-rose-500/20 to-rose-900/5'} transition-all duration-500 ${ob.liveTesting ? 'scale-[1.02] shadow-[0_0_20px_rgba(245,158,11,0.2)]' : ''}`}>
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
                                   {ob.liveTesting ? (
                                     <span className="text-[9px] text-amber-400 font-bold uppercase animate-pulse flex items-center gap-1"><Eye size={10} /> TESTING NOW</span>
                                   ) : (
                                     <span className={`text-[9px] font-bold uppercase ${ob.mitigated ? 'text-slate-500 line-through' : 'text-white'}`}>{ob.mitigated ? 'MITIGATED' : 'FRESH ZONE'}</span>
                                   )}
                                </div>
                            </div>
                        </div>
                        {/* Vol Strength Indicator */}
                        <div className="text-right">
                            <div className="flex items-center gap-1 justify-end">
                                <Activity size={12} className="text-indigo-400" />
                                <span className="text-[10px] font-mono font-bold text-white">{ob.volStrength}x</span>
                            </div>
                            <span className="text-[8px] text-slate-600 font-bold uppercase tracking-wider">Vol Intensity</span>
                        </div>
                    </div>

                    {/* Zone Visualizer */}
                    <div className={`relative h-12 w-full rounded-xl border flex items-center justify-between px-4 overflow-hidden ${ob.type === 'BULLISH' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                        {/* Background Noise */}
                        <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                        
                        <div className="relative z-10 flex flex-col items-center">
                            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">TOP</span>
                            <span className="text-xs font-mono font-black text-white">{ob.top.toFixed(2)}</span>
                        </div>
                        <div className="h-full w-px bg-white/5"></div>
                        <div className="relative z-10 flex flex-col items-center">
                            <span className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest mb-0.5">EQ</span>
                            <span className="text-xs font-mono font-black text-indigo-300">{ob.eq.toFixed(2)}</span>
                        </div>
                        <div className="h-full w-px bg-white/5"></div>
                        <div className="relative z-10 flex flex-col items-center">
                            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">BOT</span>
                            <span className="text-xs font-mono font-black text-white">{ob.bottom.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center pt-2 border-t border-white/5">
                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                            <Clock size={12} /> {ob.age} Candles Ago
                        </span>
                        {ob.touchCount > 0 && (
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                {ob.touchCount} Mitigations
                            </span>
                        )}
                        {!ob.mitigated && (
                            <span className="flex items-center gap-2 text-[9px] font-black text-indigo-400 uppercase tracking-widest animate-pulse">
                                <Magnet size={12} /> Magnet Active
                            </span>
                        )}
                    </div>
                </div>
              </div>
            ))}
            {metrics.obs.length === 0 && (
              <div className="p-8 text-center border border-dashed border-white/10 rounded-[2rem]">
                 <AlignCenter className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                 <p className="text-slate-500 font-black uppercase tracking-widest text-[10px] italic">Scanning for Order Blocks...</p>
              </div>
            )}
          </div>
        </div>

        {/* FVGs - Enhanced */}
        <div className="bg-slate-950/40 p-10 rounded-[3.5rem] border border-white/5 relative overflow-hidden text-start shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-[13px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
              <Target className="w-5 h-5 text-indigo-400" /> {t.efficiencyGaps}
            </h4>
            <ShieldAlert className="w-5 h-5 text-slate-700 opacity-50" />
          </div>
          
          <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
             {metrics.fvgs.map((f, i) => (
               <div key={i} className={`relative p-6 rounded-[2.5rem] bg-slate-900/50 border hover:border-indigo-500/30 transition-all group overflow-hidden ${f.isLive ? 'border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'border-white/5'}`}>
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
                                {f.isLive && <span className="text-[8px] bg-amber-500/20 text-amber-400 px-1.5 rounded uppercase font-black animate-pulse">LIVE</span>}
                              </div>
                          </div>
                      </div>
                      <div className="text-right">
                          <span className="text-xl font-black font-mono text-indigo-300">{f.strength.toFixed(0)}%</span>
                          <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest block">Gap Strength</span>
                      </div>
                  </div>

                  {/* Gap Visualizer */}
                  <div className="relative mb-4">
                      <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-2">
                          <span>Top</span>
                          <span>Bot</span>
                      </div>
                      <div className="h-14 w-full rounded-xl bg-black/40 border border-white/5 relative flex items-center justify-center overflow-hidden">
                          {/* Gap Zone Lines */}
                          <div className={`absolute left-0 right-0 top-0 h-px ${f.type === 'BISI' ? 'bg-emerald-500/50' : 'bg-rose-500/50'} dashed-line`}></div>
                          <div className={`absolute left-0 right-0 bottom-0 h-px ${f.type === 'BISI' ? 'bg-emerald-500/50' : 'bg-rose-500/50'} dashed-line`}></div>
                          
                          {/* Fill Progress Bar */}
                          <div 
                            className="absolute top-0 bottom-0 left-0 bg-white/5 transition-all duration-1000" 
                            style={{ width: `${f.fillPct}%` }}
                          ></div>

                          <div className={`text-lg font-black font-mono tracking-tighter relative z-10 ${f.type === 'BISI' ? 'text-emerald-400' : 'text-rose-400'}`}>
                              ${Math.abs(f.top - f.bottom).toFixed(2)}
                          </div>
                          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>
                      </div>
                      <div className="flex justify-between mt-1 px-1">
                         <span className="text-[8px] font-mono text-slate-600 font-bold">Filled: {f.fillPct.toFixed(1)}%</span>
                      </div>
                  </div>

                  <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono font-bold text-white bg-white/5 px-3 py-1 rounded-lg">
                          ${f.bottom.toFixed(2)} - ${f.top.toFixed(2)}
                      </span>
                      {f.strength > 80 && (
                          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
                              <Zap size={10} className="text-amber-400" />
                              <span className="text-[8px] font-black text-amber-400 uppercase tracking-widest">High Priority</span>
                          </div>
                      )}
                  </div>
               </div>
             ))}
             
             {metrics.fvgs.length === 0 && (
              <div className="p-8 text-center border border-dashed border-white/10 rounded-[2rem]">
                 <Disc className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                 <p className="text-slate-500 font-black uppercase tracking-widest text-[10px] italic">Market Efficient. No Gaps.</p>
              </div>
             )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default LiquidityFlowMatrix;
