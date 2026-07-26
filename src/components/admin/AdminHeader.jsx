import React from 'react';
import { Menu, AlertTriangle, Eye } from 'lucide-react';
import AdminNotificationModal from './AdminNotificationModal';

export default function AdminHeader({
  activeTab,
  outOfStockProducts = [],
  onOpenMobileMenu,
  onBackToStore
}) {
  const getTabTitle = (tab) => {
    switch (tab) {
      case 'dashboard': return 'Tableau de Bord Exécutif Xor Boutique';
      case 'categories': return 'Gestion Dynamique des Catégories';
      case 'products': return 'Gestion des Produits & Contrôle des Stocks';
      case 'orders': return 'Suivi des Commandes & Adresses de Livraison';
      case 'customers': return 'Répertoire des Contacts & Marketing WhatsApp';
      case 'analytics': return 'Statistiques & Performance des Ventes';
      case 'settings': return 'Configuration WhatsApp & Boutique';
      default: return 'Espace d\'Administration Xor Boutique';
    }
  };

  return (
    <div className="glass-panel" style={{
      width: '100%',
      padding: '1.5rem 1.75rem',
      background: '#ffffff',
      borderRadius: '16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '1.25rem',
      boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
      boxSizing: 'border-box'
    }}>
      <div>
        <h2 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
          {getTabTitle(activeTab)}
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '0.25rem' }}>
          Xor Boutique Admin • Défilement interne du contenu avec Sidebar figé
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        {outOfStockProducts.length > 0 && (
          <div className="glass-card" style={{ padding: '0.55rem 1rem', background: '#fee2e2', borderColor: '#fca5a5', fontSize: '0.8rem', color: '#dc2626', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '10px' }}>
            <AlertTriangle size={16} /> {outOfStockProducts.length} Rupture(s) de Stock
          </div>
        )}
      </div>
    </div>
  );
}
