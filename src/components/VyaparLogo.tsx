import React, { useId } from 'react';

interface VyaparLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  theme?: 'dark' | 'light';
  subtitle?: string;
  className?: string;
}

export const VyaparLogo: React.FC<VyaparLogoProps> = ({
  size = 'md',
  showText = true,
  theme = 'dark',
  subtitle,
  className = '',
}) => {
  const uniqueId = useId().replace(/:/g, '');
  const cyanGradId = `cyanGrad-${uniqueId}`;
  const emeraldGradId = `emeraldGrad-${uniqueId}`;

  const iconSizes = {
    sm: { box: 'w-7 h-7 rounded-lg', svg: 'w-5 h-5' },
    md: { box: 'w-9 h-9 rounded-xl', svg: 'w-6 h-6' },
    lg: { box: 'w-10 h-10 rounded-xl', svg: 'w-7 h-7' },
  };

  const textSizes = {
    sm: 'text-[16px]',
    md: 'text-[19px]',
    lg: 'text-[22px]',
  };

  const currentIconSize = iconSizes[size] || iconSizes.md;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Dual Swirl Icon Badge matching Landing Page */}
      <div
        className={`${currentIconSize.box} bg-[#071325] border border-cyan-400/40 flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.25)] shrink-0`}
      >
        <svg className={currentIconSize.svg} viewBox="0 0 36 36" fill="none">
          <path
            d="M17.5 4C11.2 4 6.8 9 7 15.5C7.2 20.8 10.4 24.8 15 26.5C13.2 24.5 12.2 21.6 12.2 18.2C12.2 13 15.8 8.2 20.5 6.2C19.6 5 18.6 4 17.5 4Z"
            fill={`url(#${cyanGradId})`}
          />
          <path
            d="M18.5 32C24.8 32 29.2 27 29 20.5C28.8 15.2 25.6 11.2 21 9.5C22.8 11.5 23.8 14.4 23.8 17.8C23.8 23 20.2 27.8 15.5 29.8C16.4 31 17.4 32 18.5 32Z"
            fill={`url(#${emeraldGradId})`}
          />
          <defs>
            <linearGradient id={cyanGradId} x1="7" y1="4" x2="20" y2="26" gradientUnits="userSpaceOnUse">
              <stop stopColor="#38bdf8" />
              <stop offset="1" stopColor="#0284c7" />
            </linearGradient>
            <linearGradient id={emeraldGradId} x1="16" y1="10" x2="29" y2="32" gradientUnits="userSpaceOnUse">
              <stop stopColor="#34d399" />
              <stop offset="1" stopColor="#059669" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-tight select-none">
          <span
            className={`${textSizes[size]} font-black tracking-tight ${
              theme === 'dark' ? 'text-white' : 'text-[#071325]'
            }`}
          >
            Vyapar<span className="text-[#0284c7]">Trust</span>
          </span>
          {subtitle && (
            <span
              className={`text-[9px] font-semibold tracking-wider uppercase ${
                theme === 'dark' ? 'text-gray-400' : 'text-[#6d7a72]'
              }`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
