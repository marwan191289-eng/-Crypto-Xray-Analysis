
import React, { useMemo, useState, useEffect } from 'react';
import { BlockchainStats, AIAnalysis } from '../types';
import { Globe, Activity, Zap, TrendingUp, TrendingDown, Signal, Network, Cpu, Gauge, Radar, BarChart2, Scan, Radio, Wifi, Server } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

interface Props {
  stats: BlockchainStats;
  aiAnalysis?: AIAnalysis;
  t: any;
}

const HeaderCard = ({ children, className = "", style }: { children?: React.ReactNode, className?: string, style?: React.CSSProperties }) => (
  <div className={`bg-slate-950/80 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-white/5 shadow-[0_0_40px_rgba(0,0,0,0.5)] relative overflow-hidden group flex flex-col justify-between min-h-[220px] md:min-h-[280px] hover:border-white/10 hover:shadow-[0_0_60px_rgba(59,130,246,0.1)] transition-all duration-500 ${className}`} style={style}>
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
    {children}
  </div>
);

const LivePulse = () => (
  <span className="relative flex h-2 w-2 ml-2">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_10px_#10b981]"></span>
  </span>
);

const MarketOverviewHeader: React.FC<Props> = ({ stats, aiAnalysis, t }) => {
  // --- Live Data Simulation State ---
  const [liveCap, setLiveCap] = useState(stats.totalMarketCap);
  const [liveVol, setLiveVol] = useState(stats.globalVolume || 85.2);
  const [liveFg, setLiveFg] = useState(stats.fearGreed?.value || 50);
  const [liveScore, setLiveScore] = useState(aiAnalysis?.score || 50);
  
  // Trend data for sparklines
  const [capHistory, setCapHistory] = useState(Array(20).fill(0).map((_, i) => ({ val: 50 + Math.sin(i) * 10 })));

  // Sync props to state
  useEffect(() => {
    setLiveCap(stats.totalMarketCap);
    if (stats.globalVolume) setLiveVol(stats.globalVolume);
    setLiveFg(stats.fearGreed?.value || 50);
  }, [stats]);

  useEffect(() => {
    if (aiAnalysis?.score) setLiveScore(aiAnalysis.score);
  }, [aiAnalysis]);

  // Real-time Ticker Effect
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Total Cap Jitter
      setLiveCap(prev => Math.max(0, prev + (Math.random() - 0.5) * 0.002));

      // 2. Update Cap History
      setCapHistory(prev => {
        const last = prev[prev.length - 1].val;
        const next = last + (Math.random() - 0.5) * 5;
        return [...prev.slice(1), { val: next }];
      });

      // 3. Volume Jitter
      setLiveVol(prev => Math.max(0, prev + (Math.random() - 0.5) * 0.1));

      // 4. Fear/Greed Drift
      if (Math.random() > 0.8) {
        setLiveFg(prev => Math.max(0, Math.min(100, prev + (Math.random() > 0.5 ? 1 : -1))));
      }

      // 5. AI Score Micro-adjustments
      setLiveScore(prev => Math.max(0, Math.min(100, prev + (Math.random() - 0.5) * 0.4)));

    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Derived Values
  const isCapUp = liveCap > 2.65;
  const fgColor = liveFg >= 75 ? '#10b981' : liveFg >= 50 ? '#a3e635' : liveFg >= 25 ? '#facc15' : '#f43f5e';

  // Network Health Logic
  const gas = stats.ethGasPrice || 0;
  let healthStatus = 'OPTIMAL';
  let healthColor = 'text-emerald-400';
  let healthBorder = 'border-emerald-500/20';
  let healthBg = 'bg-emerald-500/10';
  let healthGlow = 'shadow-[0_0_10px_rgba(16,185,129,0.2)]';

  if (gas > 100) {
    healthStatus = 'CONGESTED';
    healthColor = 'text-rose-400';
    healthBorder = 'border-rose-500/20';
    healthBg = 'bg-rose-500/10';
    healthGlow = 'shadow-[0_0_10px_rgba(244,63,94,0.2)]';
  } else if (gas > 40) {
    healthStatus = 'HIGH LOAD';
    healthColor = 'text-amber-400';
    healthBorder = 'border-amber-500/20';
    healthBg = 'bg-amber-500/10';
    healthGlow = 'shadow-[0_0_10px_rgba(251,191,36,0.2)]';
  }

  // Signal Mapping Logic
  const rawSignal = aiAnalysis?.signal || 'WAIT';
  let displaySignal = 'NEUTRAL';
  let signalColor = 'text-slate-400';
  let signalBg = 'bg-slate-500/10 border-slate-500/20';
  let glowColor = 'rgba(148, 163, 184, 0.2)';
  let DirectionIcon = Activity;
  let signalStrength = 0; // 0-100

  if (rawSignal.includes('STRONG BUY')) {
    displaySignal = 'EXTREMELY BULLISH';
    signalColor = 'text-emerald-400';
    signalBg = 'bg-emerald-500/10 border-emerald-500/20';
    glowColor = 'rgba(16, 185, 129, 0.6)';
    DirectionIcon = TrendingUp;
    signalStrength = 95;
  } else if (rawSignal.includes('BUY')) {
    displaySignal = 'BULLISH';
    signalColor = 'text-emerald-400';
    signalBg = 'bg-emerald-500/10 border-emerald-500/20';
    glowColor = 'rgba(16, 185, 129, 0.4)';
    DirectionIcon = TrendingUp;
    signalStrength = 75;
  } else if (rawSignal.includes('STRONG SELL')) {
    displaySignal = 'EXTREMELY BEARISH';
    signalColor = 'text-rose-500';
    signalBg = 'bg-rose-500/10 border-rose-500/20';
    glowColor = 'rgba(244, 63, 94, 0.6)';
    DirectionIcon = TrendingDown;
    signalStrength = 95;
  } else if (rawSignal.includes('SELL')) {
    displaySignal = 'BEARISH';
    signalColor = 'text-rose-400';
    signalBg = 'bg-rose-500/10 border-rose-500/20';
    glowColor = 'rgba(244, 63, 94, 0.4)';
    DirectionIcon = TrendingDown;
    signalStrength = 75;
  } else {
    displaySignal = 'NEUTRAL / WAIT';
    signalColor = 'text-amber-400';
    signalBg = 'bg-amber-500/10 border-amber-500/20';
    glowColor = 'rgba(251, 191, 36, 0.4)';
    DirectionIcon = Activity;
    signalStrength = 40;
  }

  // Neon Signal Bars Data
  const signalBars = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    active: (i / 20) * 100 < signalStrength
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
      
      {/* 1. Total Market Cap (Live & Neon) */}
      <HeaderCard className="hover:shadow-[0_0_50px_rgba(59,130,246,0.15)] group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full group-hover:bg-blue-500/10 transition-all"></div>
        <div className="relative z-10 flex flex-col h-full justify-between">
           <div>
              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                      <Globe className="w-5 h-5 text-blue-400" />
                    </div>
                    <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] drop-shadow-md">{t.totalCap}</h2>
                 </div>
                 
                 <div className="flex gap-2">
                    {/* Network Health Pill */}
                    <div className={`hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg border backdrop-blur-md ${healthBg} ${healthBorder} ${healthColor} ${healthGlow}`}>
                       <Wifi className="w-3 h-3" />
                       <span className="text-[8px] font-black uppercase tracking-wider">{healthStatus}</span>
                    </div>

                    <div className="flex items-center gap-2 bg-blue-500/5 px-2.5 py-1 rounded-lg border border-blue-500/10 backdrop-blur-md">
                       <LivePulse />
                       <span className="text-[9px] font-black text-blue-300 uppercase tracking-widest text-shadow-sm">Live</span>
                    </div>
                 </div>
              </div>
              <div className="flex items-baseline gap-2">
                 <span className="text-3xl md:text-4xl 2xl:text-5xl font-black text-white font-mono tracking-tighter tabular-nums transition-all drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                    ${liveCap.toFixed(3)}<span className="text-xl text-slate-500 ml-1">T</span>
                 </span>
              </div>
              <div className={`inline-flex items-center gap-2 mt-4 px-3 py-1.5 rounded-lg border backdrop-blur-md w-fit transition-all duration-500 ${isCapUp ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.1)]'}`}>
                  {isCapUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  <span className="text-[10px] font-black font-mono">{(liveCap * 0.4).toFixed(2)}%</span>
              </div>
           </div>
           
           <div className="relative h-20 w-full opacity-60 mt-4 mask-gradient-b">
              <ResponsiveContainer width="100%" height="100%" minHeight={80} minWidth={0}>
                <AreaChart data={capHistory}>
                  <defs>
                    <linearGradient id="capNeon" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="step" 
                    dataKey="val" 
                    stroke="#3B82F6" 
                    strokeWidth={3} 
                    fill="url(#capNeon)" 
                    isAnimationActive={false}
                    filter="drop-shadow(0 0 6px #3B82F6)"
                  />
                </AreaChart>
              </ResponsiveContainer>
           </div>
           
           <div className="flex justify-between items-end border-t border-white/5 pt-4 mt-2">
              <div className="flex flex-col gap-0.5">
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest opacity-70">{t.globalVolume}</span>
                 <span className="text-sm font-black text-white font-mono tracking-tight tabular-nums">${liveVol.toFixed(2)}B</span>
              </div>
              <div className="flex flex-col gap-0.5 text-end">
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest opacity-70">{t.btcDom}</span>
                 <span className="text-sm font-black text-gold font-mono tracking-tight text-glow-gold">{stats.btcDominance?.toFixed(1)}%</span>
              </div>
           </div>
        </div>
      </HeaderCard>

      {/* 2. Signal Summary (Neon High-Impact) */}
      <HeaderCard className={`hover:border-opacity-50 transition-all duration-700 relative overflow-visible`} style={{ borderColor: glowColor }}>
        {/* Dynamic Background Glow based on Signal */}
        <div 
            className="absolute inset-0 opacity-20 transition-all duration-1000 mix-blend-screen pointer-events-none"
            style={{ 
                background: `radial-gradient(circle at 100% 0%, ${glowColor}, transparent 60%)`,
                filter: 'blur(40px)'
            }}
        ></div>

        <div className="relative z-10 flex flex-col h-full justify-between">
           <div>
              <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl border bg-slate-900/50 backdrop-blur-md" style={{ borderColor: glowColor }}>
                      <Radar className={`w-5 h-5 animate-spin-slow`} style={{ color: signalColor.includes('emerald') ? '#34d399' : signalColor.includes('rose') ? '#fb7185' : '#fbbf24' }} />
                    </div>
                    <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] drop-shadow-sm">Signal Summary</h2>
                 </div>
                 <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border backdrop-blur-xl bg-black/40 ${signalColor}`} style={{ borderColor: glowColor }}>
                    <DirectionIcon className="w-4 h-4 animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-widest">
                        {displaySignal.includes('BULLISH') ? 'UP' : displaySignal.includes('BEARISH') ? 'DOWN' : 'FLAT'}
                    </span>
                 </div>
              </div>
              
              <div className="relative group">
                 <h3 
                    className={`text-2xl md:text-3xl xl:text-4xl font-black uppercase italic tracking-tighter leading-none mb-4 transition-all duration-700 ${signalColor}`}
                    style={{ 
                        filter: `drop-shadow(0 0 15px ${glowColor})`,
                        textShadow: `0 0 30px ${glowColor}`
                    }}
                 >
                    {displaySignal}
                 </h3>
              </div>
              
              {/* Neon Signal Strength Bar */}
              <div className="space-y-2 mb-2">
                 <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    <span>Signal Strength</span>
                    <span className={signalColor}>{signalStrength}%</span>
                 </div>
                 <div className="flex gap-1 h-2">
                    {signalBars.map((bar) => (
                        <div 
                            key={bar.id} 
                            className={`flex-1 rounded-sm transition-all duration-500 ${bar.active ? signalColor.replace('text-', 'bg-') : 'bg-slate-800'}`}
                            style={{ 
                                boxShadow: bar.active ? `0 0 8px ${glowColor}` : 'none',
                                opacity: bar.active ? 1 : 0.2
                            }}
                        />
                    ))}
                 </div>
              </div>
           </div>

           <div className="mt-auto pt-6 border-t border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                 <Scan className="w-4 h-4 text-slate-500" />
                 <span>Scanning...</span>
              </div>
              <div className={`px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${signalBg} ${signalColor} shadow-lg`}>
                 Confidence: {Math.floor(80 + Math.random() * 15)}%
              </div>
           </div>
        </div>
      </HeaderCard>

      {/* 3. Fear & Greed (Holographic Gauge - Precision SVG) */}
      <HeaderCard className="hover:shadow-[0_0_50px_rgba(16,185,129,0.15)] overflow-visible">
        <div className="relative z-10 flex flex-col h-full justify-between">
           <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                 <div className="p-2.5 bg-slate-900/50 rounded-xl border border-white/10 shadow-inner">
                   <Zap className="w-5 h-5" style={{ color: fgColor }} />
                 </div>
                 <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] drop-shadow-md">{t.fearGreed}</h2>
              </div>
              <span 
                className="text-[10px] font-black px-3 py-1 rounded-lg uppercase border backdrop-blur-md transition-all"
                style={{ 
                    color: fgColor, 
                    backgroundColor: `${fgColor}10`, 
                    borderColor: `${fgColor}30`,
                    boxShadow: `0 0 15px ${fgColor}20`
                }}
              >
                 {liveFg > 75 ? 'Ext. Greed' : liveFg > 50 ? 'Greed' : liveFg < 25 ? 'Ext. Fear' : 'Fear'}
              </span>
           </div>

           <div className="flex flex-col items-center justify-center flex-1 py-6 relative z-0">
              {/* Ambient Glow */}
              <div 
                  className="absolute inset-0 blur-[80px] rounded-full pointer-events-none transition-colors duration-1000"
                  style={{ backgroundColor: `${fgColor}10` }}
              ></div>

              <div className="relative w-full flex items-center justify-center">
                 <svg viewBox="0 0 200 110" className="w-full h-32 overflow-visible">
                    <defs>
                        <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#f43f5e" />
                            <stop offset="50%" stopColor="#facc15" />
                            <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                        <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>
                    
                    {/* Background Track */}
                    <path 
                        d="M 20 100 A 80 80 0 0 1 180 100" 
                        fill="none" 
                        stroke="#1e293b" 
                        strokeWidth="12" 
                        strokeLinecap="round" 
                    />

                    {/* Active Track (Masked) */}
                    <path 
                        d="M 20 100 A 80 80 0 0 1 180 100" 
                        fill="none" 
                        stroke="url(#gaugeGradient)" 
                        strokeWidth="12" 
                        strokeLinecap="round"
                        strokeDasharray={251.2} 
                        strokeDashoffset={251.2 * (1 - (liveFg / 100))}
                        className="transition-all duration-1000 ease-out"
                        filter="url(#gaugeGlow)"
                    />

                    {/* Tick Marks */}
                    {[0, 25, 50, 75, 100].map((tick) => {
                        const angle = (tick / 100) * 180; // 0 to 180
                        const rad = (angle * Math.PI) / 180;
                        const x1 = 100 - 68 * Math.cos(rad);
                        const y1 = 100 - 68 * Math.sin(rad);
                        const x2 = 100 - 78 * Math.cos(rad);
                        const y2 = 100 - 78 * Math.sin(rad);
                        return (
                            <line 
                                key={tick} 
                                x1={x1} y1={y1} x2={x2} y2={y2} 
                                stroke={tick === 0 || tick === 100 ? "#64748b" : "#334155"} 
                                strokeWidth="2" 
                            />
                        );
                    })}

                    {/* Needle */}
                    <g 
                        transform={`translate(100, 100) rotate(${(liveFg / 100) * 180 - 180})`} // -180 deg offset to start from West
                        className="transition-transform duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1)"
                    >
                        <path d="M 0 0 L 75 0" stroke="white" strokeWidth="2" filter="drop-shadow(0 0 2px white)" />
                        <circle cx="75" cy="0" r="3" fill="white" filter="drop-shadow(0 0 4px white)" />
                        <circle cx="0" cy="0" r="6" fill="white" filter="drop-shadow(0 0 5px white)" />
                    </g>
                 </svg>
              </div>

              {/* Value Display */}
              <div className="absolute bottom-[20px] flex flex-col items-center">
                  <span className="text-3xl md:text-4xl font-black text-white font-mono tabular-nums drop-shadow-lg tracking-tighter" style={{ textShadow: `0 0 20px ${fgColor}60` }}>
                      {liveFg.toFixed(0)}
                  </span>
              </div>
           </div>
           
           <div className="flex justify-between text-[9px] font-black text-slate-600 uppercase tracking-widest mt-4 px-2">
              <span className="text-rose-500 opacity-80">Fear (0)</span>
              <span className="text-emerald-500 opacity-80">Greed (100)</span>
           </div>
        </div>
      </HeaderCard>

      {/* 4. AI Sentiment Score (GEMINI-3 ULTRA) */}
      <HeaderCard className="hover:shadow-[0_0_50px_rgba(212,175,55,0.15)] overflow-visible">
        <div className="absolute top-0 right-0 p-6 opacity-10">
           <Cpu className="w-32 h-32 text-gold animate-pulse" />
        </div>
        <div className="relative z-10 flex flex-col h-full justify-between">
           <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gold/10 rounded-xl border border-gold/20 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                <Network className="w-5 h-5 text-gold" />
              </div>
              <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] drop-shadow-md">{t.aiSentimentScore}</h2>
           </div>

           <div className="flex flex-col items-center py-6">
              {/* Increased Container Size for Full Visibility & Neural Processing Visualization */}
              <div className="relative w-48 h-48 flex items-center justify-center mt-2">
                 
                 {/* Outer Rotating Rings - Processing Power Visuals */}
                 <div className="absolute inset-0 border border-dashed border-gold/30 rounded-full animate-[spin_10s_linear_infinite]"></div>
                 <div className="absolute inset-2 border border-gold/20 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
                 <div className="absolute inset-6 border-2 border-dotted border-gold/10 rounded-full animate-[spin_20s_linear_infinite]"></div>
                 
                 {/* Orbiting Nodes */}
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-gold rounded-full shadow-[0_0_10px_#d4af37] animate-pulse"></div>
                 <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-gold rounded-full shadow-[0_0_10px_#d4af37] animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                 <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-gold rounded-full shadow-[0_0_10px_#d4af37] animate-pulse" style={{ animationDelay: '0.7s' }}></div>

                 {/* Main Progress Ring - Scaled nicely */}
                 <svg className="w-32 h-32 -rotate-90 relative z-20" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="transparent" />
                    <circle 
                      cx="50" cy="50" r="45" 
                      stroke="#D4AF37" strokeWidth="6" 
                      fill="transparent" 
                      strokeDasharray="283" 
                      strokeDashoffset={283 - (283 * ((liveScore) / 100))} 
                      strokeLinecap="round" 
                      className="transition-all duration-500 ease-out drop-shadow-[0_0_15px_#d4af37]"
                    />
                 </svg>
                 
                 {/* Center Content */}
                 <div className="absolute flex flex-col items-center z-30">
                    <span className="text-4xl md:text-5xl font-black text-white font-mono tabular-nums text-glow-gold">{liveScore.toFixed(0)}</span>
                    <span className="text-[8px] font-black text-gold/60 uppercase tracking-widest mt-1">Index</span>
                 </div>
              </div>
           </div>

           <div className="flex items-center justify-between border-t border-white/5 pt-4">
              <div className="flex flex-col">
                 <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest opacity-70">Confidence</span>
                 <span className="text-sm font-black text-white font-mono drop-shadow-sm">{aiAnalysis?.confidence || 75}%</span>
              </div>
              <div className="flex flex-col items-end">
                 <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest opacity-70">Active Model</span>
                 <div className="flex items-center gap-1.5">
                   <div className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse shadow-[0_0_8px_#d4af37]"></div>
                   <span className="text-[10px] font-black text-gold uppercase tracking-widest text-shadow-sm">GEMINI-3 ULTRA</span>
                 </div>
              </div>
           </div>
        </div>
      </HeaderCard>

    </div>
  );
};

export default MarketOverviewHeader;
