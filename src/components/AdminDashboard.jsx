import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  TrendingUp, 
  ShoppingBag, 
  Package, 
  FolderPlus, 
  Check, 
  Share2,
  Sparkles, 
  Settings,
  Phone,
  BarChart3,
  ArrowLeft,
  LogOut,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  Database,
  Download,
  HardDrive,
  Boxes,
  AlertTriangle,
  MinusCircle,
  PlusCircle,
  LayoutDashboard,
  DollarSign,
  Users,
  Activity,
  ArrowUpRight,
  Clock,
  Zap,
  Filter,
  MapPin,
  Eye,
  FileText,
  MessageCircle,
  Menu,
  X
} from 'lucide-react';
import { 
  getCategories, 
  getProducts, 
  getOrders, 
  saveCategory, 
  deleteCategory, 
  saveProduct, 
  deleteProduct, 
  updateOrderStatus, 
  deleteOrder,
  updateProductStock,
  getSettings, 
  saveSettings,
  exportStoreBackup,
  importStoreBackup,
  downloadInvoiceFile,
  shareOrSendPdfReceipt,
  generateWhatsAppPaidReceiptLink,
  formatCurrency,
  pushAllDataToSupabase,
  pullDataFromSupabase,
  resetAllDataToDefaults,
  getAdminAccounts,
  saveAdminAccount,
  deleteAdminAccount,
  getActiveAdminSession
} from '../services/store';
import { getSupabaseConfig, saveSupabaseConfig, isSupabaseConfigured } from '../services/supabaseClient';
import AdminSidebar from './admin/AdminSidebar';
import AdminHeader from './admin/AdminHeader';
import AdminCustomersTab from './admin/AdminCustomersTab';

const AVAILABLE_ICONS = ['Sparkles', 'User', 'Cpu', 'Watch', 'Tag'];

export default function AdminDashboard({ 
  categories, 
  products, 
  orders, 
  onBackToStore,
  onLogout,
  isAdminMobileMenuOpen: externalIsAdminMobileMenuOpen,
  setIsAdminMobileMenuOpen: externalSetIsAdminMobileMenuOpen
}) {
  const [activeTab, setActiveTabState] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    const validTabs = ['dashboard', 'categories', 'products', 'orders', 'customers', 'analytics', 'settings'];
    if (hash && validTabs.includes(hash)) {
      return hash;
    }
    const saved = localStorage.getItem('damshop_admin_active_tab');
    return (saved && validTabs.includes(saved)) ? saved : 'dashboard';
  });

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    localStorage.setItem('damshop_admin_active_tab', tab);
    if (window.location.hash !== `#${tab}`) {
      window.history.replaceState(null, '', `${window.location.pathname}#${tab}`);
    }
  };

  // Settings State
  const [settings, setSettingsState] = useState(getSettings());
  const [internalIsAdminMobileMenuOpen, setInternalIsAdminMobileMenuOpen] = useState(false);

  // Team Accounts & Collaborators State
  const [adminAccounts, setAdminAccounts] = useState(() => getAdminAccounts());
  const [teamForm, setTeamForm] = useState({ id: '', name: '', username: '', password: '', role: 'collaborator' });
  const [isAddingTeamMember, setIsAddingTeamMember] = useState(false);
  const currentSession = getActiveAdminSession();
  const isSuperAdmin = currentSession?.role === 'super_admin';

  const handleSaveTeamMember = (e) => {
    e.preventDefault();
    if (!teamForm.username || !teamForm.password || !teamForm.name) {
      alert('Veuillez remplir le nom, l\'identifiant et le mot de passe.');
      return;
    }
    const updated = saveAdminAccount(teamForm);
    setAdminAccounts(updated);
    setTeamForm({ id: '', name: '', username: '', password: '', role: 'collaborator' });
    setIsAddingTeamMember(false);
    alert('✅ Compte collaborateur enregistré avec succès !');
  };

  const handleDeleteTeamMember = (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce compte collaborateur ?')) {
      const updated = deleteAdminAccount(id);
      setAdminAccounts(updated);
    }
  };

  // Supabase Cloud Configuration State
  const [supabaseConfig, setSupabaseConfigState] = useState(getSupabaseConfig());
  const [supabaseSyncStatus, setSupabaseSyncStatus] = useState('');
  const [isPushingSupabase, setIsPushingSupabase] = useState(false);

  const handleSaveSupabaseConfig = (e) => {
    e.preventDefault();
    saveSupabaseConfig(supabaseConfig.url, supabaseConfig.key);
    alert('Configuration Supabase mise à jour avec succès !');
    pullDataFromSupabase();
  };

  const handlePushToSupabase = async () => {
    setIsPushingSupabase(true);
    setSupabaseSyncStatus('Transfert des données vers Supabase Cloud en cours...');
    try {
      await pushAllDataToSupabase();
      setSupabaseSyncStatus('✅ Toutes vos données sont synchronisées sur Supabase Cloud !');
      alert('Succès : Catégories, Produits, Commandes et Avis synchronisés sur Supabase Cloud !');
    } catch (err) {
      setSupabaseSyncStatus('❌ Erreur : ' + err.message);
      alert('Erreur lors de la synchronisation Supabase : ' + err.message);
    } finally {
      setIsPushingSupabase(false);
    }
  };

  const handleCopySqlScript = () => {
    const sql = `-- ========================================================
-- DamShop E-Commerce - Script SQL Supabase
-- Exécutez ce script dans l'Éditeur SQL de votre projet Supabase
-- ========================================================
CREATE TABLE IF NOT EXISTS public.categories (id TEXT PRIMARY KEY, name TEXT NOT NULL, icon TEXT DEFAULT 'Sparkles', created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS public.products (id TEXT PRIMARY KEY, name TEXT NOT NULL, price NUMERIC NOT NULL DEFAULT 0, original_price NUMERIC, category TEXT REFERENCES public.categories(id) ON DELETE SET NULL, image TEXT, images TEXT[], description TEXT, stock INT DEFAULT 10, sizes TEXT[], colors TEXT[], is_featured BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS public.orders (id TEXT PRIMARY KEY, customer_name TEXT NOT NULL, customer_phone TEXT NOT NULL, customer_whatsapp TEXT, customer_city TEXT DEFAULT 'Lomé', delivery_address TEXT, items JSONB NOT NULL, total NUMERIC NOT NULL, status TEXT DEFAULT 'pending', payment_method TEXT DEFAULT 'cash', notes TEXT, created_at TIMESTAMPTZ DEFAULT NOW());
CREATE TABLE IF NOT EXISTS public.reviews (id TEXT PRIMARY KEY, product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE, user_name TEXT NOT NULL, rating INT CHECK (rating >= 1 AND rating <= 5), comment TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW());
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lecture publique catégories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Lecture publique produits" ON public.products FOR SELECT USING (true);
CREATE POLICY "Lecture publique avis" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Création publique commandes" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Création publique avis" ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin All catégories" ON public.categories FOR ALL USING (true);
CREATE POLICY "Admin All produits" ON public.products FOR ALL USING (true);
CREATE POLICY "Admin All commandes" ON public.orders FOR ALL USING (true);
CREATE POLICY "Admin All avis" ON public.reviews FOR ALL USING (true);`;
    navigator.clipboard.writeText(sql);
    alert('Script SQL Supabase copié dans votre presse-papier ! Vous pouvez le coller dans le SQL Editor de votre console Supabase.');
  };

  // Customer CRM Directory State & Handlers
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerFilter, setCustomerFilter] = useState('all'); // 'all' | 'vip' | 'repeat'
  const [copiedBroadcastStatus, setCopiedBroadcastStatus] = useState(false);

  const customersDirectory = React.useMemo(() => {
    const map = new Map();
    orders.forEach(order => {
      const rawPhone = order.phone || order.customerPhone || '';
      const phoneKey = rawPhone.replace(/[^\d+]/g, '');
      if (!phoneKey) return;

      if (!map.has(phoneKey)) {
        map.set(phoneKey, {
          phone: rawPhone,
          name: order.customerName || 'Client DamShop',
          address: order.address || order.deliveryAddress || 'Non spécifiée',
          city: order.customerCity || 'Abidjan / Lomé',
          ordersCount: 1,
          totalSpent: Number(order.total) || 0,
          lastOrderDate: order.date || 'Récemment',
          orders: [order]
        });
      } else {
        const existing = map.get(phoneKey);
        existing.ordersCount += 1;
        existing.totalSpent += (Number(order.total) || 0);
        existing.orders.push(order);
      }
    });
    return Array.from(map.values());
  }, [orders]);

  const filteredCustomers = React.useMemo(() => {
    return customersDirectory.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                            c.phone.includes(customerSearch) ||
                            c.city.toLowerCase().includes(customerSearch.toLowerCase());
      
      if (customerFilter === 'vip') return matchesSearch && c.totalSpent >= 100000;
      if (customerFilter === 'repeat') return matchesSearch && c.ordersCount >= 2;
      return matchesSearch;
    });
  }, [customersDirectory, customerSearch, customerFilter]);

  const handleCopyBroadcastList = () => {
    if (!filteredCustomers.length) {
      alert('Aucun client disponible dans la liste.');
      return;
    }
    const numbersList = filteredCustomers.map(c => c.phone).join('\n');
    navigator.clipboard.writeText(numbersList);
    setCopiedBroadcastStatus(true);
    setTimeout(() => setCopiedBroadcastStatus(false), 3000);
    alert(`${filteredCustomers.length} numéro(s) de téléphone copiés ! Vous pouvez les coller dans votre liste de diffusion WhatsApp.`);
  };

  const handleExportCustomersCSV = () => {
    if (!filteredCustomers.length) {
      alert('Aucun client disponible à exporter.');
      return;
    }
    let csv = 'Nom du Client,Telephone,Ville,Adresse,Commandes Effectuees,Total Depense (FCFA),Derniere Commande\n';
    filteredCustomers.forEach(c => {
      const cleanName = `"${(c.name || '').replace(/"/g, '""')}"`;
      const cleanPhone = `"${(c.phone || '').replace(/"/g, '""')}"`;
      const cleanCity = `"${(c.city || '').replace(/"/g, '""')}"`;
      const cleanAddr = `"${(c.address || '').replace(/"/g, '""')}"`;
      csv += `${cleanName},${cleanPhone},${cleanCity},${cleanAddr},${c.ordersCount},${c.totalSpent},${c.lastOrderDate}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Repertoire_Clients_Xor_Boutique_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isAdminMobileMenuOpen = externalIsAdminMobileMenuOpen !== undefined ? externalIsAdminMobileMenuOpen : internalIsAdminMobileMenuOpen;
  const setIsAdminMobileMenuOpen = externalSetIsAdminMobileMenuOpen || setInternalIsAdminMobileMenuOpen;

  // Category Form State
  const [categoryForm, setCategoryForm] = useState({
    id: null,
    name: '',
    description: '',
    icon: 'Sparkles',
    color: '#2563eb'
  });
  const [isEditingCategory, setIsEditingCategory] = useState(false);

  // Product Form State
  const [imageSourceMode, setImageSourceMode] = useState('upload'); // 'upload' | 'url'
  const [urlInput, setUrlInput] = useState('');
  const [productForm, setProductForm] = useState({
    id: null,
    name: '',
    category: categories[0]?.id || '',
    price: '',
    originalPrice: '',
    discountPercent: '',
    stock: 15,
    sizesStr: 'S, M, L, XL',
    colorsStr: 'Noir, Blanc',
    image: '',
    images: [],
    description: ''
  });
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [copiedAdminProductId, setCopiedAdminProductId] = useState(null);

  const handleCopyAdminProductLink = (productId) => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?product=${productId}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedAdminProductId(productId);
      setTimeout(() => setCopiedAdminProductId(null), 2500);
    }).catch(() => {
      alert(`Lien du produit : ${shareUrl}`);
    });
  };

  // Calculate Executive Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrdersCount = orders.length;
  const totalProductsCount = products.length;
  const outOfStockProducts = products.filter(p => p.stock === 0);
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 3);
  const recentOrders = orders.slice(0, 5);

  // Dynamic 7-day Sales Data calculated from real store orders
  const weeklySalesData = useMemo(() => {
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const result = [];
    const today = new Date();
    
    // Generate 7 days ending today
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = dayNames[d.getDay()];

      const daySales = (orders || []).reduce((sum, o) => {
        if (!o || o.status === 'Annulé') return sum;
        let oDateStr = '';
        if (o.date) {
          oDateStr = o.date.includes('T') ? o.date.split('T')[0] : o.date;
        } else if (o.timestamp) {
          oDateStr = new Date(o.timestamp).toISOString().split('T')[0];
        } else if (o.created_at) {
          oDateStr = new Date(o.created_at).toISOString().split('T')[0];
        }
        return oDateStr === dateStr ? sum + (Number(o.total) || 0) : sum;
      }, 0);

      result.push({
        dateStr,
        day: dayName,
        sales: daySales,
        isToday: i === 0
      });
    }
    return result;
  }, [orders]);

  const maxSales = useMemo(() => {
    const max = Math.max(...weeklySalesData.map(d => d.sales));
    return max > 0 ? max : 1;
  }, [weeklySalesData]);

  // Automatic High-Speed HTML5 Canvas Image Compression Utility
  const compressImageFile = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const MAX_WIDTH = 1000;
          const MAX_HEIGHT = 1000;
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH || height > MAX_HEIGHT) {
            if (width > height) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            } else {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Compress image to optimized JPEG format (quality 0.78)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.78);
          resolve(compressedDataUrl);
        };
        img.onerror = () => resolve(e.target.result);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  // Multi-Image Upload & Management Handlers with Automatic Compression
  const handleMultipleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    for (const file of files) {
      if (file.size > 12 * 1024 * 1024) {
        alert(`L'image ${file.name} dépasse 12 Mo.`);
        continue;
      }
      const compressedDataUrl = await compressImageFile(file);
      if (compressedDataUrl) {
        setProductForm(prev => {
          const currentImages = prev.images || [];
          const updated = [...currentImages, compressedDataUrl];
          return {
            ...prev,
            images: updated,
            image: prev.image || compressedDataUrl
          };
        });
      }
    }
  };

  const handleAddUrlImage = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!urlInput.trim()) return;
    setProductForm(prev => {
      const currentImages = prev.images || [];
      const updated = [...currentImages, urlInput.trim()];
      return {
        ...prev,
        images: updated,
        image: prev.image || urlInput.trim()
      };
    });
    setUrlInput('');
  };

  const handleRemoveImage = (indexToRemove) => {
    setProductForm(prev => {
      const newImages = (prev.images || []).filter((_, idx) => idx !== indexToRemove);
      return {
        ...prev,
        images: newImages,
        image: newImages[0] || ''
      };
    });
  };

  const handleSetCoverImage = (indexToMakeCover) => {
    setProductForm(prev => {
      const currentImages = [...(prev.images || [])];
      if (indexToMakeCover <= 0 || indexToMakeCover >= currentImages.length) return prev;
      const [selected] = currentImages.splice(indexToMakeCover, 1);
      const newImages = [selected, ...currentImages];
      return {
        ...prev,
        images: newImages,
        image: selected
      };
    });
  };

  // Image Upload Handler Single Fallback
  const handleFileUpload = (e) => {
    handleMultipleFileUpload(e);
  };

  // Backup Import Handler
  const handleImportBackup = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const success = importStoreBackup(event.target.result);
        if (success) {
          alert('Sauvegarde restaurée avec succès ! La page va maintenant se rafraîchir.');
          window.location.reload();
        } else {
          alert('Erreur lors de la lecture du fichier de sauvegarde.');
        }
      };
      reader.readAsText(file);
    }
  };

  // Settings Handler
  const handleSaveSettings = (e) => {
    e.preventDefault();
    saveSettings(settings);
    alert('Paramètres de la boutique enregistrés avec succès !');
  };

  // Category Handlers
  const handleSaveCategory = (e) => {
    e.preventDefault();
    if (!categoryForm.name) {
      alert('Veuillez entrer un nom de catégorie.');
      return;
    }
    saveCategory(categoryForm);
    setCategoryForm({ id: null, name: '', description: '', icon: 'Sparkles', color: '#2563eb' });
    setIsEditingCategory(false);
  };

  const handleEditCategory = (cat) => {
    setCategoryForm(cat);
    setIsEditingCategory(true);
    setActiveTab('categories');
  };

  const handleDeleteCategory = (id) => {
    if (confirm('Voulez-vous vraiment supprimer cette catégorie ?')) {
      deleteCategory(id);
    }
  };

  // Bi-directional Live Discount Calculators
  const handlePriceChange = (newPrice) => {
    const p = newPrice;
    let orig = productForm.originalPrice;
    let disc = productForm.discountPercent;
    const numericDisc = Number(disc);

    if (p && numericDisc > 0 && numericDisc < 100) {
      orig = Math.round(Number(p) / (1 - numericDisc / 100));
    } else if (p && orig && Number(orig) > Number(p)) {
      disc = Math.round(((Number(orig) - Number(p)) / Number(orig)) * 100);
    } else if (numericDisc <= 0) {
      orig = '';
      disc = '0';
    }

    setProductForm(prev => ({
      ...prev,
      price: p,
      originalPrice: orig,
      discountPercent: disc
    }));
  };

  const handleDiscountChange = (newDiscount) => {
    const disc = newDiscount;
    let p = productForm.price;
    let orig = productForm.originalPrice;
    const numericDisc = Number(disc);

    if (disc !== '' && disc !== null && disc !== undefined && !isNaN(numericDisc) && numericDisc > 0 && numericDisc < 100) {
      if (p && Number(p) > 0) {
        orig = Math.round(Number(p) / (1 - numericDisc / 100));
      } else if (orig && Number(orig) > 0) {
        p = Math.round(Number(orig) * (1 - numericDisc / 100));
      }
    } else {
      // If discount is 0, empty, or invalid, clear original price and discount
      orig = '';
    }

    setProductForm(prev => ({
      ...prev,
      price: p,
      originalPrice: orig,
      discountPercent: disc
    }));
  };

  const handleOriginalPriceChange = (newOrig) => {
    const orig = newOrig;
    let p = productForm.price;
    let disc = productForm.discountPercent;
    const numericDisc = Number(disc);

    if (orig && numericDisc > 0 && numericDisc < 100) {
      p = Math.round(Number(orig) * (1 - numericDisc / 100));
    } else if (orig && p && Number(orig) > Number(p)) {
      disc = Math.round(((Number(orig) - Number(p)) / Number(orig)) * 100);
    } else if (!orig || Number(orig) <= Number(p)) {
      disc = '0';
    }

    setProductForm(prev => ({
      ...prev,
      price: p,
      originalPrice: orig,
      discountPercent: disc
    }));
  };

  // Product Handlers
  const handleSaveProduct = (e) => {
    e.preventDefault();
    const effectiveCategory = productForm.category || categories[0]?.id || '';

    if (!productForm.name || !productForm.name.trim()) {
      alert('Veuillez entrer le nom du produit.');
      return;
    }
    if (productForm.price === '' || productForm.price === null || productForm.price === undefined || isNaN(Number(productForm.price))) {
      alert('Veuillez entrer le prix du produit.');
      return;
    }
    if (!effectiveCategory) {
      alert('Veuillez d\'abord créer au moins une catégorie dans l\'onglet Catégories.');
      return;
    }

    const sizes = productForm.sizesStr ? productForm.sizesStr.split(',').map(s => s.trim()) : ['Unique'];
    const colors = productForm.colorsStr ? productForm.colorsStr.split(',').map(c => c.trim()) : ['Standard'];

    const finalImages = (productForm.images && productForm.images.length > 0)
      ? productForm.images
      : (productForm.image ? [productForm.image] : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800']);

    const numericDiscount = Number(productForm.discountPercent);
    const numericPrice = Number(productForm.price);
    const numericOriginalPrice = productForm.originalPrice ? Number(productForm.originalPrice) : null;

    // Only set originalPrice if discount > 0 and originalPrice > price
    const finalOriginalPrice = (numericDiscount > 0 && numericOriginalPrice && numericOriginalPrice > numericPrice) 
      ? numericOriginalPrice 
      : null;

    saveProduct({
      ...productForm,
      category: effectiveCategory,
      price: numericPrice,
      originalPrice: finalOriginalPrice,
      stock: Number(productForm.stock),
      sizes,
      colors,
      images: finalImages,
      image: finalImages[0]
    });

    setProductForm({ id: null, name: '', category: categories[0]?.id || '', price: '', originalPrice: '', discountPercent: '', stock: 15, sizesStr: 'S, M, L, XL', colorsStr: 'Noir, Blanc', image: '', images: [], description: '' });
    setUrlInput('');
    setIsAddingProduct(false);
  };

  const handleEditProduct = (prod) => {
    const orig = prod.originalPrice ? Number(prod.originalPrice) : null;
    const pr = Number(prod.price);
    const disc = orig && orig > pr ? Math.round(((orig - pr) / orig) * 100) : '';
    const loadedImages = (prod.images && prod.images.length > 0) ? prod.images : (prod.image ? [prod.image] : []);

    setProductForm({
      id: prod.id,
      name: prod.name,
      category: prod.category,
      price: prod.price,
      originalPrice: prod.originalPrice || '',
      discountPercent: disc,
      stock: prod.stock !== undefined ? prod.stock : 15,
      sizesStr: prod.sizes ? prod.sizes.join(', ') : 'S, M, L, XL',
      colorsStr: prod.colors ? prod.colors.join(', ') : 'Noir, Blanc',
      image: loadedImages[0] || '',
      images: loadedImages,
      description: prod.description || ''
    });
    setIsAddingProduct(true);
    setActiveTab('products');
  };

  const handleDeleteProduct = (id) => {
    if (confirm('Voulez-vous supprimer ce produit ?')) {
      deleteProduct(id);
    }
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '1440px',
      margin: '0 auto',
      padding: '0.5rem 1.25rem 1.5rem 1.25rem',
      height: 'calc(100vh - 85px)',
      overflow: 'hidden',
      boxSizing: 'border-box'
    }} className="admin-dashboard-wrapper animate-fade-in">
      
      {/* SaaS Admin Layout: Desktop Sidebar vs Mobile Drawer */}
      <div className="admin-layout-container">

        {/* 100% FROZEN DESKTOP SIDEBAR (> 900px) */}
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          categoriesCount={categories.length}
          productsCount={products.length}
          ordersCount={orders.length}
          customersCount={customersDirectory.length}
          onBackToStore={onBackToStore}
          onLogout={onLogout}
        />

        {/* RIGHT MAIN CONTENT AREA */}
        <main className="admin-main-content" style={{
          width: '100%',
          minWidth: 0,
          height: '100%',
          overflowY: 'auto',
          paddingRight: '0.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem',
          boxSizing: 'border-box'
        }}>
          
          {/* Top Executive Header Panel */}
          <AdminHeader
            activeTab={activeTab}
            outOfStockProducts={outOfStockProducts}
            onOpenMobileMenu={() => setIsAdminMobileMenuOpen(true)}
            onBackToStore={onBackToStore}
          />

          {/* TAB 0: EXECUTIVE PRO DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem', boxSizing: 'border-box' }}>
              
              {/* Executive KPI Summary Cards */}
              <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', boxSizing: 'border-box' }}>
                
                <div className="glass-card" style={{ padding: '1.5rem', background: '#ffffff', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Chiffre d'Affaires</span>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <DollarSign size={20} color="#d97706" />
                    </div>
                  </div>
                  <div className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
                    {formatCurrency(totalRevenue)}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                    <ArrowUpRight size={14} /> +14.2% ce mois-ci
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '1.5rem', background: '#ffffff', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Total Commandes</span>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ShoppingBag size={20} color="#2563eb" />
                    </div>
                  </div>
                  <div className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
                    {totalOrdersCount}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 600 }}>
                    100% via WhatsApp & Web
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '1.5rem', background: '#ffffff', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Articles Catalogue</span>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Package size={20} color="#10b981" />
                    </div>
                  </div>
                  <div className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
                    {totalProductsCount}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Sur {categories.length} catégories
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '1.5rem', background: '#ffffff', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ color: '#64748b', fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>État des Stocks</span>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: outOfStockProducts.length > 0 ? '#fee2e2' : '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Boxes size={20} color={outOfStockProducts.length > 0 ? '#dc2626' : '#10b981'} />
                    </div>
                  </div>
                  <div className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: outOfStockProducts.length > 0 ? '#dc2626' : '#10b981', marginBottom: '0.25rem' }}>
                    {outOfStockProducts.length > 0 ? `${outOfStockProducts.length} Épuisé` : 'Optimal'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {lowStockProducts.length} article(s) à réapprovisionner
                  </div>
                </div>

              </div>

              {/* Middle Grid: Weekly Sales Chart & Stock Alerts */}
              <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', boxSizing: 'border-box' }}>
                
                {/* Visual Sales Chart */}
                <div className="glass-panel" style={{ padding: '1.75rem', background: '#ffffff', borderRadius: '16px', boxSizing: 'border-box' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h3 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <TrendingUp size={20} color="#2563eb" /> Évolution des Ventes Hebdomadaires
                    </h3>
                    <span className="font-mono" style={{ fontSize: '0.75rem', color: '#64748b', background: '#f1f5f9', padding: '0.35rem 0.75rem', borderRadius: '20px', fontWeight: 700 }}>
                      7 derniers jours
                    </span>
                  </div>

                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem', height: '190px', padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                      {weeklySalesData.map((item, idx) => {
                        const heightPercent = maxSales > 0 ? Math.round((item.sales / maxSales) * 100) : 0;
                        return (
                          <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                            {/* Amount label at top of column */}
                            <div className="font-mono" style={{ fontSize: '0.7rem', color: item.sales > 0 ? '#2563eb' : '#94a3b8', fontWeight: 700, marginBottom: '0.35rem', whiteSpace: 'nowrap' }}>
                              {item.sales > 0 ? (item.sales >= 1000000 ? `${(item.sales / 1000000).toFixed(1)}M` : `${Math.round(item.sales / 1000)}k`) : '0'}
                            </div>
                            
                            {/* Bar track container with flex: 1 */}
                            <div style={{ width: '100%', flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: '#f8fafc', borderRadius: '8px', padding: '2px 0' }}>
                              <div 
                                style={{
                                  width: '100%',
                                  maxWidth: '32px',
                                  height: `${Math.max(heightPercent, item.sales > 0 ? 8 : 4)}%`,
                                  background: item.isToday 
                                    ? 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)'
                                    : (item.sales > 0 ? 'linear-gradient(180deg, #60a5fa 0%, #2563eb 100%)' : '#e2e8f0'),
                                  borderRadius: '6px 6px 2px 2px',
                                  transition: 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                  boxShadow: item.isToday && item.sales > 0 ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none'
                                }}
                                title={`${item.day} (${item.dateStr}) : ${formatCurrency(item.sales)}`}
                              />
                            </div>

                            {/* Day label at bottom of column */}
                            <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
                              <span style={{ fontSize: '0.78rem', color: item.isToday ? '#2563eb' : '#475569', fontWeight: item.isToday ? 800 : 600, display: 'block' }}>
                                {item.day}
                              </span>
                              {item.isToday && (
                                <span style={{ fontSize: '0.62rem', background: '#dbeafe', color: '#1e40af', padding: '0.05rem 0.3rem', borderRadius: '4px', fontWeight: 700 }}>
                                  Auj.
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Critical Stock Alerts Panel */}
                <div className="glass-panel" style={{ padding: '1.75rem', background: '#ffffff', borderRadius: '16px', boxSizing: 'border-box' }}>
                  <h3 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <AlertTriangle size={20} color="#d97706" /> Alertes Inventaire & Réapprovisionnement
                  </h3>

                  {outOfStockProducts.length === 0 && lowStockProducts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#10b981' }}>
                      <Check size={44} style={{ marginBottom: '0.75rem', opacity: 0.8 }} />
                      <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>Tous vos produits sont bien approvisionnés !</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {outOfStockProducts.map(p => (
                        <div key={p.id} className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff1f2', borderColor: '#fca5a5', borderRadius: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <img src={p.image} alt={p.name} style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover' }} />
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#9f1239' }}>{p.name}</div>
                              <div style={{ fontSize: '0.78rem', color: '#e11d48', marginTop: '0.15rem' }}>RUPTURE DE STOCK (0 unité)</div>
                            </div>
                          </div>
                          <button className="btn btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }} onClick={() => updateProductStock(p.id, 10)}>
                            + Réapprovisionner
                          </button>
                        </div>
                      ))}

                      {lowStockProducts.map(p => (
                        <div key={p.id} className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fef3c7', borderColor: '#fde68a', borderRadius: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <img src={p.image} alt={p.name} style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover' }} />
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#92400e' }}>{p.name}</div>
                              <div style={{ fontSize: '0.78rem', color: '#b45309', marginTop: '0.15rem' }}>Stock faible : {p.stock} restant(s)</div>
                            </div>
                          </div>
                          <button className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem' }} onClick={() => updateProductStock(p.id, p.stock + 5)}>
                            + Add 5
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Bottom: Recent Orders Feed */}
              <div className="glass-panel" style={{ width: '100%', padding: '1.75rem', background: '#ffffff', borderRadius: '16px', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Clock size={20} color="#2563eb" /> Dernières Commandes Reçues
                  </h3>
                  <button className="btn btn-secondary" style={{ fontSize: '0.82rem', padding: '0.5rem 1rem' }} onClick={() => setActiveTab('orders')}>
                    Voir toutes les commandes ({orders.length})
                  </button>
                </div>

                <div style={{ overflowX: 'auto', width: '100%' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e2e8f0', background: '#f8fafc' }}>
                        <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ID Commande</th>
                        <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Client</th>
                        <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Téléphone</th>
                        <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>📍 Adresse de Livraison</th>
                        <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Montant Total</th>
                        <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map(order => (
                        <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '1rem 1.25rem', fontWeight: 700 }} className="font-mono">{order.id}</td>
                          <td style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>{order.customerName}</td>
                          <td style={{ padding: '1rem 1.25rem' }} className="font-mono">{order.phone}</td>
                          <td style={{ padding: '1rem 1.25rem', color: '#0f172a', fontWeight: 500 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <MapPin size={15} color="#2563eb" style={{ flexShrink: 0 }} />
                              <span>{order.address || 'Abidjan, Côte d\'Ivoire'}</span>
                            </div>
                          </td>
                          <td style={{ padding: '1rem 1.25rem', fontWeight: 800, color: '#d97706' }} className="font-mono">
                            {formatCurrency(order.total)}
                          </td>
                          <td style={{ padding: '1rem 1.25rem' }}>
                            <span className={`badge ${order.status === 'Livré' ? 'badge-success' : order.status === 'Expédié' ? 'badge-blue' : 'badge-gold'}`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 1: DYNAMIC CATEGORY MANAGEMENT */}
          {activeTab === 'categories' && (
            <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', boxSizing: 'border-box' }}>
              
              {/* Category Creation Form */}
              <div className="glass-panel" style={{ padding: '1.75rem', background: '#ffffff', borderRadius: '16px', boxSizing: 'border-box' }}>
                <h3 className="font-display" style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#0f172a', fontWeight: 800 }}>
                  <FolderPlus size={20} color="#2563eb" />
                  {isEditingCategory ? 'Modifier la Catégorie' : 'Créer une Nouvelle Catégorie'}
                </h3>

                <form onSubmit={handleSaveCategory}>
                  <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label className="form-label">Nom de la Catégorie *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="ex: Chaussures, Parfums, High-Tech..."
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-textarea"
                      rows="3"
                      placeholder="Description courte..."
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label className="form-label">Couleur d'accentuation</label>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <input
                        type="color"
                        value={categoryForm.color}
                        onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                        style={{ width: '42px', height: '42px', border: 'none', background: 'none', cursor: 'pointer' }}
                      />
                      <span className="font-mono" style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: 600 }}>{categoryForm.color}</span>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label">Icône de l'application</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {AVAILABLE_ICONS.map(iconName => (
                        <button
                          type="button"
                          key={iconName}
                          onClick={() => setCategoryForm({ ...categoryForm, icon: iconName })}
                          style={{
                            padding: '0.5rem 0.8rem',
                            borderRadius: '8px',
                            border: categoryForm.icon === iconName ? '2px solid #0f172a' : '1px solid #cbd5e1',
                            background: categoryForm.icon === iconName ? '#0f172a' : '#f8fafc',
                            color: categoryForm.icon === iconName ? '#ffffff' : '#0f172a',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '0.85rem'
                          }}
                        >
                          {iconName}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '0.8rem' }}>
                      {isEditingCategory ? 'Mettre à Jour' : 'Ajouter la Catégorie'}
                    </button>
                    {isEditingCategory && (
                      <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={() => {
                          setIsEditingCategory(false);
                          setCategoryForm({ id: null, name: '', description: '', icon: 'Sparkles', color: '#2563eb' });
                        }}
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Existing Categories List */}
              <div style={{ boxSizing: 'border-box' }}>
                <h3 className="font-display" style={{ fontSize: '1.25rem', marginBottom: '1.25rem', color: '#0f172a', fontWeight: 800 }}>
                  Catégories Actives sur DamShop
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {categories.map(cat => (
                    <div key={cat.id} className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', borderRadius: '16px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                          <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: cat.color }}></span>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{cat.name}</h4>
                          <span className="badge badge-blue">{cat.count || 0} produits</span>
                        </div>
                        <p style={{ color: '#64748b', fontSize: '0.88rem' }}>{cat.description || 'Aucune description'}</p>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '0.5rem 0.75rem' }}
                          onClick={() => handleEditCategory(cat)}
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          className="btn btn-danger" 
                          style={{ padding: '0.5rem 0.75rem' }}
                          onClick={() => handleDeleteCategory(cat.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PRODUCT & ARTICLE STOCK MANAGEMENT */}
          {activeTab === 'products' && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="font-display" style={{ fontSize: '1.3rem', color: '#0f172a', fontWeight: 800 }}>
                  Gestion des Produits & Stock d'Articles
                </h3>
                <button 
                  className="btn btn-primary"
                  onClick={() => setIsAddingProduct(!isAddingProduct)}
                  style={{ padding: '0.75rem 1.25rem' }}
                >
                  <Plus size={18} /> {isAddingProduct ? 'Fermer' : 'Ajouter un Produit'}
                </button>
              </div>

              {/* Add Product Form */}
              {isAddingProduct && (
                <div className="glass-panel" style={{ padding: '1.75rem', background: '#ffffff', borderRadius: '16px', boxSizing: 'border-box' }}>
                  <h4 className="font-display" style={{ fontSize: '1.2rem', marginBottom: '1.25rem', color: '#0f172a', fontWeight: 800 }}>Fiche Produit</h4>
                  <form onSubmit={handleSaveProduct} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                    
                    <div className="form-group">
                      <label className="form-label">Nom du Produit *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="ex: Sac en Cuir..."
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Catégorie *</label>
                      <select
                        className="form-select"
                        value={productForm.category || categories[0]?.id || ''}
                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                        required
                      >
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Prix Vente (FCFA) *</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="ex: 45000"
                        value={productForm.price}
                        onChange={(e) => handlePriceChange(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ color: '#dc2626', fontWeight: 700 }}>Pourcentage Réduction (%)</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="ex: 20 (pour -20%)"
                        min="0"
                        max="99"
                        value={productForm.discountPercent}
                        onChange={(e) => handleDiscountChange(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ color: '#64748b' }}>Prix Barré / Origine (FCFA)</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="ex: 60000 (Calculé auto)"
                        value={productForm.originalPrice}
                        onChange={(e) => handleOriginalPriceChange(e.target.value)}
                      />
                      {productForm.price && productForm.originalPrice && Number(productForm.originalPrice) > Number(productForm.price) && (
                        <div style={{ marginTop: '0.4rem', fontSize: '0.8rem', color: '#ef4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className="badge badge-danger" style={{ padding: '0.2rem 0.5rem', fontWeight: 800 }}>
                            -{Math.round(((Number(productForm.originalPrice) - Number(productForm.price)) / Number(productForm.originalPrice)) * 100)}% PROMO
                          </span>
                          <span>Économie client : {formatCurrency(Number(productForm.originalPrice) - Number(productForm.price))}</span>
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ color: '#2563eb', fontWeight: 800 }}>Quantité / Stock Disponible *</label>
                      <input
                        type="number"
                        className="form-input"
                        min="0"
                        placeholder="ex: 15"
                        value={productForm.stock}
                        onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Tailles (séparées par des virgules)</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="ex: S, M, L, XL"
                        value={productForm.sizesStr}
                        onChange={(e) => setProductForm({ ...productForm, sizesStr: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Couleurs (séparées par des virgules)</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="ex: Noir, Blanc, Or"
                        value={productForm.colorsStr}
                        onChange={(e) => setProductForm({ ...productForm, colorsStr: e.target.value })}
                      />
                    </div>

                    {/* MULTI-PHOTO GALLERY MANAGEMENT */}
                    <div className="form-group" style={{ gridColumn: '1 / -1', background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                        <label className="form-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0f172a', fontWeight: 800 }}>
                          <ImageIcon size={18} color="#2563eb" /> Galerie Photos du Produit (Ajoutez plusieurs photos) *
                        </label>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => setImageSourceMode('upload')}
                            className={`btn ${imageSourceMode === 'upload' ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                          >
                            <Upload size={14} /> Fichiers Appareil
                          </button>
                          <button
                            type="button"
                            onClick={() => setImageSourceMode('url')}
                            className={`btn ${imageSourceMode === 'url' ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                          >
                            <LinkIcon size={14} /> Lien URL Web
                          </button>
                        </div>
                      </div>

                      {imageSourceMode === 'upload' ? (
                        <div>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleMultipleFileUpload}
                            style={{
                              width: '100%',
                              padding: '0.7rem',
                              background: '#ffffff',
                              border: '1px solid #cbd5e1',
                              borderRadius: '8px',
                              cursor: 'pointer'
                            }}
                          />
                          <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.35rem' }}>
                            💡 Vous pouvez sélectionner <strong>plusieurs photos en même temps</strong> depuis votre téléphone ou PC.
                          </p>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input
                            type="url"
                            className="form-input"
                            placeholder="https://images.unsplash.com/..."
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            style={{ flex: 1 }}
                          />
                          <button 
                            type="button" 
                            className="btn btn-secondary"
                            onClick={handleAddUrlImage}
                            style={{ padding: '0.7rem 1.25rem' }}
                          >
                            + Ajouter Photo
                          </button>
                        </div>
                      )}

                      {/* Multi Photo Thumbnail Grid */}
                      {productForm.images && productForm.images.length > 0 && (
                        <div style={{ marginTop: '1.25rem' }}>
                          <div style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 700, marginBottom: '0.65rem' }}>
                            📸 {productForm.images.length} photo(s) ajoutée(s) pour cet article :
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.85rem' }}>
                            {productForm.images.map((img, idx) => (
                              <div key={idx} style={{
                                position: 'relative',
                                borderRadius: '10px',
                                overflow: 'hidden',
                                border: idx === 0 ? '2px solid #2563eb' : '1px solid #cbd5e1',
                                background: '#ffffff',
                                display: 'flex',
                                flexDirection: 'column'
                              }}>
                                <img 
                                  src={img} 
                                  alt={`Photo ${idx + 1}`} 
                                  style={{ width: '100%', height: '85px', objectFit: 'cover' }} 
                                />

                                {idx === 0 && (
                                  <span style={{
                                    position: 'absolute',
                                    top: '4px',
                                    left: '4px',
                                    background: '#2563eb',
                                    color: '#ffffff',
                                    fontSize: '0.65rem',
                                    fontWeight: 800,
                                    padding: '0.15rem 0.4rem',
                                    borderRadius: '4px'
                                  }}>
                                    ⭐ Couverture
                                  </span>
                                )}

                                <div style={{ display: 'flex', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
                                  {idx > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => handleSetCoverImage(idx)}
                                      style={{ flex: 1, padding: '0.3rem', fontSize: '0.65rem', background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: 700 }}
                                      title="Définir comme photo principale"
                                    >
                                      ⭐ Main
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => handleRemoveImage(idx)}
                                    style={{ flex: 1, padding: '0.3rem', fontSize: '0.65rem', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 700 }}
                                    title="Supprimer la photo"
                                  >
                                    🗑️ Retirer
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Description du Produit</label>
                      <textarea
                        className="form-textarea"
                        rows="3"
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      />
                    </div>

                    <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.75rem' }}>
                      <button type="submit" className="btn btn-primary" style={{ padding: '0.85rem 2.5rem' }}>
                        Enregistrer le Produit & le Stock
                      </button>
                    </div>

                  </form>
                </div>
              )}

              {/* Products Table with Quick Stock Control */}
              <div className="glass-panel" style={{ overflowX: 'auto', width: '100%', background: '#ffffff', borderRadius: '16px', boxSizing: 'border-box' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0', background: '#f8fafc' }}>
                      <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Visuel</th>
                      <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nom de l'Article</th>
                      <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Catégorie</th>
                      <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Prix</th>
                      <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stock Disponible</th>
                      <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => {
                      const catName = categories.find(c => c.id === p.category)?.name || 'N/A';
                      const stockVal = p.stock !== undefined ? p.stock : 0;
                      const isZero = stockVal === 0;

                      return (
                        <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9', background: isZero ? '#fff1f2' : 'transparent' }}>
                          <td style={{ padding: '1rem 1.25rem' }}>
                            <img src={p.image} alt={p.name} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} />
                          </td>
                          <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: '#0f172a' }}>{p.name}</td>
                          <td style={{ padding: '1rem 1.25rem' }}><span className="badge badge-blue">{catName}</span></td>
                          <td style={{ padding: '1rem 1.25rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span className="font-mono" style={{ color: '#0f172a', fontWeight: 800 }}>{formatCurrency(p.price)}</span>
                                {p.originalPrice && Number(p.originalPrice) > Number(p.price) && (
                                  <span className="badge badge-danger" style={{ fontSize: '0.72rem', padding: '0.15rem 0.45rem', fontWeight: 800 }}>
                                    -{Math.round(((Number(p.originalPrice) - Number(p.price)) / Number(p.originalPrice)) * 100)}%
                                  </span>
                                )}
                              </div>
                              {p.originalPrice && Number(p.originalPrice) > Number(p.price) && (
                                <span className="font-mono" style={{ fontSize: '0.78rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                                  {formatCurrency(p.originalPrice)}
                                </span>
                              )}
                            </div>
                          </td>
                          
                          <td style={{ padding: '1rem 1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              <button
                                onClick={() => updateProductStock(p.id, stockVal - 1)}
                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                title="Réduire le stock"
                              >
                                <MinusCircle size={20} />
                              </button>

                              <span className="font-mono" style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '6px',
                                fontWeight: 800,
                                background: isZero ? '#fee2e2' : stockVal <= 3 ? '#fef3c7' : '#d1fae5',
                                color: isZero ? '#dc2626' : stockVal <= 3 ? '#b45309' : '#047857'
                              }}>
                                {isZero ? 'Rupture (0)' : `${stockVal} unité(s)`}
                              </span>

                              <button
                                onClick={() => updateProductStock(p.id, stockVal + 1)}
                                style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer' }}
                                title="Ajouter du stock"
                              >
                                <PlusCircle size={20} />
                              </button>
                            </div>
                          </td>

                           <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                              <button 
                                className="btn btn-secondary" 
                                style={{ 
                                  padding: '0.4rem 0.6rem',
                                  background: copiedAdminProductId === p.id ? '#dcfce7' : '#f1f5f9',
                                  borderColor: copiedAdminProductId === p.id ? '#86efac' : '#cbd5e1',
                                  color: copiedAdminProductId === p.id ? '#15803d' : '#0f172a'
                                }}
                                onClick={() => handleCopyAdminProductLink(p.id)}
                                title="Copier le lien publicitaire direct (Facebook, TikTok, WhatsApp)"
                              >
                                {copiedAdminProductId === p.id ? <Check size={16} color="#15803d" /> : <Share2 size={16} />}
                              </button>
                              <button 
                                className="btn btn-secondary" 
                                style={{ padding: '0.4rem 0.6rem' }}
                                onClick={() => handleEditProduct(p)}
                                title="Modifier ce produit (prix, prix barré, stock...)"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button 
                                className="btn btn-danger" 
                                style={{ padding: '0.4rem 0.6rem' }}
                                onClick={() => handleDeleteProduct(p.id)}
                                title="Supprimer ce produit"
                              >
                                <Trash2 size={16} />
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
          )}

          {/* TAB 3: ORDER MANAGEMENT WITH CLEAR DELIVERY ADDRESS COLUMN & DETAILS */}
          {activeTab === 'orders' && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxSizing: 'border-box' }}>
              <h3 className="font-display" style={{ fontSize: '1.3rem', color: '#0f172a', fontWeight: 800 }}>
                Suivi des Commandes & Adresses de Livraison
              </h3>

              <div className="glass-panel" style={{ overflowX: 'auto', width: '100%', background: '#ffffff', borderRadius: '16px', boxSizing: 'border-box' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0', background: '#f8fafc' }}>
                      <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>N° Commande</th>
                      <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Client</th>
                      <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Téléphone</th>
                      <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>📍 Adresse de Livraison</th>
                      <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                      <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</th>
                      <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Statut</th>
                      <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Changer Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '1rem 1.25rem', fontWeight: 700 }} className="font-mono">{order.id}</td>
                        <td style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>{order.customerName}</td>
                        <td style={{ padding: '1rem 1.25rem' }} className="font-mono">{order.phone}</td>
                        
                        <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: '#0f172a' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <MapPin size={16} color="#2563eb" style={{ flexShrink: 0 }} />
                            <span>{order.address || 'Abidjan, Côte d\'Ivoire'}</span>
                          </div>
                        </td>

                        <td style={{ padding: '1rem 1.25rem' }}>{order.date}</td>
                        <td style={{ padding: '1rem 1.25rem', fontWeight: 800, color: '#d97706' }} className="font-mono">
                          {formatCurrency(order.total)}
                        </td>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <span className={`badge ${order.status === 'Livré & Payé' || order.status === 'Livré' ? 'badge-success' : order.status === 'En cours' || order.status === 'Expédié' ? 'badge-blue' : 'badge-gold'}`}>
                            {order.status}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-end' }}>
                            <select
                              className="form-select"
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                              style={{ padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                            >
                              <option value="En attente">🟡 En attente (Non payé)</option>
                              <option value="En cours">🔵 En cours de livraison</option>
                              <option value="Livré & Payé">🟢 Livré & Payé (Reçu)</option>
                              <option value="Annulé">🔴 Annulé</option>
                            </select>

                            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem' }}
                                onClick={() => downloadInvoiceFile(order, settings)}
                                title="Imprimer / Télécharger la Facture PDF"
                              >
                                <Download size={13} /> PDF
                              </button>

                              <button
                                className="btn btn-primary"
                                style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem', background: '#25D366', borderColor: '#25D366' }}
                                onClick={() => shareOrSendPdfReceipt(order, settings)}
                                title="Transmettre le Reçu par WhatsApp au client"
                              >
                                <MessageCircle size={13} /> WhatsApp
                              </button>

                              <button
                                className="btn btn-danger"
                                style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem', background: '#ef4444', borderColor: '#ef4444' }}
                                onClick={() => {
                                  if (confirm(`Voulez-vous vraiment supprimer la commande N° ${order.id} ?`)) {
                                    deleteOrder(order.id);
                                  }
                                }}
                                title="Supprimer définitivement cette commande"
                              >
                                <Trash2 size={13} /> Supprimer
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: REPERTOIRE CLIENTS & CRM MARKETING WHATSAPP */}
          {activeTab === 'customers' && (
            <AdminCustomersTab orders={orders} formatCurrency={formatCurrency} />
          )}

          {/* TAB 4: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', boxSizing: 'border-box' }}>
              <div className="glass-panel" style={{ padding: '1.75rem', background: '#ffffff', borderRadius: '16px', boxSizing: 'border-box' }}>
                <h4 className="font-display" style={{ fontSize: '1.2rem', marginBottom: '1.25rem', color: '#0f172a', fontWeight: 800 }}>Répartition par Catégorie</h4>
                {categories.map(cat => (
                  <div key={cat.id} style={{ marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 600 }}>{cat.name}</span>
                      <span className="font-mono" style={{ color: '#64748b' }}>{cat.count || 0} articles</span>
                    </div>
                    <div style={{ background: '#f1f5f9', borderRadius: '6px', height: '10px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${Math.min(100, ((cat.count || 0) / Math.max(1, products.length)) * 100)}%`,
                        background: cat.color || '#2563eb',
                        height: '100%'
                      }}></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="glass-panel" style={{ padding: '1.75rem', background: '#ffffff', borderRadius: '16px', boxSizing: 'border-box' }}>
                <h4 className="font-display" style={{ fontSize: '1.2rem', marginBottom: '1.25rem', color: '#0f172a', fontWeight: 800 }}>Indicateurs Clés</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div className="glass-card" style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '12px' }}>
                    <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Panier Moyen Estimé</div>
                    <div className="font-mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2563eb', marginTop: '0.25rem' }}>
                      {formatCurrency(orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0)}
                    </div>
                  </div>
                  <div className="glass-card" style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '12px' }}>
                    <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>Paiement Préféré</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginTop: '0.25rem' }}>Mobile Money (Orange/Wave/MTN)</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SETTINGS & WHATSAPP CONFIG */}
          {activeTab === 'settings' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', width: '100%', boxSizing: 'border-box' }}>
              
              {/* LEFT COLUMN: SHOP CONFIGURATION & MAINTENANCE */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="glass-panel" style={{ padding: '1.75rem', background: '#ffffff', borderRadius: '16px', boxSizing: 'border-box' }}>
                  <h3 className="font-display" style={{ fontSize: '1.3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#0f172a', fontWeight: 800 }}>
                    <Settings size={22} color="#2563eb" /> Configuration WhatsApp & Boutique
                  </h3>

                  <form onSubmit={handleSaveSettings}>
                    <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                      <label className="form-label">Nom de la Boutique</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={settings.storeName}
                        onChange={(e) => setSettingsState({ ...settings, storeName: e.target.value })}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                      <label className="form-label">Numéro WhatsApp Réception des Commandes *</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="2250700000000 (avec indicatif pays)"
                        value={settings.whatsappNumber}
                        onChange={(e) => setSettingsState({ ...settings, whatsappNumber: e.target.value })}
                        required
                      />
                      <span style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.25rem' }}>
                        Les messages de commande WhatsApp des clients seront envoyés à ce numéro.
                      </span>
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                      <label className="form-label">Adresse / Siège de la Boutique</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={settings.address}
                        onChange={(e) => setSettingsState({ ...settings, address: e.target.value })}
                      />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}>
                      Enregistrer les Paramètres
                    </button>
                  </form>
                </div>

                {/* Cache Purge & Mobile Data Sync Card */}
                <div className="glass-card" style={{ padding: '1.5rem', background: '#fef2f2', borderColor: '#fecaca', borderRadius: '16px' }}>
                  <div style={{ fontWeight: 800, color: '#991b1b', marginBottom: '0.4rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    🧹 Maintenance & Purge du Cache Mobile / Navigateur
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#7f1d1d', marginBottom: '0.85rem', lineHeight: 1.5 }}>
                    Si les anciennes données ou anciens produits continuent de s'afficher sur votre téléphone, cela est dû au stockage local (LocalStorage / Cache PWA) propre à votre navigateur mobile.
                  </div>
                  <button 
                    type="button"
                    className="btn btn-danger"
                    style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.85rem' }}
                    onClick={() => {
                      if (confirm('Voulez-vous réinitialiser le stockage local et le cache du navigateur pour recharger des données fraîches ?')) {
                        resetAllDataToDefaults();
                      }
                    }}
                  >
                    🔄 Purger le Cache & Recharger les Données Fraîches
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN: TEAM ACCOUNTS & DIRECT LINKS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* TEAM & COLLABORATORS MANAGEMENT CARD 👥 */}
                <div className="glass-panel" style={{ padding: '1.75rem', background: '#ffffff', borderRadius: '16px', boxSizing: 'border-box' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={20} color="#2563eb" /> Équipe & Accès Collaborateurs ({adminAccounts.length})
                      </h4>
                      <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                        Gérez les identifiants et les rôles de connexion pour votre équipe.
                      </p>
                    </div>
                    <button 
                      type="button" 
                      className="btn btn-primary"
                      style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem' }}
                      onClick={() => {
                        setTeamForm({ id: '', name: '', username: '', password: '', role: 'collaborator' });
                        setIsAddingTeamMember(!isAddingTeamMember);
                      }}
                    >
                      <Plus size={16} /> {isAddingTeamMember ? 'Fermer' : 'Ajouter un Collaborateur'}
                    </button>
                  </div>

                  {isAddingTeamMember && (
                    <form onSubmit={handleSaveTeamMember} style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.25rem', border: '1px solid #e2e8f0' }}>
                      <h5 style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '1rem', color: '#0f172a' }}>
                        {teamForm.id ? 'Modifier le Collaborateur' : 'Créer un Nouveau Compte Collaborateur'}
                      </h5>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                          <label className="form-label">Nom Complet / Prénom *</label>
                          <input 
                            type="text" 
                            className="form-input" 
                            placeholder="ex: Marc Koffi" 
                            value={teamForm.name}
                            onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label className="form-label">Identifiant *</label>
                          <input 
                            type="text" 
                            className="form-input" 
                            placeholder="ex: marc (en minuscules)" 
                            value={teamForm.username}
                            onChange={(e) => setTeamForm({ ...teamForm, username: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label className="form-label">Mot de Passe *</label>
                          <input 
                            type="text" 
                            className="form-input" 
                            placeholder="ex: damshop123" 
                            value={teamForm.password}
                            onChange={(e) => setTeamForm({ ...teamForm, password: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label className="form-label">Rôle & Privilèges *</label>
                          <select 
                            className="form-select"
                            style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', textOverflow: 'ellipsis', overflow: 'hidden' }}
                            value={teamForm.role}
                            onChange={(e) => setTeamForm({ ...teamForm, role: e.target.value })}
                          >
                            <option value="collaborator">Collaborateur</option>
                            <option value="super_admin">Super Admin</option>
                          </select>
                        </div>
                      </div>
                      <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.7rem' }}>
                        💾 Enregistrer le Compte Collaborateur
                      </button>
                    </form>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {adminAccounts.map(acc => {
                      const isOwner = acc.role === 'super_admin';
                      return (
                        <div key={acc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: isOwner ? '#fef3c7' : '#e0f2fe', color: isOwner ? '#d97706' : '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' }}>
                              {acc.name ? acc.name.charAt(0).toUpperCase() : 'A'}
                            </div>
                            <div>
                              <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.92rem' }}>
                                {acc.name} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>({acc.username})</span>
                              </div>
                              <div style={{ fontSize: '0.78rem', color: isOwner ? '#b45309' : '#0369a1', fontWeight: 700 }}>
                                {isOwner ? '👑 Super Admin / Propriétaire' : '👔 Collaborateur / Gestionnaire'}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button 
                              type="button" 
                              className="btn btn-secondary" 
                              style={{ padding: '0.4rem 0.65rem', fontSize: '0.75rem' }}
                              onClick={() => {
                                setTeamForm(acc);
                                setIsAddingTeamMember(true);
                              }}
                            >
                              <Edit3 size={14} /> Modifier
                            </button>
                            {!isOwner && (
                              <button 
                                type="button" 
                                className="btn btn-danger" 
                                style={{ padding: '0.4rem 0.65rem', fontSize: '0.75rem' }}
                                onClick={() => handleDeleteTeamMember(acc.id)}
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Direct Admin URL Link Card */}
                <div className="glass-card" style={{ padding: '1.5rem', background: '#eff6ff', borderColor: '#bfdbfe', borderRadius: '16px' }}>
                  <div style={{ fontWeight: 800, color: '#1e40af', marginBottom: '0.4rem', fontSize: '0.95rem' }}>
                    🔗 Lien Direct d'Accès Administrateur
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#1e3a8a', marginBottom: '0.85rem', lineHeight: 1.5 }}>
                    Vous pouvez accéder directement à votre Espace Admin via l'URL <code>/admin</code>.
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <input 
                      type="text" 
                      className="form-input font-mono" 
                      readOnly 
                      value={`${window.location.origin}/admin`}
                      style={{ fontSize: '0.8rem', background: '#ffffff', flex: 1, minWidth: '220px' }}
                    />
                    <button 
                      type="button"
                      className="btn btn-primary"
                      style={{ whiteSpace: 'nowrap', fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                      onClick={() => {
                        const directUrl = `${window.location.origin}/admin`;
                        navigator.clipboard.writeText(directUrl);
                        alert('Lien direct d\'accès Admin (/admin) copié dans votre presse-papier !');
                      }}
                    >
                      📋 Copier le Lien
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

        </main>

      </div>

      {/* MOBILE ADMIN HAMBURGER MENU DRAWER 🍔 */}
      {isAdminMobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 350,
          display: 'flex',
          justifyContent: 'flex-start'
        }} onClick={() => setIsAdminMobileMenuOpen(false)}>

          <AdminSidebar
            isMobile={true}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            categoriesCount={categories.length}
            productsCount={products.length}
            ordersCount={orders.length}
            customersCount={customersDirectory.length}
            onBackToStore={onBackToStore}
            onLogout={onLogout}
            onCloseMobile={() => setIsAdminMobileMenuOpen(false)}
          />
        </div>
      )}

    </div>
  );
}
