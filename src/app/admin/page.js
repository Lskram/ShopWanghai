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
  Truck,
  Brain,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  HelpCircle,
  Bot,
  Lightbulb,
  ExternalLink
} from 'lucide-react';
import { INITIAL_CATEGORIES, INITIAL_COLLECTIONS } from '../../data/mockProducts';
import { storeRepo, isSupabaseConfigured } from '../../lib/supabase';

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [orders, setOrders] = useState([]);
  const [aiRules, setAiRules] = useState([]);
  const [chatLogs, setChatLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'collections' | 'orders' | 'ai_training' | 'supabase'
  
  // Search & Filter (Inventory)
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

  // AI Rule Modal State
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [ruleFormData, setRuleFormData] = useState({
    topic: '',
    question_pattern: '',
    answer: '',
    recommended_product_ids: [],
    is_active: true
  });

  // Chat Log Correction State
  const [editingLog, setEditingLog] = useState(null);
  const [correctionText, setCorrectionText] = useState('');

  const loadAllData = async () => {
    setLoading(true);
    const [prods, cols, ords, rules, logs] = await Promise.all([
      storeRepo.getProducts(),
      storeRepo.getCollections(),
      storeRepo.getOrders(),
      storeRepo.getAiRules(),
      storeRepo.getChatLogs()
    ]);
    setProducts(prods);
    setCollections(cols);
    setOrders(ords);
    setAiRules(rules);
    setChatLogs(logs);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Open Product Modal
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
        stock: '',
        minStock: 5,
        description: '',
        image: '',
        isCommunityProduct: false,
        isFeatured: false,
        tags: ''
      });
    }
    setIsModalOpen(true);
  };

  // Save Product
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const productToSave = {
      ...formData,
      id: editingProduct ? editingProduct.id : `PRD-${Date.now().toString().slice(-4)}`,
      price: Number(formData.price),
      stock: Number(formData.stock),
      minStock: Number(formData.minStock) || 5,
      rating: editingProduct?.rating || 5.0,
      soldCount: editingProduct?.soldCount || 0,
      tags: typeof formData.tags === 'string' 
        ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) 
        : formData.tags
    };

    await storeRepo.saveProduct(productToSave);
    await loadAllData();
    setIsModalOpen(false);
  };

  // Adjust stock
  const handleQuickStock = async (productId, delta) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    const newStock = Math.max(0, Number(prod.stock) + delta);
    await storeRepo.saveProduct({ ...prod, stock: newStock });
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));
  };

  // Delete Product
  const handleDeleteProduct = async (productId) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการสินค้านี้ออกจากระบบ?')) return;
    await storeRepo.deleteProduct(productId);
    await loadAllData();
  };

  // Toggle Collection selection in Product modal
  const handleToggleCollection = (collectionId) => {
    const current = formData.collections || [];
    if (current.includes(collectionId)) {
      setFormData({ ...formData, collections: current.filter(id => id !== collectionId) });
    } else {
      setFormData({ ...formData, collections: [...current, collectionId] });
    }
  };

  // ==========================================
  // 🧠 AI Rules Handlers
  // ==========================================
  const handleOpenRuleModal = (rule = null) => {
    if (rule) {
      setEditingRule(rule);
      setRuleFormData({ ...rule });
    } else {
      setEditingRule(null);
      setRuleFormData({
        topic: '',
        question_pattern: '',
        answer: '',
        recommended_product_ids: [],
        is_active: true
      });
    }
    setIsRuleModalOpen(true);
  };

  const handleSaveRule = async (e) => {
    e.preventDefault();
    await storeRepo.saveAiRule(ruleFormData);
    await loadAllData();
    setIsRuleModalOpen(false);
  };

  const handleDeleteRule = async (ruleId) => {
    if (!confirm('คุณต้องการลบกฎความรู้นี้หรือไม่?')) return;
    await storeRepo.deleteAiRule(ruleId);
    await loadAllData();
  };

  const handleToggleRuleActive = async (rule) => {
    await storeRepo.saveAiRule({ ...rule, is_active: !rule.is_active });
    await loadAllData();
  };

  // ==========================================
  // 💬 Chat Logs & Training Handlers
  // ==========================================
  const handleRateLog = async (logId, rating) => {
    await storeRepo.updateChatLog(logId, { 
      rating,
      use_for_training: rating === 'good'
    });
    await loadAllData();
  };

  const handleSaveCorrection = async (logId) => {
    await storeRepo.updateChatLog(logId, {
      admin_correction: correctionText,
      rating: 'good',
      use_for_training: true
    });
    setEditingLog(null);
    setCorrectionText('');
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
                ระบบจัดการสวัสดิการ กองทุนหมู่บ้านวังไฮ
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
              <span className="hidden sm:inline">{isSupabaseConfigured ? 'Supabase Cloud Online 🟢' : 'Local Storage Mode 🟡'}</span>
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
              <div className="text-xs text-slate-500">สินค้าในระบบ</div>
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
            <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500">กฎความรู้ AI ที่สอนแล้ว</div>
              <div className="text-xl sm:text-2xl font-black text-purple-700 font-heading">
                {aiRules.length} <span className="text-xs font-normal text-slate-400">หัวข้อ</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500">ประวัติคำถามลูกค้า</div>
              <div className="text-xl sm:text-2xl font-black text-blue-700 font-heading">
                {chatLogs.length} <span className="text-xs font-normal text-slate-400">ข้อความ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 space-x-2 sm:space-x-4 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'inventory'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>จัดการสต็อกสินค้า ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ai_training')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'ai_training'
                ? 'border-purple-600 text-purple-700 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Brain className="w-4 h-4 text-purple-600" />
            <span className="text-purple-700">🧠 สอน AI & ประวัติแชท</span>
            <span className="px-1.5 py-0.5 text-[10px] bg-purple-100 text-purple-800 rounded-full font-bold">ใหม่ ⭐</span>
          </button>

          <button
            onClick={() => setActiveTab('collections')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'collections'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>คอลเลกชัน ({collections.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>คำสั่งซื้อ ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('supabase')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'supabase'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Supabase Cloud</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: INVENTORY MANAGEMENT */}
        {/* ======================================================== */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
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
                  className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
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
                      <th className="py-3 px-4">หมวดหมู่</th>
                      <th className="py-3 px-4">ราคา / หน่วย</th>
                      <th className="py-3 px-4 text-center">สต็อก</th>
                      <th className="py-3 px-4 text-center">ปรับสต็อก</th>
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
                            {product.isCommunityProduct && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.2 rounded mt-0.5 inline-block">
                                OTOP วังไฮ
                              </span>
                            )}
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
                              {product.stock} {product.unit}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="inline-flex items-center gap-1 border border-slate-200 rounded-lg p-0.5 bg-slate-50">
                              <button
                                onClick={() => handleQuickStock(product.id, -1)}
                                className="w-6 h-6 flex items-center justify-center rounded text-slate-600 hover:bg-white hover:shadow-sm font-bold"
                              >
                                -
                              </button>
                              <button
                                onClick={() => handleQuickStock(product.id, 5)}
                                className="px-2 h-6 flex items-center justify-center rounded text-slate-600 hover:bg-white hover:shadow-sm font-bold text-[11px]"
                              >
                                +5
                              </button>
                              <button
                                onClick={() => handleQuickStock(product.id, 1)}
                                className="w-6 h-6 flex items-center justify-center rounded text-slate-600 hover:bg-white hover:shadow-sm font-bold"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenModal(product)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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

        {/* ======================================================== */}
        {/* TAB 2: AI TRAINING & CHAT LOGS (NEW!) */}
        {/* ======================================================== */}
        {activeTab === 'ai_training' && (
          <div className="space-y-6">
            {/* Top Guide Banner */}
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-3xl p-6 text-white shadow-lg">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/30 text-purple-200 text-xs font-bold border border-purple-400/30">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>ระบบฝึกฝน AI น้องพร้อมเสิร์ฟ (@237ipknp)</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black font-heading">
                    สอนความรู้ & จัดการคำตอบ AI ประจำร้าน
                  </h2>
                  <p className="text-xs sm:text-sm text-purple-200 max-w-2xl">
                    พิมพ์สอนข้อมูลร้าน นโยบายส่งฟรี หรือเรื่องราว OTOP เพิ่มเติม เมื่อบันทึกแล้ว น้องพร้อมเสิร์ฟใน LINE จะจำและนำไปตอบลูกค้าได้ทันทีโดยไม่ต้องเขียนโค้ด!
                  </p>
                </div>
                <button
                  onClick={() => handleOpenRuleModal()}
                  className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 shrink-0 transition-transform active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ เพิ่มความรู้ใหม่ให้ AI</span>
                </button>
              </div>
            </div>

            {/* SECTION 1: AI Knowledge Rules Cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>คลังความรู้ & กฎการตอบเฉพาะร้าน ({aiRules.length} หัวข้อ)</span>
                </h3>
                <span className="text-[11px] text-slate-500">บอทจะนำข้อมูลเหล่านี้ไปประกอบการตอบใน LINE ทันที</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiRules.map(rule => (
                  <div 
                    key={rule.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      rule.is_active 
                        ? 'bg-white border-purple-200 shadow-sm' 
                        : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-purple-900 bg-purple-100 px-2.5 py-0.5 rounded-lg">
                          {rule.topic}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          rule.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {rule.is_active ? '🟢 ใช้งานอยู่' : '⚪ ปิดใช้งาน'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenRuleModal(rule)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded"
                          title="แก้ไข"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title="ลบ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 mb-2">
                      <strong className="text-slate-700">🔍 คีย์เวิร์ดที่ดักจับ: </strong>
                      <span className="font-mono text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                        {rule.question_pattern}
                      </span>
                    </div>

                    <div className="text-xs text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-3 leading-relaxed">
                      <strong className="text-emerald-700">💬 คำตอบของน้องพร้อมเสิร์ฟ: </strong>
                      {rule.answer}
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                      <button
                        onClick={() => handleToggleRuleActive(rule)}
                        className="text-xs font-semibold text-purple-700 hover:underline"
                      >
                        {rule.is_active ? 'ปิดการใช้งานชั่วคราว' : 'เปิดใช้งานกฎนี้'}
                      </button>
                      <span className="text-[10px] text-slate-400">ID: {rule.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 2: Chat Logs & Few-Shot Classroom */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    <span>ประวัติคำถามลูกค้า & ห้องเรียน Few-Shot Training ({chatLogs.length} บทสนทนา)</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    กดยกนิ้วโป้ง 👍 ให้คำตอบที่ดี เพื่อให้ AI ใช้เป็น "ตัวอย่างข้อสอบ" หรือกด ✏️ เพื่อแก้ไขคำตอบที่ถูกต้อง
                  </p>
                </div>
                <button
                  onClick={loadAllData}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>รีเฟรชประวัติ</span>
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="divide-y divide-slate-100">
                  {chatLogs.map(log => {
                    const isGood = log.rating === 'good';
                    const hasCorrection = Boolean(log.admin_correction);

                    return (
                      <div key={log.id} className="p-4 hover:bg-slate-50/70 transition-colors">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                              {log.id}
                            </span>
                            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                              {log.matched_intent || 'general'}
                            </span>
                            {isGood && (
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                <span>ตัวอย่างการสอน AI ⭐</span>
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {new Date(log.created_at).toLocaleString('th-TH')}
                          </span>
                        </div>

                        {/* Customer Question */}
                        <div className="flex items-start gap-2 mb-1.5">
                          <span className="text-xs font-bold text-slate-700 shrink-0">👤 คำถามลูกค้า:</span>
                          <span className="text-xs font-bold text-purple-900 bg-purple-50 px-2 py-1 rounded-lg">
                            "{log.user_query}"
                          </span>
                        </div>

                        {/* Extracted Keywords Badges */}
                        {log.extracted_keywords && log.extracted_keywords.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1 mb-2 ml-1">
                            <span className="text-[10px] text-slate-400 font-bold">🏷️ คีย์เวิร์ดที่สกัดได้:</span>
                            {log.extracted_keywords.map((kw, i) => (
                              <span key={i} className="text-[10px] bg-purple-100 text-purple-800 font-semibold px-2 py-0.5 rounded-md">
                                #{kw}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Bot Answer */}
                        <div className="flex items-start gap-2 mb-2">
                          <span className="text-xs font-bold text-emerald-700 shrink-0">🤖 บอทตอบ:</span>
                          <span className="text-xs text-slate-700 leading-relaxed">
                            {log.bot_response}
                          </span>
                        </div>

                        {/* Admin Correction (if exists) */}
                        {hasCorrection && (
                          <div className="text-xs bg-amber-50 text-amber-900 p-2.5 rounded-xl border border-amber-200 mb-2">
                            <strong className="text-amber-800">✍️ คำตอบที่แอดมินแก้ไข (ใช้เทรน AI): </strong>
                            {log.admin_correction}
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleRateLog(log.id, isGood ? 'unrated' : 'good')}
                              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
                                isGood
                                  ? 'bg-emerald-600 text-white shadow-sm'
                                  : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                              }`}
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                              <span>{isGood ? 'เป็นตัวอย่างสอน AI แล้ว' : 'ใช้เป็นตัวอย่างสอน AI'}</span>
                            </button>

                            <button
                              onClick={() => {
                                setEditingLog(log);
                                setCorrectionText(log.admin_correction || log.bot_response);
                              }}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 rounded-lg font-bold flex items-center gap-1"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>สอนคำตอบใหม่</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: COLLECTIONS MANAGEMENT */}
        {/* ======================================================== */}
        {activeTab === 'collections' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {collections.map(col => {
              const count = products.filter(p => p.collections?.includes(col.id)).length;
              return (
                <div key={col.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
                  <div className="relative h-44">
                    <img src={col.image} alt={col.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent p-5 flex flex-col justify-end">
                      <span className="text-xs font-bold text-amber-300 mb-1">{col.badge}</span>
                      <h3 className="text-lg font-black text-white font-heading">{col.name}</h3>
                      <p className="text-xs text-slate-200 line-clamp-1">{col.tagline}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">สินค้าในคอลเลกชันนี้: {count} รายการ</span>
                    <Link href={`/?collection=${col.id}`} target="_blank" className="text-emerald-700 font-bold hover:underline flex items-center gap-1">
                      <span>ดูในหน้าร้าน</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: ORDERS MANAGEMENT */}
        {/* ======================================================== */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm">รายการคำสั่งซื้อจากลูกค้า</h3>
              <span className="text-xs text-slate-500">ทั้งหมด {orders.length} รายการ</span>
            </div>
            {orders.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">ยังไม่มีคำสั่งซื้อเข้ามาในระบบ</div>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {orders.map(order => (
                  <div key={order.id} className="p-4 hover:bg-slate-50 flex flex-col sm:flex-row justify-between gap-3">
                    <div>
                      <div className="font-bold text-slate-900 font-mono">{order.id}</div>
                      <div className="text-slate-500 text-[11px]">{new Date(order.createdAt).toLocaleString('th-TH')}</div>
                      <div className="mt-1 text-slate-700 font-medium">ลูกค้า: {order.customerName || 'ลูกค้าหน้าร้าน'} ({order.phone || '-'})</div>
                      <div className="text-slate-500 text-[11px]">ที่อยู่: {order.address || 'รับที่ร้านค้าสวัสดิการ'}</div>
                    </div>
                    <div className="sm:text-right">
                      <div className="font-black text-sm text-emerald-700">฿{order.total || 0}</div>
                      <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        รอตรวจสอบชำระเงิน
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: SUPABASE CLOUD STATUS */}
        {/* ======================================================== */}
        {activeTab === 'supabase' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-heading">สถานะการเชื่อมต่อ Supabase Database</h3>
                <p className="text-xs text-slate-500">ฐานข้อมูล Postgres บนคลาวด์สำหรับเก็บสต็อกสินค้า ออเดอร์ กฎการสอน AI และประวัติแชท</p>
              </div>
            </div>

            <div className="bg-slate-900 text-emerald-400 p-4 rounded-2xl font-mono text-xs overflow-x-auto space-y-2">
              <div>PROJECT_URL: https://ecehmprffledkftkcyrnp.supabase.co</div>
              <div>STATUS: {isSupabaseConfigured ? 'CONNECTED (ONLINE 🟢)' : 'LOCAL STORAGE FALLBACK (🟡)'}</div>
              <div>TABLES: products, collections, orders, ai_rules, chat_logs</div>
            </div>
          </div>
        )}
      </main>

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT AI RULE */}
      {/* ======================================================== */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 my-8">
            <button
              onClick={() => setIsRuleModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 font-heading mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              <span>{editingRule ? 'แก้ไขความรู้ของ AI' : 'เพิ่มกฎความรู้ใหม่ให้น้องพร้อมเสิร์ฟ'}</span>
            </h3>

            <form onSubmit={handleSaveRule} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">หัวข้อเรื่อง *</label>
                <input
                  type="text"
                  required
                  value={ruleFormData.topic}
                  onChange={(e) => setRuleFormData({ ...ruleFormData, topic: e.target.value })}
                  placeholder="เช่น โปรโมชั่นส่งฟรี, ประวัติข้าวหอมมะลิวังไฮ, ขนม 90s"
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  คำถามหรือคีย์เวิร์ดที่ลูกค้ามักจะถาม (คั่นด้วยเครื่องหมายจุลภาค ,) *
                </label>
                <input
                  type="text"
                  required
                  value={ruleFormData.question_pattern}
                  onChange={(e) => setRuleFormData({ ...ruleFormData, question_pattern: e.target.value })}
                  placeholder="เช่น ส่งฟรีกี่บาท, ค่าส่งเท่าไหร่, มีส่งฟรีไหม, คิดค่าส่งยังไง"
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono text-purple-900"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  เมื่อลูกค้าพิมพ์คำใดคำหนึ่งในนี้ บอทจะดึงคำตอบด้านล่างไปตอบทันที
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">คำตอบที่ต้องการให้น้องพร้อมเสิร์ฟตอบ *</label>
                <textarea
                  rows={3}
                  required
                  value={ruleFormData.answer}
                  onChange={(e) => setRuleFormData({ ...ruleFormData, answer: e.target.value })}
                  placeholder="พิมพ์คำตอบด้วยภาษาไทยที่สุภาพ น่ารัก และมีอีโมจิประกอบ..."
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ruleFormData.is_active}
                    onChange={(e) => setRuleFormData({ ...ruleFormData, is_active: e.target.checked })}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span className="font-bold text-purple-900">เปิดใช้งานกฎนี้ทันที</span>
                </label>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsRuleModalOpen(false)}
                  className="w-1/3 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-600"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-md"
                >
                  บันทึกความรู้ให้ AI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADMIN CORRECTION FOR CHAT LOG */}
      {/* ======================================================== */}
      {editingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 my-8">
            <button
              onClick={() => setEditingLog(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 font-heading mb-2 flex items-center gap-2">
              <Edit className="w-5 h-5 text-blue-600" />
              <span>สอนคำตอบใหม่ให้ AI (Few-Shot Training)</span>
            </h3>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs mb-3">
              <strong className="text-slate-700">คำถามของลูกค้า: </strong>
              <span className="text-purple-900 font-bold">"{editingLog.user_query}"</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  พิมพ์คำตอบที่ถูกต้องที่สุด (AI จะจำและเลียนแบบสไตล์นี้):
                </label>
                <textarea
                  rows={4}
                  value={correctionText}
                  onChange={(e) => setCorrectionText(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingLog(null)}
                  className="w-1/3 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-600"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveCorrection(editingLog.id)}
                  className="w-2/3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md"
                >
                  บันทึกเป็นตัวอย่างสอน AI
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD / EDIT PRODUCT */}
      {/* ======================================================== */}
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
