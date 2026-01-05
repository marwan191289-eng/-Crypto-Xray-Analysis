
import React, { useMemo } from 'react';
import { CEXMetrics } from '../types';
import { Activity, Zap, TrendingUp, TrendingDown, Layers, BarChart3, Info } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface CEXIntelProps {
  metrics?: CEXMetrics;
  symbol: string;
  isLoading: boolean;
  t: any;
}

const MiniSpark = ({ color }: { color: string }) => {
  const data = useMemo(() => Array.from({ length: 10 }, (_, i) => ({ v: 30 + Math.random() * 40 })), []);
  return (
    <div className="h-8 w-20 opacity-40">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <Area type="monotone" dataKey="v" stroke={color} fill="transparent" strokeWidth={2} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const CEXIntel: React.FC<CEXIntelProps> = ({ metrics, symbol, isLoading, t }) => {
  if (isLoading || !metrics) {
    return (
      <div className="cyber-card rounded-[3.5rem] p-12 animate-pulse space-y-8">
        <div className="h-10 w-1/3 bg-slate-800/40 rounded-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-32 bg-slate-800/20 rounded-3xl" />
          <div className="h-32 bg-slate-800/20 rounded-3xl" />
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

  return (
    <div className="cyber-card rounded-[4rem] p-12 border-white/5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform">
        <Layers className="w-48 h-48 text-accent" />
      </div>

      <div className="flex items-center gap-7 mb-12">
        <div className="p-5 bg-accent/10 rounded-3xl border border-accent/20 shadow-2xl">
          <Activity className="w-8 h-8 text-accent" />
        </div>
        <div className="text-start">
          <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">{t.cexIntel}</h3>
          <p className="text-[11px] font-black text-muted uppercase tracking-[0.5em] mt-3 opacity-40">{t.sourceBinanceFeed}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Open Interest */}
        <div className="bg-black/30 p-8 rounded-[2.5rem] border border-white/5 hover:border-accent/40 transition-all text-start relative overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[11px] font-black text-muted uppercase tracking-[0.2em]">{t.openInterest}</span>
            <MiniSpark color="#3B82F6" />
          </div>
          <div className="flex items-baseline gap-4 mb-5">
            <span className="text-3xl font-black text-white font-mono tracking-tighter">${formatLargeNum(metrics.openInterest)}</span>
            <span className={`text-[10px] font-black font-mono ${metrics.openInterestChange >= 0 ? 'text-success' : 'text-danger'}`}>
              {metrics.openInterestChange >= 0 ? '▲' : '▼'} {Math.abs(metrics.openInterestChange).toFixed(2)}%
            </span>
          </div>
          <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
            <div className="h-full bg-accent shadow-glow" style={{ width: `${Math.min(100, (metrics.openInterest / 2000000000) * 100)}%` }} />
          </div>
        </div>

        {/* Funding Rate */}
        <div className="bg-black/30 p-8 rounded-[2.5rem] border border-white/5 hover:border-accent/40 transition-all text-start relative overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[11px] font-black text-muted uppercase tracking-[0.2em]">{t.fundingRate}</span>
            <Zap className={`w-5 h-5 ${metrics.fundingRate >= 0 ? 'text-success' : 'text-danger'}`} />
          </div>
          <div className={`text-3xl font-black font-mono tracking-tighter mb-5 ${metrics.fundingRate >= 0 ? 'text-success' : 'text-danger'}`}>
            {metrics.fundingRate.toFixed(4)}%
          </div>
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-muted opacity-40" />
            <p className="text-[9px] text-muted uppercase font-black tracking-widest opacity-40 italic">{t.periodicReset}</p>
          </div>
        </div>

        {/* Long/Short Ratio */}
        <div className="bg-black/30 p-8 rounded-[2.5rem] border border-white/5 hover:border-accent/40 transition-all text-start relative overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[11px] font-black text-muted uppercase tracking-[0.2em]">{t.longShortRatio}</span>
            <BarChart3 className="w-5 h-5 text-accent" />
          </div>
          <div className="text-3xl font-black text-white font-mono tracking-tighter mb-6">
            {metrics.longShortRatio.toFixed(2)}
          </div>
          <div className="flex gap-1.5 h-2">
            <div className="bg-success rounded-full shadow-[0_0_10px_#10b98122]" style={{ width: `${(metrics.longShortRatio / (metrics.longShortRatio + 1)) * 100}%` }} />
            <div className="bg-danger rounded-full flex-1 shadow-[0_0_10px_#f43f5e22]" />
          </div>
        </div>

        {/* Volatility */}
        <div className="bg-black/30 p-8 rounded-[2.5rem] border border-white/5 hover:border-accent/40 transition-all text-start relative overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[11px] font-black text-muted uppercase tracking-[0.2em]">{t.volatilityRealized}</span>
            <Info className="w-5 h-5 text-muted opacity-40" />
          </div>
          <div className="text-3xl font-black text-white font-mono tracking-tighter mb-6">
            {metrics.volatility.toFixed(2)}%
          </div>
          <div className="flex items-center gap-4 bg-black/40 px-5 py-2.5 rounded-2xl border border-white/5">
            <div className={`w-2.5 h-2.5 rounded-full ${metrics.volatility > 3.5 ? 'bg-danger animate-pulse' : 'bg-success'}`} />
            <span className="text-[10px] text-muted uppercase font-black tracking-widest italic">{t.riskState}: {metrics.volatility > 3.5 ? t.elevated : t.stable}</span>
          </div>
        </div>
      </div>

      {/* Liquidations HUD */}
      <div className="mt-12 pt-12 border-t border-white/5 text-start">
        <div className="flex items-center justify-between mb-10">
          <h4 className="text-[13px] font-black text-white uppercase tracking-[0.4em] italic">{t.liquidationMatrix}</h4>
          <span className="text-lg font-mono font-black text-danger text-glow-bear">-${formatLargeNum(metrics.liquidations24h.total)}</span>
        </div>
        <div className="grid grid-cols-2 gap-8">
          <div className="bg-success/5 border border-success/20 p-6 rounded-[2rem] flex flex-col gap-3 shadow-inner">
            <span className="text-[10px] font-black text-success uppercase tracking-[0.3em]">{t.longs}</span>
            <span className="text-xl font-mono font-black text-success">-${formatLargeNum(metrics.liquidations24h.longs)}</span>
          </div>
          <div className="bg-danger/5 border border-danger/20 p-6 rounded-[2rem] flex flex-col gap-3 shadow-inner">
            <span className="text-[10px] font-black text-danger uppercase tracking-[0.3em]">{t.shorts}</span>
            <span className="text-xl font-mono font-black text-danger">-${formatLargeNum(metrics.liquidations24h.shorts)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CEXIntel;
