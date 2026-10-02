'use client';

import React from 'react';
import { Sparkles, ArrowRight, Package } from 'lucide-react';

export default function CollectionShowcase({ collections, selectedCollection, onSelectCollection }) {
  return (
    <div className="mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-heading flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>คอลเลกชันพิเศษ & เซตยอดฮิต</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            เลือกช้อปตามเซต รวมขนมไทยโบราณ ของดี OTOP วังไฮ และเซตประหยัด
          </p>
        </div>

        {selectedCollection && (
          <button
            onClick={() => onSelectCollection(null)}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 self-start sm:self-auto"
          >
            <span>ดูสินค้าทั้งหมดทุกคอลเลกชัน</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Collections Horizontal Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {collections.map((col) => {
          const isSelected = selectedCollection === col.id;

          return (
            <div
              key={col.id}
              onClick={() => onSelectCollection(isSelected ? null : col.id)}
              className={`group relative rounded-2xl overflow-hidden cursor-pointer border transition-all duration-300 transform hover:-translate-y-1 shadow-sm hover:shadow-xl ${
                isSelected
                  ? 'border-amber-400 ring-2 ring-amber-400 ring-offset-2'
                  : 'border-slate-200 hover:border-emerald-300'
              }`}
            >
              {/* Image Background & Gradient Overlay */}
              <div className="relative aspect-[16/10] w-full bg-slate-900 overflow-hidden">
                <img
                  src={col.image}
                  alt={col.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-90"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${col.color} opacity-80 mix-blend-multiply transition-opacity`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                {/* Badge */}
                <div className="absolute top-2.5 left-2.5 z-10">
                  <span className="bg-amber-400 text-emerald-950 text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-sm">
                    {col.badge}
                  </span>
                </div>

                {/* Content Overlay */}
                <div className="absolute bottom-0 inset-x-0 p-3.5 text-white z-10 flex flex-col justify-end">
                  <h4 className="font-bold text-sm sm:text-base leading-snug font-heading group-hover:text-amber-300 transition-colors">
                    {col.name}
                  </h4>
                  <p className="text-[11px] text-slate-200 mt-1 line-clamp-1 opacity-90 font-light">
                    {col.tagline}
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/20 text-[11px]">
                    <span className="text-amber-300 font-medium">
                      {isSelected ? '✓ กำลังเลือกดู' : 'กดเพื่อเลือกดู'}
                    </span>
                    <span className="flex items-center gap-1 bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded-full text-[10px]">
                      <Package className="w-3 h-3 text-amber-300" /> {col.itemCount || 10}+ รายการ
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
