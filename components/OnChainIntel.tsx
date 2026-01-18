
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { OnChainMetrics, WhaleTransaction } from '../types';
import { 
  ShieldAlert, ArrowUpRight, ArrowDownLeft, Database, Activity, 
  HardDrive, Link, ExternalLink, Box, Radio, Zap, 
  Layers, Search, Cpu, Anchor, Share2, Wallet, Clock, RefreshCw
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

interface OnChainIntelProps {
  metrics?: OnChainMetrics;
  symbol: string;
  isLoading: boolean;
  t: any;
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

const FlowParticle: React.FC<{ delay: number; direction: 'in' | 'out'; speed: number; intensity: number }> = ({ delay, direction, speed, intensity }) => {
  return (
    <div 
      className={`absolute top-1/2 rounded-full opacity-0 ${direction === 'in' ? 'bg-rose-500' : 'bg-emerald-500'}`}
      style={{
        width: `${3 + intensity * 0.5}px`,
        height: `${2 + intensity * 0.2}px`,
        left: direction === 'in' ? '0%' : '100%',
        boxShadow: `0 0 ${12 + intensity * 2}px ${direction === 'in' ? '#f43f5e' : '#10b981'}`,
        animation: `flow-${direction} ${speed}s linear infinite`,
        animationDelay: `${delay}s`
      }}
    />
  );
};

const OnChainIntel: React.FC<OnChainIntelProps> = ({ metrics, symbol, isLoading, t }) => {
  const [liveAddresses, setLiveAddresses] = useState(0);
  const [liveMempool, setLiveMempool] = useState(0);
  const [liveTx, setLiveTx] = useState<WhaleTransaction[]>([]);
  const [blockHeight, setBlockHeight] = useState(8345921);
  const [fluxIntensity, setFluxIntensity] = useState(0);

  useEffect(() => {
    if (metrics) {
      setLiveAddresses(metrics.activeAddresses24h);
      setLiveMempool(metrics.mempoolSize);
      setLiveTx(metrics.whaleTransactions);
      setFluxIntensity(Math.min(10, Math.abs(metrics.netFlow) / 500000));
    }
  }, [metrics]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveAddresses(prev => Math.floor(prev + (Math.random() - 0.5) * 50));
      setLiveMempool(prev => Math.max(1000, Math.floor(prev + (Math.random() - 0.5) * 200)));
      if (Math.random() > 0.9) setBlockHeight(prev => prev + 1);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  if (isLoading || !metrics) {
    return (
      <div className="bg-slate-950/40 rounded-[3rem] p-12 animate-pulse flex items-center justify-center min-h-[500px] border border-white/5">
        <RefreshCw className="w-16 h-16 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const formatUsd = (val: number) => {
    if (val >= 1000000000) return `$${(val / 1000000000).toFixed(2)}B`;
    if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
    return `$${val.toLocaleString()}`;
  };

  const isInflow = metrics.netFlow > 0;
  const netFlowColor = isInflow ? 'text-rose-400' : 'text-emerald-400';
  const particleCount = Math.floor(15 + fluxIntensity * 5);
  const flowSpeed = Math.max(0.3, 2.0 - (fluxIntensity / 5));

  return (
    <div className="cyber-card rounded-[3rem] p-8 md:p-10 border border-white/5 relative overflow-hidden group bg-[#020617]">
      <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:rotate-6 transition-transform">
        <Database className="w-64 h-64 text-indigo-400" />
      </div>

      {/* --- HEADER --- */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-10 gap-8 relative z-10 border-b border-white/5 pb-8">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.15)] relative">
            <Link className="w-8 h-8 text-indigo-400 relative z-10" />
            <div className="absolute inset-0 bg-indigo-500/20 blur-xl animate-pulse"></div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">{t.onChainIntel}</h3>
            <div className="flex items-center gap-3 mt-2">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">{t.networkMainnet}: {symbol}</span>
               <div className="h-px w-6 bg-slate-700"></div>
               <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></div>
                  BLOCK #{blockHeight}
               </span>
            </div>
          </div>
        </div>
        <LiveClock />
      </div>

      {/* --- STATS ROW --- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 relative z-10">
         <div className="bg-slate-900/40 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Active Addresses</span>
            <span className="text-lg font-black font-mono text-white">{liveAddresses.toLocaleString()}</span>
         </div>
         <div className="bg-slate-900/40 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Mempool</span>
            <span className="text-lg font-black font-mono text-white">{liveMempool.toLocaleString()} <span className="text-[8px] text-slate-600">TXS</span></span>
         </div>
         <div className="bg-slate-900/40 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Coin Days Destroyed</span>
            <span className="text-lg font-black font-mono text-amber-400">{formatUsd(metrics.coinDaysDestroyed)}</span>
         </div>
         <div className="bg-slate-900/40 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Dormancy Flow</span>
            <span className="text-lg font-black font-mono text-white">{metrics.dormancy.toFixed(2)}</span>
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 relative z-10">
        
        {/* NETFLOW VISUALIZER */}
        <div className="xl:col-span-7 bg-slate-950/40 border border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl flex flex-col justify-between min-h-[350px]">
          <div className="flex items-center justify-between mb-8 relative z-10">
            <h4 className="text-[11px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
              <HardDrive className="w-4 h-4 text-indigo-400" /> Netflow Velocity
            </h4>
            <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border backdrop-blur-md ${isInflow ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}`}>
              {isInflow ? 'High Sell Pressure' : 'Accumulation'}
            </div>
          </div>

          <div className="flex-1 flex items-center justify-between relative bg-black/40 rounded-[2rem] border border-white/5 p-6">
             {/* Wallet Node */}
             <div className="flex flex-col items-center gap-3 z-10 group/node">
                <div className="w-14 h-14 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center transition-all duration-500 group-hover/node:scale-110 group-hover/node:shadow-[0_0_20px_rgba(99,102,241,0.5)] group-hover/node:border-indigo-400">
                   <Wallet className="w-6 h-6 text-indigo-400" />
                </div>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest group-hover/node:text-indigo-300">Wallets</span>
             </div>

             {/* Flow Reactor */}
             <div className="flex-1 h-16 mx-4 relative bg-slate-900/60 rounded-full border border-white/5 overflow-hidden flex items-center shadow-inner">
                <div className={`absolute inset-0 opacity-10 transition-colors duration-1000 ${isInflow ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                {Array.from({length: particleCount}).map((_, i) => (
                   <FlowParticle 
                      key={i} 
                      delay={i * (flowSpeed / particleCount)} 
                      direction={isInflow ? 'in' : 'out'} 
                      speed={flowSpeed}
                      intensity={fluxIntensity}
                   />
                ))}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-950/90 px-4 py-1.5 rounded-full border border-white/10 z-20 shadow-xl backdrop-blur-md">
                   <span className={`text-[11px] font-black font-mono transition-all duration-300 ${netFlowColor} drop-shadow-[0_0_5px_currentColor]`}>
                      {formatUsd(Math.abs(metrics.netFlow))}
                   </span>
                </div>
             </div>

             {/* Exchange Node */}
             <div className="flex flex-col items-center gap-3 z-10 group/node">
                <div className={`w-14 h-14 rounded-xl border flex items-center justify-center transition-all duration-500 group-hover/node:scale-110 ${isInflow ? 'bg-rose-500/10 border-rose-500/20 group-hover/node:shadow-[0_0_20px_rgba(244,63,94,0.5)] group-hover/node:border-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 group-hover/node:shadow-[0_0_20px_rgba(16,185,129,0.5)] group-hover/node:border-emerald-400'}`}>
                   <BuildingIcon className={`w-6 h-6 ${isInflow ? 'text-rose-400' : 'text-emerald-400'}`} />
                </div>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Exchanges</span>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
             <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5 group/box hover:bg-white/5 transition-all">
                <div className="flex justify-between items-center mb-1">
                   <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest group-hover/box:text-rose-400">Inflow</span>
                   <ArrowDownLeft className="w-3 h-3 text-rose-500" />
                </div>
                <span className="text-lg font-black text-rose-400 font-mono tracking-tighter">{formatUsd(metrics.exchangeInflow)}</span>
             </div>
             <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5 group/box hover:bg-white/5 transition-all">
                <div className="flex justify-between items-center mb-1">
                   <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest group-hover/box:text-emerald-400">Outflow</span>
                   <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                </div>
                <span className="text-lg font-black text-emerald-400 font-mono tracking-tighter">{formatUsd(metrics.exchangeOutflow)}</span>
             </div>
          </div>
        </div>

        {/* WHALE TAPE */}
        <div className="xl:col-span-5 bg-slate-950/40 border border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl flex flex-col h-[350px]">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
            <h4 className="text-[11px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-indigo-400" /> Global Whale Tape
            </h4>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></div>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-2">
            {liveTx.map((tx) => {
               const isMegalodon = tx.amountUsd > 1000000;
               return (
                  <div key={tx.id} className={`p-3 rounded-2xl border transition-all animate-[slideIn_0.3s_ease-out] group/tx ${isMegalodon ? 'bg-amber-500/10 border-amber-500/30 hover:border-amber-500/50 shadow-[inset_0_0_20px_rgba(245,158,11,0.05)]' : 'bg-slate-900/40 border-white/5 hover:border-white/20'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-black font-mono text-slate-500">{tx.timestamp}</span>
                        {isMegalodon && <span className="text-[7px] font-black bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded uppercase animate-pulse border border-amber-500/20">MEGALODON</span>}
                      </div>
                      <ExternalLink className="w-3 h-3 text-slate-700 group-hover/tx:text-indigo-400 transition-colors" />
                    </div>
                    
                    <div className="flex items-center justify-between mb-2">
                       <div className="flex items-center gap-2 text-[9px] font-bold text-white">
                          <span className={tx.from === 'EXCHANGE' ? 'text-rose-400' : 'text-emerald-400'}>{tx.fromLabel}</span>
                          <div className="h-px w-3 bg-slate-700"></div>
                          <span className={tx.to === 'EXCHANGE' ? 'text-rose-400' : 'text-emerald-400'}>{tx.toLabel}</span>
                       </div>
                    </div>

                    <div className="flex justify-between items-end bg-black/20 p-2 rounded-xl border border-white/5">
                       <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Value</span>
                       <span className={`text-sm font-black font-mono tracking-tighter ${isMegalodon ? 'text-amber-400 drop-shadow-[0_0_5px_#f59e0b]' : 'text-white'}`}>
                          ${(tx.amountUsd).toLocaleString()}
                       </span>
                    </div>
                  </div>
               )
            })}
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes flow-in {
          0% { left: 0%; opacity: 0; transform: scale(1.2); }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { left: 50%; opacity: 0; transform: scale(0.6); }
        }
        @keyframes flow-out {
          0% { left: 50%; opacity: 0; transform: scale(0.6); }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { left: 100%; opacity: 0; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
};

const BuildingIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
    <line x1="9" y1="22" x2="9" y2="22.01"></line>
    <line x1="15" y1="22" x2="15" y2="22.01"></line>
    <line x1="12" y1="22" x2="12" y2="22.01"></line>
    <line x1="12" y1="2" x2="12" y2="22"></line>
    <line x1="4" y1="10" x2="20" y2="10"></line>
    <line x1="4" y1="14" x2="20" y2="14"></line>
    <line x1="4" y1="18" x2="20" y2="18"></line>
  </svg>
);

export default OnChainIntel;
