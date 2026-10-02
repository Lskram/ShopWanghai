'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Cookie, 
  Coffee, 
  Flame, 
  Soup, 
  Home, 
  Store, 
  Package 
} from 'lucide-react';

const CATEGORY_STYLES = {
  'retro-snacks': {
    bg: 'from-amber-600 via-orange-600 to-amber-800',
    icon: Sparkles,
    label: 'ขนมไทยโบราณ',
    accent: 'bg-amber-400 text-emerald-950',
    pattern: '🏺'
  },
  'otop': {
    bg: 'from-emerald-700 via-teal-700 to-emerald-900',
    icon: Sparkles,
    label: 'OTOP วังไฮ',
    accent: 'bg-amber-400 text-emerald-950',
    pattern: '🌾'
  },
  'seasoning': {
    bg: 'from-orange-600 via-red-600 to-amber-700',
    icon: Flame,
    label: 'เครื่องปรุง & วัตถุดิบ',
    accent: 'bg-orange-100 text-orange-900',
    pattern: '🍳'
  },
  'dryfood': {
    bg: 'from-red-700 via-rose-700 to-red-900',
    icon: Soup,
    label: 'อาหารแห้ง & บะหมี่',
    accent: 'bg-red-100 text-red-900',
    pattern: '🍜'
  },
  'snacks': {
    bg: 'from-yellow-600 via-amber-600 to-orange-700',
    icon: Cookie,
    label: 'ขนมขบเคี้ยว',
    accent: 'bg-yellow-100 text-yellow-900',
    pattern: '🍿'
  },
  'drinks': {
    bg: 'from-blue-600 via-cyan-600 to-indigo-700',
    icon: Coffee,
    label: 'เครื่องดื่ม & นม',
    accent: 'bg-blue-100 text-blue-900',
    pattern: '🥤'
  },
  'household': {
    bg: 'from-teal-600 via-emerald-600 to-slate-700',
    icon: Home,
    label: 'ของใช้ในบ้าน',
    accent: 'bg-teal-100 text-teal-900',
    pattern: '🧼'
  }
};

export default function ProductImage({ 
  src, 
  alt, 
  category = 'retro-snacks', 
  isCommunity = false,
  className = "w-full h-full object-cover" 
}) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const style = CATEGORY_STYLES[category] || CATEGORY_STYLES['retro-snacks'];
  const Icon = style.icon;

  if (hasError || !src) {
    return (
      <div className={`w-full h-full bg-gradient-to-br ${style.bg} p-4 flex flex-col items-center justify-between text-white select-none relative overflow-hidden`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 text-6xl flex items-center justify-center font-serif pointer-events-none">
          {style.pattern}
        </div>
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />

        {/* Top Badge */}
        <div className="w-full flex justify-between items-center z-10">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/30 backdrop-blur-xs text-amber-200">
            {isCommunity ? '⭐ OTOP วังไฮ' : style.label}
          </span>
          <span className="text-lg">{style.pattern}</span>
        </div>

        {/* Center Icon & Title */}
        <div className="text-center z-10 space-y-1 my-auto">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto shadow-inner text-white">
            <Icon className="w-6 h-6" />
          </div>
          <div className="font-bold text-xs sm:text-sm font-heading line-clamp-2 px-2 text-white drop-shadow-sm">
            {alt}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="w-full text-center z-10">
          <span className="text-[9px] text-white/80 font-medium tracking-wider uppercase">
            ร้านค้ากองทุนหมู่บ้านวังไฮ
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-slate-100 overflow-hidden">
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-200 animate-pulse flex items-center justify-center text-slate-400">
          <Package className="w-6 h-6" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        crossOrigin="anonymous"
      />
    </div>
  );
}
