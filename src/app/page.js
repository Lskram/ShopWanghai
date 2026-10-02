'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import HeroBanner from '../components/HeroBanner';
import CollectionShowcase from '../components/CollectionShowcase';
import CategoryFilter from '../components/CategoryFilter';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';
import CartDrawer from '../components/CartDrawer';
import CheckoutModal from '../components/CheckoutModal';
import Footer from '../components/Footer';
import { INITIAL_CATEGORIES, INITIAL_COLLECTIONS } from '../data/mockProducts';
import { storeRepo } from '../lib/supabase';
import { Sparkles, ShoppingBag, ArrowUpDown, X } from 'lucide-react';

export default function StorefrontPage() {
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popular'); // 'popular' | 'price-asc' | 'price-desc' | 'name'
  
  // Cart & Modals
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeQuickView, setActiveQuickView] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [deliveryType, setDeliveryType] = useState('delivery');

  // Load products & collections & cart on mount
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [prods, cols] = await Promise.all([
        storeRepo.getProducts(),
        storeRepo.getCollections()
      ]);
      setProducts(prods);
      setCollections(cols);
      setLoading(false);
    }
    loadData();

    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('wanghai_cart');
      if (savedCart) {
        try { setCartItems(JSON.parse(savedCart)); } catch (e) {}
      }
    }
  }, []);

  // Save cart changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('wanghai_cart', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  // Cart operations
  const handleAddToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('wanghai_cart');
    }
  };

  // Category counts calculation
  const categoryCounts = useMemo(() => {
    const counts = { all: products.length };
    products.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Filtered and Sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter(product => {
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        const matchesCollection = !selectedCollection || product.collections?.includes(selectedCollection);
        const matchesSearch = !searchTerm || 
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.categoryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.tags?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesCategory && matchesCollection && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'name') return a.name.localeCompare(b.name, 'th');
        return (b.soldCount || 0) - (a.soldCount || 0); // 'popular'
      });
  }, [products, selectedCategory, selectedCollection, searchTerm, sortBy]);

  const activeCollectionObj = collections.find(c => c.id === selectedCollection);
  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Navigation */}
      <Navbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setSelectedCollection(null);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Hero Section */}
        <HeroBanner
          onExploreCommunity={() => {
            setSelectedCategory('all');
            setSelectedCollection('retro-thai-sweets');
            setSearchTerm('');
            window.scrollTo({ top: 480, behavior: 'smooth' });
          }}
          onExploreBestSellers={() => {
            setSelectedCategory('all');
            setSelectedCollection(null);
            setSortBy('popular');
            setSearchTerm('');
            window.scrollTo({ top: 480, behavior: 'smooth' });
          }}
        />

        {/* Collections Showcase Section */}
        <CollectionShowcase
          collections={collections}
          selectedCollection={selectedCollection}
          onSelectCollection={(colId) => {
            setSelectedCollection(colId);
            setSelectedCategory('all');
            setSearchTerm('');
          }}
        />

        {/* Category Filter Pills */}
        <CategoryFilter
          categories={INITIAL_CATEGORIES}
          selectedCategory={selectedCategory}
          onSelectCategory={(catId) => {
            setSelectedCategory(catId);
            setSelectedCollection(null);
            setSearchTerm('');
          }}
          counts={categoryCounts}
        />

        {/* Section Header & Active Filters Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center flex-wrap gap-2">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
                {activeCollectionObj ? activeCollectionObj.name : INITIAL_CATEGORIES.find(c => c.id === selectedCategory)?.name || 'รายการสินค้า'}
              </h3>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
                {filteredProducts.length} รายการ
              </span>

              {/* Active Collection Filter Badge with clear button */}
              {activeCollectionObj && (
                <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-300">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>คอลเลกชัน: {activeCollectionObj.name}</span>
                  <button 
                    onClick={() => setSelectedCollection(null)}
                    className="hover:text-rose-600 ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>

            {searchTerm && (
              <p className="text-xs text-slate-500 mt-1">
                ผลการค้นหาสำหรับ: <span className="font-bold text-slate-800">&quot;{searchTerm}&quot;</span>
              </p>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" /> เรียงตาม:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            >
              <option value="popular">สินค้ายอดนิยม / ขายดี</option>
              <option value="price-asc">ราคา: ต่ำ ➡️ สูง</option>
              <option value="price-desc">ราคา: สูง ➡️ ต่ำ</option>
              <option value="name">ตามตัวอักษร ก-ฮ</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse space-y-3">
                <div className="aspect-[4/3] bg-slate-200 rounded-xl"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                <div className="h-6 bg-slate-200 rounded w-1/3 pt-2"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-800">ไม่พบสินค้าในเงื่อนไขนี้</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              ลองเลือกดูคอลเลกชันอื่น หรือดูสินค้าทั้งหมดของร้านค้าสวัสดิการกองทุนหมู่บ้านครับ
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedCollection(null);
                setSearchTerm('');
              }}
              className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl"
            >
              ดูสินค้าทั้งหมด
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onQuickView={(prod) => setActiveQuickView(prod)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals & Drawers */}
      <ProductModal
        product={activeQuickView}
        isOpen={Boolean(activeQuickView)}
        onClose={() => setActiveQuickView(null)}
        onAddToCart={handleAddToCart}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onProceedCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        deliveryType={deliveryType}
        setDeliveryType={setDeliveryType}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        deliveryType={deliveryType}
        onOrderCompleted={handleClearCart}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
