
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { WhaleBearMetrics, WhaleTransaction } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, ReferenceLine, 
} from 'recharts';
import { 
  ShieldAlert, TrendingUp, TrendingDown, Target, Info, Activity, Ship, 
  AlertCircle, Map, Crosshair, Zap, Radar, Anchor, Radio, Skull
} from 'lucide-react';

interface Props {
  metrics?: WhaleBearMetrics;
  whaleTx: WhaleTransaction[];
  symbol: string;
  isLoading: boolean;
  currentPrice?: number;
  t: any;
}

const WhaleBearForensics: React.FC<Props> = ({ metrics, whaleTx, symbol, isLoading, currentPrice, t }) => {
  const [pressure, setPressure] = useState(50); 
  const [liveNetflow, setLiveNetflow] = useState<any[]>([]);
  const [liveTx, setLiveTx] = useState<WhaleTransaction[]>([]);
  const [lastTxId, setLastTxId] = useState<string | null>(null);

  useEffect(() => {
    if (metrics?.netflowHistory) setLiveNetflow(metrics.netflowHistory);
    if (whaleTx) setLiveTx(whaleTx);
  }, [metrics, whaleTx]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPressure(prev => {
        const volatility = Math.random() > 0.9 ? 15 : 2; 
        const change = (Math.random() - 0.5) * volatility;
        return Math.max(0, Math.min(100, prev + change));
      });
      if (Math.random() > 0.8) {
        const id = Math.random().toString(36).substring(7);
        const amount = Math.random() * 500 + 100;
        const newTx: WhaleTransaction = {
          id, amount, amountUsd: amount * (currentPrice || 60000), 
          from: Math.random() > 0.5 ? 'EXCHANGE' : 'WALLET', to: 'WALLET', timestamp: new Date().toLocaleTimeString(), hash: '0x...'
        };
        setLastTxId(id);
        setLiveTx(prev => [newTx, ...prev].slice(0, 10));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [currentPrice]);

  if (isLoading || !metrics) return <div className="min-h-[500px] animate-pulse bg-slate-900 rounded-[4rem]"></div>;

  const pressureColor = pressure > 60 ? '#10b981' : pressure < 40 ? '#f43f5e' : '#fbbf24';
  const isHighPressure = pressure > 60 || pressure < 40;

  return (
    <div className="cyber-card rounded-[4rem] p-12 border border-white/5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform duration-1000"><Ship className="w-96 h-96 text-indigo-400" /></div>
      <div className="flex flex-col md:flex-row items-center justify-between mb-12 relative z-10 gap-6">
        <div className="flex items-center gap-6">
          <div className="p-5 bg-indigo-500/10 rounded-3xl border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.15)]"><Anchor className="w-8 h-8 text-indigo-400 animate-pulse" /></div>
          <div><h3 className="text-3xl font-black text-white uppercase italic leading-none">{t.whaleBearMatrix}</h3></div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12 relative z-10">
        <div className="xl:col-span-2 flex flex-col gap-10">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="bg-slate-950/40 p-10 rounded-[3rem] border border-white/5 flex flex-col items-center justify-center relative overflow-hidden">
                 <div className={`absolute inset-0 transition-all duration-1000 blur-[80px] pointer-events-none ${isHighPressure ? 'opacity-30' : 'opacity-10'}`} style={{ backgroundColor: pressureColor }}></div>
                 <div className="relative w-64 h-32 mt-8 overflow-hidden">
                    <div className="absolute w-64 h-64 rounded-full border-[12px] border-slate-800 border-t-transparent border-l-transparent -rotate-45"></div>
                    <div className={`absolute bottom-0 left-1/2 w-1.5 h-28 bg-white origin-bottom transition-all duration-700 ease-out z-10 shadow-[0_0_15px_white] ${isHighPressure ? 'animate-[pulse_0.5s_infinite] shadow-[0_0_30px_white]' : ''}`}
                         style={{ transform: `translateX(-50%) rotate(${(pressure / 100) * 180 - 90}deg)` }}>
                        <div className="w-4 h-4 bg-white rounded-full absolute -top-2 left-1/2 -translate-x-1/2 shadow-[0_0_15px_white]"></div>
                    </div>
                    <div className="absolute bottom-0 left-0 text-[10px] font-black text-rose-500 uppercase tracking-widest">DUMP</div>
                    <div className="absolute bottom-0 right-0 text-[10px] font-black text-emerald-500 uppercase tracking-widest">PUMP</div>
                 </div>
                 <div className="mt-8 text-center"><span className="text-4xl font-black font-mono" style={{ color: pressureColor, textShadow: isHighPressure ? `0 0 20px ${pressureColor}` : 'none' }}>{pressure.toFixed(1)}</span></div>
              </div>
           </div>
        </div>

        <div className="flex flex-col gap-10">
           <div className="bg-slate-950/40 p-8 rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden flex-1 flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                 <h4 className="text-[13px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-3"><Zap className="w-5 h-5 text-amber-400" /> Live Whale Tape</h4>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4 max-h-[500px]">
                 {liveTx.map((tx) => {
                    const isNew = tx.id === lastTxId;
                    return (
                       <div key={tx.id} className={`flex justify-between items-center p-4 rounded-2xl border transition-all duration-500 ${isNew ? 'bg-white/10 border-white/50 scale-105 shadow-[0_0_30px_rgba(255,255,255,0.2)]' : 'bg-slate-900/50 border-white/5'}`}>
                          <div className="flex items-center gap-3">
                             <div className={`p-2 rounded-lg ${tx.from === 'EXCHANGE' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                {tx.from === 'EXCHANGE' ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                             </div>
                             <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-300 uppercase">{tx.from === 'EXCHANGE' ? 'SELL' : 'BUY'}</span>
                                <span className="text-[8px] font-mono text-slate-600">{tx.timestamp}</span>
                             </div>
                          </div>
                          <div className="text-right">
                             <span className="text-sm font-black font-mono text-white block">${(tx.amountUsd / 1000).toFixed(1)}K</span>
                          </div>
                       </div>
                    )
                 })}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default WhaleBearForensics;
