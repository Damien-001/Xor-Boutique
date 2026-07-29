import React from 'react';
import { X, Printer, CheckCircle2, Download, Sparkles } from 'lucide-react';
import { formatCurrency, downloadInvoiceFile, formatPaymentMethodLabel } from '../services/store';

export default function InvoiceModal({ order, settings, onClose }) {
  if (!order) return null;

  const handleDownload = () => {
    downloadInvoiceFile(order, settings);
  };

  const handlePrint = () => {
    window.print();
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
      zIndex: 300,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }} onClick={onClose}>
      
      <div className="glass-panel animate-fade-in printable-invoice-container" style={{
        maxWidth: '750px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        padding: '2.5rem',
        background: '#ffffff',
        color: '#0f172a',
        borderColor: '#cbd5e1',
        boxShadow: '0 20px 50px rgba(0,0,0,0.15)'
      }} onClick={(e) => e.stopPropagation()}>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="no-print"
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

        {/* Invoice Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #e2e8f0', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Sparkles size={18} color="#ffffff" />
              </div>
              <div className="font-display" style={{ fontSize: '1.6rem', fontWeight: 800 }}>
                Dam<span style={{ color: '#2563eb' }}>Shop</span>
              </div>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Boutique Personnelle & High-Tech
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
              {settings?.address || 'Abidjan, Côte d\'Ivoire'}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <h2 className="font-mono" style={{ fontSize: '1.4rem', color: '#d97706', marginBottom: '0.2rem', fontWeight: 800 }}>
              FACTURE N° {order.id}
            </h2>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Date : {order.date}</div>
            <div className="badge badge-success" style={{ marginTop: '0.4rem' }}>
              <CheckCircle2 size={12} /> {order.status}
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem', background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}>
          <div>
            <div className="form-label" style={{ marginBottom: '0.4rem' }}>Facturé à :</div>
            <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.2rem' }}>{order.customerName}</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Tel : {order.phone}</div>
            {order.email && <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Email : {order.email}</div>}
          </div>

          <div>
            <div className="form-label" style={{ marginBottom: '0.4rem' }}>Adresse de Livraison & Paiement :</div>
            <div style={{ fontSize: '0.9rem', marginBottom: '0.2rem' }}>{order.address}</div>
            <div style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 700 }}>
              Mode : {formatPaymentMethodLabel(order.paymentMethod)}
            </div>
          </div>
        </div>

        {/* Order Items Table Wrapper for Mobile */}
        <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginBottom: '2rem' }}>
          <table style={{ width: '100%', minWidth: '460px', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
              <th style={{ padding: '0.75rem 0' }}>Article</th>
              <th style={{ padding: '0.75rem 0' }}>Variante</th>
              <th style={{ padding: '0.75rem 0', textAlign: 'center' }}>Qté</th>
              <th style={{ padding: '0.75rem 0', textAlign: 'right' }}>Prix Unitaire</th>
              <th style={{ padding: '0.75rem 0', textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '0.75rem 0', fontWeight: 700 }}>{item.name}</td>
                <td style={{ padding: '0.75rem 0', color: '#64748b', fontSize: '0.85rem' }}>
                  {item.size ? `Taille: ${item.size}` : ''} {item.color ? `| Couleur: ${item.color}` : ''}
                </td>
                <td style={{ padding: '0.75rem 0', textAlign: 'center' }} className="font-mono">{item.quantity}</td>
                <td style={{ padding: '0.75rem 0', textAlign: 'right' }} className="font-mono">{formatCurrency(item.price)}</td>
                <td style={{ padding: '0.75rem 0', textAlign: 'right', fontWeight: 700 }} className="font-mono">{formatCurrency(item.price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {/* Total Calculations */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
          <div style={{ width: '280px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #e2e8f0', fontSize: '0.9rem', color: '#64748b' }}>
              <span>Frais de livraison :</span>
              <span className="font-mono">2 500 FCFA</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
              <span>Total Général :</span>
              <span className="font-mono" style={{ color: '#d97706' }}>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Footer Note & Direct Instant Download Action */}
        <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.8rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
          <p>Merci pour votre confiance sur DamShop !</p>
        </div>

        <div className="no-print" style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={handleDownload} style={{ padding: '0.8rem 1.5rem', background: '#2563eb' }}>
            <Download size={18} /> Télécharger le Reçu en Direct (0 Clic)
          </button>
          <button className="btn btn-secondary" onClick={handlePrint} style={{ padding: '0.8rem 1.5rem' }}>
            <Printer size={18} /> Boîte d'impression
          </button>
        </div>

      </div>
    </div>
  );
}
