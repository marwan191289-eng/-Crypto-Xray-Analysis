
import React, { useState, useEffect, useRef } from 'react';
import { SocialMetrics } from '../types';
import { 
  Twitter, MessageSquare, Send, Globe, Hash, BarChart, 
  TrendingUp, TrendingDown, Search, Radio, Wifi, 
  ShieldAlert, Bot, Users, Zap, Terminal, Clock, Activity, Scan
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

const SentimentRadialGauge = ({ value }: { value: number }) => {
  const dashArray = 283;
  const dashOffset = dashArray - (dashArray * value) / 100;
  
  const getColor = (v: number) => {
    if (v < 40) return '#F43F5E'; // Bearish
    if (v < 60) return '#fbbf24'; // Neutral
    return '#10B981'; // Bullish
  };
  
  const color = getColor(value);

  return (
    <div className="relative w-24 h-24 group/gauge cursor-pointer transition-transform duration-500 hover:scale-110">
      <svg className="w-full h-full -rotate-90 overflow-visible" viewBox="0 0 100 100">
        <defs>
          <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <circle cx="50" cy="50" r="45" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        <circle
          cx="50" cy="50" r="45" fill="transparent" stroke={color} strokeWidth="6"
          strokeDasharray={dashArray} strokeDashoffset={dashOffset} strokeLinecap="round"
          className="transition-all duration-1000 ease-out group-hover/gauge:filter group-hover/gauge:drop-shadow-[0_0_8px_currentColor]"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-black font-mono text-white transition-all duration-300 group-hover/gauge:scale-125" style={{ textShadow: `0 0 10px ${color}` }}>{value.toFixed(0)}</span>
        <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest mt-[-2px]">Score</span>
      </div>
    </div>
  );
};

const SocialIntel: React.FC<SocialIntelProps> = ({ metrics, symbol, isLoading, t }) => {
  const [sentimentHistory, setSentimentHistory] = useState<{ time: string, value: number, volume: number }[]>([]);
  const [liveFeed, setLiveFeed] = useState<StreamMsg[]>([]);
  const [botActivity, setBotActivity] = useState(12);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initData = Array.from({ length: 40 }, (_, i) => ({
      time: new Date(Date.now() - (40 - i) * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
        setLiveFeed(prev => [newMsg, ...prev].slice(0, 10));
        setBotActivity(prev => Math.max(5, Math.min(40, prev + (Math.random() - 0.5) * 2)));
      }
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  if (isLoading || !metrics) {
    return (
      <div className="cyber-card rounded-[3rem] p-12 h-[600px] flex items-center justify-center border border-white/5 bg-[#020617] animate-pulse">
         <Radio className="w-16 h-16 text-indigo-500 animate-pulse" />
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
    <div className="cyber-card rounded-[3rem] p-8 md:p-10 border border-white/5 relative overflow-hidden group bg-[#020617]">
      <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:scale-110 transition-transform">
        <Hash className="w-96 h-96 text-indigo-400" />
      </div>

      {/* --- HEADER --- */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-10 gap-8 relative z-10 border-b border-white/5 pb-8">
        <div className="flex items-center gap-6">
          <div className="relative">
             <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full"></div>
             <div className="relative p-4 bg-slate-900 rounded-2xl border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.15)]">
                <Globe className="w-8 h-8 text-indigo-400" />
             </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">{t.socialXray}</h3>
            <div className="flex items-center gap-3 mt-2">
               <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-black text-indigo-300 uppercase tracking-widest">
                  NLP Core v3.4
               </span>
               <div className="h-1 w-1 bg-slate-600 rounded-full"></div>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Radio size={10} className="text-emerald-500 animate-pulse" /> Live Intercept
               </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6 self-end xl:self-auto">
           <div className="text-right hidden md:block">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Global Velocity</span>
              <div className="flex items-center justify-end gap-2">
                 <Zap className="w-4 h-4 text-amber-400" />
                 <span className="text-xl font-black font-mono text-white tracking-tight">{(metrics.socialVolume24h / 24).toFixed(0)} <span className="text-[9px] text-slate-500">Ev/Hr</span></span>
              </div>
           </div>
           <div className="h-8 w-px bg-white/10 hidden md:block"></div>
           <LiveClock />
        </div>
      </div>

      {/* --- MAIN DASHBOARD GRID --- */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 relative z-10">
        
        {/* CHART COLUMN */}
        <div className="xl:col-span-8 bg-slate-950/40 p-1 rounded-[2.5rem] border border-white/5 relative overflow-hidden flex flex-col group/chart shadow-inner min-h-[380px]">
           <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>
           
           <div className="p-8 pb-0 relative z-10 flex justify-between items-start">
              <div>
                 <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2 mb-1">
                    <Activity size={14} className={currentSentiment > 50 ? 'text-emerald-400' : 'text-rose-400'} /> Sentiment Waveform
                 </h4>
                 <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-black font-mono tracking-tighter transition-colors duration-500" style={{ color: sentimentColor }}>
                       {currentSentiment.toFixed(1)}%
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">
                       {currentSentiment > 60 ? 'Extreme Hype' : currentSentiment < 40 ? 'Max Fear' : 'Neutral'}
                    </span>
                 </div>
              </div>
              <div className="text-right">
                 <div className="flex items-center justify-end gap-2 text-rose-400 mb-1">
                    <Bot className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Bot Activity</span>
                 </div>
                 <div className="flex items-center gap-2 bg-slate-900 rounded-full px-2 py-1 border border-white/10">
                    <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-rose-500 transition-all duration-500" style={{ width: `${botActivity}%` }}></div>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-rose-400">{botActivity.toFixed(1)}%</span>
                 </div>
              </div>
           </div>

           <div className="flex-1 w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={sentimentHistory} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                       <linearGradient id="sentimentGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={sentimentColor} stopOpacity={0.4}/>
                          <stop offset="90%" stopColor={sentimentColor} stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis domain={[0, 100]} hide />
                    <Tooltip 
                       contentStyle={{ backgroundColor: '#020617', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                       itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold', fontFamily: 'monospace' }}
                       labelStyle={{ display: 'none' }}
                       cursor={{ stroke: '#fff', strokeDasharray: '2 2', opacity: 0.2 }}
                    />
                    <ReferenceLine y={50} stroke="#334155" strokeDasharray="3 3" />
                    <Area 
                       type="monotone" 
                       dataKey="value" 
                       stroke={sentimentColor} 
                       strokeWidth={3} 
                       fill="url(#sentimentGrad)" 
                       animationDuration={500}
                       isAnimationActive={false}
                    />
                 </AreaChart>
              </ResponsiveContainer>
              <div className="absolute top-0 right-0 bottom-0 w-[1px] bg-white/20 shadow-[0_0_15px_white] animate-[scan_3s_linear_infinite]"></div>
           </div>
        </div>

        {/* TERMINAL FEED COLUMN */}
        <div className="xl:col-span-4 bg-black/40 rounded-[2.5rem] border border-white/5 relative overflow-hidden flex flex-col h-[380px] shadow-2xl">
           <div className="flex items-center justify-between p-6 pb-4 border-b border-white/5 bg-slate-900/50 backdrop-blur-md">
              <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                 <Terminal className="w-4 h-4 text-emerald-400" /> Signal Intercept
              </h4>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
           </div>

           <div className="flex-1 overflow-hidden relative p-4 space-y-3" ref={scrollRef}>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none z-10"></div>
              
              {liveFeed.map((msg) => (
                 <div key={msg.id} className="bg-white/[0.03] p-3 rounded-xl border border-white/5 animate-[slideIn_0.3s_ease-out] hover:bg-white/5 transition-colors group/msg">
                    <div className="flex justify-between items-center mb-1.5">
                       <div className="flex items-center gap-2">
                          {msg.source === 'X' ? <Twitter size={10} className="text-[#1DA1F2]" /> : 
                           msg.source === 'REDDIT' ? <MessageSquare size={10} className="text-[#FF4500]" /> : 
                           <Send size={10} className="text-[#0088cc]" />}
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">{msg.source}</span>
                          {msg.userTier === 'WHALE' && <span className="text-[7px] bg-indigo-500/20 text-indigo-300 px-1 rounded border border-indigo-500/30 font-black">WHALE</span>}
                       </div>
                       <span className="text-[7px] font-mono text-slate-600">{msg.time}</span>
                    </div>
                    <p className="text-[9px] font-bold text-slate-300 leading-relaxed font-mono">"{msg.text}"</p>
                    <div className={`mt-2 h-0.5 w-6 rounded-full ${msg.sentiment === 'BULL' ? 'bg-emerald-500' : msg.sentiment === 'BEAR' ? 'bg-rose-500' : 'bg-slate-500'}`}></div>
                 </div>
              ))}
           </div>
        </div>
      </div>

      {/* --- PLATFORM NODES --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 relative z-10">
        
        {/* TWITTER NODE */}
        <div className="bg-slate-900/40 p-6 rounded-[2rem] border border-white/5 hover:border-[#1DA1F2]/30 transition-all group/plat flex items-center justify-between">
           <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-[#1DA1F2]/10 rounded-lg"><Twitter className="w-4 h-4 text-[#1DA1F2]" /></div>
                 <div>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Impact</span>
                    <span className="text-white font-bold text-xs">High Intensity</span>
                 </div>
              </div>
              <div className="space-y-1">
                 <div className="flex justify-between text-[8px] font-black text-slate-500 uppercase">
                    <span>Reach</span>
                    <span className="text-[#1DA1F2]">{(metrics.xSentiment).toFixed(0)}%</span>
                 </div>
                 <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[#1DA1F2]" style={{ width: `${metrics.xSentiment}%` }}></div>
                 </div>
              </div>
           </div>
           <SentimentRadialGauge value={metrics.xSentiment} />
        </div>

        {/* REDDIT NODE */}
        <div className="bg-slate-900/40 p-6 rounded-[2rem] border border-white/5 hover:border-[#FF4500]/30 transition-all group/plat flex items-center justify-between">
           <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-[#FF4500]/10 rounded-lg"><MessageSquare className="w-4 h-4 text-[#FF4500]" /></div>
                 <div>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Consensus</span>
                    <span className="text-white font-bold text-xs">Retail Mixed</span>
                 </div>
              </div>
              <div className="space-y-1">
                 <div className="flex justify-between text-[8px] font-black text-slate-500 uppercase">
                    <span>Hype</span>
                    <span className="text-[#FF4500]">{(metrics.redditSentiment).toFixed(0)}%</span>
                 </div>
                 <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[#FF4500]" style={{ width: `${metrics.redditSentiment}%` }}></div>
                 </div>
              </div>
           </div>
           <SentimentRadialGauge value={metrics.redditSentiment} />
        </div>

        {/* TELEGRAM NODE */}
        <div className="bg-slate-900/40 p-6 rounded-[2rem] border border-white/5 hover:border-[#0088cc]/30 transition-all group/plat flex items-center justify-between">
           <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-[#0088cc]/10 rounded-lg"><Send className="w-4 h-4 text-[#0088cc]" /></div>
                 <div>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Alpha</span>
                    <span className="text-white font-bold text-xs">Velocity Surge</span>
                 </div>
              </div>
              <div className="space-y-1">
                 <div className="flex justify-between text-[8px] font-black text-slate-500 uppercase">
                    <span>Vol</span>
                    <span className="text-[#0088cc]">{(metrics.telegramVolume / 100).toFixed(0)}%</span>
                 </div>
                 <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[#0088cc] animate-pulse" style={{ width: '85%' }}></div>
                 </div>
              </div>
           </div>
           <div className="text-center">
              <span className="text-2xl font-black font-mono text-white block leading-none">{metrics.telegramVolume.toLocaleString()}</span>
              <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">Msgs/Hr</span>
           </div>
        </div>
      </div>

      {/* --- BOTTOM TAGS --- */}
      <div className="mt-8 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
         <div className="flex items-center gap-4">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
               <Hash size={12} className="text-indigo-400" /> {t.trendingKeywords}
            </span>
            <div className="flex gap-2">
               {metrics.trendingKeywords.map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-slate-900 border border-white/10 rounded-lg text-[9px] font-bold text-slate-300 uppercase tracking-wide hover:text-white hover:border-indigo-500/50 transition-colors cursor-default">
                     #{tag}
                  </span>
               ))}
            </div>
         </div>
         
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
               <Search className="w-4 h-4 text-slate-600" />
               <div>
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Search Vol</span>
                  <span className="text-sm font-black text-indigo-300 font-mono">{metrics.googleTrendsScore}/100</span>
               </div>
            </div>
            <div className="w-px h-6 bg-white/10"></div>
            <div className="flex items-center gap-3">
               <ShieldAlert className="w-4 h-4 text-rose-500" />
               <div>
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">FUD Index</span>
                  <span className="text-sm font-black text-rose-400 font-mono">12.4%</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default SocialIntel;
