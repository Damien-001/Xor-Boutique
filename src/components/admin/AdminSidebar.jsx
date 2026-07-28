import React from 'react';
import { 
  Sparkles, 
  LayoutDashboard, 
  FolderPlus, 
  Package, 
  ShoppingBag, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut, 
  Eye,
  X
} from 'lucide-react';
import { getActiveAdminSession } from '../../services/store';

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  categoriesCount = 0,
  productsCount = 0,
  ordersCount = 0,
  customersCount = 0,
  onBackToStore,
  onLogout,
  isMobile = false,
  onCloseMobile
}) {
  const currentSession = getActiveAdminSession();
  const isSuperAdmin = currentSession?.role === 'super_admin';

  const navItems = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard, color: '#0f172a' },
    { id: 'categories', label: 'Catégories', icon: FolderPlus, color: '#2563eb', count: categoriesCount },
    { id: 'products', label: 'Produits & Stocks', icon: Package, color: '#10b981', count: productsCount },
    { id: 'orders', label: 'Commandes', icon: ShoppingBag, color: '#d97706', count: ordersCount },
    { id: 'customers', label: 'Répertoire Clients & CRM', icon: Users, color: '#ec4899', count: customersCount },
    { id: 'analytics', label: 'Analytiques Ventes', icon: BarChart3, color: '#8b5cf6' },
    ...(isSuperAdmin ? [{ id: 'settings', label: 'Paramètres', icon: Settings, color: '#64748b' }] : [])
  ];

  return (
    <aside 
      className={isMobile ? "admin-mobile-drawer animate-fade-in" : "glass-panel admin-sidebar-desktop"} 
      onClick={(e) => isMobile && e.stopPropagation()}
      style={{
        position: isMobile ? 'fixed' : 'sticky',
        top: 0,
        right: isMobile ? 0 : 'auto',
        left: isMobile ? 'auto' : 0,
        bottom: 0,
        width: isMobile ? '285px' : '260px',
        height: isMobile ? '100vh' : '100%',
        maxHeight: isMobile ? '100vh' : 'calc(100vh - 100px)',
        padding: '1.75rem 1.25rem',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderColor: '#e2e8f0',
        borderRadius: isMobile ? '16px 0 0 16px' : '16px',
        boxShadow: isMobile ? '-10px 0 35px rgba(15, 23, 42, 0.25)' : '0 4px 20px rgba(0,0,0,0.03)',
        boxSizing: 'border-box',
        overflowY: 'auto',
        zIndex: isMobile ? 360 : 1,
        flexShrink: 0
      }}
    >
      <div>
        {/* Sidebar Brand Header */}
        <div style={{ padding: '0 0.25rem 1.5rem 0.25rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(15,23,42,0.15)'
            }}>
              <Sparkles size={20} color="#ffffff" />
            </div>
            <div>
              <div className="font-display" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                Xor Boutique
              </div>
              <span className="badge badge-gold" style={{ fontSize: '0.6rem', marginTop: '0.25rem' }}>
                EXECUTIVE PRO
              </span>
            </div>
          </div>

          {isMobile && onCloseMobile && (
            <button
              onClick={onCloseMobile}
              style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f172a', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Nav Menu Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navItems.map(item => {
            const IconComp = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (isMobile && onCloseMobile) onCloseMobile();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.8rem 1rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: isActive ? '#0f172a' : 'transparent',
                  color: isActive ? '#ffffff' : '#475569',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <IconComp size={18} color={isActive ? '#ffffff' : item.color} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span style={{
                    fontSize: '0.75rem',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '12px',
                    background: isActive ? 'rgba(255, 255, 255, 0.2)' : '#f1f5f9',
                    color: isActive ? '#ffffff' : '#64748b',
                    fontWeight: 700
                  }}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer Actions */}
      <div style={{ paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <button
          onClick={onBackToStore}
          className="btn btn-secondary"
          style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.85rem' }}
        >
          <Eye size={16} /> Voir la Boutique
        </button>

        <button
          onClick={onLogout}
          className="btn btn-danger"
          style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.85rem' }}
        >
          <LogOut size={16} /> Déconnexion
        </button>
      </div>
    </aside>
  );
}
