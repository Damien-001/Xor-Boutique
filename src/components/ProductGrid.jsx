import React from 'react';
import ProductCard from './ProductCard';
import { PackageX } from 'lucide-react';

export default function ProductGrid({ 
  products, 
  categories, 
  onAddToCart, 
  onQuickView, 
  wishlist = [],
  wishlistIds = [], 
  onToggleWishlist 
}) {
  const categoryMap = categories.reduce((acc, cat) => {
    acc[cat.id] = cat.name;
    return acc;
  }, {});

  const activeWishlist = Array.isArray(wishlistIds) && wishlistIds.length > 0 ? wishlistIds : (Array.isArray(wishlist) ? wishlist : []);

  if (products.length === 0) {
    return (
      <div className="glass-panel" style={{
        maxWidth: '1440px',
        margin: '2rem auto',
        padding: '4rem 2rem',
        textAlign: 'center'
      }}>
        <PackageX size={48} color="var(--color-muted)" style={{ marginBottom: '1rem' }} />
        <h3 className="font-display" style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>
          Aucun produit trouvé
        </h3>
        <p style={{ color: 'var(--color-muted)' }}>
          Essayez de changer de catégorie ou de modifier vos termes de recherche.
        </p>
      </div>
    );
  }

  return (
    <div 
      className="product-grid-3cols"
      style={{
        maxWidth: '1440px',
        margin: '0 auto 3rem auto',
        boxSizing: 'border-box',
        width: '100%'
      }}
    >
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          categoryName={categoryMap[product.category] || 'Autre'}
          onAddToCart={onAddToCart}
          onQuickView={onQuickView}
          isWishlisted={activeWishlist.includes(product.id)}
          onToggleWishlist={onToggleWishlist}
        />
      ))}
    </div>
  );
}
