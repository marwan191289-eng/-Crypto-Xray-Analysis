
import React, { useState, useEffect, useMemo } from 'react';
import { CEXMetrics } from '../types';
import { 
  Activity, Zap, TrendingUp, TrendingDown, Layers, BarChart3, 
  Clock, Skull, Flame, Anchor, RefreshCcw, Gauge, ArrowUp, ArrowDown, 
  Globe, Database, Server
} from 'lucide-react';
import { 
  AreaChart, Area, ResponsiveContainer, YAxis, Tooltip, 
  XAxis, ComposedChart, Line, CartesianGrid 
} from 'recharts';

interface CEXIntelProps {
  metrics?: CEXMetrics;
  symbol: string;
  isLoading: boolean;
  t: any;
}

// --- Live Liquidation Tape Component ---
interface LiqItem {
  id: string;
  side: 'LONG' | 'SHORT';
  amount: number;
  leverage: number;
  exchange: string;
  time: string;
}

const LiquidationTape = ({ symbol }: { symbol: string }) => {
  const [items, setItems] = useState<LiqItem[]>([]);

  useEffect(() => {
    // Initial Population
    const initItems: LiqItem[] = Array.from({ length: 6 }).map(() => ({
        id: Math.random().toString(36),
        side: Math.random() > 0.5 ? 'LONG' : 'SHORT',
        amount: Math.floor(Math.random() * 50000) + 1000,
        leverage: [20, 50, 100, 125][Math.floor(Math.random() * 4)],
        time: new Date().toLocaleTimeString(),
        exchange: ['Binance', 'Bybit', 'OKX'][Math.floor(Math.random() * 3)]
    }));
    setItems(initItems);

    const interval = setInterval(() => {
      if (Math.random() > 0.4) { 
        const side = Math.random() > 0.5 ? 'LONG' : 'SHORT';
        const isWhale = Math.random() > 0.85;
        const amount = isWhale 
          ? Math.floor(Math.random() * 200000) + 50000 
          : Math.floor(Math.random() * 10000) + 500;
        
        const newItem: LiqItem = {
          id: Math.random().toString(36),
          side,
          amount,
          leverage: [20, 50, 100, 125][Math.floor(Math.random() * 4)],
          time: new Date().toLocaleTimeString(),
          exchange: ['Binance', 'Bybit', 'OKX'][Math.floor(Math.random() * 3)]
        };
        setItems(prev => [newItem, ...prev].slice(0, 8)); 
      }
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full relative flex flex-col overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/90 pointer-events-none z-20"></div>
      <div className="flex flex-col gap-2.5 transition-all p-1">
        {items.map((item, i) => {
          const isWhale = item.amount > 50000;
          return (
            <div 
              key={item.id} 
              className={`
                  relative flex items-center justify-between p-3 rounded-xl border transition-all animate-[slideIn_0.4s_cubic-bezier(0.2,0.8,0.2,1)] 
                  ${isWhale 
                    ? 'bg-amber-500/10 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]' 
                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                  }
              `}
              style={{ opacity: 1 - (i * 0.12) }}
            >
               {/* Side Bar Indicator */}
               <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${item.side === 'LONG' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>

               <div className="flex items-center gap-3 pl-2">
                  <div className={`p-1.5 rounded-lg ${item.side === 'LONG' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                     <Skull size={14} />
                  </div>
                  <div className="flex flex-col">
                     <div className="flex items-center gap-2">
                         <span className={`text-[10px] font-black uppercase ${item.side === 'LONG' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {item.side} REKT
                         </span>
                         <span className="text-[9px] font-bold bg-slate-800 text-slate-400 px-1.5 rounded border border-white/5">{item.leverage}x</span>
                     </div>
                     <span className="text-[8px] text-slate-500 uppercase font-bold tracking-wider flex items-center gap-1">
                        {item.exchange} <span className="text-slate-700">•</span> {item.time}
                     </span>
                  </div>
               </div>
               
               <div className="text-right">
                  <span className={`text-xs font-mono font-black block ${isWhale ? 'text-amber-400 text-shadow-sm' : 'text-white'}`}>
                    ${(item.amount).toLocaleString()}
                  </span>
                  {isWhale && <span className="text-[8px] font-black text-amber-500/80 uppercase tracking-widest animate-pulse">Whale Liquidation</span>}
               </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

// --- Funding Timer Component ---
const FundingTimer = () => {
  const [timeLeft, setTimeLeft] = useState('');
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const nextFunding = new Date(now);
      const currentHour = now.getHours();
      
      let targetHour = 0;
      if (currentHour < 8) targetHour = 8;
      else if (currentHour < 16) targetHour = 16;
      else targetHour = 24;

      const startHour = targetHour - 8;
      nextFunding.setHours(targetHour, 0, 0, 0);
      if (targetHour === 24) nextFunding.setDate(nextFunding.getDate() + 1);

      const diff = nextFunding.getTime() - now.getTime();
      const totalDuration = 8 * 60 * 60 * 1000;
      const elapsed = totalDuration - diff;
      
      setProgress((elapsed / totalDuration) * 100);

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(`${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-3">
        <div className="relative w-4 h-4">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path className="text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                <path className="text-amber-400 transition-all duration-1000" strokeDasharray={`${progress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
            </svg>
        </div>
        <span className="font-mono text-amber-400 tracking-widest text-xs font-black">{timeLeft}</span>
    </div>
  );
};

// --- Tug-of-War Bar for Long/Short ---
const SentimentTugOfWar = ({ ratio }: { ratio: number }) => {
    // Ratio > 1 means Longs dominate. < 1 means Shorts dominate.
    // Calculate percentage for Longs. 
    // Example: Ratio 1.5 -> Longs = 1.5/2.5 = 60%
    const longPct = Math.min(Math.max((ratio / (ratio + 1)) * 100, 5), 95);
    const shortPct = 100 - longPct;
    
    return (
        <div className="w-full">
            <div className="flex justify-between items-end mb-2">
                <div className="flex flex-col items-start">
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-0.5">Longs</span>
                    <span className="text-lg font-mono font-black text-white">{longPct.toFixed(1)}%</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-0.5">Shorts</span>
                    <span className="text-lg font-mono font-black text-white">{shortPct.toFixed(1)}%</span>
                </div>
            </div>
            
            <div className="relative h-4 w-full bg-slate-800 rounded-full overflow-hidden flex border border-white/5">
                {/* Long Bar */}
                <div className="h-full bg-emerald-500 transition-all duration-1000 relative" style={{ width: `${longPct}%` }}>
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                </div>
                
                {/* Center Marker / Battle Line */}
                <div className="w-1 h-full bg-white z-10 shadow-[0_0_10px_white]"></div>
                
                {/* Short Bar */}
                <div className="h-full bg-rose-500 transition-all duration-1000 flex-1 relative">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                </div>
            </div>
            
            <div className="flex justify-between mt-2 text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                <span>{longPct > 50 ? 'Dominant Flow' : 'Weak Hand'}</span>
                <span>{shortPct > 50 ? 'Dominant Flow' : 'Weak Hand'}</span>
            </div>
        </div>
    );
};

const CEXIntel: React.FC<CEXIntelProps> = ({ metrics, symbol, isLoading, t }) => {
  // Live Simulation State
  const [liveOI, setLiveOI] = useState(metrics?.openInterest || 0);
  const [oiHistory, setOiHistory] = useState<any[]>([]);
  const [fundingHistory, setFundingHistory] = useState<any[]>([]);
  const [lsRatio, setLsRatio] = useState(metrics?.longShortRatio || 1);

  // Init Data
  useEffect(() => {
    if (metrics) {
      setLiveOI(metrics.openInterest);
      setLsRatio(metrics.longShortRatio);
      
      // Generate Fake History for visualization
      setOiHistory(Array.from({ length: 40 }, (_, i) => ({ 
        val: metrics.openInterest * (1 + Math.sin(i * 0.2) * 0.05 + Math.random() * 0.02),
        price: 50000 * (1 + Math.sin(i * 0.2) * 0.05), // Fake price correlation
        vol: Math.random() * 100
      })));
      setFundingHistory(Array.from({ length: 16 }, (_, i) => ({
        rate: (Math.random() * 0.02) - 0.005
      })));
    }
  }, [metrics]);

  // Live Jitter Engine
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveOI(prev => prev * (1 + (Math.random() - 0.5) * 0.005));
      
      setOiHistory(prev => {
        if (prev.length === 0) return prev;
        const last = prev[prev.length - 1];
        const nextOI = last.val * (1 + (Math.random() - 0.5) * 0.01);
        const nextPrice = last.price * (1 + (Math.random() - 0.5) * 0.008);
        return [...prev.slice(1), { val: nextOI, price: nextPrice, vol: Math.random() * 100 }];
      });

      setLsRatio(prev => Math.max(0.1, prev + (Math.random() - 0.5) * 0.05));

    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading || !metrics) {
    return (
      <div className="bg-slate-950/40 rounded-[3.5rem] p-12 animate-pulse space-y-8 border border-white/5 min-h-[500px]">
        <div className="h-10 w-1/3 bg-slate-800/40 rounded-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-800/20 rounded-3xl" />
          <div className="h-64 bg-slate-800/20 rounded-3xl" />
        </div>
      </div>
    );
  }

  const formatLargeNum = (num: number) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
    return num.toFixed(2);
  };

  const isFundingPositive = metrics.fundingRate >= 0;

  return (
    <div className="cyber-card rounded-[4rem] p-12 border border-white/5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform">
        <Layers className="w-48 h-48 text-accent" />
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12 relative z-10">
        <div className="flex items-center gap-7">
          <div className="p-5 bg-accent/10 rounded-3xl border border-accent/20 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
            <Activity className="w-8 h-8 text-accent animate-pulse" />
          </div>
          <div className="text-start">
            <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">{t.cexIntel}</h3>
            <p className="text-[11px] font-black text-muted uppercase tracking-[0.5em] mt-3 opacity-60 flex items-center gap-2">
               <Anchor className="w-3 h-3 text-indigo-400" /> Binance Futures • Bybit • OKX
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
           <div className="flex flex-col items-end">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Funding Reset</span>
              <FundingTimer />
           </div>
           <div className="h-10 w-px bg-white/10"></div>
           <div className="flex flex-col items-end">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">24h Volatility</span>
              <span className="font-mono text-emerald-400 tracking-widest text-sm font-black">{metrics.volatility.toFixed(2)}%</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 relative z-10">
        
        {/* LEFT COLUMN: Open Interest & Sentiment (7 Columns) */}
        <div className="xl:col-span-7 flex flex-col gap-8">
           
           {/* Open Interest Chart - Enhanced */}
           <div className="bg-slate-950/40 p-8 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden group/oi flex flex-col min-h-[350px]">
              <div className="flex justify-between items-start mb-6">
                 <div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">{t.openInterest}</span>
                    <div className="flex items-baseline gap-3">
                       <span className="text-4xl font-black text-white font-mono tracking-tighter">${formatLargeNum(liveOI)}</span>
                       <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase ${metrics.openInterestChange >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                          {metrics.openInterestChange >= 0 ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
                          {Math.abs(metrics.openInterestChange).toFixed(2)}%
                       </div>
                    </div>
                 </div>
                 
                 {/* Exchange Dominance Mini-Bar */}
                 <div className="flex flex-col items-end gap-2">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Vol Dominance</span>
                    <div className="flex w-32 h-1.5 rounded-full overflow-hidden bg-slate-800">
                        <div className="h-full bg-[#FCD535]" style={{ width: '45%' }} title="Binance"></div>
                        <div className="h-full bg-[#171924]" style={{ width: '30%' }} title="Bybit"></div>
                        <div className="h-full bg-white" style={{ width: '25%' }} title="OKX"></div>
                    </div>
                    <div className="flex gap-2 text-[8px] font-bold text-slate-600">
                        <span className="text-[#FCD535]">Binance</span>
                        <span className="text-slate-400">Bybit</span>
                    </div>
                 </div>
              </div>
              
              <div className="flex-1 w-full relative min-h-[250px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={oiHistory}>
                       <defs>
                          <linearGradient id="oiGrad" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                             <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="time" hide />
                       <YAxis yAxisId="oi" hide domain={['dataMin', 'dataMax']} />
                       <YAxis yAxisId="price" hide domain={['dataMin', 'dataMax']} />
                       <Tooltip 
                          content={({ active, payload }) => {
                             if (active && payload && payload.length) {
                                return (
                                   <div className="bg-slate-900 border border-white/10 p-3 rounded-xl shadow-xl backdrop-blur-md">
                                      <div className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">Open Interest</div>
                                      <div className="text-lg font-mono font-black text-white mb-2">${formatLargeNum(payload[0].value as number)}</div>
                                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Price Correlation</div>
                                      <div className="text-sm font-mono font-bold text-slate-300">${(payload[1].value as number).toLocaleString()}</div>
                                   </div>
                                )
                             }
                             return null;
                          }}
                       />
                       <Area 
                          yAxisId="oi"
                          type="monotone" 
                          dataKey="val" 
                          stroke="#6366f1" 
                          strokeWidth={3} 
                          fill="url(#oiGrad)" 
                          animationDuration={500}
                       />
                       <Line 
                          yAxisId="price"
                          type="monotone"
                          dataKey="price"
                          stroke="#94a3b8"
                          strokeWidth={1}
                          strokeDasharray="3 3"
                          dot={false}
                          opacity={0.5}
                       />
                    </ComposedChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* Metrics Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Funding Rate Visualizer */}
              <div className="bg-slate-950/40 p-8 rounded-[3rem] border border-white/5 relative overflow-hidden flex flex-col justify-between group/fund">
                 <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.fundingRate}</span>
                    <RefreshCcw className="w-4 h-4 text-slate-600 group-hover/fund:rotate-180 transition-transform duration-700" />
                 </div>
                 
                 <div className="flex items-center gap-3 mb-6">
                    <span className={`text-4xl font-black font-mono tracking-tighter ${isFundingPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {metrics.fundingRate.toFixed(4)}%
                    </span>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded ${isFundingPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {isFundingPositive ? 'Longs Pay' : 'Shorts Pay'}
                    </span>
                 </div>

                 {/* History Bars */}
                 <div className="flex gap-1 h-10 items-end">
                    {fundingHistory.map((h, i) => (
                       <div 
                          key={i} 
                          className={`flex-1 rounded-sm transition-all duration-500 ${h.rate > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                          style={{ 
                             height: `${Math.min(100, Math.abs(h.rate) * 5000)}%`, 
                             opacity: 0.2 + (i / 16) * 0.8 
                          }}
                       />
                    ))}
                 </div>
                 <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-2 text-center">Historical Heatmap (8H)</span>
              </div>

              {/* Long/Short Sentiment HUD */}
              <div className="bg-slate-950/40 p-8 rounded-[3rem] border border-white/5 relative overflow-hidden flex flex-col justify-center">
                 <div className="flex justify-between items-center mb-6">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.longShortRatio}</span>
                    <div className="px-3 py-1 bg-white/5 rounded-lg text-xs font-black font-mono text-white border border-white/10">
                        {lsRatio.toFixed(2)}
                    </div>
                 </div>
                 
                 <div className="mt-2">
                    <SentimentTugOfWar ratio={lsRatio} />
                 </div>
              </div>

           </div>
        </div>

        {/* RIGHT COLUMN: Liquidation Engine (5 Columns) */}
        <div className="xl:col-span-5 bg-slate-950/40 p-8 rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden flex flex-col h-full">
           <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                 <div className="p-2.5 bg-rose-500/10 rounded-xl border border-rose-500/20 shadow-lg">
                    <Flame className="w-5 h-5 text-rose-500" />
                 </div>
                 <div>
                    <h4 className="text-[12px] font-black text-white uppercase tracking-widest">{t.liquidationMatrix}</h4>
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Global Rekt Feed</span>
                 </div>
              </div>
              <div className="text-right">
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Total 24h</span>
                 <span className="text-xs font-mono font-black text-rose-400 animate-pulse">${formatLargeNum(metrics.liquidations24h.total)}</span>
              </div>
           </div>

           {/* Stats Row */}
           <div className="flex gap-4 mb-6">
              <div className="flex-1 bg-slate-900/50 p-4 rounded-2xl border border-emerald-500/10 text-center relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-2 opacity-10"><ArrowUp size={24} /></div>
                 <span className="text-[9px] font-black text-emerald-500 uppercase block mb-1">Longs Liquidated</span>
                 <span className="text-sm font-mono font-black text-white">${formatLargeNum(metrics.liquidations24h.longs)}</span>
              </div>
              <div className="flex-1 bg-slate-900/50 p-4 rounded-2xl border border-rose-500/10 text-center relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-2 opacity-10"><ArrowDown size={24} /></div>
                 <span className="text-[9px] font-black text-rose-500 uppercase block mb-1">Shorts Liquidated</span>
                 <span className="text-sm font-mono font-black text-white">${formatLargeNum(metrics.liquidations24h.shorts)}</span>
              </div>
           </div>

           {/* The Feed */}
           <div className="flex-1 relative min-h-[300px] bg-slate-900/30 rounded-3xl p-1 border border-white/5 overflow-hidden">
              <div className="absolute top-2 left-0 right-0 z-10 flex justify-center pointer-events-none">
                 <div className="px-3 py-1 bg-slate-950/80 rounded-full border border-white/10 text-[8px] font-black text-slate-400 uppercase tracking-widest backdrop-blur-md">
                    Live Feed • 1.5s Refresh
                 </div>
              </div>
              <LiquidationTape symbol={symbol} />
           </div>
        </div>

      </div>
    </div>
  );
};

export default CEXIntel;
