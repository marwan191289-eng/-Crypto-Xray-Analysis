
import React, { useEffect, useRef } from 'react';
import { MarketData, AIAnalysis } from '../types';

interface MarketChartProps {
  data: MarketData;
  analysis?: AIAnalysis;
  t: any;
}

declare global {
  interface Window {
    TradingView: any;
  }
}

const MarketChart: React.FC<MarketChartProps> = ({ data, t }) => {
  const containerId = `tv-chart-${data.symbol}`;
  const scriptLoaded = useRef(false);

  useEffect(() => {
    const loadChart = () => {
      if (window.TradingView) {
        new window.TradingView.widget({
          "autosize": true,
          "symbol": `BINANCE:${data.symbol}USDT`,
          "interval": "60",
          "timezone": "Etc/UTC",
          "theme": "dark",
          "style": "1",
          "locale": "en",
          "toolbar_bg": "#010204",
          "enable_publishing": false,
          "hide_top_toolbar": false,
          "hide_legend": false,
          "save_image": false,
          "container_id": containerId,
          "backgroundColor": "#010204",
          "gridLineColor": "rgba(255, 255, 255, 0.04)",
          "studies": [
            "RSI@tv-basicstudies",
            "MASimple@tv-basicstudies",
            "BollingerBands@tv-basicstudies"
          ]
        });
      }
    };

    if (!scriptLoaded.current) {
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = loadChart;
      document.head.appendChild(script);
      scriptLoaded.current = true;
    } else {
      loadChart();
    }
  }, [data.symbol]);

  return (
    <div className="w-full h-[600px] md:h-[800px] relative rounded-[2rem] md:rounded-[4rem] overflow-hidden border border-white/5 shadow-2xl bg-[#010204] group">
      {/* Forensic HUD Overlay */}
      <div className="absolute top-6 left-10 z-20 flex items-center gap-6 pointer-events-none">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-accent uppercase tracking-[0.3em] mb-1">TradingView Core</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_8px_#00e5ff]"></div>
            <span className="text-xl font-black font-mono text-white tracking-tighter">SUPERCHARTS v8.4</span>
          </div>
        </div>
        <div className="h-8 w-px bg-white/10"></div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Asset Stream</span>
          <span className="text-lg font-black text-white italic">{data.symbol}/USDT</span>
        </div>
      </div>

      <div id={containerId} className="w-full h-full" />
      
      {/* X-Ray Scan Beam */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-accent/40 shadow-[0_0_20px_#00e5ff] animate-[move-beam_5s_linear_infinite] pointer-events-none z-30"></div>
    </div>
  );
};

export default MarketChart;
