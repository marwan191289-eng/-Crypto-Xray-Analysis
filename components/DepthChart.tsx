
import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from 'recharts';
import { Layers, Activity, ArrowDown, ArrowUp, Shield, Zap, Maximize2, Crosshair, BarChart2, Scan } from 'lucide-react';

interface DepthChartProps {
  price: number;
  t: any;
}

const DepthChart: React.FC<DepthChartProps> = ({ price, t }) => {
  const [data, setData] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    bidWall: 0,
    askWall: 0,
    bidStrength: 50,
    askStrength: 50,
    spread: 0.05
  });

  // Real-time Liquidity Simulation Engine
  useEffect(() => {
    const generateDepth = () => {
      const points: any[] = [];
      const steps = 60; // Higher resolution
      const range = price * 0.04; // 4% depth range
      
      let cumBid = 0;
      let cumAsk = 0;
      
      // Random "Whale" Walls
      const buyWallIdx = Math.floor(Math.random() * 20) + 5;
      const sellWallIdx = Math.floor(Math.random() * 20) + 5;

      // Generate Bids (Left side, price descending from mid)
      const bids = [];
      for (let i = 0; i < steps; i++) {
        const p = price - (range * ((i + 1) / steps));
        let vol = Math.random() * 15 + 5;
        
        // Simulate Wall
        if (Math.abs(i - buyWallIdx) < 3) vol *= 8; // Whale Wall
        
        cumBid += vol;
        bids.unshift({ price: p, bids: cumBid, asks: null, type: 'bid' });
      }

      // Generate Asks (Right side, price ascending from mid)
      const asks = [];
      for (let i = 0; i < steps; i++) {
        const p = price + (range * ((i + 1) / steps));
        let vol = Math.random() * 15 + 5;
        
        // Simulate Wall
        if (Math.abs(i - sellWallIdx) < 3) vol *= 8; // Whale Wall
        
        cumAsk += vol;
        asks.push({ price: p, bids: null, asks: cumAsk, type: 'ask' });
      }

      const totalVol = cumBid + cumAsk;
      
      setMetrics({
        bidWall: bids[bids.length - 1 - buyWallIdx]?.price || price * 0.98,
        askWall: asks[sellWallIdx]?.price || price * 1.02,
        bidStrength: (cumBid / totalVol) * 100,
        askStrength: (cumAsk / totalVol) * 100,
        spread: (Math.random() * 0.05) + 0.01
      });

      setData([...bids, ...asks]);
    };

    generateDepth();
    const interval = setInterval(generateDepth, 1500); // Live refresh rate
    return () => clearInterval(interval);
  }, [price]);

  return (
    <div className="cyber-card rounded-[3.5rem] p-10 border border-white/5 shadow-3xl relative overflow-hidden group h-[500px] flex flex-col">
      {/* Background FX */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 blur-[100px] rounded-full group-hover:bg-indigo-500/10 transition-all pointer-events-none"></div>
      
      {/* Header */}
      <div className="flex justify-between items-start mb-8 relative z-10">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.15)]">
             <Layers className="w-6 h-6 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">{t.orderFlowDensity || "Order Flow Density"}</h3>
            <div className="flex items-center gap-3 mt-2">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{t.depth || "Liquidity Depth"}</span>
               <div className="h-px w-6 bg-slate-700"></div>
               <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></div> Live
               </span>
            </div>
          </div>
        </div>

        {/* Live Spread Indicator */}
        <div className="bg-slate-950/50 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/5 flex flex-col items-end">
           <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{t.spread || "Spread"}</span>
           <span className="text-xl font-mono font-black text-white tracking-tighter">{metrics.spread.toFixed(3)}%</span>
        </div>
      </div>
      
      {/* Main Content Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10 min-h-0">
         
         {/* Chart Area */}
         <div className="lg:col-span-3 h-full min-h-[300px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="depthBids" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="depthAsks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                  <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
                  </pattern>
                </defs>
                
                <rect width="100%" height="100%" fill="url(#gridPattern)" />
                
                <XAxis 
                  dataKey="price" 
                  stroke="#475569" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => val.toFixed(0)}
                  minTickGap={30}
                />
                <YAxis hide />
                
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      const isBid = item.bids !== null;
                      return (
                        <div className="bg-slate-900/90 p-4 rounded-2xl shadow-3xl text-[10px] font-mono backdrop-blur-xl border border-white/10">
                          <p className="text-white mb-2 font-black uppercase text-lg">${item.price.toFixed(2)}</p>
                          <div className={`flex items-center gap-3 font-bold ${isBid ? 'text-emerald-400' : 'text-rose-400'}`}>
                            <span>{isBid ? 'CUM. BID' : 'CUM. ASK'}</span>
                            <span className="text-white">{(isBid ? item.bids : item.asks).toFixed(2)}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <ReferenceLine x={price} stroke="#6366f1" strokeDasharray="3 3" />
                
                {/* Whale Walls Markers */}
                <ReferenceLine x={metrics.bidWall} stroke="#10b981" strokeDasharray="2 2" strokeOpacity={0.5} label={{ position: 'top', value: 'BUY WALL', fill: '#10b981', fontSize: 9, fontWeight: 800 }} />
                <ReferenceLine x={metrics.askWall} stroke="#f43f5e" strokeDasharray="2 2" strokeOpacity={0.5} label={{ position: 'top', value: 'SELL WALL', fill: '#f43f5e', fontSize: 9, fontWeight: 800 }} />

                <Area 
                  type="stepAfter" 
                  dataKey="bids" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  fill="url(#depthBids)" 
                  animationDuration={1000}
                />
                <Area 
                  type="stepAfter" 
                  dataKey="asks" 
                  stroke="#f43f5e" 
                  strokeWidth={2}
                  fill="url(#depthAsks)" 
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
            
            {/* Mid Price Label */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-2 bg-indigo-500/20 backdrop-blur-md border border-indigo-500/30 px-3 py-1 rounded-lg text-[10px] font-black text-indigo-300 shadow-lg">
               ${price.toFixed(2)}
            </div>
         </div>

         {/* Metrics Sidebar */}
         <div className="flex flex-col gap-6 justify-center">
            {/* Ask Dominance */}
            <div className="bg-slate-950/40 p-5 rounded-3xl border border-white/5 relative overflow-hidden group/metric">
               <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Ask Strength</span>
                  <ArrowDown className="w-4 h-4 text-rose-500" />
               </div>
               <div className="text-2xl font-black font-mono text-white tracking-tighter mb-2">{metrics.askStrength.toFixed(1)}%</div>
               <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 transition-all duration-700" style={{ width: `${metrics.askStrength}%` }}></div>
               </div>
            </div>

            {/* Bid Dominance */}
            <div className="bg-slate-900/40 p-5 rounded-3xl border border-white/5 relative overflow-hidden group/metric">
               <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Bid Strength</span>
                  <ArrowUp className="w-4 h-4 text-emerald-500" />
               </div>
               <div className="text-2xl font-black font-mono text-white tracking-tighter mb-2">{metrics.bidStrength.toFixed(1)}%</div>
               <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${metrics.bidStrength}%` }}></div>
               </div>
            </div>

            {/* Wall Detector */}
            <div className="mt-auto bg-indigo-500/5 p-5 rounded-3xl border border-indigo-500/10 text-center relative overflow-hidden">
               <div className="absolute inset-0 bg-indigo-500/5 animate-pulse"></div>
               <div className="relative z-10">
                  <div className="flex items-center justify-center gap-2 mb-2">
                     <Scan className="w-4 h-4 text-indigo-400" />
                     <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Wall Detector</span>
                  </div>
                  <div className="text-[9px] text-slate-500 font-bold leading-relaxed uppercase">
                     {metrics.bidStrength > metrics.askStrength ? "Buy Wall Detected" : "Sell Wall Detected"}
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default DepthChart;
