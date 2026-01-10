
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

// --- Entity Attribution Database ---
const ENTITIES = {
  EXCHANGE: ['Binance Hot Wallet', 'Coinbase Prime', 'OKX Reserve', 'Kraken Deposit', 'Bybit Cold Storage'],
  WHALE: ['Unknown Whale 0x3a...', 'Jump Trading', 'Wintermute', 'Alameda Liquidator', 'Smart Money 0x7f...'],
  MINER: ['F2Pool', 'AntPool', 'Foundry USA', 'Unknown Miner']
};

// --- Helper: Particle Flow Animation ---
const FlowParticle = ({ delay, direction, speed }: { delay: number, direction: 'in' | 'out', speed: number }) => {
  return (
    <div 
      className={`absolute top-1/2 w-2 h-0.5 rounded-full opacity-0 ${direction === 'in' ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'}`}
      style={{
        left: direction === 'in' ? '0%' : '100%',
        animation: `flow-${direction} ${speed}s linear infinite`,
        animationDelay: `${delay}s`
      }}
    />
  );
};

const OnChainIntel: React.FC<OnChainIntelProps> = ({ metrics, symbol, isLoading, t }) => {
  // --- Live Simulation State ---
  const [liveAddresses, setLiveAddresses] = useState(0);
  const [liveMempool, setLiveMempool] = useState(0);
  const [liveTx, setLiveTx] = useState<WhaleTransaction[]>([]);
  const [sopr, setSopr] = useState(1.0); // Spent Output Profit Ratio
  const [blockHeight, setBlockHeight] = useState(8345921);
  const [fluxIntensity, setFluxIntensity] = useState(0); // 0-10 scale for visual flow

  // Init State from Props
  useEffect(() => {
    if (metrics) {
      setLiveAddresses(metrics.activeAddresses24h);
      setLiveMempool(metrics.mempoolSize);
      setLiveTx(metrics.whaleTransactions);
      setFluxIntensity(Math.min(10, Math.abs(metrics.netFlow) / 1000000)); // Rough scale
    }
  }, [metrics]);

  // --- Real-time Blockchain Engine ---
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Ticker Updates
      setLiveAddresses(prev => Math.floor(prev + (Math.random() - 0.5) * 50));
      setLiveMempool(prev => Math.max(1000, Math.floor(prev + (Math.random() - 0.5) * 200)));
      setSopr(prev => Math.max(0.8, Math.min(1.2, prev + (Math.random() - 0.5) * 0.01)));

      // 2. Simulate Block Production
      if (Math.random() > 0.9) {
        setBlockHeight(prev => prev + 1);
      }

      // 3. Inject Live Whale TX
      if (Math.random() > 0.75) {
        const isExchange = Math.random() > 0.5;
        const amount = Math.random() * 500 + 50;
        const newTx: WhaleTransaction = {
          id: Math.random().toString(36).substring(7),
          amount,
          amountUsd: amount * 65000, // Approx BTC price for visuals
          from: isExchange ? 'EXCHANGE' : 'WALLET',
          to: isExchange ? 'WALLET' : 'EXCHANGE',
          fromLabel: isExchange ? ENTITIES.EXCHANGE[Math.floor(Math.random() * ENTITIES.EXCHANGE.length)] : ENTITIES.WHALE[Math.floor(Math.random() * ENTITIES.WHALE.length)],
          toLabel: isExchange ? ENTITIES.WHALE[Math.floor(Math.random() * ENTITIES.WHALE.length)] : ENTITIES.EXCHANGE[Math.floor(Math.random() * ENTITIES.EXCHANGE.length)],
          timestamp: new Date().toLocaleTimeString(),
          hash: '0x' + Math.random().toString(16).substring(2, 10) + '...'
        };
        setLiveTx(prev => [newTx, ...prev].slice(0, 8));
      }
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
  const flowSpeed = Math.max(0.5, 3 - (fluxIntensity / 5)); // Faster (lower s) if intense

  return (
    <div className="cyber-card rounded-[4rem] p-12 border border-white/5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:rotate-6 transition-transform">
        <Database className="w-64 h-64 text-indigo-400" />
      </div>

      {/* Header */}
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
               <span className="text-[10px] font-mono font-bold text-emerald-500 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></div>
                  BLOCK #{blockHeight}
               </span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="bg-slate-900/50 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 flex flex-col items-end">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{t.activeAddresses}</span>
            <span className="text-sm font-black text-white font-mono tabular-nums">{liveAddresses.toLocaleString()}</span>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 flex flex-col items-end">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{t.mempool}</span>
            <span className="text-sm font-black text-indigo-400 font-mono tabular-nums">{liveMempool.toLocaleString()} tx</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 relative z-10">
        
        {/* LEFT: Exchange Flux Engine */}
        <div className="xl:col-span-7 bg-slate-950/40 border border-white/5 rounded-[3.5rem] p-10 relative overflow-hidden shadow-2xl flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-[13px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
              <HardDrive className="w-5 h-5 text-indigo-400" /> {t.exchangeNetflow}
            </h4>
            <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border backdrop-blur-md ${isInflow ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}`}>
              {isInflow ? t.sellingPressure : t.accumulation}
            </div>
          </div>

          {/* Visual Flux Engine */}
          <div className="flex-1 flex items-center justify-between relative bg-black/20 rounded-[2.5rem] border border-white/5 p-6 mb-8 min-h-[200px]">
             {/* Left Node: Private Wallets */}
             <div className="flex flex-col items-center gap-3 z-10">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.1)]">
                   <Wallet className="w-8 h-8 text-indigo-400" />
                </div>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Wallets</span>
             </div>

             {/* The Flux Pipe */}
             <div className="flex-1 h-12 mx-4 relative bg-slate-900/50 rounded-full border border-white/5 overflow-hidden flex items-center">
                {/* Background Stream */}
                <div className={`absolute inset-0 opacity-10 ${isInflow ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                
                {/* Flow Particles */}
                {Array.from({length: 12}).map((_, i) => (
                   <FlowParticle 
                      key={i} 
                      delay={i * 0.3} 
                      direction={isInflow ? 'in' : 'out'} 
                      speed={flowSpeed}
                   />
                ))}

                {/* Center Badge */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-950 px-3 py-1 rounded-full border border-white/10 z-20">
                   <span className={`text-[10px] font-black font-mono ${netFlowColor}`}>
                      {formatUsd(Math.abs(metrics.netFlow))}
                   </span>
                </div>
             </div>

             {/* Right Node: Exchanges */}
             <div className="flex flex-col items-center gap-3 z-10">
                <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.2)] ${isInflow ? 'bg-rose-500/10 border-rose-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                   <BuildingIcon className={`w-8 h-8 ${isInflow ? 'text-rose-400' : 'text-emerald-400'}`} />
                </div>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Exchanges</span>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
             <div className="bg-slate-900/30 p-4 rounded-2xl border border-white/5 flex justify-between items-end">
                <div>
                   <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">{t.inflowToCex}</span>
                   <span className="text-lg font-black text-rose-400 font-mono tracking-tighter">{formatUsd(metrics.exchangeInflow)}</span>
                </div>
                <ArrowUpRight className="w-5 h-5 text-rose-500 opacity-50" />
             </div>
             <div className="bg-slate-900/30 p-4 rounded-2xl border border-white/5 flex justify-between items-end">
                <div>
                   <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">{t.outflowToWallet}</span>
                   <span className="text-lg font-black text-emerald-400 font-mono tracking-tighter">{formatUsd(metrics.exchangeOutflow)}</span>
                </div>
                <ArrowDownLeft className="w-5 h-5 text-emerald-400 opacity-50" />
             </div>
          </div>
        </div>

        {/* RIGHT: Whale Radar & Feed */}
        <div className="xl:col-span-5 bg-slate-950/40 border border-white/5 rounded-[3.5rem] p-10 relative overflow-hidden shadow-2xl flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-[13px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-indigo-400" /> {t.whaleMonitor}
            </h4>
            <div className="flex items-center gap-2">
               <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
               </span>
               <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{t.radarActive}</span>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2 max-h-[350px]">
            {liveTx.map((tx) => {
               const isBigWhale = tx.amountUsd > 1000000;
               return (
                  <div key={tx.id} className={`p-4 rounded-2xl border transition-all animate-[slideIn_0.3s_ease-out] group/tx ${isBigWhale ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40' : 'bg-slate-900/40 border-white/5 hover:border-white/10'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-black font-mono text-slate-500">{tx.timestamp}</span>
                        {isBigWhale && <span className="text-[8px] font-black bg-amber-500/20 text-amber-400 px-1.5 rounded uppercase">MEGALODON</span>}
                      </div>
                      <ExternalLink className="w-3 h-3 text-slate-700 group-hover/tx:text-indigo-400 transition-colors cursor-pointer" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2 text-[10px] font-bold text-white">
                          <span className={tx.from === 'EXCHANGE' ? 'text-rose-400' : 'text-emerald-400'}>{tx.fromLabel}</span>
                          <span className="text-slate-600 text-[8px] font-black">TO</span>
                          <span className={tx.to === 'EXCHANGE' ? 'text-rose-400' : 'text-emerald-400'}>{tx.toLabel}</span>
                       </div>
                    </div>

                    <div className="mt-2 flex justify-between items-end border-t border-white/5 pt-2">
                       <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Value</span>
                       <span className={`text-sm font-black font-mono tracking-tighter ${isBigWhale ? 'text-amber-400' : 'text-white'}`}>
                          ${(tx.amountUsd).toLocaleString()}
                       </span>
                    </div>
                  </div>
               )
            })}
          </div>
        </div>
      </div>

      {/* FOOTER: Forensic Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10 relative z-10">
        
        {/* SOPR Gauge */}
        <div className="bg-slate-900/40 p-6 rounded-[2.5rem] border border-white/5 flex flex-col items-center justify-center text-center relative overflow-hidden">
           <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4 z-10">SOPR Ratio (Profit/Loss)</span>
           <div className="relative w-32 h-16 overflow-hidden z-10">
              <div className="absolute w-32 h-32 rounded-full border-[8px] border-slate-800 border-t-transparent border-l-transparent -rotate-45" style={{ transform: 'rotate(-45deg)' }}></div>
              <div className="absolute w-32 h-32 rounded-full border-[8px] border-transparent border-t-emerald-500 border-r-rose-500 opacity-80" 
                   style={{ transform: 'rotate(-45deg)' }}></div>
              <div 
                  className="absolute bottom-0 left-1/2 w-1 h-14 bg-white origin-bottom transition-transform duration-1000 ease-out z-10 shadow-[0_0_10px_white]"
                  style={{ transform: `translateX(-50%) rotate(${(sopr - 0.9) * 450 - 90}deg)` }} // Map 0.9-1.1 to angle
              ></div>
           </div>
           <div className="mt-2 z-10">
              <span className={`text-2xl font-black font-mono ${sopr > 1 ? 'text-emerald-400' : 'text-rose-400'}`}>{sopr.toFixed(4)}</span>
              <span className="text-[8px] block font-bold text-slate-600 uppercase tracking-widest mt-1">
                 {sopr > 1 ? 'Market in Profit' : 'Market in Loss'}
              </span>
           </div>
           {/* Background Noise */}
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
        </div>

        {/* CDD */}
        <div className="bg-slate-900/40 p-6 rounded-[2.5rem] border border-white/5 flex flex-col justify-center text-start">
           <div className="flex items-center gap-3 mb-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t.coinDaysDestroyed}</span>
           </div>
           <span className="text-3xl font-black text-white font-mono tracking-tighter mb-2">
              {(metrics.coinDaysDestroyed / 1000000).toFixed(2)}M
           </span>
           <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400 w-2/3 animate-pulse"></div>
           </div>
           <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-2">Long-Term Holders Moving</span>
        </div>

        {/* Liquidity State */}
        <div className="bg-slate-900/40 p-6 rounded-[2.5rem] border border-white/5 flex flex-col justify-center text-start relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10">
              <Layers className="w-16 h-16 text-indigo-400" />
           </div>
           <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 z-10">{t.liquidityState}</span>
           <span className="text-3xl font-black text-indigo-400 font-mono tracking-tighter z-10 uppercase italic">
              {metrics.activeAddresses24h > 1000000 ? 'High Density' : 'Low Density'}
           </span>
           <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-2 z-10 flex items-center gap-2">
              <Anchor className="w-3 h-3" /> Chain Stability: 99.8%
           </span>
        </div>

      </div>

      <style>{`
        @keyframes flow-in {
          0% { left: 0%; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { left: 50%; opacity: 0; transform: scale(0.5); }
        }
        @keyframes flow-out {
          0% { left: 50%; opacity: 0; transform: scale(0.5); }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { left: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// Simple icon placeholder
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
