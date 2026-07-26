import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  ShoppingBag, 
  Star, 
  AlertTriangle, 
  X,
  Info
} from 'lucide-react';
import { 
  getNotifications, 
  markNotificationsAsRead, 
  clearNotifications,
  subscribeToStore 
} from '../../services/store';

export default function AdminNotificationModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(getNotifications());
  const modalRef = useRef(null);

  useEffect(() => {
    const unsubscribe = subscribeToStore(() => {
      setNotifications(getNotifications());
    });
    return () => unsubscribe();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    const updated = markNotificationsAsRead();
    setNotifications(updated);
  };

  const handleClearAll = () => {
    const updated = clearNotifications();
    setNotifications(updated);
  };

  const formatTimeAgo = (isoString) => {
    if (!isoString) return 'Récemment';
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    return new Date(isoString).toLocaleDateString('fr-FR');
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'order': return <ShoppingBag size={16} color="#d97706" />;
      case 'review': return <Star size={16} color="#eab308" />;
      case 'stock': return <AlertTriangle size={16} color="#ef4444" />;
      default: return <Info size={16} color="#2563eb" />;
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={modalRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          background: isOpen ? '#0f172a' : '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '0.6rem 0.75rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isOpen ? '#ffffff' : '#0f172a',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
        }}
        title="Notifications de la Boutique"
      >
        <Bell size={20} color={isOpen ? '#ffffff' : '#0f172a'} />

        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            background: '#ef4444',
            color: '#ffffff',
            fontSize: '0.72rem',
            fontWeight: 800,
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #ffffff',
            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)',
            animation: 'pulse 2s infinite'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Modal */}
      {isOpen && (
        <div className="glass-panel animate-fade-in" style={{
          position: 'absolute',
          top: 'calc(100% + 10px)',
          right: 0,
          width: '360px',
          maxWidth: '90vw',
          maxHeight: '480px',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 12px 40px rgba(15, 23, 42, 0.18)',
          zIndex: 400,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #e2e8f0'
        }}>
          {/* Modal Header */}
          <div style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#f8fafc'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={18} color="#2563eb" />
              <span className="font-display" style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>
                Notifications ({unreadCount} non lues)
              </span>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Notifications List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
            {notifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#94a3b8' }}>
                <Bell size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Aucune notification récente.</div>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: '12px',
                    marginBottom: '0.4rem',
                    background: n.read ? '#ffffff' : '#eff6ff',
                    borderLeft: n.read ? '3px solid #cbd5e1' : '3px solid #2563eb',
                    display: 'flex',
                    gap: '0.75rem',
                    alignItems: 'flex-start',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                    flexShrink: 0,
                    marginTop: '0.1rem'
                  }}>
                    {getIconForType(n.type)}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
                        {n.title}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500 }}>
                        {formatTimeAgo(n.timestamp)}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.2rem', lineHeight: 1.4 }}>
                      {n.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Modal Footer Controls */}
          {notifications.length > 0 && (
            <div style={{
              padding: '0.75rem 1.25rem',
              borderTop: '1px solid #e2e8f0',
              background: '#f8fafc',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.8rem'
            }}>
              <button
                onClick={handleMarkAllRead}
                style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <CheckCheck size={14} /> Tout marquer comme lu
              </button>

              <button
                onClick={handleClearAll}
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <Trash2 size={14} /> Effacer
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
