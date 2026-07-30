import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Star, 
  ShoppingBag, 
  ShieldCheck, 
  Truck, 
  Share2, 
  Check, 
  MessageSquare, 
  Send,
  Heart,
  AlertTriangle,
  ChevronRight,
  Zap,
  Sparkles
} from 'lucide-react';
import { formatCurrency, getReviews, addReview } from '../services/store';
import ProductCard from './ProductCard';

export default function ProductPage({ 
  product, 
  categories, 
  allProducts,
  settings,
  onBackToStore, 
  onAddToCart,
  onQuickView,
  wishlistIds = [],
  onToggleWishlist
}) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || 'Unique');
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || 'Standard');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState(getReviews(product?.id));
  const [newReview, setNewReview] = useState({ userName: '', rating: 5, comment: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);

  if (!product) return null;

  const categoryObj = categories.find(c => c.id === product.category);
  const productImages = (product.images && product.images.length > 0) ? product.images : (product.image ? [product.image] : []);
  const currentImage = productImages[activeImageIndex] || product.image;

  const discountPercent = (product.originalPrice && Number(product.originalPrice) > Number(product.price)) 
    ? Math.max(0, Math.round(((Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)) * 100))
    : 0;

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 3;
  const isWishlisted = wishlistIds.includes(product.id);

  // Similar products from same category
  const similarProducts = allProducts.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  const handleShareProduct = async () => {
    const shareUrl = `${window.location.origin}/?product=${product.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `DamShop - ${product.name}`,
          text: `Découvrez ${product.name} sur DamShop : ${product.description}`,
          url: shareUrl
        });
        return;
      } catch (err) {}
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch (e) {
      alert(`Lien direct du produit : ${shareUrl}`);
    }
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!newReview.userName || !newReview.comment) {
      alert('Veuillez entrer votre nom et votre commentaire.');
      return;
    }
    const added = addReview({
      productId: product.id,
      ...newReview
    });
    setReviews([added, ...reviews]);
    setNewReview({ userName: '', rating: 5, comment: '' });
    setShowReviewForm(false);
  };

  return (
    <div className="product-page-container animate-fade-in">
      <style>{`
        .product-page-container {
          width: 100%;
          max-width: 1440px;
          margin: 0 auto;
          padding: 1.5rem 1.5rem 4rem 1.5rem;
          box-sizing: border-box;
        }
        .product-showcase-panel {
          width: 100%;
          background: #ffffff;
          border-radius: 24px;
          padding: 2.5rem 3rem;
          box-shadow: 0 20px 60px rgba(0,0,0,0.05);
          border: 1px solid #e2e8f0;
          margin-bottom: 3.5rem;
          box-sizing: border-box;
        }
        .product-showcase-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
          gap: 3.5rem;
          align-items: start;
        }
        .product-main-image-box {
          position: relative;
          width: 100%;
          height: 560px;
          border-radius: 20px;
          overflow: hidden;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          box-shadow: 0 12px 35px rgba(0,0,0,0.06);
          margin-bottom: 1.5rem;
        }
        @media (max-width: 900px) {
          .product-page-container {
            padding: 1rem 1rem 3rem 1rem;
          }
          .product-showcase-panel {
            padding: 1.5rem;
            border-radius: 16px;
          }
          .product-showcase-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          .product-main-image-box {
            height: 400px;
          }
        }
      `}</style>
      
      {/* Navigation & Breadcrumb Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2rem',
        paddingBottom: '1.25rem',
        borderBottom: '1px solid #e2e8f0'
      }}>
        {/* Back to store button */}
        <button 
          onClick={onBackToStore}
          className="btn btn-secondary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.75rem 1.5rem',
            fontSize: '0.95rem',
            fontWeight: 700,
            borderRadius: '12px'
          }}
        >
          <ArrowLeft size={20} /> Voir toute la boutique Xor Boutique
        </button>

        {/* Breadcrumb Trail */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', color: '#64748b' }}>
          <span style={{ cursor: 'pointer', color: '#0f172a', fontWeight: 600 }} onClick={onBackToStore}>Accueil</span>
          <ChevronRight size={16} />
          <span style={{ color: '#0f172a', fontWeight: 600 }}>{categoryObj?.name || 'Produit'}</span>
          <ChevronRight size={16} />
          <span style={{ color: '#64748b', fontWeight: 500, maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {product.name}
          </span>
        </div>
      </div>

      {/* Main Full Product Layout Panel */}
      <div className="product-showcase-panel glass-panel">
        <div className="product-showcase-grid">
          
          {/* LEFT COLUMN: Gallery & Main Image Display */}
          <div>
            <div className="product-main-image-box" style={{ borderRadius: '20px', overflow: 'hidden', position: 'relative' }}>
              <img 
                src={currentImage} 
                alt={product.name} 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  borderRadius: '20px'
                }}
              />

              {/* Badges Overlay */}
              <div style={{ position: 'absolute', top: '20px', left: '20px', display: 'flex', flexDirection: 'column', gap: '0.6rem', zIndex: 2 }}>
                {isOutOfStock ? (
                  <span className="badge" style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', padding: '0.5rem 1rem', fontSize: '0.9rem', borderRadius: '10px' }}>
                    Rupture de Stock
                  </span>
                ) : isLowStock ? (
                  <span className="badge badge-gold" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', borderRadius: '10px' }}>
                    <AlertTriangle size={16} /> Plus que {product.stock} dispo !
                  </span>
                ) : (
                  <span className="badge badge-success" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', borderRadius: '10px' }}>
                    En Stock ({product.stock})
                  </span>
                )}

                {discountPercent > 0 && (
                  <span className="badge badge-gold" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', borderRadius: '10px' }}>
                    Économisez -{discountPercent}%
                  </span>
                )}
              </div>

              {/* Wishlist Button */}
              <button
                onClick={() => onToggleWishlist(product.id)}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: isWishlisted ? '#fce7f3' : 'rgba(255, 255, 255, 0.95)',
                  border: isWishlisted ? '1px solid #f472b6' : '1px solid #e2e8f0',
                  borderRadius: '50%',
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                  zIndex: 2,
                  transition: 'all 0.2s ease'
                }}
                title={isWishlisted ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              >
                <Heart size={22} fill={isWishlisted ? '#ec4899' : 'none'} color={isWishlisted ? '#ec4899' : '#0f172a'} />
              </button>
            </div>

            {/* Gallery Thumbnails */}
            {productImages.length > 1 && (
              <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {productImages.map((img, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    style={{
                      width: '90px',
                      height: '90px',
                      borderRadius: '14px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: activeImageIndex === idx ? '3px solid #2563eb' : '1px solid #cbd5e1',
                      opacity: activeImageIndex === idx ? 1 : 0.7,
                      transition: 'all 0.2s ease',
                      flexShrink: 0
                    }}
                  >
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

        {/* RIGHT COLUMN: Product Information & Purchasing */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            {/* Category & Rating */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span className="font-mono" style={{ fontSize: '0.85rem', color: '#2563eb', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>
                {categoryObj?.name || 'Collection DamShop'}
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#d97706', fontWeight: 700, fontSize: '0.95rem' }}>
                <Star size={18} fill="#d97706" />
                <span>{product.rating}</span>
                <span style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 500 }}>({reviews.length} avis)</span>
              </div>
            </div>

            {/* Product Title */}
            <h1 className="font-display" style={{
              fontSize: '2.2rem',
              fontWeight: 800,
              color: '#0f172a',
              lineHeight: 1.2,
              marginBottom: '1rem'
            }}>
              {product.name}
            </h1>

            {/* Price Box */}
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '1rem',
              marginBottom: '1.5rem',
              padding: '1rem 1.25rem',
              background: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <span className="font-mono" style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a' }}>
                {formatCurrency(product.price * quantity)}
              </span>

              {product.originalPrice && (
                <span className="font-mono" style={{ fontSize: '1.1rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                  {formatCurrency(product.originalPrice * quantity)}
                </span>
              )}

              {discountPercent > 0 && (
                <span className="badge badge-gold" style={{ fontSize: '0.8rem' }}>
                  Offre Promotionnelle
                </span>
              )}
            </div>

            {/* Dynamic Stock Scarcity & Realtime Urgency Banner */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              background: '#fff7ed',
              border: '1px solid #ffedd5',
              padding: '0.65rem 1rem',
              borderRadius: '10px',
              marginBottom: '1.5rem',
              fontSize: '0.82rem',
              color: '#c2410c',
              fontWeight: 700
            }}>
              <Zap size={16} color="#ea580c" style={{ flexShrink: 0 }} />
              <span>
                ⚡ 14 personnes ont cet article dans leur panier. {product.stock > 0 && product.stock <= 5 ? `Plus que ${product.stock} disponibles en stock !` : 'Expédition prioritaire 24h.'}
              </span>
            </div>

            {/* Description */}
            <p style={{
              fontSize: '1rem',
              color: '#475569',
              lineHeight: 1.7,
              marginBottom: '1.75rem'
            }}>
              {product.description}
            </p>

            {/* Options Selectors (Sizes & Colors) */}
            {product.sizes && product.sizes.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                  Taille disponible :
                </label>
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  {product.sizes.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedSize(s)}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        border: selectedSize === s ? '2px solid #0f172a' : '1px solid #cbd5e1',
                        background: selectedSize === s ? '#0f172a' : '#ffffff',
                        color: selectedSize === s ? '#ffffff' : '#0f172a',
                        fontWeight: selectedSize === s ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.colors && product.colors.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                  Couleur :
                </label>
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  {product.colors.map((c, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        border: selectedColor === c ? '2px solid #2563eb' : '1px solid #cbd5e1',
                        background: selectedColor === c ? '#dbeafe' : '#ffffff',
                        color: selectedColor === c ? '#1d4ed8' : '#0f172a',
                        fontWeight: selectedColor === c ? 700 : 500,
                        cursor: 'pointer'
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Stepper */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <span className="form-label" style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>Quantité :</span>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '10px', background: '#f8fafc' }}>
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ background: 'none', border: 'none', color: '#0f172a', padding: '0.6rem 1rem', cursor: 'pointer', fontWeight: 800, fontSize: '1.1rem' }}
                >
                  -
                </button>
                <span className="font-mono" style={{ padding: '0 1rem', fontWeight: 800, fontSize: '1.1rem' }}>{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  style={{ background: 'none', border: 'none', color: '#0f172a', padding: '0.6rem 1rem', cursor: 'pointer', fontWeight: 800, fontSize: '1.1rem' }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Interactive Quantity Discount Bundle Offer Cards - Dynamic & Governed by Admin Settings */}
            {settings?.enableQuantityDiscounts !== false && (
              <div style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
                border: '1px solid #bfdbfe',
                borderRadius: '16px',
                padding: '1.25rem',
                marginBottom: '1.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
                  <Sparkles size={18} color="#2563eb" />
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
                    Offres Spéciales & Remises par Quantité
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                  {/* Pack 1 Item */}
                  <div 
                    onClick={() => setQuantity(1)}
                    style={{
                      padding: '0.75rem 0.85rem',
                      borderRadius: '12px',
                      border: quantity === 1 ? '2px solid #0f172a' : '1px solid #cbd5e1',
                      background: quantity === 1 ? '#ffffff' : '#f8fafc',
                      cursor: 'pointer',
                      textAlign: 'center',
                      boxShadow: quantity === 1 ? '0 4px 12px rgba(15,23,42,0.1)' : 'none'
                    }}
                  >
                    <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>1 Article</div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a', marginTop: '0.15rem' }}>
                      Standard
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.1rem' }}>Prix normal</div>
                  </div>

                  {/* Pack 2 Items */}
                  {(settings?.discount2Items !== undefined ? settings.discount2Items : 5) > 0 && (
                    <div 
                      onClick={() => setQuantity(2)}
                      style={{
                        padding: '0.75rem 0.85rem',
                        borderRadius: '12px',
                        border: quantity === 2 ? '2px solid #2563eb' : '1px solid #93c5fd',
                        background: quantity === 2 ? '#ffffff' : '#eff6ff',
                        cursor: 'pointer',
                        textAlign: 'center',
                        boxShadow: quantity === 2 ? '0 4px 12px rgba(37,99,235,0.15)' : 'none'
                      }}
                    >
                      <div style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 700 }}>2 Articles</div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1d4ed8', marginTop: '0.15rem' }}>
                        -{settings?.discount2Items !== undefined ? settings.discount2Items : 5}% de Remise
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700, marginTop: '0.1rem' }}>
                        Économisez -{settings?.discount2Items !== undefined ? settings.discount2Items : 5}%
                      </div>
                    </div>
                  )}

                  {/* Pack 3 Items + */}
                  {(settings?.discount3Items !== undefined ? settings.discount3Items : 10) > 0 && (
                    <div 
                      onClick={() => setQuantity(3)}
                      style={{
                        padding: '0.75rem 0.85rem',
                        borderRadius: '12px',
                        border: quantity >= 3 ? '2px solid #d97706' : '1px solid #fde68a',
                        background: quantity >= 3 ? '#ffffff' : '#fef3c7',
                        cursor: 'pointer',
                        textAlign: 'center',
                        boxShadow: quantity >= 3 ? '0 4px 12px rgba(217,119,6,0.15)' : 'none'
                      }}
                    >
                      <div style={{ fontSize: '0.78rem', color: '#b45309', fontWeight: 700 }}>3 Articles +</div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#d97706', marginTop: '0.15rem' }}>
                        -{settings?.discount3Items !== undefined ? settings.discount3Items : 10}% de Remise
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#b45309', fontWeight: 700, marginTop: '0.1rem' }}>
                        {product.price * 3 >= (settings?.freeShippingMinAmount || 50000) ? 'Livraison Offerte 🚚' : 'Économisez davantage'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons: Add to Cart & Share Direct Link */}
          <div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
              <button 
                className="btn btn-primary" 
                disabled={isOutOfStock}
                style={{ 
                  flex: 2, 
                  padding: '1.1rem 1.5rem', 
                  fontSize: '1.1rem', 
                  justifyContent: 'center',
                  background: isOutOfStock ? '#94a3b8' : '#0f172a',
                  cursor: isOutOfStock ? 'not-allowed' : 'pointer'
                }}
                onClick={() => !isOutOfStock && onAddToCart(product, quantity, selectedSize, selectedColor)}
              >
                <ShoppingBag size={20} /> 
                {isOutOfStock ? 'Article Épuisé' : `Ajouter au Panier • ${formatCurrency(
                  (() => {
                    let unitPrice = product.price;
                    if (settings?.enableQuantityDiscounts !== false) {
                      if (quantity === 2) {
                        const d2 = settings?.discount2Items !== undefined ? settings.discount2Items : 5;
                        unitPrice = product.price * (1 - d2 / 100);
                      } else if (quantity >= 3) {
                        const d3 = settings?.discount3Items !== undefined ? settings.discount3Items : 10;
                        unitPrice = product.price * (1 - d3 / 100);
                      }
                    }
                    return unitPrice * quantity;
                  })()
                )}`}
              </button>

              <button
                type="button"
                onClick={handleShareProduct}
                className="btn btn-secondary"
                title="Copier le lien publicitaire pour Facebook / TikTok / WhatsApp"
                style={{
                  flex: 1,
                  minWidth: '140px',
                  padding: '1.1rem 1rem',
                  fontSize: '0.95rem',
                  justifyContent: 'center',
                  background: copiedLink ? '#dcfce7' : '#f1f5f9',
                  borderColor: copiedLink ? '#86efac' : '#cbd5e1',
                  color: copiedLink ? '#15803d' : '#0f172a',
                  fontWeight: 700
                }}
              >
                {copiedLink ? <Check size={20} color="#15803d" /> : <Share2 size={20} />}
                <span>{copiedLink ? 'Lien copié !' : 'Partager'}</span>
              </button>
            </div>

            {/* Service & Delivery Guarantees */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              borderTop: '1px solid #e2e8f0',
              paddingTop: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                <Truck size={22} color="#2563eb" />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>Livraison Rapide</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>À domicile ou point relais 24/48h</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                <ShieldCheck size={22} color="#d97706" />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>Paiement Sécurisé</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Mobile Money & Carte Bancaire</div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>

      {/* CUSTOMER REVIEWS SECTION */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '2rem',
        marginBottom: '4rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h3 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Avis & Commentaires Clients ({reviews.length})
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
              Évaluations réelles des acheteurs de la communauté DamShop.
            </p>
          </div>

          <button
            className="btn btn-secondary"
            onClick={() => setShowReviewForm(!showReviewForm)}
            style={{ fontSize: '0.88rem', padding: '0.6rem 1rem' }}
          >
            <MessageSquare size={16} /> {showReviewForm ? 'Annuler' : 'Laisser un avis'}
          </button>
        </div>

        {/* Formulaire d'Avis Client */}
        {showReviewForm && (
          <form onSubmit={handleReviewSubmit} style={{
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '12px',
            padding: '1.25rem',
            marginBottom: '2rem'
          }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>Votre avis sur cet article</h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Votre Prénom / Nom *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="ex: Jean M."
                  value={newReview.userName}
                  onChange={(e) => setNewReview({ ...newReview, userName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Note globale (1 à 5 étoiles)</label>
                <select
                  className="form-select"
                  value={newReview.rating}
                  onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5/5) Excellent</option>
                  <option value={4}>⭐⭐⭐⭐ (4/5) Très Bon</option>
                  <option value={3}>⭐⭐⭐ (3/5) Moyen</option>
                  <option value={2}>⭐⭐ (2/5) Décevant</option>
                  <option value={1}>⭐ (1/5) Mauvais</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Votre commentaire *</label>
              <textarea
                className="form-textarea"
                rows="3"
                placeholder="Qualité du produit, finition, délai de livraison..."
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1.5rem', fontSize: '0.88rem' }}>
              <Send size={15} /> Publier mon avis
            </button>
          </form>
        )}

        {/* Liste des avis clients */}
        {reviews.length === 0 ? (
          <p style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.9rem' }}>
            Aucun avis pour le moment. Soyez le premier à donner votre opinion !
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reviews.map((rev, idx) => (
              <div key={idx} style={{
                padding: '1rem 1.25rem',
                borderRadius: '12px',
                background: '#f8fafc',
                border: '1px solid #f1f5f9'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>{rev.userName}</span>
                  <div style={{ display: 'flex', gap: '2px', color: '#d97706' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill={i < rev.rating ? '#d97706' : 'none'} color={i < rev.rating ? '#d97706' : '#cbd5e1'} />
                    ))}
                  </div>
                </div>
                <p style={{ fontSize: '0.88rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                  {rev.comment}
                </p>
                {rev.date && (
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.4rem', display: 'block' }}>
                    {rev.date}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SIMILAR PRODUCTS CAROUSEL / GRID */}
      {similarProducts.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Vous aimerez aussi dans cette catégorie
            </h3>
            <button className="btn btn-secondary" onClick={onBackToStore} style={{ fontSize: '0.82rem', padding: '0.5rem 0.85rem' }}>
              Voir tout
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1.5rem'
          }}>
            {similarProducts.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                categoryName={categoryObj?.name || 'Autre'}
                onAddToCart={onAddToCart}
                onQuickView={onQuickView}
                isWishlisted={wishlistIds.includes(p.id)}
                onToggleWishlist={onToggleWishlist}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
