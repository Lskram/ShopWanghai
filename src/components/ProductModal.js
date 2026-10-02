'use client';

import React, { useState } from 'react';
import { X, ShoppingBag, Plus, Minus, Sparkles, Check, Package } from 'lucide-react';
import ProductImage from './ProductImage';

export default function ProductModal({ product, isOpen, onClose, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  if (!isOpen || !product) return null;

  const isOutOfStock = product.stock <= 0;
  const maxAvailable = Math.min(product.stock, 99);

  const handleAdd = () => {
    if (isOutOfStock) return;
    onAddToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col md:flex-row max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/90 text-slate-500 hover:text-slate-800 hover:bg-white shadow-md flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Product Image */}
        <div className="md:w-1/2 relative bg-slate-100 aspect-square md:aspect-auto">
          <ProductImage
            src={product.image}
            alt={product.name}
            category={product.category}
            isCommunity={product.isCommunityProduct}
            className="w-full h-full object-cover"
          />
          {product.isCommunityProduct && (
            <div className="absolute top-4 left-4 bg-amber-500 text-emerald-950 text-xs font-bold px-3 py-1 rounded-lg shadow-md flex items-center gap-1 z-10">
              <Sparkles className="w-3.5 h-3.5" /> สินค้า OTOP ชุมชนวังไฮ
            </div>
          )}
        </div>

        {/* Right: Product Details */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-3">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              {product.categoryName}
            </span>

            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
              {product.name}
            </h3>

            {/* Price & Unit */}
            <div className="flex items-baseline gap-2 pt-1">
              <span className="text-3xl font-black text-emerald-700 font-heading">
                ฿{product.price}
              </span>
              <span className="text-sm text-slate-500">/{product.unit || 'ชิ้น'}</span>
            </div>

            {/* Stock status */}
            <div className="flex items-center gap-2 text-xs py-1">
              <Package className="w-4 h-4 text-slate-400" />
              {isOutOfStock ? (
                <span className="text-red-600 font-bold">สินค้าหมดชั่วคราว</span>
              ) : (
                <span className="text-emerald-700 font-medium">
                  มีสินค้าพร้อมส่ง ({product.stock} {product.unit || 'ชิ้น'})
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
              {product.description || 'สินค้าคุณภาพดี สดใหม่ ราคาย่อมเยา เพื่อชาวชุมชนบ้านวังไฮ'}
            </p>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {product.tags.map((tag, i) => (
                  <span key={i} className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Quantity & Action */}
          <div className="mt-6 pt-4 border-t border-slate-100 space-y-4">
            {!isOutOfStock && (
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-700">ระบุจำนวน:</span>
                <div className="flex items-center gap-2 border border-slate-200 rounded-xl p-1 bg-slate-50">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-100 disabled:opacity-40"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-slate-800">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(q => Math.min(maxAvailable, q + 1))}
                    disabled={quantity >= maxAvailable}
                    className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-100 disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handleAdd}
              disabled={isOutOfStock}
              className={`w-full py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 ${
                isOutOfStock
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : isAdded
                  ? 'bg-emerald-800 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>เพิ่มลงตะกร้าเรียบร้อย</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>ใส่ตะกร้า (฿{product.price * quantity})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
