'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Store, 
  ArrowLeft, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  AlertCircle, 
  Package, 
  ShoppingBag, 
  Sparkles, 
  Database,
  X,
  RefreshCw,
  Truck
} from 'lucide-react';
import { INITIAL_CATEGORIES, INITIAL_COLLECTIONS } from '../../data/mockProducts';
import { storeRepo, isSupabaseConfigured } from '../../lib/supabase';

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'collections' | 'orders' | 'supabase'
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [collectionFilter, setCollectionFilter] = useState('all');
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  // Edit / Add Product Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'retro-snacks',
    categoryName: 'ขนมไทยโบราณ & ย้อนวัย',
    collections: ['retro-thai-sweets'],
    price: '',
    unit: 'ชิ้น',
    stock: '',
    minStock: 5,
    description: '',
    image: '',
    isCommunityProduct: false,
    isFeatured: false,
    tags: ''
  });

  const loadAllData = async () => {
    setLoading(true);
    const [prods, cols, ords] = await Promise.all([
      storeRepo.getProducts(),
      storeRepo.getCollections(),
      storeRepo.getOrders()
    ]);
    setProducts(prods);
    setCollections(cols);
    setOrders(ords);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Open Add/Edit Modal
  const handleOpenModal = (prod = null) => {
    if (prod) {
      setEditingProduct(prod);
      setFormData({
        ...prod,
        collections: prod.collections || [],
        tags: Array.isArray(prod.tags) ? prod.tags.join(', ') : prod.tags || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        category: 'retro-snacks',
        categoryName: 'ขนมไทยโบราณ & ย้อนวัย',
        collections: ['retro-thai-sweets'],
        price: '',
        unit: 'ชิ้น',
        stock: 25,
        minStock: 5,
        description: '',
        image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80',
        isCommunityProduct: true,
        isFeatured: false,
        tags: 'ขนมไทยโบราณ, ของดีวังไฮ'
      });
    }
    setIsModalOpen(true);
  };

  // Toggle collection checkbox
  const handleToggleCollection = (colId) => {
    setFormData(prev => {
      const current = prev.collections || [];
      if (current.includes(colId)) {
        return { ...prev, collections: current.filter(c => c !== colId) };
      }
      return { ...prev, collections: [...current, colId] };
    });
  };

  // Save Product
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const selectedCat = INITIAL_CATEGORIES.find(c => c.id === formData.category);
    
    const payload = {
      ...(editingProduct ? editingProduct : {}),
      id: editingProduct ? editingProduct.id : `PRD-${Date.now().toString().slice(-4)}`,
      name: formData.name,
      category: formData.category,
      categoryName: selectedCat ? selectedCat.name : formData.categoryName,
      collections: formData.collections || [],
      price: Number(formData.price) || 0,
      unit: formData.unit || 'ชิ้น',
      stock: Number(formData.stock) || 0,
      minStock: Number(formData.minStock) || 5,
      description: formData.description,
      image: formData.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600',
      isCommunityProduct: Boolean(formData.isCommunityProduct),
      isFeatured: Boolean(formData.isFeatured),
      tags: typeof formData.tags === 'string' 
        ? formData.tags.split(',').map(t => t.trim()).filter(Boolean)
        : formData.tags
    };

    await storeRepo.saveProduct(payload);
    await loadAllData();
    setIsModalOpen(false);
  };

  // Quick Inline Stock Update
  const handleInlineStockUpdate = async (productId, delta) => {
    const target = products.find(p => p.id === productId);
    if (!target) return;
    const newStock = Math.max(0, target.stock + delta);
    await storeRepo.saveProduct({ ...target, stock: newStock });
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));
  };

  // Delete Product
  const handleDeleteProduct = async (productId) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการสินค้านี้ออกจากระบบ?')) return;
    await storeRepo.deleteProduct(productId);
    await loadAllData();
  };

  // Filtered products
  const filteredProducts = products.filter(p => {
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesCollection = collectionFilter === 'all' || p.collections?.includes(collectionFilter);
    const matchesSearch = !searchTerm || 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLowStock = !onlyLowStock || p.stock <= (p.minStock || 5);
    return matchesCategory && matchesCollection && matchesSearch && matchesLowStock;
  });

  // Calculate statistics
  const totalStockCount = products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
  const lowStockCount = products.filter(p => p.stock <= (p.minStock || 5)).length;
  const retroSnacksCount = products.filter(p => p.category === 'retro-snacks').length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      {/* Top Admin Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
              href="/"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">กลับหน้าร้าน</span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold">
                <Store className="w-4 h-4" />
              </div>
              <h1 className="text-base sm:text-lg font-bold font-heading">
                ระบบจัดการสต็อก & คอลเลกชัน กองทุนหมู่บ้านวังไฮ
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className={`px-2.5 py-1 rounded-full text-xs flex items-center gap-1.5 ${
              isSupabaseConfigured 
                ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-500/40' 
                : 'bg-amber-900/80 text-amber-300 border border-amber-500/40'
            }`}>
              <Database className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isSupabaseConfigured ? 'Supabase Online 🟢' : 'Local Storage Mode 🟡'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Admin Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Analytics & Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500">จำนวนสินค้าทั้งหมด</div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
                {products.length} <span className="text-xs font-normal text-slate-400">รายการ</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500">ขนมไทยโบราณ & 90s</div>
              <div className="text-xl sm:text-2xl font-black text-amber-800 font-heading">
                {retroSnacksCount} <span className="text-xs font-normal text-slate-400">รายการ</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              lowStockCount > 0 ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-slate-100 text-slate-400'
            }`}>
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500">สินค้าใกล้หมด (≤5)</div>
              <div className={`text-xl sm:text-2xl font-black font-heading ${lowStockCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                {lowStockCount} <span className="text-xs font-normal text-slate-400">รายการ</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500">คำสั่งซื้อลูกค้า</div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
                {orders.length} <span className="text-xs font-normal text-slate-400">ออเดอร์</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 space-x-4">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'inventory'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>จัดการสต็อกสินค้า ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('collections')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'collections'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>คอลเลกชันสินค้า ({collections.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'orders'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>รายการสั่งซื้อ ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('supabase')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'supabase'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Supabase & Schema</span>
          </button>
        </div>

        {/* TAB 1: INVENTORY MANAGEMENT */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            {/* Filter & Action Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-56">
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อสินค้า หรือรหัส..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">ทุกหมวดหมู่</option>
                  {INITIAL_CATEGORIES.filter(c => c.id !== 'all').map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>

                <select
                  value={collectionFilter}
                  onChange={(e) => setCollectionFilter(e.target.value)}
                  className="px-3 py-2 text-xs bg-amber-50 text-amber-900 border border-amber-200 rounded-xl focus:outline-none font-bold"
                >
                  <option value="all">ทุกคอลเลกชัน</option>
                  {collections.map(c => (
                    <option key={c.id} value={c.id}>⭐ {c.name}</option>
                  ))}
                </select>

                <button
                  onClick={() => setOnlyLowStock(!onlyLowStock)}
                  className={`px-3 py-2 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-all ${
                    onlyLowStock 
                      ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-sm' 
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>สินค้าใกล้หมด ({lowStockCount})</span>
                </button>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <button
                  onClick={() => handleOpenModal()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>เพิ่มสินค้าใหม่</span>
                </button>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px]">
                    <tr>
                      <th className="py-3 px-4">รูปภาพ</th>
                      <th className="py-3 px-4">รหัส / ชื่อสินค้า</th>
                      <th className="py-3 px-4">หมวดหมู่ & คอลเลกชัน</th>
                      <th className="py-3 px-4">ราคา / หน่วย</th>
                      <th className="py-3 px-4 text-center">สต็อกปัจจุบัน</th>
                      <th className="py-3 px-4 text-center">ปรับสต็อกด่วน</th>
                      <th className="py-3 px-4 text-right">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.map((product) => {
                      const isLow = product.stock <= (product.minStock || 5);
                      return (
                        <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover bg-slate-100 border border-slate-200"
                            />
                          </td>
                          <td className="py-3 px-4 max-w-xs">
                            <div className="font-mono text-[10px] text-slate-400">{product.id}</div>
                            <div className="font-bold text-slate-900 text-sm">{product.name}</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {product.isCommunityProduct && (
                                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.2 rounded">
                                  OTOP วังไฮ
                                </span>
                              )}
                              {product.collections?.map(colId => {
                                const col = collections.find(c => c.id === colId);
                                return (
                                  <span key={colId} className="text-[9px] bg-amber-100 text-amber-900 font-medium px-1.5 py-0.2 rounded">
                                    {col ? col.name.slice(0, 14) + '...' : colId}
                                  </span>
                                );
                              })}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-[11px]">
                              {product.categoryName}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-emerald-700 text-sm">฿{product.price}</span>
                            <span className="text-slate-400 text-[10px]"> /{product.unit}</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded-full text-xs ${
                              product.stock <= 0
                                ? 'bg-red-100 text-red-700'
                                : isLow
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {isLow && <AlertCircle className="w-3 h-3" />}
                              {product.stock} {product.unit}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="inline-flex items-center gap-1 border border-slate-200 rounded-lg p-0.5 bg-slate-50">
                              <button
                                onClick={() => handleInlineStockUpdate(product.id, -1)}
                                className="w-6 h-6 rounded bg-white hover:bg-slate-100 text-slate-600 flex items-center justify-center font-bold"
                              >
                                -
                              </button>
                              <button
                                onClick={() => handleInlineStockUpdate(product.id, 5)}
                                className="px-1.5 h-6 rounded bg-white hover:bg-slate-100 text-slate-600 text-[11px] font-bold"
                                title="เพิ่มทีละ 5 ชิ้น"
                              >
                                +5
                              </button>
                              <button
                                onClick={() => handleInlineStockUpdate(product.id, 1)}
                                className="w-6 h-6 rounded bg-white hover:bg-slate-100 text-slate-600 flex items-center justify-center font-bold"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenModal(product)}
                                className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="แก้ไขข้อมูลสินค้า"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="ลบสินค้า"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COLLECTIONS SHOWCASE */}
        {activeTab === 'collections' && (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {collections.map((col) => {
                const count = products.filter(p => p.collections?.includes(col.id)).length;
                return (
                  <div key={col.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
                    <div className="relative aspect-[21/9] bg-slate-900 overflow-hidden">
                      <img src={col.image} alt={col.name} className="w-full h-full object-cover opacity-80" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      <div className="absolute bottom-3 left-3 text-white">
                        <span className="bg-amber-400 text-emerald-950 font-bold text-[10px] px-2 py-0.5 rounded">
                          {col.badge}
                        </span>
                        <h4 className="text-base font-bold font-heading mt-1">{col.name}</h4>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <p className="text-xs text-slate-600">{col.tagline}</p>
                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                        <span className="font-bold text-emerald-700">สินค้าในคอลเลกชัน: {count} รายการ</span>
                        <div className="flex gap-1">
                          {col.tags?.map((t, idx) => (
                            <span key={idx} className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded">
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-800 font-heading">
                รายการสั่งซื้อทั้งหมด ({orders.length} ออเดอร์)
              </h3>
              <button
                onClick={loadAllData}
                className="text-xs text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-bold"
              >
                <RefreshCw className="w-3.5 h-3.5" /> รีเฟรชรายการ
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-2">
                <ShoppingBag className="w-10 h-10 mx-auto text-slate-300" />
                <h4 className="font-bold text-slate-700">ยังไม่มีรายการสั่งซื้อเข้ามา</h4>
                <p className="text-xs">เมื่อลูกค้าสั่งซื้อผ่านหน้าร้าน หรือผ่าน LINE Bot รายการจะแสดงที่นี่ทันทีครับ</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          {order.id}
                        </span>
                        <span className="text-xs text-slate-400 ml-2">
                          {new Date(order.createdAt || order.created_at).toLocaleString('th-TH')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                          {order.paymentMethod === 'promptpay' ? 'พร้อมเพย์ QR' : 'เก็บเงินปลายทาง'}
                        </span>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                          ฿{order.totalAmount}
                        </span>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <div className="text-slate-400">ข้อมูลผู้สั่งซื้อ & จัดส่ง:</div>
                        <div className="font-bold text-slate-800 mt-1">{order.customerName} ({order.customerPhone})</div>
                        <div className="text-slate-600 mt-0.5">{order.customerAddress}</div>
                        {order.notes && <div className="text-amber-700 mt-1 italic">หมายเหตุ: {order.notes}</div>}
                      </div>

                      <div>
                        <div className="text-slate-400">รายการสินค้า ({order.items?.length || 0}):</div>
                        <ul className="mt-1 space-y-1 text-slate-700">
                          {order.items?.map((item, idx) => (
                            <li key={idx} className="flex justify-between">
                              <span>• {item.name} x {item.quantity}</span>
                              <span className="font-bold">฿{item.price * item.quantity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SUPABASE & SCHEMA */}
        {activeTab === 'supabase' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 font-heading flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-600" />
                <span>การเชื่อมต่อฐานข้อมูล Supabase & Schema V2 (พร้อมตาราง Collections)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                นำสคริปต์ SQL ด้านล่างไปรันใน Supabase เพื่อสร้างตาราง `collections`, `products`, `categories`, `orders` ได้ทันที
              </p>
            </div>

            <div className="p-4 bg-slate-900 text-emerald-300 rounded-2xl font-mono text-xs overflow-x-auto max-h-96">
              <pre>{`-- ตัวอย่างคำสั่ง SQL สร้างตาราง Collections & Products
CREATE TABLE collections (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  tagline TEXT,
  badge VARCHAR,
  color VARCHAR,
  image TEXT,
  tags TEXT[]
);

CREATE TABLE products (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  category VARCHAR,
  category_name VARCHAR,
  collections TEXT[],
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  unit VARCHAR DEFAULT 'ชิ้น',
  stock INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER DEFAULT 5,
  description TEXT,
  image TEXT,
  is_community_product BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE
);`}</pre>
            </div>
          </div>
        )}
      </main>

      {/* ADD / EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 font-heading mb-4">
              {editingProduct ? 'แก้ไขข้อมูลสินค้า' : 'เพิ่มสินค้าใหม่เข้าสต็อก'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">ชื่อสินค้า *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="เช่น ข้าวแต๋นน้ำแตงโมราดน้ำอ้อย วังไฮ"
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">หมวดหมู่</label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      const cat = INITIAL_CATEGORIES.find(c => c.id === e.target.value);
                      setFormData({ 
                        ...formData, 
                        category: e.target.value,
                        categoryName: cat ? cat.name : 'ทั่วไป'
                      });
                    }}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                  >
                    {INITIAL_CATEGORIES.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">หน่วยนับ</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="ชิ้น, ถุง, กล่อง, แพ็ค"
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Collections Checkboxes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">จัดเข้าคอลเลกชันพิเศษ</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  {collections.map(col => (
                    <label key={col.id} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.collections?.includes(col.id)}
                        onChange={() => handleToggleCollection(col.id)}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-[11px] truncate">{col.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ราคาขาย (บาท) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0"
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">สต็อกคงเหลือ (ชิ้น) *</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="0"
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">URL รูปภาพสินค้า</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">รายละเอียดสินค้า</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="สูตรโบราณ รสชาติ จุดเด่น..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isCommunityProduct}
                    onChange={(e) => setFormData({ ...formData, isCommunityProduct: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-bold text-emerald-800">สินค้าชุมชน OTOP วังไฮ</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-slate-700">สินค้าขายดีแนะนำ</span>
                </label>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/3 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-600"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md"
                >
                  บันทึกสินค้า
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
