
import React, { useEffect, useRef, memo } from 'react';
import { MarketData, AIAnalysis } from '../types';

declare global {
  interface Window {
    TradingView: any;
  }
}

interface MarketChartProps {
  data: MarketData;
  analysis?: AIAnalysis;
  t: any;
  timeframe: string;
  onTimeframeChange: (tf: string) => void;
}

const MarketChart: React.FC<MarketChartProps> = memo(({ data, timeframe }) => {
  const containerId = useRef(`tv_chart_container_${Math.random().toString(36).substring(7)}`);

  useEffect(() => {
    // Map internal timeframe to TradingView interval codes
    const mapTimeframe = (tf: string): string => {
        const map: Record<string, string> = {
            '1H': '60',
            '4H': '240',
            '12H': '720',
            '1D': 'D',
            '3D': '3D',
            '1W': 'W',
            '1M': 'M'
        };
        return map[tf] || '60';
    };

    const interval = mapTimeframe(timeframe);
    // Default to Binance for reliable crypto data coverage
    const symbol = `BINANCE:${data.symbol}USDT`;

    const initWidget = () => {
      if (window.TradingView) {
        new window.TradingView.widget({
          "autosize": true,
          "symbol": symbol,
          "interval": interval,
          "timezone": "Etc/UTC",
          "theme": "dark",
          "style": "1", // 1 = Candles
          "locale": "en",
          "enable_publishing": false,
          "backgroundColor": "rgba(2, 6, 23, 1)", // Matches app bg #020617
          "gridColor": "rgba(30, 41, 59, 0.2)",
          "allow_symbol_change": false, // Disable to keep app state in sync
          "container_id": containerId.current,
          "hide_side_toolbar": false,
          "studies": [
            "RSI@tv-basicstudies",
            "MASimple@tv-basicstudies",
            "MACD@tv-basicstudies"
          ],
          "toolbar_bg": "#020617",
          "withdateranges": true,
          "hide_volume": false,
          "details": true,
          "hotlist": true,
          "calendar": true,
          // Advanced features
          "show_popup_button": true,
          "popup_width": "1000",
          "popup_height": "650",
        });
      }
    };

    // Lazy load the script if not present, otherwise init directly
    if (!window.TradingView) {
        const script = document.createElement('script');
        script.id = 'tradingview-widget-loading-script';
        script.src = 'https://s3.tradingview.com/tv.js';
        script.type = 'text/javascript';
        script.async = true;
        script.onload = initWidget;
        document.head.appendChild(script);
    } else {
        initWidget();
    }
  }, [data.symbol, timeframe]);

  return (
    <div className="w-full h-[750px] relative rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl bg-[#020617] group/chart">
      {/* Decorative Border Glow */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-50 z-10"></div>
      
      {/* Chart Container */}
      <div id={containerId.current} className="w-full h-full" />
      
      {/* Loading Overlay (Visible briefly while widget loads) */}
      <div className="absolute inset-0 bg-[#020617] flex items-center justify-center -z-10">
         <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest animate-pulse">Initializing Advanced Chart...</span>
      </div>
    </div>
  );
});

export default MarketChart;
