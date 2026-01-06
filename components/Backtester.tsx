
import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, TrendingUp, TrendingDown, BarChart, Settings2, Info, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MarketData, BacktestResult, StrategyType } from '../types';

interface BacktesterProps {
  marketData: MarketData;
  t: any;
}

const Backtester: React.FC<BacktesterProps> = ({ marketData, t }) => {
  const [strategy, setStrategy] = useState<StrategyType>('SMA_CROSSOVER');
  const [param1, setParam1] = useState(12);
  const [param2, setParam2] = useState(26);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(null);

  const getParamMeta = () => {
    switch (strategy) {
      case 'SMA_CROSSOVER':
        return { p1: t.shortWindow, p2: t.longWindow };
      case 'RSI_REVERSAL':
        return { p1: t.rsiPeriod, p2: t.threshold };
      case 'EMA_TREND':
        return { p1: t.fastEma, p2: t.slowEma };
      case 'MACD_CROSSOVER':
        return { p1: t.fastLine, p2: t.slowLine };
      case 'BOLLINGER_BANDS':
        return { p1: t.stdDev, p2: t.smaPeriod };
      default:
        return { p1: 'Param 1', p2: 'Param 2' };
    }
  };

  const meta = getParamMeta();

  const calculateRSI = (prices: number[], period: number) => {
    if (prices.length < period + 1) return 50;
    let gains = 0;
    let losses = 0;
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
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  };

  const calculateEMA = (prices: number[], period: number) => {
    const k = 2 / (period + 1);
    let ema = prices[0];
    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] * k) + (ema * (1 - k));
    }
    return ema;
  };

  const runBacktest = () => {
    setIsRunning(true);
    setTimeout(() => {
      const history = marketData.history;
      const initialBalance = 10000;
      let balance = initialBalance;
      let position = 0;
      const equityCurve: { time: string; balance: number }[] = [];
      const trades: any[] = [];
      let wins = 0;
      let losses = 0;
      let peakBalance = initialBalance;
      let maxDD = 0;

      const startIdx = Math.max(param1, param2, 14);

      for (let i = startIdx; i < history.length; i++) {
        const currentPrice = history[i].price;
        const pricesSoFar = history.slice(0, i + 1).map(h => h.price);
        const prevPrices = history.slice(0, i).map(h => h.price);
        
        let signal: 'BUY' | 'SELL' | null = null;

        if (strategy === 'SMA_CROSSOVER') {
          const shortSma = pricesSoFar.slice(-param1).reduce((a, b) => a + b, 0) / param1;
          const longSma = pricesSoFar.slice(-param2).reduce((a, b) => a + b, 0) / param2;
          const prevShortSma = prevPrices.slice(-param1).reduce((a, b) => a + b, 0) / param1;
          const prevLongSma = prevPrices.slice(-param2).reduce((a, b) => a + b, 0) / param2;

          if (prevShortSma <= prevLongSma && shortSma > longSma) signal = 'BUY';
          if (prevShortSma >= prevLongSma && shortSma < longSma) signal = 'SELL';
        } 
        else if (strategy === 'RSI_REVERSAL') {
          const rsi = calculateRSI(pricesSoFar, param1);
          const prevRsi = calculateRSI(prevPrices, param1);
          const lowerThresh = param2;
          const upperThresh = 100 - param2;

          if (prevRsi <= lowerThresh && rsi > lowerThresh) signal = 'BUY';
          if (prevRsi >= upperThresh && rsi < upperThresh) signal = 'SELL';
        } 
        else if (strategy === 'EMA_TREND') {
          const fastEma = calculateEMA(pricesSoFar, param1);
          const slowEma = calculateEMA(pricesSoFar, param2);
          const prevFastEma = calculateEMA(prevPrices, param1);
          const prevSlowEma = calculateEMA(prevPrices, param2);

          if (prevFastEma <= prevSlowEma && fastEma > slowEma) signal = 'BUY';
          if (prevFastEma >= prevSlowEma && fastEma < slowEma) signal = 'SELL';
        } 
        else if (strategy === 'MACD_CROSSOVER') {
          const calcMACD = (p: number[]) => {
            const f = calculateEMA(p, param1);
            const s = calculateEMA(p, param2);
            return f - s;
          };
          const macdLine = calcMACD(pricesSoFar);
          const prevMacdLine = calcMACD(prevPrices);
          
          if (prevMacdLine <= 0 && macdLine > 0) signal = 'BUY';
          if (prevMacdLine >= 0 && macdLine < 0) signal = 'SELL';
        } 
        else if (strategy === 'BOLLINGER_BANDS') {
          const period = param2;
          const multiplier = param1 / 10;
          const slice = pricesSoFar.slice(-period);
          const mean = slice.reduce((a, b) => a + b, 0) / period;
          const stdDev = Math.sqrt(slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period);
          
          const upper = mean + (multiplier * stdDev);
          const lower = mean - (multiplier * stdDev);

          if (currentPrice < lower) signal = 'BUY';
          if (currentPrice > upper) signal = 'SELL';
        }

        if (signal === 'BUY' && position === 0) {
          position = balance / currentPrice;
          balance = 0;
          trades.push({ time: history[i].time, type: 'BUY', price: currentPrice, balance: position * currentPrice });
        } else if (signal === 'SELL' && position > 0) {
          balance = position * currentPrice;
          const entryPrice = trades[trades.length - 1].price;
          if (currentPrice > entryPrice) wins++; else losses++;
          position = 0;
          trades.push({ time: history[i].time, type: 'SELL', price: currentPrice, balance });
        }

        const currentEquity = position > 0 ? position * currentPrice : balance;
        equityCurve.push({ time: history[i].time, balance: currentEquity });
        
        if (currentEquity > peakBalance) peakBalance = currentEquity;
        const dd = (peakBalance - currentEquity) / peakBalance;
        if (dd > maxDD) maxDD = dd;
      }

      setResult({
        netProfit: ((equityCurve[equityCurve.length - 1]?.balance || initialBalance) - initialBalance) / (initialBalance / 100),
        winRate: (wins + losses) > 0 ? (wins / (wins + losses)) * 100 : 0,
        totalTrades: wins + losses,
        maxDrawdown: maxDD * 100,
        equityCurve,
        trades
      });
      setIsRunning(false);
    }, 1200);
  };

  return (
    <div className="cyber-card border-2 rounded-[4rem] p-12 shadow-3xl relative overflow-hidden group hover:scale-[1.005] transition-all" style={{ borderColor: 'var(--border-line)' }}>
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 blur-[120px] pointer-events-none transition-all group-hover:bg-accent/10" />
      
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10 mb-20 relative z-10">
        <div className="text-start">
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic flex items-center gap-6 leading-none">
            <div className="p-5 bg-accent/10 rounded-3xl text-accent border border-accent/20 shadow-inner">
              <BarChart className="w-10 h-10" />
            </div>
            {t.backtester}
          </h2>
          <p className="text-muted text-[11px] font-black uppercase tracking-[0.5em] mt-4 ml-1 opacity-60 italic">SimEngine G8 Protocol Active</p>
        </div>

        <div className="flex flex-wrap items-center gap-8 w-full xl:w-auto">
          <div className="flex flex-wrap bg-black/30 rounded-[2.5rem] p-2.5 border border-white/5 gap-2 backdrop-blur-3xl shadow-2xl">
            {(['SMA_CROSSOVER', 'RSI_REVERSAL', 'EMA_TREND', 'MACD_CROSSOVER', 'BOLLINGER_BANDS'] as StrategyType[]).map((s) => (
              <button
                key={s}
                onClick={() => { setStrategy(s); setResult(null); }}
                className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all italic ${strategy === s ? 'bg-accent text-white shadow-xl scale-105' : 'text-muted hover:text-white hover:bg-white/5'}`}
              >
                {t[s] || s.replace('_', ' ')}
              </button>
            ))}
          </div>
          
          <button 
            onClick={runBacktest}
            disabled={isRunning}
            className={`xray-btn px-12 py-5 rounded-[2.5rem] text-white text-sm font-black uppercase tracking-[0.3em] flex items-center gap-5 disabled:opacity-50 group/btn shadow-2xl transition-all hover:scale-105`}
          >
            <Play className={`w-6 h-6 ${isRunning ? 'animate-ping' : 'group-hover:scale-110 transition-transform'}`} />
            {isRunning ? t.calculating : t.runSimulation}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
        <div className="lg:col-span-4 space-y-12">
          <div className="bg-black/40 border-2 border-white/5 rounded-[3.5rem] p-12 space-y-12 shadow-inner backdrop-blur-2xl">
            <div className="flex items-center gap-5 mb-4 text-start">
              <Settings2 className="w-6 h-6 text-accent" />
              <span className="text-[12px] font-black text-white uppercase tracking-[0.4em] italic">{t.strategyControls}</span>
            </div>
            
            <div className="space-y-10">
              <div className="space-y-5">
                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-muted">
                  <span className="flex items-center gap-4 italic opacity-60"><Info className="w-5 h-5" /> {meta.p1}</span>
                  <span className="text-accent font-mono font-black text-lg">{param1}</span>
                </div>
                <input 
                  type="range" min="2" max="50" value={param1} 
                  onChange={(e) => setParam1(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/5 rounded-full appearance-none cursor-pointer accent-accent"
                />
              </div>

              <div className="space-y-5">
                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-muted">
                  <span className="flex items-center gap-4 italic opacity-60"><Info className="w-5 h-5" /> {meta.p2}</span>
                  <span className="text-accent font-mono font-black text-lg">{param2}</span>
                </div>
                <input 
                  type="range" min="5" max="100" value={param2} 
                  onChange={(e) => setParam2(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/5 rounded-full appearance-none cursor-pointer accent-accent"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 text-start">
            <div className="bg-black/30 border border-white/10 rounded-[2.5rem] p-8 transition-all hover:border-accent shadow-2xl group/stat backdrop-blur-md">
              <span className="text-[11px] font-black text-muted uppercase tracking-[0.3em] block mb-4 group-hover/stat:text-accent transition-colors italic">{t.netProfit}</span>
              <div className={`text-3xl font-black font-mono tracking-tighter ${result && result.netProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                {result ? `${result.netProfit >= 0 ? '+' : ''}${result.netProfit.toFixed(2)}%` : '--'}
              </div>
            </div>
            <div className="bg-black/30 border border-white/10 rounded-[2.5rem] p-8 transition-all hover:border-accent shadow-2xl group/stat backdrop-blur-md">
              <span className="text-[11px] font-black text-muted uppercase tracking-[0.3em] block mb-4 group-hover/stat:text-accent transition-colors italic">{t.winRate}</span>
              <div className="text-3xl font-black font-mono text-accent tracking-tighter">
                {result ? `${result.winRate.toFixed(1)}%` : '--'}
              </div>
            </div>
            <div className="bg-black/30 border border-white/10 rounded-[2.5rem] p-8 transition-all hover:border-accent shadow-2xl group/stat backdrop-blur-md">
              <span className="text-[11px] font-black text-muted uppercase tracking-[0.3em] block mb-4 group-hover/stat:text-accent transition-colors italic">{t.totalTrades}</span>
              <div className="text-3xl font-black font-mono text-white tracking-tighter">
                {result ? result.totalTrades : '--'}
              </div>
            </div>
            <div className="bg-black/30 border border-white/10 rounded-[2.5rem] p-8 transition-all hover:border-accent shadow-2xl group/stat backdrop-blur-md">
              <span className="text-[11px] font-black text-muted uppercase tracking-[0.3em] block mb-4 group-hover/stat:text-accent transition-colors italic">{t.maxDrawdown}</span>
              <div className="text-3xl font-black font-mono text-danger tracking-tighter">
                {result ? `${result.maxDrawdown.toFixed(2)}%` : '--'}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 bg-black/10 border-2 border-white/5 rounded-[4.5rem] p-14 min-h-[600px] relative transition-all shadow-inner backdrop-blur-xl">
          {!result && !isRunning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted opacity-30">
              <RotateCcw className="w-24 h-24 mb-10 text-accent/20 animate-[spin_10s_linear_infinite]" />
              <p className="text-sm font-black uppercase tracking-[0.8em] italic">{t.awaitingLogic}</p>
            </div>
          )}
          
          {isRunning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-3xl z-10 rounded-[4.5rem]">
              <div className="w-32 h-32 border-8 border-accent/5 border-t-accent rounded-full animate-spin shadow-[0_0_50px_rgba(59,130,246,0.2)]"></div>
              <p className="mt-12 text-accent text-sm font-black uppercase tracking-[0.8em] animate-pulse italic">{t.compiling}</p>
            </div>
          )}

          {result && (
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-center mb-12">
                <span className="text-[13px] font-black text-white uppercase tracking-[0.5em] flex items-center gap-6 italic">
                  <TrendingUp className="w-6 h-6 text-success shadow-[0_0_10px_#10b981]" /> {t.growthTrajectory}
                </span>
                <div className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-muted uppercase font-black">
                  Model: {strategy}
                </div>
              </div>
              
              <div className="flex-1 min-h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={result.equityCurve}>
                    <defs>
                      <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} opacity={0.1} />
                    <XAxis dataKey="time" hide />
                    <YAxis hide domain={['dataMin - 500', 'dataMax + 500']} />
                    <Tooltip 
                      cursor={{ stroke: '#3B82F6', strokeWidth: 2, strokeDasharray: '4 4' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const val = payload[0].value as number;
                          const profit = ((val - 10000) / 100).toFixed(2);
                          return (
                            <div className="bg-navy/90 border-2 border-accent/40 p-6 rounded-[2rem] shadow-glow backdrop-blur-3xl text-start">
                              <div className="flex items-center gap-3 mb-3 border-b border-white/10 pb-3">
                                <Activity className="w-4 h-4 text-accent" />
                                <p className="text-[10px] font-black text-white uppercase tracking-widest italic">{payload[0].payload.time}</p>
                              </div>
                              <p className="text-3xl font-black font-mono text-white tracking-tighter italic leading-none">${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                              <p className={`text-[11px] font-black font-mono mt-3 flex items-center gap-2 italic ${parseFloat(profit) >= 0 ? 'text-success' : 'text-danger'}`}>
                                {parseFloat(profit) >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                {parseFloat(profit) >= 0 ? '+' : ''}{profit}%
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="balance" 
                      stroke="#3B82F6" 
                      strokeWidth={6} 
                      fill="url(#equityGradient)" 
                      animationDuration={3000}
                      activeDot={{ r: 8, stroke: '#3B82F6', strokeWidth: 2, fill: '#fff', className: 'animate-pulse' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-16 text-start">
                <div className="flex items-center gap-5 mb-8">
                  <span className="text-[12px] font-black text-muted uppercase tracking-[0.5em] italic">{t.recentLogs}</span>
                  <div className="flex-1 h-px bg-white/5"></div>
                </div>
                <div className="flex gap-8 overflow-x-auto no-scrollbar pb-6 pr-10">
                  {result.trades.slice(-6).reverse().map((t_entry, i) => (
                    <div key={i} className="flex-shrink-0 bg-black/40 border-2 border-white/5 rounded-[2.5rem] p-8 min-w-[240px] transition-all hover:border-accent hover:scale-[1.03] group/trade shadow-2xl">
                      <div className="flex justify-between items-center mb-6">
                        <span className={`text-[11px] font-black px-5 py-2 rounded-2xl uppercase tracking-widest italic shadow-inner ${t_entry.type === 'BUY' ? 'bg-success/10 text-success border border-success/20' : 'bg-danger/10 text-danger border border-danger/20'}`}>
                          {t_entry.type === 'BUY' ? t.buy : t.sell}
                        </span>
                        <span className="text-[10px] font-black text-slate-600 font-mono tracking-tighter">{t_entry.time}</span>
                      </div>
                      <div className="text-3xl font-black text-white font-mono tracking-tighter group-hover/trade:text-accent transition-colors italic leading-none">${t_entry.price.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</div>
                      <div className="text-[10px] font-black text-muted uppercase mt-5 tracking-widest opacity-40 italic">{t.price}: ${t_entry.balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Backtester;
