import React, { useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  ShoppingBag, 
  Heart, 
  Search, 
  ShieldCheck, 
  Store, 
  Download, 
  LayoutGrid, 
  Tag, 
  MessageCircle,
  User,
  Cpu,
  Watch
} from 'lucide-react';

const ICON_MAP = {
  Sparkles,
  User,
  Cpu,
  Watch,
  Tag
};

export default function MobileMenuDrawer({ 
  isOpen, 
  onClose, 
  categories, 
  activeCategory, 
  onSelectCategory, 
  cartCount, 
  wishlistCount, 
  onOpenCart, 
  onOpenWishlist, 
  onOpenOrderTracking, 
  isAdminView, 
  onToggleAdminView, 
  pwaInstallPrompt, 
  onInstallPWA,
  settings
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('drawer-open');
      return () => {
        document.body.classList.remove('drawer-open');
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.7)',
      backdropFilter: 'blur(8px)',
      zIndex: 300,
      display: 'flex',
      justifyContent: 'flex-start'
    }} onClick={onClose}>
      
      <div 
        className="glass-panel animate-fade-in"
        style={{
          maxWidth: '340px',
          width: '85%',
          height: '100%',
          borderRadius: 0,
          borderLeft: 'none',
          borderTop: 'none',
          borderBottom: 'none',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '1.5rem',
          background: '#ffffff',
          color: '#0f172a',
          boxShadow: '10px 0 40px rgba(0,0,0,0.15)',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Menu Drawer Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(15,23,42,0.15)'
              }}>
                <Sparkles size={20} color="#ffffff" />
              </div>
              <div>
                <div className="font-display" style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                  Dam<span style={{ color: '#2563eb' }}>Shop</span>
                </div>
                <div className="font-mono" style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '0.15rem' }}>
                  NAVIGATION MOBILE
                </div>
              </div>
            </div>

            <button 
              onClick={onClose}
              style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0f172a',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Quick Access Action Links */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              ACCÈS RAPIDE
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              
              {/* Cart Button */}
              <button 
                onClick={() => { onOpenCart(); onClose(); }}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'space-between', padding: '0.85rem 1.25rem', borderRadius: '12px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <ShoppingBag size={18} />
                  <span>Mon Panier</span>
                </div>
                {cartCount > 0 && (
                  <span style={{
                    background: '#2563eb',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    padding: '0.2rem 0.65rem',
                    borderRadius: '12px'
                  }}>
                    {cartCount} article(s)
                  </span>
                )}
              </button>

              {/* Wishlist Button */}
              <button 
                onClick={() => { onOpenWishlist(); onClose(); }}
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'space-between', padding: '0.85rem 1.25rem', borderRadius: '12px', borderColor: '#f472b6', background: '#fdf2f8' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#db2777', fontWeight: 700 }}>
                  <Heart size={18} color="#ec4899" fill={wishlistCount > 0 ? '#ec4899' : 'none'} />
                  <span>Mes Favoris</span>
                </div>
                {wishlistCount > 0 && (
                  <span style={{
                    background: '#ec4899',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    padding: '0.2rem 0.65rem',
                    borderRadius: '12px'
                  }}>
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Order Tracking Button */}
              <button 
                onClick={() => { onOpenOrderTracking(); onClose(); }}
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'flex-start', gap: '0.75rem', padding: '0.85rem 1.25rem', borderRadius: '12px' }}
              >
                <Search size={18} color="#2563eb" />
                <span>Suivi de Commande & Reçus</span>
              </button>

              {/* Admin Toggle Button */}
              <button 
                onClick={() => { onToggleAdminView(); onClose(); }}
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'flex-start', gap: '0.75rem', padding: '0.85rem 1.25rem', borderRadius: '12px', background: isAdminView ? '#eff6ff' : '#f8fafc' }}
              >
                {isAdminView ? <Store size={18} color="#2563eb" /> : <ShieldCheck size={18} color="#0f172a" />}
                <span style={{ fontWeight: 700 }}>{isAdminView ? 'Aller sur la Boutique' : 'Espace Administration'}</span>
              </button>

              {/* PWA Install Button */}
              {pwaInstallPrompt && (
                <button 
                  onClick={() => { onInstallPWA(); onClose(); }}
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'flex-start', gap: '0.75rem', padding: '0.85rem 1.25rem', borderRadius: '12px', borderColor: '#fde68a', background: '#fef3c7', color: '#b45309' }}
                >
                  <Download size={18} />
                  <span style={{ fontWeight: 700 }}>Installer l'Application</span>
                </button>
              )}

            </div>
          </div>

          {/* Categories Navigation Links */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              CATÉGORIES D'ARTICLES
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {/* "Tous les produits" */}
              <button
                onClick={() => { onSelectCategory('all'); onClose(); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: activeCategory === 'all' ? '#0f172a' : '#f8fafc',
                  color: activeCategory === 'all' ? '#ffffff' : '#334155',
                  fontWeight: activeCategory === 'all' ? 700 : 500,
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <LayoutGrid size={16} />
                  <span>Tous les produits</span>
                </div>
              </button>

              {/* Dynamic Category List */}
              {categories.map((cat) => {
                const IconComponent = ICON_MAP[cat.icon] || Tag;
                const isActive = activeCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    onClick={() => { onSelectCategory(cat.id); onClose(); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: 'none',
                      background: isActive ? '#0f172a' : '#f8fafc',
                      color: isActive ? '#ffffff' : '#334155',
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <IconComponent size={16} style={{ color: isActive ? '#ffffff' : (cat.color || '#2563eb') }} />
                      <span>{cat.name}</span>
                    </div>

                    <span className="font-mono" style={{
                      fontSize: '0.72rem',
                      padding: '0.15rem 0.5rem',
                      borderRadius: '8px',
                      background: isActive ? 'rgba(255, 255, 255, 0.2)' : '#e2e8f0',
                      color: isActive ? '#ffffff' : '#64748b',
                      fontWeight: 700
                    }}>
                      {cat.count || 0}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* WhatsApp Support Footer Link */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', marginTop: '2rem' }}>
          <a
            href={`https://wa.me/${(settings?.whatsappNumber || '2250700000000').replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ width: '100%', justifyContent: 'center', gap: '0.6rem', padding: '0.75rem' }}
          >
            <MessageCircle size={18} color="#25D366" /> Support Client WhatsApp
          </a>
        </div>

      </div>
    </div>
  );
}
