
import React, { useEffect, useState } from 'react';

interface MarketWeatherProps {
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
}

const MarketWeather: React.FC<MarketWeatherProps> = ({ sentiment }) => {
  const [lightning, setLightning] = useState(false);

  // Random lightning effect logic
  useEffect(() => {
    const triggerLightning = () => {
      // 30% chance every 6 seconds to trigger a lightning sequence
      if (Math.random() > 0.7) { 
        setLightning(true);
        setTimeout(() => setLightning(false), 80);  // Flash 1 off
        setTimeout(() => setLightning(true), 150);  // Flash 2 on
        setTimeout(() => setLightning(false), 300); // Flash 2 off
      }
    };
    const interval = setInterval(triggerLightning, 6000); 
    return () => clearInterval(interval);
  }, []);

  // Determine colors based on sentiment
  const getColorClass = () => {
    switch (sentiment) {
      case 'BULLISH': return 'bg-green-500 shadow-[0_0_15px_#22c55e]'; // Green for Bullish
      case 'BEARISH': return 'bg-red-600 shadow-[0_0_15px_#dc2626]';   // Red for Bearish
      default: return 'bg-yellow-400 shadow-[0_0_15px_#facc15]';       // Yellow for Neutral
    }
  };

  const getFlashColor = () => {
    switch (sentiment) {
      case 'BULLISH': return 'bg-green-500/30';
      case 'BEARISH': return 'bg-red-600/30';
      default: return 'bg-yellow-400/30';
    }
  };

  const colorClass = getColorClass();
  const flashColor = getFlashColor();

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden rounded-[inherit]">
      
      {/* Lightning Flash Overlay */}
      <div 
        className={`absolute inset-0 transition-opacity duration-150 ease-out z-10 ${flashColor} ${lightning ? 'opacity-100' : 'opacity-0'}`}
        style={{ mixBlendMode: 'screen' }}
      ></div>

      {/* Rain Layers - High Density for visibility */}
      <div className="absolute inset-0 opacity-40">
        {[...Array(100)].map((_, i) => (
          <div 
            key={`rain-${i}`}
            className={`absolute top-[-150px] w-[2px] ${colorClass} animate-rain`}
            style={{
              left: `${Math.random() * 100}%`,
              height: `${Math.random() * 100 + 80}px`, // Longer streaks
              animationDuration: `${Math.random() * 0.5 + 0.3}s`, // Fast fall
              animationDelay: `${Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>

      {/* Snow/Particle Layers - Drifting */}
      <div className="absolute inset-0 opacity-60">
        {[...Array(60)].map((_, i) => (
          <div 
            key={`snow-${i}`}
            className={`absolute top-[-20px] rounded-full ${colorClass} animate-snow blur-[1px]`}
            style={{
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 3}px`, // Larger particles
              height: `${Math.random() * 4 + 3}px`,
              animationDuration: `${Math.random() * 5 + 5}s`, // Slow drift
              animationDelay: `${Math.random() * 5}s`
            }}
          ></div>
        ))}
      </div>
      
      <style>{`
        @keyframes rain {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(110vh); opacity: 0; }
        }
        @keyframes snow {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          50% { opacity: 0.8; }
          90% { opacity: 1; }
          100% { transform: translateY(110vh) translateX(${Math.random() * 100 - 50}px); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default MarketWeather;
