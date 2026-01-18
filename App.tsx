
import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { 
  Globe, LayoutDashboard, TrendingUp, Ship, Database, Brain, Settings, Layers, Menu, Wifi, Mail, ScanEye, Clock, LogOut, MessageCircle, ArrowRight, Loader2
} from 'lucide-react';
import { MarketData, BlockchainStats, AIAnalysis, MLPrediction, WhaleBearMetrics, OnChainMetrics, SocialMetrics } from './types';
import { translations, Language } from './translations';
import MarketChart from './components/MarketChart';
import MarketOverviewHeader from './components/MarketOverviewHeader';
import AuthSystem from './components/AuthSystem';
import Logo from './components/Logo';
import MarketWeather from './components/MarketWeather';
import { ToastProvider, useToast } from './context/ToastContext';
import { storageService } from './services/storageService';
import { analyzeMarket } from './services/geminiService';
import { fetchMarketData, fetchBlockchainStats, fetchHistory, fetchOnChainMetrics, fetchSocialMetrics, fetchWhaleBearMetrics, fetchCEXMetrics } from './services/marketService';
import { runMLInference } from './services/mlService';

// Lazy Load Heavy Components for Performance Optimization
const TradeXrayAI = React.lazy(() => import('./components/TradeXrayAI'));
const TradingSignals = React.lazy(() => import('./components/TradingSignals'));
const OrderBook = React.lazy(() => import('./components/OrderBook'));
const DepthChart = React.lazy(() => import('./components/DepthChart'));
const Backtester = React.lazy(() => import('./components/Backtester'));
const MachineLearningPredictor = React.lazy(() => import('./components/MachineLearningPredictor'));
const SocialIntel = React.lazy(() => import('./components/SocialIntel'));
const TechnicalForensics = React.lazy(() => import('./components/TechnicalForensics'));
const LiquidityFlowMatrix = React.lazy(() => import('./components/LiquidityFlowMatrix'));
const WhaleBearForensics = React.lazy(() => import('./components/WhaleBearForensics'));
const AIScenarioSimulator = React.lazy(() => import('./components/AIScenarioSimulator'));
const SystemArchitectureMonitor = React.lazy(() => import('./components/SystemArchitectureMonitor'));
const CEXIntel = React.lazy(() => import('./components/CEXIntel'));
const OnChainIntel = React.lazy(() => import('./components/OnChainIntel'));

const COIN_LOGOS: Record<string, string> = {
  BTC: "https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=032",
  ETH: "https://cryptologos.cc/logos/ethereum-eth-logo.png?v=032",
  SOL: "https://cryptologos.cc/logos/solana-sol-logo.png?v=032",
  LTC: "https://cryptologos.cc/logos/litecoin-ltc-logo.png?v=032",
  BNB: "https://cryptologos.cc/logos/bnb-bnb-logo.png?v=032",
  AAVE: "https://cryptologos.cc/logos/aave-aave-logo.png?v=032",
  ADA: "https://cryptologos.cc/logos/cardano-ada-logo.png?v=032",
  BCH: "https://cryptologos.cc/logos/bitcoin-cash-bch-logo.png?v=032",
  XRP: "https://cryptologos.cc/logos/xrp-xrp-logo.png?v=032"
};

// --- Main App Content Wrapper to use Hooks ---
const AppContent: React.FC = () => {
  const { addToast } = useToast();
  
  // Load initial preferences
  const prefs = useMemo(() => storageService.loadPreferences(), []);

  const [lang, setLang] = useState<Language>((prefs.language as Language) || 'en');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const t = translations[lang];

  const [user, setUser] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Sync Preferences
  useEffect(() => {
    storageService.savePreferences({ language: lang });
  }, [lang]);

  // Time ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auth Handling
  useEffect(() => {
    const savedUser = localStorage.getItem('g8_current_user');
    if (savedUser) { setUser(JSON.parse(savedUser)); setShowAuth(false); }
  }, []);

  const handleAuthSuccess = (userData: any) => {
    setUser(userData); localStorage.setItem('g8_current_user', JSON.stringify(userData)); setShowAuth(false);
    addToast(`Welcome back, Operator ${userData.id || ''}`, 'success');
  };

  const handleLogout = () => {
    localStorage.removeItem('g8_current_user');
    setUser(null);
    setShowAuth(true);
    setIsProfileOpen(false);
    addToast('Session Terminated Securely', 'info');
  };

  const [selectedSymbol, setSelectedSymbol] = useState(prefs.selectedSymbol || 'BTC');
  const [chartTimeframe, setChartTimeframe] = useState(prefs.chartTimeframe || '1H');
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [stats, setStats] = useState<BlockchainStats>({ ethGasPrice: 0, btcHashrate: '0', totalMarketCap: 0, activeAddresses: 0 });
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | undefined>();
  const [mlPrediction, setMlPrediction] = useState<MLPrediction | undefined>();
  const [signalHistory, setSignalHistory] = useState<any[]>([]);
  const [cexMetrics, setCexMetrics] = useState<Record<string, any>>({});
  const [whaleBearMetrics, setWhaleBearMetrics] = useState<Record<string, WhaleBearMetrics>>({});
  const [onChainMetrics, setOnChainMetrics] = useState<Record<string, OnChainMetrics>>({});
  const [socialMetrics, setSocialMetrics] = useState<Record<string, SocialMetrics>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMLRunning, setIsMLRunning] = useState(false);

  // Sync State Changes to Storage
  useEffect(() => {
    storageService.savePreferences({ selectedSymbol, chartTimeframe });
  }, [selectedSymbol, chartTimeframe]);

  const currentMarket = useMemo(() => markets.find(m => m.symbol === selectedSymbol), [markets, selectedSymbol]);

  // Optimized Mapping: Maps UI View Range -> Binance API Interval & Limit
  const getTimeframeParams = (tf: string) => {
    switch(tf) {
      case '1H': return { interval: '1m', limit: 60 };
      case '4H': return { interval: '5m', limit: 48 };
      case '12H': return { interval: '15m', limit: 48 };
      case '1D': return { interval: '30m', limit: 48 };
      case '3D': return { interval: '1h', limit: 72 };
      case '1W': return { interval: '4h', limit: 42 };
      case '1M': return { interval: '1d', limit: 30 };
      default: return { interval: '15m', limit: 60 };
    }
  };

  const updateMarketData = useCallback(async () => {
    try {
      const { interval, limit } = getTimeframeParams(chartTimeframe);
      const watched = prefs.watchedSymbols; 
      
      const updatedMarkets = await Promise.all(watched.map(async (s) => {
        const live = await fetchMarketData(s);
        const history = await fetchHistory(s, interval, limit);
        return { symbol: s, price: live.price || 0, change24h: live.change24h ?? 0, history } as any;
      }));
      setMarkets(updatedMarkets);
      
      const currentPrice = updatedMarkets.find(m => m.symbol === selectedSymbol)?.price || 0;
      
      const [ocm, wbm, soc, cex, bcStats] = await Promise.all([
        fetchOnChainMetrics(selectedSymbol), 
        fetchWhaleBearMetrics(selectedSymbol, currentPrice),
        fetchSocialMetrics(selectedSymbol), 
        fetchCEXMetrics(selectedSymbol), 
        fetchBlockchainStats()
      ]);
      
      setOnChainMetrics(prev => ({ ...prev, [selectedSymbol]: ocm }));
      setWhaleBearMetrics(prev => ({ ...prev, [selectedSymbol]: wbm }));
      setSocialMetrics(prev => ({ ...prev, [selectedSymbol]: soc }));
      setCexMetrics(prev => ({ ...prev, [selectedSymbol]: cex }));
      setStats(prev => ({ ...prev, ...bcStats }));
    } catch (e: any) { 
      console.error(e);
      // We don't toast on background interval updates to avoid spam, but log it
    }
  }, [selectedSymbol, chartTimeframe, prefs.watchedSymbols]);

  useEffect(() => { 
    updateMarketData(); 
    const interval = setInterval(updateMarketData, 30000); 
    return () => clearInterval(interval); 
  }, [updateMarketData]);

  const handleRefreshAI = useCallback(async () => {
    if (!currentMarket || isAnalyzing) return;
    setIsAnalyzing(true); setIsMLRunning(true);
    addToast(`Initiating Forensic Scan on ${currentMarket.symbol}...`, 'info');
    
    try {
      const [aiResult, mlResult] = await Promise.all([analyzeMarket(currentMarket), runMLInference(currentMarket)]);
      
      setAiAnalysis(aiResult); 
      setMlPrediction(mlResult);

      setSignalHistory(prev => [{
         id: Date.now(),
         time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}),
         type: aiResult.signal,
         price: currentMarket.price,
         score: aiResult.score,
         symbol: currentMarket.symbol
      }, ...prev].slice(0, 50));

      addToast(`Analysis Complete: ${aiResult.signal} (${aiResult.confidence}%)`, 'success');

    } catch (e: any) { 
      console.warn(e); 
      addToast(`Analysis Failed: ${e.message}`, 'error');
    } finally { 
      setIsAnalyzing(false); 
      setIsMLRunning(false); 
    }
  }, [currentMarket, isAnalyzing, addToast]);

  useEffect(() => { if (currentMarket && !aiAnalysis && !isAnalyzing) handleRefreshAI(); }, [currentMarket, aiAnalysis, handleRefreshAI]);

  if (showAuth) return <AuthSystem lang={lang} t={t} onAuthSuccess={handleAuthSuccess} onGuestAccess={() => setShowAuth(false)} />;

  const LoadingFallback = () => (
    <div className="flex flex-col items-center justify-center h-96 w-full animate-pulse">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Initializing Neural Uplink...</span>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#010204] text-slate-200 font-sans overflow-hidden relative">
      
      {/* --- Ambient Market Weather Effect --- */}
      <MarketWeather sentiment={aiAnalysis?.sentiment || 'NEUTRAL'} />

      {/* Sidebar - Desktop */}
      <aside className="hidden xl:flex w-80 flex-col border-r border-white/5 bg-[#020617]/90 backdrop-blur-2xl z-20 transition-all duration-300 relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,rgba(0,240,255,0.05),transparent_40%)] pointer-events-none"></div>

        <div className="p-6 relative z-10">
          {/* Logo & Branding Card */}
          <div className="mb-10 bg-[#030712] p-5 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden group">
            {/* Holographic Background */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#00F0FF]/10 blur-[60px] rounded-full group-hover:bg-[#00F0FF]/20 transition-all duration-700 animate-pulse"></div>
            
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="w-16 h-16 relative shrink-0">
                 <div className="absolute inset-0 bg-gradient-to-br from-[#00F0FF] to-blue-600 rounded-2xl blur-md opacity-40 group-hover:opacity-60 transition-opacity animate-pulse"></div>
                 <div className="relative w-full h-full bg-[#050914] rounded-2xl border border-white/10 flex items-center justify-center p-3 shadow-inner overflow-hidden">
                    <Logo className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]" />
                 </div>
              </div>

              <div className="flex flex-col justify-center">
                 <h1 className="text-xl font-black italic tracking-tighter leading-none mb-1 whitespace-nowrap text-navy-gold">
                   Bull & Bear Eye
                 </h1>
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] to-[#0099FF] drop-shadow-[0_0_5px_rgba(0,240,255,0.5)] animate-pulse mb-0.5">
                      TradeXray
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-[#D946EF] to-[#8B5CF6] drop-shadow-[0_0_5px_rgba(217,70,239,0.5)] animate-pulse delay-100 mb-1">
                      Alpha Eye
                    </span>
                 </div>
              </div>
            </div>
          </div>
          
          <div className="mb-8">
             <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-4 px-2">Watched Assets</span>
             <div className="grid grid-cols-3 gap-2">
                {prefs.watchedSymbols.map(s => (
                   <button 
                     key={s} 
                     onClick={() => setSelectedSymbol(s)} 
                     className={`p-2 rounded-xl border transition-all flex flex-col items-center gap-1 group relative overflow-hidden ${selectedSymbol === s ? 'bg-indigo-600/20 border-indigo-500/50 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] scale-105' : 'bg-slate-900/50 border-white/5 text-slate-500 hover:bg-slate-800 hover:border-white/10 hover:scale-105'}`}
                   >
                      <div className={`absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 transition-opacity ${selectedSymbol === s ? 'opacity-100' : 'group-hover:opacity-100'}`}></div>
                      <img src={COIN_LOGOS[s]} alt={s} className="w-5 h-5 group-hover:scale-110 transition-transform relative z-10" />
                      <span className="text-[9px] font-bold relative z-10">{s}</span>
                   </button>
                ))}
             </div>
          </div>

          <nav className="space-y-1">
            {[
              { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
              { id: 'markets', label: t.markets, icon: Globe },
              { id: 'signals', label: t.signals, icon: TrendingUp },
              { id: 'whaleBear', label: t.whaleBearMatrix, icon: Ship },
              { id: 'onChain', label: t.onChainIntel, icon: Database },
              { id: 'quantum', label: t.quantumIntelligence, icon: Brain },
              { id: 'settings', label: t.settings, icon: Settings },
            ].map((item) => (
              <button 
                key={item.id} 
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-all duration-300 text-xs font-bold uppercase tracking-wide group relative overflow-hidden hover:pl-5 ${activeTab === item.id ? 'text-white shadow-lg' : 'text-slate-500 hover:text-slate-200'}`}
              >
                {activeTab === item.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent border-l-2 border-[#00F0FF]"></div>
                )}
                <item.icon size={16} className={`relative z-10 transition-colors ${activeTab === item.id ? 'text-[#00F0FF] drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]' : 'text-slate-600 group-hover:text-slate-400'}`} />
                <span className="relative z-10">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-white/5">
           <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-900/20 to-slate-900 border border-indigo-500/10 group">
              <div className="flex items-center gap-3 mb-2">
                 <div className="relative">
                    <Wifi className="w-4 h-4 text-emerald-400" />
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                 </div>
                 <span className="text-[9px] font-black text-white uppercase tracking-widest group-hover:text-emerald-400 transition-colors">System Online</span>
              </div>
              <p className="text-[8px] text-slate-500 font-mono">Ping: 12ms • G8 Node</p>
           </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative z-10">
        <header className="header-luxury px-6 py-4 flex items-center justify-between bg-[#020617]/90 backdrop-blur-xl border-b border-white/5 z-30">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-4 xl:hidden">
                  <button className="p-2 bg-white/5 rounded-xl border border-white/10 text-white hover:bg-white/10 transition-colors" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    <Menu size={20} />
                  </button>
                  <Logo className="w-8 h-8" />
                  <div className="flex flex-col">
                     <span className="text-[10px] font-black leading-none text-[#00F0FF] tracking-widest">B&B Eye</span>
                     <span className="text-[8px] font-bold text-slate-500 leading-none tracking-wider">Terminal</span>
                  </div>
              </div>

              <div className="hidden xl:flex bg-slate-900/80 px-4 py-2 rounded-full border border-white/10 items-center gap-3 hover:border-indigo-500/30 transition-colors cursor-pointer group">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest group-hover:text-indigo-400 transition-colors">Asset</span>
                <span className="text-xs font-black text-white flex items-center gap-1.5">
                    <img src={COIN_LOGOS[selectedSymbol]} className="w-4 h-4" alt="" /> {selectedSymbol}/USDT
                </span>
              </div>
           </div>

           <div className="hidden 2xl:flex flex-col items-center absolute left-1/2 -translate-x-1/2 pointer-events-none">
              <h1 className="text-3xl font-black italic uppercase tracking-tighter leading-none mb-1 whitespace-nowrap text-navy-gold">
                 Bull & Bear Eye
              </h1>
              <div className="flex flex-col items-center gap-0.5">
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] to-[#0099FF] drop-shadow-[0_0_5px_rgba(0,240,255,0.5)] animate-pulse">TradeXray</span>
                 <span className="text-[8px] font-black uppercase tracking-[0.45em] text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-white drop-shadow-[0_0_12px_rgba(0,240,255,0.9)] mt-1.5 animate-pulse whitespace-nowrap">
                   See Inside The Price
                 </span>
              </div>
           </div>

           <div className="flex items-center gap-5">
              <button 
                onClick={handleRefreshAI}
                className="btn-alpha-xray px-6 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 group cursor-pointer bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF] hover:bg-[#00F0FF]/20 hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all"
              >
                  <ScanEye size={16} className={`group-hover:text-white ${isAnalyzing ? 'animate-spin' : 'animate-pulse'}`} />
                  {isAnalyzing ? 'Scanning...' : 'Alpha Eye X-Ray'}
              </button>

              <div className="flex items-center gap-3">
                 <button 
                   onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} 
                   className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/30 transition-all text-slate-400 hover:text-white"
                 >
                    <span className="text-[9px] font-black uppercase">{lang === 'en' ? 'EN' : 'AR'}</span>
                 </button>
              </div>
              
              <div className="h-8 w-px bg-white/10 hidden md:block"></div>

              <div className="relative hidden md:block">
                  <div 
                    className="flex items-center gap-3 pl-2 group cursor-pointer"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                  >
                     <div className="text-right hidden lg:block">
                        <span className="text-[10px] font-black text-white uppercase block group-hover:text-[#00F0FF] transition-colors">{user?.id || 'OPERATOR'}</span>
                        <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-wider block">Level 1 Clearance</span>
                     </div>
                     <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00F0FF] to-blue-600 p-[2px] shadow-lg group-hover:scale-105 transition-transform group-hover:shadow-[0_0_15px_rgba(0,240,255,0.5)]">
                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-xs font-black text-white">
                            {user?.email?.[0].toUpperCase() || 'OP'}
                        </div>
                     </div>
                  </div>

                  {isProfileOpen && (
                    <div className="absolute top-full right-0 mt-2 w-64 bg-slate-950/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-[fadeIn_0.2s_ease-out]">
                      <div className="p-4 border-b border-white/5 bg-white/5">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Current Session</p>
                        <p className="text-xs font-bold text-white truncate">{user?.email || 'Guest Operator'}</p>
                        <div className="flex items-center gap-2 mt-2">
                           <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[9px] font-black uppercase border border-indigo-500/30">
                              {user?.role || 'GUEST'}
                           </span>
                           <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase border border-emerald-500/30">
                              ACTIVE
                           </span>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-white/10">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Active Session</span>
                            <div className="flex items-center gap-2 text-xs font-mono font-black text-white">
                                <Clock size={12} className="text-indigo-400" />
                                {currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})} UTC
                            </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 transition-all group"
                        >
                           <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-rose-500/20 transition-colors">
                              <LogOut size={14} />
                           </div>
                           <span className="text-[10px] font-black uppercase tracking-widest">Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
              </div>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 custom-scrollbar scroll-smooth relative">
           <MarketOverviewHeader stats={stats} aiAnalysis={aiAnalysis} t={t} />

           <div className="xl:hidden grid grid-cols-4 gap-2 mb-4">
              {prefs.watchedSymbols.slice(0,4).map(s => (
                 <button key={s} onClick={() => setSelectedSymbol(s)} className={`p-2 rounded-lg text-[10px] font-black border transition-all ${selectedSymbol === s ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg scale-105' : 'bg-slate-900 text-slate-400 border-white/10'}`}>{s}</button>
              ))}
           </div>

           {currentMarket && (
             <Suspense fallback={<LoadingFallback />}>
               <div className="flex flex-col gap-10">
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                     <div className="xl:col-span-12 w-full bg-slate-950/60 rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl relative backdrop-blur-sm cyber-card">
                        <MarketChart 
                           data={currentMarket} 
                           analysis={aiAnalysis} 
                           t={t} 
                           timeframe={chartTimeframe}
                           onTimeframeChange={setChartTimeframe}
                        />
                     </div>
                  </div>

                  <TradingSignals currentAnalysis={aiAnalysis} history={signalHistory} t={t} />
                  <TradeXrayAI analysis={aiAnalysis} isLoading={isAnalyzing} t={t} currentPrice={currentMarket.price} />
                  <MachineLearningPredictor prediction={mlPrediction} isLoading={isMLRunning} currentPrice={currentMarket.price} t={t} onValidate={handleRefreshAI} />
                  <LiquidityFlowMatrix data={currentMarket} isLoading={!currentMarket} t={t} />
                  <WhaleBearForensics metrics={whaleBearMetrics[selectedSymbol]} whaleTx={onChainMetrics[selectedSymbol]?.whaleTransactions || []} symbol={selectedSymbol} isLoading={!whaleBearMetrics[selectedSymbol]} t={t} currentPrice={currentMarket.price} />
                  <TechnicalForensics data={currentMarket} isLoading={!currentMarket} t={t} />
                  <SocialIntel metrics={socialMetrics[selectedSymbol]} symbol={selectedSymbol} isLoading={!socialMetrics[selectedSymbol]} t={t} />
                  <OnChainIntel metrics={onChainMetrics[selectedSymbol]} symbol={selectedSymbol} isLoading={!onChainMetrics[selectedSymbol]} t={t} />
                  <CEXIntel metrics={cexMetrics[selectedSymbol]} symbol={selectedSymbol} isLoading={!cexMetrics[selectedSymbol]} t={t} />
                  <OrderBook price={currentMarket.price} symbol={currentMarket.symbol} t={t} />
                  <DepthChart price={currentMarket.price} t={t} />
                  <AIScenarioSimulator prediction={mlPrediction} currentPrice={currentMarket.price} isLoading={isMLRunning} t={t} />
                  <Backtester marketData={currentMarket} t={t} />
                  <SystemArchitectureMonitor t={t} />
               </div>
             </Suspense>
           )}

           <footer className="relative mt-20 bg-[#030712] border-t border-white/5 pt-16 pb-8 overflow-hidden rounded-[4rem] mx-2 md:mx-4 mb-4">
              {/* Background FX */}
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none"></div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>

              <div className="max-w-[1600px] mx-auto px-6 md:px-12 relative z-10">
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 mb-16">
                      {/* Brand Column */}
                      <div className="xl:col-span-4 flex flex-col gap-8">
                          <div className="flex items-center gap-5">
                              <div className="w-16 h-16 rounded-full bg-slate-950 border border-white/10 flex items-center justify-center shadow-2xl group hover:scale-110 transition-transform duration-500">
                                  <Logo className="w-8 h-8 opacity-90 group-hover:opacity-100 transition-opacity drop-shadow-[0_0_15px_rgba(0,240,255,0.5)]" />
                              </div>
                              <div>
                                  <h4 className="text-lg font-black uppercase tracking-tighter text-[#00F0FF] drop-shadow-[0_0_10px_rgba(0,240,255,0.3)]">Bull & Bear Eye</h4>
                                  <h5 className="text-xs font-bold uppercase tracking-[0.2em] flex gap-2 mt-1">
                                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] to-[#0099FF]">TradeXray</span>
                                      <span className="text-slate-600">|</span>
                                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D946EF] to-[#8B5CF6]">Alpha Eye</span>
                                  </h5>
                                  <p className="text-[7px] font-black uppercase tracking-[0.4em] text-slate-500 mt-2">Elite Institutional Terminal</p>
                              </div>
                          </div>
                          
                          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
                              <div className="flex justify-between items-center mb-2">
                                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">System Status</span>
                                  <span className="flex items-center gap-1.5 text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> Operational
                                  </span>
                              </div>
                              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500 w-[98%] shadow-[0_0_10px_#10b981]"></div>
                              </div>
                          </div>
                      </div>

                      {/* Contact Column */}
                      <div className="xl:col-span-4 flex flex-col gap-6">
                          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] pl-1">Secure Communications</h4>
                          
                          {/* WhatsApp */}
                          <a href="https://wa.me/971585592355" target="_blank" rel="noreferrer" className="group flex items-center gap-5 p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-emerald-500/5 hover:border-emerald-500/30 transition-all duration-300 relative overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              <div className="relative p-3 bg-slate-900 rounded-xl border border-white/10 group-hover:border-emerald-500/50 group-hover:text-emerald-400 text-slate-400 transition-colors shadow-lg">
                                  <MessageCircle size={22} />
                              </div>
                              <div className="relative">
                                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.2em] block mb-1 group-hover:text-emerald-400/80 transition-colors">Encrypted Line</span>
                                  <span className="text-base font-mono font-black text-white tracking-wider group-hover:text-emerald-400 transition-colors">+971 58 559 2355</span>
                              </div>
                              <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 absolute right-5 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0" />
                          </a>

                          {/* Email */}
                          <div className="group flex flex-col gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-indigo-500/5 hover:border-indigo-500/30 transition-all duration-300 relative overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              <div className="relative flex items-center gap-5">
                                  <div className="p-3 bg-slate-900 rounded-xl border border-white/10 group-hover:border-indigo-500/50 group-hover:text-indigo-400 text-slate-400 transition-colors shadow-lg">
                                      <Mail size={22} />
                                  </div>
                                  <div>
                                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.2em] block mb-1 group-hover:text-indigo-400/80 transition-colors">Direct Uplink</span>
                                      <a href="mailto:info@tradexray.com" className="text-sm font-mono font-black text-white tracking-wider hover:text-indigo-400 block transition-colors mb-1">info@tradexray.com</a>
                                      <a href="mailto:marwan191289@yahoo.com" className="text-xs font-mono font-bold text-slate-500 hover:text-white block transition-colors">marwan191289@yahoo.com</a>
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* Info / Clock Column */}
                      <div className="xl:col-span-4 flex flex-col justify-between gap-6 xl:items-end text-left xl:text-right">
                           <div className="flex flex-col xl:items-end gap-2">
                               <div className="flex items-center gap-2 bg-slate-900 border border-white/10 px-4 py-2 rounded-full shadow-lg">
                                   <Clock size={14} className="text-indigo-400 animate-pulse" />
                                   <span className="text-sm font-mono font-black text-white tracking-tight">
                                       {currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})} <span className="text-[10px] text-slate-500">UTC</span>
                                   </span>
                               </div>
                               <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mr-2">
                                   {currentTime.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                               </span>
                           </div>

                           <div className="flex flex-col xl:items-end gap-4 mt-auto">
                               <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                                   Architect & Lead Developer
                               </div>
                               <div className="text-xl font-black italic tracking-tighter text-white bg-clip-text text-transparent bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#b38728] drop-shadow-[0_0_10px_rgba(252,211,77,0.3)]">
                                   Marwan Negm
                               </div>
                               <div className="flex gap-4 mt-2">
                                  <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest hover:text-white cursor-pointer transition-colors">Privacy Protocol</span>
                                  <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest hover:text-white cursor-pointer transition-colors">Terms of Engagement</span>
                               </div>
                           </div>
                      </div>
                  </div>

                  {/* Copyright Bar */}
                  <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                      <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">© 2025 Marwan Negm. All Rights Reserved.</p>
                      <span className="text-[8px] font-black text-slate-700 uppercase tracking-[0.4em]">G8-Node / Tensor-Core v4.5</span>
                  </div>
              </div>
           </footer>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
};

export default App;
