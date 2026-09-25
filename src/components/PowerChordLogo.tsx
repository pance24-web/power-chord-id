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
    sm: { icon: 30, text: 'text-lg' },
    md: { icon: 38, text: 'text-2xl' },
    lg: { icon: 48, text: 'text-3xl' },
    xl: { icon: 60, text: 'text-4xl' },
  };

  const { icon, text } = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* PowerChord Pick Icon matching PowerChord-logo.png */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-sm transition-transform duration-200 hover:scale-105"
      >
        <defs>
          <linearGradient id="pickGrad" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#FB923C" />
            <stop offset="50%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>
          <linearGradient id="stripeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F97316" />
            <stop offset="50%" stopColor="#FB923C" />
            <stop offset="100%" stopColor="#F97316" />
          </linearGradient>
        </defs>

        {/* Outer Guitar Pick Body */}
        <path
          d="M 50 94 C 36 94 12 70 12 36 C 12 18 30 10 50 10 C 70 10 88 18 88 36 C 88 70 64 94 50 94 Z"
          fill="url(#pickGrad)"
        />

        {/* Inner White Cavity */}
        <path
          d="M 26 34 C 26 22 36 18 50 18 C 64 18 74 22 74 34 C 74 54 62 66 50 66 C 38 66 26 54 26 34 Z"
          fill="#FFFFFF"
        />

        {/* Top Sound Wave Stripe */}
        <path
          d="M 33 33 C 44 28 56 28 67 33"
          stroke="url(#stripeGrad)"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Middle Sound Wave Stripe */}
        <path
          d="M 35 48 C 45 43 55 43 65 48"
          stroke="url(#stripeGrad)"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </svg>

      {showText && (
        <span className={`${text} font-black tracking-tight text-slate-900 dark:text-white leading-none font-sans`}>
          Power<span className="text-blue-600 dark:text-blue-500">Chord</span>
        </span>
      )}
    </div>
  );
};
