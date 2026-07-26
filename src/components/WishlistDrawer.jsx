import React from 'react';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { formatCurrency } from '../services/store';

export default function WishlistDrawer({ isOpen, onClose, wishlistIds, products, onAddToCart, onToggleWishlist }) {
  if (!isOpen) return null;

  const favoritedProducts = products.filter(p => wishlistIds.includes(p.id));

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(6px)',
      zIndex: 240,
      display: 'flex',
      justifyContent: 'flex-end'
    }} onClick={onClose}>
      
      <div 
        className="glass-panel animate-fade-in"
        style={{
          maxWidth: '440px',
          width: '100%',
          height: '100%',
          borderRadius: 0,
          borderRight: 'none',
          borderTop: 'none',
          borderBottom: 'none',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '1.5rem',
          background: '#ffffff',
          color: '#0f172a'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Heart size={20} color="#ec4899" fill="#ec4899" />
            <h3 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 800 }}>
              Mes Favoris ({favoritedProducts.length})
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#0f172a', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        {/* Wishlist Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 0' }}>
          {favoritedProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
              <Heart size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
              <p>Vous n'avez pas encore ajouté d'articles à vos favoris.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {favoritedProducts.map(product => (
                <div key={product.id} className="glass-card" style={{ padding: '0.85rem', display: 'flex', gap: '0.85rem', alignItems: 'center', background: '#f8fafc', borderColor: '#e2e8f0' }}>
                  <img src={product.image} alt={product.name} style={{ width: '65px', height: '65px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.2rem', color: '#0f172a' }}>{product.name}</div>
                    <div className="font-mono" style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 700 }}>
                      {formatCurrency(product.price)}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <button 
                      className="btn btn-primary"
                      style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}
                      onClick={() => {
                        onAddToCart(product);
                      }}
                      title="Ajouter au panier"
                    >
                      <ShoppingBag size={14} />
                    </button>

                    <button 
                      className="btn btn-danger"
                      style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}
                      onClick={() => onToggleWishlist(product.id)}
                      title="Retirer des favoris"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={onClose}>
          Fermer
        </button>

      </div>
    </div>
  );
}
