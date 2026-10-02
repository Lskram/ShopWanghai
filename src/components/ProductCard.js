'use client';

import React, { useState } from 'react';
import { ShoppingBag, Plus, Sparkles, Check, Eye, AlertCircle } from 'lucide-react';
import ProductImage from './ProductImage';

export default function ProductCard({ product, onAddToCart, onQuickView }) {
  const [isAdded, setIsAdded] = useState(false);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= (product.minStock || 5);

  const handleAdd = (e) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    onAddToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  return (
    <div 
      onClick={() => onQuickView(product)}
      className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:border-emerald-200 transition-all duration-300 flex flex-col cursor-pointer relative"
    >
      {/* Top Image Container */}
      <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
        <ProductImage
          src={product.image}
          alt={product.name}
          category={product.category}
          isCommunity={product.isCommunityProduct}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {product.isCommunityProduct && (
            <span className="inline-flex items-center gap-1 bg-amber-500 text-emerald-950 text-[11px] font-bold px-2 py-0.5 rounded-md shadow-sm">
              <Sparkles className="w-3 h-3 text-emerald-950" /> OTOP วังไฮ
            </span>
          )}
          {product.isFeatured && !product.isCommunityProduct && (
            <span className="bg-emerald-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-sm">
              สินค้าขายดี
            </span>
          )}
        </div>

        {/* Stock Alert Badge */}
        {isOutOfStock ? (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-20">
            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              สินค้าหมดชั่วคราว
            </span>
          </div>
        ) : isLowStock ? (
          <span className="absolute bottom-2 left-2 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 z-10">
            <AlertCircle className="w-3 h-3" /> เหลือ {product.stock} {product.unit || 'ชิ้น'}
          </span>
        ) : null}

        {/* Quick View Button on Hover */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickView(product);
          }}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm text-slate-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-md hover:text-emerald-700 z-20"
          title="ดูรายละเอียดสินค้า"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      {/* Body Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category Name */}
          <div className="text-[11px] font-medium text-emerald-700 mb-1">
            {product.categoryName}
          </div>

          {/* Product Name */}
          <h4 className="font-bold text-slate-800 text-sm sm:text-base leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2">
            {product.name}
          </h4>

          {/* Short Description */}
          {product.description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        {/* Price & Add to Cart Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="text-xs text-slate-400">ราคา</div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg sm:text-xl font-black text-emerald-700 font-heading">
                ฿{product.price}
              </span>
              <span className="text-[11px] text-slate-500">
                /{product.unit || 'ชิ้น'}
              </span>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all duration-200 active:scale-95 shadow-sm ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : isAdded
                ? 'bg-emerald-800 text-white shadow-emerald-200'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 hover:shadow-md'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4 text-emerald-200 animate-scale" />
                <span>ใส่แล้ว</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>ใส่ตะกร้า</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
