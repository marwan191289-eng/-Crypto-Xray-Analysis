
import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Layers, Activity, ArrowDown, ArrowUp, Zap, Scan, Maximize2 } from 'lucide-react';

interface DepthChartProps {
  price: number;
  t: any;
}

const DepthChart: React.FC<DepthChartProps> = ({ price, t }) => {
  const [data, setData] = useState<any[]>([]);
  const [walls, setWalls] = useState<{ bid: number, ask: number }>({ bid: 0, ask: 0 });
  const [metrics, setMetrics] = useState({ buyVol: 0, sellVol: 0 });

  useEffect(() => {
    const generateDepth = () => {
      const bids = [];
      const asks = [];
      let accBid = 0;
      let accAsk = 0;
      
      const range = price * 0.05; // 5% range
      const step = range / 40;

      // Wall Simulation indices
      const bidWallIdx = Math.floor(Math.random() * 15) + 5;
      const askWallIdx = Math.floor(Math.random() * 15) + 5;

      // Generate Bids (Down from current)
      for (let i = 0; i < 40; i++) {
        const p = price - (i * step);
        let vol = Math.random() * 10 + 5;
        if (i === bidWallIdx) vol += 300; // Large Wall
        accBid += vol;
        bids.push({ price: p, bidVolume: accBid, askVolume: null });
      }
      
      // Generate Asks (Up from current)
      for (let i = 0; i < 40; i++) {
        const p = price + (i * step);
        let vol = Math.random() * 10 + 5;
        if (i === askWallIdx) vol += 300; // Large Wall
        accAsk += vol;
        asks.push({ price: p, bidVolume: null, askVolume: accAsk });
      }

      // Sort bids for chart (Low Price -> Current Price)
      const sortedBids = bids.reverse(); 
      // Chart Data: [Lowest Bid ... Current ... Highest Ask]
      
      setWalls({
         bid: price - (bidWallIdx * step),
         ask: price + (askWallIdx * step)
      });
      
      setMetrics({
         buyVol: accBid,
         sellVol: accAsk
      });

      setData([...sortedBids, ...asks]);
    };

    generateDepth();
    const interval = setInterval(generateDepth, 2000);
    return () => clearInterval(interval);
  }, [price]);

  const buyRatio = (metrics.buyVol / (metrics.buyVol + metrics.sellVol)) * 100;

  return (
    <div className="cyber-card rounded-[2.5rem] p-8 border border-white/5 h-[700px] flex flex-col relative overflow-hidden group shadow-[0_0_50px_rgba(0,0,0,0.3)]">
      {/* Background FX */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 blur-[100px] rounded-full group-hover:bg-indigo-500/10 transition-all pointer-events-none"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none mix-blend-overlay"></div>
      
      {/* Header */}
      <div className="flex justify-between items-start mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.15)]">
             <Layers className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-[12px] font-black text-white uppercase tracking-[0.2em] drop-shadow-md">{t.orderFlowDensity || "Order Flow Density"}</h3>
            <div className="flex items-center gap-2 mt-1">
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Market Depth</span>
               <div className="w-1 h-1 rounded-full bg-slate-700"></div>
               <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest animate-pulse flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Live
               </span>
            </div>
          </div>
        </div>

        {/* Neon Ratio Bar */}
        <div className="flex flex-col items-end gap-1.5">
           <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Pressure Ratio</span>
           <div className="w-36 h-2 bg-slate-900 rounded-full overflow-hidden flex border border-white/10 shadow-inner">
              <div 
                className="h-full bg-emerald-500 transition-all duration-1000 relative" 
                style={{ width: `${buyRatio}%`, boxShadow: '0 0 10px #10b981' }}
              >
                 <div className="absolute inset-0 bg-white/20"></div>
              </div>
              <div 
                className="h-full bg-rose-500 transition-all duration-1000 flex-1 relative"
                style={{ boxShadow: '0 0 10px #f43f5e' }}
              >
                 <div className="absolute inset-0 bg-white/20"></div>
              </div>
           </div>
        </div>
      </div>
      
      {/* Main Content Grid */}
      <div className="flex-1 flex flex-col min-h-0 relative z-10">
         
         {/* Chart Area */}
         <div className="flex-1 w-full min-h-[300px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  {/* Neon Glow Filters */}
                  <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                    <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.06 0 0 0 0 0.72 0 0 0 0 0.5 0 0 0 1 0" result="glow" />
                    <feMerge>
                      <feMergeNode in="glow" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="glow-red" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                    <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.95 0 0 0 0 0.24 0 0 0 0 0.36 0 0 0 1 0" result="glow" />
                    <feMerge>
                      <feMergeNode in="glow" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>

                  {/* Gradients */}
                  <linearGradient id="depthBids" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="depthAsks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                
                <XAxis 
                  dataKey="price" 
                  stroke="#475569" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => val.toFixed(0)}
                  minTickGap={40}
                />
                <YAxis hide />
                
                <Tooltip 
                  cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1, strokeDasharray: '4 4' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      const isBid = item.bidVolume !== null;
                      return (
                        <div className="bg-slate-900/90 p-4 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] text-[10px] font-mono backdrop-blur-xl border border-white/10 ring-1 ring-white/5">
                          <p className="text-white mb-2 font-black uppercase text-sm border-b border-white/10 pb-2">${item.price.toFixed(2)}</p>
                          <div className={`flex items-center gap-4 font-bold ${isBid ? 'text-emerald-400' : 'text-rose-400'}`}>
                            <span className="uppercase tracking-wider">{isBid ? 'Bid Wall' : 'Ask Wall'}</span>
                            <span className="text-white text-lg drop-shadow-md">{(isBid ? item.bidVolume : item.askVolume).toFixed(2)}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <ReferenceLine x={price} stroke="#6366f1" strokeDasharray="3 3" strokeWidth={2} />
                
                {/* Wall Annotations */}
                <ReferenceLine 
                    x={walls.bid} 
                    stroke="#10b981" 
                    strokeDasharray="2 2" 
                    label={{ position: 'insideTopLeft', value: 'BUY WALL', fill: '#10b981', fontSize: 9, fontWeight: 900, dy: -10 }} 
                />
                <ReferenceLine 
                    x={walls.ask} 
                    stroke="#f43f5e" 
                    strokeDasharray="2 2" 
                    label={{ position: 'insideTopRight', value: 'SELL WALL', fill: '#f43f5e', fontSize: 9, fontWeight: 900, dy: -10 }} 
                />

                <Area 
                  type="step" 
                  dataKey="bidVolume" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fill="url(#depthBids)" 
                  animationDuration={1000}
                  filter="url(#glow-green)"
                />
                <Area 
                  type="step" 
                  dataKey="askVolume" 
                  stroke="#f43f5e" 
                  strokeWidth={3}
                  fill="url(#depthAsks)" 
                  animationDuration={1000}
                  filter="url(#glow-red)"
                />
              </AreaChart>
            </ResponsiveContainer>
            
            {/* Mid Price Label - Floating Neon Pill */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 mt-2 px-4 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.3)] group-hover:scale-110 transition-transform">
               <span className="text-[12px] font-black text-indigo-300 font-mono tracking-tighter">${price.toFixed(2)}</span>
            </div>
         </div>

         {/* Metrics Footer */}
         <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/5">
            <div className="bg-emerald-500/5 rounded-2xl p-5 border border-emerald-500/10 hover:border-emerald-500/30 transition-all hover:bg-emerald-500/10">
               <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest drop-shadow-sm">Bid Liquidity</span>
                  <ArrowUp className="w-3 h-3 text-emerald-500" />
               </div>
               <span className="text-xl font-mono font-black text-white tracking-tighter">{metrics.buyVol.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
            
            <div className="bg-rose-500/5 rounded-2xl p-5 border border-rose-500/10 hover:border-rose-500/30 transition-all hover:bg-rose-500/10">
               <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest drop-shadow-sm">Ask Liquidity</span>
                  <ArrowDown className="w-3 h-3 text-rose-500" />
               </div>
               <span className="text-xl font-mono font-black text-white tracking-tighter">{metrics.sellVol.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
         </div>

         {/* Wall Detector Alert */}
         <div className="mt-4 bg-slate-900/50 rounded-2xl p-3 flex items-center justify-center gap-3 border border-white/5 shadow-inner">
            <Scan className="w-4 h-4 text-indigo-400 animate-spin-slow" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
               Major Resistance at <span className="text-white bg-white/10 px-1.5 py-0.5 rounded font-mono">${walls.ask.toFixed(2)}</span>
            </span>
         </div>
      </div>
    </div>
  );
};

export default DepthChart;
