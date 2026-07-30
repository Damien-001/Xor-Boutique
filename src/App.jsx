import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import TopAnnouncementBar from './components/TopAnnouncementBar';
import HeroBanner from './components/HeroBanner';
import CategoryFilter from './components/CategoryFilter';
import ProductGrid from './components/ProductGrid';
import ProductModal from './components/ProductModal';
import ProductPage from './components/ProductPage';
import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer';
import InvoiceModal from './components/InvoiceModal';
import OrderTrackingModal from './components/OrderTrackingModal';
import AdminDashboard from './components/AdminDashboard';
import AdminLoginPage from './components/AdminLoginPage';
import RecentlyViewedBar from './components/RecentlyViewedBar';

import { 
  getCategories, 
  getProducts, 
  getOrders, 
  getCart, 
  getWishlist,
  getSettings,
  addToCart, 
  updateCartQuantity, 
  toggleWishlist,
  subscribeToStore,
  subscribeToOrderNotifications,
  requestNotificationPermission,
  formatCurrency,
  pullDataFromSupabase
} from './services/store';
import { isSupabaseConfigured, subscribeToSupabaseRealtimeOrders } from './services/supabaseClient';

import { Bell, ShoppingBag, X } from 'lucide-react';

export default function App() {
  // App View & Admin State - Initialized synchronously from URL to prevent flash of storefront on refresh
  const [isAdminView, setIsAdminView] = useState(() => {
    if (typeof window === 'undefined') return false;
    const pathname = window.location.pathname.toLowerCase();
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash.toLowerCase();

    const hasProductParam = params.has('product') || params.has('p') || hash.includes('product=');
    if (hasProductParam) return false;

    const isLoginPath = pathname === '/login' || pathname === '/login/' || pathname.endsWith('/login') || hash === '#login';
    const isAdminPath = pathname === '/admin' || pathname === '/admin/' || pathname.endsWith('/admin') || hash === '#admin' || params.get('admin');

    return isLoginPath || isAdminPath;
  });
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return localStorage.getItem('damshop_admin_authenticated') === 'true' || 
           sessionStorage.getItem('damshop_admin_authenticated') === 'true';
  });

  const handleAdminLogout = () => {
    localStorage.removeItem('damshop_admin_authenticated');
    sessionStorage.removeItem('damshop_admin_authenticated');
    setIsAdminAuthenticated(false);
    handleToggleAdminView(false);
  };
  const [activeCategory, setActiveCategoryState] = useState(() => {
    return localStorage.getItem('damshop_active_category') || 'all';
  });

  const setActiveCategory = (cat) => {
    setActiveCategoryState(cat);
    localStorage.setItem('damshop_active_category', cat);
  };

  const [searchQuery, setSearchQuery] = useState('');

  // Modals, Drawers and Page Views State
  const [directProductPage, setDirectProductPage] = useState(null);
  const [selectedProductModal, setSelectedProductModal] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isOrderTrackingOpen, setIsOrderTrackingOpen] = useState(false);
  const [isAdminMobileMenuOpen, setIsAdminMobileMenuOpen] = useState(false);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  // Live Toast Notification State
  const [liveOrderToast, setLiveOrderToast] = useState(null);

  // PWA Install Prompt State
  const [pwaInstallPrompt, setPwaInstallPrompt] = useState(null);

  // Reactive Local Storage / IndexedDB State Data
  const [categories, setCategories] = useState(getCategories());
  const [products, setProducts] = useState(getProducts());
  const [orders, setOrders] = useState(getOrders());
  const [cart, setCart] = useState(getCart());
  const [wishlist, setWishlist] = useState(getWishlist());
  const [settings, setSettings] = useState(getSettings());
  const [recentlyViewedIds, setRecentlyViewedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('damshop_recently_viewed') || '[]');
    } catch (e) { return []; }
  });
  const [showRecentlyViewed, setShowRecentlyViewed] = useState(true);

  const trackRecentlyViewed = (productId) => {
    if (!productId) return;
    setRecentlyViewedIds(prev => {
      const updated = [productId, ...prev.filter(id => id !== productId)].slice(0, 4);
      try { localStorage.setItem('damshop_recently_viewed', JSON.stringify(updated)); } catch(e){}
      return updated;
    });
  };

  // Listen to store updates
  useEffect(() => {
    const unsubscribe = subscribeToStore(() => {
      setCategories(getCategories());
      setProducts(getProducts());
      setOrders(getOrders());
      setCart(getCart());
      setWishlist(getWishlist());
      setSettings(getSettings());
    });

    // Auto-sync & Realtime listener with Supabase Cloud on application load if configured
    if (isSupabaseConfigured()) {
      pullDataFromSupabase().catch(err => console.warn('Auto Supabase initial sync error:', err));
      
      const unsubscribeRealtime = subscribeToSupabaseRealtimeOrders(() => {
        pullDataFromSupabase().catch(err => console.warn('Realtime Supabase order pull error:', err));
      });

      return () => {
        unsubscribe();
        if (unsubscribeRealtime) unsubscribeRealtime();
      };
    }

    return () => unsubscribe();
  }, []);

  // Listen to live new order notifications
  useEffect(() => {
    const unsubscribeNotifications = subscribeToOrderNotifications((newOrder) => {
      setLiveOrderToast(newOrder);
      // Auto-hide toast after 8 seconds
      setTimeout(() => {
        setLiveOrderToast(null);
      }, 8000);
    });
    return () => unsubscribeNotifications();
  }, []);

  // Capture PWA beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setPwaInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // Handle Admin login success (redirects to /admin)
  const handleAdminLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    setIsAdminView(true);
    window.history.replaceState({}, '', '/admin');
  };

  // Auto-switch to Admin/Login View based on URL route (/login vs /admin)
  useEffect(() => {
    const pathname = window.location.pathname.toLowerCase();
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash.toLowerCase();

    const hasProductParam = params.has('product') || params.has('p') || hash.includes('product=');
    if (hasProductParam) return;

    const isLoginPath = pathname === '/login' || pathname === '/login/' || pathname.endsWith('/login') || hash === '#login';
    const isAdminPath = pathname === '/admin' || pathname === '/admin/' || pathname.endsWith('/admin') || hash === '#admin' || params.get('admin');

    if (isLoginPath || isAdminPath) {
      setIsAdminView(true);
      requestNotificationPermission();

      if (isAdminAuthenticated) {
        window.history.replaceState({}, '', '/admin' + (window.location.hash || ''));
      } else {
        window.history.replaceState({}, '', '/login');
      }
    }
  }, [isAdminAuthenticated]);

  // 15-Minute Admin Inactivity Auto-Logout Security Effect
  useEffect(() => {
    if (!isAdminView || !isAdminAuthenticated) return;

    const INACTIVITY_LIMIT_MS = 15 * 60 * 1000; // 15 minutes (900 000 ms)
    let timer = null;

    const resetInactivityTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        handleAdminLogout();
        alert('🔒 Session Administrateur fermée automatiquement après 15 minutes d\'inactivité pour des raisons de sécurité.');
      }, INACTIVITY_LIMIT_MS);
    };

    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    activityEvents.forEach(evt => window.addEventListener(evt, resetInactivityTimer));

    resetInactivityTimer();

    return () => {
      if (timer) clearTimeout(timer);
      activityEvents.forEach(evt => window.removeEventListener(evt, resetInactivityTimer));
    };
  }, [isAdminView, isAdminAuthenticated]);

  // Sync browser address bar with Admin View state
  useEffect(() => {
    if (isAdminView) {
      if (isAdminAuthenticated) {
        if (window.location.pathname !== '/admin') {
          window.history.replaceState({}, '', '/admin' + (window.location.hash || ''));
        }
      } else {
        if (window.location.pathname !== '/login') {
          window.history.replaceState({}, '', '/login');
        }
      }
    }
  }, [isAdminView, isAdminAuthenticated]);

  // Dynamic Admin Toggle with clean /login or /admin URL state sync
  const handleToggleAdminView = (targetState) => {
    const nextState = targetState !== undefined ? targetState : !isAdminView;
    setIsAdminView(nextState);
    
    if (nextState) {
      requestNotificationPermission();
      if (isAdminAuthenticated) {
        window.history.replaceState({}, '', '/admin' + (window.location.hash || ''));
      } else {
        window.history.replaceState({}, '', '/login');
      }
    } else {
      window.history.replaceState({}, '', '/');
    }
  };

  // Auto-open PDF Receipt Modal if ?invoice=DS-XXXX URL parameter is present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const invoiceId = params.get('invoice');
    if (invoiceId && orders.length > 0) {
      const found = orders.find(o => o.id.toLowerCase() === invoiceId.toLowerCase());
      if (found) {
        setSelectedInvoiceOrder(found);
      }
    }
  }, [orders]);

  // Auto-display Direct Product Landing Page if ?product=ID parameter or #product=ID hash is present in URL (Deep Linking)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('product') || params.get('p');
    const hash = window.location.hash.replace('#', '');
    const hashProductId = hash.startsWith('product=') ? hash.replace('product=', '') : null;
    const targetId = productId || hashProductId;

    if (targetId && products.length > 0) {
      const found = products.find(p => String(p.id).toLowerCase() === String(targetId).toLowerCase());
      if (found) {
        setDirectProductPage(found);
        setIsAdminView(false);
      }
    }
  }, [products]);

  // Handle returning from direct product page to full store
  const handleBackToFullStore = () => {
    setDirectProductPage(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('product');
    url.searchParams.delete('p');
    window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
  };

  // Centralized Add-to-Cart handler that adds item and opens Cart Drawer automatically
  const handleAddToCart = (product, quantity = 1, selectedSize = null, selectedColor = null) => {
    if (!product) return;
    addToCart(product, quantity, selectedSize, selectedColor);
    setIsCartOpen(true);
  };

  // Handle quick view modal open (when browsing inside store)
  const handleOpenQuickViewModal = (product) => {
    if (product?.id) trackRecentlyViewed(product.id);
    setSelectedProductModal(product);
  };

  // Handle quick view modal close
  const handleCloseQuickViewModal = () => {
    setSelectedProductModal(null);
  };

  const handleInstallPWA = async () => {
    if (!pwaInstallPrompt) return;
    pwaInstallPrompt.prompt();
    const { outcome } = await pwaInstallPrompt.userChoice;
    if (outcome === 'accepted') {
      setPwaInstallPrompt(null);
    }
  };

  // Filter Products by Category and Search Query
  const filteredProducts = products.filter(product => {
    const matchesCategory = activeCategory === 'all' || (() => {
      if (!product || !product.category) return false;
      const selectedCatObj = categories.find(c => c.id === activeCategory || (c.name && c.name.toLowerCase() === String(activeCategory).toLowerCase()));
      const pCat = String(product.category).trim().toLowerCase();
      if (!selectedCatObj) return pCat === String(activeCategory).trim().toLowerCase();
      const cId = String(selectedCatObj.id || '').trim().toLowerCase();
      const cName = String(selectedCatObj.name || '').trim().toLowerCase();
      const cSlug = String(selectedCatObj.slug || '').trim().toLowerCase();
      return pCat === cId || pCat === cName || (cSlug && pCat === cSlug);
    })();

    const matchesSearch = searchQuery === '' || 
      (product.name && product.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Live Order Toast Notification Bar - ONLY displayed when logged in as Admin */}
      {liveOrderToast && isAdminView && isAdminAuthenticated && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 400,
          background: '#0f172a',
          color: '#ffffff',
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          maxWidth: '420px',
          border: '1px solid #334155'
        }} className="animate-fade-in">
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Bell size={20} color="#ffffff" />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: '0.92rem', marginBottom: '0.15rem', color: '#f8fafc' }}>
              🎉 Nouvelle Commande N° {liveOrderToast.id} !
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Client : <strong style={{ color: '#ffffff' }}>{liveOrderToast.customerName}</strong> • {formatCurrency(liveOrderToast.total)}
            </div>
          </div>

          <button 
            onClick={() => setLiveOrderToast(null)}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Top Ticker Announcement Bar */}
      {!isAdminView && <TopAnnouncementBar settings={settings} />}

      {/* Main Sticky Header (Restored on Admin Page) */}
      {(!isAdminView || isAdminAuthenticated) && (
        <Navbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          cartCount={cartItemsCount}
          wishlistCount={wishlist.length}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenWishlist={() => setIsWishlistOpen(true)}
          onOpenOrderTracking={() => setIsOrderTrackingOpen(true)}
          onOpenAdminMobileMenu={() => setIsAdminMobileMenuOpen(true)}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          isAdminView={isAdminView}
          isProductPage={Boolean(directProductPage)}
          onToggleAdminView={() => handleToggleAdminView()}
          pwaInstallPrompt={pwaInstallPrompt}
          onInstallPWA={handleInstallPWA}
        />
      )}

      {/* View Switch: Direct Product Landing Page vs Admin Dashboard / Login vs Client Storefront */}
      {directProductPage ? (
        <ProductPage
          product={directProductPage}
          categories={categories}
          allProducts={products}
          onBackToStore={handleBackToFullStore}
          onAddToCart={handleAddToCart}
          onQuickView={(p) => handleOpenQuickViewModal(p)}
          wishlistIds={wishlist}
          onToggleWishlist={(id) => toggleWishlist(id)}
        />
      ) : isAdminView ? (
        isAdminAuthenticated ? (
          <AdminDashboard
            categories={categories}
            products={products}
            orders={orders}
            onBackToStore={() => handleToggleAdminView(false)}
            onLogout={handleAdminLogout}
            isAdminMobileMenuOpen={isAdminMobileMenuOpen}
            setIsAdminMobileMenuOpen={setIsAdminMobileMenuOpen}
          />
        ) : (
          <AdminLoginPage
            onLoginSuccess={handleAdminLoginSuccess}
            onBackToStore={() => handleToggleAdminView(false)}
          />
        )
      ) : (
        <main style={{ flex: 1, padding: '0 1.5rem 4rem 1.5rem' }}>
          {/* Editorial Luxury Hero Banner */}
          <HeroBanner 
            onExploreClick={() => {
              const el = document.getElementById('product-grid-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          {/* Dynamic Category Pill Selector */}
          <CategoryFilter
            categories={categories}
            products={products}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
          />

          {/* Product Grid Section */}
          <div id="product-grid-section">
            <ProductGrid
              products={filteredProducts}
              categories={categories}
              wishlist={wishlist}
              wishlistIds={wishlist}
              onAddToCart={(p) => handleAddToCart(p, 1)}
              onQuickView={(p) => handleOpenQuickViewModal(p)}
              onToggleWishlist={(id) => toggleWishlist(id)}
            />
          </div>
        </main>
      )}

      {/* Footer - Cache sur la page Admin */}
      {!isAdminView && (
        <footer style={{
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          padding: '2.5rem 1.5rem',
          marginTop: 'auto',
          color: '#64748b',
          fontSize: '0.85rem'
        }}>
          <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <strong style={{ color: '#0f172a' }}>Xor Boutique</strong> © 2026 • Tous droits réservés.
            </div>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <span>Livraison à Domicile</span>
              <span>Mobile Money & CB</span>
              <span>Facturation PDF</span>
            </div>
          </div>
        </footer>
      )}

      {/* MODALS & DRAWERS */}
      
      {/* Product Quick View Modal (when browsing inside store) */}
      {selectedProductModal && (
        <ProductModal
          product={selectedProductModal}
          categories={categories}
          onClose={handleCloseQuickViewModal}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* Cart Slide-Over Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={(idx, qty) => updateCartQuantity(idx, qty)}
        settings={settings}
        onViewInvoice={(order) => {
          setSelectedInvoiceOrder(order);
          setIsCartOpen(false);
        }}
      />

      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistIds={wishlist}
        products={products}
        onAddToCart={(p) => handleAddToCart(p, 1)}
        onToggleWishlist={(id) => toggleWishlist(id)}
      />

      {/* Order Tracking & Receipt Lookup Modal */}
      <OrderTrackingModal
        isOpen={isOrderTrackingOpen}
        onClose={() => setIsOrderTrackingOpen(false)}
        orders={orders}
        settings={settings}
      />

      {/* Printable Invoice Modal */}
      {selectedInvoiceOrder && (
        <InvoiceModal
          order={selectedInvoiceOrder}
          settings={settings}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}

      {/* Recently Viewed Products Floating Dock */}
      {!isAdminView && showRecentlyViewed && recentlyViewedIds.length > 0 && (
        <RecentlyViewedBar
          products={recentlyViewedIds.map(id => products.find(p => p.id === id)).filter(Boolean)}
          onSelectProduct={(p) => {
            if (directProductPage) {
              setDirectProductPage(p);
            } else {
              handleOpenQuickViewModal(p);
            }
          }}
          onClose={() => setShowRecentlyViewed(false)}
        />
      )}

    </div>
  );
}
