import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const PowerChordLogo: React.FC<LogoProps> = ({
  className = '',
  showText = true,
  size = 'md',
}) => {
  const sizeMap = {
    sm: { icon: 28, text: 'text-lg', dot: 'w-1.5 h-1.5' },
    md: { icon: 38, text: 'text-2xl', dot: 'w-2 h-2' },
    lg: { icon: 48, text: 'text-3xl', dot: 'w-2.5 h-2.5' },
    xl: { icon: 64, text: 'text-4xl', dot: 'w-3 h-3' },
  };

  const { icon, text, dot } = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Dynamic Pick & Fret Icon */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          width={icon}
          height={icon}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_2px_8px_rgba(249,115,22,0.35)] transition-transform duration-300 hover:scale-105"
        >
          <defs>
            <linearGradient id="pcGrad" x1="10%" y1="0%" x2="90%" y2="100%">
              <stop offset="0%" stopColor="#FB923C" />
              <stop offset="50%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#EA580C" />
            </linearGradient>
            <linearGradient id="fretGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#FED7AA" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Guitar Pick Base */}
          <path
            d="M 50 94 C 36 94 12 68 12 36 C 12 18 30 10 50 10 C 70 10 88 18 88 36 C 88 68 64 94 50 94 Z"
            fill="url(#pcGrad)"
          />

          {/* Guitar Strings / Frets Accent */}
          <line x1="32" y1="26" x2="68" y2="26" stroke="url(#fretGrad)" strokeWidth="3" strokeLinecap="round" />
          <line x1="35" y1="40" x2="65" y2="40" stroke="url(#fretGrad)" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="40" y1="54" x2="60" y2="54" stroke="url(#fretGrad)" strokeWidth="3" strokeLinecap="round" />

          {/* Vertical Strings */}
          <line x1="40" y1="20" x2="43" y2="66" stroke="#FFFFFF" strokeOpacity="0.65" strokeWidth="2" strokeLinecap="round" />
          <line x1="50" y1="18" x2="50" y2="72" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="60" y1="20" x2="57" y2="66" stroke="#FFFFFF" strokeOpacity="0.65" strokeWidth="2" strokeLinecap="round" />

          {/* Chord Dots on Frets */}
          <circle cx="41" cy="40" r="4.5" fill="#FFFFFF" />
          <circle cx="50" cy="54" r="4.5" fill="#FED7AA" />
          <circle cx="58" cy="40" r="4.5" fill="#FFFFFF" />
        </svg>

        {/* Live Audio indicator dot */}
        <span className={`absolute -top-0.5 -right-0.5 ${dot} bg-amber-400 rounded-full animate-pulse ring-2 ring-white dark:ring-slate-900`} />
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center font-extrabold tracking-tight">
            <span className={`${text} text-slate-900 dark:text-white font-sans tracking-tight`}>
              Power<span className="text-amber-500">Chord</span>
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-600 dark:text-amber-400 mt-0.5">
            Katalog Kunci Gitar
          </span>
        </div>
      )}
    </div>
  );
};
