
import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';

interface DepthChartProps {
  price: number;
  t: any;
}

const DepthChart: React.FC<DepthChartProps> = ({ price, t }) => {
  const data = useMemo(() => {
    const points: any[] = [];
    const steps = 30;
    const range = price * 0.02; 

    let bidVolume = 0;
    for (let i = 0; i < steps; i++) {
      const p = price - (range * (i / steps));
      bidVolume += Math.random() * 8 + (i * 0.5); 
      points.unshift({ price: parseFloat(p.toFixed(2)), bids: bidVolume, asks: null });
    }

    let askVolume = 0;
    for (let i = 0; i < steps; i++) {
      const p = price + (range * (i / steps));
      askVolume += Math.random() * 8 + (i * 0.5);
      points.push({ price: parseFloat(p.toFixed(2)), bids: null, asks: askVolume });
    }

    return points;
  }, [price]);

  return (
    <div className="neu-card border border-white/5 rounded-[2.5rem] p-8 shadow-2xl w-full h-[350px]">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <div className="w-1.5 h-4 bg-success rounded-full shadow-[0_0_10px_#22c55e]" />
            <div className="w-1.5 h-4 bg-danger rounded-full shadow-[0_0_10px_#ef4444]" />
          </div>
          <h3 className="font-sans font-black text-text-bright text-sm uppercase tracking-widest">{t.depth}</h3>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono font-bold">
          <div className="flex items-center gap-1.5 text-success">
            <div className="w-2 h-2 rounded-full bg-success/20 border border-success" /> {t.lang === 'ar' ? 'طلبات شراء' : 'BIDS'}
          </div>
          <div className="flex items-center gap-1.5 text-danger">
            <div className="w-2 h-2 rounded-full bg-danger/20 border border-danger" /> {t.lang === 'ar' ? 'طلبات بيع' : 'ASKS'}
          </div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="depthBids" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22C55E" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="depthAsks" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} opacity={0.2} />
          <XAxis 
            dataKey="price" 
            stroke="#9CA3AF"
            fontSize={9}
            tickLine={false}
            axisLine={false}
            domain={['dataMin', 'dataMax']}
            tickFormatter={(val) => `$${val}`}
          />
          <YAxis 
            orientation={t.lang === 'ar' ? 'left' : 'right'} 
            stroke="#9CA3AF" 
            fontSize={9} 
            tickLine={false} 
            axisLine={false} 
          />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="glass-overlay p-4 rounded-2xl shadow-3xl text-[10px] font-mono backdrop-blur-3xl border-white/10 text-start">
                    <p className="text-white mb-2 border-b border-white/10 pb-2 font-black uppercase">{t.price}: ${item.price}</p>
                    {item.bids !== null && (
                      <div className="flex justify-between gap-6">
                        <span className="text-muted font-bold">{t.lang === 'ar' ? 'تراكمي شراء' : 'CUMULATIVE BIDS'}:</span>
                        <span className="text-success font-black">{item.bids.toFixed(2)}</span>
                      </div>
                    )}
                    {item.asks !== null && (
                      <div className="flex justify-between gap-6">
                        <span className="text-muted font-bold">{t.lang === 'ar' ? 'تراكمي بيع' : 'CUMULATIVE ASKS'}:</span>
                        <span className="text-danger font-black">{item.asks.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          
          <ReferenceLine 
            x={price} 
            stroke="#3B82F6" 
            strokeDasharray="4 4" 
            label={{ position: 'top', value: t.lang === 'ar' ? 'السعر' : 'MID', fill: '#3B82F6', fontSize: 10, fontWeight: '800' }} 
          />

          <Area 
            type="stepAfter" 
            dataKey="bids" 
            stroke="#22C55E" 
            fillOpacity={1} 
            fill="url(#depthBids)" 
            strokeWidth={2}
            connectNulls
            isAnimationActive={true}
          />
          <Area 
            type="stepAfter" 
            dataKey="asks" 
            stroke="#EF4444" 
            fillOpacity={1} 
            fill="url(#depthAsks)" 
            strokeWidth={2}
            connectNulls
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DepthChart;
