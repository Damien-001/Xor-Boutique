import React, { useState } from 'react';
import { X, Search, CheckCircle2, Clock, MapPin, Package, Download, Phone, MessageCircle } from 'lucide-react';
import { formatCurrency, downloadInvoiceFile, generateWhatsAppLink, formatPaymentMethodLabel } from '../services/store';

export default function OrderTrackingModal({ isOpen, onClose, orders, settings }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedOrder, setSearchedOrder] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  if (!isOpen) return null;

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const query = searchQuery.trim().toLowerCase();
    const found = orders.find(o => 
      o.id.toLowerCase() === query || 
      (o.id.toLowerCase().replace('ds-', '') === query) ||
      (o.phone && o.phone.replace(/[^0-9]/g, '').includes(query.replace(/[^0-9]/g, '')))
    );

    setSearchedOrder(found || null);
    setHasSearched(true);
  };

  const handleReset = () => {
    setSearchQuery('');
    setSearchedOrder(null);
    setHasSearched(false);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 260,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }} onClick={handleReset}>

      <div 
        className="glass-panel animate-fade-in" 
        style={{
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          padding: '2rem',
          background: '#ffffff',
          color: '#0f172a',
          borderRadius: '20px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.15)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={handleReset}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: '#f1f5f9',
            border: '1px solid #cbd5e1',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0f172a',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        {/* Modal Title */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: '#eff6ff',
            color: '#2563eb',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.75rem'
          }}>
            <Search size={26} />
          </div>
          <h3 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 800 }}>
            Suivi de Commande & Reçus
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Entrez votre numéro de commande (ex: DS-4675) ou votre numéro de téléphone.
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <input 
            type="text" 
            className="form-input"
            placeholder="N° Commande (ex: DS-4675) ou Téléphone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, padding: '0.8rem 1rem' }}
            required
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 1.5rem' }}>
            Rechercher
          </button>
        </form>

        {/* Search Results */}
        {hasSearched && (
          <div>
            {!searchedOrder ? (
              <div style={{ textAlign: 'center', padding: '2rem', background: '#fff1f2', borderRadius: '12px', color: '#9f1239' }}>
                <p style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Aucune commande trouvée.</p>
                <p style={{ fontSize: '0.82rem' }}>Vérifiez la référence de commande ou contactez notre support.</p>
              </div>
            ) : (
              <div className="glass-card" style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                
                {/* Order Status Banner */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.85rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>RÉFÉRENCE COMMANDE</div>
                    <div className="font-mono" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#2563eb' }}>
                      N° {searchedOrder.id}
                    </div>
                  </div>

                  <div>
                    {searchedOrder.status === 'Livré & Payé' || searchedOrder.status === 'Payé' ? (
                      <span className="badge badge-success" style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem', fontWeight: 800 }}>
                        <CheckCircle2 size={14} /> LIVRÉ & PAYÉ (REÇU DÉBLOQUÉ)
                      </span>
                    ) : (
                      <span className="badge badge-warning" style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem', fontWeight: 800 }}>
                        <Clock size={14} /> EN ATTENTE DE LIVRAISON & PAIEMENT
                      </span>
                    )}
                  </div>
                </div>

                {/* Customer Details */}
                <div style={{ fontSize: '0.85rem', marginBottom: '1rem', color: '#334155' }}>
                  <div>Client : <strong>{searchedOrder.customerName}</strong> ({searchedOrder.phone})</div>
                  <div>Livraison à : <strong>📍 {searchedOrder.address}</strong></div>
                  <div>Paiement : <strong>{formatPaymentMethodLabel(searchedOrder.paymentMethod)}</strong></div>
                </div>

                {/* Items List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  {searchedOrder.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', background: '#ffffff', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <span>{item.quantity}x <strong>{item.name}</strong> ({item.size}, {item.color})</span>
                      <span className="font-mono" style={{ fontWeight: 700 }}>{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 800, paddingTop: '0.4rem', color: '#0f172a' }}>
                    <span>Total Général :</span>
                    <span className="font-mono" style={{ color: '#d97706' }}>{formatCurrency(searchedOrder.total)}</span>
                  </div>
                </div>

                {/* PDF & WhatsApp Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {searchedOrder.status === 'Livré & Payé' || searchedOrder.status === 'Payé' ? (
                    <button 
                      className="btn btn-primary"
                      style={{ padding: '0.85rem', justifyContent: 'center', background: '#047857', fontWeight: 800 }}
                      onClick={() => downloadInvoiceFile(searchedOrder, settings)}
                    >
                      <Download size={18} /> Télécharger ma Facture Acquittée PDF (Officiel Payé)
                    </button>
                  ) : (
                    <button 
                      className="btn btn-primary"
                      style={{ padding: '0.85rem', justifyContent: 'center', background: '#2563eb' }}
                      onClick={() => downloadInvoiceFile(searchedOrder, settings)}
                    >
                      <Download size={18} /> Télécharger le Bon de Commande PDF (À payer au livreur)
                    </button>
                  )}

                  <a
                    href={generateWhatsAppLink(searchedOrder, settings)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ padding: '0.75rem', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    <MessageCircle size={18} color="#25D366" /> Contacter le Support WhatsApp
                  </a>
                </div>

              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
