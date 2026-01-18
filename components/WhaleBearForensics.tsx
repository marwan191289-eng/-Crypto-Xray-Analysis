
import React, { useState, useEffect, useMemo } from 'react';
import { WhaleBearMetrics, WhaleTransaction } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, ReferenceLine, 
  ComposedChart, Line, Area, CartesianGrid
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Target, Activity, Ship, 
  Zap, Radar, Anchor, Radio, Skull, Clock,
  Waves, BarChart3, Database, Globe, ArrowUpRight, ArrowDownLeft, Gauge,
  Crosshair, Disc
} from 'lucide-react';

interface Props {
  metrics?: WhaleBearMetrics;
  whaleTx: WhaleTransaction[];
  symbol: string;
  isLoading: boolean;
  currentPrice?: number;
  t: any;
}

// -- Precision Live Clock --
const LiveClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex flex-col items-end border-l border-white/5 pl-4 md:pl-6 h-full justify-center min-w-[100px] md:min-w-[120px]">
      <div className="flex items-center gap-2 text-white">
        <Clock size={12} className="text-indigo-400" />
        <span className="text-xs md:text-sm font-mono font-black tracking-tight leading-none">
          {time.toLocaleTimeString('en-US', { hour12: false })}
        </span>
        <span className="hidden md:inline-block text-[10px] font-bold text-slate-500 bg-white/5 px-1.5 rounded">UTC</span>
      </div>
      <span className="text-[8px] md:text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mt-1">
        {time.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' })}
      </span>
    </div>
  );
};

// -- Custom SVG Gauge Component --
const FlowGauge = ({ value }: { value: number }) => {
  // Value 0-100
  const radius = 80;
  const stroke = 12;
  const normalizedValue = Math.min(Math.max(value, 0), 100);
  const circumference = 2 * Math.PI * radius;
  // We only want a semi-circle (180 deg) or partial arc (220 deg)
  // Let's do a 240 degree arc
  const arcLength = circumference * (240 / 360); 
  const dashOffset = arcLength - (normalizedValue / 100) * arcLength;
  
  // Rotation to position the gap at the bottom
  const rotation = 150; // Start angle

  const getColor = (v: number) => {
    if (v > 60) return '#10b981'; // Green
    if (v < 40) return '#f43f5e'; // Red
    return '#fbbf24'; // Amber
  };
  const color = getColor(normalizedValue);

  return (
    <div className="relative w-40 h-40 flex items-center justify-center">
      <svg className="w-full h-full transform" viewBox="0 0 200 200">
        {/* Background Track */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="#1e293b"
          strokeWidth={stroke}
          strokeDasharray={`${arcLength} ${circumference}`}
          transform={`rotate(${rotation} 100 100)`}
          strokeLinecap="round"
        />
        {/* Active Arc */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={dashOffset}
          transform={`rotate(${rotation} 100 100)`}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out drop-shadow-[0_0_10px_currentColor]"
        />
      </svg>
      {/* Center Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
         <span className="text-4xl font-black font-mono tracking-tighter text-white drop-shadow-md">
            {normalizedValue.toFixed(0)}
         </span>
         <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">PSI Pressure</span>
      </div>
    </div>
  );
};

const WhaleBearForensics: React.FC<Props> = ({ metrics, whaleTx, symbol, isLoading, currentPrice, t }) => {
  const [pressure, setPressure] = useState(50); 
  const [liveNetflow, setLiveNetflow] = useState<any[]>([]);
  const [liveTx, setLiveTx] = useState<WhaleTransaction[]>([]);
  const [netMomentum, setNetMomentum] = useState(0);
  const [biasLabel, setBiasLabel] = useState('Neutral');

  useEffect(() => {
    if (metrics?.netflowHistory) {
      setLiveNetflow(metrics.netflowHistory.map(h => ({
        ...h,
        inflow: Math.abs(h.inflow),
        outflow: -Math.abs(h.outflow),
        net: h.inflow - h.outflow
      })));
    }
    if (whaleTx) setLiveTx(whaleTx);
  }, [metrics, whaleTx]);

  // Simulation Effect
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Dynamic Pressure Logic
      setPressure(prev => {
        const volatility = Math.random() > 0.9 ? 15 : 2; 
        const change = (Math.random() - 0.5) * volatility;
        return Math.max(0, Math.min(100, prev + change));
      });
      
      // 2. Simulate Incoming Transactions
      if (Math.random() > 0.7) {
        const id = Math.random().toString(36).substring(7);
        const isBull = Math.random() > 0.45;
        const amount = Math.random() * 800 + 200;
        const price = currentPrice || 65000;
        const newTx: WhaleTransaction = {
          id, 
          amount, 
          amountUsd: amount * price, 
          from: isBull ? 'WALLET' : 'EXCHANGE', 
          to: isBull ? 'EXCHANGE' : 'WALLET',
          fromLabel: isBull ? 'Deep Cold Storage' : 'Binance Hot Wallet',
          toLabel: isBull ? 'CEX Liquidity' : 'Private Vault',
          timestamp: new Date().toLocaleTimeString([], {hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit'}), 
          hash: '0x' + Math.random().toString(16).substring(2, 10)
        };
        setLiveTx(prev => [newTx, ...prev].slice(0, 15));
      }
    }, 1200);
    return () => clearInterval(interval);
  }, [currentPrice]);

  // 3. Effect to calculate Real-Time Momentum and Bias
  useEffect(() => {
    if (liveTx.length === 0) return;
    const recentVolume = liveTx.slice(0, 10).reduce((acc, tx) => acc + tx.amountUsd, 0);
    const buySide = liveTx.slice(0, 10).filter(tx => tx.from === 'WALLET').reduce((acc, tx) => acc + tx.amountUsd, 0);
    const sellSide = liveTx.slice(0, 10).filter(tx => tx.from === 'EXCHANGE').reduce((acc, tx) => acc + tx.amountUsd, 0);
    setNetMomentum(recentVolume / 1000000); // In Millions
    const deltaRatio = (buySide - sellSide) / (recentVolume || 1);
    
    if (deltaRatio > 0.4) setBiasLabel('Aggressive Buy');
    else if (deltaRatio > 0.1) setBiasLabel('Accumulation');
    else if (deltaRatio < -0.4) setBiasLabel('Aggressive Sell');
    else if (deltaRatio < -0.1) setBiasLabel('Distribution');
    else setBiasLabel('Consolidation');
  }, [liveTx]);

  if (isLoading || !metrics) return (
    <div className="cyber-card rounded-[3rem] p-12 h-[600px] flex items-center justify-center border border-white/5 animate-pulse bg-slate-950">
       <div className="flex flex-col items-center gap-4">
          <Radar className="w-12 h-12 text-indigo-500 animate-spin" />
          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Scanning Liquidity Vectors...</span>
       </div>
    </div>
  );

  const cycleColor = metrics.marketCycle === 'ACCUMULATION' || metrics.marketCycle === 'MARK-UP' ? 'text-emerald-400' : 'text-rose-400';
  const cycleBg = metrics.marketCycle === 'ACCUMULATION' || metrics.marketCycle === 'MARK-UP' ? 'bg-emerald-500' : 'bg-rose-500';

  return (
    <div className="cyber-card rounded-[3rem] p-8 md:p-10 border border-white/5 relative overflow-hidden group shadow-2xl bg-[#020617]">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none"></div>
      <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000 rotate-12">
        <Ship className="w-[400px] h-[400px] text-indigo-400" />
      </div>

      {/* --- HEADER --- */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-10 gap-8 relative z-10 border-b border-white/5 pb-8">
        <div className="flex items-center gap-6">
          <div className="relative">
             <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full"></div>
             <div className="relative p-4 bg-slate-900 rounded-2xl border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.15)]">
                <Anchor className="w-8 h-8 text-indigo-400" />
             </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">{t.whaleBearMatrix}</h3>
            <div className="flex items-center gap-3 mt-2">
               <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-black text-indigo-300 uppercase tracking-widest">
                  Deep Dive v2.1
               </span>
               <div className="h-1 w-1 bg-slate-600 rounded-full"></div>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Radar size={10} className="text-emerald-500 animate-spin-slow" /> STB-INF_88
               </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6 self-end xl:self-auto">
           <div className="text-right hidden md:block">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Liquidity Pulse</span>
              <span className="text-2xl font-black font-mono text-white tracking-tight">Synchronized</span>
           </div>
           <div className="h-8 w-px bg-white/10 hidden md:block"></div>
           <LiveClock />
        </div>
      </div>

      {/* --- MAIN DASHBOARD GRID --- */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 relative z-10">
        
        {/* LEFT COLUMN: Gauges & Cycle */}
        <div className="xl:col-span-4 flex flex-col gap-6">
           
           {/* Market Cycle Card */}
           <div className="bg-slate-950/40 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group/cycle transition-all hover:border-indigo-500/20">
              <div className="absolute top-0 right-0 p-6 opacity-[0.05] group-hover/cycle:opacity-10 transition-opacity">
                 <Waves className="w-32 h-32 text-indigo-400" />
              </div>
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                 <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-white/5"><Database className="w-4 h-4 text-indigo-400" /></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.wyckoffPhase}</span>
                 </div>
                 <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                    <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Active</span>
                 </div>
              </div>

              <div className="relative z-10 text-center py-4">
                 <h2 className={`text-3xl font-black italic tracking-tighter uppercase leading-none mb-2 ${cycleColor} drop-shadow-[0_0_15px_currentColor]`}>
                    {t[metrics.marketCycle.toLowerCase().replace('-','')] || metrics.marketCycle}
                 </h2>
                 
                 {/* Custom Phase Bar */}
                 <div className="w-full h-3 bg-slate-900 rounded-full mt-6 border border-white/5 overflow-hidden relative">
                    {/* Background segments */}
                    <div className="absolute inset-0 flex">
                        <div className="flex-1 border-r border-slate-800"></div>
                        <div className="flex-1 border-r border-slate-800"></div>
                        <div className="flex-1 border-r border-slate-800"></div>
                        <div className="flex-1"></div>
                    </div>
                    {/* Active Bar */}
                    <div 
                        className={`h-full ${cycleBg} relative transition-all duration-1000 ease-out`} 
                        style={{ width: `${metrics.cycleProgress}%`, boxShadow: '0 0 15px currentColor' }}
                    >
                        <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]"></div>
                    </div>
                 </div>
                 <div className="flex justify-between mt-2 text-[8px] font-bold text-slate-600 uppercase tracking-widest px-1">
                    <span>Acc</span>
                    <span>Markup</span>
                    <span>Dist</span>
                    <span>Markdown</span>
                 </div>
              </div>
           </div>

           {/* Flow Pressure Gauge */}
           <div className="bg-slate-950/40 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[280px]">
              <div className="flex w-full justify-between items-start mb-2">
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Gauge size={12} /> Flow Pressure
                 </span>
              </div>
              <FlowGauge value={pressure} />
              
              <div className="flex justify-between w-full px-6 mt-4">
                 <div className="text-center">
                    <span className="text-[8px] font-bold text-rose-500 uppercase block">Bear</span>
                    <span className="text-[10px] font-mono text-slate-400">0</span>
                 </div>
                 <div className="text-center">
                    <span className="text-[8px] font-bold text-emerald-500 uppercase block">Bull</span>
                    <span className="text-[10px] font-mono text-slate-400">100</span>
                 </div>
              </div>
           </div>
        </div>

        {/* RIGHT COLUMN: Netflow & Feed */}
        <div className="xl:col-span-8 flex flex-col gap-6">
           
           {/* Netflow Chart */}
           <div className="bg-slate-950/40 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden min-h-[380px] flex flex-col group/net">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.03),transparent_70%)]"></div>
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 relative z-10 gap-6">
                 <div>
                    <h4 className="text-lg font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                       <BarChart3 className="w-5 h-5 text-indigo-400" /> {t.exchangeNetflow}
                    </h4>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1 block opacity-60">Forensic Institutional Delta (12H)</span>
                 </div>
                 
                 {/* Momentum Badge */}
                 <div className="flex flex-col items-end">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Momentum Bias</span>
                    <div className={`px-4 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest backdrop-blur-md ${biasLabel.includes('Buy') ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : biasLabel.includes('Sell') ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-slate-800 border-white/10 text-slate-300'}`}>
                       {biasLabel}
                    </div>
                 </div>
              </div>

              <div className="flex-1 w-full relative z-10 min-h-[220px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={liveNetflow} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                       <defs>
                          <linearGradient id="inflowGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/><stop offset="100%" stopColor="#10b981" stopOpacity={0.2}/></linearGradient>
                          <linearGradient id="outflowGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f43f5e" stopOpacity={0.8}/><stop offset="100%" stopColor="#f43f5e" stopOpacity={0.2}/></linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.3} />
                       <XAxis dataKey="time" tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}} axisLine={false} tickLine={false} dy={10} />
                       <YAxis hide domain={['auto', 'auto']} />
                       <Tooltip 
                          contentStyle={{ backgroundColor: '#020617', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '12px' }}
                          itemStyle={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', fontFamily: 'monospace' }}
                          labelStyle={{ display: 'none' }}
                          cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                       />
                       <ReferenceLine y={0} stroke="#334155" strokeWidth={1} />
                       <Bar dataKey="inflow" fill="url(#inflowGrad)" radius={[4, 4, 0, 0]} barSize={12} />
                       <Bar dataKey="outflow" fill="url(#outflowGrad)" radius={[0, 0, 4, 4]} barSize={12} />
                       <Line 
                          type="monotone" 
                          dataKey="net" 
                          stroke="#818cf8" 
                          strokeWidth={3} 
                          dot={{ r: 4, fill: '#020617', stroke: '#818cf8', strokeWidth: 2 }} 
                          activeDot={{ r: 6, fill: '#fff' }}
                          filter="drop-shadow(0 0 8px #818cf8)" 
                          isAnimationActive={false} 
                       />
                    </ComposedChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* Bottom Row: Stream & Hotspots */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Whale Stream */}
              <div className="bg-slate-950/40 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden flex flex-col group/tape h-[300px]">
                 <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                    <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2.5">
                       <Radio className="w-4 h-4 text-emerald-500 animate-pulse" /> Live Tape
                    </h4>
                    <span className="text-[8px] font-mono text-slate-600 uppercase bg-white/5 px-2 py-1 rounded">8ms Latency</span>
                 </div>
                 
                 <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-2">
                    {liveTx.map((tx) => {
                       const isWhale = tx.amountUsd > 1000000;
                       const isBuy = tx.from === 'WALLET' || tx.fromLabel?.includes('Storage');
                       return (
                          <div key={tx.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-500 animate-[slideIn_0.3s_ease-out] relative overflow-hidden ${isWhale ? 'bg-indigo-500/5 border-indigo-500/20 shadow-[inset_0_0_10px_rgba(99,102,241,0.05)]' : 'bg-slate-900/40 border-white/5 hover:bg-white/5'}`}>
                             <div className="flex items-center gap-3">
                                <div className={`p-1.5 rounded-lg ${isBuy ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                   {isBuy ? <ArrowUpRight size={12} /> : <ArrowDownLeft size={12} />}
                                </div>
                                <div className="flex flex-col">
                                   <span className="text-[10px] font-black text-white font-mono tracking-tight">${(tx.amountUsd / 1000).toFixed(1)}K</span>
                                   <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">{tx.fromLabel.split(' ')[0]} &rarr; {tx.toLabel.split(' ')[0]}</span>
                                </div>
                             </div>
                             <span className="text-[8px] font-mono text-slate-600">{tx.timestamp}</span>
                          </div>
                       )
                    })}
                 </div>
              </div>

              {/* Hunt Hotspots */}
              <div className="bg-slate-950/40 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden flex flex-col group/spots h-[300px]">
                 <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                    <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2.5">
                       <Target className="w-4 h-4 text-rose-400" /> Liquidity Hunt
                    </h4>
                    <Crosshair className="w-3.5 h-3.5 text-slate-600" />
                 </div>
                 
                 <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1">
                    {metrics.stopHuntZones.map((zone, i) => (
                       <div key={i} className="bg-black/30 p-4 rounded-2xl border border-white/5 flex items-center justify-between hover:border-indigo-500/30 transition-all cursor-crosshair group/zone relative overflow-hidden">
                          <div className={`absolute left-0 top-0 bottom-0 w-1 ${zone.type === 'SHORT_HUNT' ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                          <div className="flex items-center gap-3 pl-2">
                             <div className="p-1.5 bg-white/5 rounded-lg">
                                <Disc size={12} className={zone.type === 'SHORT_HUNT' ? 'text-rose-400' : 'text-emerald-400'} />
                             </div>
                             <div>
                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-0.5">{zone.type === 'SHORT_HUNT' ? 'Short Liq' : 'Long Liq'}</span>
                                <span className="text-sm font-black font-mono text-white tracking-tighter">${zone.price.toLocaleString()}</span>
                             </div>
                          </div>
                          <div className="text-right">
                             <div className="text-[10px] font-black text-indigo-400 drop-shadow-[0_0_5px_rgba(99,102,241,0.5)] group-hover/zone:scale-110 transition-transform">{zone.volume} <span className="text-[7px] text-slate-600">LOTS</span></div>
                             <span className="text-[7px] font-bold text-slate-600 uppercase tracking-widest">Unfilled</span>
                          </div>
                       </div>
                    ))}
                 </div>
                 
                 <div className="mt-auto pt-3 border-t border-white/5">
                    <p className="text-[7px] text-slate-500 italic font-bold leading-relaxed uppercase text-center opacity-60">
                       *Zones derived from high-density limit clusters.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default WhaleBearForensics;
