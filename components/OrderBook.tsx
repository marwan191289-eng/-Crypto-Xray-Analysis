
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { BarChart3, History } from 'lucide-react';

interface OrderBookProps {
  price: number;
  symbol: string;
  t: any;
}

interface OrderEntry {
  price: number;
  amount: number;
  total: number;
  id: string;
  isUpdating?: boolean;
}

interface Trade {
  price: number;
  amount: number;
  time: string;
  side: 'buy' | 'sell';
}

const OrderBook: React.FC<OrderBookProps> = ({ price, symbol, t }) => {
  const [frame, setFrame] = useState(0);
  const [threshold, setThreshold] = useState(0);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const prevPriceRef = useRef(price);
  const [priceChanged, setPriceChanged] = useState(false);

  // Monitor price changes for the central display animation
  useEffect(() => {
    if (price !== prevPriceRef.current) {
      setPriceChanged(true);
      const timer = setTimeout(() => setPriceChanged(false), 300);
      prevPriceRef.current = price;
      return () => clearTimeout(timer);
    }
  }, [price]);

  useEffect(() => {
    let lastTime = 0;
    const animate = (time: number) => {
      if (time - lastTime > 150) {
        setFrame(f => f + 1);
        if (Math.random() > 0.85) {
          const side = Math.random() > 0.5 ? 'buy' : 'sell';
          const tradePrice = price * (1 + (Math.random() - 0.5) * 0.0004);
          const newTrade: Trade = {
            price: tradePrice,
            amount: Math.random() * 5 + 0.1,
            time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            side
          };
          setRecentTrades(prev => [newTrade, ...prev].slice(0, 5));
        }
        lastTime = time;
      }
      requestAnimationFrame(animate);
    };
    const animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [price]);

  const generateLevels = (basePrice: number, isAsk: boolean) => {
    const levels: OrderEntry[] = [];
    let runningTotal = 0;
    for (let i = 1; i <= 8; i++) {
      const step = basePrice * 0.0004 * i;
      const p = isAsk ? basePrice + step : basePrice - step;
      const amountBase = 2 + (Math.random() * 2);
      const wave = Math.sin((frame * 0.1) + (i * 0.8)) * 0.5;
      const amount = Math.max(0.1, amountBase * (1 + wave));
      runningTotal += amount;
      
      // Determine if this row is "pulsing" based on the wave peak
      const isUpdating = Math.abs(wave) > 0.45;

      levels.push({ 
        id: `${isAsk ? 'A' : 'B'}-${i}`, 
        price: p, 
        amount, 
        total: runningTotal,
        isUpdating 
      });
    }
    return isAsk ? levels.reverse() : levels;
  };

  const allAsks = useMemo(() => generateLevels(price, true), [price, frame]);
  const allBids = useMemo(() => generateLevels(price, false), [price, frame]);
  const filteredAsks = useMemo(() => allAsks.filter(a => a.amount >= threshold), [allAsks, threshold]);
  const filteredBids = useMemo(() => allBids.filter(b => b.amount >= threshold), [allBids, threshold]);
  const maxAmount = useMemo(() => Math.max(...allAsks.map(a => a.amount), ...allBids.map(b => b.amount), 1), [allAsks, allBids]);

  const getPriceFormatted = (p: number) => {
    if (p < 0.01) return p.toFixed(8);
    if (p < 1) return p.toFixed(4);
    return p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="neu-card rounded-[2.5rem] p-8 space-y-6 text-start border-white/5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-accent" />
          <h3 className="font-black text-text-bright text-sm uppercase tracking-widest">{t.orderBook}</h3>
        </div>
        <div className="neu-card-inset px-4 py-1.5 rounded-xl border-white/5">
          <select 
            className="bg-transparent text-[9px] text-muted focus:outline-none cursor-pointer font-black uppercase tracking-widest"
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
          >
            <option value="0">{t.lang === 'ar' ? 'الكل' : 'ALL'}</option>
            <option value="2">{t.lang === 'ar' ? '> ٢' : '> 2'} {symbol}</option>
            <option value="4">{t.lang === 'ar' ? '> ٤' : '> 4'} {symbol}</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <div className="grid grid-cols-3 text-[9px] text-muted font-black uppercase mb-4 px-2 tracking-widest opacity-40">
          <span>{t.price}</span>
          <span className="text-end">{t.size}</span>
          <span className="text-end">{t.sum}</span>
        </div>

        {filteredAsks.map((ask) => (
          <div 
            key={ask.id} 
            className={`grid grid-cols-3 items-center py-1.5 px-3 text-[10px] font-mono relative group rounded-lg transition-all duration-300 ${ask.isUpdating ? 'bg-danger/10' : 'hover:bg-white/5'}`}
          >
            <div 
              className={`absolute top-0 bottom-0 bg-danger/10 transition-all duration-500 ease-out ${document.documentElement.dir === 'rtl' ? 'right-0' : 'left-0'}`} 
              style={{ width: `${(ask.amount / maxAmount) * 100}%` }} 
            />
            <span className="text-danger font-black relative z-10">${getPriceFormatted(ask.price)}</span>
            <span className={`text-end text-text-bright font-bold relative z-10 transition-transform duration-200 ${ask.isUpdating ? 'scale-105' : ''}`}>
              {ask.amount.toFixed(2)}
            </span>
            <span className="text-end text-muted font-bold relative z-10 opacity-60">{ask.total.toFixed(2)}</span>
          </div>
        ))}

        <div className="py-6 my-4 neu-card-inset flex justify-between items-center px-6 rounded-[2rem] border-white/5 shadow-inner group cursor-pointer hover:bg-white/10 transition-all">
          <div className="flex flex-col">
            <span className={`text-xl font-black text-white font-mono tracking-tighter text-glow-primary transition-all duration-300 transform ${priceChanged ? 'scale-110 text-accent' : 'scale-100'}`}>
              ${getPriceFormatted(price)}
            </span>
            <span className="text-[8px] text-muted uppercase font-black tracking-[0.4em] mt-1 opacity-50">{t.markPrice}</span>
          </div>
          <div className="text-end">
             <div className="w-2.5 h-2.5 rounded-full bg-accent shadow-[0_0_10px_#3b82f6] animate-pulse" />
          </div>
        </div>

        {filteredBids.map((bid) => (
          <div 
            key={bid.id} 
            className={`grid grid-cols-3 items-center py-1.5 px-3 text-[10px] font-mono relative group rounded-lg transition-all duration-300 ${bid.isUpdating ? 'bg-success/10' : 'hover:bg-white/5'}`}
          >
            <div 
              className={`absolute top-0 bottom-0 bg-success/10 transition-all duration-500 ease-out ${document.documentElement.dir === 'rtl' ? 'right-0' : 'left-0'}`} 
              style={{ width: `${(bid.amount / maxAmount) * 100}%` }} 
            />
            <span className="text-success font-black relative z-10">${getPriceFormatted(bid.price)}</span>
            <span className={`text-end text-text-bright font-bold relative z-10 transition-transform duration-200 ${bid.isUpdating ? 'scale-105' : ''}`}>
              {bid.amount.toFixed(2)}
            </span>
            <span className="text-end text-muted font-bold relative z-10 opacity-60">{bid.total.toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="space-y-5 pt-6 border-t border-white/5">
        <div className="flex items-center gap-3 text-muted text-[9px] font-black uppercase tracking-[0.4em] px-1 italic opacity-40">
          <History className="w-4 h-4 text-accent" /> {t.recentActivity}
        </div>
        <div className="neu-card-inset rounded-2xl p-5 space-y-3.5 min-h-[140px] border-white/5">
          {recentTrades.map((t_item, i) => (
            <div key={`${t_item.time}-${i}`} className="flex justify-between items-center text-[10px] font-mono animate-[slideIn_0.3s_ease-out] hover:translate-x-1 transition-all">
              <span className={t_item.side === 'buy' ? 'text-success font-black text-glow-bull' : 'text-danger font-black text-glow-bear'}>
                ${getPriceFormatted(t_item.price)}
              </span>
              <div className="flex gap-6">
                <span className="text-white font-bold">{t_item.amount.toFixed(2)}</span>
                <span className="text-muted opacity-40">{t_item.time.split(':').slice(1).join(':')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default OrderBook;
