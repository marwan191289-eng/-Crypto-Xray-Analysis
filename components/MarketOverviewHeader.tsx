
import React, { useMemo, useState, useEffect } from 'react';
import { BlockchainStats, AIAnalysis } from '../types';
import { Globe, Activity, Zap, TrendingUp, TrendingDown, Signal, Network, Cpu, Gauge, Radar, BarChart2, Scan, Eye, ChevronRight, Fingerprint, Waves, ArrowUpRight, ArrowDownRight, Clock, Target, Crosshair, Calendar } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, YAxis, Tooltip, Defs, LinearGradient, Stop } from 'recharts';

interface Props {
  stats: BlockchainStats;
  aiAnalysis?: AIAnalysis;
  t: any;
}

const HeaderCard = ({ children, className = "", style, glowColor = "transparent" }: { children?: React.ReactNode, className?: string, style?: React.CSSProperties, glowColor?: string }) => (
  <div 
    className={`bg-slate-950/60 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white/5 shadow-[0_0_40px_rgba(0,0,0,0.5)] relative overflow-hidden group flex flex-col justify-between min-h-[260px] hover:border-white/10 transition-all duration-700 ${className}`} 
    style={{ ...style, boxShadow: `0 0 60px ${glowColor}05` }}
  >
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none"></div>
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
    
    {/* Tech Lines */}
    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
    <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
    
    {children}
  </div>
);

const MarketOverviewHeader: React.FC<Props> = ({ stats, aiAnalysis, t }) => {
  // --- Local State for smooth "Live" transitions ---
  const [liveCap, setLiveCap] = useState(stats.totalMarketCap);
  const [liveVol, setLiveVol] = useState(stats.globalVolume || 85.2);
  const [liveFg, setLiveFg] = useState(stats.fearGreed?.value || 50);
  const [liveScore, setLiveScore] = useState(aiAnalysis?.score || 50);
  const [capChange, setCapChange] = useState(2.4); // Simulated 24h change
  const [now, setNow] = useState(new Date());
  
  // Simulated Ticker for Cap Chart
  const [capData, setCapData] = useState(Array.from({length: 40}, (_, i) => ({ val: 50 + Math.sin(i * 0.3) * 10 + i * 0.5 })));

  // Clock Ticker
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Smooth transition effect towards new real values with micro-fluctuations
    const smoothUpdate = () => {
        setLiveCap(prev => {
            const target = stats.totalMarketCap;
            const diff = target - prev;
            const noise = (Math.random() - 0.5) * 0.002; // Micro movement
            return prev + (diff * 0.05) + noise;
        });
        setLiveVol(prev => prev + ((stats.globalVolume || 85.2) - prev) * 0.05);
        
        // Fear & Greed Live Simulation (Sine Wave + Noise)
        const baseFg = stats.fearGreed?.value || 50;
        const time = Date.now();
        const fgFluctuation = Math.sin(time / 3000) * 1.5 + (Math.random() - 0.5) * 0.8;
        const targetFg = Math.max(0, Math.min(100, baseFg + fgFluctuation));
        setLiveFg(prev => prev + (targetFg - prev) * 0.08);

        setLiveScore(prev => prev + ((aiAnalysis?.score || 50) - prev) * 0.05);

        // Update Chart Data
        setCapData(prev => {
            const last = prev[prev.length - 1].val;
            const next = last + (Math.random() - 0.5) * 5;
            return [...prev.slice(1), { val: next }];
        });
        
        // Jitter change slightly
        setCapChange(prev => prev + (Math.random() - 0.5) * 0.05);
    };
    const interval = setInterval(smoothUpdate, 100);
    return () => clearInterval(interval);
  }, [stats, aiAnalysis]);

  const fgColor = liveFg >= 75 ? '#10b981' : liveFg >= 50 ? '#a3e635' : liveFg >= 25 ? '#fbbf24' : '#f43f5e';
  
  const signalMeta = useMemo(() => {
    const s = aiAnalysis?.signal || 'WAIT';
    if (s.includes('BUY')) return { label: 'BULLISH FLOW', color: '#10b981', bg: 'bg-emerald-500/10' };
    if (s.includes('SELL')) return { label: 'BEARISH FLOW', color: '#f43f5e', bg: 'bg-rose-500/10' };
    return { label: 'STABLE RANGE', color: '#fbbf24', bg: 'bg-amber-500/10' };
  }, [aiAnalysis]);

  const isCapUp = capChange >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-8">
      
      {/* 1. Total Market Cap: Enhanced Digital Stream */}
      <HeaderCard glowColor="#00e5ff" className="group overflow-hidden relative">
        {/* Animated Background Stream */}
        <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
            <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[linear-gradient(transparent_0%,rgba(0,229,255,0.1)_50%,transparent_100%)] animate-[spin_15s_linear_infinite] opacity-30"></div>
        </div>

        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[80px] pointer-events-none group-hover:bg-cyan-500/10 transition-all duration-1000"></div>
        
        <div className="relative z-10 flex flex-col h-full justify-between">
           
           {/* Top Row: Global Feed Badge (Left Aligned) */}
           <div className="flex justify-start items-start mb-2 border-b border-white/5 pb-2">
              <div className="flex items-center gap-2 bg-cyan-500/10 px-2 py-1 rounded-lg border border-cyan-500/20 shadow-[0_0_10px_rgba(0,229,255,0.1)]">
                 <span className="relative flex h-1.5 w-1.5">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
                 </span>
                 <span className="text-[8px] font-bold text-cyan-400 uppercase tracking-wider">Global Feed</span>
              </div>
           </div>

           {/* Value Row - Refined Font Size */}
           <div className="mt-1 relative z-10">
              <h2 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.25em] mb-1 flex items-center gap-1.5">
                 <Globe className="w-3 h-3 text-cyan-400" /> {t.totalCap}
              </h2>
              
              <div className="flex items-baseline gap-2">
                 <span className="text-4xl font-black text-white font-mono tracking-tighter tabular-nums drop-shadow-[0_0_15px_rgba(0,229,255,0.4)] bg-gradient-to-r from-white via-cyan-100 to-blue-200 bg-clip-text text-transparent">
                    ${liveCap.toFixed(2)}T
                 </span>
              </div>
              
              <div className={`flex items-center gap-2 mt-1 ${isCapUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                 <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${isCapUp ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                    {isCapUp ? <ArrowUpRight size={10} strokeWidth={3} /> : <ArrowDownRight size={10} strokeWidth={3} />}
                    <span className="text-xs font-black font-mono tracking-tight">{Math.abs(capChange).toFixed(2)}%</span>
                 </div>
                 <span className="text-[8px] text-slate-600 uppercase tracking-widest font-bold">24h Change</span>
              </div>
           </div>
           
           {/* Enhanced Fancy Chart - Minimal & Glowing */}
           <div className="flex-1 w-full relative min-h-[80px] mt-2 group/chart overflow-hidden rounded-xl">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={capData}>
                  <defs>
                    <filter id="neonGlowFancy" height="300%" width="300%" x="-75%" y="-75%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                    <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00e5ff" stopOpacity={0.4}/>
                      <stop offset="100%" stopColor="#00e5ff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <YAxis hide domain={['dataMin', 'dataMax']} />
                  <Area 
                    type="monotone" 
                    dataKey="val" 
                    stroke="#00e5ff" 
                    strokeWidth={2} 
                    fill="url(#chartFill)" 
                    isAnimationActive={true}
                    filter="url(#neonGlowFancy)"
                  />
                </AreaChart>
              </ResponsiveContainer>
              
              {/* Overlay Scanner Line */}
              <div className="absolute top-0 bottom-0 w-[1px] bg-cyan-400/50 shadow-[0_0_10px_#00e5ff] animate-[scan_3s_linear_infinite] pointer-events-none"></div>
           </div>
           
           {/* Bottom Metrics Grid */}
           <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-2 mt-auto">
              <div className="flex flex-col group/vol cursor-default">
                 <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 group-hover/vol:text-cyan-300 transition-colors">{t.globalVolume}</span>
                 <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white font-mono tracking-tight">${liveVol.toFixed(1)}B</span>
                    <div className="h-1 flex-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500 animate-[pulse_2s_infinite]" style={{width: '65%'}}></div>
                    </div>
                 </div>
              </div>
              <div className="flex flex-col items-end group/dom cursor-default">
                 <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 group-hover/dom:text-gold transition-colors">{t.btcDom}</span>
                 <div className="flex items-center gap-2 w-full justify-end">
                    <div className="h-1 w-8 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gold animate-[pulse_3s_infinite]" style={{width: `${stats.btcDominance}%`}}></div>
                    </div>
                    <span className="text-xs font-black text-gold font-mono text-glow-gold">{stats.btcDominance?.toFixed(1)}%</span>
                 </div>
              </div>
           </div>
        </div>
      </HeaderCard>

      {/* 2. Global Signal: Radar Scope without Clock */}
      <HeaderCard glowColor={signalMeta.color}>
        <div className="relative z-10 flex flex-col h-full justify-between">
           
           {/* Header: Label Only */}
           <div className="flex items-start justify-between mb-4 border-b border-white/5 pb-2">
              <div className="flex flex-col">
                 <h2 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.25em] flex items-center gap-1.5">
                    <Scan size={10} className="text-white" /> Alpha Signal
                 </h2>
                 <span className="text-[8px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1 mt-0.5">
                     Detection Active
                 </span>
              </div>
           </div>

           {/* Main Visualization: Radar Scanner */}
           <div className="flex-1 flex flex-col justify-center items-center relative py-1">
              {/* CSS Holographic Radar */}
              <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                 <div className="w-48 h-48 rounded-full border border-white/10 flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full border border-white/10 border-dashed animate-[spin_10s_linear_infinite]"></div>
                 </div>
                 <div className="absolute w-full h-px bg-white/5"></div>
                 <div className="absolute h-full w-px bg-white/5"></div>
                 
                 {/* Scanning Sector */}
                 <div 
                   className="absolute w-32 h-32 rounded-full origin-bottom-right"
                   style={{ 
                     background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, ${signalMeta.color}20 60deg, transparent 60deg)`,
                     animation: 'spin 3s linear infinite',
                     borderRadius: '50%'
                   }}
                 ></div>
              </div>

              {/* The Signal Text - Massive & Centered */}
              <div className={`relative z-10 text-center transition-all duration-500`}>
                 <h3 className="text-4xl lg:text-5xl font-black italic tracking-tighter uppercase drop-shadow-2xl mb-1" style={{ color: signalMeta.color, textShadow: `0 0 30px ${signalMeta.color}50` }}>
                    {aiAnalysis?.signal?.split(' ')[0] || 'SCANNING'}
                 </h3>
                 <div className="text-sm font-black uppercase tracking-[0.3em] opacity-80" style={{ color: signalMeta.color }}>
                    {aiAnalysis?.signal?.split(' ')[1] || '...'}
                 </div>
              </div>
           </div>

           {/* Bottom: Confidence & ID */}
           <div className="border-t border-white/5 pt-3 flex justify-between items-center mt-auto">
              <div className="flex items-center gap-2">
                 <Fingerprint className="w-3.5 h-3.5 text-slate-600" />
                 <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Confidence</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="flex gap-0.5">
                    {Array.from({length: 5}).map((_, i) => (
                        <div 
                            key={i} 
                            className={`w-1.5 h-3 rounded-sm ${i < ((aiAnalysis?.confidence || 0) / 20) ? 'opacity-100' : 'opacity-20'}`}
                            style={{ backgroundColor: signalMeta.color }}
                        ></div>
                    ))}
                 </div>
                 <span className="text-[10px] font-black font-mono text-white">{aiAnalysis?.confidence || 0}%</span>
              </div>
           </div>
        </div>
      </HeaderCard>

      {/* 3. Fear & Greed: Sentinel Gauge - Ultra Elegant Design */}
      <HeaderCard glowColor={fgColor}>
        <div className="relative z-10 flex flex-col h-full justify-between">
           
           {/* Header with Live Indicator */}
           <div className="flex items-center justify-between mb-2 border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                 <div className="p-1.5 rounded-md bg-white/5 border border-white/10 shrink-0">
                    <Gauge className="w-3.5 h-3.5 text-white" />
                 </div>
                 <h2 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em] whitespace-nowrap overflow-hidden text-ellipsis">{t.fearGreed}</h2>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800 border border-white/5">
                 <span className="relative flex h-1.5 w-1.5">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                 </span>
                 <span className="text-[7px] font-bold text-white uppercase tracking-wider">Live</span>
              </div>
           </div>

           {/* Market Mood - Moved Down */}
           <div className="flex justify-center mb-2">
             <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest bg-white/5 border border-white/10 ${liveFg >= 50 ? 'text-emerald-400' : 'text-rose-400'} shadow-[0_0_15px_rgba(0,0,0,0.2)]`}>
                {stats.fearGreed?.label || 'Neutral'}
             </div>
           </div>

           {/* Ultra Elegant Gauge */}
           <div className="relative h-24 flex items-center justify-center">
                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/5 opacity-20 blur-xl rounded-full"></div>
                
                <svg viewBox="0 0 200 120" className="w-full h-full drop-shadow-2xl overflow-visible">
                    <defs>
                        <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#f43f5e" /> {/* Red */}
                            <stop offset="50%" stopColor="#fbbf24" /> {/* Yellow */}
                            <stop offset="100%" stopColor="#10b981" /> {/* Green */}
                        </linearGradient>
                        <filter id="neonGauge" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                    
                    {/* Track Background - Dotted/Segmented */}
                    <path 
                        d="M 20 100 A 80 80 0 0 1 180 100" 
                        fill="none" 
                        stroke="#1e293b" 
                        strokeWidth="8" 
                        strokeLinecap="round" 
                        strokeDasharray="1 3"
                    />

                    {/* Active Arc - Smooth Gradient with Glow */}
                    <path 
                        d="M 20 100 A 80 80 0 0 1 180 100" 
                        fill="none" 
                        stroke="url(#gaugeGradient)" 
                        strokeWidth="4" 
                        strokeLinecap="round"
                        strokeDasharray="251.2"
                        strokeDashoffset={251.2 - (251.2 * (liveFg / 100))}
                        filter="url(#neonGauge)"
                        className="transition-[stroke-dashoffset] duration-100 ease-linear"
                    />

                    {/* Needle/Indicator - Modern Style */}
                    <g style={{ 
                        transformOrigin: '100px 100px', 
                        transform: `rotate(${(liveFg / 100) * 180 - 90}deg)`, 
                        transition: 'transform 0.1s linear' 
                    }}>
                        {/* Needle Body */}
                        <path d="M 100 100 L 100 25" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
                        <circle cx="100" cy="25" r="3" fill="white" filter="url(#neonGauge)" />
                        {/* Center Hub */}
                        <circle cx="100" cy="100" r="4" fill="#0f172a" stroke="white" strokeWidth="2" />
                    </g>

                    {/* Ticks for 0, 50, 100 */}
                    <text x="20" y="115" fontSize="8" fill="#64748b" textAnchor="middle" fontWeight="bold">0</text>
                    <text x="100" y="90" fontSize="8" fill="#64748b" textAnchor="middle" fontWeight="bold">50</text>
                    <text x="180" y="115" fontSize="8" fill="#64748b" textAnchor="middle" fontWeight="bold">100</text>
                </svg>
           </div>
           
           {/* Value Display - Moved Below */}
           <div className="flex flex-col items-center mt-2 mb-2">
               <div className="relative">
                   <span className="text-4xl font-black font-mono tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                       {Math.round(liveFg)}
                   </span>
                   <span className="absolute top-0 -right-4 text-[10px] font-bold text-slate-500">/100</span>
               </div>
           </div>

           {/* Footer Labels - Minimalist */}
           <div className="w-full flex justify-between px-4 mt-auto border-t border-white/5 pt-3">
              <div className="flex flex-col items-start">
                  <span className="text-[7px] font-black text-rose-500 uppercase tracking-widest opacity-70">Fear</span>
                  <div className="w-8 h-0.5 bg-rose-500/20 rounded-full mt-1">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: liveFg < 50 ? `${(50-liveFg)*2}%` : '0%' }}></div>
                  </div>
              </div>
              
              <div className="flex flex-col items-end">
                  <span className="text-[7px] font-black text-emerald-500 uppercase tracking-widest opacity-70">Greed</span>
                  <div className="w-8 h-0.5 bg-emerald-500/20 rounded-full mt-1">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: liveFg > 50 ? `${(liveFg-50)*2}%` : '0%' }}></div>
                  </div>
              </div>
           </div>
        </div>
      </HeaderCard>

      {/* 4. AI Sentiment Score: Neural Core with Time/Date & Relocated Active Badge */}
      <HeaderCard glowColor="#D4AF37">
        <div className="relative z-10 flex flex-col h-full justify-between">
           
           {/* Header: Title Only */}
           <div className="flex items-center gap-2 mb-2 border-b border-white/5 pb-2">
              <div className="p-1.5 rounded-md bg-gold/10 border border-gold/20 shadow-[0_0_15px_rgba(212,175,55,0.15)] shrink-0">
                 <Cpu className="w-3.5 h-3.5 text-gold animate-pulse" />
              </div>
              <h2 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.25em] whitespace-nowrap">{t.aiSentimentScore}</h2>
           </div>

           {/* Main Body */}
           <div className="flex-1 flex flex-col items-center justify-center relative py-1">
              
              {/* Active Badge - Moved Right Above Indicator */}
              <div className="mb-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></div>
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute"></div>
                 <span className="text-[8px] font-black text-emerald-400 uppercase tracking-[0.2em] ml-1">System Active</span>
              </div>

              {/* Complex Viz: Enhanced Complex Ring System */}
              <div className="relative w-32 h-32 flex items-center justify-center">
                 {/* Complex SVG Visualization */}
                 <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full animate-[spin_30s_linear_infinite]">
                    {/* Outer Dashed Ring */}
                    <circle cx="50" cy="50" r="48" fill="none" stroke="#334155" strokeWidth="0.5" strokeDasharray="4 2" opacity="0.5" />
                    {/* Inner Gold Arc */}
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#D4AF37" strokeWidth="1" strokeDasharray="60 190" strokeLinecap="round" opacity="0.8" />
                 </svg>
                 
                 <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full animate-[spin_20s_linear_infinite_reverse]">
                     <circle cx="50" cy="50" r="38" fill="none" stroke="#D4AF37" strokeWidth="0.5" strokeDasharray="1 5" opacity="0.3" />
                 </svg>

                 <div className="absolute inset-6 rounded-full bg-gold/5 blur-xl animate-pulse"></div>
                 
                 <div className="absolute flex flex-col items-center z-10">
                    <span className="text-5xl font-black font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-gold to-amber-600 drop-shadow-2xl tabular-nums">
                       {liveScore.toFixed(0)}
                    </span>
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] mt-[-2px]">Score</span>
                 </div>
              </div>

              {/* Real-time Clock & Date Display - Centered Below */}
              <div className="mt-3 flex flex-col items-center gap-0.5">
                 <div className="flex items-center gap-2 text-xs font-black font-mono text-white leading-none tracking-widest drop-shadow-md">
                    <span className="text-gold animate-pulse">{now.toLocaleTimeString([], {hour12: false})}</span>
                 </div>
                 <span className="text-[8px] font-bold text-slate-600 uppercase tracking-[0.25em]">
                    {now.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}
                 </span>
              </div>
           </div>

           {/* Footer: Neural Weights */}
           <div className="border-t border-white/5 pt-2 flex justify-between items-center mt-auto">
              <div className="flex flex-col">
                  <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest italic flex items-center gap-1.5">
                     <Network size={8} /> Neural Weights
                  </span>
                  <span className="text-[7px] font-bold text-emerald-500/80 uppercase tracking-wider animate-pulse">Processing Live Data</span>
              </div>
              <div className="flex gap-0.5 items-end h-4">
                 {[1,2,3,4,5,6,7,8].map(i => (
                    <div 
                      key={i} 
                      className="w-1 bg-gold rounded-full animate-pulse" 
                      style={{ 
                          animationDelay: `${i * 0.1}s`, 
                          height: `${20 + Math.random() * 80}%`,
                          opacity: 0.3 + Math.random() * 0.7
                      }} 
                    />
                 ))}
              </div>
           </div>
        </div>
      </HeaderCard>

    </div>
  );
};

export default MarketOverviewHeader;
