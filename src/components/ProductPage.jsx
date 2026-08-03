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
  ChevronLeft,
  Zap,
  Sparkles,
  Lock,
  RotateCcw,
  Award,
  CreditCard,
  PhoneCall,
  Clock,
  Flame,
  Eye,
  CheckCircle2,
  Box,
  FileText,
  HelpCircle
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
  const [activeTab, setActiveTab] = useState('description'); // 'description' | 'specs' | 'reviews' | 'shipping'

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

  // Calculate delivery date estimation (2 to 4 days from now)
  const getDeliveryDateRange = () => {
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 2);
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 4);

    const options = { day: 'numeric', month: 'short' };
    return `${minDate.toLocaleDateString('fr-FR', options)} – ${maxDate.toLocaleDateString('fr-FR', options)}`;
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
  };

  const handleShareProduct = async () => {
    const shareUrl = `${window.location.origin}/?product=${product.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Xor Boutique - ${product.name}`,
          text: `Découvrez ${product.name} sur Xor Boutique : ${product.description}`,
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
          font-family: 'Hanken Grotesk', system-ui, sans-serif;
        }
        .product-showcase-panel {
          width: 100%;
          background: #ffffff;
          border-radius: 24px;
          padding: 2.5rem;
          box-shadow: 0 20px 60px rgba(15, 23, 42, 0.05);
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
          height: 540px;
          border-radius: 20px;
          overflow: hidden;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          box-shadow: 0 12px 35px rgba(15, 23, 42, 0.06);
          margin-bottom: 1.5rem;
        }
        .image-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid #e2e8f0;
          display: flex;
          alignItems: center;
          justifyContent: center;
          cursor: pointer;
          color: #0f172a;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.15);
          transition: all 0.2s ease;
          z-index: 5;
        }
        .image-nav-btn:hover {
          background: #0f172a;
          color: #ffffff;
          border-color: #0f172a;
        }
        .product-tab-btn {
          padding: 0.85rem 1.5rem;
          font-weight: 700;
          font-size: 0.95rem;
          color: #64748b;
          border: none;
          background: transparent;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all 0.2s ease;
        }
        .product-tab-btn.active {
          color: #0f172a;
          border-bottom-color: #2563eb;
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
            height: 380px;
          }
        }
      `}</style>
      
      {/* Top Navigation & Breadcrumb Bar */}
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
          <span style={{ color: '#64748b', fontWeight: 500, maxWidth: '350px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {product.name}
          </span>
        </div>
      </div>

      {/* MAIN SHOWCASE PANEL */}
      <div className="product-showcase-panel glass-panel">
        <div className="product-showcase-grid">
          
          {/* LEFT COLUMN: Gallery & Main Image Display */}
          <div>
            <div className="product-main-image-box">
              <img 
                src={currentImage} 
                alt={product.name} 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />

              {/* Navigation Arrows for Carousel */}
              {productImages.length > 1 && (
                <>
                  <button 
                    onClick={handlePrevImage} 
                    className="image-nav-btn" 
                    style={{ left: '16px' }}
                    title="Photo précédente"
                  >
                    <ChevronLeft size={22} />
                  </button>

                  <button 
                    onClick={handleNextImage} 
                    className="image-nav-btn" 
                    style={{ right: '16px' }}
                    title="Photo suivante"
                  >
                    <ChevronRight size={22} />
                  </button>
                </>
              )}

              {/* Scarcity & Discount Badges Top-Left */}
              <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', flexDirection: 'column', gap: '0.5rem', zIndex: 4 }}>
                {isOutOfStock ? (
                  <span className="badge" style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', padding: '0.4rem 0.85rem', fontSize: '0.85rem', borderRadius: '20px', fontWeight: 800 }}>
                    🚫 Rupture de Stock
                  </span>
                ) : isLowStock ? (
                  <span className="badge" style={{ background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3', padding: '0.4rem 0.85rem', fontSize: '0.85rem', borderRadius: '20px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Flame size={15} fill="#e11d48" color="#e11d48" /> Plus que {product.stock} dispo !
                  </span>
                ) : (
                  <span className="badge badge-success" style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem', borderRadius: '20px', fontWeight: 800 }}>
                    ✓ En Stock ({product.stock})
                  </span>
                )}

                {discountPercent > 0 && (
                  <span className="badge" style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '0.4rem 0.85rem', fontSize: '0.85rem', borderRadius: '20px', fontWeight: 800 }}>
                    🔥 Économisez -{discountPercent}%
                  </span>
                )}
              </div>

              {/* Wishlist Floating Button Top-Right */}
              <button
                onClick={() => onToggleWishlist(product.id)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: isWishlisted ? '#fce7f3' : 'rgba(255, 255, 255, 0.95)',
                  border: isWishlisted ? '1px solid #f472b6' : '1px solid #cbd5e1',
                  borderRadius: '50%',
                  width: '46px',
                  height: '46px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(15, 23, 42, 0.12)',
                  zIndex: 4,
                  transition: 'all 0.2s ease'
                }}
                title={isWishlisted ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              >
                <Heart size={22} fill={isWishlisted ? '#ec4899' : 'none'} color={isWishlisted ? '#ec4899' : '#0f172a'} />
              </button>
            </div>

            {/* Gallery Thumbnails Below Image */}
            {productImages.length > 1 && (
              <div style={{ display: 'flex', gap: '0.85rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {productImages.slice(0, 4).map((img, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    style={{
                      width: '85px',
                      height: '85px',
                      borderRadius: '14px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: activeImageIndex === idx ? '3px solid #2563eb' : '1px solid #cbd5e1',
                      opacity: activeImageIndex === idx ? 1 : 0.75,
                      transition: 'all 0.2s ease',
                      flexShrink: 0,
                      position: 'relative'
                    }}
                  >
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}

                {productImages.length > 4 && (
                  <div 
                    onClick={() => setActiveImageIndex(4)}
                    style={{
                      width: '85px',
                      height: '85px',
                      borderRadius: '14px',
                      background: '#0f172a',
                      color: '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      flexShrink: 0
                    }}
                  >
                    <span>+{productImages.length - 4}</span>
                    <span style={{ fontSize: '0.68rem', opacity: 0.8 }}>Plus</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Product Information & Purchasing */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              
              {/* Product Title */}
              <h1 className="font-display" style={{
                fontSize: '2.3rem',
                fontWeight: 800,
                color: '#0f172a',
                lineHeight: 1.2,
                marginBottom: '0.75rem',
                letterSpacing: '-0.02em'
              }}>
                {product.name}
              </h1>

              {/* Rating & Social Proof Viewers Bar */}
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#d97706', fontWeight: 800, fontSize: '0.95rem' }}>
                  <div style={{ display: 'flex' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={17} fill={i < Math.floor(product.rating || 5) ? '#d97706' : '#cbd5e1'} color={i < Math.floor(product.rating || 5) ? '#d97706' : '#cbd5e1'} />
                    ))}
                  </div>
                  <span>{product.rating || 5.0}</span>
                  <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 500 }}>({reviews.length} avis)</span>
                </div>

                <div style={{ height: '14px', width: '1px', background: '#cbd5e1' }} className="hide-mobile" />

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                  <Eye size={16} color="#2563eb" />
                  <span>18 clients consultent cette fiche en ce moment</span>
                </div>
              </div>

              {/* Pricing Showcase Box */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                marginBottom: '1.5rem',
                padding: '1.1rem 1.35rem',
                background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
                borderRadius: '16px',
                border: '1px solid #e2e8f0'
              }}>
                <span className="font-mono" style={{ fontSize: '2.15rem', fontWeight: 900, color: '#0f172a' }}>
                  {formatCurrency(product.price * quantity)}
                </span>

                {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                  <span className="font-mono" style={{ fontSize: '1.15rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                    {formatCurrency(product.originalPrice * quantity)}
                  </span>
                )}

                {discountPercent > 0 && (
                  <span className="badge" style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', fontWeight: 800, padding: '0.3rem 0.75rem', fontSize: '0.82rem' }}>
                    Économisez {discountPercent}%
                  </span>
                )}
              </div>

              {/* Key Features Bullet Points Checklist */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.75rem', padding: '1rem 1.25rem', background: '#f8fafc', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', color: '#0f172a', fontWeight: 700 }}>
                  <CheckCircle2 size={18} color="#10b981" />
                  <span>Produit 100% Authentique & Garanti Xor Boutique</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', color: '#0f172a', fontWeight: 700 }}>
                  <CheckCircle2 size={18} color="#10b981" />
                  <span>Livraison Rapide à domicile & en Point Relais</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', color: '#0f172a', fontWeight: 700 }}>
                  <CheckCircle2 size={18} color="#10b981" />
                  <span>Paiement Sécurisé à la livraison ou Mobile Money</span>
                </div>
              </div>

              {/* Options Selectors (Sizes & Colors if available) */}
              {product.sizes && product.sizes.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label" style={{ fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem', display: 'block' }}>
                    Taille :
                  </label>
                  <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                    {product.sizes.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedSize(s)}
                        style={{
                          padding: '0.55rem 1.1rem',
                          borderRadius: '10px',
                          border: selectedSize === s ? '2px solid #0f172a' : '1px solid #cbd5e1',
                          background: selectedSize === s ? '#0f172a' : '#ffffff',
                          color: selectedSize === s ? '#ffffff' : '#0f172a',
                          fontWeight: selectedSize === s ? 800 : 600,
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
                  <label className="form-label" style={{ fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem', display: 'block' }}>
                    Couleur :
                  </label>
                  <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                    {product.colors.map((c, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedColor(c)}
                        style={{
                          padding: '0.55rem 1.1rem',
                          borderRadius: '10px',
                          border: selectedColor === c ? '2px solid #2563eb' : '1px solid #cbd5e1',
                          background: selectedColor === c ? '#eff6ff' : '#ffffff',
                          color: selectedColor === c ? '#1d4ed8' : '#0f172a',
                          fontWeight: selectedColor === c ? 800 : 600,
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.75rem' }}>
                <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>Quantité :</span>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '12px', background: '#ffffff', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{ background: 'none', border: 'none', color: '#0f172a', padding: '0.6rem 1.1rem', cursor: 'pointer', fontWeight: 900, fontSize: '1.2rem' }}
                  >
                    -
                  </button>
                  <span className="font-mono" style={{ padding: '0 1rem', fontWeight: 900, fontSize: '1.15rem', color: '#0f172a' }}>{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    style={{ background: 'none', border: 'none', color: '#0f172a', padding: '0.6rem 1.1rem', cursor: 'pointer', fontWeight: 900, fontSize: '1.2rem' }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* PRIMARY ACTION BUTTONS: Acheter Maintenant & Ajouter au Panier */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.75rem' }}>
                
                {/* Buy Now Button (Acheter Maintenant) */}
                <button 
                  className="btn"
                  disabled={isOutOfStock}
                  style={{ 
                    width: '100%', 
                    padding: '1.15rem 1.5rem', 
                    fontSize: '1.1rem', 
                    fontWeight: 800,
                    borderRadius: '14px',
                    justifyContent: 'center',
                    background: isOutOfStock ? '#94a3b8' : '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    boxShadow: isOutOfStock ? 'none' : '0 8px 24px rgba(16, 185, 129, 0.25)',
                    cursor: isOutOfStock ? 'not-allowed' : 'pointer'
                  }}
                  onClick={() => {
                    if (!isOutOfStock) {
                      onAddToCart(product, quantity, selectedSize, selectedColor);
                    }
                  }}
                >
                  <Zap size={22} color="#ffffff" fill="#ffffff" /> 
                  {isOutOfStock ? 'Article Épuisé' : 'Acheter Maintenant (Commande Express)'}
                </button>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {/* Add to Cart Button */}
                  <button 
                    className="btn btn-primary" 
                    disabled={isOutOfStock}
                    style={{ 
                      flex: 2, 
                      padding: '1rem 1.25rem', 
                      fontSize: '1rem', 
                      borderRadius: '14px',
                      justifyContent: 'center',
                      background: isOutOfStock ? '#94a3b8' : '#0f172a',
                      cursor: isOutOfStock ? 'not-allowed' : 'pointer'
                    }}
                    onClick={() => !isOutOfStock && onAddToCart(product, quantity, selectedSize, selectedColor)}
                  >
                    <ShoppingBag size={19} /> 
                    {isOutOfStock ? 'Épuisé' : 'Ajouter au Panier'}
                  </button>

                  {/* Share Link Button */}
                  <button
                    type="button"
                    onClick={handleShareProduct}
                    className="btn btn-secondary"
                    title="Partager ou copier le lien direct"
                    style={{
                      flex: 1,
                      padding: '1rem 1rem',
                      fontSize: '0.9rem',
                      borderRadius: '14px',
                      justifyContent: 'center',
                      background: copiedLink ? '#dcfce7' : '#ffffff',
                      borderColor: copiedLink ? '#86efac' : '#cbd5e1',
                      color: copiedLink ? '#15803d' : '#0f172a',
                      fontWeight: 700
                    }}
                  >
                    {copiedLink ? <Check size={19} color="#15803d" /> : <Share2 size={19} />}
                    <span>{copiedLink ? 'Copié !' : 'Partager'}</span>
                  </button>
                </div>
              </div>

              {/* Delivery Estimation & Trust Card */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '1.25rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem', color: '#0f172a', fontWeight: 800, fontSize: '0.92rem' }}>
                  <Truck size={20} color="#2563eb" />
                  <span>Estimation de Livraison : {getDeliveryDateRange()}</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1rem', paddingLeft: '1.8rem' }}>
                  Livraison gratuite à partir de 50.000 FCFA d'achat.
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.85rem', textAlign: 'center' }}>
                  <div>
                    <Lock size={18} color="#0f172a" style={{ margin: '0 auto 0.25rem auto' }} />
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0f172a' }}>Paiement Sécurisé</div>
                    <div style={{ fontSize: '0.68rem', color: '#64748b' }}>100% protégé</div>
                  </div>
                  <div>
                    <RotateCcw size={18} color="#0f172a" style={{ margin: '0 auto 0.25rem auto' }} />
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0f172a' }}>Retours Faciles</div>
                    <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Garantie 30 jours</div>
                  </div>
                  <div>
                    <Award size={18} color="#0f172a" style={{ margin: '0 auto 0.25rem auto' }} />
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0f172a' }}>Qualité Assurée</div>
                    <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Article Certifié</div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* TABS SECTION: Description | Spécifications | Avis Clients | Livraison & Retours */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '20px',
        padding: '2rem',
        marginBottom: '4rem',
        boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)'
      }}>
        {/* Tab Headers */}
        <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', gap: '0.5rem', overflowX: 'auto', marginBottom: '2rem' }}>
          <button 
            className={`product-tab-btn ${activeTab === 'description' ? 'active' : ''}`}
            onClick={() => setActiveTab('description')}
          >
            Description du Produit
          </button>

          <button 
            className={`product-tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
            onClick={() => setActiveTab('specs')}
          >
            Spécifications & Détails
          </button>

          <button 
            className={`product-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Avis Clients ({reviews.length})
          </button>

          <button 
            className={`product-tab-btn ${activeTab === 'shipping' ? 'active' : ''}`}
            onClick={() => setActiveTab('shipping')}
          >
            Livraison & Retours
          </button>
        </div>

        {/* TAB 1: DESCRIPTION */}
        {activeTab === 'description' && (
          <div className="animate-fade-in" style={{ color: '#475569', lineHeight: 1.8, fontSize: '1rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
              À propos de {product.name}
            </h3>
            <p style={{ marginBottom: '1.5rem' }}>
              {product.description || "Découvrez ce produit d'exception sélectionné par Xor Boutique. Alliant qualité supérieure, design moderne et confort d'utilisation, cet article saura répondre à toutes vos exigences au quotidien."}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginTop: '2rem' }}>
              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <Sparkles size={22} color="#2563eb" style={{ marginBottom: '0.5rem' }} />
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>Design & Finition Luxe</h4>
                <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0 }}>Conçu avec des matériaux soigneusement sélectionnés pour durer.</p>
              </div>

              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <ShieldCheck size={22} color="#10b981" style={{ marginBottom: '0.5rem' }} />
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>Garantie Authentique</h4>
                <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0 }}>Chaque pièce est vérifiée individuellement avant expédition.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SPECIFICATIONS */}
        {activeTab === 'specs' && (
          <div className="animate-fade-in">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
              Caractéristiques Techniques
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.92rem' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#0f172a', width: '30%', background: '#f8fafc' }}>Référence Produit</td>
                  <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>{product.id}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#0f172a', background: '#f8fafc' }}>Catégorie</td>
                  <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>{categoryObj?.name || 'Général'}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#0f172a', background: '#f8fafc' }}>Tailles disponibles</td>
                  <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>{product.sizes?.join(', ') || 'Taille Unique'}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#0f172a', background: '#f8fafc' }}>Couleurs proposées</td>
                  <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>{product.colors?.join(', ') || 'Couleur Standard'}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#0f172a', background: '#f8fafc' }}>Stock disponible</td>
                  <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>{product.stock} unité(s) en stock</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#0f172a', background: '#f8fafc' }}>Garantie & Support</td>
                  <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>Garantie Xor Boutique & Support Clients 24/7</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Avis & Évaluations des Acheteurs ({reviews.length})
                </h3>
              </div>

              <button
                className="btn btn-secondary"
                onClick={() => setShowReviewForm(!showReviewForm)}
                style={{ fontSize: '0.88rem', padding: '0.6rem 1.1rem' }}
              >
                <MessageSquare size={16} /> {showReviewForm ? 'Fermer le formulaire' : 'Rédiger un avis'}
              </button>
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <form onSubmit={handleReviewSubmit} style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#0f172a', fontWeight: 800 }}>Donnez votre avis sur cet article</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label className="form-label">Votre Nom & Prénom</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Ex: Marc Koffi" 
                      value={newReview.userName}
                      onChange={e => setNewReview({ ...newReview, userName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Note globale (sur 5 étoiles)</label>
                    <select 
                      className="form-select"
                      value={newReview.rating}
                      onChange={e => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                    >
                      <option value="5">⭐⭐⭐⭐⭐ 5/5 (Excellent)</option>
                      <option value="4">⭐⭐⭐⭐ 4/5 (Très Bon)</option>
                      <option value="3">⭐⭐⭐ 3/5 (Moyen)</option>
                      <option value="2">⭐⭐ 2/5 (Passable)</option>
                      <option value="1">⭐ 1/5 (Décevant)</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Votre avis détaillé</label>
                  <textarea 
                    className="form-textarea" 
                    rows="3" 
                    placeholder="Partagez votre expérience d'utilisation..." 
                    value={newReview.comment}
                    onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1.5rem' }}>
                  <Send size={16} /> Publier mon Avis
                </button>
              </form>
            )}

            {/* Reviews List */}
            {reviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                <MessageSquare size={36} color="#cbd5e1" style={{ margin: '0 auto 0.5rem auto' }} />
                <p>Aucun avis pour le moment. Soyez le premier à donner votre avis !</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {reviews.map(r => (
                  <div key={r.id} style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '14px', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>{r.userName}</div>
                      <div style={{ display: 'flex', gap: '0.15rem' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} fill={i < r.rating ? '#d97706' : '#cbd5e1'} color={i < r.rating ? '#d97706' : '#cbd5e1'} />
                        ))}
                      </div>
                    </div>
                    <p style={{ color: '#475569', margin: 0, fontSize: '0.9rem', lineHeight: 1.6 }}>{r.comment}</p>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.4rem' }}>Achat Vérifié Xor Boutique</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SHIPPING & RETURNS */}
        {activeTab === 'shipping' && (
          <div className="animate-fade-in" style={{ color: '#475569', lineHeight: 1.8, fontSize: '0.95rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem' }}>
              Politique de Livraison & Retours
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <Truck size={24} color="#2563eb" style={{ marginBottom: '0.5rem' }} />
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0' }}>Modes de Livraison</h4>
                <p style={{ margin: 0 }}>Livraison rapide à domicile sous 24h à 48h. Possibilité de retrait gratuit en point relais partenaire.</p>
              </div>

              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <RotateCcw size={24} color="#10b981" style={{ marginBottom: '0.5rem' }} />
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0' }}>Garantie Retour 30 Jours</h4>
                <p style={{ margin: 0 }}>Si le produit ne convient pas ou présente un défaut, vous disposez de 30 jours pour l'échanger ou obtenir un remboursement.</p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* BOTTOM TRUST & REASSURANCE BANNER */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '4rem',
        padding: '2rem 1.5rem',
        background: '#f8fafc',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        textAlign: 'center'
      }}>
        <div>
          <Truck size={28} color="#2563eb" style={{ margin: '0 auto 0.5rem auto' }} />
          <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>Livraison Rapide</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Expédition sous 24/48h</div>
        </div>

        <div>
          <RotateCcw size={28} color="#10b981" style={{ margin: '0 auto 0.5rem auto' }} />
          <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>Retours Faciles</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Politique retour 30 jours</div>
        </div>

        <div>
          <Lock size={28} color="#d97706" style={{ margin: '0 auto 0.5rem auto' }} />
          <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>Paiement Sécurisé</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>100% protégé & vérifié</div>
        </div>

        <div>
          <PhoneCall size={28} color="#8b5cf6" style={{ margin: '0 auto 0.5rem auto' }} />
          <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>Support Client 24/7</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Assistance WhatsApp & Tél</div>
        </div>
      </div>

      {/* SIMILAR PRODUCTS SECTION */}
      {similarProducts.length > 0 && (
        <div>
          <h3 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>
            Vous aimerez aussi (Articles Similaires)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {similarProducts.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                categories={categories}
                wishlistIds={wishlistIds}
                onAddToCart={onAddToCart}
                onQuickView={onQuickView}
                onToggleWishlist={onToggleWishlist}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
