'use client';

import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck, Store, Sparkles } from 'lucide-react';
import { VILLAGE_INFO } from '../data/mockProducts';
import ProductImage from './ProductImage';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedCheckout,
  deliveryType,
  setDeliveryType,
}) {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const isFreeDelivery = subtotal >= VILLAGE_INFO.freeDeliveryThreshold;
  const deliveryFee = deliveryType === 'pickup' ? 0 : isFreeDelivery ? 0 : VILLAGE_INFO.deliveryFee;
  const totalAmount = subtotal + deliveryFee;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 font-heading">
                ตะกร้าสินค้า ({cartItems.reduce((c, i) => c + i.quantity, 0)})
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-slate-700 text-base">ยังไม่มีสินค้าในตะกร้า</h4>
                <p className="text-xs text-slate-500 max-w-xs">
                  เลือกชมของกิน ของใช้ หรือสินค้า OTOP วังไฮ แล้วกดเพิ่มลงตะกร้าได้เลยครับ
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  เลือกซื้อสินค้า
                </button>
              </div>
            ) : (
              <>
                {/* Delivery Option Toggle */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-700">รูปแบบการรับสินค้า:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setDeliveryType('delivery')}
                      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                        deliveryType === 'delivery'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>จัดส่งถึงบ้าน</span>
                    </button>
                    <button
                      onClick={() => setDeliveryType('pickup')}
                      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                        deliveryType === 'pickup'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      <Store className="w-3.5 h-3.5" />
                      <span>รับเองที่ร้านกองทุน</span>
                    </button>
                  </div>

                  {/* Free delivery progress */}
                  {deliveryType === 'delivery' && (
                    <div className="pt-1 text-[11px]">
                      {isFreeDelivery ? (
                        <div className="text-emerald-700 font-bold flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-500" /> ยอดครบ 200.- ได้รับสิทธิ์ **ส่งฟรีถึงบ้าน!**
                        </div>
                      ) : (
                        <div className="text-slate-500">
                          ซื้อเพิ่มอีก <span className="font-bold text-emerald-700">฿{VILLAGE_INFO.freeDeliveryThreshold - subtotal}</span> เพื่อรับสิทธิ์ส่งฟรี!
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Items */}
                <div className="divide-y divide-slate-100">
                  {cartItems.map((item) => (
                    <div key={item.id} className="py-3 flex gap-3 items-center">
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-slate-100">
                        <ProductImage
                          src={item.image}
                          alt={item.name}
                          category={item.category}
                          isCommunity={item.isCommunityProduct}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                          {item.name}
                        </h5>
                        <div className="text-xs text-emerald-700 font-bold mt-0.5">
                          ฿{item.price} <span className="text-[10px] text-slate-400 font-normal">/{item.unit || 'ชิ้น'}</span>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 p-0.5">
                            <button
                              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                              className="w-6 h-6 rounded bg-white text-slate-600 flex items-center justify-center hover:bg-slate-100"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-7 text-center text-xs font-bold text-slate-800">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock}
                              className="w-6 h-6 rounded bg-white text-slate-600 flex items-center justify-center hover:bg-slate-100 disabled:opacity-30"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                            title="ลบรายการ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold text-slate-800">
                          ฿{item.price * item.quantity}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {cartItems.length > 0 && (
            <div className="p-5 border-t border-slate-200 bg-slate-50/80 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>รวมค่าสินค้า</span>
                  <span className="font-bold text-slate-800">฿{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>ค่าจัดส่ง ({deliveryType === 'delivery' ? 'ส่งถึงหน้าบ้าน' : 'รับเองที่ร้าน'})</span>
                  <span className={`font-bold ${deliveryFee === 0 ? 'text-emerald-700' : 'text-slate-800'}`}>
                    {deliveryFee === 0 ? 'ฟรี' : `฿${deliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>ยอดสุทธิ</span>
                  <span className="text-xl font-black text-emerald-700 font-heading">
                    ฿{totalAmount}
                  </span>
                </div>
              </div>

              <button
                onClick={onProceedCheckout}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-2xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <span>ดำเนินการสั่งซื้อ & ชำระเงิน</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
