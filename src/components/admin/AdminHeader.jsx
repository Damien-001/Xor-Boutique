import React from 'react';
import { Menu, AlertTriangle, Eye, ShieldCheck, UserCheck } from 'lucide-react';
import { getActiveAdminSession } from '../../services/store';

export default function AdminHeader({
  activeTab,
  outOfStockProducts = [],
  onOpenMobileMenu,
  onBackToStore
}) {
  const currentSession = getActiveAdminSession();
  const isSuperAdmin = currentSession?.role === 'super_admin';

  const getTabTitle = (tab) => {
    switch (tab) {
      case 'dashboard': return 'Tableau de Bord Exécutif Xor Boutique';
      case 'categories': return 'Gestion Dynamique des Catégories';
      case 'products': return 'Gestion des Produits & Contrôle des Stocks';
      case 'orders': return 'Suivi des Commandes & Adresses de Livraison';
      case 'customers': return 'Répertoire des Contacts & Marketing WhatsApp';
      case 'analytics': return 'Statistiques & Performance des Ventes';
      case 'settings': return 'Configuration WhatsApp & Gestion de l\'Équipe';
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
          Xor Boutique Admin • Session actif: {currentSession?.name || 'Administrateur'}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.45rem 0.9rem',
          background: isSuperAdmin ? '#fef3c7' : '#e0f2fe',
          border: `1px solid ${isSuperAdmin ? '#fcd34d' : '#bae6fd'}`,
          borderRadius: '20px',
          color: isSuperAdmin ? '#92400e' : '#0369a1',
          fontSize: '0.82rem',
          fontWeight: 700
        }}>
          {isSuperAdmin ? <ShieldCheck size={16} color="#d97706" /> : <UserCheck size={16} color="#0284c7" />}
          <span>{currentSession?.name || 'Session Admin'} ({isSuperAdmin ? 'Super Admin' : 'Collaborateur'})</span>
        </div>

        {outOfStockProducts.length > 0 && (
          <div className="glass-card" style={{ padding: '0.55rem 1rem', background: '#fee2e2', borderColor: '#fca5a5', fontSize: '0.8rem', color: '#dc2626', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '10px' }}>
            <AlertTriangle size={16} /> {outOfStockProducts.length} Rupture(s) de Stock
          </div>
        )}
      </div>
    </div>
  );
}
