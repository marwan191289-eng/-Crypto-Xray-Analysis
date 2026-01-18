
import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "w-10 h-10" }) => (
  <svg 
    viewBox="0 0 100 100" 
    className={className}
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      {/* Tech Gradient (Blue/Indigo) */}
      <linearGradient id="tech-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00E5FF" />
        <stop offset="50%" stopColor="#6366F1" />
        <stop offset="100%" stopColor="#818CF8" />
      </linearGradient>

      {/* Bull Gradient (Emerald) */}
      <linearGradient id="bull-grad-logo" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor="#059669" />
        <stop offset="100%" stopColor="#34D399" />
      </linearGradient>

      {/* Bear Gradient (Rose) */}
      <linearGradient id="bear-grad-logo" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#E11D48" />
        <stop offset="100%" stopColor="#FB7185" />
      </linearGradient>

      {/* Glow Filter */}
      <filter id="soft-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    {/* Outer Cybernetic Frame (Aperture) */}
    <path 
      d="M 50 10 C 25 10, 5 30, 5 50 C 5 70, 25 90, 50 90 C 75 90, 95 70, 95 50 C 95 30, 75 10, 50 10" 
      stroke="url(#tech-grad)" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeDasharray="20 10 50 10"
      className="animate-[spin_20s_linear_infinite]"
      opacity="0.8"
    />
    
    {/* Inner Reticle Ring (Static) */}
    <circle cx="50" cy="50" r="32" stroke="#1e293b" strokeWidth="1" />
    <path d="M 50 14 L 50 18 M 50 82 L 50 86 M 14 50 L 18 50 M 82 50 L 86 50" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round" />

    {/* The Core Eye - Background */}
    <circle cx="50" cy="50" r="24" fill="#020617" stroke="url(#tech-grad)" strokeWidth="1" />

    {/* The "Pupil" - Formed by Bull/Bear Charts */}
    <g transform="translate(50, 50)">
        {/* Left Side: Bearish (Selling Pressure) */}
        <path 
            d="M -8 -16 L 0 -16 L 0 16 L -8 16 L -8 4 L -12 4 L -12 -4 L -8 -4 Z" 
            fill="url(#bear-grad-logo)" 
            filter="url(#soft-glow)"
        />
        {/* Right Side: Bullish (Buying Pressure) */}
        <path 
            d="M 0 -16 L 8 -16 L 8 16 L 0 16 L 0 4 L 4 4 L 4 -4 L 0 -4 Z" 
            fill="url(#bull-grad-logo)" 
            filter="url(#soft-glow)"
        />
        
        {/* Central Gap/Wick */}
        <line x1="0" y1="-20" x2="0" y2="20" stroke="#fff" strokeWidth="1" opacity="0.5" />
    </g>

    {/* Reflection Glint */}
    <ellipse cx="65" cy="35" rx="4" ry="2" fill="white" opacity="0.4" transform="rotate(-45 65 35)" />
  </svg>
);

export default Logo;
