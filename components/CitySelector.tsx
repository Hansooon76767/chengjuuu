
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface CitySelectorProps {
  value: string;
  onChange: (city: string) => void;
  className?: string;
}

// Minimalist City Logos
const CityLogo = ({ type, active }: { type: string, active?: boolean }) => {
  const color = active ? "currentColor" : "white";
  const stroke = 2.5;

  switch (type) {
    case 'SH': // Oriental Pearl
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" className="w-4 h-4">
          <path d="M12 2v20M12 7a2 2 0 100-4 2 2 0 000 4zM12 15a3 3 0 100-6 3 3 0 000 6z" />
          <path d="M9 22l3-3 3 3" />
        </svg>
      );
    case 'BJ': // Temple of Heaven
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" className="w-4 h-4">
          <path d="M4 20h16M6 20v-4h12v4M8 16V10l4-4 4 4v6M12 6V3" />
        </svg>
      );
    case 'GZ': // Canton Tower
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" className="w-4 h-4">
          <path d="M10 22l2-19 2 19M8 22h8M10 10h4M11 6h2" />
          <path d="M9 16c2-1 4-1 6 0" />
        </svg>
      );
    case 'SZ': // Skyscraper
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" className="w-4 h-4">
          <path d="M8 22V4l4-2 4 2v18M12 2v20M8 8h8M8 12h8M8 16h8" />
        </svg>
      );
    case 'HZ': // Bridge / Three Pools
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" className="w-4 h-4">
          <path d="M3 18c6-4 12-4 18 0M12 14V4M8 8l4-4 4 4" />
          <circle cx="12" cy="18" r="1.5" fill={color} />
        </svg>
      );
    default:
      return null;
  }
};

const CITIES = [
  { name: '上海', landmark: 'SH' },
  { name: '北京', landmark: 'BJ' },
  { name: '广州', landmark: 'GZ' },
  { name: '深圳', landmark: 'SZ' },
  { name: '杭州', landmark: 'HZ' },
];

export const CitySelector: React.FC<CitySelectorProps> = ({ value, onChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentCity = CITIES.find(c => c.name === value) || CITIES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div 
      className={`relative z-40 ${className}`}
      ref={containerRef}
    >
      {/* Capsule Trigger */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`
          inline-flex items-center space-x-3 
          bg-black text-white
          rounded-full px-5 py-2.5 
          transition-all duration-300 cursor-pointer
          active:scale-95 shadow-premium border border-white/10
          hover:bg-zinc-900 group
        `}
      >
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-accent">
            <CityLogo type={currentCity.landmark} active={true} />
          </div>
          <span className="text-[11px] font-black uppercase tracking-widest">{currentCity.name}</span>
        </div>
        <ChevronDown 
          size={12} 
          strokeWidth={3}
          className={`text-accent transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </div>

      {/* Floating Capsule Menu */}
      <div className={`
        absolute top-[calc(100%+12px)] left-0 min-w-[160px]
        bg-black/95 backdrop-blur-2xl rounded-[32px] shadow-premium-lg 
        p-2 border border-white/10 overflow-hidden
        transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) origin-top-left
        ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 -translate-y-4 pointer-events-none'}
      `}>
        <div className="space-y-1">
          {CITIES.map((city) => (
            <div
              key={city.name}
              onClick={() => {
                onChange(city.name);
                setIsOpen(false);
              }}
              className={`
                group flex items-center space-x-3 px-4 py-3 cursor-pointer
                rounded-full transition-all duration-300
                ${value === city.name 
                  ? 'bg-accent text-black shadow-accent-glow scale-[1.02]' 
                  : 'hover:bg-white/10 text-white/70 hover:text-white'}
              `}
            >
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center
                transition-all duration-300
                ${value === city.name ? 'bg-black text-accent' : 'bg-white/5 group-hover:bg-white/20 text-white/40'}
              `}>
                <CityLogo type={city.landmark} active={value === city.name} />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-[12px] font-black uppercase tracking-widest">{city.name}</span>
              </div>
              {value === city.name && (
                <div className="ml-auto w-1.5 h-1.5 bg-black rounded-full animate-pulse"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
