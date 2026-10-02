import React from 'react';
import { Sparkles, Truck, ShieldCheck, Coins, ArrowRight, HeartHandshake } from 'lucide-react';

export default function HeroBanner({ onExploreCommunity, onExploreBestSellers }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 text-white shadow-xl shadow-emerald-950/20 mb-8">
      {/* Background Decorative Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
      <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -left-16 -top-16 w-80 h-80 bg-amber-400/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative px-6 py-8 sm:px-10 sm:py-12 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Left Content */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 bg-emerald-900/60 backdrop-blur-md border border-emerald-500/30 text-emerald-200 text-xs font-medium px-3.5 py-1.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>โครงการส่งเสริมเศรษฐกิจชุมชน ร้านค้าสวัสดิการหมู่บ้านวังไฮ</span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight font-heading">
              ของกิน ของใช้ <span className="text-amber-300 underline decoration-amber-400/50 decoration-wavy">ครบครัน</span> <br className="hidden sm:inline" />
              ราคาย่อมเยา เพื่อคนในชุมชน
            </h2>

            <p className="text-sm sm:text-base text-emerald-100/90 max-w-xl font-light leading-relaxed">
              สั่งซื้อของสด ของแห้ง เครื่องปรุง ขนม และผลิตภัณฑ์ OTOP ฝีมือกลุ่มแม่บ้านเกษตรกรบ้านวังไฮ ส่งตรงถึงหน้าบ้าน สมาชิกสะสมแต้มรับเงินปันผลทุกสิ้นปี
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onExploreCommunity}
                className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-900/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-emerald-900" />
                <span>ช้อปสินค้า OTOP วังไฮ</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={onExploreBestSellers}
                className="px-5 py-3 bg-emerald-900/80 hover:bg-emerald-900 text-white font-medium text-sm rounded-xl border border-emerald-600/50 transition-all hover:bg-emerald-900"
              >
                ดูสินค้าขายดีทั้งหมด
              </button>
            </div>
          </div>

          {/* Right Highlights Grid */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 transition-all hover:bg-white/15">
              <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center mb-2.5">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white font-heading">ส่งฟรีถึงหน้าบ้าน</h3>
              <p className="text-xs text-emerald-200/80 mt-1">สั่งครบ 200.- ส่งฟรีในหมู่บ้าน หมู่ 1 - 8</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 transition-all hover:bg-white/15">
              <div className="w-9 h-9 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center mb-2.5">
                <Coins className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white font-heading">เงินปันผลสมาชิก</h3>
              <p className="text-xs text-emerald-200/80 mt-1">ซื้อสะสมยอด สมาชิกรับเงินปันผลทุกสิ้นปี</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 transition-all hover:bg-white/15">
              <div className="w-9 h-9 rounded-xl bg-teal-400/20 text-teal-300 flex items-center justify-center mb-2.5">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white font-heading">ของดี OTOP วังไฮ</h3>
              <p className="text-xs text-emerald-200/80 mt-1">กล้วยตาก น้ำพริก ข้าวกล้องอินทรีย์แท้</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 transition-all hover:bg-white/15">
              <div className="w-9 h-9 rounded-xl bg-sky-400/20 text-sky-300 flex items-center justify-center mb-2.5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-white font-heading">สต็อกสดใหม่</h3>
              <p className="text-xs text-emerald-200/80 mt-1">ไข่ไก่อารมณ์ดี ของกินของใช้เข้าใหม่ทุกวัน</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
