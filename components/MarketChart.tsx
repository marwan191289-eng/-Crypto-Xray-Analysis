
import React, { useEffect, useRef, memo } from 'react';
import { MarketData, AIAnalysis } from '../types';

interface MarketChartProps {
  data: MarketData;
  analysis?: AIAnalysis;
  t: any;
}

const MarketChart: React.FC<MarketChartProps> = ({ data, t }) => {
  const container = useRef<HTMLDivElement>(null);
  const symbol = `BINANCE:${data.symbol}USDT`;

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    
    script.innerHTML = JSON.stringify({
      "autosize": true,
      "symbol": symbol,
      "interval": "60",
      "timezone": "Etc/UTC",
      "theme": "dark",
      "style": "1",
      "locale": document.documentElement.lang === 'ar' ? 'ar' : 'en',
      "enable_publishing": false,
      "hide_top_toolbar": false,
      "allow_symbol_change": true,
      "save_image": false,
      "calendar": false,
      "hide_volume": false,
      "support_host": "https://www.tradingview.com"
    });

    if (container.current) {
      container.current.innerHTML = "";
      container.current.appendChild(script);
    }
    
    return () => {
      if (container.current) {
        container.current.innerHTML = "";
      }
    };
  }, [symbol]);

  return (
    <div className="w-full h-[600px] relative rounded-3xl overflow-hidden bg-black border border-white/5">
      <div 
        id="tradingview_widget" 
        ref={container} 
        className="tradingview-widget-container h-full w-full"
      >
        <div className="tradingview-widget-container__widget h-full w-full"></div>
      </div>
    </div>
  );
};

export default memo(MarketChart);
