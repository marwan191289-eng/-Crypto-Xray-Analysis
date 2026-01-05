
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Eye, Globe, Zap, Target, Binary, Activity, LayoutDashboard, 
  TrendingUp, Ship, Database, Brain, Settings, Cpu, ShieldCheck, Code2, 
  ExternalLink, Lock, Server, Terminal, Radio, ChevronRight, Clock, MapPin, 
  Network, Wifi, Shield, Fingerprint, Award, Layers, ScanText
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
import { MarketCard } from './components/MarketUI';
import { analyzeMarket } from './services/geminiService';
import { fetchMarketData, fetchBlockchainStats, fetchHistory, fetchOnChainMetrics, fetchSocialMetrics, fetchWhaleBearMetrics, fetchCEXMetrics } from './services/marketService';
import { runMLInference } from './services/mlService';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState('dashboard');
  const t = translations[lang];

  const sectionRefs = {
    dashboard: useRef<HTMLDivElement>(null),
    markets: useRef<HTMLDivElement>(null),
    signals: useRef<HTMLDivElement>(null),
    whaleBear: useRef<HTMLDivElement>(null),
    onChain: useRef<HTMLDivElement>(null),
    quantum: useRef<HTMLDivElement>(null),
    settings: useRef<HTMLDivElement>(null),
  };

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const [selectedSymbol, setSelectedSymbol] = useState('BTC');
  const [watchedSymbols] = useState(['BTC', 'ETH', 'SOL', 'LTC', 'BNB', 'AAVE', 'ADA', 'BCH', 'XRP']);
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [stats, setStats] = useState<BlockchainStats>({ ethGasPrice: 0, btcHashrate: '645.2 EH/s', totalMarketCap: 2.6, activeAddresses: 1200000 });
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | undefined>();
  const [mlPrediction, setMlPrediction] = useState<MLPrediction | undefined>();
  const [cexMetrics, setCexMetrics] = useState<Record<string, any>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMLRunning, setIsMLRunning] = useState(false);
  const [whaleBearMetrics, setWhaleBearMetrics] = useState<Record<string, WhaleBearMetrics>>({});
  const [onChainMetrics, setOnChainMetrics] = useState<Record<string, OnChainMetrics>>({});
  const [socialMetrics, setSocialMetrics] = useState<Record<string, SocialMetrics>>({});
  const [nodeLatency, setNodeLatency] = useState(12);

  const currentMarket = markets.find(m => m.symbol === selectedSymbol);

  const updateMarketData = useCallback(async () => {
    const updatedMarkets = await Promise.all(watchedSymbols.map(async (s) => {
      const live = await fetchMarketData(s);
      const history = await fetchHistory(s, 60);
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
    
    const [ocm, wbm, soc, cex] = await Promise.all([
      fetchOnChainMetrics(selectedSymbol),
      fetchWhaleBearMetrics(selectedSymbol, updatedMarkets.find(m => m.symbol === selectedSymbol)?.price || 0),
      fetchSocialMetrics(selectedSymbol),
      fetchCEXMetrics(selectedSymbol)
    ]);
    
    setOnChainMetrics(prev => ({ ...prev, [selectedSymbol]: ocm }));
    setWhaleBearMetrics(prev => ({ ...prev, [selectedSymbol]: wbm }));
    setSocialMetrics(prev => ({ ...prev, [selectedSymbol]: soc }));
    setCexMetrics(prev => ({ ...prev, [selectedSymbol]: cex }));

    const bcStats = await fetchBlockchainStats();
    setStats(prev => ({ ...prev, ...bcStats }));
    setNodeLatency(Math.floor(Math.random() * 5) + 10);
  }, [watchedSymbols, selectedSymbol]);

  const handleRefreshAI = async () => {
    if (!currentMarket) return;
    setIsAnalyzing(true);
    setIsMLRunning(true);
    try {
      const [aiResult, mlResult] = await Promise.all([
        analyzeMarket(currentMarket),
        runMLInference(currentMarket)
      ]);
      setAiAnalysis(aiResult);
      setMlPrediction(mlResult);
    } finally {
      setIsAnalyzing(false);
      setIsMLRunning(false);
    }
  };

  useEffect(() => {
    updateMarketData();
    const interval = setInterval(updateMarketData, 30000);
    return () => clearInterval(interval);
  }, [updateMarketData]);

  useEffect(() => {
    if (currentMarket) handleRefreshAI();
  }, [selectedSymbol]);

  const scrollToSection = (id: string, ref: React.RefObject<HTMLDivElement>) => {
    setActiveTab(id);
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleLinkClick = (name: string) => {
    alert(`${t.terminal}: ${t.accessing} ${name}... ${t.secureConn}.`);
  };

  const sidebarItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard, ref: sectionRefs.dashboard },
    { id: 'markets', label: t.markets, icon: Globe, ref: sectionRefs.markets },
    { id: 'signals', label: t.signals, icon: TrendingUp, ref: sectionRefs.signals },
    { id: 'whaleBear', label: t.whaleBearMatrix, icon: Ship, ref: sectionRefs.whaleBear },
    { id: 'onChain', label: t.onChainIntel, icon: Database, ref: sectionRefs.onChain },
    { id: 'quantum', label: t.quantumIntelligence, icon: Brain, ref: sectionRefs.quantum },
    { id: 'settings', label: t.settings, icon: Settings, ref: sectionRefs.settings },
  ];

  return (
    <div className="h-screen bg-transparent text-text-bright flex overflow-hidden relative z-10">
      
      {/* Enhanced Animated Sidebar */}
      <aside className="w-[300px] bg-bg/70 border-r border-white/5 backdrop-blur-3xl hidden lg:flex flex-col p-8 z-50 flex-shrink-0">
        <div className="mb-14">
          <div className="flex items-center gap-5 mb-4 cursor-pointer group" onClick={() => scrollToSection('dashboard', sectionRefs.dashboard)}>
            <div className="w-14 h-14 fusion-btn-xray rounded-2xl flex items-center justify-center flex-shrink-0 transition-all group-hover:rotate-12 shadow-glow shadow-accent/20">
              <Eye className="w-7 h-7 text-white" />
              <div className="scanner-beam"></div>
            </div>
            <div className="text-start">
              <h1 className="text-2xl leading-none hologram-title">
                {t.appNamePart1} <span className="text-accent">{t.appNameAccent}</span>{t.appNameSuffix}
              </h1>
              <div className="mt-2 flex items-center gap-2">
                <ScanText className="w-3 h-3 text-accent opacity-60" />
                <span className="slogan-xray text-[9px]" data-text={t.seeInside}>{t.seeInside}</span>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2">
          {sidebarItems.map((item, idx) => (
            <div 
              key={item.id} 
              onClick={() => scrollToSection(item.id, item.ref)}
              className={`sidebar-item-glow flex items-center gap-5 p-5 rounded-2xl cursor-pointer reveal-anim ${activeTab === item.id ? 'active text-accent' : 'text-muted'}`}
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <item.icon className={`w-6 h-6 flex-shrink-0 transition-transform ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span className="text-[11px] font-black uppercase tracking-widest truncate">{item.label}</span>
            </div>
          ))}
        </nav>

        {/* Improved Marwan Badge in Sidebar */}
        <div className="mt-10 p-6 marwan-badge-id rounded-[2.5rem] cursor-pointer group reveal-anim" style={{ animationDelay: '0.8s' }} onClick={() => handleLinkClick(t.builtByMarwan)}>
           <div className="flex items-center gap-4 mb-4 relative z-10">
             <div className="p-3 bg-gold/10 rounded-xl border border-gold/20">
                <Award className="w-6 h-6 text-gold drop-shadow-glow" />
             </div>
             <div className="flex flex-col text-start">
               <span className="text-[12px] font-black text-white uppercase tracking-widest">{t.builtByMarwan}</span>
               <span className="text-[7px] text-gold/60 font-bold uppercase tracking-[0.4em]">Master Architect G8</span>
             </div>
           </div>
           <p className="text-[9px] text-muted opacity-40 uppercase leading-relaxed italic font-bold relative z-10">{t.sidebarDesc}</p>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Advanced Terminal Header */}
        <header className="min-h-[110px] bg-bg/40 backdrop-blur-3xl header-glow-border flex flex-col z-40">
          {/* Top Info Bar */}
          <div className="bg-black/30 px-12 py-2 flex justify-between items-center border-b border-white/5">
             <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                   <Wifi className="w-3.5 h-3.5 text-success" />
                   <span className="text-[9px] font-black text-muted uppercase tracking-widest">{t.globalNodeStatus}: <span className="text-success">{t.nodeLocation}</span></span>
                </div>
                <div className="flex items-center gap-3">
                   <Clock className="w-3.5 h-3.5 text-accent" />
                   <span className="text-[9px] font-black text-muted uppercase tracking-widest">{t.msLatency}: <span className="text-accent">{nodeLatency}ms</span></span>
                </div>
             </div>
             <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                   <span className="text-[9px] font-black text-muted uppercase tracking-widest">Global Forensic Mainnet</span>
                </div>
             </div>
          </div>

          <div className="flex-1 flex items-center justify-between px-12 py-4 gap-8">
            <div className="flex items-center gap-10 flex-1 min-w-0">
              <div className="flex flex-col text-start min-w-0">
                 <span className="text-[9px] font-black text-accent uppercase tracking-[0.5em] mb-2 italic opacity-60 flex items-center gap-2">
                    <Target className="w-3 h-3" /> {t.targetIdentity}
                 </span>
                 <div className="flex items-center gap-5">
                   <div className="relative group overflow-hidden px-10 py-4 bg-white/5 rounded-2xl border border-white/10 text-2xl font-black text-white font-mono shadow-inner hover:border-accent/50 transition-all cursor-crosshair">
                     <div className="scanner-line"></div>
                     {selectedSymbol}/USDT
                   </div>
                   <div className="hidden sm:flex items-center gap-4 px-5 py-2.5 bg-success/10 rounded-xl border border-success/20 shadow-lg">
                      <div className="status-pulse" />
                      <span className="text-[11px] font-black text-success uppercase italic tracking-widest">{t.liveFeed}</span>
                   </div>
                 </div>
              </div>
            </div>

            <div className="flex items-center gap-6 flex-shrink-0 flex-wrap justify-end">
              {/* Specialized Marwan Header ID */}
              <div className="marwan-badge-id px-8 py-3.5 rounded-2xl flex items-center gap-5 shadow-2xl transition-all cursor-pointer group">
                <div className="relative p-2.5 bg-gold/10 rounded-xl border border-gold/20 shadow-inner">
                  <Fingerprint className="w-6 h-6 text-gold group-hover:scale-125 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gold/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="flex flex-col text-start relative z-10">
                  <span className="text-[14px] text-white font-black italic leading-none">{t.builtByMarwan}</span>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                    <span className="text-[8px] text-gold/60 font-bold tracking-[0.4em]">SYSTEM CORE G8</span>
                  </div>
                </div>
              </div>

              <div className="flex bg-black/50 rounded-2xl border border-white/10 p-1.5 shadow-xl">
                <button onClick={() => setLang('en')} className={`px-5 py-2.5 rounded-xl text-[11px] font-black transition-all ${lang === 'en' ? 'bg-accent text-white shadow-lg' : 'text-muted hover:text-white'}`}>EN</button>
                <button onClick={() => setLang('ar')} className={`px-5 py-2.5 rounded-xl text-[11px] font-black transition-all ${lang === 'ar' ? 'bg-accent text-white shadow-lg' : 'text-muted hover:text-white'}`}>AR</button>
              </div>

              {/* Enhanced Fusion X-Ray Analysis Button */}
              <button 
                onClick={handleRefreshAI}
                disabled={isAnalyzing}
                className={`fusion-btn-xray px-10 py-5 rounded-[2.5rem] text-white flex items-center gap-5 disabled:opacity-50 group transition-all shadow-glow shadow-accent/40`}
              >
                <div className="relative">
                  <Layers className={`w-6 h-6 ${isAnalyzing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
                  <div className="absolute inset-0 bg-white/30 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <span className="text-[14px] font-black uppercase tracking-[0.4em] whitespace-nowrap italic">{t.xRayAnalysis}</span>
                <div className="scanner-beam"></div>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar relative" ref={sectionRefs.dashboard}>
          <div className="p-10 md:p-14 space-y-20 pb-24">
            {/* Elite Stats View */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              <MarketCard title={t.totalCap} value={`$${stats.totalMarketCap}T`} change={0.8} />
              <MarketCard title={t.gas} value={stats.ethGasPrice} change={-4.2} />
              <MarketCard title={t.fearGreed} value={`${stats.fearGreed?.value || 50} (${stats.fearGreed?.label})`} change={2.1} />
              <MarketCard title={t.aiSentimentScore} value={`${aiAnalysis?.score || 50}/100`} change={3.1} />
            </div>

            <div className="flex flex-col gap-24 w-full max-w-screen-2xl mx-auto min-w-0">
              <div ref={sectionRefs.markets} className="flex flex-col gap-10 w-full reveal-anim" style={{ animationDelay: '0.2s' }}>
                <div className="cyber-card p-10 rounded-[4rem] text-start border-white/10 shadow-3xl bg-bg/40 backdrop-blur-xl">
                  <div className="flex items-center gap-6 mb-10 text-muted border-b border-white/5 pb-8 opacity-60">
                    <Globe className="w-8 h-8 text-accent animate-pulse" />
                    <span className="text-[14px] font-black uppercase tracking-[0.5em] italic">{t.institutionalAssetSelector}</span>
                  </div>
                  <div className="flex flex-wrap gap-5">
                    {watchedSymbols.map(s => (
                      <button key={s} onClick={() => setSelectedSymbol(s)} className={`px-10 py-5 rounded-3xl text-[13px] font-black uppercase tracking-[0.3em] border-2 transition-all italic ${selectedSymbol === s ? 'bg-accent border-accent text-white shadow-glow scale-110 z-10' : 'bg-white/5 border-white/10 text-muted hover:text-white hover:bg-white/10'}`}>{s}/USDT</button>
                    ))}
                  </div>
                </div>
                <div className="cyber-card rounded-[4rem] p-8 relative min-h-[750px] w-full shadow-5xl border-white/10">
                  {currentMarket && <MarketChart data={currentMarket} analysis={aiAnalysis} t={t} />}
                </div>
              </div>

              <div ref={sectionRefs.signals} className="w-full reveal-anim" style={{ animationDelay: '0.4s' }}>
                <TradeXrayAI analysis={aiAnalysis} isLoading={isAnalyzing} t={t} />
              </div>

              <div className="w-full reveal-anim" style={{ animationDelay: '0.5s' }}>
                <SystemArchitectureMonitor t={t} />
              </div>

              <div className="w-full reveal-anim" style={{ animationDelay: '0.6s' }}>
                {currentMarket && <TechnicalForensics data={currentMarket} isLoading={!currentMarket} t={t} />}
              </div>

              <div className="w-full reveal-anim" style={{ animationDelay: '0.7s' }}>
                {currentMarket && <LiquidityFlowMatrix data={currentMarket} isLoading={!currentMarket} t={t} />}
              </div>

              <div className="w-full reveal-anim" style={{ animationDelay: '0.8s' }}>
                <SocialIntel metrics={socialMetrics[selectedSymbol]} symbol={selectedSymbol} isLoading={!socialMetrics[selectedSymbol]} t={t} />
              </div>

              <div ref={sectionRefs.whaleBear} className="w-full reveal-anim" style={{ animationDelay: '0.9s' }}>
                {currentMarket && <WhaleBearForensics metrics={whaleBearMetrics[selectedSymbol]} whaleTx={onChainMetrics[selectedSymbol]?.whaleTransactions || []} symbol={selectedSymbol} isLoading={!whaleBearMetrics[selectedSymbol]} t={t} />}
              </div>

              <div ref={sectionRefs.onChain} className="w-full reveal-anim" style={{ animationDelay: '1s' }}>
                <AIScenarioSimulator prediction={mlPrediction} currentPrice={currentMarket?.price || 0} isLoading={isMLRunning} t={t} />
              </div>

              <div className="w-full reveal-anim" style={{ animationDelay: '1.1s' }}>
                {currentMarket && <CEXIntel metrics={cexMetrics[selectedSymbol]} symbol={selectedSymbol} isLoading={!cexMetrics[selectedSymbol]} t={t} />}
              </div>

              <div className="w-full reveal-anim" style={{ animationDelay: '1.2s' }}>
                {currentMarket && <OnChainIntel metrics={onChainMetrics[selectedSymbol]} symbol={selectedSymbol} isLoading={!onChainMetrics[selectedSymbol]} t={t} />}
              </div>
              
              <div ref={sectionRefs.quantum} className="w-full reveal-anim" style={{ animationDelay: '1.3s' }}>
                {currentMarket && <MachineLearningPredictor prediction={mlPrediction} isLoading={isMLRunning} currentPrice={currentMarket.price} t={t} onValidate={handleRefreshAI} />}
              </div>
              
              <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-12 reveal-anim" style={{ animationDelay: '1.4s' }}>
                 {currentMarket && <OrderBook price={currentMarket.price} symbol={currentMarket.symbol} t={t} />}
                 {currentMarket && <DepthChart price={currentMarket.price} t={t} />}
              </div>

              <div ref={sectionRefs.settings} className="w-full reveal-anim" style={{ animationDelay: '1.5s' }}>
                {currentMarket && <Backtester marketData={currentMarket} t={t} />}
              </div>
            </div>
          </div>

          <footer className="footer-horizon pt-32 pb-20 px-16 z-40 overflow-hidden">
             <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-20 mb-32 text-start">
                <div className="col-span-1 md:col-span-2">
                   <div className="flex items-center gap-8 mb-10 cursor-pointer group" onClick={() => scrollToSection('dashboard', sectionRefs.dashboard)}>
                      <div className="w-20 h-20 fusion-btn-xray rounded-3xl flex items-center justify-center shadow-4xl">
                         <Eye className="w-10 h-10 text-white" />
                         <div className="scanner-beam"></div>
                      </div>
                      <div>
                         <h2 className="text-4xl leading-none hologram-title">
                           {t.appNamePart1} <span className="text-accent">{t.appNameAccent}</span>{t.appNameSuffix}
                         </h2>
                         <div className="mt-4 flex items-center gap-3">
                            <ScanText className="w-4 h-4 text-accent opacity-5" />
                            <span className="slogan-xray text-[13px]" data-text={t.seeInside}>{t.seeInside}</span>
                         </div>
                      </div>
                   </div>
                   <p className="text-[16px] text-muted leading-relaxed font-bold opacity-60 max-w-lg uppercase italic tracking-widest">{t.footerDesc}</p>
                </div>

                <div>
                   <h4 className="text-[13px] font-black text-white uppercase tracking-[0.5em] mb-12 italic flex items-center gap-4 border-b border-white/5 pb-6"><Terminal className="w-6 h-6 text-accent" /> {t.intelHub}</h4>
                   <ul className="space-y-6 text-[12px] font-black text-muted uppercase tracking-[0.2em] italic">
                      <li onClick={() => handleLinkClick(t.forensicStreams)} className="hover:text-accent cursor-pointer transition-colors flex items-center gap-4 group"><ChevronRight className="w-5 h-5 group-hover:translate-x-3 transition-transform" /> {t.forensicStreams}</li>
                      <li onClick={() => handleLinkClick(t.neuralDocs)} className="hover:text-accent cursor-pointer transition-colors flex items-center gap-4 group"><ChevronRight className="w-5 h-5 group-hover:translate-x-3 transition-transform" /> {t.neuralDocs}</li>
                   </ul>
                </div>

                <div>
                   <h4 className="text-[13px] font-black text-white uppercase tracking-[0.5em] mb-12 italic flex items-center gap-4 border-b border-white/5 pb-6"><Lock className="w-6 h-6 text-success" /> {t.securityProtocols}</h4>
                   <div className="space-y-8">
                      <div className="flex items-center gap-6 cursor-pointer hover:bg-white/5 p-5 rounded-3xl border border-white/10 transition-all shadow-inner" onClick={() => handleLinkClick(t.g8Encryption)}>
                         <Shield className="w-6 h-6 text-success" />
                         <span className="text-[12px] font-black text-white uppercase tracking-widest">{t.g8Encryption}</span>
                      </div>
                   </div>
                </div>
             </div>

             <div className="max-w-screen-2xl mx-auto pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-12">
                <div className="flex items-center gap-4">
                   <Network className="w-5 h-5 text-muted opacity-40" />
                   <span className="text-[12px] font-black text-muted uppercase tracking-[0.6em] italic">© 2025 BULLBEAREYE XRAY. {t.forensicNode}</span>
                </div>
                
                {/* Massive Signature Badge Footnote */}
                <div onClick={() => handleLinkClick(t.devContact)} className="group relative flex items-center gap-8 marwan-badge-id px-12 py-7 rounded-[3rem] cursor-pointer shadow-5xl border-gold/40">
                   <div className="relative p-3 bg-gold/20 rounded-2xl border border-gold/30 shadow-glow">
                      <Award className="w-10 h-10 text-gold drop-shadow-xl" />
                   </div>
                   <div className="flex flex-col text-start relative z-10">
                      <span className="text-[16px] font-black text-white uppercase tracking-[0.3em] italic">{t.builtByMarwan}</span>
                      <span className="text-[9px] text-gold font-bold uppercase tracking-[0.6em] opacity-80 mt-2">CHIEF QUANT ARCHITECT G8</span>
                   </div>
                   <div className="w-px h-12 bg-white/20 mx-4 relative z-10"></div>
                   <div className="flex gap-2.5 relative z-10">
                      {[1,2,3,4,5].map(i => <div key={i} className="w-2 h-2 bg-gold rounded-full shadow-glow"></div>)}
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
