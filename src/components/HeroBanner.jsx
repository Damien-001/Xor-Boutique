import React from 'react';
import { ArrowRight, Zap, Shield, Truck } from 'lucide-react';

export default function HeroBanner({ onExploreClick }) {
  return (
    <div className="glass-panel animate-fade-in" style={{
      maxWidth: '1440px',
      margin: '0 auto 2.5rem auto',
      padding: '3.5rem 2.5rem',
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
      borderColor: '#e2e8f0',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2.5rem',
        alignItems: 'center'
      }}>
        {/* Hero Left Content */}
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }} className="badge badge-gold">
            <Zap size={14} /> BOUTIQUE OFFICIELLE DAMSHOP
          </div>

          <h1 className="font-display" style={{
            fontSize: 'clamp(2.2rem, 4vw, 3.4rem)',
            lineHeight: 1.15,
            fontWeight: 800,
            marginBottom: '1rem',
            letterSpacing: '-0.03em',
            color: '#0f172a'
          }}>
            L'Élégance de la <span style={{ color: '#2563eb' }}>Mode</span> & du <span style={{ color: '#d97706' }}>High-Tech</span>
          </h1>

          <p style={{
            color: '#64748b',
            fontSize: '1.1rem',
            marginBottom: '2rem',
            maxWidth: '540px',
            lineHeight: 1.6
          }}>
            Découvrez une sélection exclusive d'articles pour Homme, Femme et des Gadgets de dernière génération. Livraison rapide à domicile & Paiement sécurisé.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={onExploreClick} style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
              Découvrir la Collection <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '1.25rem'
        }}>
          <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', background: '#ffffff' }}>
            <Truck size={30} color="#2563eb" style={{ marginBottom: '0.6rem' }} />
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>Livraison 24/48h</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Expédition rapide</div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', background: '#ffffff' }}>
            <Shield size={30} color="#d97706" style={{ marginBottom: '0.6rem' }} />
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>Paiement Sécurisé</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Mobile Money & CB</div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', background: '#ffffff' }}>
            <Zap size={30} color="#10b981" style={{ marginBottom: '0.6rem' }} />
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>App PWA Client</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Installable sur mobile</div>
          </div>
        </div>
      </div>
    </div>
  );
}
