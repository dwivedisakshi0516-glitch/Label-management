import React from 'react';

interface RitLogoProps {
  variant?: 'full' | 'mark' | 'horizontal';
  theme?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  showCompanyText?: boolean;
  companyName?: string;
  tagline?: string;
  glow?: boolean;
  className?: string;
}

export const RitLogo: React.FC<RitLogoProps> = ({
  variant = 'full',
  theme = 'light',
  size = 'md',
  showCompanyText = true,
  companyName = 'RAMA IT SOLUTION',
  tagline = 'IDEAS DRIVE PROGRESS',
  glow = false,
  className = ''
}) => {
  const sizeConfig = {
    sm: { markW: 38, markH: 26, textTitle: 'text-xs', textSub: 'text-[9px]' },
    md: { markW: 56, markH: 38, textTitle: 'text-sm', textSub: 'text-[10px]' },
    lg: { markW: 84, markH: 56, textTitle: 'text-base', textSub: 'text-xs' },
    xl: { markW: 130, markH: 88, textTitle: 'text-xl', textSub: 'text-xs' },
    '2xl': { markW: 200, markH: 135, textTitle: 'text-3xl', textSub: 'text-sm' },
    '3xl': { markW: 290, markH: 195, textTitle: 'text-4xl', textSub: 'text-base' },
    '4xl': { markW: 380, markH: 255, textTitle: 'text-5xl', textSub: 'text-lg' }
  }[size];

  const isDark = theme === 'dark';

  // Precision Vector Geometry matching image.png DITTO
  const renderMonogram = (w: number, h: number) => (
    <div
      className={`relative flex items-center justify-center shrink-0 transition-all ${
        glow ? 'drop-shadow-[0_0_22px_rgba(56,189,248,0.7)]' : 'drop-shadow-[0_8px_16px_rgba(7,21,48,0.08)]'
      }`}
      style={{ width: `${w}px`, height: `${h}px` }}
    >
      <svg
        viewBox="0 0 600 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-contain"
      >
        <defs>
          {/* Main Dark Royal Blue Gradient for R */}
          <linearGradient id="rit-r-base-dyn" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#143468" />
            <stop offset="45%" stopColor="#1e4da1" />
            <stop offset="75%" stopColor="#0e2652" />
            <stop offset="100%" stopColor="#071530" />
          </linearGradient>

          {/* 3D Specular Highlight on R Shoulder Curve */}
          <linearGradient id="rit-r-shoulder-dyn" x1="0%" y1="0%" x2="100%" y2="80%">
            <stop offset="0%" stopColor="#2a66c4" />
            <stop offset="35%" stopColor="#3b82f6" />
            <stop offset="70%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#081836" />
          </linearGradient>

          {/* Lower Diagonal Leg of R */}
          <linearGradient id="rit-r-leg-dyn" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#133366" />
            <stop offset="60%" stopColor="#0c2044" />
            <stop offset="100%" stopColor="#061228" />
          </linearGradient>

          {/* Electric Cyan Vibrant Gradient for I */}
          <linearGradient id="rit-i-vibrant-dyn" x1="0%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#00a3ff" />
            <stop offset="30%" stopColor="#0088eb" />
            <stop offset="70%" stopColor="#005db3" />
            <stop offset="100%" stopColor="#00356e" />
          </linearGradient>

          {/* Bevel Highlight for I */}
          <linearGradient id="rit-i-bevel-dyn" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="60%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>

          {/* Deep Navy for T Crossbar */}
          <linearGradient id="rit-t-crossbar-dyn" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#143468" />
            <stop offset="40%" stopColor="#0f254e" />
            <stop offset="100%" stopColor="#061229" />
          </linearGradient>

          {/* Deep Navy for T Stem */}
          <linearGradient id="rit-t-stem-dyn" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#091834" />
            <stop offset="50%" stopColor="#102957" />
            <stop offset="100%" stopColor="#051024" />
          </linearGradient>
        </defs>

        {/* ================= LETTER 'R' ================= */}
        <g>
          {/* Upper Top Bar and Round Loop */}
          <path
            d="M 50 50 
               L 235 50 
               C 275 50, 305 78, 305 125 
               C 305 174, 275 204, 222 212 
               L 222 175 
               C 252 168, 268 150, 268 125 
               C 268 95, 250 105, 225 105 
               L 105 105 
               Z"
            fill="url(#rit-r-base-dyn)"
          />

          {/* 3D Cylindrical Highlight along R curve */}
          <path
            d="M 200 50 
               L 235 50 
               C 275 50, 305 78, 305 125 
               C 305 158, 288 185, 258 200 
               C 245 175, 242 130, 200 105 
               Z"
            fill="url(#rit-r-shoulder-dyn)"
          />

          {/* Inner Counter Loop */}
          <path
            d="M 180 105 
               C 235 105, 268 120, 268 142 
               C 268 180, 215 214, 180 214 
               L 180 170 
               C 200 170, 230 158, 230 142 
               C 230 126, 210 105, 180 105 Z"
            fill="#0d2450"
          />

          {/* Lower Diagonal Leg (Slanted 45° to Baseline) */}
          <polygon
            points="105,175 180,175 320,330 245,330"
            fill="url(#rit-r-leg-dyn)"
          />

          {/* Subtle Inner Leg Crease */}
          <polygon
            points="105,175 180,175 195,190 120,190"
            fill="#061226"
            opacity="0.4"
          />
        </g>

        {/* ================= LETTER 'I' ================= */}
        <g>
          {/* Electric Cyan Dynamic Rhombus Column */}
          <polygon
            points="330,85 385,140 385,330 330,330"
            fill="url(#rit-i-vibrant-dyn)"
          />
          {/* Top Slanted Bevel Highlight */}
          <polygon
            points="330,85 385,140 372,140 330,98"
            fill="url(#rit-i-bevel-dyn)"
          />
          {/* Left Vertical Edge Glow Highlight */}
          <polygon
            points="330,85 335,90 335,330 330,330"
            fill="#7dd3fc"
            opacity="0.75"
          />
        </g>

        {/* ================= LETTER 'T' ================= */}
        <g>
          {/* Top Crossbar with Parallel 45° Slanted Edges */}
          <polygon
            points="345,50 575,50 520,105 400,105"
            fill="url(#rit-t-crossbar-dyn)"
          />
          {/* Vertical Stem to Baseline */}
          <polygon
            points="415,105 470,105 470,330 415,330"
            fill="url(#rit-t-stem-dyn)"
          />
          {/* Right Corner Accent */}
          <polygon
            points="575,50 520,105 508,105 563,50"
            fill="#1d4ed8"
            opacity="0.35"
          />
        </g>
      </svg>
    </div>
  );

  if (variant === 'mark') {
    return (
      <div className={`inline-flex items-center ${className}`}>
        {renderMonogram(sizeConfig.markW, sizeConfig.markH)}
      </div>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div className={`inline-flex items-center gap-3.5 ${className}`}>
        {renderMonogram(sizeConfig.markW, sizeConfig.markH)}
        {showCompanyText && (
          <div className="flex flex-col justify-center text-left">
            <span
              className={`font-black tracking-[0.2em] leading-none ${
                isDark ? 'text-white' : 'text-[#071530]'
              } ${sizeConfig.textTitle}`}
            >
              R I T
            </span>
            <span
              className={`font-semibold tracking-[0.2em] uppercase mt-1 ${
                isDark ? 'text-[#94a3b8]' : 'text-[#334155]'
              } ${sizeConfig.textSub}`}
            >
              {tagline}
            </span>
            {companyName && (
              <span
                className={`font-mono text-[10px] tracking-wider uppercase mt-0.5 ${
                  isDark ? 'text-[#38bdf8]' : 'text-[#0284c7]'
                }`}
              >
                {companyName}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  // Full stacked variant (matching image.png DITTO)
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      {renderMonogram(sizeConfig.markW, sizeConfig.markH)}

      {showCompanyText && (
        <div className="mt-5 sm:mt-6 flex flex-col items-center">
          <span
            className={`font-black tracking-[0.32em] uppercase leading-none font-sans ${
              isDark ? 'text-white' : 'text-[#071530]'
            } ${sizeConfig.textTitle} ${
              glow ? 'drop-shadow-[0_0_12px_rgba(56,189,248,0.4)]' : ''
            }`}
          >
            R I T
          </span>

          <span
            className={`font-semibold tracking-[0.35em] sm:tracking-[0.42em] uppercase mt-3 font-sans ${
              isDark ? 'text-[#94a3b8]' : 'text-[#334155]'
            } ${sizeConfig.textSub}`}
          >
            {tagline}
          </span>

          {companyName && (
            <div className="mt-3.5 pt-2.5 border-t border-slate-200/80 flex flex-col items-center">
              <span
                className={`font-bold tracking-widest text-xs sm:text-sm uppercase ${
                  isDark ? 'text-[#38bdf8]' : 'text-[#0f224a]'
                }`}
              >
                {companyName}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
