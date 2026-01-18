
import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

export function MarketCard({ title, value, change }: any) {
  const [displayValue, setDisplayValue] = useState(value);
  const [displayChange, setDisplayChange] = useState(change);
  const [chartData, setChartData] = useState<any[]>([]);

  // Initialize Data
  useEffect(() => {
    setDisplayValue(value);
    setDisplayChange(change);
    
    const isUp = change >= 0;
    const initialData = Array.from({ length: 20 }, (_, i) => ({
      val: 50 + (Math.random() * 20) + (isUp ? i : -i)
    }));
    setChartData(initialData);
  }, [value, change]);

  // Live Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      // Update Chart
      setChartData(prev => {
        if (prev.length === 0) return prev;
        const last = prev[prev.length - 1].val;
        const trend = displayChange >= 0 ? 1 : -1;
        const next = Math.max(10, last + (Math.random() - 0.5) * 15 + trend * 0.5);
        return [...prev.slice(1), { val: next }];
      });

      // Jitter Value (Handle both number and string formats like "$2.4T")
      setDisplayValue((prev: any) => {
        if (typeof prev === 'number') return prev * (1 + (Math.random() - 0.5) * 0.001);
        if (typeof prev === 'string') {
           const match = prev.match(/([^\d\.]*)([\d,\.]+)([^\d\.]*)/);
           if (match) {
              const prefix = match[1] || '';
              const numStr = match[2];
              const suffix = match[3] || '';
              const num = parseFloat(numStr.replace(/,/g, ''));
              if (!isNaN(num)) {
                 const newNum = num * (1 + (Math.random() - 0.5) * 0.001);
                 // Preserve decimal precision
                 const decimals = numStr.includes('.') ? numStr.split('.')[1].length : 0;
                 return `${prefix}${newNum.toFixed(decimals)}${suffix}`;
              }
           }
        }
        return prev;
      });

      // Jitter Change %
      setDisplayChange((prev: number) => {
         return prev + (Math.random() - 0.5) * 0.05;
      });

    }, 800);

    return () => clearInterval(interval);
  }, []);

  const isUp = displayChange >= 0;

  return (
    <div className="cyber-card rounded-[2.5rem] p-7 text-start group reveal-anim relative overflow-hidden bg-[#020617] border border-white/5 hover:border-white/10 transition-colors">
      {/* Background Glow */}
      <div className={`absolute -top-12 -right-12 w-48 h-48 blur-[80px] opacity-10 pointer-events-none transition-all duration-1000 group-hover:opacity-30 ${isUp ? 'bg-[#10B981]' : 'bg-[#F43F5E]'}`}></div>
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1.5">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic opacity-70 group-hover:text-white transition-all">
              {title}
            </p>
            <div className={`h-0.5 w-6 rounded-full transition-all duration-700 group-hover:w-12 ${isUp ? 'bg-emerald-500/50' : 'bg-rose-500/50'}`}></div>
          </div>
          <div className={`px-3 py-1 rounded-xl text-[9px] font-black font-mono shadow-xl border backdrop-blur-md transition-transform group-hover:scale-110 ${isUp ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-rose-500/10 text-rose-400 border-rose-500/30"}`}>
            {isUp ? "▲" : "▼"} {Math.abs(displayChange).toFixed(2)}%
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center mb-6">
          <p className={`text-3xl font-black font-mono tracking-tighter leading-none transition-all duration-300 ${isUp ? "text-emerald-400" : "text-rose-400"}`} style={{ filter: isUp ? 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.3))' : 'drop-shadow(0 0 10px rgba(244, 63, 94, 0.3))' }}>
            {typeof displayValue === 'number' ? displayValue.toLocaleString() : displayValue}
          </p>
        </div>

        <div className="h-14 w-full opacity-40 group-hover:opacity-100 transition-all duration-700 scale-[0.98] group-hover:scale-100 mix-blend-screen">
          <ResponsiveContainer width="100%" height="100%" minHeight={55} minWidth={0}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isUp ? "#10B981" : "#F43F5E"} stopOpacity={0.6}/>
                  <stop offset="95%" stopColor={isUp ? "#10B981" : "#F43F5E"} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="val" 
                stroke={isUp ? "#10B981" : "#F43F5E"} 
                strokeWidth={2} 
                fill={`url(#grad-${title})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export function SignalBadge({ signal }: { signal: string }) {
  const map: Record<string, string> = {
    BUY: "text-emerald-400 text-glow-bull",
    'STRONG BUY': "text-emerald-400 text-glow-bull scale-110",
    SELL: "text-rose-400 text-glow-bear",
    'STRONG SELL': "text-rose-400 text-glow-bear scale-110",
    WAIT: "text-amber-400 text-glow-gold",
  };

  const s = signal.toUpperCase();
  const signalBase = s.includes('STRONG BUY') ? 'STRONG BUY' :
                     s.includes('STRONG SELL') ? 'STRONG SELL' :
                     s.includes('BUY') ? 'BUY' : 
                     s.includes('SELL') ? 'SELL' : 'WAIT';

  const glowColor = signalBase.includes('BUY') ? 'rgba(16, 185, 129, 0.4)' : 
                    signalBase.includes('SELL') ? 'rgba(244, 63, 94, 0.4)' : 
                    'rgba(251, 191, 36, 0.4)';

  return (
    <div 
      className="px-16 py-8 rounded-[3rem] border-2 transition-all duration-700 shadow-2xl bg-black/60 backdrop-blur-3xl reveal-anim"
      style={{ borderColor: glowColor, boxShadow: `0 20px 60px ${glowColor.replace('0.4', '0.1')}` }}
    >
      <span className={`uppercase text-4xl md:text-6xl font-black tracking-[0.4em] italic leading-none ${map[signalBase] || "text-amber-400"}`}>
        {signal}
      </span>
    </div>
  );
}
