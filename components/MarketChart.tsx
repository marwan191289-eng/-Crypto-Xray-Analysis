
import React, { useEffect, useRef } from 'react';
import { MarketData, AIAnalysis } from '../types';

interface MarketChartProps {
  data: MarketData;
  analysis?: AIAnalysis;
  t: any;
}

const MarketChart: React.FC<MarketChartProps> = ({ data, t }) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    // Clean up previous widget instance to prevent duplication
    container.current.innerHTML = '';

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "autosize": true,
      "symbol": `BINANCE:${data.symbol}USDT`,
      "interval": "60",
      "timezone": "Etc/UTC",
      "theme": "dark",
      "style": "1",
      "locale": "en",
      "enable_publishing": false,
      "backgroundColor": "rgba(1, 2, 4, 1)", // Seamless blend with app background
      "gridColor": "rgba(30, 41, 59, 0.3)",
      "hide_top_toolbar": false,
      "hide_legend": false,
      "save_image": false,
      "calendar": false,
      "hide_volume": false,
      "support_host": "https://www.tradingview.com"
    });
    
    container.current.appendChild(script);
  }, [data.symbol]);

  return (
    <div className="w-full h-[650px] relative rounded-[3.5rem] overflow-hidden border border-white/5 shadow-2xl bg-[#010204] group">
      {/* Decorative Header Overlay for Forensic Feel */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 z-10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
      
      <div className="tradingview-widget-container" ref={container} style={{ height: "100%", width: "100%" }}>
        <div className="tradingview-widget-container__widget" style={{ height: "100%", width: "100%" }}></div>
      </div>
    </div>
  );
};

export default MarketChart;
