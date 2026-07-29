import React from 'react';
import { Eye, X, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../services/store';

export default function RecentlyViewedBar({ products, onSelectProduct, onClose }) {
  if (!products || products.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '16px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 120,
      width: '92%',
      maxWidth: '540px',
      background: 'rgba(15, 23, 42, 0.92)',
      backdropFilter: 'blur(12px)',
      color: '#ffffff',
      borderRadius: '16px',
      padding: '0.65rem 1rem',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      boxSizing: 'border-box'
    }} className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', fontWeight: 700, color: '#93c5fd' }}>
          <Eye size={14} color="#60a5fa" />
          <span>Récemment Consultés ({products.length})</span>
        </div>

        <button 
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.1rem' }}
          title="Masquer l'historique"
        >
          <X size={14} />
        </button>
      </div>

      <div style={{
        display: 'flex',
        gap: '0.6rem',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        paddingBottom: '0.2rem'
      }}>
        {products.map((product) => (
          <div
            key={product.id}
            onClick={() => onSelectProduct(product)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '0.35rem 0.65rem',
              borderRadius: '10px',
              cursor: 'pointer',
              flexShrink: 0,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              transition: 'background 0.2s ease'
            }}
          >
            <img 
              src={product.image} 
              alt={product.name} 
              style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }}
            />
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ffffff', maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {product.name}
              </div>
              <div className="font-mono" style={{ fontSize: '0.68rem', color: '#fbbf24', fontWeight: 700 }}>
                {formatCurrency(product.price)}
              </div>
            </div>
            <ChevronRight size={12} color="#94a3b8" />
          </div>
        ))}
      </div>
    </div>
  );
}
