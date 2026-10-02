'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, QrCode, Phone, MapPin, User, FileText, ArrowRight, Sparkles, Building2, Truck, Copy, Check } from 'lucide-react';
import { VILLAGE_INFO } from '../data/mockProducts';
import { storeRepo } from '../lib/supabase';

export default function CheckoutModal({
  isOpen,
  onClose,
  cartItems,
  deliveryType,
  onOrderCompleted
}) {
  const [step, setStep] = useState('form'); // 'form' | 'payment' | 'success'
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    houseNumber: '',
    villageMoo: 'หมู่ 4 (บ้านวังไฮ)',
    notes: '',
    paymentMethod: 'promptpay'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const isFreeDelivery = subtotal >= VILLAGE_INFO.freeDeliveryThreshold;
  const deliveryFee = deliveryType === 'pickup' ? 0 : isFreeDelivery ? 0 : VILLAGE_INFO.deliveryFee;
  const totalAmount = subtotal + deliveryFee;

  const handleCopyPromptPay = () => {
    navigator.clipboard.writeText(VILLAGE_INFO.promptPayNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('กรุณากรอกชื่อและเบอร์โทรศัพท์สำหรับติดต่อครับ');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderPayload = {
        customerName: formData.name,
        customerPhone: formData.phone,
        customerAddress: deliveryType === 'delivery' 
          ? `บ้านเลขที่ ${formData.houseNumber} ${formData.villageMoo} ต.วังไฮ` 
          : 'รับเองที่ร้านค้าสวัสดิการกองทุนหมู่บ้าน',
        deliveryType,
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          unit: item.unit,
          total: item.price * item.quantity
        })),
        subtotal,
        deliveryFee,
        totalAmount,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes
      };

      const result = await storeRepo.createOrder(orderPayload);
      setCompletedOrder(result);
      setStep('success');
      onOrderCompleted();
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการบันทึกออเดอร์ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div 
        className="relative bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 p-6 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        {step !== 'success' && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* STEP 1: Customer Form */}
        {step === 'form' && (
          <form onSubmit={(e) => { e.preventDefault(); setStep('payment'); }} className="space-y-4">
            <div className="text-center pb-2 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 font-heading">
                ข้อมูลการจัดส่ง & ผู้รับสินค้า
              </h3>
              <p className="text-xs text-slate-500">
                {deliveryType === 'delivery' ? 'บริการจัดส่งถึงบันไดบ้านในหมู่บ้านวังไฮ' : 'รับสินค้าที่ร้านค้าสวัสดิการกองทุนหมู่บ้าน'}
              </p>
            </div>

            <div className="space-y-3 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อ-นามสกุล / ชื่อเล่นผู้สั่ง <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="เช่น ป้าสมศรี, ลุงบุญส่ง"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  เบอร์โทรศัพท์ติดต่อ <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="08x-xxx-xxxx"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {deliveryType === 'delivery' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      บ้านเลขที่ <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น 123/4"
                      value={formData.houseNumber}
                      onChange={(e) => setFormData({ ...formData, houseNumber: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      หมู่ที่
                    </label>
                    <select
                      value={formData.villageMoo}
                      onChange={(e) => setFormData({ ...formData, villageMoo: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                    >
                      <option>หมู่ 1 (บ้านวังไฮเหนือ)</option>
                      <option>หมู่ 2 (บ้านวังไฮใต้)</option>
                      <option>หมู่ 3 (บ้านวังไฮกลาง)</option>
                      <option>หมู่ 4 (บ้านวังไฮ)</option>
                      <option>หมู่ 5 (บ้านวังใหม่)</option>
                      <option>หมู่ 6 (บ้านดอนวัง)</option>
                      <option>หมู่ 7 (บ้านทุ่งวังไฮ)</option>
                      <option>หมู่ 8 (บ้านสันป่าสักวังไฮ)</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  หมายเหตุเพิ่มเติม / จุดสังเกตบ้าน
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="เช่น แขวนถุงไว้หน้ารั้ว, บ้านตรงข้ามศาลากลางบ้าน"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>
            </div>

            {/* Price Preview */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center text-xs">
              <span className="text-slate-600">ยอดชำระสุทธิ ({cartItems.length} รายการ):</span>
              <span className="text-base font-bold text-emerald-700">฿{totalAmount}</span>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2"
            >
              <span>ไปที่ขั้นตอนการชำระเงิน</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: Payment & Confirmation */}
        {step === 'payment' && (
          <div className="space-y-4">
            <div className="text-center pb-2 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 font-heading">
                เลือกวิธีชำระเงิน
              </h3>
              <p className="text-xs text-slate-500">
                ยอดที่ต้องชำระทั้งหมด <span className="font-bold text-emerald-700 text-sm">฿{totalAmount}</span>
              </p>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, paymentMethod: 'promptpay' })}
                className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  formData.paymentMethod === 'promptpay'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <QrCode className="w-5 h-5 text-emerald-700" />
                <span>พร้อมเพย์ QR Code</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, paymentMethod: 'cash' })}
                className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                  formData.paymentMethod === 'cash'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Building2 className="w-5 h-5 text-emerald-700" />
                <span>เงินสด / ปลายทาง</span>
              </button>
            </div>

            {/* PromptPay QR Section */}
            {formData.paymentMethod === 'promptpay' && (
              <div className="p-4 bg-gradient-to-b from-blue-900 to-indigo-950 text-white rounded-3xl text-center space-y-3 shadow-lg">
                <div className="flex items-center justify-center gap-2 text-xs font-bold tracking-wider text-blue-200 uppercase">
                  <span>Thai PromptPay QR</span>
                </div>

                {/* QR Code Container */}
                <div className="bg-white p-3 rounded-2xl inline-block shadow-inner">
                  {/* Generated PromptPay Visual Representation */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=PROMPTPAY-${VILLAGE_INFO.promptPayNumber}-AMOUNT-${totalAmount}`}
                    alt="PromptPay QR Code"
                    className="w-40 h-40 object-contain mx-auto"
                  />
                  <div className="text-[10px] text-slate-500 mt-1 font-mono">
                    สแกนจ่ายผ่านแอปธนาคารได้ทุกธนาคาร
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-blue-200 font-medium">ชื่อบัญชี: {VILLAGE_INFO.promptPayName}</div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-mono text-sm font-bold text-amber-300">{VILLAGE_INFO.promptPayNumber}</span>
                    <button
                      onClick={handleCopyPromptPay}
                      className="p-1 rounded bg-white/20 hover:bg-white/30 text-white text-xs flex items-center gap-1"
                      title="คัดลอกเบอร์พร้อมเพย์"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  <div className="text-xs text-emerald-300 font-bold pt-1">
                    ยอดเงินที่ต้องสแกนจ่าย: ฿{totalAmount}
                  </div>
                </div>
              </div>
            )}

            {formData.paymentMethod === 'cash' && (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-amber-600" /> ชำระด้วยเงินสดเมื่อได้รับสินค้า
                </div>
                <p className="text-amber-700 leading-relaxed">
                  เจ้าหน้าที่ร้านค้ากองทุนจะนำส่งสินค้าและเก็บเงินสดตามยอด ฿{totalAmount} ณ จุดส่งมอบครับ
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="w-1/3 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl"
              >
                ย้อนกลับ
              </button>
              <button
                type="button"
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
                className="w-2/3 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? 'กำลังบันทึกออเดอร์...' : 'ยืนยันสั่งซื้อสินค้า'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Success Screen */}
        {step === 'success' && completedOrder && (
          <div className="text-center py-4 space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-100">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900 font-heading">
                สั่งซื้อสินค้าสำเร็จแล้ว!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                รหัสคำสั่งซื้อ: <span className="font-mono font-bold text-emerald-700">{completedOrder.id}</span>
              </p>
            </div>

            {/* Order Summary Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">ผู้สั่งซื้อ:</span>
                <span className="font-bold text-slate-800">{completedOrder.customerName} ({completedOrder.customerPhone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">การจัดส่ง:</span>
                <span className="font-bold text-slate-800">{completedOrder.customerAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">วิธีชำระ:</span>
                <span className="font-bold text-slate-800">
                  {completedOrder.paymentMethod === 'promptpay' ? 'พร้อมเพย์ QR' : 'เงินสด'}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-sm">
                <span className="font-bold text-slate-700">ยอดชำระทั้งหมด:</span>
                <span className="font-extrabold text-emerald-700 font-heading">฿{completedOrder.totalAmount}</span>
              </div>
            </div>

            <p className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-xl">
              📢 เจ้าหน้าที่ร้านค้าสวัสดิการกองทุนหมู่บ้านวังไฮกำลังจัดเตรียมสินค้า และจะนำส่งโดยเร็วที่สุดครับ!
            </p>

            <button
              onClick={() => {
                setStep('form');
                onClose();
              }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md"
            >
              กลับสู่หน้าร้านค้า
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
