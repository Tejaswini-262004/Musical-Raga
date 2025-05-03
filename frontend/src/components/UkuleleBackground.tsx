import React from 'react';

const UkuleleBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 opacity-20">
      <svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Main ukulele body - guitar-like shape */}
        <path
          d="M450,350 C520,380 550,300 540,250 C530,200 500,170 450,150 C400,130 360,120 300,150 C240,180 220,240 240,280 C260,320 300,340 340,340 C380,340 420,330 450,350 Z"
          fill="url(#ukuleleGradient)"
          className="drop-shadow-lg"
        />
        
        {/* Ukulele neck */}
        <rect x="450" y="160" width="230" height="30" rx="5" fill="#8B4513" className="drop-shadow-md" />
        
        {/* Frets on the neck */}
        <line x1="470" y1="160" x2="470" y2="190" stroke="#555" strokeWidth="2" />
        <line x1="500" y1="160" x2="500" y2="190" stroke="#555" strokeWidth="2" />
        <line x1="530" y1="160" x2="530" y2="190" stroke="#555" strokeWidth="2" />
        <line x1="560" y1="160" x2="560" y2="190" stroke="#555" strokeWidth="2" />
        <line x1="590" y1="160" x2="590" y2="190" stroke="#555" strokeWidth="2" />
        <line x1="620" y1="160" x2="620" y2="190" stroke="#555" strokeWidth="2" />
        <line x1="650" y1="160" x2="650" y2="190" stroke="#555" strokeWidth="2" />
        
        {/* Sound hole */}
        <circle cx="340" cy="250" r="40" fill="#111" />
        <circle cx="340" cy="250" r="35" fill="#222" />
        
        {/* Strings */}
        <line x1="340" y1="165" x2="680" y2="175" stroke="#ddd" strokeWidth="1" />
        <line x1="340" y1="175" x2="680" y2="175" stroke="#ddd" strokeWidth="1" />
        <line x1="340" y1="185" x2="680" y2="175" stroke="#ddd" strokeWidth="1" />
        <line x1="340" y1="195" x2="680" y2="175" stroke="#ddd" strokeWidth="1" />
        
        {/* Headstock */}
        <path d="M680,160 L680,190 L710,200 L710,150 Z" fill="#5D4037" />
        
        {/* Tuning pegs */}
        <circle cx="695" cy="165" r="5" fill="#BF8F5D" />
        <circle cx="695" cy="175" r="5" fill="#BF8F5D" />
        <circle cx="695" cy="185" r="5" fill="#BF8F5D" />
        <circle cx="705" cy="170" r="5" fill="#BF8F5D" />
        
        {/* Music notes floating around */}
        <g className="opacity-40">
          <path d="M200,150 Q210,140 220,150 T240,150 V180 Q230,190 220,180 T200,180 Z" fill="#794C2C" />
          <line x1="238" y1="150" x2="238" y2="120" stroke="#794C2C" strokeWidth="2" />
          <circle cx="238" cy="120" r="8" fill="#794C2C" />
          
          <path d="M500,420 Q510,410 520,420 T540,420 V450 Q530,460 520,450 T500,450 Z" fill="#794C2C" />
          <line x1="538" y1="420" x2="538" y2="390" stroke="#794C2C" strokeWidth="2" />
          <circle cx="538" cy="390" r="8" fill="#794C2C" />
          
          <path d="M140,350 Q150,340 160,350 T180,350 V380 Q170,390 160,380 T140,380 Z" fill="#794C2C" />
          <line x1="178" y1="350" x2="178" y2="320" stroke="#794C2C" strokeWidth="2" />
          <circle cx="178" cy="320" r="8" fill="#794C2C" />
          
          <path d="M600,250 Q610,240 620,250 T640,250 V280 Q630,290 620,280 T600,280 Z" fill="#794C2C" />
          <line x1="638" y1="250" x2="638" y2="220" stroke="#794C2C" strokeWidth="2" />
          <circle cx="638" cy="220" r="8" fill="#794C2C" />
        </g>
        
        {/* Gradient definitions */}
        <defs>
          <linearGradient id="ukuleleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D7CCC8" />
            <stop offset="100%" stopColor="#8D6E63" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default UkuleleBackground;