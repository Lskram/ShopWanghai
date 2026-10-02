'use client';

import React from 'react';
import { 
  Store, 
  Sparkles, 
  Flame, 
  Soup, 
  Cookie, 
  Coffee, 
  Home 
} from 'lucide-react';

const ICON_MAP = {
  Store: Store,
  Sparkles: Sparkles,
  Flame: Flame,
  Soup: Soup,
  Cookie: Cookie,
  Coffee: Coffee,
  Home: Home,
};

export default function CategoryFilter({ categories, selectedCategory, onSelectCategory, counts }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-slate-800 font-heading">หมวดหมู่สินค้า</h3>
        <span className="text-xs text-slate-500">เลือกหมวดหมู่เพื่อกรองสินค้า</span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const Icon = ICON_MAP[cat.icon] || Store;
          const isSelected = selectedCategory === cat.id;
          const count = counts?.[cat.id] ?? cat.count ?? 0;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 shrink-0 ${
                isSelected
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-200 font-semibold scale-102'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 hover:border-slate-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-300' : 'text-slate-500'}`} />
              <span>{cat.name}</span>
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-100 text-slate-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
