import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  linkTo?: string;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showBadge = true,
  linkTo = '/',
}) => {
  const sizeMap = {
    sm: { icon: 'w-6 h-6', text: 'text-lg', badge: 'text-[9px] px-1.5 py-0.5' },
    md: { icon: 'w-8 h-8', text: 'text-xl', badge: 'text-[10px] px-2 py-0.5' },
    lg: { icon: 'w-10 h-10', text: 'text-2xl', badge: 'text-xs px-2.5 py-1' },
    xl: { icon: 'w-14 h-14', text: 'text-4xl', badge: 'text-sm px-3 py-1' },
  };

  const currentSize = sizeMap[size];

  const content = (
    <div className={`inline-flex items-center gap-2.5 group cursor-pointer ${className}`}>
      {/* Glowing Neon Icon */}
      <div className={`relative flex items-center justify-center ${currentSize.icon} rounded-xl bg-[#0D111A] border border-cyan-500/40 p-1.5 shadow-[0_0_15px_-2px_rgba(0,242,254,0.4)] group-hover:shadow-[0_0_25px_rgba(0,242,254,0.7)] group-hover:border-cyan-400 transition-all duration-300`}>
        {/* Animated Glow Halo */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-purple-600/20 blur-sm opacity-50 group-hover:opacity-100 transition-opacity" />
        
        <svg viewBox="0 0 48 48" fill="none" className="w-full h-full relative z-10">
          <path d="M14 16L24 24M34 16L24 24M24 24L14 32M24 24L34 32" stroke="url(#navLogoGrad)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="24" cy="24" r="3.5" fill="#00F2FE" />
          <defs>
            <linearGradient id="navLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00F2FE" />
              <stop offset="50%" stopColor="#818CF8" />
              <stop offset="100%" stopColor="#C084FC" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Text */}
      <div className="flex items-center gap-1.5 font-['Outfit'] font-bold tracking-tight">
        <span className={`${currentSize.text} text-white tracking-tight`}>
          Snap<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-300">Cut</span>
        </span>
        {showBadge && (
          <span className={`rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/40 text-cyan-300 font-semibold tracking-wider font-mono ${currentSize.badge} shadow-[0_0_10px_rgba(0,242,254,0.2)]`}>
            AI
          </span>
        )}
      </div>
    </div>
  );

  if (linkTo) {
    return <Link to={linkTo}>{content}</Link>;
  }

  return content;
};
