import React, { useState } from 'react';
import { X, Trash2, ArrowRight, CheckCircle2, MessageCircle, FileText, QrCode, Smartphone, CreditCard, Banknote, ShoppingBag, Download } from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatCurrency, placeOrder, generateWhatsAppLink, downloadInvoiceFile } from '../services/store';

export default function CartDrawer({ isOpen, onClose, cartItems, onUpdateQuantity, settings, onViewInvoice }) {
  const [step, setStep] = useState('cart'); // 'cart' | 'checkout' | 'success'
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    address: '',
    paymentMethod: 'Mobile Money (Moov Afrique, Mixx by Yas)'
  });
  const [placedOrder, setPlacedOrder] = useState(null);

  if (!isOpen) return null;

  const validCartItems = Array.isArray(cartItems) ? cartItems.filter(item => item && item.product) : [];
  const subtotal = validCartItems.reduce((acc, item) => acc + ((Number(item.product.price) || 0) * (Number(item.quantity) || 1)), 0);
  const deliveryFee = subtotal > 0 ? (settings?.deliveryFee || 2500) : 0;
  const total = subtotal + deliveryFee;

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    if (!formData.customerName || !formData.phone || !formData.address) {
      alert('Veuillez remplir votre nom, téléphone et adresse de livraison.');
      return;
    }

    const orderData = {
      ...formData,
      total,
      items: cartItems.map(item => ({
        id: item.product?.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        size: item.size,
        color: item.color,
        image: item.product.image
      }))
    };

    const newOrder = placeOrder(orderData);
    setPlacedOrder(newOrder);
    setStep('success');

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  const handleReset = () => {
    setStep('cart');
    setPlacedOrder(null);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(6px)',
      zIndex: 250,
      display: 'flex',
      justifyContent: 'flex-end'
    }} onClick={handleReset}>
      
      <div 
        className="glass-panel animate-fade-in" 
        style={{
          maxWidth: '500px',
          width: '100%',
          height: '100%',
          borderRadius: 0,
          borderRight: 'none',
          borderTop: 'none',
          borderBottom: 'none',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '1.5rem 1.25rem calc(1.5rem + env(safe-area-inset-bottom, 0px)) 1.25rem',
          background: '#ffffff',
          color: '#0f172a',
          boxSizing: 'border-box'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingBag size={20} color="#2563eb" />
            <h3 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 800 }}>
              {step === 'cart' && 'Mon Panier DamShop'}
              {step === 'checkout' && 'Finaliser la Commande'}
              {step === 'success' && 'Commande Confirmée !'}
            </h3>
          </div>
          <button onClick={handleReset} style={{ background: 'none', border: 'none', color: '#0f172a', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 0' }}>
          
          {/* STEP 1: CART ITEMS */}
          {step === 'cart' && (
            <>
              {cartItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                  <ShoppingBag size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                  <p>Votre panier est actuellement vide.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {cartItems.map(({ product, quantity, size, color }, idx) => (
                    <div key={idx} className="glass-card" style={{ padding: '0.85rem', display: 'flex', gap: '0.85rem', alignItems: 'center', background: '#f8fafc', borderColor: '#e2e8f0' }}>
                      <img src={product.image} alt={product.name} style={{ width: '65px', height: '65px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.15rem', color: '#0f172a' }}>{product.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.2rem' }}>
                          Taille: <span style={{ color: '#0f172a', fontWeight: 600 }}>{size}</span> | Couleur: <span style={{ color: '#0f172a', fontWeight: 600 }}>{color}</span>
                        </div>
                        <div className="font-mono" style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 700 }}>
                          {formatCurrency(product.price)}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
                          <button 
                            onClick={() => onUpdateQuantity(idx, quantity - 1)}
                            style={{ background: '#e2e8f0', border: 'none', color: '#0f172a', width: '22px', height: '22px', borderRadius: '4px', cursor: 'pointer', fontWeight: 700 }}
                          >
                            -
                          </button>
                          <span className="font-mono" style={{ fontSize: '0.85rem', fontWeight: 700 }}>{quantity}</span>
                          <button 
                            onClick={() => onUpdateQuantity(idx, quantity + 1)}
                            style={{ background: '#e2e8f0', border: 'none', color: '#0f172a', width: '22px', height: '22px', borderRadius: '4px', cursor: 'pointer', fontWeight: 700 }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button 
                        onClick={() => onUpdateQuantity(idx, 0)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.4rem' }}
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* STEP 2: CHECKOUT FORM */}
          {step === 'checkout' && (
            <form id="checkout-form" onSubmit={handleCheckoutSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Nom et Prénom *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="ex: Jean Dupont"
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Numéro WhatsApp / Téléphone *</label>
                <input 
                  type="tel" 
                  className="form-input" 
                  placeholder="ex: +225 07 00 00 00 00"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Adresse de Livraison *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Quartier, Ville, Repère..."
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mode de Paiement</label>
                <select 
                  className="form-select"
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                >
                  <option value="Mobile Money (Moov Afrique, Mixx by Yas)">📱 Mobile Money (Moov Afrique & Mixx by Yas)</option>
                  <option value="Carte Bancaire (Visa/Mastercard)">💳 Carte Bancaire (Visa, Mastercard)</option>
                  <option value="Paiement à la livraison">💵 Paiement Cash à la Livraison</option>
                </select>
              </div>

              {/* QR Code Helper Info for Mobile Money */}
              {formData.paymentMethod.includes('Mobile Money') && (
                <div className="glass-card" style={{ padding: '0.85rem', fontSize: '0.8rem', color: '#475569', background: '#f8fafc' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#b45309', fontWeight: 700, marginBottom: '0.3rem' }}>
                    <QrCode size={16} /> Paiement Mobile Money Direct
                  </div>
                  Effectuez le transfert vers le numéro <strong>{settings?.whatsappNumber || '22890000000'}</strong> (Moov Money / Mixx by Yas) avec la référence de commande qui vous sera attribuée.
                </div>
              )}
            </form>
          )}

          {/* STEP 3: SUCCESS & VISUAL CONFIRMATION WITH PRODUCT PHOTOS */}
          {step === 'success' && placedOrder && (
            <div style={{ textAlign: 'center', padding: '1rem 0' }} className="animate-fade-in">
              <CheckCircle2 size={56} color="#10b981" style={{ marginBottom: '0.75rem' }} />
              <h4 className="font-display" style={{ fontSize: '1.3rem', marginBottom: '0.25rem', fontWeight: 800 }}>
                Commande Confirmée !
              </h4>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                N° <strong style={{ color: '#2563eb' }}>{placedOrder.id}</strong> • Vos articles ci-dessous seront envoyés avec leurs photos sur WhatsApp.
              </p>

              {/* VISUAL PRODUCT RECAP CARDS WITH THUMBNAILS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem', textAlign: 'left' }}>
                {placedOrder.items.map((item, idx) => (
                  <div key={idx} className="glass-card" style={{ padding: '0.75rem', display: 'flex', gap: '0.75rem', alignItems: 'center', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    {item.image && (
                      <img src={item.image} alt={item.name} style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>{item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Qté: {item.quantity} • Taille: {item.size} • Couleur: {item.color}
                      </div>
                      <div className="font-mono" style={{ fontSize: '0.8rem', fontWeight: 800, color: '#d97706', marginTop: '0.15rem' }}>
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Info Summary */}
              <div className="glass-card" style={{ padding: '0.85rem 1rem', textAlign: 'left', marginBottom: '1.25rem', fontSize: '0.82rem', background: '#f8fafc', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ color: '#64748b' }}>Client :</span>
                  <strong>{placedOrder.customerName} ({placedOrder.phone})</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ color: '#64748b' }}>Livraison à :</span>
                  <strong>📍 {placedOrder.address}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '0.35rem', marginTop: '0.35rem' }}>
                  <span style={{ fontWeight: 700 }}>Total à payer :</span>
                  <strong className="font-mono" style={{ color: '#d97706', fontSize: '0.95rem' }}>{formatCurrency(placedOrder.total)}</strong>
                </div>
              </div>

              {/* Action Buttons for WhatsApp & Invoice */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                <a 
                  href={generateWhatsAppLink(placedOrder, settings)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn"
                  style={{
                    background: '#25D366',
                    color: '#ffffff',
                    fontWeight: 700,
                    justifyContent: 'center',
                    padding: '0.85rem',
                    borderRadius: '10px',
                    boxShadow: '0 4px 14px rgba(37, 211, 102, 0.3)'
                  }}
                >
                  <MessageCircle size={20} /> Envoyer la Commande sur WhatsApp
                </a>

                <button
                  className="btn btn-secondary"
                  style={{ justifyContent: 'center', padding: '0.75rem', borderRadius: '10px' }}
                  onClick={() => downloadInvoiceFile(placedOrder, settings)}
                >
                  <Download size={18} /> {placedOrder.paymentMethod && placedOrder.paymentMethod.includes('livraison') ? 'Télécharger le Bon de Commande PDF (À payer au livreur)' : 'Télécharger la Facture Acquittée PDF'}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
          {step === 'cart' && (
            <>
              {cartItems.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#64748b', marginBottom: '0.25rem' }}>
                    <span>Sous-total :</span>
                    <span className="font-mono">{formatCurrency(subtotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem' }}>
                    <span>Livraison :</span>
                    <span className="font-mono">{formatCurrency(deliveryFee)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                    <span>Total :</span>
                    <span className="font-mono">{formatCurrency(total)}</span>
                  </div>
                </div>
              )}

              <button 
                className="btn btn-primary" 
                disabled={cartItems.length === 0}
                style={{ width: '100%', padding: '0.85rem', justifyContent: 'center' }}
                onClick={() => setStep('checkout')}
              >
                Commander Maintenant <ArrowRight size={18} />
              </button>
            </>
          )}

          {step === 'checkout' && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setStep('cart')}
              >
                Retour
              </button>
              <button 
                type="submit" 
                form="checkout-form"
                className="btn btn-primary"
                style={{ flex: 2, justifyContent: 'center' }}
              >
                Valider ({formatCurrency(total)})
              </button>
            </div>
          )}

          {step === 'success' && (
            <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleReset}>
              Fermer et continuer les achats
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
