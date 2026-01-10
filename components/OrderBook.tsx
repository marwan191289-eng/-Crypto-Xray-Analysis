
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { BarChart3, History, ArrowUp, ArrowDown, Minus, Activity, Layers, Disc, Zap } from 'lucide-react';

interface OrderBookProps {
  price: number;
  symbol: string;
  t: any;
}

interface OrderLevel {
  price: number;
  size: number;
  total: number; // Cumulative
  depth: number; // Percentage for bar width
  isWhale: boolean;
  flash: 'green' | 'red' | null;
}

interface Trade {
  id: string;
  price: number;
  size: number;
  side: 'buy' | 'sell';
  time: string;
}

const OrderBook: React.FC<OrderBookProps> = ({ price, symbol, t }) => {
  const [asks, setAsks] = useState<OrderLevel[]>([]);
  const [bids, setBids] = useState<OrderLevel[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [spread, setSpread] = useState({ val: 0, pct: 0 });
  const [lastPrice, setLastPrice] = useState(price);
  
  // -- Simulation Engine --
  useEffect(() => {
    // 1. Generate Initial Book
    const generateBook = () => {
      const askLevels: OrderLevel[] = [];
      const bidLevels: OrderLevel[] = [];
      let cumAsk = 0;
      let cumBid = 0;
      
      const spreadGap = price * 0.0005; // 0.05% spread
      
      // Generate Asks (Lowest to Highest)
      for (let i = 0; i < 15; i++) {
        const p = price + spreadGap + (price * 0.0003 * i);
        const s = Math.random() * 5 + (Math.random() > 0.9 ? 50 : 0); // Occasional whale
        cumAsk += s;
        askLevels.push({ price: p, size: s, total: cumAsk, depth: 0, isWhale: s > 40, flash: null });
      }

      // Generate Bids (Highest to Lowest)
      for (let i = 0; i < 15; i++) {
        const p = price - spreadGap - (price * 0.0003 * i);
        const s = Math.random() * 5 + (Math.random() > 0.9 ? 50 : 0); // Occasional whale
        cumBid += s;
        bidLevels.push({ price: p, size: s, total: cumBid, depth: 0, isWhale: s > 40, flash: null });
      }

      // Normalize Depth
      const maxVol = Math.max(cumAsk, cumBid);
      askLevels.forEach(l => l.depth = (l.total / maxVol) * 100);
      bidLevels.forEach(l => l.depth = (l.total / maxVol) * 100);

      // Asks need to be reversed for display (Highest price at top, Best/Lowest Ask at bottom)
      setAsks(askLevels.reverse());
      setBids(bidLevels);
      
      const bestAsk = askLevels[askLevels.length-1]?.price || price;
      const bestBid = bidLevels[0]?.price || price;
      setSpread({ val: bestAsk - bestBid, pct: ((bestAsk - bestBid) / price) * 100 });
    };

    generateBook();

    // 2. Live Updates Loop
    const interval = setInterval(() => {
      // Simulate Price Impact
      const isUp = Math.random() > 0.5;
      const tradePrice = price * (1 + (Math.random() - 0.5) * 0.0002);
      
      // Add Trade
      if (Math.random() > 0.3) {
        const newTrade: Trade = {
          id: Math.random().toString(36),
          price: tradePrice,
          size: Math.random() * 2 + 0.1,
          side: isUp ? 'buy' : 'sell',
          time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };
        setTrades(prev => [newTrade, ...prev].slice(0, 15));
      }

      // Update Book (Simulate liquidity shifting)
      setAsks(prev => prev.map(level => {
        const change = Math.random() > 0.7;
        if (!change) return { ...level, flash: null }; // Clear flash
        const newSize = Math.max(0.1, level.size + (Math.random() - 0.5) * 5);
        return { 
          ...level, 
          size: newSize, 
          isWhale: newSize > 40,
          flash: newSize > level.size ? 'red' : null 
        };
      }));

      setBids(prev => prev.map(level => {
        const change = Math.random() > 0.7;
        if (!change) return { ...level, flash: null }; // Clear flash
        const newSize = Math.max(0.1, level.size + (Math.random() - 0.5) * 5);
        return { 
          ...level, 
          size: newSize, 
          isWhale: newSize > 40,
          flash: newSize > level.size ? 'green' : null 
        };
      }));

    }, 800);

    return () => clearInterval(interval);
  }, [price]);

  return (
    <div className="cyber-card rounded-[2.5rem] p-8 border border-white/5 h-[700px] flex flex-col relative overflow-hidden group shadow-[0_0_50px_rgba(0,0,0,0.3)]">
      {/* Neon Background Ambience */}
      <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000">
        <Layers className="w-64 h-64 text-indigo-400" />
      </div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none mix-blend-overlay"></div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6 relative z-10">
        <div className="flex items-center gap-4">
           <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
              <BarChart3 className="w-5 h-5 text-indigo-400 animate-pulse" />
           </div>
           <div>
              <h3 className="text-[12px] font-black text-white uppercase tracking-[0.2em] drop-shadow-md">{t.orderBook}</h3>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                 <span className="relative flex h-2 w-2">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                 </span>
                 L2 Data Stream
              </span>
           </div>
        </div>
        
        {/* Stats */}
        <div className="flex gap-4">
           <div className="text-right">
              <span className="text-[8px] font-bold text-slate-500 uppercase block tracking-widest">24h Vol</span>
              <span className="text-[10px] font-mono font-black text-white drop-shadow-sm">{symbol === 'BTC' ? '42.5K' : '1.2M'}</span>
           </div>
        </div>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-3 text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3 px-3 opacity-80">
         <span>Price (USDT)</span>
         <span className="text-right">Amount ({symbol})</span>
         <span className="text-right">Total</span>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 relative z-10">
         
         {/* ASKS (Sells) - Red */}
         <div className="flex-1 flex flex-col justify-end overflow-hidden gap-0.5 pb-2">
            {asks.slice(-12).map((ask, i) => (
               <div key={i} className={`relative grid grid-cols-3 text-[10px] font-mono py-1 px-3 hover:bg-rose-500/10 transition-colors cursor-crosshair group/row rounded-sm ${ask.flash === 'red' ? 'bg-rose-500/20' : ''}`}>
                  {/* Depth Bar */}
                  <div 
                    className="absolute top-0 bottom-0 right-0 bg-gradient-to-l from-rose-500/20 to-transparent transition-all duration-300" 
                    style={{ width: `${ask.depth}%` }}
                  ></div>
                  
                  {/* Data */}
                  <span className={`relative z-10 font-bold ${ask.flash === 'red' ? 'text-white' : 'text-rose-400'} group-hover/row:text-white transition-colors`}>
                     {ask.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span className={`relative z-10 text-right ${ask.isWhale ? 'text-amber-300 font-black drop-shadow-[0_0_5px_rgba(252,211,77,0.5)]' : 'text-slate-300'}`}>
                     {ask.size.toFixed(3)} {ask.isWhale && '🐋'}
                  </span>
                  <span className="relative z-10 text-right text-slate-500 group-hover/row:text-slate-300">
                     {ask.total.toFixed(2)}
                  </span>
               </div>
            ))}
         </div>

         {/* NEON SPREAD INDICATOR */}
         <div className="my-2 py-4 bg-slate-900/80 backdrop-blur-xl border-y border-indigo-500/20 flex justify-between items-center px-6 relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] z-20 group/spread">
            <div className="absolute inset-0 bg-indigo-500/5 animate-pulse"></div>
            
            <div className="flex flex-col relative z-10">
               <span className={`text-2xl font-black font-mono tracking-tighter flex items-center gap-3 drop-shadow-md transition-colors duration-300 ${price >= lastPrice ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  <div className={`p-1 rounded-full ${price >= lastPrice ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                     {price >= lastPrice ? <ArrowUp size={14} strokeWidth={3} /> : <ArrowDown size={14} strokeWidth={3} />}
                  </div>
               </span>
               <span className="text-[9px] font-bold text-indigo-300 uppercase tracking-[0.2em] flex items-center gap-1.5 opacity-80">
                  <Zap size={10} className="text-amber-400" /> Mark Price
               </span>
            </div>
            
            <div className="text-right relative z-10">
               <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Spread</span>
               <span className="text-xs font-mono font-black text-white bg-slate-800 px-2 py-1 rounded border border-white/10 group-hover/spread:border-indigo-500/50 transition-colors">
                  {spread.pct.toFixed(3)}%
               </span>
            </div>
         </div>

         {/* BIDS (Buys) - Green */}
         <div className="flex-1 flex flex-col justify-start overflow-hidden gap-0.5 pt-2">
            {bids.slice(0, 12).map((bid, i) => (
               <div key={i} className={`relative grid grid-cols-3 text-[10px] font-mono py-1 px-3 hover:bg-emerald-500/10 transition-colors cursor-crosshair group/row rounded-sm ${bid.flash === 'green' ? 'bg-emerald-500/20' : ''}`}>
                  {/* Depth Bar */}
                  <div 
                    className="absolute top-0 bottom-0 right-0 bg-gradient-to-l from-emerald-500/20 to-transparent transition-all duration-300" 
                    style={{ width: `${bid.depth}%` }}
                  ></div>
                  
                  {/* Data */}
                  <span className={`relative z-10 font-bold ${bid.flash === 'green' ? 'text-white' : 'text-emerald-400'} group-hover/row:text-white transition-colors`}>
                     {bid.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span className={`relative z-10 text-right ${bid.isWhale ? 'text-amber-300 font-black drop-shadow-[0_0_5px_rgba(252,211,77,0.5)]' : 'text-slate-300'}`}>
                     {bid.size.toFixed(3)} {bid.isWhale && '🐋'}
                  </span>
                  <span className="relative z-10 text-right text-slate-500 group-hover/row:text-slate-300">
                     {bid.total.toFixed(2)}
                  </span>
               </div>
            ))}
         </div>

      </div>

      {/* Recent Trades Footer - Styled as Tape */}
      <div className="mt-4 pt-4 border-t border-white/5 relative bg-black/20 -mx-8 px-8 pb-4 -mb-8">
         <div className="flex items-center gap-2 mb-3 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
            <History className="w-3 h-3 text-slate-400" /> Recent Executions
         </div>
         <div className="space-y-1 h-24 overflow-hidden relative mask-gradient-b">
            {trades.map((t) => (
               <div key={t.id} className="grid grid-cols-3 text-[9px] font-mono animate-[slideIn_0.2s_ease-out] hover:bg-white/5 px-2 py-0.5 rounded">
                  <span className={t.side === 'buy' ? 'text-emerald-400' : 'text-rose-400'}>{t.price.toLocaleString()}</span>
                  <span className="text-right text-slate-300">{t.size.toFixed(4)}</span>
                  <span className="text-right text-slate-600">{t.time}</span>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default OrderBook;
