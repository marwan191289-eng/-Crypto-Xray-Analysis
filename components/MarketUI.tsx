
import React, { useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

export function MarketCard({ title, value, change }: any) {
  const isUp = change >= 0;

  const sparkData = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      val: 50 + (Math.random() * 30) + (isUp ? i * 2 : -i * 2)
    }));
  }, [isUp]);

  return (
    <div className="cyber-card rounded-[2.5rem] p-7 text-start group reveal-anim">
      {/* Background Glow */}
      <div className={`absolute -top-12 -right-12 w-48 h-48 blur-[80px] opacity-10 pointer-events-none transition-all duration-1000 group-hover:opacity-40 ${isUp ? 'bg-success' : 'bg-danger'}`}></div>
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1.5">
            <p className="text-[10px] font-black text-muted uppercase tracking-[0.3em] italic opacity-50 group-hover:text-white transition-all group-hover:opacity-100">
              {title}
            </p>
            <div className="h-0.5 w-6 bg-accent/30 rounded-full group-hover:w-12 transition-all duration-700"></div>
          </div>
          <div className={`px-3 py-1 rounded-xl text-[9px] font-black font-mono shadow-xl border backdrop-blur-md transition-transform group-hover:scale-110 ${isUp ? "bg-success/15 text-success border-success/30" : "bg-danger/15 text-danger border-danger/30"}`}>
            {isUp ? "▲" : "▼"} {Math.abs(change)}%
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center mb-6">
          <p className={`text-3xl font-black font-mono tracking-tighter leading-none transition-all duration-500 group-hover:scale-105 ${isUp ? "text-success" : "text-danger"}`} style={{ filter: isUp ? 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.3))' : 'drop-shadow(0 0 10px rgba(244, 63, 94, 0.3))' }}>
            {value}
          </p>
        </div>

        <div className="h-14 w-full opacity-40 group-hover:opacity-100 transition-all duration-700 scale-[0.98] group-hover:scale-100">
          <ResponsiveContainer width="100%" height="100%" minHeight={55} minWidth={0}>
            <AreaChart data={sparkData}>
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
                strokeWidth={2.5} 
                fill={`url(#grad-${title})`}
                isAnimationActive={true}
                animationDuration={1500}
                animationBegin={Math.random() * 500}
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
    BUY: "text-success text-glow-bull",
    'STRONG BUY': "text-success text-glow-bull scale-110",
    SELL: "text-danger text-glow-bear",
    'STRONG SELL': "text-danger text-glow-bear scale-110",
    WAIT: "text-gold text-glow-gold",
  };

  const s = signal.toUpperCase();
  const signalBase = s.includes('STRONG BUY') ? 'STRONG BUY' :
                     s.includes('STRONG SELL') ? 'STRONG SELL' :
                     s.includes('BUY') ? 'BUY' : 
                     s.includes('SELL') ? 'SELL' : 'WAIT';

  const glowColor = signalBase.includes('BUY') ? 'rgba(16, 185, 129, 0.4)' : 
                    signalBase.includes('SELL') ? 'rgba(244, 63, 94, 0.4)' : 
                    'rgba(212, 175, 55, 0.4)';

  return (
    <div 
      className="px-16 py-8 rounded-[3rem] border-2 transition-all duration-700 shadow-2xl bg-black/60 backdrop-blur-3xl reveal-anim"
      style={{ borderColor: glowColor, boxShadow: `0 20px 60px ${glowColor.replace('0.4', '0.1')}` }}
    >
      <span className={`uppercase text-4xl md:text-6xl font-black tracking-[0.4em] italic leading-none ${map[signalBase] || "text-gold"}`}>
        {signal}
      </span>
    </div>
  );
}
