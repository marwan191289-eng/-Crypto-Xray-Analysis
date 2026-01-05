
import React from 'react';
import { SocialMetrics } from '../types';
import { Twitter, MessageSquare, Send, Globe, Hash, BarChart, TrendingUp, Search } from 'lucide-react';

interface SocialIntelProps {
  metrics?: SocialMetrics;
  symbol: string;
  isLoading: boolean;
  t: any;
}

const SocialIntel: React.FC<SocialIntelProps> = ({ metrics, symbol, isLoading, t }) => {
  if (isLoading || !metrics) {
    return (
      <div className="glass-card rounded-[4rem] p-12 animate-pulse space-y-8">
        <div className="h-10 w-48 bg-slate-800 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="h-40 bg-slate-800 rounded-3xl" />
          <div className="h-40 bg-slate-800 rounded-3xl" />
          <div className="h-40 bg-slate-800 rounded-3xl" />
        </div>
      </div>
    );
  }

  const getSentimentColor = (val: number) => {
    if (val > 65) return 'text-emerald-400';
    if (val < 40) return 'text-rose-400';
    return 'text-amber-400';
  };

  return (
    <div className="glass-card rounded-[4rem] p-12 border-2 border-white/5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform">
        <Hash className="w-64 h-64 text-indigo-400" />
      </div>

      <div className="flex items-center gap-6 mb-12">
        <div className="p-5 bg-indigo-500/15 rounded-3xl border border-indigo-500/30 shadow-2xl">
          <Globe className="w-8 h-8 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">{t.socialXray}</h3>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mt-3">{t.monitoringSearch}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="bg-slate-950/40 p-8 rounded-[2.5rem] border border-white/5 hover:border-indigo-500/40 transition-all shadow-xl text-start">
          <div className="flex items-center justify-between mb-6">
            <Twitter className="w-6 h-6 text-[#1DA1F2]" />
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t.xSentiment}</span>
          </div>
          <div className={`text-4xl font-black font-mono mb-4 ${getSentimentColor(metrics.xSentiment)}`}>
            {metrics.xSentiment.toFixed(1)}%
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-[#1DA1F2]" style={{ width: `${metrics.xSentiment}%` }} />
          </div>
        </div>

        <div className="bg-slate-950/40 p-8 rounded-[2.5rem] border border-white/5 hover:border-indigo-500/40 transition-all shadow-xl text-start">
          <div className="flex items-center justify-between mb-6">
            <MessageSquare className="w-6 h-6 text-[#FF4500]" />
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t.redditSentiment}</span>
          </div>
          <div className={`text-4xl font-black font-mono mb-4 ${getSentimentColor(metrics.redditSentiment)}`}>
            {metrics.redditSentiment.toFixed(1)}%
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-[#FF4500]" style={{ width: `${metrics.redditSentiment}%` }} />
          </div>
        </div>

        <div className="bg-slate-950/40 p-8 rounded-[2.5rem] border border-white/5 hover:border-indigo-500/40 transition-all shadow-xl text-start">
          <div className="flex items-center justify-between mb-6">
            <Send className="w-6 h-6 text-[#0088cc]" />
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t.tgVelocity}</span>
          </div>
          <div className="text-3xl font-black text-white font-mono mb-4">
            {metrics.telegramVolume.toLocaleString()}
            <span className="text-[10px] text-slate-600 ml-2">{t.msgsH}</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" /> {t.highMomentum}
          </div>
        </div>

        <div className="bg-slate-950/40 p-8 rounded-[2.5rem] border border-white/5 hover:border-indigo-500/40 transition-all shadow-xl text-start">
          <div className="flex items-center justify-between mb-6">
            <Search className="w-6 h-6 text-indigo-400" />
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{t.searchIndex}</span>
          </div>
          <div className="text-4xl font-black text-indigo-400 font-mono mb-4">
            {metrics.googleTrendsScore}
            <span className="text-[10px] text-slate-600 ml-2">/ 100</span>
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 animate-pulse" style={{ width: `${metrics.googleTrendsScore}%` }} />
          </div>
        </div>
      </div>

      <div className="mt-10 pt-10 border-t border-white/5 grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="text-start">
          <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
            <Hash className="w-4 h-4 text-indigo-400" /> {t.trendingKeywords}
          </h4>
          <div className="flex flex-wrap gap-4">
            {metrics.trendingKeywords.map((tag, i) => (
              <span key={i} className="px-6 py-2.5 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-[12px] font-black text-indigo-300 uppercase italic hover:bg-indigo-500/20 transition-all cursor-default">
                #{tag}
              </span>
            ))}
          </div>
        </div>
        <div className="bg-indigo-500/5 rounded-3xl p-8 border border-indigo-500/10 flex items-center justify-between text-start">
          <div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">{t.interactionVolume}</span>
            <span className="text-2xl font-black text-white font-mono">{metrics.socialVolume24h.toLocaleString()}</span>
          </div>
          <BarChart className="w-10 h-10 text-indigo-500/30" />
        </div>
      </div>
    </div>
  );
};

export default SocialIntel;
