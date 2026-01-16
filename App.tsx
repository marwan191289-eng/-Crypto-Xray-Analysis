
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  Globe, Zap, Target, Activity, LayoutDashboard, 
  TrendingUp, Ship, Database, Brain, Settings, Cpu, ShieldCheck, 
  Terminal, Lock, ChevronRight, Clock, 
  Network, Wifi, Shield, Fingerprint, Award, Layers, ScanText,
  RefreshCw, Menu, X, ArrowUpRight, Github, Twitter as TwitterIcon, Mail, Sparkles, LogOut, MessageCircle
} from 'lucide-react';
import { MarketData, BlockchainStats, AIAnalysis, MLPrediction, WhaleBearMetrics, OnChainMetrics, SocialMetrics } from './types';
import { translations, Language } from './translations';
import MarketChart from './components/MarketChart';
import TradeXrayAI from './components/TradeXrayAI';
import OrderBook from './components/OrderBook';
import DepthChart from './components/DepthChart';
import Backtester from './components/Backtester';
import MachineLearningPredictor from './components/MachineLearningPredictor';
import SocialIntel from './components/SocialIntel';
import TechnicalForensics from './components/TechnicalForensics';
import LiquidityFlowMatrix from './components/LiquidityFlowMatrix';
import WhaleBearForensics from './components/WhaleBearForensics';
import AIScenarioSimulator from './components/AIScenarioSimulator';
import SystemArchitectureMonitor from './components/SystemArchitectureMonitor';
import CEXIntel from './components/CEXIntel';
import OnChainIntel from './components/OnChainIntel';
import MarketOverviewHeader from './components/MarketOverviewHeader';
import AuthSystem from './components/AuthSystem';
import { analyzeMarket } from './services/geminiService';
import { fetchMarketData, fetchBlockchainStats, fetchHistory, fetchOnChainMetrics, fetchSocialMetrics, fetchWhaleBearMetrics, fetchCEXMetrics } from './services/marketService';
import { runMLInference } from './services/mlService';

// --- Static Helpers & Assets ---

const WATCHED_SYMBOLS = ['BTC', 'ETH', 'SOL', 'LTC', 'BNB', 'AAVE', 'ADA', 'BCH', 'XRP'];

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

const BRAND_LOGO_URL = "https://raw.githubusercontent.com/MarwanNegm/BullBearEye/main/logo.png";
const LOCAL_LOGO = "./logo.png"; 
const EMERGENCY_LOGO = "https://cdn-icons-png.flaticon.com/512/2091/2091665.png";

const BuildingIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
    <line x1="9" y1="22" x2="9" y2="22.01"></line>
    <line x1="15" y1="22" x2="15" y2="22.01"></line>
    <line x1="12" y1="22" x2="12" y2="22.01"></line>
    <line x1="12" y1="2" x2="12" y2="22"></line>
    <line x1="4" y1="10" x2="20" y2="10"></line>
    <line x1="4" y1="14" x2="20" y2="14"></line>
    <line x1="4" y1="18" x2="20" y2="18"></line>
  </svg>
);

const GUEST_TIMEOUT_MS = 60 * 60 * 1000; // 60 minutes

// --- Main Component ---

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState('dashboard');
  const t = translations[lang];

  // Auth State
  const [user, setUser] = useState<any>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [guestStartTime, setGuestStartTime] = useState<number | null>(null);
  const [showAuth, setShowAuth] = useState(true);

  const dashboardRef = useRef<HTMLDivElement>(null);
  const marketsRef = useRef<HTMLDivElement>(null);
  const signalsRef = useRef<HTMLDivElement>(null);
  const whaleBearRef = useRef<HTMLDivElement>(null);
  const onChainRef = useRef<HTMLDivElement>(null);
  const quantumRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  // Check Session on Mount
  useEffect(() => {
    const savedUser = localStorage.getItem('g8_current_user');
    const savedGuestStart = localStorage.getItem('g8_guest_start');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setShowAuth(false);
    } else if (savedGuestStart) {
      const startTime = parseInt(savedGuestStart);
      if (Date.now() - startTime < GUEST_TIMEOUT_MS) {
        setIsGuest(true);
        setGuestStartTime(startTime);
        setShowAuth(false);
      } else {
        localStorage.removeItem('g8_guest_start');
      }
    }
  }, []);

  // Guest Expiry Watcher
  useEffect(() => {
    if (isGuest && guestStartTime) {
      const timer = setInterval(() => {
        if (Date.now() - guestStartTime >= GUEST_TIMEOUT_MS) {
          handleLogout();
          alert(t.sessionExpired);
        }
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [isGuest, guestStartTime, t]);

  const handleAuthSuccess = (userData: any) => {
    setUser(userData);
    localStorage.setItem('g8_current_user', JSON.stringify(userData));
    setShowAuth(false);
  };

  const handleGuestAccess = () => {
    const now = Date.now();
    setIsGuest(true);
    setGuestStartTime(now);
    localStorage.setItem('g8_guest_start', now.toString());
    setShowAuth(false);
  };

  const handleLogout = () => {
    setUser(null);
    setIsGuest(false);
    setGuestStartTime(null);
    localStorage.removeItem('g8_current_user');
    localStorage.removeItem('g8_guest_start');
    setShowAuth(true);
  };

  const [selectedSymbol, setSelectedSymbol] = useState('BTC');
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [stats, setStats] = useState<BlockchainStats>({ ethGasPrice: 0, btcHashrate: '645.2 EH/s', totalMarketCap: 2.6, activeAddresses: 1200000 });
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | undefined>();
  const [mlPrediction, setMlPrediction] = useState<MLPrediction | undefined>();
  
  const [cexMetrics, setCexMetrics] = useState<Record<string, any>>({});
  const [whaleBearMetrics, setWhaleBearMetrics] = useState<Record<string, WhaleBearMetrics>>({});
  const [onChainMetrics, setOnChainMetrics] = useState<Record<string, OnChainMetrics>>({});
  const [socialMetrics, setSocialMetrics] = useState<Record<string, SocialMetrics>>({});
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMLRunning, setIsMLRunning] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [nodeLatency, setNodeLatency] = useState(8);

  const currentMarket = useMemo(() => markets.find(m => m.symbol === selectedSymbol), [markets, selectedSymbol]);

  useEffect(() => {
    let state = 'neutral';
    if (currentMarket) {
      if (currentMarket.change24h >= 0.5) state = 'bullish';
      else if (currentMarket.change24h <= -0.5) state = 'bearish';
      else state = 'sideways';
    }
    window.dispatchEvent(new CustomEvent('market-state', { detail: state }));
  }, [currentMarket]); 

  const updateMarketData = useCallback(async () => {
    try {
      const updatedMarkets = await Promise.all(WATCHED_SYMBOLS.map(async (s) => {
        const live = await fetchMarketData(s);
        const history = await fetchHistory(s, 100);
        return { 
          symbol: s, 
          price: live.price || 0, 
          change24h: live.change24h ?? 0, 
          high24h: live.high24h ?? 0, 
          low24h: live.low24h ?? 0, 
          volume24h: live.volume24h ?? 0, 
          history 
        } as MarketData;
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
      setNodeLatency(Math.floor(Math.random() * 4) + 6);
    } catch (e) { console.error(e); }
  }, [selectedSymbol]);

  const handleGlobalRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    await updateMarketData();
    setTimeout(() => setIsRefreshing(false), 800);
  }, [isRefreshing, updateMarketData]);

  const handleRefreshAI = useCallback(async () => {
    if (!currentMarket || isAnalyzing || isMLRunning) return;
    setIsAnalyzing(true);
    setIsMLRunning(true);
    try {
      const [aiResult, mlResult] = await Promise.all([
        analyzeMarket(currentMarket),
        runMLInference(currentMarket)
      ]);
      setAiAnalysis(aiResult);
      setMlPrediction(mlResult);
    } catch (e) { console.warn(e); } finally {
      setIsAnalyzing(false);
      setIsMLRunning(false);
    }
  }, [currentMarket, isAnalyzing, isMLRunning]);

  useEffect(() => {
    updateMarketData();
    const interval = setInterval(updateMarketData, 30000);
    return () => clearInterval(interval);
  }, [updateMarketData]);

  useEffect(() => {
    setAiAnalysis(undefined);
    setMlPrediction(undefined);
  }, [selectedSymbol]);

  useEffect(() => {
    if (currentMarket && !aiAnalysis && !isAnalyzing) handleRefreshAI();
  }, [currentMarket, aiAnalysis, isAnalyzing, handleRefreshAI]);

  const scrollToSection = (id: string, ref: React.RefObject<HTMLDivElement | null>) => {
    setActiveTab(id);
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const sidebarItems = useMemo(() => [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard, ref: dashboardRef },
    { id: 'markets', label: t.markets, icon: Globe, ref: marketsRef },
    { id: 'signals', label: t.signals, icon: TrendingUp, ref: signalsRef },
    { id: 'whaleBear', label: t.whaleBearMatrix, icon: Ship, ref: whaleBearRef },
    { id: 'onChain', label: t.onChainIntel, icon: Database, ref: onChainRef },
    { id: 'quantum', label: t.quantumIntelligence, icon: Brain, ref: quantumRef },
    { id: 'settings', label: t.settings, icon: Settings, ref: settingsRef },
  ], [t]);

  if (showAuth) {
    return <AuthSystem lang={lang} t={t} onAuthSuccess={handleAuthSuccess} onGuestAccess={handleGuestAccess} />;
  }

  const guestTimeRemaining = guestStartTime ? Math.max(0, Math.floor((GUEST_TIMEOUT_MS - (Date.now() - guestStartTime)) / 60000)) : 0;

  // Optimized Logo Loader to prevent crash
  const handleLogoError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    if (target.src.includes('logo.png') && target.src !== BRAND_LOGO_URL) {
      target.src = BRAND_LOGO_URL;
    } else if (target.src === BRAND_LOGO_URL) {
      target.src = EMERGENCY_LOGO;
    } else {
      target.style.display = 'none';
    }
  };

  return (
    <div className="h-screen bg-transparent text-text-bright flex overflow-hidden relative z-10">
      
      {/* SIDEBAR */}
      <aside className="w-[300px] bg-navy/60 border-r border-white/5 backdrop-blur-3xl hidden lg:flex flex-col p-8 z-50 flex-shrink-0 shadow-2xl">
        <div className="mb-10">
          <div className="flex flex-col gap-4 mb-4 cursor-pointer group" onClick={() => scrollToSection('dashboard', dashboardRef)}>
            <div className="flex items-center gap-4">
               <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all group-hover:rotate-12 group-hover:scale-110 shadow-[0_0_20px_rgba(0,229,255,0.2)] border border-white/10 relative overflow-hidden">
                  <img 
                    src={LOCAL_LOGO} 
                    alt="BullBearEye" 
                    className="w-full h-full object-contain"
                    onError={handleLogoError}
                  />
                  <div className="absolute inset-0 bg-accent/5 pointer-events-none group-hover:opacity-20 transition-opacity"></div>
               </div>
               <h1 className="text-xl hologram-effect leading-tight tracking-tighter">
                 BullBearEye — TradeXray
               </h1>
            </div>
            <div className="flex items-center gap-2 pl-1">
               <ScanText className="w-3 h-3 text-accent opacity-60" />
               <span className="text-[9px] font-black uppercase tracking-[0.3em] neon-sweep">See Inside The Price</span>
            </div>
          </div>
        </div>

        {isGuest && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-center justify-between mb-2">
               <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">{t.guestTimeLeft}</span>
               <Clock className="w-3 h-3 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-1">
               <span className="text-xl font-black font-mono text-white">{guestTimeRemaining}</span>
               <span className="text-[8px] font-bold text-slate-500 uppercase">min</span>
            </div>
            <div className="mt-2 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
               <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${(guestTimeRemaining / 60) * 100}%` }}></div>
            </div>
          </div>
        )}

        <nav className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2">
          {sidebarItems.map((item, idx) => (
            <div 
              key={item.id} 
              onClick={() => scrollToSection(item.id, item.ref)}
              className={`flex items-center gap-5 p-4 rounded-2xl cursor-pointer transition-all duration-300 border ${activeTab === item.id ? 'bg-accent/10 border-accent/30 text-accent shadow-[inset_0_0_15px_rgba(0,229,255,0.05)]' : 'border-transparent text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${activeTab === item.id ? 'animate-pulse' : ''}`} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] truncate">{item.label}</span>
            </div>
          ))}
        </nav>

        <div className="mt-10 p-5 rounded-3xl bg-slate-900/40 border border-white/5 relative group overflow-hidden">
            <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-20 transition-opacity"><Award className="w-32 h-32 text-gold" /></div>
            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 bg-gold/10 rounded-xl border border-gold/30 ${user?.role === 'DEVELOPER' ? 'animate-pulse' : ''}`}><Award className="w-5 h-5 text-gold" /></div>
                  <div>
                      <span className="text-[9px] font-black text-white uppercase tracking-widest">{user?.role === 'DEVELOPER' ? 'Chief Architect' : user ? 'G8 Operator' : 'Marwan Negm'}</span>
                      <span className="text-[7px] text-gold font-bold uppercase tracking-widest block mt-1">{user ? user.email.split('@')[0] : 'Chief Architect'}</span>
                  </div>
                </div>
                <button onClick={handleLogout} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-500 hover:text-rose-500">
                  <LogOut className="w-4 h-4" />
                </button>
            </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="bg-bg/40 backdrop-blur-3xl flex flex-col z-40 border-b border-white/5">
          <div className="bg-black/40 px-10 py-2.5 flex justify-between items-center border-b border-white/5">
             <div className="flex items-center gap-8">
                <div className="flex items-center gap-2"><Wifi className="w-3 h-3 text-success" /><span className="text-[9px] font-black text-muted uppercase tracking-widest">Network: <span className="text-success">OPTIMAL</span></span></div>
                <div className="flex items-center gap-2"><Clock className="w-3 h-3 text-accent" /><span className="text-[9px] font-black text-muted uppercase tracking-widest">Latency: <span className="text-accent">{nodeLatency}ms</span></span></div>
             </div>
             <div className="flex items-center gap-6">
                <div className="neon-badge-marwan">{user?.role === 'DEVELOPER' ? 'ROOT ACCESS: NEGM' : 'Built By: Marwan Negm'}</div>
                <div className="w-px h-4 bg-white/10 opacity-20"></div>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse"></div>
                   <span className="text-[9px] font-black text-muted uppercase tracking-widest">Mainnet Node</span>
                </div>
             </div>
          </div>

          <div className="flex items-center justify-between px-10 py-5">
            <div className="flex items-center gap-10">
              <div className="flex flex-col text-start">
                 <span className="text-[8px] font-black text-accent uppercase tracking-[0.4em] mb-1 italic opacity-60">TARGET ASSET INTERFACE</span>
                 <div className="px-8 py-3 bg-surface-light rounded-2xl border border-accent/20 text-2xl font-black text-white font-mono shadow-[0_0_30px_rgba(0,229,255,0.05)]">
                   {selectedSymbol}/USDT
                 </div>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <button onClick={handleGlobalRefresh} className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-accent/40 hover:bg-accent/5 transition-all">
                <RefreshCw className={`w-4 h-4 text-slate-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>

              <div className="flex bg-black/40 rounded-xl border border-white/10 p-1">
                <button onClick={() => setLang('en')} className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all ${lang === 'en' ? 'bg-accent text-black' : 'text-muted hover:text-white'}`}>EN</button>
                <button onClick={() => setLang('ar')} className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all ${lang === 'ar' ? 'bg-accent text-black' : 'text-muted hover:text-white'}`}>AR</button>
              </div>

              <button onClick={handleRefreshAI} disabled={isAnalyzing} className="px-8 py-3 bg-gradient-to-r from-accent to-accent-green rounded-2xl text-black font-black text-[11px] uppercase tracking-[0.2em] italic flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 shadow-[0_0_25px_rgba(0,229,255,0.2)]">
                <Layers className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                {t.xRayAnalysis}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar" ref={dashboardRef}>
          <div className="p-10 space-y-16 pb-32">
            <MarketOverviewHeader stats={stats} aiAnalysis={aiAnalysis} t={t} />

            <div className="flex flex-col gap-20 w-full max-w-[1800px] mx-auto">
              <div ref={marketsRef} className="flex flex-col gap-10 w-full">
                <div className="cyber-card p-10 rounded-[3.5rem]">
                  <div className="flex items-center gap-5 mb-10 text-muted border-b border-white/5 pb-8">
                    <div className="p-3.5 bg-accent/10 rounded-2xl border border-accent/20"><Globe className="w-6 h-6 text-accent animate-pulse" /></div>
                    <div>
                      <span className="text-lg font-black uppercase tracking-[0.3em] text-white block">{t.institutionalAssetSelector}</span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-1 block">Institutional Liquidity Hub</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {WATCHED_SYMBOLS.map(s => {
                      const m = markets.find(market => market.symbol === s);
                      const change = m?.change24h || 0;
                      return (
                        <button key={s} onClick={() => setSelectedSymbol(s)} className={`relative p-6 rounded-[2rem] border-2 transition-all duration-500 group overflow-hidden ${selectedSymbol === s ? 'bg-accent/5 border-accent/40 shadow-[0_0_30px_rgba(0,229,255,0.1)]' : 'bg-white/5 border-white/5 hover:border-white/20'}`}>
                          <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                               <div className="w-9 h-9 rounded-full bg-white p-1.5 shadow-lg"><img src={COIN_LOGOS[s]} alt={s} className="w-full h-full object-contain" /></div>
                               <span className="text-xs font-black text-white tracking-widest">{s}</span>
                            </div>
                            <div className={`px-2 py-0.5 rounded-lg text-[9px] font-black border ${change >= 0 ? 'bg-success/10 text-success border-success/30' : 'bg-danger/10 text-danger border-danger/30'}`}>
                               {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                            </div>
                          </div>
                          <span className="text-2xl font-black font-mono text-white tracking-tighter block">${(m?.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                {currentMarket && <MarketChart data={currentMarket} analysis={aiAnalysis} t={t} />}
              </div>

              <div ref={signalsRef}><TradeXrayAI analysis={aiAnalysis} isLoading={isAnalyzing} t={t} currentPrice={currentMarket?.price} /></div>
              <SystemArchitectureMonitor t={t} />
              {currentMarket && <TechnicalForensics data={currentMarket} isLoading={!currentMarket} t={t} />}
              {currentMarket && <LiquidityFlowMatrix data={currentMarket} isLoading={!currentMarket} t={t} />}
              <SocialIntel metrics={socialMetrics[selectedSymbol]} symbol={selectedSymbol} isLoading={!socialMetrics[selectedSymbol]} t={t} />
              <div ref={whaleBearRef}>
                {currentMarket && <WhaleBearForensics metrics={whaleBearMetrics[selectedSymbol]} whaleTx={onChainMetrics[selectedSymbol]?.whaleTransactions || []} symbol={selectedSymbol} isLoading={!whaleBearMetrics[selectedSymbol]} t={t} currentPrice={currentMarket.price} />}
              </div>
              <div ref={onChainRef}><AIScenarioSimulator prediction={mlPrediction} currentPrice={currentMarket?.price || 0} isLoading={isMLRunning} t={t} /></div>
              {currentMarket && <CEXIntel metrics={cexMetrics[selectedSymbol]} symbol={selectedSymbol} isLoading={!cexMetrics[selectedSymbol]} t={t} />}
              {currentMarket && <OnChainIntel metrics={onChainMetrics[selectedSymbol]} symbol={selectedSymbol} isLoading={!onChainMetrics[selectedSymbol]} t={t} />}
              <div ref={quantumRef}>{currentMarket && <MachineLearningPredictor prediction={mlPrediction} isLoading={isMLRunning} currentPrice={currentMarket.price} t={t} onValidate={handleRefreshAI} />}</div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                 {currentMarket && <OrderBook price={currentMarket.price} symbol={currentMarket.symbol} t={t} />}
                 {currentMarket && <DepthChart price={currentMarket.price} t={t} />}
              </div>
              <div ref={settingsRef}>{currentMarket && <Backtester marketData={currentMarket} t={t} />}</div>
            </div>
          </div>

          {/* ELEGANT FOOTER */}
          <footer className="footer-horizon pt-32 pb-40 px-16 z-40">
             <div className="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
                <div className="col-span-2">
                   <div className="flex items-center gap-5 mb-8">
                      <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center shadow-2xl border border-white/10 overflow-hidden group">
                         <img 
                            src={LOCAL_LOGO} 
                            alt="BullBearEye" 
                            className="w-full h-full object-contain p-1 transition-transform group-hover:scale-110"
                            onError={handleLogoError}
                          />
                      </div>
                      <div>
                         <h2 className="text-3xl hologram-effect leading-none">BullBearEye Xray</h2>
                         <div className="mt-2 flex items-center gap-2"><Sparkles className="w-3 h-3 text-accent" /><span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] neon-sweep">See Inside The Price</span></div>
                      </div>
                   </div>
                   <p className="text-sm text-slate-400 leading-relaxed font-medium max-w-md italic opacity-80">{t.footerDesc}</p>
                   
                   <div className="mt-10 flex flex-col gap-6">
                      <h4 className="text-[10px] font-black text-white uppercase tracking-[0.4em] italic flex items-center gap-3"><MessageCircle className="w-4 h-4 text-emerald-400" /> {t.contactSupport}</h4>
                      <div className="flex flex-wrap gap-10">
                         <div className="flex items-center gap-4 group cursor-pointer">
                            <div className="p-3 bg-white/5 rounded-xl border border-white/10 group-hover:border-accent/40 transition-colors">
                               <Mail className="w-5 h-5 text-accent" />
                            </div>
                            <div>
                               <span className="text-[8px] font-black text-slate-500 uppercase block mb-1">{t.contactMail}</span>
                               <span className="text-[11px] font-bold text-white group-hover:text-accent transition-colors block">info@tradexray.com</span>
                               <span className="text-[11px] font-bold text-white group-hover:text-accent transition-colors block">marwan191289@yahoo.com</span>
                            </div>
                         </div>
                         <div className="flex items-center gap-4 group cursor-pointer">
                            <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 group-hover:border-emerald-500/40 transition-colors">
                               <MessageCircle className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                               <span className="text-[8px] font-black text-slate-500 uppercase block mb-1">{t.contactWhatsApp}</span>
                               <span className="text-[11px] font-bold text-white group-hover:text-emerald-400 transition-colors">+971 58 559 2355</span>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                <div>
                   <h4 className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-8 italic flex items-center gap-3"><Terminal className="w-4 h-4 text-accent" /> Intelligence</h4>
                   <ul className="space-y-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      <li className="hover:text-accent cursor-pointer transition-colors flex items-center gap-3 group"><ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" /> Neural Documentation</li>
                      <li className="hover:text-accent cursor-pointer transition-colors flex items-center gap-3 group"><ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" /> Forensic Stream API</li>
                      <li className="hover:text-accent cursor-pointer transition-colors flex items-center gap-3 group"><ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" /> G8 Cluster Status</li>
                   </ul>
                </div>

                <div>
                   <h4 className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-8 italic flex items-center gap-3"><Lock className="w-4 h-4 text-success" /> Protocols</h4>
                   <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                         <Shield className="w-5 h-5 text-success" />
                         <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">G8 ENCRYPTION ACTIVE</span>
                      </div>
                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                         <Fingerprint className="w-5 h-5 text-indigo-400" />
                         <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">BIOMETRIC SYNC ON</span>
                      </div>
                   </div>
                </div>
             </div>

             <div className="max-w-screen-xl mx-auto pt-16 border-t border-white/5 flex justify-between items-center text-slate-500 font-black text-[9px] uppercase tracking-[0.4em]">
                <div className="flex items-center gap-4"><Network className="w-4 h-4 opacity-40" /> © 2025 BULLBEAREYE XRAY. {t.forensicNode}</div>
                <div className="flex items-center gap-10">
                  <div className="flex gap-8">
                    <span className="hover:text-accent cursor-pointer transition-colors">Privacy</span>
                    <span className="hover:text-accent cursor-pointer transition-colors">Terms</span>
                  </div>
                  <div className="h-6 w-px bg-white/10"></div>
                  <div className="flex items-center gap-4">
                     <span className="text-slate-400">Architect: Marwan Negm</span>
                     <div className="p-2 bg-gold/10 rounded-lg border border-gold/30 shadow-[0_0_10px_rgba(255,215,0,0.1)]"><Award className="w-4 h-4 text-gold" /></div>
                  </div>
                </div>
             </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default App;
