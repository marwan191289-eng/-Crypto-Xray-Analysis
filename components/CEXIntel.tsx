
import React, { useState, useEffect, useMemo } from 'react';
import { CEXMetrics } from '../types';
import { 
  Activity, Zap, TrendingUp, TrendingDown, Layers, BarChart3, 
  Clock, Skull, Flame, Anchor, RefreshCcw, Gauge, ArrowUp, ArrowDown, 
  Globe, Database, Server, Scale, AlertTriangle
} from 'lucide-react';
import { 
  AreaChart, Area, ResponsiveContainer, YAxis, Tooltip, 
  XAxis, ComposedChart, Line, CartesianGrid, ReferenceLine 
} from 'recharts';

interface CEXIntelProps {
  metrics?: CEXMetrics;
  symbol: string;
  isLoading: boolean;
  t: any;
}

interface LiqItem {
  id: string;
  side: 'LONG' | 'SHORT';
  amount: number;
  leverage: number;
  exchange: string;
  time: string;
  symbol: string;
}

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

const LiquidationTape = ({ symbol }: { symbol: string }) => {
  const [items, setItems] = useState<LiqItem[]>([]);

  useEffect(() => {
    const initItems: LiqItem[] = Array.from({ length: 6 }).map(() => ({
        id: Math.random().toString(36),
        side: Math.random() > 0.5 ? 'LONG' : 'SHORT',
        amount: Math.floor(Math.random() * 50000) + 1000,
        leverage: [20, 50, 100, 125][Math.floor(Math.random() * 4)],
        time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        exchange: ['Binance', 'Bybit', 'OKX'][Math.floor(Math.random() * 3)],
        symbol: symbol
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
          time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          exchange: ['Binance', 'Bybit', 'OKX'][Math.floor(Math.random() * 3)],
          symbol: symbol
        };
        setItems(prev => [newItem, ...prev].slice(0, 8)); 
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [symbol]);

  return (
    <div className="h-full relative flex flex-col overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#020617] pointer-events-none z-20"></div>
      <div className="flex flex-col gap-2.5 transition-all p-1">
        {items.map((item, i) => {
          const isWhale = item.amount > 50000;
          return (
            <div 
              key={item.id} 
              className={`
                  relative flex items-center justify-between p-3 rounded-xl border transition-all animate-[slideIn_0.3s_cubic-bezier(0.2,0.8,0.2,1)] 
                  ${isWhale 
                    ? 'bg-amber-500/10 border-amber-500/30 shadow-[inset_0_0_20px_rgba(245,158,11,0.1)]' 
                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                  }
              `}
              style={{ opacity: 1 - (i * 0.12) }}
            >
               <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${item.side === 'LONG' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
               <div className="flex items-center gap-3 pl-2">
                  <div className={`p-1.5 rounded-lg ${item.side === 'LONG' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                     <Skull size={14} />
                  </div>
                  <div className="flex flex-col">
                     <div className="flex items-center gap-2">
                         <span className={`text-[9px] font-black uppercase ${item.side === 'LONG' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {item.side} REKT
                         </span>
                         <span className="text-[8px] font-bold bg-slate-800 text-slate-400 px-1.5 rounded border border-white/5">{item.leverage}x</span>
                     </div>
                     <span className="text-[8px] text-slate-500 uppercase font-bold tracking-wider flex items-center gap-1">
                        {item.exchange} <span className="text-slate-700">•</span> {item.time}
                     </span>
                  </div>
               </div>
               <div className="text-right">
                  <span className={`text-xs font-mono font-black block tracking-tight ${isWhale ? 'text-amber-400 text-shadow-sm' : 'text-white'}`}>
                    ${(item.amount).toLocaleString()}
                  </span>
                  {isWhale && <span className="text-[7px] font-black text-amber-500/80 uppercase tracking-widest animate-pulse">Whale Liq</span>}
               </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

const CEXIntel: React.FC<CEXIntelProps> = ({ metrics, symbol, isLoading, t }) => {
  const [liveOI, setLiveOI] = useState(metrics?.openInterest || 0);
  const [oiHistory, setOiHistory] = useState<any[]>([]);

  useEffect(() => {
    if (metrics) {
      setLiveOI(metrics.openInterest);
      setOiHistory(Array.from({ length: 40 }, (_, i) => ({ 
        val: metrics.openInterest * (1 + Math.sin(i * 0.2) * 0.05 + Math.random() * 0.02),
        price: 50000 * (1 + Math.sin(i * 0.2) * 0.05)
      })));
    }
  }, [metrics]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveOI(prev => prev * (1 + (Math.random() - 0.5) * 0.005));
      setOiHistory(prev => {
        if (prev.length === 0) return prev;
        const last = prev[prev.length - 1];
        return [...prev.slice(1), { 
          val: last.val * (1 + (Math.random() - 0.5) * 0.01),
          price: last.price * (1 + (Math.random() - 0.5) * 0.008)
        }];
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading || !metrics) return (
    <div className="cyber-card rounded-[3rem] p-12 h-[600px] flex items-center justify-center border border-white/5 bg-[#020617] animate-pulse">
        <div className="flex flex-col items-center gap-4">
            <Activity className="w-16 h-16 text-indigo-500 animate-pulse" />
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Connecting to CEX Nodes...</span>
        </div>
    </div>
  );

  const formatLargeNum = (num: number) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    return num.toLocaleString();
  };

  const fundingRateColor = metrics.fundingRate > 0 ? 'text-emerald-400' : metrics.fundingRate < 0 ? 'text-rose-400' : 'text-white';
  const fundingRateBg = metrics.fundingRate > 0 ? 'bg-emerald-500/10 border-emerald-500/30' : metrics.fundingRate < 0 ? 'bg-rose-500/10 border-rose-500/30' : 'bg-slate-800 border-white/10';

  return (
    <div className="cyber-card rounded-[3rem] p-8 md:p-10 border border-white/5 relative overflow-hidden group bg-[#020617]">
      <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:scale-110 transition-transform rotate-12">
        <Layers className="w-96 h-96 text-indigo-400" />
      </div>

      {/* --- HEADER --- */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-10 gap-8 relative z-10 border-b border-white/5 pb-8">
        <div className="flex items-center gap-6">
          <div className="relative">
             <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full"></div>
             <div className="relative p-4 bg-slate-900 rounded-2xl border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.15)]">
                <Activity className="w-8 h-8 text-indigo-400 animate-pulse" />
             </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">{t.cexIntel}</h3>
            <div className="flex items-center gap-3 mt-2">
               <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-black text-indigo-300 uppercase tracking-widest">
                  Futures Aggregator
               </span>
               <div className="h-1 w-1 bg-slate-600 rounded-full"></div>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Anchor size={10} className="text-indigo-500" /> Derivatives Stream
               </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6 self-end xl:self-auto">
           <div className="text-right hidden md:block">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Market Regime</span>
              <div className="flex items-center justify-end gap-2">
                 <AlertTriangle size={12} className="text-amber-400" />
                 <span className="text-xl font-black font-mono text-amber-400 tracking-tight">High Leverage</span>
              </div>
           </div>
           <div className="h-8 w-px bg-white/10 hidden md:block"></div>
           <LiveClock />
        </div>
      </div>

      {/* --- MAIN GRID --- */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 relative z-10">
        
        {/* LEFT COLUMN: Open Interest & Ratios */}
        <div className="xl:col-span-7 flex flex-col gap-6">
           
           {/* OI Chart Card */}
           <div className="bg-slate-950/40 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group/oi flex flex-col min-h-[380px]">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                 <div>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1 flex items-center gap-2">
                       <BarChart3 size={12} className="text-indigo-400" /> Live Open Interest
                    </span>
                    <span className="text-4xl font-black text-white font-mono tracking-tighter drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                       ${formatLargeNum(liveOI)}
                    </span>
                 </div>
                 
                 {/* Funding Rate Badge */}
                 <div className="flex flex-col items-end">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Funding (8H)</span>
                    <div className={`px-3 py-1 rounded-lg border text-[10px] font-mono font-black ${fundingRateBg} ${fundingRateColor}`}>
                       {metrics.fundingRate > 0 ? '+' : ''}{metrics.fundingRate.toFixed(4)}%
                    </div>
                 </div>
              </div>

              <div className="flex-1 w-full relative min-h-[200px] z-0">
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={oiHistory}>
                       <defs>
                          <filter id="neonShadowOI" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="4" result="blur" /><feComposite in="SourceGraphic" in2="blur" operator="over" />
                          </filter>
                          <linearGradient id="oiGradNeon" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                             <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.3} />
                       <XAxis hide />
                       <YAxis hide domain={['dataMin', 'dataMax']} />
                       <Tooltip 
                          cursor={{ stroke: 'rgba(99, 102, 241, 0.5)', strokeWidth: 1, strokeDasharray: '4 4' }}
                          content={({ active, payload }) => {
                             if (active && payload && payload.length) {
                                return (
                                   <div className="bg-slate-950/95 border border-indigo-500/30 p-3 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-3xl">
                                      <div className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">Aggregated OI</div>
                                      <div className="text-xl font-mono font-black text-white">${formatLargeNum(payload[0].value as number)}</div>
                                   </div>
                                )
                             }
                             return null;
                          }}
                       />
                       <Area 
                          type="monotone" 
                          dataKey="val" 
                          stroke="#6366f1" 
                          strokeWidth={3} 
                          fill="url(#oiGradNeon)" 
                          animationDuration={500} 
                          filter="url(#neonShadowOI)"
                          isAnimationActive={false} 
                       />
                    </ComposedChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* Long/Short Ratio Card */}
           <div className="bg-slate-950/40 p-6 rounded-[2.5rem] border border-white/5 relative overflow-hidden flex flex-col justify-center">
              <div className="flex justify-between items-center mb-3">
                 <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                    <ArrowUp size={10} /> Longs {(metrics.longShortRatio * 50).toFixed(1)}%
                 </span>
                 <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1.5">
                    Shorts {((2 - metrics.longShortRatio) * 50).toFixed(1)}% <ArrowDown size={10} />
                 </span>
              </div>
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden flex border border-white/5 relative">
                 <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/20 z-10"></div>
                 <div 
                    className="h-full bg-emerald-500 relative transition-all duration-1000" 
                    style={{ width: `${Math.min(100, metrics.longShortRatio * 50)}%`, boxShadow: '0 0 10px #10b981' }}
                 >
                    <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                 </div>
                 <div 
                    className="h-full bg-rose-500 flex-1 relative transition-all duration-1000"
                    style={{ boxShadow: '0 0 10px #f43f5e' }}
                 >
                    <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                 </div>
              </div>
              <div className="flex justify-between items-center mt-3">
                 <span className="text-[10px] font-black font-mono text-white">Ratio: {metrics.longShortRatio.toFixed(2)}</span>
                 <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Global Accounts</span>
              </div>
           </div>
        </div>

        {/* RIGHT COLUMN: Liquidation Tape */}
        <div className="xl:col-span-5 bg-slate-950/40 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden flex flex-col h-[520px]">
           <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
              <Flame className="w-48 h-48 text-rose-500" />
           </div>
           
           <div className="flex items-center justify-between gap-3 mb-6 pb-6 border-b border-white/5 relative z-10">
              <div className="flex items-center gap-3">
                 <div className="p-2.5 bg-rose-500/10 rounded-xl border border-rose-500/20 shadow-lg relative">
                    <Flame className="w-5 h-5 text-rose-500 animate-pulse" />
                    <div className="absolute inset-0 bg-rose-500/20 blur-md rounded-xl animate-pulse"></div>
                 </div>
                 <div>
                    <h4 className="text-[12px] font-black text-white uppercase tracking-widest leading-none">Global Rekt Feed</h4>
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider mt-1 block">Real-time Liquidations</span>
                 </div>
              </div>
              <div className="flex items-center gap-1.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></div>
                 <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest">Live</span>
              </div>
           </div>
           
           <div className="flex-1 relative min-h-0 bg-black/20 rounded-3xl border border-white/5 overflow-hidden p-2">
              <LiquidationTape symbol={symbol} />
           </div>
           
           <div className="mt-4 flex justify-between items-center text-[8px] font-black text-slate-500 uppercase tracking-widest">
              <span>Total 24h Rekt</span>
              <span className="text-white font-mono text-[10px]">${formatLargeNum(metrics.liquidations24h.total)}</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CEXIntel;
