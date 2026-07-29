import React, { useEffect, useState } from 'react';
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
  Watch,
  PackageCheck,
  ChevronRight,
  Sparkle
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
  settings,
  searchQuery = '',
  setSearchQuery = () => {}
}) {
  const [drawerSearch, setDrawerSearch] = useState('');

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('drawer-open');
      return () => {
        document.body.classList.remove('drawer-open');
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (setSearchQuery) {
      setSearchQuery(drawerSearch);
    }
    onClose();
  };

  const whatsappNum = (settings?.whatsappNumber || '2250700000000').replace(/[^0-9]/g, '');

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 300,
      display: 'flex',
      justifyContent: 'flex-start'
    }} onClick={onClose}>
      
      <div 
        className="glass-panel animate-fade-in"
        style={{
          maxWidth: '340px',
          width: '88%',
          height: '100%',
          borderRadius: 0,
          borderLeft: 'none',
          borderTop: 'none',
          borderBottom: 'none',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '1.5rem 1.25rem calc(5.5rem + env(safe-area-inset-bottom, 0px)) 1.25rem',
          background: '#ffffff',
          color: '#0f172a',
          boxShadow: '10px 0 40px rgba(0,0,0,0.2)',
          overflowY: 'auto',
          boxSizing: 'border-box'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Menu Drawer Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(15,23,42,0.2)'
              }}>
                <Sparkles size={22} color="#ffffff" />
              </div>
              <div>
                <div className="font-display" style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                  Xor<span style={{ color: '#2563eb' }}> Boutique</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem' }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span>
                  <span style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 700 }}>Boutique Ouverte</span>
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
              title="Fermer le menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Instant Search Bar Inside Mobile Drawer */}
          <form onSubmit={handleSearchSubmit} style={{ marginBottom: '1.5rem', position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Rechercher un produit..."
              value={drawerSearch}
              onChange={(e) => setDrawerSearch(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '2.5rem',
                paddingRight: '1rem',
                paddingTop: '0.65rem',
                paddingBottom: '0.65rem',
                fontSize: '0.85rem',
                borderRadius: '12px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                boxSizing: 'border-box'
              }}
            />
            <Search size={16} color="#64748b" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
          </form>

          {/* Quick Access Action Bar (1-Tap Buttons) */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              ACCÈS RAPIDE
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              
              {/* Cart Button */}
              <button 
                onClick={() => { onOpenCart(); onClose(); }}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'space-between', padding: '0.85rem 1.25rem', borderRadius: '14px', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <ShoppingBag size={18} />
                  <span style={{ fontWeight: 700 }}>Mon Panier</span>
                </div>
                <span style={{
                  background: cartCount > 0 ? '#ffffff' : 'rgba(255,255,255,0.2)',
                  color: cartCount > 0 ? '#2563eb' : '#ffffff',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  padding: '0.2rem 0.65rem',
                  borderRadius: '12px'
                }}>
                  {cartCount} article(s)
                </span>
              </button>

              {/* Wishlist Button */}
              <button 
                onClick={() => { onOpenWishlist(); onClose(); }}
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'space-between', padding: '0.85rem 1.25rem', borderRadius: '14px', borderColor: '#f472b6', background: '#fdf2f8' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#db2777', fontWeight: 700 }}>
                  <Heart size={18} color="#ec4899" fill={wishlistCount > 0 ? '#ec4899' : 'none'} />
                  <span>Mes Favoris</span>
                </div>
                {wishlistCount > 0 && (
                  <span style={{
                    background: '#ec4899',
                    color: '#ffffff',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    padding: '0.2rem 0.65rem',
                    borderRadius: '12px'
                  }}>
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Order Tracking & Invoice Button */}
              <button 
                onClick={() => { onOpenOrderTracking(); onClose(); }}
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'flex-start', gap: '0.75rem', padding: '0.85rem 1.25rem', borderRadius: '14px', borderColor: '#bfdbfe', background: '#eff6ff', color: '#1e40af', fontWeight: 700 }}
              >
                <PackageCheck size={18} color="#2563eb" />
                <span>Suivi de Commande & Reçus</span>
              </button>

              {/* Admin Toggle Button */}
              <button 
                onClick={() => { onToggleAdminView(); onClose(); }}
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'flex-start', gap: '0.75rem', padding: '0.85rem 1.25rem', borderRadius: '14px', background: isAdminView ? '#eff6ff' : '#f8fafc' }}
              >
                {isAdminView ? <Store size={18} color="#2563eb" /> : <ShieldCheck size={18} color="#0f172a" />}
                <span style={{ fontWeight: 700 }}>{isAdminView ? 'Aller sur la Boutique' : 'Espace Administration'}</span>
              </button>

              {/* PWA Install Button */}
              {pwaInstallPrompt && (
                <button 
                  onClick={() => { onInstallPWA(); onClose(); }}
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'flex-start', gap: '0.75rem', padding: '0.85rem 1.25rem', borderRadius: '14px', borderColor: '#fde68a', background: '#fef3c7', color: '#b45309' }}
                >
                  <Download size={18} />
                  <span style={{ fontWeight: 700 }}>Installer l'App sur Smartphone</span>
                </button>
              )}

            </div>
          </div>

          {/* Categories Navigation Links */}
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              RAYONS DE LA BOUTIQUE
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              {/* "Tous les produits" */}
              <button
                onClick={() => { onSelectCategory('all'); onClose(); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.8rem 1rem',
                  borderRadius: '12px',
                  border: 'none',
                  background: activeCategory === 'all' ? '#0f172a' : '#f8fafc',
                  color: activeCategory === 'all' ? '#ffffff' : '#334155',
                  fontWeight: activeCategory === 'all' ? 700 : 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <LayoutGrid size={18} color={activeCategory === 'all' ? '#ffffff' : '#0f172a'} />
                  <span>Tous les produits</span>
                </div>
                <ChevronRight size={16} color={activeCategory === 'all' ? '#ffffff' : '#94a3b8'} />
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
                      padding: '0.8rem 1rem',
                      borderRadius: '12px',
                      border: 'none',
                      background: isActive ? '#0f172a' : '#f8fafc',
                      color: isActive ? '#ffffff' : '#334155',
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <IconComponent size={18} style={{ color: isActive ? '#ffffff' : (cat.color || '#2563eb') }} />
                      <span>{cat.name}</span>
                    </div>

                    <span className="font-mono" style={{
                      fontSize: '0.72rem',
                      padding: '0.15rem 0.55rem',
                      borderRadius: '10px',
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

        {/* WhatsApp Direct 1-Click Support Button */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', marginTop: '2rem' }}>
          <a
            href={`https://wa.me/${whatsappNum}?text=${encodeURIComponent('Bonjour Xor Boutique ! Je souhaite avoir des informations sur vos produits.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
            style={{
              width: '100%',
              justify: 'center',
              gap: '0.65rem',
              padding: '0.85rem',
              background: '#25D366',
              color: '#ffffff',
              fontWeight: 800,
              borderRadius: '14px',
              border: 'none',
              boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)',
              boxSizing: 'border-box'
            }}
          >
            <MessageCircle size={20} fill="#ffffff" color="#25D366" /> Discuter avec un Vendeur WhatsApp
          </a>
        </div>

      </div>
    </div>
  );
}
