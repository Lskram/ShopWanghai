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
  ExternalLink,
  BookOpen,
  Save,
  FileText,
  Code
} from 'lucide-react';
import { INITIAL_CATEGORIES, INITIAL_COLLECTIONS } from '../../data/mockProducts';
import { DEFAULT_STORE_KNOWLEDGE } from '../../data/storeKnowledge';
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

  // Store Knowledge Base (.md) State
  const [knowledgeText, setKnowledgeText] = useState(DEFAULT_STORE_KNOWLEDGE);
  const [savingKnowledge, setSavingKnowledge] = useState(false);

  // Chat Log Correction State
  const [editingLog, setEditingLog] = useState(null);
  const [correctionText, setCorrectionText] = useState('');

  const loadAllData = async () => {
    setLoading(true);
    const [prods, cols, ords, rules, logs, knowledge] = await Promise.all([
      storeRepo.getProducts(),
      storeRepo.getCollections(),
      storeRepo.getOrders(),
      storeRepo.getAiRules(),
      storeRepo.getChatLogs(),
      storeRepo.getStoreKnowledge()
    ]);
    setProducts(prods);
    setCollections(cols);
    setOrders(ords);
    setAiRules(rules);
    setChatLogs(logs);
    if (knowledge) setKnowledgeText(knowledge);
    setLoading(false);
  };

  const handleSaveKnowledge = async () => {
    setSavingKnowledge(true);
    try {
      await storeRepo.saveStoreKnowledge(knowledgeText);
      alert('✅ บันทึกคลังความรู้และกฎเหล็กของร้านเรียบร้อยแล้ว!\nน้องพร้อมเสิร์ฟใน LINE จะจำกฎใหม่นี้ทันทีค่ะ ✨');
    } catch (e) {
      alert('❌ บันทึกไม่สำเร็จ: ' + e.message);
    } finally {
      setSavingKnowledge(false);
    }
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

  const [inquiryFilter, setInquiryFilter] = useState('all'); // 'all' | 'orders' | 'retro' | 'otop' | 'untrained' | 'trained'
  const [loadingAiLogId, setLoadingAiLogId] = useState(null);

  const handleAppendToKnowledgeBase = (log) => {
    const answer = log.admin_correction || log.bot_response || '';
    const newSnippet = `\n- **คำถามพบบ่อย: "${log.user_query}"**: ${answer}`;
    setKnowledgeText(prev => prev + newSnippet);
    alert('✅ เพิ่มคำถามและคำตอบนี้เข้าไปยังกล่องคลังความรู้ Markdown (.md) เรียบร้อยแล้ว!\nอย่าลืมกดปุ่ม "💾 บันทึกกฎเหล็ก AI" ด้านบนเพื่อยืนยันนะคะ ✨');
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const handleConvertLogToRule = (log) => {
    const kws = log.extracted_keywords || [];
    const patterns = [log.user_query, ...kws].filter(Boolean).join(', ');
    setEditingRule(null);
    setRuleFormData({
      topic: `คำถาม: ${log.user_query.slice(0, 30)}`,
      question_pattern: patterns,
      answer: log.admin_correction || log.bot_response || '',
      recommended_product_ids: [],
      is_active: true
    });
    setIsRuleModalOpen(true);
  };

  const handleAiSuggestAnswer = async (log) => {
    setLoadingAiLogId(log.id);
    try {
      const res = await fetch('/api/ai-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: log.user_query,
          keywords: log.extracted_keywords || []
        })
      });
      const data = await res.json();
      if (data?.data) {
        const { topic, suggestedAnswer, suggestedProductIds } = data.data;
        const kws = log.extracted_keywords || [];
        const patterns = [log.user_query, ...kws].filter(Boolean).join(', ');
        
        setEditingRule(null);
        setRuleFormData({
          topic: topic || `คำถาม: ${log.user_query.slice(0, 30)}`,
          question_pattern: patterns,
          answer: suggestedAnswer,
          recommended_product_ids: suggestedProductIds || [],
          is_active: true
        });
        setIsRuleModalOpen(true);
      }
    } catch(e) {
      console.error('Error suggesting answer:', e);
      handleConvertLogToRule(log);
    } finally {
      setLoadingAiLogId(null);
    }
  };

  const handleSimulateCustomerInquiry = async (scenario = 'order_snack') => {
    let queryText = '';
    let defaultResponse = '';
    let intent = 'general';

    if (scenario === 'order_snack') {
      queryText = 'อยากสั่งซื้อเซ็ตขนมโบราณ 90s โอเดงยา 3 ซอง กับ ขนมจาจา 2 กล่อง ส่งด่วนที่เชียงใหม่ค่ะ รวมกี่บาทคะ';
      defaultResponse = 'ยินดีเลยค่ะ! 🍭 เซ็ตขนมโอเดงยา (ซองละ 25฿) + ขนมจาจา (กล่องละ 20฿) มีสินค้าพร้อมส่งค่ะ ยอดรวม 115 บาท ส่งด่วน 35 บาท รวม 150 บาท สั่งผ่านเว็บหรือแจ้งที่อยู่จัดส่งได้เลยนะคะ 📦';
      intent = 'order_inquiry';
    } else if (scenario === 'order_otop') {
      queryText = 'สนใจสั่งน้ำผึ้งป่าเดือนห้า 2 ขวด กับข้าวหอมมะลิอินทรีย์ 1 ถุง มีโปรส่งฟรีไหมคะ';
      defaultResponse = 'มีโปรส่งฟรีแน่นอนค่ะ! 🌾 เมื่อสั่งซื้อครบ 300 บาทขึ้นไป ร้านส่งฟรีด่วนทั่วไทยทันทีค่ะ สินค้า OTOP ของแท้จากชุมชนวังไฮพร้อมจัดส่งค่ะ ✨';
      intent = 'order_inquiry';
    } else if (scenario === 'health_query') {
      queryText = 'ผู้สูงอายุเป็นเบาหวาน ทานขนมอะไรของที่ร้านได้บ้างคะ แนะนำหน่อย';
      defaultResponse = 'สำหรับผู้รักสุขภาพและผู้สูงอายุ แนะนำ ข้าวกล้องหอมมะลิอินทรีย์ดัชนีน้ำตาลต่ำ และกล้วยตากพลังงานแสงอาทิตย์ 100% ไม่เติมน้ำตาลค่ะ 🌿';
      intent = 'health_diet';
    } else {
      queryText = 'มีขนมโอเดงยาที่แถมการ์ดพลังรุ่นพิเศษไหมคะ อยากสะสมให้ครบเซ็ต';
      defaultResponse = 'มีพร้อมส่งเลยค่ะ! 🎮 ขนมโอเดงยาทุกซองแถมการ์ดพลังในตำนาน สดใหม่ กรอบอร่อย สั่งซื้อได้เลยนะคะ!';
      intent = 'nostalgia_toys';
    }

    const { extractKeywords } = await import('../../lib/lineBot.js');
    const extractedKw = extractKeywords(queryText);

    await storeRepo.saveChatLog({
      user_query: queryText,
      extracted_keywords: extractedKw,
      bot_response: defaultResponse,
      matched_intent: intent,
      rating: 'unrated'
    });

    await loadAllData();
  };

  const handleQuickCreateOrderFromInquiry = async (log) => {
    const newOrder = {
      customerName: 'ลูกค้าสั่งผ่าน LINE OA',
      phone: '08X-XXX-XXXX',
      address: 'จัดส่งตามที่อยู่ที่แจ้งใน LINE',
      items: [
        { id: 'TRAD-01', name: 'ขนมไทยโบราณ / สินค้าชุมชนวังไฮ', price: 150, quantity: 1 }
      ],
      total: 150,
      note: `สร้างอัตโนมัติจากคำถามลูกค้า: "${log.user_query}"`
    };
    await storeRepo.createOrder(newOrder);
    alert('✅ สร้างรายการคำสั่งซื้อจากแชทลูกค้าเรียบร้อยแล้ว! ตรวจสอบได้ที่แท็บ "คำสั่งซื้อ"');
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
            <span className="text-purple-700">🧠 คลังความรู้ & ฝึกสอน AI (.md)</span>
            <span className="px-1.5 py-0.5 text-[10px] bg-purple-100 text-purple-800 rounded-full font-bold">Modern AI ⭐</span>
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
        {/* TAB 2: AI KNOWLEDGE BASE & TRAINING (MODERN GENERATIVE AI) */}
        {/* ======================================================== */}
        {activeTab === 'ai_training' && (
          <div className="space-y-6">
            {/* Top Guide Banner */}
            <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-purple-800/50">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/30 text-purple-200 text-xs font-bold border border-purple-400/30">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>ระบบสมองกล AI น้องพร้อมเสิร์ฟ (Modern Generative AI Agent + RAG)</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black font-heading flex items-center gap-2">
                    <span>คลังความรู้ & กฎเหล็กของร้าน (Knowledge Base .md)</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-purple-200 max-w-3xl leading-relaxed">
                    น้องพร้อมเสิร์ฟใน LINE ใช้สมองกล Gemini AI ทำความเข้าใจความหมาย (Semantic Understanding) ร่วมกับแคตตาล็อกสินค้าจริงและกฎร้านค้าด้านล่างนี้ โดยที่คุณ<strong>ไม่ต้องมานั่งดักคีย์เวิร์ดทีละคำอีกต่อไป!</strong>
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleSaveKnowledge}
                    disabled={savingKnowledge}
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-2 transition-transform active:scale-95"
                  >
                    <Save className="w-4 h-4 text-slate-950" />
                    <span>{savingKnowledge ? 'กำลังบันทึก...' : '💾 บันทึกกฎเหล็ก AI'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* SECTION 1: STORE KNOWLEDGE BASE (MARKDOWN EDITOR) */}
            <div className="bg-white rounded-3xl border border-purple-100 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      เอกสารกฎระเบียบและนโยบายร้านค้า (Store Playbook Markdown)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      แก้ไขข้อความภาษาไทยธรรมดา เพื่อสอนโปรโมชั่น เงื่อนไขค่าส่ง หรือบุคลิกภาพของบอท
                    </p>
                  </div>
                </div>

                {/* Quick Insert Snippets */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('ต้องการโหลดเนื้อหากฎมาตรฐานเริ่มต้นหรือไม่?')) {
                        setKnowledgeText(DEFAULT_STORE_KNOWLEDGE);
                      }
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-[11px] font-bold transition-colors"
                  >
                    🔄 รีเซ็ตค่าเริ่มต้น
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setKnowledgeText(prev => prev + '\n- **โปรโมชั่นพิเศษ**: สั่งซื้อสินค้า OTOP ครบ 500 บาท แถมฟรี ขนมผิงโบราณ 1 ซอง!');
                    }}
                    className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-[11px] font-bold transition-colors"
                  >
                    + เพิ่มโปรแถมขนม
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setKnowledgeText(prev => prev + '\n- **รอบจัดส่งด่วนพิเศษ**: มีรอบส่งพิเศษวันอาทิตย์ช่วงเช้า 10:00 น.');
                    }}
                    className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[11px] font-bold transition-colors"
                  >
                    + เพิ่มรอบส่งวันอาทิตย์
                  </button>
                </div>
              </div>

              {/* Textarea Editor */}
              <div className="p-4 sm:p-5">
                <textarea
                  value={knowledgeText}
                  onChange={(e) => setKnowledgeText(e.target.value)}
                  rows={14}
                  placeholder="เขียนกฎร้านค้า นโยบายส่งฟรี หรือเรื่องราวสินค้าที่นี่..."
                  className="w-full p-4 font-mono text-xs text-slate-800 bg-slate-900/5 hover:bg-slate-900/10 focus:bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:outline-none leading-relaxed resize-y transition-all"
                />
                <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>AI จะอ่านเอกสารนี้แบบ Real-time ร่วมกับสต็อกสินค้าจริง 100%</span>
                  </div>
                  <button
                    onClick={handleSaveKnowledge}
                    disabled={savingKnowledge}
                    className="px-4 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{savingKnowledge ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* SECTION 2: Chat Logs & Few-Shot Classroom */}
            <div className="space-y-3 pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    <span>กล่องรวมคำถามลูกค้า & ห้องเรียน Few-Shot Training ({chatLogs.length} บทสนทนา)</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    รวมทุกคำถามที่ลูกค้าทักเข้ามาใน LINE สามารถกดแปลงเป็นกฎ AI หรือเปิดบิลคำสั่งซื้อได้ทันที
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={loadAllData}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>รีเฟรชประวัติ</span>
                  </button>
                </div>
              </div>

              {/* SIMULATION ACTION BAR */}
              <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-3.5 rounded-2xl border border-blue-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-indigo-950">
                    🎲 เครื่องมือจำลองคำถามลูกค้า (Simulate Inbound Queries):
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                  <button
                    onClick={() => handleSimulateCustomerInquiry('order_snack')}
                    className="px-2.5 py-1 bg-white hover:bg-indigo-600 hover:text-white text-indigo-800 border border-indigo-200 rounded-lg text-[11px] font-bold shadow-xs transition-all"
                  >
                    + จำลอง: ลูกค้าสั่งขนม 90s
                  </button>
                  <button
                    onClick={() => handleSimulateCustomerInquiry('order_otop')}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-600 hover:text-white text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-bold shadow-xs transition-all"
                  >
                    + จำลอง: ลูกค้าสั่ง OTOP
                  </button>
                  <button
                    onClick={() => handleSimulateCustomerInquiry('health_query')}
                    className="px-2.5 py-1 bg-white hover:bg-purple-600 hover:text-white text-purple-800 border border-purple-200 rounded-lg text-[11px] font-bold shadow-xs transition-all"
                  >
                    + จำลอง: ถามเรื่องสุขภาพ
                  </button>
                </div>
              </div>

              {/* INQUIRY CATEGORY FILTERS */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {[
                  { id: 'all', label: `💬 ทั้งหมด (${chatLogs.length})` },
                  { id: 'orders', label: `🛒 สนใจสั่งซื้อ (${chatLogs.filter(l => l.user_query.includes('สั่ง') || l.matched_intent === 'order_inquiry').length})` },
                  { id: 'retro', label: `🍭 ขนมโบราณ (${chatLogs.filter(l => l.user_query.includes('ขนม') || l.user_query.includes('90') || l.user_query.includes('โอเดงยา')).length})` },
                  { id: 'otop', label: `🌾 สินค้า OTOP (${chatLogs.filter(l => l.user_query.includes('otop') || l.user_query.includes('ข้าว') || l.user_query.includes('น้ำผึ้ง')).length})` },
                  { id: 'untrained', label: `⏳ รอดำเนินการสอน AI (${chatLogs.filter(l => l.rating !== 'good' && !l.admin_correction).length})` },
                  { id: 'trained', label: `⭐ บันทึกสอน AI แล้ว (${chatLogs.filter(l => l.rating === 'good' || l.admin_correction).length})` }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setInquiryFilter(tab.id)}
                    className={`px-3 py-1 text-xs rounded-xl font-bold border transition-all ${
                      inquiryFilter === tab.id
                        ? 'bg-purple-700 text-white border-purple-700 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* INQUIRIES LIST */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="divide-y divide-slate-100">
                  {(() => {
                    const filtered = chatLogs.filter(log => {
                      if (inquiryFilter === 'orders') return log.matched_intent === 'order_inquiry' || log.user_query.includes('สั่ง') || log.user_query.includes('กี่บาท');
                      if (inquiryFilter === 'retro') return log.user_query.includes('ขนม') || log.user_query.includes('90') || log.user_query.includes('โอเดงยา') || log.user_query.includes('จาจา');
                      if (inquiryFilter === 'otop') return log.user_query.includes('otop') || log.user_query.includes('ข้าว') || log.user_query.includes('น้ำผึ้ง') || log.user_query.includes('วังไฮ');
                      if (inquiryFilter === 'trained') return log.rating === 'good' || Boolean(log.admin_correction);
                      if (inquiryFilter === 'untrained') return log.rating !== 'good' && !log.admin_correction;
                      return true;
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="p-8 text-center text-slate-400 text-xs">
                          ไม่พบรายการคำถามในหมวดหมู่นี้
                        </div>
                      );
                    }

                    return filtered.map(log => {
                      const isGood = log.rating === 'good';
                      const hasCorrection = Boolean(log.admin_correction);
                      const isOrderRelated = log.user_query.includes('สั่ง') || log.matched_intent === 'order_inquiry' || log.user_query.includes('ซื้อ');

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
                              {isOrderRelated && (
                                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                                  🛒 สนใจสั่งซื้อ
                                </span>
                              )}
                              {isGood && (
                                <span className="text-[10px] font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full flex items-center gap-1">
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
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <button
                                onClick={() => handleRateLog(log.id, isGood ? 'unrated' : 'good')}
                                className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
                                  isGood
                                    ? 'bg-purple-600 text-white shadow-sm'
                                    : 'bg-slate-100 text-slate-600 hover:bg-purple-50 hover:text-purple-700'
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

                              <button
                                onClick={() => handleAiSuggestAnswer(log)}
                                disabled={loadingAiLogId === log.id}
                                className="px-2.5 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-bold flex items-center gap-1 shadow-sm transition-all"
                              >
                                <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${loadingAiLogId === log.id ? 'animate-spin' : ''}`} />
                                <span>{loadingAiLogId === log.id ? 'AI กำลังคิดคำตอบ...' : '✨ ให้ AI คิดคำตอบจากร้านค้า'}</span>
                              </button>

                              <button
                                onClick={() => handleAppendToKnowledgeBase(log)}
                                className="px-2.5 py-1 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg font-bold flex items-center gap-1 shadow-sm transition-all"
                              >
                                <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                                <span>📝 เพิ่มเข้ากฎ Markdown (.md) ทันที</span>
                              </button>
                            </div>

                            {isOrderRelated && (
                              <button
                                onClick={() => handleQuickCreateOrderFromInquiry(log)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1 shadow-xs ml-auto"
                              >
                                <ShoppingBag className="w-3.5 h-3.5" />
                                <span>🛒 เปิดบิลคำสั่งซื้อ</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}
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
              <div>PROJECT_URL: https://ecehmprfledkftkcyrnp.supabase.co</div>
              <div>STATUS: {isSupabaseConfigured ? 'CONNECTED (ONLINE 🟢)' : 'LOCAL STORAGE FALLBACK (🟡)'}</div>
              <div>TABLES: products, collections, orders, ai_rules, chat_logs</div>
            </div>
          </div>
        )}
      </main>



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
