
import React from 'react';
import { OnChainMetrics, WhaleTransaction } from '../types';
import { ShieldAlert, ArrowUpRight, ArrowDownLeft, Database, Activity, HardDrive, Link, ExternalLink, Box } from 'lucide-react';

interface OnChainIntelProps {
  metrics?: OnChainMetrics;
  symbol: string;
  isLoading: boolean;
  t: any;
}

const OnChainIntel: React.FC<OnChainIntelProps> = ({ metrics, symbol, isLoading, t }) => {
  if (isLoading || !metrics) {
    return (
      <div className="glass-card rounded-[4rem] p-12 animate-pulse space-y-8">
        <div className="h-10 w-48 bg-slate-800 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-64 bg-slate-800 rounded-[3rem]" />
          <div className="h-64 bg-slate-800 rounded-[3rem]" />
        </div>
      </div>
    );
  }

  const formatUsd = (val: number) => {
    if (val >= 1000000000) return `$${(val / 1000000000).toFixed(2)}B`;
    if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
    return `$${val.toLocaleString()}`;
  };

  return (
    <div className="glass-card rounded-[4rem] p-12 border-2 border-white/5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:rotate-6 transition-transform">
        <Database className="w-64 h-64 text-indigo-400" />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex items-center gap-6">
          <div className="p-5 bg-indigo-500/15 rounded-3xl border border-indigo-500/30 shadow-2xl">
            <Link className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">{t.onChainIntel}</h3>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mt-3">{t.networkMainnet}: {symbol}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="bg-slate-900/80 px-6 py-3 rounded-2xl border border-white/10 flex flex-col">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{t.activeAddresses}</span>
            <span className="text-sm font-black text-white font-mono">{(metrics.activeAddresses24h / 1000).toFixed(1)}K</span>
          </div>
          <div className="bg-slate-900/80 px-6 py-3 rounded-2xl border border-white/10 flex flex-col">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{t.mempool}</span>
            <span className="text-sm font-black text-indigo-400 font-mono">{metrics.mempoolSize.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-slate-950/40 border-2 border-white/5 rounded-[3.5rem] p-10 relative overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-[13px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
              <HardDrive className="w-5 h-5 text-indigo-400" /> {t.exchangeNetflow}
            </h4>
            <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${metrics.netFlow > 0 ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
              {metrics.netFlow > 0 ? t.sellingPressure : t.accumulation}
            </div>
          </div>

          <div className="space-y-8">
             <div className="flex justify-between items-end">
               <div className="space-y-1 text-start">
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">{t.inflowToCex}</span>
                 <span className="text-3xl font-black text-rose-400 font-mono tracking-tighter">{formatUsd(metrics.exchangeInflow)}</span>
               </div>
               <ArrowUpRight className="w-8 h-8 text-rose-500 opacity-30" />
             </div>
             
             <div className="h-3 bg-slate-900 rounded-full overflow-hidden border border-white/5 p-0.5">
               <div className="h-full bg-gradient-to-r from-emerald-500 to-rose-500 rounded-full" 
                    style={{ width: `${(metrics.exchangeInflow / (metrics.exchangeInflow + metrics.exchangeOutflow)) * 100}%` }}></div>
             </div>

             <div className="flex justify-between items-end">
               <ArrowDownLeft className="w-8 h-8 text-emerald-500 opacity-30" />
               <div className="space-y-1 text-end">
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">{t.outflowToWallet}</span>
                 <span className="text-3xl font-black text-emerald-400 font-mono tracking-tighter">{formatUsd(metrics.exchangeOutflow)}</span>
               </div>
             </div>
          </div>
        </div>

        <div className="bg-slate-950/40 border-2 border-white/5 rounded-[3.5rem] p-10 relative overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-[13px] font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-indigo-400" /> {t.largeScale}
            </h4>
            <span className="text-[9px] font-black text-indigo-500 animate-pulse uppercase tracking-[0.2em]">{t.radarActive}</span>
          </div>

          <div className="space-y-4 max-h-64 overflow-y-auto pr-3 custom-scrollbar">
            {metrics.whaleTransactions.map((tx) => (
              <div key={tx.id} className="p-4 bg-slate-900/60 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all group/tx">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black font-mono text-indigo-400">{tx.timestamp}</span>
                    <Box className="w-3 h-3 text-slate-600" />
                    <span className="text-[10px] font-black text-slate-500 uppercase">{tx.hash}</span>
                  </div>
                  <ExternalLink className="w-3 h-3 text-slate-700 group-hover/tx:text-indigo-400 transition-colors" />
                </div>
                <div className="flex justify-between items-center">
                   <div className="flex items-center gap-3">
                     <span className={`text-[11px] font-black ${tx.from === 'EXCHANGE' ? 'text-rose-400' : 'text-emerald-400'}`}>{tx.fromLabel}</span>
                     <span className="text-slate-700">→</span>
                     <span className={`text-[11px] font-black ${tx.to === 'EXCHANGE' ? 'text-rose-400' : 'text-emerald-400'}`}>{tx.toLabel}</span>
                   </div>
                   <span className="text-sm font-black text-white font-mono">{tx.amount.toFixed(0)} {symbol}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
        <div className="bg-slate-900/40 p-6 rounded-3xl border border-white/5 text-start">
          <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-2">{t.coinDaysDestroyed}</span>
          <span className="text-xl font-black text-white font-mono">{(metrics.coinDaysDestroyed / 1000000).toFixed(2)}M</span>
        </div>
        <div className="bg-slate-900/40 p-6 rounded-3xl border border-white/5 text-start">
          <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-2">{t.dormancy}</span>
          <span className="text-xl font-black text-white font-mono">{metrics.dormancy.toFixed(2)}</span>
        </div>
        <div className="bg-slate-900/40 p-6 rounded-3xl border border-white/5 text-start">
          <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-2">{t.lang === 'ar' ? 'تدفقات المحفظة' : 'Wallet Flows'}</span>
          <span className="text-xl font-black text-emerald-400 font-mono">+12.5%</span>
        </div>
        <div className="bg-slate-900/40 p-6 rounded-3xl border border-white/5 text-start">
          <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-2">{t.liquidityState}</span>
          <span className="text-xl font-black text-indigo-400 font-mono uppercase italic">{t.dense}</span>
        </div>
      </div>
    </div>
  );
};

export default OnChainIntel;
