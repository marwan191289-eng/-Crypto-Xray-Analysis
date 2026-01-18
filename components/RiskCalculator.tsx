
import React, { useState, useEffect, useMemo } from 'react';
import { Calculator, Target, Crosshair, ShieldAlert, DollarSign, Percent, Scale, Zap, Info, ArrowUp, ArrowDown, RefreshCcw } from 'lucide-react';

interface Props {
  currentPrice: number;
  symbol: string;
  t: any;
}

const RiskCalculator: React.FC<Props> = ({ currentPrice, symbol, t }) => {
  const [balance, setBalance] = useState(10000);
  const [riskPct, setRiskPct] = useState(1.0);
  const [entryPrice, setEntryPrice] = useState(currentPrice);
  const [stopLoss, setStopLoss] = useState(currentPrice * 0.98);
  const [takeProfit, setTakeProfit] = useState(currentPrice * 1.04);
  const [direction, setDirection] = useState<'LONG' | 'SHORT'>('LONG');
  const [leverage, setLeverage] = useState(10);

  // Sync entry with live price initially, but prevent constant overwriting unless explicitly requested
  useEffect(() => {
    // Only update if the stored entry is 0 (initial load)
    if (entryPrice === 0) {
       setEntryPrice(currentPrice);
       setStopLoss(currentPrice * 0.99); // Tight default
       setTakeProfit(currentPrice * 1.02);
    }
  }, [currentPrice]); // Dependency on currentPrice is minimal now

  const syncToMarket = () => {
      setEntryPrice(currentPrice);
      if (direction === 'LONG') {
          setStopLoss(currentPrice * 0.99);
          setTakeProfit(currentPrice * 1.02);
      } else {
          setStopLoss(currentPrice * 1.01);
          setTakeProfit(currentPrice * 0.98);
      }
  };

  // Memoized Calculation Engine
  const metrics = useMemo(() => {
    const riskAmount = balance * (riskPct / 100);
    const priceDiff = Math.abs(entryPrice - stopLoss);
    
    // Avoid division by zero
    if (priceDiff === 0 || entryPrice === 0) return null;

    const priceDiffPct = priceDiff / entryPrice;
    
    // Position Size = Risk Amount / % Distance to Stop Loss
    // e.g. Risk $100, Stop is 1% away -> Position = $10,000
    let positionSizeUsd = 0;
    if (priceDiffPct > 0) positionSizeUsd = riskAmount / priceDiffPct;
    
    const positionSizeUnits = positionSizeUsd / entryPrice;
    
    const rewardDist = Math.abs(takeProfit - entryPrice);
    const rrRatio = priceDiff > 0 ? rewardDist / priceDiff : 0;
    
    // Projected Profit
    const projectedProfit = riskAmount * rrRatio;

    // Margin Required based on Leverage
    const marginRequired = positionSizeUsd / leverage;

    // Validity Check
    const isValid = direction === 'LONG' 
        ? stopLoss < entryPrice && takeProfit > entryPrice 
        : stopLoss > entryPrice && takeProfit < entryPrice;

    return { 
        riskAmount, 
        positionSizeUsd, 
        positionSizeUnits, 
        rrRatio, 
        projectedProfit,
        marginRequired,
        isValid
    };
  }, [balance, riskPct, entryPrice, stopLoss, takeProfit, direction, leverage]);

  return (
    <div className="cyber-card rounded-[2.5rem] p-6 md:p-8 border border-white/5 relative overflow-hidden group bg-[#020617] h-full flex flex-col shadow-2xl">
      {/* Background FX */}
      <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform rotate-12">
        <Calculator className="w-64 h-64 text-indigo-400" />
      </div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay pointer-events-none"></div>

      {/* --- HEADER --- */}
      <div className="flex justify-between items-start mb-8 relative z-10 border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
           <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/20 blur-lg rounded-full animate-pulse"></div>
              <div className="relative p-3 bg-slate-900 rounded-2xl border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.15)]">
                 <Crosshair className="w-6 h-6 text-indigo-400" />
              </div>
           </div>
           <div>
              <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Tactical Risk Command</h3>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mt-1">
                 <ShieldAlert size={10} className="text-emerald-500" /> Capital Preservation
              </p>
           </div>
        </div>
        
        {/* Direction Switch */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-white/10">
           <button 
              onClick={() => setDirection('LONG')}
              className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all duration-300 ${direction === 'LONG' ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'text-slate-500 hover:text-slate-300'}`}
           >
              <ArrowUp size={10} strokeWidth={4} /> Long
           </button>
           <button 
              onClick={() => setDirection('SHORT')}
              className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all duration-300 ${direction === 'SHORT' ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]' : 'text-slate-500 hover:text-slate-300'}`}
           >
              <ArrowDown size={10} strokeWidth={4} /> Short
           </button>
        </div>
      </div>

      {/* --- INPUT GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10 flex-1">
         
         {/* Left: Inputs */}
         <div className="md:col-span-7 flex flex-col gap-5">
            {/* Account & Risk Row */}
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-slate-900/40 p-3 rounded-2xl border border-white/5 hover:border-white/10 transition-colors group/input">
                  <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">Balance (USDT)</label>
                  <div className="flex items-center gap-2">
                     <DollarSign size={12} className="text-slate-600 group-focus-within/input:text-indigo-400 transition-colors" />
                     <input 
                        type="number" 
                        value={balance}
                        onChange={(e) => setBalance(Number(e.target.value))}
                        className="bg-transparent w-full text-sm font-black font-mono text-white outline-none" 
                     />
                  </div>
               </div>
               <div className="bg-slate-900/40 p-3 rounded-2xl border border-white/5 hover:border-white/10 transition-colors group/input">
                  <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">Risk %</label>
                  <div className="flex items-center gap-2">
                     <Percent size={12} className="text-slate-600 group-focus-within/input:text-amber-400 transition-colors" />
                     <input 
                        type="number" 
                        value={riskPct}
                        onChange={(e) => setRiskPct(Number(e.target.value))}
                        className="bg-transparent w-full text-sm font-black font-mono text-white outline-none" 
                     />
                  </div>
               </div>
            </div>

            {/* Price Levels */}
            <div className="space-y-4 pt-2">
               <div className="relative group">
                  <div className="flex justify-between mb-1">
                     <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Entry Price</label>
                     <button onClick={syncToMarket} className="text-[8px] font-bold text-indigo-400 uppercase flex items-center gap-1 hover:text-indigo-300">
                        <RefreshCcw size={8} /> Current: {currentPrice}
                     </button>
                  </div>
                  <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl px-4 py-3 flex items-center focus-within:border-indigo-500/50 focus-within:shadow-[0_0_15px_rgba(99,102,241,0.15)] transition-all">
                     <input 
                        type="number" 
                        value={entryPrice}
                        onChange={(e) => setEntryPrice(Number(e.target.value))}
                        className="w-full bg-transparent text-sm font-bold font-mono text-white outline-none" 
                     />
                     <span className="text-[9px] font-black text-indigo-500/50">USDT</span>
                  </div>
               </div>

               <div className="relative group">
                  <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">Stop Loss</label>
                  <div className={`bg-rose-500/5 border border-rose-500/20 rounded-xl px-4 py-3 flex items-center focus-within:border-rose-500/50 focus-within:shadow-[0_0_15px_rgba(244,63,94,0.15)] transition-all ${metrics && !metrics.isValid ? 'border-rose-500 animate-pulse' : ''}`}>
                     <input 
                        type="number" 
                        value={stopLoss}
                        onChange={(e) => setStopLoss(Number(e.target.value))}
                        className="w-full bg-transparent text-sm font-bold font-mono text-white outline-none" 
                     />
                     <span className="text-[9px] font-black text-rose-500/50">RISK</span>
                  </div>
               </div>

               <div className="relative group">
                  <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">Take Profit</label>
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-4 py-3 flex items-center focus-within:border-emerald-500/50 focus-within:shadow-[0_0_15px_rgba(16,185,129,0.15)] transition-all">
                     <input 
                        type="number" 
                        value={takeProfit}
                        onChange={(e) => setTakeProfit(Number(e.target.value))}
                        className="w-full bg-transparent text-sm font-bold font-mono text-white outline-none" 
                     />
                     <span className="text-[9px] font-black text-emerald-500/50">TARGET</span>
                  </div>
               </div>
            </div>

            {/* Leverage Slider */}
            <div className="bg-slate-900/40 p-4 rounded-2xl border border-white/5 mt-auto">
               <div className="flex justify-between mb-2">
                  <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Leverage</label>
                  <span className="text-xs font-black font-mono text-amber-400">{leverage}x</span>
               </div>
               <input 
                  type="range" 
                  min="1" 
                  max="125" 
                  step="1" 
                  value={leverage} 
                  onChange={(e) => setLeverage(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-amber-500" 
               />
            </div>
         </div>

         {/* Right: Visualizer & Results */}
         <div className="md:col-span-5 flex flex-col gap-6">
            
            {/* R:R Visualizer - Improved */}
            <div className="bg-black/30 p-5 rounded-[2rem] border border-white/5 relative overflow-hidden flex-1 flex flex-col">
               <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none"></div>
               
               <div className="flex justify-between items-center mb-4">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                     <Scale size={10} /> Risk / Reward
                  </span>
                  <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${metrics && metrics.rrRatio >= 2 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                     1 : {metrics?.rrRatio.toFixed(2)}
                  </div>
               </div>

               {/* Trade Bar Visual */}
               <div className="flex-1 w-full bg-slate-800/50 rounded-xl overflow-hidden relative flex flex-col-reverse shadow-inner">
                  {/* Reward Zone */}
                  <div className="w-full bg-gradient-to-t from-emerald-500/20 to-emerald-500/40 flex items-center justify-center border-b border-white/5 relative transition-all duration-500" style={{ flex: metrics?.rrRatio }}>
                     <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest z-10 rotate-90 md:rotate-0">Reward</span>
                     <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                  </div>
                  
                  {/* Entry Line */}
                  <div className="h-0.5 w-full bg-white z-20 shadow-[0_0_10px_white]"></div>

                  {/* Risk Zone */}
                  <div className="w-full bg-gradient-to-b from-rose-500/20 to-rose-500/40 flex items-center justify-center relative transition-all duration-500" style={{ flex: 1 }}>
                     <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest z-10 rotate-90 md:rotate-0">Risk</span>
                     <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                  </div>
               </div>

               {/* Projected Outcome PnL */}
               <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="text-center p-2 bg-rose-500/5 rounded-lg border border-rose-500/10">
                     <span className="text-[7px] font-black text-rose-500 uppercase block">Loss</span>
                     <span className="text-[10px] font-mono font-bold text-white">-${metrics?.riskAmount.toFixed(0)}</span>
                  </div>
                  <div className="text-center p-2 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                     <span className="text-[7px] font-black text-emerald-500 uppercase block">Profit</span>
                     <span className="text-[10px] font-mono font-bold text-white">+${metrics?.projectedProfit.toFixed(0)}</span>
                  </div>
               </div>
            </div>

            {/* Position Sizing Card */}
            <div className="bg-indigo-600/10 p-5 rounded-[2rem] border border-indigo-500/30 relative overflow-hidden group/size">
               <div className="absolute inset-0 bg-indigo-500/10 blur-xl opacity-0 group-hover/size:opacity-100 transition-opacity"></div>
               <div className="relative z-10">
                  <span className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                     <Target size={12} /> Position Size
                  </span>
                  
                  <div className="flex flex-col gap-1">
                     <span className="text-2xl font-black font-mono text-white tracking-tighter drop-shadow-md">
                        ${metrics?.positionSizeUsd.toLocaleString(undefined, {maximumFractionDigits: 0})}
                     </span>
                     <span className="text-[9px] font-bold text-indigo-300/70 font-mono">
                        {metrics?.positionSizeUnits.toFixed(4)} {symbol}
                     </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-indigo-500/20 flex justify-between items-center">
                     <span className="text-[8px] font-bold text-slate-400 uppercase">Margin Reqd.</span>
                     <span className="text-[10px] font-black font-mono text-white">${metrics?.marginRequired.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                  </div>
               </div>
            </div>

            {/* Error State */}
            {metrics && !metrics.isValid && (
               <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 animate-pulse">
                  <Info size={14} className="text-rose-400" />
                  <span className="text-[9px] font-bold text-rose-400 uppercase tracking-widest">Invalid Parameters</span>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default RiskCalculator;
