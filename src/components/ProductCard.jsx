import React, { useState } from 'react';
import { Star, ShoppingBag, Eye, Heart, AlertTriangle, Share2, Check, MessageCircle } from 'lucide-react';
import { formatCurrency } from '../services/store';

export default function ProductCard({ 
  product, 
  categoryName, 
  onAddToCart, 
  onQuickView, 
  isWishlisted, 
  onToggleWishlist 
}) {
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShare = async (e) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}${window.location.pathname}?product=${product.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: shareUrl
        });
        return;
      } catch (err) {}
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (err) {
      alert(`Lien du produit : ${shareUrl}`);
    }
  };
  const discountPercent = (product.originalPrice && Number(product.originalPrice) > Number(product.price)) 
    ? Math.max(0, Math.round(((Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)) * 100))
    : 0;

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 3;

  const [cardImgIndex, setCardImgIndex] = useState(0);
  const productImages = (product.images && product.images.length > 0) ? product.images : (product.image ? [product.image] : []);
  const currentCardImg = productImages[cardImgIndex] || product.image;

  return (
    <div 
      className="glass-card animate-fade-in" 
      onClick={() => onQuickView(product)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        background: '#ffffff',
        borderColor: '#e2e8f0',
        opacity: isOutOfStock ? 0.85 : 1,
        cursor: 'pointer'
      }}
    >
      {/* Product Image Box */}
      <div style={{
        position: 'relative',
        width: '100%',
        paddingTop: '85%',
        overflow: 'hidden',
        background: '#f8fafc'
      }}>
        <img 
          src={currentCardImg} 
          alt={product.name}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: isOutOfStock ? 'grayscale(40%)' : 'none',
            transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onMouseOver={(e) => !isOutOfStock && (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseOut={(e) => !isOutOfStock && (e.currentTarget.style.transform = 'scale(1)')}
        />

        {/* Badges Overlay */}
        <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {isOutOfStock ? (
            <span className="badge" style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5' }}>
              Rupture de Stock
            </span>
          ) : isLowStock ? (
            <span className="badge badge-gold">
              <AlertTriangle size={12} /> Plus que {product.stock} dispo !
            </span>
          ) : (
            <span className="badge badge-success">
              En stock ({product.stock})
            </span>
          )}

          {discountPercent > 0 && (
            <span className="badge badge-gold">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Multi-Photo Counter Badge & Dots Overlay */}
        {productImages.length > 1 && (
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              bottom: '8px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(4px)',
              padding: '0.2rem 0.6rem',
              borderRadius: '20px',
              zIndex: 5
            }}
          >
            {productImages.map((_, idx) => (
              <span
                key={idx}
                onClick={() => setCardImgIndex(idx)}
                style={{
                  width: cardImgIndex === idx ? '10px' : '6px',
                  height: '6px',
                  borderRadius: '3px',
                  background: cardImgIndex === idx ? '#ffffff' : 'rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              />
            ))}
          </div>
        )}

        {/* Top Right Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: isWishlisted ? '#fce7f3' : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(4px)',
            border: isWishlisted ? '1px solid #f472b6' : '1px solid #e2e8f0',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isWishlisted ? '#ec4899' : '#0f172a',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            transition: 'all 0.2s ease'
          }}
          title={isWishlisted ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <Heart size={16} fill={isWishlisted ? '#ec4899' : 'none'} color={isWishlisted ? '#ec4899' : '#0f172a'} />
        </button>

        {/* Share / Copy Direct Product Link Button */}
        <button
          onClick={handleShare}
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '56px',
            background: copiedLink ? '#dcfce7' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(4px)',
            border: copiedLink ? '1px solid #86efac' : '1px solid #e2e8f0',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: copiedLink ? '#15803d' : '#0f172a',
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
            transition: 'all 0.2s ease'
          }}
          title={copiedLink ? 'Lien copié !' : 'Copier le lien direct pour Facebook / TikTok / WhatsApp'}
        >
          {copiedLink ? <Check size={18} color="#15803d" /> : <Share2 size={17} />}
        </button>

        {/* Quick View Floating Button */}
        <button
          onClick={() => onQuickView(product)}
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(4px)',
            border: '1px solid #e2e8f0',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0f172a',
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
            transition: 'all 0.2s ease'
          }}
          title="Aperçu rapide"
        >
          <Eye size={18} />
        </button>
      </div>

      {/* Product Details */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span className="font-mono" style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
              {categoryName}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#d97706', fontSize: '0.85rem', fontWeight: 700 }}>
              <Star size={14} fill="#d97706" />
              <span>{product.rating}</span>
            </div>
          </div>

          <h3 className="font-display" style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            marginBottom: '0.5rem',
            lineHeight: 1.3,
            color: '#0f172a'
          }}>
            {product.name}
          </h3>

          {/* Available Sizes preview */}
          {product.sizes && product.sizes.length > 0 && (
            <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              {product.sizes.map((s, idx) => (
                <span key={idx} className="font-mono" style={{ fontSize: '0.68rem', background: '#f1f5f9', color: '#475569', padding: '0.1rem 0.45rem', borderRadius: '4px', fontWeight: 600 }}>
                  {s}
                </span>
              ))}
            </div>
          )}

          <p style={{
            fontSize: '0.85rem',
            color: '#64748b',
            marginBottom: '1rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.5
          }}>
            {product.description}
          </p>
        </div>

        {/* Pricing & Add to Cart */}
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.85rem' }}>
            <span className="font-mono" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
              {formatCurrency(product.price)}
            </span>
            {product.originalPrice && (
              <span className="font-mono" style={{ fontSize: '0.85rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isOutOfStock ? '1fr' : '1fr 1fr', gap: '0.45rem', width: '100%' }}>
            <button 
              className="btn btn-primary" 
              disabled={isOutOfStock}
              style={{ 
                width: '100%', 
                justifyContent: 'center',
                gap: '0.35rem',
                background: isOutOfStock ? '#94a3b8' : '#0f172a',
                cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                padding: '0.65rem 0.4rem',
                fontSize: '0.78rem',
                borderRadius: '10px',
                boxSizing: 'border-box',
                fontWeight: 700
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (!isOutOfStock) onAddToCart(product);
              }}
              title="Ajouter au Panier"
            >
              <ShoppingBag size={15} /> 
              <span>{isOutOfStock ? 'Rupture' : 'Panier'}</span>
            </button>

            {!isOutOfStock && (
              <a
                href={`https://wa.me/2250700000000?text=${encodeURIComponent(`Bonjour Xor Boutique ! Je souhaite commander directement l'article : ${product.name} (Prix : ${product.price} FCFA).`)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="btn"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  padding: '0.65rem 0.4rem',
                  fontSize: '0.78rem',
                  background: '#25D366',
                  color: '#ffffff',
                  fontWeight: 700,
                  borderRadius: '10px',
                  border: 'none',
                  boxSizing: 'border-box',
                  textDecoration: 'none'
                }}
                title="Commander directement par WhatsApp"
              >
                <MessageCircle size={15} fill="#ffffff" color="#25D366" />
                <span>WhatsApp</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
