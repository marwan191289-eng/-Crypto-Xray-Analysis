
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, RotateCcw, TrendingUp, TrendingDown, BarChart, Settings2, 
  Info, Activity, Terminal, Pause, FastForward, CheckCircle2, XCircle,
  Zap, Crosshair, Layers, Gauge, Wallet, Search, Clock, Cpu, GitBranch, ArrowRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  ReferenceLine, ComposedChart, Line, Scatter, Cell 
} from 'recharts';
import { MarketData, StrategyType } from '../types';

interface BacktesterProps {
  marketData: MarketData;
  t: any;
}

// --- Live Clock Component ---
const LiveClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex flex-col items-end border-l border-white/5 pl-4 md:pl-6 h-full justify-center min-w-[100px] md:min-w-[120px]">
      <div className="flex items-center gap-2 text-white">
        <Clock size={12} className="text-indigo-400" />
        <span className="text-xs md:text-sm font-mono font-black tracking-tight leading-none">
          {time.toLocaleTimeString('en-US', { hour12: false })}
        </span>
        <span className="hidden md:inline-block text-[10px] font-bold text-slate-500 bg-white/5 px-1.5 rounded">UTC</span>
      </div>
      <span className="text-[8px] md:text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mt-1">
        {time.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' })}
      </span>
    </div>
  );
};

// --- Strategy Metadata ---
const STRATEGY_DETAILS = {
  'SMA_CROSSOVER': {
    name: "Golden Cross / Death Cross",
    desc: "A momentum-based trend-following strategy.",
    logic: "BUY when Fast MA crosses ABOVE Slow MA (Golden Cross). SELL when Fast MA crosses BELOW Slow MA (Death Cross).",
    usage: "Best used in trending markets to capture significant price swings. Lags in chopping sideways markets."
  },
  'RSI_REVERSAL': {
    name: "Mean Reversion Oscillator",
    desc: "A contrarian strategy exploiting overbought/oversold conditions.",
    logic: "BUY when RSI < Low Threshold (Oversold). SELL when RSI > High Threshold (Overbought).",
    usage: "Effective in ranging markets to scalp tops and bottoms. risky in strong trending moves."
  }
};

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
  const [param1, setParam1] = useState(12); // Fast SMA or Period
  const [param2, setParam2] = useState(26); // Slow SMA or Threshold
  const [isSimulating, setIsSimulating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(50);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [equityCurve, setEquityCurve] = useState<{ time: string; balance: number }[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [currentHoldings, setCurrentHoldings] = useState(0);
  const [balance, setBalance] = useState(10000);
  const initialBalance = 10000;

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
               if (pShort <= pLong && short > long) { signal = 'BUY'; triggerReason = `Cross: SMA(${param1}) > SMA(${param2})`; }
               if (pShort >= pLong && short < long) { signal = 'SELL'; triggerReason = `Cross: SMA(${param1}) < SMA(${param2})`; }
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

      // Simple Order Execution Logic (Full position)
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

  const stratInfo = STRATEGY_DETAILS[strategy] || STRATEGY_DETAILS['SMA_CROSSOVER'];

  return (
    <div className="cyber-card rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden group shadow-2xl bg-[#020617]">
      <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:rotate-6 transition-transform">
        <Zap className="w-64 h-64 text-indigo-400" />
      </div>

      {/* --- HEADER --- */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-10 gap-8 relative z-10 border-b border-white/5 pb-8">
        <div className="flex items-center gap-6">
          <div className="relative">
             <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full"></div>
             <div className="relative p-4 bg-slate-900 rounded-2xl border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.15)]">
                <Cpu className="w-8 h-8 text-amber-400" />
             </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">{t.backtester}</h3>
            <div className="flex items-center gap-3 mt-2">
               <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[9px] font-black text-amber-300 uppercase tracking-widest">
                  Algo Verification
               </span>
               <div className="h-1 w-1 bg-slate-600 rounded-full"></div>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Activity size={10} className="text-indigo-500 animate-pulse" /> Simulation Engine v2.0
               </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6 self-end xl:self-auto">
           <div className="text-right hidden md:block">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Processing Speed</span>
              <div className="flex items-center justify-end gap-2">
                 <Zap size={12} className="text-indigo-400" />
                 <span className="text-xl font-black font-mono text-white tracking-tight">{speed}ms <span className="text-[8px] text-slate-500">/ tick</span></span>
              </div>
           </div>
           <div className="h-8 w-px bg-white/10 hidden md:block"></div>
           <LiveClock />
        </div>
      </div>

      {/* --- MAIN GRID --- */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 relative z-10">
         
         {/* LEFT COL: CONTROLS & EXPLANATION */}
         <div className="xl:col-span-4 flex flex-col gap-6">
            
            {/* Control Panel */}
            <div className="bg-slate-950/40 p-6 rounded-[2rem] border border-white/5 space-y-6">
               <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Strategy Matrix</span>
                  <Settings2 className="w-4 h-4 text-indigo-400" />
               </div>
               
               {/* Strategy Toggles */}
               <div className="grid grid-cols-2 gap-2">
                  {Object.keys(STRATEGY_DETAILS).map(s => (
                     <button 
                        key={s}
                        onClick={() => { setStrategy(s as any); resetSimulation(); }}
                        className={`py-3 rounded-xl border text-[9px] font-black uppercase tracking-wider transition-all ${strategy === s ? 'bg-indigo-500 text-white border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-slate-900 text-slate-500 border-white/5 hover:border-white/20'}`}
                     >
                        {s.replace('_', ' ')}
                     </button>
                  ))}
               </div>

               {/* Parameter Sliders */}
               <div className="space-y-5 pt-4 border-t border-white/5">
                  <div className="space-y-2">
                     <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-wider">
                        <span>{strategy === 'SMA_CROSSOVER' ? 'Fast Period' : 'Period'}</span>
                        <span className="text-indigo-300 font-mono">{param1}</span>
                     </div>
                     <input type="range" min="2" max="50" value={param1} onChange={(e) => setParam1(Number(e.target.value))} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                  </div>
                  <div className="space-y-2">
                     <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-wider">
                        <span>{strategy === 'SMA_CROSSOVER' ? 'Slow Period' : 'Threshold'}</span>
                        <span className="text-indigo-300 font-mono">{param2}</span>
                     </div>
                     <input type="range" min="5" max="100" value={param2} onChange={(e) => setParam2(Number(e.target.value))} className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                  </div>
               </div>

               {/* Action Buttons */}
               <div className="flex gap-3 pt-2">
                  <button onClick={toggleSimulation} className={`flex-1 py-3 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 transition-all ${isSimulating && !isPaused ? 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]'}`}>
                     {isSimulating && !isPaused ? <Pause size={14} /> : <Play size={14} />} 
                     {isSimulating && !isPaused ? 'Pause Sim' : 'Run Logic'}
                  </button>
                  <button onClick={resetSimulation} className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 hover:text-white text-slate-400 transition-colors">
                     <RotateCcw size={14} />
                  </button>
               </div>
            </div>

            {/* Tactical Briefing (Explanation) */}
            <div className="bg-slate-900/40 p-6 rounded-[2rem] border border-white/5 relative overflow-hidden group/brief">
               <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none rotate-12"><GitBranch size={64} /></div>
               <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <Info size={12} className="text-indigo-400" /> Tactical Briefing
               </h4>
               <div className="space-y-4 relative z-10">
                  <div>
                     <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">Logic Core</span>
                     <p className="text-[10px] font-medium text-slate-300 leading-relaxed border-l-2 border-indigo-500/30 pl-3">
                        {stratInfo.logic}
                     </p>
                  </div>
                  <div>
                     <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">Strategic Use Case</span>
                     <p className="text-[10px] font-medium text-slate-300 leading-relaxed border-l-2 border-emerald-500/30 pl-3">
                        {stratInfo.usage}
                     </p>
                  </div>
               </div>
            </div>

         </div>

         {/* CENTER/RIGHT: CHARTS & LOGS */}
         <div className="xl:col-span-8 flex flex-col gap-6">
            
            {/* Main Forensic Chart */}
            <div className="bg-slate-950/40 rounded-[2.5rem] border border-white/5 p-1 relative overflow-hidden min-h-[400px] flex flex-col group/chart shadow-inner">
               <div className="absolute top-6 left-8 z-20 flex items-center gap-4 pointer-events-none">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <Crosshair size={12} className="text-rose-400" /> Price Action Forensic
                  </span>
                  {strategy === 'SMA_CROSSOVER' && (
                     <div className="flex gap-2">
                        <span className="text-[9px] font-bold text-amber-400 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div> SMA {param1}</span>
                        <span className="text-[9px] font-bold text-rose-400 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-rose-400"></div> SMA {param2}</span>
                     </div>
                  )}
               </div>

               <div className="flex-1 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                     <ComposedChart data={processedChartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                           <linearGradient id="priceArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity={0.2}/><stop offset="100%" stopColor="#6366f1" stopOpacity={0}/></linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.5} />
                        <XAxis hide />
                        <YAxis domain={['auto', 'auto']} hide />
                        <Tooltip content={<></>} cursor={{ stroke: '#ffffff', strokeWidth: 1, strokeDasharray: '3 3', opacity: 0.3 }} />
                        
                        <Area type="monotone" dataKey="price" stroke="#6366f1" strokeWidth={2} fill="url(#priceArea)" isAnimationActive={false} />
                        
                        {strategy === 'SMA_CROSSOVER' && (
                           <>
                              <Line type="monotone" dataKey="sma1" stroke="#fbbf24" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                              <Line type="monotone" dataKey="sma2" stroke="#f43f5e" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                           </>
                        )}

                        {/* Trade Markers */}
                        <Scatter dataKey="buy" shape={(props: any) => {
                           const { cx, cy } = props;
                           return <path d={`M${cx},${cy+10} L${cx-5},${cy+20} L${cx+5},${cy+20} Z`} fill="#10b981" stroke="none" />;
                        }} />
                        <Scatter dataKey="sell" shape={(props: any) => {
                           const { cx, cy } = props;
                           return <path d={`M${cx},${cy-10} L${cx-5},${cy-20} L${cx+5},${cy-20} Z`} fill="#f43f5e" stroke="none" />;
                        }} />
                     </ComposedChart>
                  </ResponsiveContainer>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               
               {/* Equity Reactor (Balance Curve) */}
               <div className="bg-slate-900/40 rounded-[2rem] border border-white/5 p-6 relative overflow-hidden flex flex-col h-[250px]">
                  <div className="flex justify-between items-start mb-4 relative z-10">
                     <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Wallet size={12} className="text-emerald-400" /> Equity Reactor
                     </span>
                     <span className="text-xl font-black font-mono text-white tracking-tighter">
                        ${(equityCurve[equityCurve.length-1]?.balance || balance).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}
                     </span>
                  </div>
                  <div className="flex-1 w-full -ml-2">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={equityCurve.length > 0 ? equityCurve : [{time: '', balance: 10000}]}>
                           <defs><linearGradient id="eqGr" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10b981" stopOpacity={0.4}/><stop offset="100%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs>
                           <YAxis domain={['auto', 'auto']} hide />
                           <Area type="monotone" dataKey="balance" stroke="#10b981" fill="url(#eqGr)" strokeWidth={2} isAnimationActive={false} />
                        </AreaChart>
                     </ResponsiveContainer>
                  </div>
               </div>

               {/* Execution Tape (Logs) */}
               <div className="bg-black/40 rounded-[2rem] border border-white/5 p-6 relative overflow-hidden flex flex-col h-[250px]">
                  <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                     <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Terminal size={12} className="text-slate-400" /> Execution Tape
                     </span>
                     <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${isSimulating ? 'bg-emerald-500 animate-ping' : 'bg-slate-600'}`}></div>
                        <span className="text-[8px] font-bold text-slate-600 uppercase">Live</span>
                     </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto custom-scrollbar font-mono space-y-2 pr-1">
                     {filteredLogs.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-[9px] text-slate-600 uppercase tracking-widest opacity-50">
                           Awaiting Signal...
                        </div>
                     ) : (
                        filteredLogs.map(l => (
                           <div key={l.id} className="text-[8px] border-b border-white/5 pb-1 last:border-0 hover:bg-white/5 transition-colors p-1 rounded">
                              <div className="flex justify-between mb-0.5">
                                 <span className={l.action.includes('BUY') ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{l.action}</span>
                                 <span className="text-slate-600">{l.time}</span>
                              </div>
                              <div className="text-slate-400 flex justify-between">
                                 <span>@ {l.price.toLocaleString()}</span>
                                 {l.pnl !== null && <span className={l.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}>{l.pnl > 0 ? '+' : ''}{l.pnl.toFixed(2)}%</span>}
                              </div>
                           </div>
                        ))
                     )}
                  </div>
               </div>

            </div>
         </div>

      </div>
    </div>
  );
};

export default Backtester;
