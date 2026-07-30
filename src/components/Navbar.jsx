import React from 'react';
import { ShoppingBag, Search, ShieldCheck, Download, Sparkles, Store, Heart, Menu } from 'lucide-react';
import AdminNotificationModal from './admin/AdminNotificationModal';

export default function Navbar({ 
  searchQuery, 
  setSearchQuery, 
  cartCount, 
  wishlistCount,
  onOpenCart, 
  onOpenWishlist,
  onOpenOrderTracking,
  onOpenAdminMobileMenu,
  onOpenMobileMenu,
  isAdminView, 
  isProductPage,
  onToggleAdminView,
  pwaInstallPrompt,
  onInstallPWA 
}) {
  return (
    <header className="glass-panel" style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      borderRadius: 0,
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: 'none',
      padding: '0.75rem 0',
      marginBottom: '1.25rem',
      background: 'rgba(255, 255, 255, 0.96)',
      borderColor: '#e2e8f0'
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '0 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.5rem',
        flexWrap: 'nowrap',
        boxSizing: 'border-box',
        width: '100%'
      }}>
        
        {/* Brand Logo (Left) */}
        <div 
          onClick={() => isAdminView && onToggleAdminView()}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', flexShrink: 0 }}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)'
          }}>
            <Sparkles size={18} color="#ffffff" />
          </div>
          <div>
            <div className="font-display" style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1, color: '#0f172a', whiteSpace: 'nowrap' }}>
              Xor<span style={{ color: '#2563eb' }}> Boutique</span>
            </div>
            <div className="font-mono hide-mobile" style={{ fontSize: '0.6rem', color: '#64748b', letterSpacing: '0.1em' }}>
              BOUTIQUE EN LIGNE
            </div>
          </div>
        </div>

        {/* Global Search Bar (MIDDLE - Centered on Single Line) */}
        {!isAdminView && !isProductPage && (
          <div style={{
            flex: '1',
            maxWidth: '520px',
            minWidth: '140px',
            position: 'relative'
          }}>
            <Search 
              size={16} 
              color="#64748b" 
              style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} 
            />
            <input
              type="text"
              className="form-input"
              placeholder="Rechercher un produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '2.4rem',
                paddingRight: '1rem',
                paddingTop: '0.55rem',
                paddingBottom: '0.55rem',
                fontSize: '0.85rem',
                borderRadius: 'var(--radius-full)',
                background: '#f8fafc',
                borderColor: searchQuery ? '#0f172a' : '#cbd5e1'
              }}
            />
          </div>
        )}

        {/* Navigation Action Buttons (RIGHT) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0, paddingRight: '0.25rem' }}>
          
          {/* Store Switch & Notification Bell (Visible in Admin mode) */}
          {isAdminView && (
            <>
              <button
                className="btn btn-primary"
                onClick={onToggleAdminView}
                style={{ padding: '0.45rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem', background: '#0f172a', borderColor: '#0f172a', whiteSpace: 'nowrap', borderRadius: '10px' }}
                title="Voir la boutique"
              >
                <Store size={15} color="#ffffff" />
                <span className="hide-mobile" style={{ fontWeight: 700, fontSize: '0.78rem', color: '#ffffff' }}>
                  Boutique
                </span>
              </button>

              <AdminNotificationModal />

              {/* Admin Mobile Hamburger Menu Button */}
              <button
                className="btn btn-secondary admin-mobile-menu-trigger"
                onClick={onOpenAdminMobileMenu}
                style={{ padding: '0.45rem 0.65rem', background: '#0f172a', color: '#ffffff', borderColor: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap', borderRadius: '10px' }}
                title="Ouvrir le menu de navigation Admin"
              >
                <Menu size={18} color="#ffffff" />
                <span className="hide-mobile" style={{ fontSize: '0.78rem', fontWeight: 700 }}>Menu</span>
              </button>
            </>
          )}

          {/* Order Tracking & Receipts Button (Client View) */}
          {!isAdminView && (
            <button
              className="btn btn-secondary"
              onClick={onOpenOrderTracking}
              style={{ padding: '0.45rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              title="Suivi de Commande & Reçus"
            >
              <Search size={16} color="#2563eb" />
              <span className="hide-mobile" style={{ fontSize: '0.82rem' }}>Suivi</span>
            </button>
          )}

          {/* Wishlist Button (Client View) */}
          {!isAdminView && (
            <button
              className="btn btn-secondary"
              onClick={onOpenWishlist}
              style={{ position: 'relative', padding: '0.45rem 0.65rem' }}
              title="Mes Favoris"
            >
              <Heart size={17} color="#ec4899" fill={wishlistCount > 0 ? '#ec4899' : 'none'} />
              {wishlistCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: '#ec4899',
                  color: '#ffffff',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  width: '17px',
                  height: '17px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {wishlistCount}
                </span>
              )}
            </button>
          )}

          {/* Cart Button (Client View) */}
          {!isAdminView && (
            <button 
              className="btn btn-primary"
              onClick={onOpenCart}
              style={{ position: 'relative', padding: '0.45rem 0.75rem' }}
            >
              <ShoppingBag size={17} />
              <span className="hide-mobile">Panier</span>
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  background: '#2563eb',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(37, 99, 235, 0.4)'
                }}>
                  {cartCount}
                </span>
              )}
            </button>
          )}



        </div>
      </div>
    </header>
  );
}
