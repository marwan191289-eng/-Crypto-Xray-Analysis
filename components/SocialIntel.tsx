
import React, { useState, useEffect, useRef } from 'react';
import { SocialMetrics } from '../types';
import { 
  Twitter, MessageSquare, Send, Globe, Hash, BarChart, 
  TrendingUp, TrendingDown, Search, Radio, Wifi, 
  ShieldAlert, Bot, Users, Zap, Terminal
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  ReferenceLine, CartesianGrid 
} from 'recharts';

interface SocialIntelProps {
  metrics?: SocialMetrics;
  symbol: string;
  isLoading: boolean;
  t: any;
}

interface StreamMsg {
  id: string;
  source: 'X' | 'REDDIT' | 'TG' | 'NEWS';
  userTier: 'WHALE' | 'INFLUENCER' | 'RETAIL' | 'BOT';
  text: string;
  sentiment: 'BULL' | 'BEAR' | 'NEUTRAL';
  time: string;
}

const SAMPLE_MSGS = [
  { text: "Liquidity grab at support, sending it.", sentiment: 'BULL', source: 'X' },
  { text: "Massive outflow from cold storage detected.", sentiment: 'BEAR', source: 'TG' },
  { text: "Funding rates getting too high, caution.", sentiment: 'NEUTRAL', source: 'X' },
  { text: "Retail FOMO starting to kick in.", sentiment: 'BULL', source: 'REDDIT' },
  { text: "Structure broken on the 4H timeframe.", sentiment: 'BEAR', source: 'TG' },
  { text: "Accumulation phase complete. Mark up soon.", sentiment: 'BULL', source: 'X' },
  { text: "Volume decaying on this pump.", sentiment: 'BEAR', source: 'REDDIT' },
  { text: "Whale alert: 5000 BTC moved to Binance.", sentiment: 'BEAR', source: 'NEWS' },
];

const SentimentRadialGauge = ({ value }: { value: number }) => {
  const dashArray = 283;
  const dashOffset = dashArray - (dashArray * value) / 100;
  
  // Calculate color based on sentiment value
  const getColor = (v: number) => {
    if (v < 40) return '#F43F5E'; // Bearish (accent-red)
    if (v < 60) return '#D4AF37'; // Neutral (accent-gold)
    return '#10B981'; // Bullish (accent-green)
  };
  
  const color = getColor(value);

  return (
    <div className="relative w-24 h-24 group/gauge cursor-pointer transition-transform duration-500 hover:scale-110">
      <svg className="w-full h-full -rotate-90 overflow-visible" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="sentimentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F43F5E" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
          <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="transparent"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="transparent"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={dashArray}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out group-hover/gauge:filter group-hover/gauge:drop-shadow-[0_0_8px_currentColor]"
          style={{ transition: 'stroke-dashoffset 1s ease-out, stroke 0.5s ease-in-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-black font-mono text-white transition-all duration-300 group-hover/gauge:scale-125" style={{ textShadow: `0 0 10px ${color}` }}>{value.toFixed(0)}</span>
        <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest mt-[-2px]">Score</span>
      </div>
      <div className="absolute -inset-2 bg-gradient-to-br from-white/5 to-transparent rounded-full opacity-0 group-hover/gauge:opacity-100 transition-opacity blur-md pointer-events-none"></div>
    </div>
  );
};

const SocialIntel: React.FC<SocialIntelProps> = ({ metrics, symbol, isLoading, t }) => {
  const [sentimentHistory, setSentimentHistory] = useState<{ time: string, value: number, volume: number }[]>([]);
  const [liveFeed, setLiveFeed] = useState<StreamMsg[]>([]);
  const [botActivity, setBotActivity] = useState(12);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initData = Array.from({ length: 20 }, (_, i) => ({
      time: new Date(Date.now() - (20 - i) * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: 50 + Math.random() * 20 - 10,
      volume: Math.floor(Math.random() * 1000)
    }));
    setSentimentHistory(initData);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSentimentHistory(prev => {
        const lastVal = prev[prev.length - 1].value;
        const newVal = Math.max(0, Math.min(100, lastVal + (Math.random() - 0.5) * 8));
        const newPoint = {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          value: newVal,
          volume: Math.floor(Math.random() * 1000 + 500)
        };
        return [...prev.slice(1), newPoint];
      });

      if (Math.random() > 0.4) {
        const template = SAMPLE_MSGS[Math.floor(Math.random() * SAMPLE_MSGS.length)];
        const newMsg: StreamMsg = {
          id: Math.random().toString(36),
          source: template.source as any,
          userTier: Math.random() > 0.9 ? 'WHALE' : Math.random() > 0.7 ? 'INFLUENCER' : 'RETAIL',
          text: template.text,
          sentiment: template.sentiment as any,
          time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };
        setLiveFeed(prev => [newMsg, ...prev].slice(0, 8));
        setBotActivity(prev => Math.max(5, Math.min(40, prev + (Math.random() - 0.5) * 2)));
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading || !metrics) {
    return (
      <div className="glass-card rounded-[4rem] p-12 animate-pulse space-y-8">
        <div className="h-10 w-48 bg-slate-800 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="h-64 bg-slate-800 rounded-[3rem]" />
          <div className="h-64 bg-slate-800 rounded-[3rem]" />
          <div className="h-64 bg-slate-800 rounded-[3rem]" />
        </div>
      </div>
    );
  }

  const getSentimentColor = (val: number) => {
    if (val > 65) return '#10b981';
    if (val < 40) return '#f43f5e';
    return '#fbbf24';
  };

  const currentSentiment = sentimentHistory[sentimentHistory.length - 1]?.value || 50;
  const sentimentColor = getSentimentColor(currentSentiment);

  return (
    <div className="glass-card rounded-[4rem] p-12 border-2 border-white/5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform">
        <Hash className="w-64 h-64 text-indigo-400" />
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 relative z-10">
        <div className="flex items-center gap-6">
          <div className="p-5 bg-indigo-500/15 rounded-3xl border border-indigo-500/30 shadow-2xl relative">
            <Globe className="w-8 h-8 text-indigo-400" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic leading-none">{t.socialXray}</h3>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mt-3 flex items-center gap-2">
              <Radio className="w-3 h-3 text-emerald-500 animate-pulse" /> Live Stream Intercept
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="bg-slate-900/50 px-6 py-3 rounded-2xl border border-white/5 flex flex-col items-end">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Global Interaction Velocity</span>
              <div className="flex items-center gap-2">
                 <Zap className="w-4 h-4 text-amber-400" />
                 <span className="text-xl font-mono font-black text-white">{(metrics.socialVolume24h / 24).toFixed(0)} <span className="text-xs text-slate-600">Events/Hr</span></span>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        <div className="xl:col-span-8 bg-slate-950/40 p-8 rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden flex flex-col group/chart">
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-soft-light"></div>
           <div className="flex justify-between items-start mb-6 relative z-10">
              <div>
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Aggregated Sentiment Waveform</span>
                 <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-black font-mono tracking-tighter transition-colors duration-500" style={{ color: sentimentColor }}>
                       {currentSentiment.toFixed(1)}%
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-white/5 border border-white/10">
                       {currentSentiment > 60 ? 'Extreme Hype' : currentSentiment < 40 ? 'Maximum Fear' : 'Neutral Flow'}
                    </span>
                 </div>
              </div>
              <div className="text-right">
                 <div className="flex items-center justify-end gap-2 text-rose-400 mb-1">
                    <Bot className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Bot Activity</span>
                 </div>
                 <div className="flex items-center gap-2 bg-slate-900 rounded-full px-2 py-1 border border-white/10">
                    <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-rose-500 transition-all duration-500" style={{ width: `${botActivity}%` }}></div>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-rose-400">{botActivity.toFixed(1)}%</span>
                 </div>
              </div>
           </div>

           <div className="flex-1 w-full min-h-[250px] relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={sentimentHistory}>
                    <defs>
                       <linearGradient id="sentimentGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={sentimentColor} stopOpacity={0.4}/>
                          <stop offset="95%" stopColor={sentimentColor} stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis domain={[0, 100]} hide />
                    <Tooltip 
                       contentStyle={{ backgroundColor: '#020617', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '1rem' }}
                       itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold' }}
                       labelStyle={{ display: 'none' }}
                    />
                    <ReferenceLine y={50} stroke="#334155" strokeDasharray="3 3" />
                    <Area 
                       type="monotone" 
                       dataKey="value" 
                       stroke={sentimentColor} 
                       strokeWidth={3} 
                       fill="url(#sentimentGrad)" 
                       animationDuration={500}
                    />
                 </AreaChart>
              </ResponsiveContainer>
              <div className="absolute top-0 right-0 bottom-0 w-[2px] bg-white/20 shadow-[0_0_10px_white] animate-[scan_3s_linear_infinite]"></div>
           </div>
        </div>

        <div className="xl:col-span-4 bg-slate-950/40 p-8 rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden flex flex-col">
           <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
              <Terminal className="w-5 h-5 text-accent" />
              <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Signal Intercept Feed</span>
              <div className="ml-auto w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
           </div>

           <div className="flex-1 overflow-hidden relative" ref={scrollRef}>
              <div className="absolute inset-0 flex flex-col gap-3 overflow-hidden">
                 {liveFeed.map((msg) => (
                    <div key={msg.id} className="bg-black/30 p-4 rounded-2xl border border-white/5 animate-[slideIn_0.3s_ease-out] hover:bg-white/5 transition-colors cursor-default">
                       <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                             {msg.source === 'X' ? <Twitter size={12} className="text-[#1DA1F2]" /> : 
                              msg.source === 'REDDIT' ? <MessageSquare size={12} className="text-[#FF4500]" /> : 
                              <Send size={12} className="text-[#0088cc]" />}
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{msg.source}</span>
                             {msg.userTier === 'WHALE' && <span className="text-[8px] bg-indigo-500/20 text-indigo-300 px-1.5 rounded border border-indigo-500/30">WHALE</span>}
                             {msg.userTier === 'INFLUENCER' && <span className="text-[8px] bg-amber-500/20 text-amber-300 px-1.5 rounded border border-amber-500/30">TIER 1</span>}
                          </div>
                          <span className="text-[8px] font-mono text-slate-600">{msg.time}</span>
                       </div>
                       <p className="text-[10px] font-bold text-slate-300 leading-tight">"{msg.text}"</p>
                       <div className={`mt-2 h-0.5 w-8 rounded-full ${msg.sentiment === 'BULL' ? 'bg-emerald-500' : msg.sentiment === 'BEAR' ? 'bg-rose-500' : 'bg-slate-500'}`}></div>
                    </div>
                 ))}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none"></div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10 relative z-10">
        <div className="bg-slate-900/40 p-6 rounded-[2.5rem] border border-white/5 hover:border-[#1DA1F2]/30 transition-all group/plat flex flex-col items-center">
           <div className="flex justify-between items-start mb-4 w-full">
              <div className="p-3 bg-[#1DA1F2]/10 rounded-xl">
                 <Twitter className="w-5 h-5 text-[#1DA1F2]" />
              </div>
           </div>
           <SentimentRadialGauge value={metrics.xSentiment} />
           <div className="space-y-3 w-full mt-6">
              <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                 <span>Reach Impact</span>
                 <span className="text-white">High Intensity</span>
              </div>
           </div>
        </div>

        <div className="bg-slate-900/40 p-6 rounded-[2.5rem] border border-white/5 hover:border-[#FF4500]/30 transition-all group/plat">
           <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-[#FF4500]/10 rounded-xl">
                 <MessageSquare className="w-5 h-5 text-[#FF4500]" />
              </div>
              <span className={`text-xl font-black font-mono ${getSentimentColor(metrics.redditSentiment)}`}>{metrics.redditSentiment.toFixed(0)}%</span>
           </div>
           <div className="space-y-3">
              <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                 <span>Retail Consensus</span>
                 <span className="text-white">Mixed</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                 <div className="h-full bg-[#FF4500]" style={{ width: `${metrics.redditSentiment}%` }}></div>
              </div>
           </div>
        </div>

        <div className="bg-slate-900/40 p-6 rounded-[2.5rem] border border-white/5 hover:border-[#0088cc]/30 transition-all group/plat">
           <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-[#0088cc]/10 rounded-xl">
                 <Send className="w-5 h-5 text-[#0088cc]" />
              </div>
              <div className="text-right">
                 <span className="text-xl font-black font-mono text-white block leading-none">{metrics.telegramVolume.toLocaleString()}</span>
                 <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Msgs/Hr</span>
              </div>
           </div>
           <div className="space-y-3">
              <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                 <span>Alpha Velocity</span>
                 <span className="text-emerald-400">Surging</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                 <div className="h-full bg-[#0088cc] animate-pulse" style={{ width: '85%' }}></div>
              </div>
           </div>
        </div>
      </div>

      <div className="mt-10 pt-10 border-t border-white/5 flex flex-col lg:flex-row justify-between items-start gap-10">
         <div className="flex-1">
            <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
               <Hash className="w-4 h-4 text-indigo-400" /> {t.trendingKeywords}
            </h4>
            <div className="flex flex-wrap gap-3">
               {metrics.trendingKeywords.map((tag, i) => (
                  <div key={i} className="group/tag relative">
                     <span className="px-5 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-[10px] font-black text-white uppercase tracking-widest hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all cursor-crosshair flex items-center gap-2">
                        #{tag}
                        <div className="w-1 h-1 rounded-full bg-indigo-500 opacity-0 group-hover/tag:opacity-100 transition-opacity"></div>
                     </span>
                  </div>
               ))}
            </div>
         </div>

         <div className="w-full lg:w-auto flex gap-6">
            <div className="bg-slate-900/60 px-8 py-4 rounded-3xl border border-white/5 flex items-center gap-4">
               <Search className="w-5 h-5 text-slate-500" />
               <div>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">{t.searchIndex}</span>
                  <span className="text-xl font-black text-indigo-300 font-mono">{metrics.googleTrendsScore} / 100</span>
               </div>
            </div>
            
            <div className="bg-slate-900/60 px-8 py-4 rounded-3xl border border-white/5 flex items-center gap-4">
               <ShieldAlert className="w-5 h-5 text-rose-500" />
               <div>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">FUD Index</span>
                  <span className="text-xl font-black text-rose-400 font-mono">12.4%</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default SocialIntel;
