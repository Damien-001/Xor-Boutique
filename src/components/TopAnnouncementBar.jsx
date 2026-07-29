import React, { useState, useEffect } from 'react';
import { Truck, Zap, MessageCircle, X, ChevronLeft, ChevronRight } from 'lucide-react';

const ANNOUNCEMENTS = [
  { id: 1, icon: Truck, text: "Livraison rapide & expédition 24/48h dans toute la région", color: "#60a5fa" },
  { id: 2, icon: Zap, text: "Articles 100% authentiques & garantis Xor Boutique", color: "#f59e0b" },
  { id: 3, icon: MessageCircle, text: "Commandes & Assistance instantanées par WhatsApp 24h/7j", color: "#4ade80" }
];

export default function TopAnnouncementBar({ settings }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  if (!isVisible) return null;

  const current = ANNOUNCEMENTS[currentIndex];
  const IconComp = current.icon;

  return (
    <div style={{
      background: '#0f172a',
      color: '#ffffff',
      fontSize: '0.78rem',
      padding: '0.4rem 1rem',
      position: 'relative',
      zIndex: 110,
      borderBottom: '1px solid #1e293b',
      boxSizing: 'border-box'
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.5rem'
      }}>
        {/* Navigation Arrow Left */}
        <button
          onClick={() => setCurrentIndex((prev) => (prev - 1 + ANNOUNCEMENTS.length) % ANNOUNCEMENTS.length)}
          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.1rem', display: 'flex', alignItems: 'center' }}
          title="Précédent"
        >
          <ChevronLeft size={14} />
        </button>

        {/* Announcement Message Ticker */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          textAlign: 'center',
          flex: 1,
          fontWeight: 600,
          letterSpacing: '0.01em'
        }} className="animate-fade-in">
          <IconComp size={15} color={current.color} style={{ flexShrink: 0 }} />
          <span>{current.text}</span>
        </div>

        {/* Navigation Arrow Right & Close */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length)}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.1rem', display: 'flex', alignItems: 'center' }}
            title="Suivant"
          >
            <ChevronRight size={14} />
          </button>
          
          <button
            onClick={() => setIsVisible(false)}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.1rem', display: 'flex', alignItems: 'center' }}
            title="Masquer la barre"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
