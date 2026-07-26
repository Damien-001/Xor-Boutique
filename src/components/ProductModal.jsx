import React, { useState } from 'react';
import { X, Star, ShoppingBag, ShieldCheck, Truck, MessageSquare, Send, Share2, Copy, Check, Link } from 'lucide-react';
import { formatCurrency, getReviews, addReview } from '../services/store';

export default function ProductModal({ product, categories, onClose, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || 'Unique');
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || 'Standard');

  // Reviews state
  const [reviews, setReviews] = useState(getReviews(product?.id));
  const [newReview, setNewReview] = useState({ userName: '', rating: 5, comment: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Share / Deep Link state
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShareProduct = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?product=${product.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `DamShop - ${product.name}`,
          text: `Découvrez ${product.name} sur DamShop : ${product.description}`,
          url: shareUrl
        });
        return;
      } catch (err) {
        // Fallback to clipboard if share modal was cancelled or unsupported
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch (e) {
      alert(`Lien direct du produit : ${shareUrl}`);
    }
  };

  if (!product) return null;

  const categoryObj = categories.find(c => c.id === product.category);
  const productImages = (product.images && product.images.length > 0) ? product.images : (product.image ? [product.image] : []);
  const currentImage = productImages[activeImageIndex] || product.image;

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
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(8px)',
      zIndex: 200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }} onClick={onClose}>
      
      <div className="glass-panel animate-fade-in" style={{
        maxWidth: '960px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        padding: '1rem',
        background: '#ffffff',
        borderColor: '#cbd5e1',
        borderRadius: '24px',
        boxShadow: '0 25px 60px rgba(15, 23, 42, 0.2)'
      }} onClick={(e) => e.stopPropagation()}>

        {/* Top Right Action Bar: Close Button */}
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 10
        }}>
          {/* Close Button */}
          <button 
            onClick={onClose}
            title="Fermer"
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
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.25rem'
        }}>
          {/* Product Multi-Image Gallery Display */}
          <div style={{ 
            background: '#f8fafc', 
            borderRadius: '20px', 
            padding: '1rem', 
            position: 'relative', 
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: '400px',
            border: '1px solid #f1f5f9' 
          }}>
            <div style={{ 
              flex: 1, 
              position: 'relative', 
              minHeight: '360px', 
              borderRadius: '16px', 
              overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(15, 23, 42, 0.06)'
            }}>
              <img 
                src={currentImage} 
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }}
              />
            </div>

            {/* Thumbnail Carousel */}
            {productImages.length > 1 && (
              <div style={{
                display: 'flex',
                gap: '0.6rem',
                padding: '0.6rem',
                marginTop: '0.75rem',
                overflowX: 'auto',
                background: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #e2e8f0'
              }}>
                {productImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Photo ${idx + 1}`}
                    onClick={() => setActiveImageIndex(idx)}
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '10px',
                      objectFit: 'cover',
                      cursor: 'pointer',
                      border: activeImageIndex === idx ? '2px solid #2563eb' : '1px solid #cbd5e1',
                      opacity: activeImageIndex === idx ? 1 : 0.65,
                      boxShadow: activeImageIndex === idx ? '0 2px 8px rgba(37, 99, 235, 0.3)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div style={{ padding: '2.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: '#0f172a' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span className="badge badge-blue">{categoryObj?.name || 'Catégorie'}</span>
                <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 600 }}>
                  <Star size={14} fill="#d97706" color="#d97706" /> {product.rating} ({reviews.length} avis)
                </span>
              </div>

              <h2 className="font-display" style={{ fontSize: '1.75rem', marginBottom: '1rem', lineHeight: 1.2, fontWeight: 800 }}>
                {product.name}
              </h2>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <span className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
                  {formatCurrency(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="font-mono" style={{ fontSize: '1rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                    {formatCurrency(product.originalPrice)}
                  </span>
                )}
              </div>

              <p style={{ color: '#64748b', lineHeight: 1.6, marginBottom: '1.25rem', fontSize: '0.95rem' }}>
                {product.description}
              </p>

              {/* Size Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <div className="form-label" style={{ marginBottom: '0.4rem' }}>Taille / Format :</div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {product.sizes.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedSize(s)}
                        style={{
                          padding: '0.4rem 0.8rem',
                          borderRadius: 'var(--radius-sm)',
                          border: selectedSize === s ? '2px solid #0f172a' : '1px solid #cbd5e1',
                          background: selectedSize === s ? '#0f172a' : '#f8fafc',
                          color: selectedSize === s ? '#ffffff' : '#0f172a',
                          fontWeight: selectedSize === s ? 700 : 500,
                          cursor: 'pointer'
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selector */}
              {product.colors && product.colors.length > 0 && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <div className="form-label" style={{ marginBottom: '0.4rem' }}>Couleur :</div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {product.colors.map((c, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedColor(c)}
                        style={{
                          padding: '0.4rem 0.8rem',
                          borderRadius: 'var(--radius-sm)',
                          border: selectedColor === c ? '2px solid #2563eb' : '1px solid #cbd5e1',
                          background: selectedColor === c ? '#dbeafe' : '#f8fafc',
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

              {/* Quantity Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <span className="form-label" style={{ margin: 0 }}>Quantité :</span>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: 'var(--radius-sm)', background: '#f8fafc' }}>
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{ background: 'none', border: 'none', color: '#0f172a', padding: '0.4rem 0.8rem', cursor: 'pointer', fontWeight: 700 }}
                  >
                    -
                  </button>
                  <span className="font-mono" style={{ padding: '0 0.8rem', fontWeight: 700 }}>{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    style={{ background: 'none', border: 'none', color: '#0f172a', padding: '0.4rem 0.8rem', cursor: 'pointer', fontWeight: 700 }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Actions & Guarantees */}
            <div>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <button 
                  className="btn btn-primary" 
                  style={{ flex: 1, padding: '0.95rem', fontSize: '1rem', justifyContent: 'center' }}
                  onClick={() => {
                    onAddToCart(product, quantity, selectedSize, selectedColor);
                    onClose();
                  }}
                >
                  <ShoppingBag size={18} /> Ajouter au Panier - {formatCurrency(product.price * quantity)}
                </button>

                <button
                  type="button"
                  onClick={handleShareProduct}
                  className="btn btn-secondary"
                  title="Copier le lien direct du produit pour WhatsApp, Facebook, TikTok"
                  style={{
                    padding: '0.95rem 1.25rem',
                    background: copiedLink ? '#dcfce7' : '#f1f5f9',
                    borderColor: copiedLink ? '#86efac' : '#cbd5e1',
                    color: copiedLink ? '#15803d' : '#0f172a',
                    fontWeight: 700
                  }}
                >
                  {copiedLink ? <Check size={20} color="#15803d" /> : <Share2 size={20} />}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                  <Truck size={16} color="#2563eb" /> Livraison 24/48h
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                  <ShieldCheck size={16} color="#d97706" /> Garantie Certifiée
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Customer Reviews Section */}
        <div style={{ borderTop: '1px solid #e2e8f0', padding: '2rem', background: '#f8fafc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 className="font-display" style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a', fontWeight: 700 }}>
              <MessageSquare size={18} color="#2563eb" /> Avis Clients ({reviews.length})
            </h3>

            <button 
              className="btn btn-secondary" 
              style={{ fontSize: '0.85rem' }}
              onClick={() => setShowReviewForm(!showReviewForm)}
            >
              {showReviewForm ? 'Fermer' : 'Laisser un avis'}
            </button>
          </div>

          {/* Add Review Form */}
          {showReviewForm && (
            <form onSubmit={handleReviewSubmit} className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', background: '#ffffff' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.75rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Votre Nom *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="ex: Aminata B."
                    value={newReview.userName}
                    onChange={(e) => setNewReview({ ...newReview, userName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Note (sur 5 étoiles)</label>
                  <select
                    className="form-select"
                    value={newReview.rating}
                    onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                  >
                    <option value="5">⭐⭐⭐⭐⭐ 5 étoiles (Excellent)</option>
                    <option value="4">⭐⭐⭐⭐ 4 étoiles (Très bon)</option>
                    <option value="3">⭐⭐⭐ 3 étoiles (Moyen)</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Votre Commentaire *</label>
                <textarea
                  className="form-textarea"
                  rows="2"
                  placeholder="Partagez votre avis sur ce produit..."
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}>
                <Send size={14} /> Publier l'Avis
              </button>
            </form>
          )}

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Soyez le premier à donner votre avis sur cet article !
            </p>
          ) : (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {reviews.map(rev => (
                <div key={rev.id} className="glass-card" style={{ padding: '1rem', background: '#ffffff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{rev.userName}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#d97706', fontSize: '0.85rem', fontWeight: 700 }}>
                      <Star size={14} fill="#d97706" color="#d97706" /> {rev.rating}/5
                    </div>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#475569' }}>{rev.comment}</p>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
