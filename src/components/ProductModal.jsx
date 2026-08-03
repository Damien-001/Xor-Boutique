import React, { useState } from 'react';
import { 
  X, 
  Star, 
  ShoppingBag, 
  ShieldCheck, 
  Truck, 
  MessageSquare, 
  Send, 
  Share2, 
  Check, 
  Heart,
  ChevronLeft,
  ChevronRight,
  Zap,
  Flame,
  Eye,
  CheckCircle2,
  Lock,
  RotateCcw,
  Award,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { formatCurrency, getReviews, addReview } from '../services/store';

export default function ProductModal({ product, categories, settings, onClose, onAddToCart, wishlistIds = [], onToggleWishlist }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || 'Unique');
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || 'Standard');

  // Reviews state
  const [reviews, setReviews] = useState(getReviews(product?.id));
  const [newReview, setNewReview] = useState({ userName: '', rating: 5, comment: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState('description'); // 'description' | 'specs' | 'reviews' | 'shipping'

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
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.72)',
      backdropFilter: 'blur(10px)',
      zIndex: 300,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      boxSizing: 'border-box'
    }} onClick={onClose}>
      
      <div className="glass-panel animate-fade-in" style={{
        maxWidth: '1060px',
        width: '100%',
        maxHeight: '92vh',
        overflowY: 'auto',
        position: 'relative',
        padding: '2rem',
        background: '#ffffff',
        borderColor: '#cbd5e1',
        borderRadius: '24px',
        boxShadow: '0 25px 70px rgba(15, 23, 42, 0.25)',
        boxSizing: 'border-box',
        fontFamily: "'Hanken Grotesk', system-ui, sans-serif"
      }} onClick={(e) => e.stopPropagation()}>

        <style>{`
          .modal-tab-btn {
            padding: 0.75rem 1.25rem;
            font-weight: 700;
            font-size: 0.9rem;
            color: #64748b;
            border: none;
            background: transparent;
            cursor: pointer;
            border-bottom: 3px solid transparent;
            transition: all 0.2s ease;
          }
          .modal-tab-btn.active {
            color: #0f172a;
            border-bottom-color: #2563eb;
          }
          .modal-image-nav-btn {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            width: 38px;
            height: 38px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.92);
            border: 1px solid #e2e8f0;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: #0f172a;
            box-shadow: 0 4px 14px rgba(15, 23, 42, 0.15);
            transition: all 0.2s ease;
            z-index: 5;
          }
          .modal-image-nav-btn:hover {
            background: #0f172a;
            color: #ffffff;
          }
        `}</style>

        {/* Close Button Top Right */}
        <button 
          onClick={onClose}
          title="Fermer"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: '#f1f5f9',
            border: '1px solid #cbd5e1',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0f172a',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.1)',
            zIndex: 10,
            transition: 'all 0.2s ease'
          }}
        >
          <X size={20} />
        </button>

        {/* MAIN PRODUCT SHOWCASE GRID */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2.5rem',
          alignItems: 'start',
          marginBottom: '2.5rem'
        }}>

          {/* LEFT COLUMN: Gallery & Main Image Display */}
          <div>
            <div style={{
              position: 'relative',
              width: '100%',
              height: '440px',
              borderRadius: '20px',
              overflow: 'hidden',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
              marginBottom: '1.25rem'
            }}>
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

              {/* Navigation Arrows */}
              {productImages.length > 1 && (
                <>
                  <button onClick={handlePrevImage} className="modal-image-nav-btn" style={{ left: '12px' }} title="Photo précédente">
                    <ChevronLeft size={20} />
                  </button>

                  <button onClick={handleNextImage} className="modal-image-nav-btn" style={{ right: '12px' }} title="Photo suivante">
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              {/* Badges Top-Left */}
              <div style={{ position: 'absolute', top: '14px', left: '14px', display: 'flex', flexDirection: 'column', gap: '0.4rem', zIndex: 4 }}>
                {isOutOfStock ? (
                  <span className="badge" style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: '20px', fontWeight: 800 }}>
                    🚫 Rupture de Stock
                  </span>
                ) : isLowStock ? (
                  <span className="badge" style={{ background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3', padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: '20px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Flame size={14} fill="#e11d48" color="#e11d48" /> Plus que {product.stock} dispo !
                  </span>
                ) : (
                  <span className="badge badge-success" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: '20px', fontWeight: 800 }}>
                    ✓ En Stock ({product.stock})
                  </span>
                )}

                {discountPercent > 0 && (
                  <span className="badge" style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: '20px', fontWeight: 800 }}>
                    🔥 -{discountPercent}%
                  </span>
                )}
              </div>

              {/* Wishlist Button Top-Right */}
              {onToggleWishlist && (
                <button
                  onClick={() => onToggleWishlist(product.id)}
                  style={{
                    position: 'absolute',
                    top: '14px',
                    right: '14px',
                    background: isWishlisted ? '#fce7f3' : 'rgba(255, 255, 255, 0.95)',
                    border: isWishlisted ? '1px solid #f472b6' : '1px solid #cbd5e1',
                    borderRadius: '50%',
                    width: '42px',
                    height: '42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.12)',
                    zIndex: 4
                  }}
                  title={isWishlisted ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                >
                  <Heart size={20} fill={isWishlisted ? '#ec4899' : 'none'} color={isWishlisted ? '#ec4899' : '#0f172a'} />
                </button>
              )}
            </div>

            {/* Gallery Thumbnails */}
            {productImages.length > 1 && (
              <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.4rem' }}>
                {productImages.slice(0, 4).map((img, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    style={{
                      width: '75px',
                      height: '75px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: activeImageIndex === idx ? '3px solid #2563eb' : '1px solid #cbd5e1',
                      opacity: activeImageIndex === idx ? 1 : 0.75,
                      flexShrink: 0
                    }}
                  >
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}

                {productImages.length > 4 && (
                  <div 
                    onClick={() => setActiveImageIndex(4)}
                    style={{
                      width: '75px',
                      height: '75px',
                      borderRadius: '12px',
                      background: '#0f172a',
                      color: '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      flexShrink: 0
                    }}
                  >
                    <span>+{productImages.length - 4}</span>
                    <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>Plus</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Product Information & Purchase Controls */}
          <div>
            <span className="font-mono" style={{ fontSize: '0.78rem', color: '#2563eb', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>
              {categoryObj?.name || 'Xor Boutique Collection'}
            </span>

            <h2 className="font-display" style={{
              fontSize: '1.85rem',
              fontWeight: 800,
              color: '#0f172a',
              lineHeight: 1.25,
              margin: '0.35rem 0 0.75rem 0'
            }}>
              {product.name}
            </h2>

            {/* Rating & Social Proof */}
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#d97706', fontWeight: 800, fontSize: '0.9rem' }}>
                <div style={{ display: 'flex' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={15} fill={i < Math.floor(product.rating || 5) ? '#d97706' : '#cbd5e1'} color={i < Math.floor(product.rating || 5) ? '#d97706' : '#cbd5e1'} />
                  ))}
                </div>
                <span>{product.rating || 5.0}</span>
                <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 500 }}>({reviews.length} avis)</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                <Eye size={15} color="#2563eb" />
                <span>18 clients consultent ce produit</span>
              </div>
            </div>

            {/* Pricing Box */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.85rem',
              marginBottom: '1.25rem',
              padding: '0.95rem 1.15rem',
              background: '#f8fafc',
              borderRadius: '14px',
              border: '1px solid #e2e8f0'
            }}>
              <span className="font-mono" style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a' }}>
                {formatCurrency(product.price * quantity)}
              </span>

              {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                <span className="font-mono" style={{ fontSize: '1rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                  {formatCurrency(product.originalPrice * quantity)}
                </span>
              )}

              {discountPercent > 0 && (
                <span className="badge" style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', fontWeight: 800, padding: '0.25rem 0.6rem', fontSize: '0.78rem' }}>
                  Économisez {discountPercent}%
                </span>
              )}
            </div>

            {/* Feature Bullets Checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '1.25rem', padding: '0.85rem 1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#0f172a', fontWeight: 700 }}>
                <CheckCircle2 size={16} color="#10b981" />
                <span>Produit 100% Authentique & Garanti Xor Boutique</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#0f172a', fontWeight: 700 }}>
                <CheckCircle2 size={16} color="#10b981" />
                <span>Expédition Rapide à domicile sous 24/48h</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#0f172a', fontWeight: 700 }}>
                <CheckCircle2 size={16} color="#10b981" />
                <span>Paiement Sécurisé Cash ou Mobile Money</span>
              </div>
            </div>

            {/* Options Selectors (Sizes & Colors if available) */}
            {product.sizes && product.sizes.length > 0 && (
              <div style={{ marginBottom: '1.15rem' }}>
                <label className="form-label" style={{ fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem', fontSize: '0.85rem', display: 'block' }}>
                  Taille :
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {product.sizes.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedSize(s)}
                      style={{
                        padding: '0.45rem 0.95rem',
                        borderRadius: '8px',
                        border: selectedSize === s ? '2px solid #0f172a' : '1px solid #cbd5e1',
                        background: selectedSize === s ? '#0f172a' : '#ffffff',
                        color: selectedSize === s ? '#ffffff' : '#0f172a',
                        fontWeight: selectedSize === s ? 800 : 600,
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.colors && product.colors.length > 0 && (
              <div style={{ marginBottom: '1.15rem' }}>
                <label className="form-label" style={{ fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem', fontSize: '0.85rem', display: 'block' }}>
                  Couleur :
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {product.colors.map((c, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      style={{
                        padding: '0.45rem 0.95rem',
                        borderRadius: '8px',
                        border: selectedColor === c ? '2px solid #2563eb' : '1px solid #cbd5e1',
                        background: selectedColor === c ? '#eff6ff' : '#ffffff',
                        color: selectedColor === c ? '#1d4ed8' : '#0f172a',
                        fontWeight: selectedColor === c ? 800 : 600,
                        fontSize: '0.85rem',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.35rem' }}>
              <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>Quantité :</span>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '10px', background: '#ffffff' }}>
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ background: 'none', border: 'none', color: '#0f172a', padding: '0.5rem 0.95rem', cursor: 'pointer', fontWeight: 900, fontSize: '1.1rem' }}
                >
                  -
                </button>
                <span className="font-mono" style={{ padding: '0 0.85rem', fontWeight: 900, fontSize: '1.05rem', color: '#0f172a' }}>{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  style={{ background: 'none', border: 'none', color: '#0f172a', padding: '0.5rem 0.95rem', cursor: 'pointer', fontWeight: 900, fontSize: '1.1rem' }}
                >
                  +
                </button>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.35rem' }}>
              
              {/* Buy Now Button */}
              <button 
                className="btn"
                disabled={isOutOfStock}
                style={{ 
                  width: '100%', 
                  padding: '1rem 1.25rem', 
                  fontSize: '1.05rem', 
                  fontWeight: 800,
                  borderRadius: '12px',
                  justifyContent: 'center',
                  background: isOutOfStock ? '#94a3b8' : '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  boxShadow: isOutOfStock ? 'none' : '0 6px 20px rgba(16, 185, 129, 0.25)',
                  cursor: isOutOfStock ? 'not-allowed' : 'pointer'
                }}
                onClick={() => {
                  if (!isOutOfStock) {
                    onAddToCart(product, quantity, selectedSize, selectedColor);
                    onClose();
                  }
                }}
              >
                <Zap size={20} color="#ffffff" fill="#ffffff" /> 
                {isOutOfStock ? 'Article Épuisé' : 'Acheter Maintenant (Commande Express)'}
              </button>

              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <button 
                  className="btn btn-primary" 
                  disabled={isOutOfStock}
                  style={{ 
                    flex: 2, 
                    padding: '0.85rem 1.15rem', 
                    fontSize: '0.95rem', 
                    borderRadius: '12px',
                    justifyContent: 'center',
                    background: isOutOfStock ? '#94a3b8' : '#0f172a',
                    cursor: isOutOfStock ? 'not-allowed' : 'pointer'
                  }}
                  onClick={() => {
                    if (!isOutOfStock) {
                      onAddToCart(product, quantity, selectedSize, selectedColor);
                      onClose();
                    }
                  }}
                >
                  <ShoppingBag size={18} /> 
                  {isOutOfStock ? 'Épuisé' : 'Ajouter au Panier'}
                </button>

                <button
                  type="button"
                  onClick={handleShareProduct}
                  className="btn btn-secondary"
                  title="Partager ou copier le lien direct"
                  style={{
                    flex: 1,
                    padding: '0.85rem 0.85rem',
                    fontSize: '0.85rem',
                    borderRadius: '12px',
                    justifyContent: 'center',
                    background: copiedLink ? '#dcfce7' : '#ffffff',
                    borderColor: copiedLink ? '#86efac' : '#cbd5e1',
                    color: copiedLink ? '#15803d' : '#0f172a',
                    fontWeight: 700
                  }}
                >
                  {copiedLink ? <Check size={18} color="#15803d" /> : <Share2 size={18} />}
                  <span>{copiedLink ? 'Copié !' : 'Partager'}</span>
                </button>
              </div>
            </div>

            {/* Delivery Estimation Card */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a', fontWeight: 800, fontSize: '0.85rem' }}>
                <Truck size={18} color="#2563eb" />
                <span>Livraison Estimée : {getDeliveryDateRange()}</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem', paddingLeft: '1.5rem' }}>
                Livraison offerte dès 50.000 FCFA d'achat.
              </div>
            </div>

          </div>

        </div>

        {/* TABS SECTION: Description | Spécifications | Avis Clients | Livraison & Retours */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          {/* Tab Headers */}
          <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', gap: '0.5rem', overflowX: 'auto', marginBottom: '1.5rem' }}>
            <button 
              className={`modal-tab-btn ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>

            <button 
              className={`modal-tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
              onClick={() => setActiveTab('specs')}
            >
              Spécifications
            </button>

            <button 
              className={`modal-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Avis ({reviews.length})
            </button>

            <button 
              className={`modal-tab-btn ${activeTab === 'shipping' ? 'active' : ''}`}
              onClick={() => setActiveTab('shipping')}
            >
              Livraison
            </button>
          </div>

          {/* TAB 1: DESCRIPTION */}
          {activeTab === 'description' && (
            <div className="animate-fade-in" style={{ color: '#475569', lineHeight: 1.7, fontSize: '0.92rem' }}>
              <p style={{ margin: 0 }}>
                {product.description || "Découvrez ce produit d'exception sélectionné par Xor Boutique. Alliant qualité supérieure, design moderne et confort d'utilisation, cet article saura répondre à toutes vos exigences au quotidien."}
              </p>
            </div>
          )}

          {/* TAB 2: SPECIFICATIONS */}
          {activeTab === 'specs' && (
            <div className="animate-fade-in">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.65rem 0.85rem', fontWeight: 700, color: '#0f172a', width: '35%', background: '#f8fafc' }}>Référence</td>
                    <td style={{ padding: '0.65rem 0.85rem', color: '#475569' }}>{product.id}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.65rem 0.85rem', fontWeight: 700, color: '#0f172a', background: '#f8fafc' }}>Catégorie</td>
                    <td style={{ padding: '0.65rem 0.85rem', color: '#475569' }}>{categoryObj?.name || 'Général'}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.65rem 0.85rem', fontWeight: 700, color: '#0f172a', background: '#f8fafc' }}>Tailles</td>
                    <td style={{ padding: '0.65rem 0.85rem', color: '#475569' }}>{product.sizes?.join(', ') || 'Unique'}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.65rem 0.85rem', fontWeight: 700, color: '#0f172a', background: '#f8fafc' }}>Couleurs</td>
                    <td style={{ padding: '0.65rem 0.85rem', color: '#475569' }}>{product.colors?.join(', ') || 'Standard'}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.65rem 0.85rem', fontWeight: 700, color: '#0f172a', background: '#f8fafc' }}>Stock</td>
                    <td style={{ padding: '0.65rem 0.85rem', color: '#475569' }}>{product.stock} unité(s)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, color: '#0f172a', fontWeight: 800, fontSize: '0.95rem' }}>
                  Avis Clients ({reviews.length})
                </h4>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
                >
                  <MessageSquare size={14} /> {showReviewForm ? 'Fermer' : 'Laisser un avis'}
                </button>
              </div>

              {/* Review Form */}
              {showReviewForm && (
                <form onSubmit={handleReviewSubmit} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', marginBottom: '1.25rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Votre Nom</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="Ex: Marc Koffi" 
                        value={newReview.userName}
                        onChange={e => setNewReview({ ...newReview, userName: e.target.value })}
                        required
                        style={{ fontSize: '0.85rem', padding: '0.45rem' }}
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.8rem' }}>Note</label>
                      <select 
                        className="form-select"
                        value={newReview.rating}
                        onChange={e => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                        style={{ fontSize: '0.85rem', padding: '0.45rem' }}
                      >
                        <option value="5">⭐⭐⭐⭐⭐ 5/5</option>
                        <option value="4">⭐⭐⭐⭐ 4/5</option>
                        <option value="3">⭐⭐⭐ 3/5</option>
                        <option value="2">⭐⭐ 2/5</option>
                        <option value="1">⭐ 1/5</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: '0.75rem' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Votre avis</label>
                    <textarea 
                      className="form-textarea" 
                      rows="2" 
                      placeholder="Votre avis..." 
                      value={newReview.comment}
                      onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                      required
                      style={{ fontSize: '0.85rem', padding: '0.45rem' }}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1.15rem', fontSize: '0.85rem' }}>
                    <Send size={14} /> Publier
                  </button>
                </form>
              )}

              {/* Reviews List */}
              {reviews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b', fontSize: '0.88rem' }}>
                  Aucun avis pour le moment.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {reviews.map(r => (
                    <div key={r.id} style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>{r.userName}</div>
                        <div style={{ display: 'flex', gap: '0.1rem' }}>
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={13} fill={i < r.rating ? '#d97706' : '#cbd5e1'} color={i < r.rating ? '#d97706' : '#cbd5e1'} />
                          ))}
                        </div>
                      </div>
                      <p style={{ color: '#475569', margin: 0, fontSize: '0.85rem', lineHeight: 1.5 }}>{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SHIPPING */}
          {activeTab === 'shipping' && (
            <div className="animate-fade-in" style={{ color: '#475569', lineHeight: 1.6, fontSize: '0.88rem' }}>
              <p style={{ margin: '0 0 0.5rem 0' }}>
                🚚 <strong>Livraison :</strong> Expédition sous 24h à 48h à domicile ou en point relais.
              </p>
              <p style={{ margin: 0 }}>
                🔄 <strong>Retours :</strong> Vous disposez de 30 jours pour faire un retour ou un échange.
              </p>
            </div>
          )}
        </div>

        {/* BOTTOM REASSURANCE BANNER */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '1rem',
          padding: '1.25rem',
          background: '#f8fafc',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          textAlign: 'center'
        }}>
          <div>
            <Truck size={22} color="#2563eb" style={{ margin: '0 auto 0.25rem auto' }} />
            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.82rem' }}>Livraison Rapide</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Sous 24/48h</div>
          </div>

          <div>
            <RotateCcw size={22} color="#10b981" style={{ margin: '0 auto 0.25rem auto' }} />
            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.82rem' }}>Retours Faciles</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>30 jours</div>
          </div>

          <div>
            <Lock size={22} color="#d97706" style={{ margin: '0 auto 0.25rem auto' }} />
            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.82rem' }}>Paiement Sécurisé</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>100% protégé</div>
          </div>

          <div>
            <PhoneCall size={22} color="#8b5cf6" style={{ margin: '0 auto 0.25rem auto' }} />
            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.82rem' }}>Support 24/7</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>WhatsApp & Tél</div>
          </div>
        </div>

      </div>
    </div>
  );
}
