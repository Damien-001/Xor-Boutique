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
    { id: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard, color: '#2563eb', bg: '#eff6ff' },
    { id: 'categories', label: 'Catégories', icon: FolderPlus, color: '#3b82f6', bg: '#eff6ff', count: categoriesCount },
    { id: 'products', label: 'Produits & Stocks', icon: Package, color: '#10b981', bg: '#ecfdf5', count: productsCount },
    { id: 'orders', label: 'Commandes', icon: ShoppingBag, color: '#f59e0b', bg: '#fffbeb', count: ordersCount },
    { id: 'customers', label: 'Répertoire Clients & CRM', icon: Users, color: '#ec4899', bg: '#fdf2f8', count: customersCount },
    { id: 'analytics', label: 'Analytiques Ventes', icon: BarChart3, color: '#8b5cf6', bg: '#f3e8ff' },
    ...(isSuperAdmin ? [{ id: 'settings', label: 'Paramètres & Équipe', icon: Settings, color: '#64748b', bg: '#f8fafc' }] : [])
  ];

  return (
    <aside 
      className={isMobile ? "admin-mobile-drawer animate-slide-right" : "glass-panel admin-sidebar-desktop"} 
      onClick={(e) => isMobile && e.stopPropagation()}
      style={{
        position: isMobile ? 'fixed' : 'sticky',
        top: 0,
        right: isMobile ? 0 : 'auto',
        left: isMobile ? 'auto' : 0,
        bottom: 0,
        width: isMobile ? '300px' : '265px',
        maxWidth: isMobile ? '88vw' : '100%',
        height: isMobile ? '100dvh' : '100%',
        maxHeight: isMobile ? '100dvh' : 'calc(100vh - 100px)',
        padding: isMobile ? '1.5rem 1.25rem calc(5.5rem + env(safe-area-inset-bottom, 0px)) 1.25rem' : '1.75rem 1.25rem',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderColor: '#e2e8f0',
        borderRadius: isMobile ? '24px 0 0 24px' : '16px',
        boxShadow: isMobile ? '-15px 0 45px rgba(15, 23, 42, 0.25)' : '0 4px 20px rgba(0,0,0,0.03)',
        boxSizing: 'border-box',
        overflowY: 'auto',
        overscrollBehavior: 'contain',
        WebkitOverflowScrolling: 'touch',
        zIndex: isMobile ? 360 : 1,
        flexShrink: 0
      }}
    >
      <div>
        {/* Sidebar Brand Header */}
        <div style={{ paddingBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <img 
              src="/assets/logo/xor-boutique-logo.png" 
              alt="XOR BOUTIQUE" 
              style={{
                height: '40px',
                maxWidth: '190px',
                objectFit: 'contain',
                display: 'block',
                marginBottom: '0.35rem'
              }} 
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span className="badge" style={{
                fontSize: '0.65rem',
                padding: '0.15rem 0.6rem',
                borderRadius: '10px',
                background: isSuperAdmin ? '#fef3c7' : '#e0f2fe',
                color: isSuperAdmin ? '#92400e' : '#0369a1',
                fontWeight: 800,
                border: `1px solid ${isSuperAdmin ? '#fcd34d' : '#bae6fd'}`
              }}>
                {isSuperAdmin ? '👑 Super Admin' : '👔 Collaborateur'}
              </span>
            </div>
          </div>

          {isMobile && onCloseMobile && (
            <button
              onClick={onCloseMobile}
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
                cursor: 'pointer'
              }}
              title="Fermer le menu"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Current Active Session Badge Card */}
        <div style={{
          padding: '0.75rem 1rem',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: isSuperAdmin ? '#fef08a' : '#e0f2fe',
            color: isSuperAdmin ? '#854d0e' : '#0369a1',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.85rem'
          }}>
            {currentSession?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentSession?.name || 'Administrateur'}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', whiteSpace: 'nowrap' }}>
              Session active • @{currentSession?.username || 'admin'}
            </div>
          </div>
        </div>

        {/* Navigation Menu Section Label */}
        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.65rem', paddingLeft: '0.25rem' }}>
          GESTION DE LA BOUTIQUE
        </div>

        {/* Nav Menu Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
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
                  padding: '0.65rem 0.85rem',
                  borderRadius: '14px',
                  border: isActive ? '1px solid #0f172a' : '1px solid transparent',
                  background: isActive ? '#0f172a' : '#f8fafc',
                  color: isActive ? '#ffffff' : '#334155',
                  fontWeight: isActive ? 800 : 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: isActive ? '0 4px 14px rgba(15, 23, 42, 0.25)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0, textAlign: 'left' }}>
                  {/* Colored Icon Square Box */}
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    background: isActive ? 'rgba(255, 255, 255, 0.2)' : item.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <IconComp size={18} color={isActive ? '#ffffff' : item.color} />
                  </div>
                  <span style={{ fontSize: '0.88rem', textAlign: 'left', flex: 1, display: 'block', lineHeight: 1.25 }}>{item.label}</span>
                </div>

                {item.count !== undefined && (
                  <span style={{
                    fontSize: '0.75rem',
                    padding: '0.15rem 0.55rem',
                    borderRadius: '10px',
                    background: (item.id === 'orders' && item.count > 0) ? '#ef4444' : (isActive ? 'rgba(255, 255, 255, 0.25)' : '#e2e8f0'),
                    color: (item.id === 'orders' && item.count > 0) ? '#ffffff' : (isActive ? '#ffffff' : '#475569'),
                    fontWeight: 800,
                    boxShadow: (item.id === 'orders' && item.count > 0) ? '0 2px 8px rgba(239, 68, 68, 0.4)' : 'none',
                    flexShrink: 0
                  }}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer Action Buttons */}
      <div style={{ paddingTop: '1.25rem', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '1.5rem' }}>
        <button
          onClick={() => { onBackToStore(); if (isMobile && onCloseMobile) onCloseMobile(); }}
          className="btn btn-secondary"
          style={{ width: '100%', justifyContent: 'flex-start', textAlign: 'left', gap: '0.65rem', padding: '0.8rem 1rem', borderRadius: '14px', fontWeight: 700 }}
        >
          <Eye size={18} color="#2563eb" />
          <span style={{ textAlign: 'left' }}>Aperçu Client (Boutique)</span>
        </button>

        <button
          onClick={() => { onLogout(); if (isMobile && onCloseMobile) onCloseMobile(); }}
          className="btn btn-secondary"
          style={{ width: '100%', justifyContent: 'flex-start', textAlign: 'left', gap: '0.65rem', padding: '0.8rem 1rem', borderRadius: '14px', borderColor: '#fca5a5', background: '#fef2f2', color: '#dc2626', fontWeight: 700 }}
        >
          <LogOut size={18} color="#dc2626" />
          <span style={{ textAlign: 'left' }}>Déconnexion de l'Admin</span>
        </button>

        <div style={{ textAlign: 'center', marginTop: '0.25rem' }}>
          <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600 }}>
            Xor Boutique Pro • V2.4 🔒
          </span>
        </div>
      </div>
    </aside>
  );
}
