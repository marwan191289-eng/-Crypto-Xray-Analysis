
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
                  {isWhale && <span className="text-[8px] font-black text-amber-500/80 uppercase tracking-widest animate-pulse">Whale Liq</span>}
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

  if (isLoading || !metrics) return <div className="min-h-[400px] animate-pulse bg-slate-900 rounded-[3.5rem]"></div>;

  const formatLargeNum = (num: number) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    return num.toLocaleString();
  };

  return (
    <div className="cyber-card rounded-[4rem] p-12 border border-white/5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform"><Layers className="w-48 h-48 text-accent" /></div>
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12 relative z-10">
        <div className="flex items-center gap-7">
          <div className="p-5 bg-accent/10 rounded-3xl border border-accent/20 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
            <Activity className="w-8 h-8 text-accent animate-pulse" />
          </div>
          <div className="text-start">
            <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">{t.cexIntel}</h3>
            <p className="text-[11px] font-black text-muted uppercase tracking-[0.5em] mt-3 opacity-60 flex items-center gap-2"><Anchor className="w-3 h-3 text-indigo-400" /> Global Futures Data Stream</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 relative z-10">
        <div className="xl:col-span-7 flex flex-col gap-8">
           <div className="bg-slate-950/40 p-8 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden group/oi flex flex-col min-h-[380px]">
              <div className="flex justify-between items-start mb-6 relative z-10">
                 <div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Live Open Interest</span>
                    <span className="text-4xl font-black text-white font-mono tracking-tighter drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">${formatLargeNum(liveOI)}</span>
                 </div>
              </div>
              <div className="flex-1 w-full relative min-h-[250px] z-0">
                 <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={oiHistory}>
                       <defs>
                          <filter id="neonShadowOI" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="4" result="blur" /><feComposite in="SourceGraphic" in2="blur" operator="over" />
                          </filter>
                          <linearGradient id="oiGradNeon" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3B82F6" stopOpacity={0.6}/><stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/></linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis hide /><YAxis hide domain={['dataMin', 'dataMax']} />
                       <Tooltip 
                          cursor={{ stroke: 'rgba(59, 130, 246, 0.5)', strokeWidth: 1 }}
                          content={({ active, payload }) => {
                             if (active && payload && payload.length) {
                                return (
                                   <div className="bg-slate-900/95 border border-blue-500/30 p-4 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.8)] backdrop-blur-3xl animate-in zoom-in-95 duration-300">
                                      <div className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">Aggregated OI</div>
                                      <div className="text-2xl font-mono font-black text-white">${formatLargeNum(payload[0].value as number)}</div>
                                   </div>
                                )
                             }
                             return null;
                          }}
                       />
                       <Area type="monotone" dataKey="val" stroke="#3B82F6" strokeWidth={5} fill="url(#oiGradNeon)" animationDuration={500} filter="url(#neonShadowOI)" />
                    </ComposedChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>
        <div className="xl:col-span-5 bg-slate-950/40 p-8 rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden flex flex-col h-full">
           <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/5">
              <div className="p-2.5 bg-rose-500/10 rounded-xl border border-rose-500/20 shadow-lg"><Flame className="w-5 h-5 text-rose-500" /></div>
              <h4 className="text-[12px] font-black text-white uppercase tracking-widest">Global Rekt Feed</h4>
           </div>
           <div className="flex-1 relative min-h-[350px] bg-black/20 rounded-3xl border border-white/5 overflow-hidden"><LiquidationTape symbol={symbol} /></div>
        </div>
      </div>
    </div>
  );
};

export default CEXIntel;
