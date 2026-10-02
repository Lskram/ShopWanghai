'use client';

import React from 'react';
import { ShoppingBag, Search, ShieldCheck, Phone, Store, Settings, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function Navbar({ 
  searchTerm, 
  setSearchTerm, 
  cartCount, 
  onOpenCart,
  selectedCategory,
  onSelectCategory 
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      {/* Top Notification Bar */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-emerald-950 font-bold px-2 py-0.5 rounded text-[10px] tracking-wide uppercase">
              สวัสดิการชุมชน
            </span>
            <span>ยินดีต้อนรับสู่ร้านค้ากองทุนหมู่บ้านวังไฮ • เปิดทุกวัน 06:00 - 20:30 น.</span>
          </div>
          <div className="flex items-center gap-4 text-emerald-100">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> สั่งครบ 200.- ส่งฟรีถึงหน้าบ้านในหมู่บ้าน
            </span>
            <span className="hidden md:inline">|</span>
            <span className="hidden md:flex items-center gap-1">
              <Phone className="w-3 h-3" /> โทรสั่ง: 081-234-5678
            </span>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Store Name */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-md shadow-emerald-200 group-hover:scale-105 transition-transform">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight font-heading">
                  กองทุนหมู่บ้านวังไฮ
                </h1>
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-medium px-1.5 py-0.5 rounded-full border border-emerald-200 hidden sm:inline-block">
                  ร้านค้าชุมชน
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">ของกิน ของใช้ สินค้า OTOP ราคาย่อมเยา</p>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="ค้นหาชื่อสินค้า ขนม เครื่องปรุง ของใช้ หรือสินค้า OTOP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-full text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-inner"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3.5 top-3 text-xs text-slate-400 hover:text-slate-600"
                >
                  ล้างคำค้น
                </button>
              )}
            </div>
          </div>

          {/* Actions: Admin & Cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              title="ระบบจัดการสต็อกหลังบ้าน"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">จัดการสต็อก</span>
            </Link>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-200 transition-all active:scale-95 font-medium text-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">ตะกร้าสินค้า</span>
              {cartCount > 0 && (
                <span className="bg-amber-400 text-emerald-950 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="mt-3 md:hidden">
          <div className="relative">
            <input
              type="text"
              placeholder="ค้นหาชื่อสินค้า ขนม หรือของใช้..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
        </div>
      </div>
    </header>
  );
}
