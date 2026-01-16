
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, RotateCcw, TrendingUp, TrendingDown, BarChart, Settings2, 
  Info, Activity, Terminal, Pause, FastForward, CheckCircle2, XCircle,
  Zap, Crosshair, Layers, Gauge, Wallet, Search
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  ReferenceLine, ComposedChart, Line, Scatter 
} from 'recharts';
import { MarketData, StrategyType } from '../types';

interface BacktesterProps {
  marketData: MarketData;
  t: any;
}

// --- Technical Indicators Engines ---
const calculateRSI = (prices: number[], period: number) => {
  if (prices.length < period + 1) return 50;
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff >= 0) gains += diff; else losses -= diff;
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;
  for (let i = period + 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    avgGain = (avgGain * (period - 1) + (diff > 0 ? diff : 0)) / period;
    avgLoss = (avgLoss * (period - 1) + (diff < 0 ? -diff : 0)) / period;
  }
  return avgLoss === 0 ? 100 : 100 - (100 / (1 + avgGain / avgLoss));
};

const calculateSMA = (prices: number[], period: number) => {
  if (prices.length < period) return null;
  return prices.slice(-period).reduce((a, b) => a + b, 0) / period;
};

const Backtester: React.FC<BacktesterProps> = ({ marketData, t }) => {
  const [strategy, setStrategy] = useState<StrategyType>('SMA_CROSSOVER');
  const [param1, setParam1] = useState(12);
  const [param2, setParam2] = useState(26);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(100);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [equityCurve, setEquityCurve] = useState<{ time: string; balance: number }[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [currentHoldings, setCurrentHoldings] = useState(0);
  const [balance, setBalance] = useState(10000);
  const initialBalance = 10000;

  const scrollRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<any>(null);

  const addDetailedLog = (action: string, price: number, qty: number, pnl: number | null = null, trigger: string) => {
    const log = {
      id: Math.random().toString(36),
      time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      action,
      price,
      qty,
      pnl,
      trigger
    };
    setLogs(prev => [log, ...prev].slice(0, 100));
  };

  const resetSimulation = () => {
    if (simulationRef.current) clearInterval(simulationRef.current);
    setIsSimulating(false);
    setIsPaused(false);
    setProgress(0);
    setEquityCurve([]);
    setTrades([]);
    setLogs([]);
    setBalance(initialBalance);
    setCurrentHoldings(0);
  };

  const step = () => {
    setProgress(prev => {
      const nextIndex = prev + 1;
      if (nextIndex >= marketData.history.length) {
        setIsSimulating(false);
        if (simulationRef.current) clearInterval(simulationRef.current);
        return prev;
      }

      const candle = marketData.history[nextIndex];
      const pricesSoFar = marketData.history.slice(0, nextIndex + 1).map(h => h.price);
      let signal: 'BUY' | 'SELL' | null = null;
      let triggerReason = '';

      if (pricesSoFar.length > Math.max(param1, param2, 30)) {
         if (strategy === 'SMA_CROSSOVER') {
            const short = calculateSMA(pricesSoFar, param1);
            const long = calculateSMA(pricesSoFar, param2);
            const pShort = calculateSMA(pricesSoFar.slice(0, -1), param1);
            const pLong = calculateSMA(pricesSoFar.slice(0, -1), param2);
            if (short && long && pShort && pLong) {
               if (pShort <= pLong && short > long) { signal = 'BUY'; triggerReason = `SMA ${param1} > SMA ${param2}`; }
               if (pShort >= pLong && short < long) { signal = 'SELL'; triggerReason = `SMA ${param1} < SMA ${param2}`; }
            }
         } else if (strategy === 'RSI_REVERSAL') {
            const rsi = calculateRSI(pricesSoFar, param1);
            if (rsi < param2) { signal = 'BUY'; triggerReason = `RSI ${rsi.toFixed(1)} < ${param2}`; }
            if (rsi > (100 - param2)) { signal = 'SELL'; triggerReason = `RSI ${rsi.toFixed(1)} > ${100 - param2}`; }
         }
      }

      let newBalance = balance;
      let newHoldings = currentHoldings;
      const currentPrice = candle.price;

      if (signal === 'BUY' && currentHoldings === 0) {
         newHoldings = balance / currentPrice;
         newBalance = 0;
         setTrades(t => [...t, { time: candle.time, type: 'BUY', price: currentPrice, index: nextIndex }]);
         addDetailedLog('BUY ENTRY', currentPrice, newHoldings, null, triggerReason);
         setBalance(newBalance);
         setCurrentHoldings(newHoldings);
      } else if (signal === 'SELL' && currentHoldings > 0) {
         newBalance = currentHoldings * currentPrice;
         const entryPrice = trades[trades.length - 1].price;
         const pnl = ((currentPrice - entryPrice) / entryPrice) * 100;
         setTrades(t => [...t, { time: candle.time, type: 'SELL', price: currentPrice, index: nextIndex, pnl }]);
         addDetailedLog('SELL EXIT', currentPrice, currentHoldings, pnl, triggerReason);
         newHoldings = 0;
         setBalance(newBalance);
         setCurrentHoldings(newHoldings);
      }

      const currentEquity = newHoldings > 0 ? newHoldings * currentPrice : newBalance;
      setEquityCurve(prev => [...prev, { time: candle.time, balance: currentEquity }]);

      return nextIndex;
    });
  };

  const toggleSimulation = () => {
    if (isSimulating && !isPaused) {
      setIsPaused(true);
      if (simulationRef.current) clearInterval(simulationRef.current);
    } else {
      setIsSimulating(true);
      setIsPaused(false);
      simulationRef.current = setInterval(step, speed);
    }
  };

  // --- Chart Processing ---
  const processedChartData = useMemo(() => {
    const slice = marketData.history.slice(0, progress + 1);
    return slice.map((h, i) => {
       const prices = slice.slice(0, i + 1).map(x => x.price);
       const trade = trades.find(t => t.index === i);
       return {
          ...h,
          sma1: strategy === 'SMA_CROSSOVER' ? calculateSMA(prices, param1) : null,
          sma2: strategy === 'SMA_CROSSOVER' ? calculateSMA(prices, param2) : null,
          rsi: strategy === 'RSI_REVERSAL' ? calculateRSI(prices, param1) : null,
          buy: trade?.type === 'BUY' ? trade.price : null,
          sell: trade?.type === 'SELL' ? trade.price : null,
       };
    });
  }, [progress, trades, strategy, param1, param2]);

  const filteredLogs = logs.filter(l => 
    l.action.toLowerCase().includes(searchQuery.toLowerCase()) || 
    l.trigger.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="cyber-card rounded-[4rem] p-8 border-2 border-white/5 relative overflow-hidden group shadow-3xl">
      <div className="flex flex-col xl:flex-row justify-between items-center gap-10 mb-12 relative z-10">
        <div className="flex items-center gap-6">
           <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20"><Zap className="w-10 h-10 text-indigo-400" /></div>
           <div className="text-start">
              <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">{t.backtester}</h2>
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Cognitive Simulation Engine v4.2</span>
           </div>
        </div>

        <div className="flex gap-4">
           <button onClick={toggleSimulation} className="px-8 py-3 bg-emerald-500 text-black font-black uppercase rounded-2xl hover:scale-105 transition-all flex items-center gap-3">
              {isSimulating && !isPaused ? <Pause size={18} /> : <Play size={18} />} {isSimulating && !isPaused ? 'Pause' : 'Execute'}
           </button>
           <button onClick={resetSimulation} className="p-3 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10"><RotateCcw /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 relative z-10">
         {/* Sidebar: Control Panel */}
         <div className="xl:col-span-3 space-y-6">
            <div className="bg-black/30 p-8 rounded-[3rem] border border-white/5 space-y-8">
               <div className="flex justify-between items-center"><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Balance</span><Wallet className="w-4 h-4 text-indigo-400" /></div>
               <span className="text-3xl font-black font-mono text-white">${(equityCurve[equityCurve.length-1]?.balance || balance).toLocaleString()}</span>
               <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="flex justify-between text-[11px] font-bold"><span>RSI/SMA (1)</span><span className="text-indigo-300">{param1}</span></div>
                  <input type="range" min="2" max="100" value={param1} onChange={(e) => setParam1(Number(e.target.value))} className="w-full h-1.5 accent-indigo-400" />
                  <div className="flex justify-between text-[11px] font-bold"><span>Logic (2)</span><span className="text-indigo-300">{param2}</span></div>
                  <input type="range" min="2" max="100" value={param2} onChange={(e) => setParam2(Number(e.target.value))} className="w-full h-1.5 accent-indigo-400" />
               </div>
            </div>

            {/* Terminal Log */}
            <div className="bg-black/60 rounded-[3rem] border border-white/5 p-8 h-[450px] flex flex-col">
               <div className="flex items-center justify-between mb-6">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2"><Terminal size={14} /> Execution Tape</span>
                  <div className="relative group/search"><Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Filter..." className="bg-white/5 border border-white/10 rounded-lg pl-8 pr-2 py-1 text-[9px] w-28 focus:w-40 transition-all focus:outline-none focus:border-indigo-500" /></div>
               </div>
               <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-[9px] space-y-4 pr-2">
                  {filteredLogs.map(l => (
                     <div key={l.id} className="border-b border-white/5 pb-3">
                        <div className="flex justify-between mb-1"><span className={l.action.includes('BUY') ? 'text-emerald-400' : 'text-rose-400'}>{l.action}</span><span className="text-slate-600">{l.time}</span></div>
                        <div className="text-white">Price: ${l.price.toLocaleString()} | Qty: {l.qty.toFixed(4)}</div>
                        {l.pnl !== null && <div className={l.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}>PnL: {l.pnl.toFixed(2)}%</div>}
                        <div className="text-slate-500 text-[8px] italic truncate">Trigger: {l.trigger}</div>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Main Chart Column */}
         <div className="xl:col-span-9 flex flex-col gap-8">
            <div className="flex-1 bg-slate-950/40 rounded-[3.5rem] border border-white/5 p-8 relative overflow-hidden min-h-[500px]">
               <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={processedChartData}>
                     <defs>
                        <linearGradient id="pArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity={0.3}/><stop offset="100%" stopColor="#6366f1" stopOpacity={0}/></linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                     <XAxis dataKey="time" hide /><YAxis domain={['auto', 'auto']} hide />
                     <Area type="monotone" dataKey="price" stroke="#6366f1" strokeWidth={2} fill="url(#pArea)" isAnimationActive={false} />
                     {strategy === 'SMA_CROSSOVER' && <Line type="monotone" dataKey="sma1" stroke="#fbbf24" strokeWidth={2} dot={false} isAnimationActive={false} />}
                     {strategy === 'SMA_CROSSOVER' && <Line type="monotone" dataKey="sma2" stroke="#f43f5e" strokeWidth={2} dot={false} isAnimationActive={false} />}
                     <Scatter dataKey="buy" fill="#10b981" />
                     <Scatter dataKey="sell" fill="#f43f5e" />
                  </ComposedChart>
               </ResponsiveContainer>
               {strategy === 'RSI_REVERSAL' && (
                  <div className="absolute bottom-10 left-10 right-10 h-24 bg-black/40 border border-white/5 rounded-2xl">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={processedChartData}>
                           <ReferenceLine y={100 - param2} stroke="#f43f5e" strokeDasharray="3 3" />
                           <ReferenceLine y={param2} stroke="#10b981" strokeDasharray="3 3" />
                           <YAxis domain={[0, 100]} hide /><Area type="monotone" dataKey="rsi" stroke="#a78bfa" fill="rgba(167, 139, 250, 0.1)" isAnimationActive={false} />
                        </AreaChart>
                     </ResponsiveContainer>
                  </div>
               )}
            </div>

            {/* Equity Curve Display */}
            <div className="h-48 bg-slate-900/60 rounded-[3rem] border border-white/5 p-8 relative">
               <div className="flex justify-between items-center mb-2"><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Equity Performance Curve</span><TrendingUp className="w-4 h-4 text-emerald-400" /></div>
               <div className="absolute inset-0 pt-12 pb-4 px-8">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={equityCurve.length > 0 ? equityCurve : [{time: '', balance: 10000}]}>
                        <defs><linearGradient id="eqGr" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.4}/><stop offset="100%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs>
                        <YAxis domain={['auto', 'auto']} hide /><Area type="monotone" dataKey="balance" stroke="#10b981" fill="url(#eqGr)" strokeWidth={3} isAnimationActive={false} />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Backtester;
