
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, RotateCcw, TrendingUp, TrendingDown, BarChart, Settings2, 
  Info, Activity, Terminal, Pause, FastForward, CheckCircle2, XCircle,
  Zap, Crosshair, Layers, Gauge
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

// --- Technical Indicators ---
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

const calculateEMA = (prices: number[], period: number) => {
  const k = 2 / (period + 1);
  let ema = prices[0];
  for (let i = 1; i < prices.length; i++) {
    ema = (prices[i] * k) + (ema * (1 - k));
  }
  return ema;
};

const Backtester: React.FC<BacktesterProps> = ({ marketData, t }) => {
  const [strategy, setStrategy] = useState<StrategyType>('SMA_CROSSOVER');
  const [param1, setParam1] = useState(12);
  const [param2, setParam2] = useState(26);
  
  // Simulation State
  const [isSimulating, setIsSimulating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0); // Index of current candle
  const [speed, setSpeed] = useState(100); // ms per step
  
  // Live Results
  const [equityCurve, setEquityCurve] = useState<{ time: string; balance: number }[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [currentHoldings, setCurrentHoldings] = useState(0);
  const [balance, setBalance] = useState(10000);
  const initialBalance = 10000;

  const scrollRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (msg: string, type: 'info' | 'trade' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [`[${timestamp}] ${msg}`, ...prev].slice(0, 50));
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

  const getParamMeta = () => {
    switch (strategy) {
      case 'SMA_CROSSOVER': return { p1: t.shortWindow, p2: t.longWindow };
      case 'RSI_REVERSAL': return { p1: t.rsiPeriod, p2: t.threshold };
      case 'EMA_TREND': return { p1: t.fastEma, p2: t.slowEma };
      case 'MACD_CROSSOVER': return { p1: t.fastLine, p2: t.slowLine };
      case 'BOLLINGER_BANDS': return { p1: t.stdDev, p2: t.smaPeriod };
      default: return { p1: 'Param 1', p2: 'Param 2' };
    }
  };
  const meta = getParamMeta();

  // --- Simulation Step Logic ---
  const step = () => {
    setProgress(prev => {
      const nextIndex = prev + 1;
      if (nextIndex >= marketData.history.length) {
        setIsSimulating(false);
        if (simulationRef.current) clearInterval(simulationRef.current);
        addLog(`Simulation Complete. Final Equity: $${balance.toFixed(2)}`, 'info');
        return prev;
      }

      const candle = marketData.history[nextIndex];
      const pricesSoFar = marketData.history.slice(0, nextIndex + 1).map(h => h.price);
      
      // -- Strategy Evaluation --
      let signal: 'BUY' | 'SELL' | null = null;
      const currentPrice = candle.price;

      // Ensure enough data points
      if (pricesSoFar.length > Math.max(param1, param2, 30)) {
         if (strategy === 'SMA_CROSSOVER') {
            const shortSma = pricesSoFar.slice(-param1).reduce((a, b) => a + b, 0) / param1;
            const longSma = pricesSoFar.slice(-param2).reduce((a, b) => a + b, 0) / param2;
            const prevP = pricesSoFar.slice(0, -1);
            const prevShort = prevP.slice(-param1).reduce((a, b) => a + b, 0) / param1;
            const prevLong = prevP.slice(-param2).reduce((a, b) => a + b, 0) / param2;
            if (prevShort <= prevLong && shortSma > longSma) signal = 'BUY';
            if (prevShort >= prevLong && shortSma < longSma) signal = 'SELL';
         } 
         else if (strategy === 'RSI_REVERSAL') {
            const rsi = calculateRSI(pricesSoFar, param1);
            const prevRsi = calculateRSI(pricesSoFar.slice(0, -1), param1);
            if (prevRsi <= param2 && rsi > param2) signal = 'BUY';
            if (prevRsi >= (100 - param2) && rsi < (100 - param2)) signal = 'SELL';
         }
         else if (strategy === 'EMA_TREND') {
            const fastEma = calculateEMA(pricesSoFar, param1);
            const slowEma = calculateEMA(pricesSoFar, param2);
            if (fastEma > slowEma && currentHoldings === 0) signal = 'BUY'; // Simplified trend following
            if (fastEma < slowEma && currentHoldings > 0) signal = 'SELL';
         }
      }

      // -- Execution Logic --
      let newBalance = balance;
      let newHoldings = currentHoldings;

      if (signal === 'BUY' && currentHoldings === 0) {
         newHoldings = balance / currentPrice;
         newBalance = 0;
         setTrades(t => [...t, { time: candle.time, type: 'BUY', price: currentPrice, index: nextIndex }]);
         addLog(`SIGNAL: BUY @ ${currentPrice.toFixed(2)}`, 'trade');
         setBalance(newBalance);
         setCurrentHoldings(newHoldings);
      } else if (signal === 'SELL' && currentHoldings > 0) {
         newBalance = currentHoldings * currentPrice;
         const entryPrice = trades[trades.length - 1].price;
         const pnl = ((currentPrice - entryPrice) / entryPrice) * 100;
         setTrades(t => [...t, { time: candle.time, type: 'SELL', price: currentPrice, index: nextIndex, pnl }]);
         addLog(`SIGNAL: SELL @ ${currentPrice.toFixed(2)} | PnL: ${pnl.toFixed(2)}%`, pnl > 0 ? 'trade' : 'error');
         newHoldings = 0;
         setBalance(newBalance);
         setCurrentHoldings(newHoldings);
      }

      // Update Equity Curve
      const currentEquity = newHoldings > 0 ? newHoldings * currentPrice : newBalance;
      setEquityCurve(prevC => [...prevC, { time: candle.time, balance: currentEquity }]);

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

  useEffect(() => {
    if (isSimulating && !isPaused) {
      if (simulationRef.current) clearInterval(simulationRef.current);
      simulationRef.current = setInterval(step, speed);
    }
    return () => { if (simulationRef.current) clearInterval(simulationRef.current); };
  }, [speed]);

  // Derived Stats
  const currentEquity = equityCurve.length > 0 ? equityCurve[equityCurve.length - 1].balance : initialBalance;
  const netProfit = ((currentEquity - initialBalance) / initialBalance) * 100;
  const completedTrades = trades.filter(t => t.type === 'SELL');
  const wins = completedTrades.filter(t => t.pnl > 0).length;
  const winRate = completedTrades.length > 0 ? (wins / completedTrades.length) * 100 : 0;

  // Chart Data Preparation
  const chartData = marketData.history.slice(0, progress + 1).map((h, i) => {
    const trade = trades.find(t => t.index === i);
    return {
      ...h,
      buy: trade?.type === 'BUY' ? trade.price : null,
      sell: trade?.type === 'SELL' ? trade.price : null,
    };
  });

  return (
    <div className="cyber-card rounded-[4rem] p-8 border-2 border-white/5 relative overflow-hidden group shadow-3xl">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-indigo-500 to-rose-500 opacity-50"></div>
      <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none"></div>

      {/* HEADER */}
      <div className="flex flex-col xl:flex-row justify-between items-center gap-8 mb-10 relative z-10 px-4">
        <div className="flex items-center gap-6">
           <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 shadow-lg">
              <Zap className="w-8 h-8 text-indigo-400" />
           </div>
           <div>
              <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">{t.backtester}</h2>
              <div className="flex items-center gap-3 mt-2">
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">SimEngine G8</span>
                 <div className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase ${isSimulating ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5 animate-pulse' : 'border-slate-700 text-slate-500'}`}>
                    {isSimulating ? (isPaused ? 'PAUSED' : 'RUNNING LIVE') : 'READY'}
                 </div>
              </div>
           </div>
        </div>

        {/* Strategy Selector */}
        <div className="flex flex-wrap gap-2 justify-center bg-black/20 p-2 rounded-2xl border border-white/5 backdrop-blur-md">
           {(['SMA_CROSSOVER', 'RSI_REVERSAL', 'EMA_TREND'] as StrategyType[]).map((s) => (
              <button
                key={s}
                onClick={() => { if (!isSimulating) setStrategy(s); }}
                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ${strategy === s ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
              >
                {t[s] || s.replace('_', ' ')}
              </button>
           ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 bg-slate-900 rounded-xl px-3 py-2 border border-white/10">
              <span className="text-[9px] font-bold text-slate-500 uppercase">Speed</span>
              <input 
                type="range" min="10" max="500" step="10" 
                value={510 - speed} 
                onChange={(e) => setSpeed(510 - parseInt(e.target.value))}
                className="w-24 h-1.5 bg-slate-700 rounded-full appearance-none accent-indigo-500 cursor-pointer"
              />
           </div>
           <button 
              onClick={toggleSimulation}
              className={`p-4 rounded-xl border-2 transition-all ${isSimulating && !isPaused ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:scale-105'}`}
           >
              {isSimulating && !isPaused ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
           </button>
           <button 
              onClick={resetSimulation}
              className="p-4 rounded-xl border-2 border-slate-700 bg-slate-800/50 text-slate-400 hover:text-white hover:border-white/20 transition-all"
           >
              <RotateCcw />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 relative z-10">
         
         {/* LEFT COLUMN: Config & Terminal */}
         <div className="xl:col-span-3 flex flex-col gap-6">
            {/* Parameters */}
            <div className="bg-slate-950/50 p-6 rounded-[2.5rem] border border-white/5">
               <div className="flex items-center gap-3 mb-6">
                  <Settings2 className="w-4 h-4 text-indigo-400" />
                  <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Logic Gates</span>
               </div>
               <div className="space-y-6">
                  <div className="space-y-2">
                     <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>{meta.p1}</span>
                        <span className="text-white font-mono">{param1}</span>
                     </div>
                     <input type="range" min="2" max="100" value={param1} onChange={(e) => !isSimulating && setParam1(Number(e.target.value))} className="w-full h-1.5 bg-slate-800 rounded-full accent-indigo-500" disabled={isSimulating} />
                  </div>
                  <div className="space-y-2">
                     <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>{meta.p2}</span>
                        <span className="text-white font-mono">{param2}</span>
                     </div>
                     <input type="range" min="2" max="100" value={param2} onChange={(e) => !isSimulating && setParam2(Number(e.target.value))} className="w-full h-1.5 bg-slate-800 rounded-full accent-indigo-500" disabled={isSimulating} />
                  </div>
               </div>
            </div>

            {/* Live Metrics */}
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-slate-900/50 p-5 rounded-[2rem] border border-white/5 flex flex-col justify-center text-center hover:border-emerald-500/20 transition-all">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{t.netProfit}</span>
                  <span className={`text-xl font-black font-mono tracking-tighter ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                     {netProfit > 0 ? '+' : ''}{netProfit.toFixed(2)}%
                  </span>
               </div>
               <div className="bg-slate-900/50 p-5 rounded-[2rem] border border-white/5 flex flex-col justify-center text-center hover:border-indigo-500/20 transition-all">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{t.winRate}</span>
                  <span className="text-xl font-black font-mono text-indigo-300 tracking-tighter">{winRate.toFixed(1)}%</span>
               </div>
            </div>

            {/* Terminal Log */}
            <div className="flex-1 bg-black/40 rounded-[2.5rem] border border-white/5 p-6 relative overflow-hidden flex flex-col min-h-[250px]">
               <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/5">
                  <Terminal className="w-3 h-3 text-emerald-500" />
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Execution Log</span>
               </div>
               <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar font-mono text-[9px] space-y-2 pr-2">
                  {logs.length === 0 && <span className="text-slate-600 italic">System Idle. Awaiting simulation start...</span>}
                  {logs.map((log, i) => (
                     <div key={i} className={`opacity-80 ${log.includes('BUY') ? 'text-emerald-300' : log.includes('SELL') ? 'text-rose-300' : 'text-slate-400'}`}>
                        {log}
                     </div>
                  ))}
               </div>
            </div>
         </div>

         {/* CENTER/RIGHT: Charts */}
         <div className="xl:col-span-9 flex flex-col gap-6">
            
            {/* Main Price Chart */}
            <div className="flex-1 bg-slate-950/40 rounded-[3rem] border border-white/5 p-8 relative overflow-hidden shadow-inner min-h-[400px]">
               <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex items-center gap-3">
                     <Activity className="w-4 h-4 text-indigo-400" />
                     <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Price Action & Signals</span>
                  </div>
                  <span className="text-2xl font-black font-mono text-white tracking-tighter">${marketData.history[progress]?.price.toLocaleString()}</span>
               </div>

               <div className="w-full h-full absolute inset-0 pt-16 pb-4 px-4">
                  <ResponsiveContainer width="100%" height="100%">
                     <ComposedChart data={chartData}>
                        <defs>
                           <linearGradient id="priceArea" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                           </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <YAxis domain={['auto', 'auto']} hide />
                        <Area 
                           type="monotone" 
                           dataKey="price" 
                           stroke="#6366f1" 
                           strokeWidth={2} 
                           fill="url(#priceArea)" 
                           isAnimationActive={false}
                        />
                        {/* Buy Signals */}
                        <Scatter dataKey="buy" fill="#10b981" shape={(props: any) => {
                           const { cx, cy } = props;
                           return (
                              <g transform={`translate(${cx},${cy})`}>
                                 <circle r="4" fill="#10b981" />
                                 <path d="M0 -10 L-4 -2 L4 -2 Z" fill="#10b981" />
                              </g>
                           );
                        }} />
                        {/* Sell Signals */}
                        <Scatter dataKey="sell" fill="#f43f5e" shape={(props: any) => {
                           const { cx, cy } = props;
                           return (
                              <g transform={`translate(${cx},${cy})`}>
                                 <circle r="4" fill="#f43f5e" />
                                 <path d="M0 10 L-4 2 L4 2 Z" fill="#f43f5e" />
                              </g>
                           );
                        }} />
                     </ComposedChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* Equity Curve */}
            <div className="h-48 bg-slate-950/40 rounded-[2.5rem] border border-white/5 p-6 relative overflow-hidden">
               <div className="flex justify-between items-center mb-2 relative z-10">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Equity Curve</span>
                  <span className={`text-lg font-black font-mono tracking-tighter ${currentEquity >= initialBalance ? 'text-emerald-400' : 'text-rose-400'}`}>
                     ${currentEquity.toFixed(2)}
                  </span>
               </div>
               <div className="absolute inset-0 pt-10 px-4 pb-2">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={equityCurve.length > 0 ? equityCurve : [{time: '', balance: initialBalance}]}>
                        <defs>
                           <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={currentEquity >= initialBalance ? '#10b981' : '#f43f5e'} stopOpacity={0.3}/>
                              <stop offset="95%" stopColor={currentEquity >= initialBalance ? '#10b981' : '#f43f5e'} stopOpacity={0}/>
                           </linearGradient>
                        </defs>
                        <YAxis domain={['auto', 'auto']} hide />
                        <Area 
                           type="monotone" 
                           dataKey="balance" 
                           stroke={currentEquity >= initialBalance ? '#10b981' : '#f43f5e'} 
                           strokeWidth={2} 
                           fill="url(#eqGrad)" 
                           isAnimationActive={false}
                        />
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
