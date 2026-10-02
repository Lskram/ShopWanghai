import React from 'react';
import { Store, Phone, MapPin, Clock, Heart, ShieldCheck } from 'lucide-react';
import { VILLAGE_INFO } from '../data/mockProducts';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800">
          {/* Col 1: Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold">
                <Store className="w-5 h-5" />
              </div>
              <span className="font-bold text-base text-white font-heading">
                กองทุนหมู่บ้านวังไฮ
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              ร้านค้าสวัสดิการชุมชนบ้านวังไฮ เพื่อส่งเสริมเศรษฐกิจฐานราก จำหน่ายสินค้าคุณภาพราคาย่อมเยา และผลิตภัณฑ์ OTOP ของชุมชน
            </p>
          </div>

          {/* Col 2: Village Features */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-heading">
              สวัสดิการชุมชน
            </h4>
            <ul className="text-xs text-slate-400 space-y-1.5">
              <li>• สมาชิกรับเงินปันผลทุกสิ้นปี</li>
              <li>• ส่งฟรีในหมู่บ้านเมื่อสั่งครบ 200.-</li>
              <li>• สนับสนุนสินค้ากลุ่มแม่บ้านวังไฮ</li>
              <li>• สินค้าราคาควบคุมเพื่อคนในชุมชน</li>
            </ul>
          </div>

          {/* Col 3: Contact & Hours */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-heading">
              ติดต่อร้านค้า
            </h4>
            <div className="text-xs text-slate-400 space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{VILLAGE_INFO.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{VILLAGE_INFO.openHours}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>โทร: {VILLAGE_INFO.phone}</span>
              </div>
            </div>
          </div>

          {/* Col 4: PromptPay & LINE */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-heading">
              ช่องทางออนไลน์
            </h4>
            <p className="text-xs text-slate-400">
              สั่งซื้อผ่าน LINE OA พร้อม AI ผู้ช่วยแนะนำสินค้าได้ตลอด 24 ชั่วโมง
            </p>
            <div className="pt-2">
              <span className="inline-block bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-xs px-3 py-1 rounded-lg">
                LINE ID: {VILLAGE_INFO.lineId}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            © 2026 ร้านค้าสวัสดิการ กองทุนหมู่บ้านวังไฮ. All rights reserved.
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <span>สร้างเพื่อส่งเสริมเศรษฐกิจชุมชนบ้านวังไฮ</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </div>
        </div>
      </div>
    </footer>
  );
}
