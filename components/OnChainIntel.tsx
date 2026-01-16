
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { OnChainMetrics, WhaleTransaction } from '../types';
import { 
  ShieldAlert, ArrowUpRight, ArrowDownLeft, Database, Activity, 
  HardDrive, Link, ExternalLink, Box, Radio, Zap, 
  Layers, Search, Cpu, Anchor, Share2, Wallet
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

interface OnChainIntelProps {
  metrics?: OnChainMetrics;
  symbol: string;
  isLoading: boolean;
  t: any;
}

const ENTITIES = {
  EXCHANGE: ['Binance Hot Wallet', 'Coinbase Prime', 'OKX Reserve', 'Bybit Cold Storage'],
  WHALE: ['Unknown Whale 0x3a...', 'Jump Trading', 'Wintermute', 'Smart Money 0x7f...'],
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
      <div className="bg-slate-950/40 rounded-[4rem] p-12 animate-pulse space-y-8 min-h-[500px] border border-white/5">
        <div className="h-10 w-48 bg-slate-800 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-80 bg-slate-800 rounded-[3rem]" />
          <div className="h-80 bg-slate-800 rounded-[3rem]" />
        </div>
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
  const particleCount = Math.floor(15 + fluxIntensity * 5); // Increased density
  const flowSpeed = Math.max(0.3, 2.0 - (fluxIntensity / 5)); // Increased dynamic speed

  return (
    <div className="cyber-card rounded-[4rem] p-12 border border-white/5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:rotate-6 transition-transform">
        <Database className="w-64 h-64 text-indigo-400" />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 relative z-10">
        <div className="flex items-center gap-6">
          <div className="p-5 bg-indigo-500/10 rounded-3xl border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.15)] relative">
            <Link className="w-8 h-8 text-indigo-400 relative z-10" />
            <div className="absolute inset-0 bg-indigo-500/20 blur-xl animate-pulse"></div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">{t.onChainIntel}</h3>
            <div className="flex items-center gap-3 mt-3">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">{t.networkMainnet}: {symbol}</span>
               <div className="h-px w-6 bg-slate-700"></div>
               <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></div>
                  BLOCK #{blockHeight}
               </span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="bg-slate-900/50 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 flex flex-col items-end group/stat transition-all hover:border-accent/50">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 group-hover/stat:text-accent">Active Addresses</span>
            <span className="text-sm font-black text-white font-mono">{liveAddresses.toLocaleString()}</span>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 flex flex-col items-end group/stat transition-all hover:border-indigo-500/50">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 group-hover/stat:text-indigo-400">Mempool Backlog</span>
            <span className="text-sm font-black text-white font-mono">{liveMempool.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 relative z-10">
        <div className="xl:col-span-7 bg-slate-950/40 border border-white/5 rounded-[3.5rem] p-10 relative overflow-hidden shadow-2xl flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-[13px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
              <HardDrive className="w-5 h-5 text-indigo-400" /> Netflow Velocity
            </h4>
            <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border backdrop-blur-md ${isInflow ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}`}>
              {isInflow ? 'Sell Pressure High' : 'Accumulation Signal'}
            </div>
          </div>

          <div className="flex-1 flex items-center justify-between relative bg-black/40 rounded-[2.5rem] border border-white/5 p-6 mb-8 min-h-[220px]">
             <div className="flex flex-col items-center gap-4 z-10 group/node">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center transition-all duration-500 group-hover/node:scale-110 group-hover/node:shadow-[0_0_30px_rgba(99,102,241,0.5)] group-hover/node:border-indigo-400">
                   <Wallet className="w-8 h-8 text-indigo-400" />
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover/node:text-indigo-300">Wallets</span>
             </div>

             <div className="flex-1 h-20 mx-4 relative bg-slate-900/60 rounded-full border border-white/5 overflow-hidden flex items-center">
                <div className={`absolute inset-0 opacity-20 transition-colors duration-1000 ${isInflow ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                {Array.from({length: particleCount}).map((_, i) => (
                   <FlowParticle 
                      key={i} 
                      delay={i * (flowSpeed / particleCount)} 
                      direction={isInflow ? 'in' : 'out'} 
                      speed={flowSpeed}
                      intensity={fluxIntensity}
                   />
                ))}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-950/95 px-6 py-2 rounded-full border border-white/10 z-20 shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-xl">
                   <span className={`text-[13px] font-black font-mono transition-all duration-300 ${netFlowColor} drop-shadow-[0_0_8px_currentColor]`}>
                      {formatUsd(Math.abs(metrics.netFlow))}
                   </span>
                </div>
             </div>

             <div className="flex flex-col items-center gap-4 z-10 group/node">
                <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center transition-all duration-500 group-hover/node:scale-110 ${isInflow ? 'bg-rose-500/10 border-rose-500/20 group-hover/node:shadow-[0_0_30px_rgba(244,63,94,0.5)] group-hover/node:border-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 group-hover/node:shadow-[0_0_30px_rgba(16,185,129,0.5)] group-hover/node:border-emerald-400'}`}>
                   <BuildingIcon className={`w-8 h-8 ${isInflow ? 'text-rose-400' : 'text-emerald-400'}`} />
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Exchanges</span>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
             <div className="bg-slate-900/40 p-5 rounded-2xl border border-white/5 group/box hover:bg-white/5 transition-all">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-2 group-hover/box:text-rose-400">Total Inflow</span>
                <span className="text-xl font-black text-rose-400 font-mono tracking-tighter">{formatUsd(metrics.exchangeInflow)}</span>
             </div>
             <div className="bg-slate-900/40 p-5 rounded-2xl border border-white/5 group/box hover:bg-white/5 transition-all">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-2 group-hover/box:text-emerald-400">Total Outflow</span>
                <span className="text-xl font-black text-emerald-400 font-mono tracking-tighter">{formatUsd(metrics.exchangeOutflow)}</span>
             </div>
          </div>
        </div>

        <div className="xl:col-span-5 bg-slate-950/40 border border-white/5 rounded-[3.5rem] p-10 relative overflow-hidden shadow-2xl flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-[13px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-indigo-400" /> Global Whale Tape
            </h4>
            <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2 max-h-[400px]">
            {liveTx.map((tx) => {
               const isMegalodon = tx.amountUsd > 1000000;
               return (
                  <div key={tx.id} className={`p-4 rounded-3xl border transition-all animate-[slideIn_0.3s_ease-out] group/tx ${isMegalodon ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/50 shadow-[inset_0_0_20px_rgba(245,158,11,0.05)]' : 'bg-slate-900/40 border-white/5 hover:border-white/20'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black font-mono text-slate-500">{tx.timestamp}</span>
                        {isMegalodon && <span className="text-[8px] font-black bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded uppercase animate-pulse border border-amber-500/20">MEGALODON</span>}
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-700 group-hover/tx:text-indigo-400 transition-colors" />
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                       <div className="flex items-center gap-2 text-[11px] font-bold text-white">
                          <span className={tx.from === 'EXCHANGE' ? 'text-rose-400' : 'text-emerald-400'}>{tx.fromLabel}</span>
                          <div className="h-px w-4 bg-slate-800"></div>
                          <span className={tx.to === 'EXCHANGE' ? 'text-rose-400' : 'text-emerald-400'}>{tx.toLabel}</span>
                       </div>
                    </div>

                    <div className="flex justify-between items-end bg-black/20 p-3 rounded-2xl border border-white/5">
                       <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Movement Value</span>
                       <span className={`text-lg font-black font-mono tracking-tighter ${isMegalodon ? 'text-amber-400 drop-shadow-[0_0_10px_#f59e0b]' : 'text-white'}`}>
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
