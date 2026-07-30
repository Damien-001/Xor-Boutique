import React, { useState, useMemo } from 'react';
import { 
  Users, 
  DollarSign, 
  Zap, 
  MessageCircle, 
  Download, 
  MapPin,
  Trash2,
  Tag,
  CheckCircle2,
  X,
  Send,
  Sparkles,
  Filter
} from 'lucide-react';

export default function AdminCustomersTab({ orders = [], categories = [], formatCurrency, onDeleteCustomer }) {
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerFilter, setCustomerFilter] = useState('all'); // 'all' | 'vip' | 'repeat' | 'optin'
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [copiedBroadcastStatus, setCopiedBroadcastStatus] = useState(false);
  
  // WhatsApp Message Generator Modal State
  const [targetCustomer, setTargetCustomer] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('category');
  const [customMessage, setCustomMessage] = useState('');

  // Build unique customers directory from orders
  const customersDirectory = useMemo(() => {
    const map = new Map();
    orders.forEach(order => {
      const rawPhone = order.phone || order.customerPhone || '';
      const phoneKey = rawPhone.replace(/[^\d+]/g, '');
      if (!phoneKey) return;

      // Extract categories from order items
      const orderCategories = [];
      if (Array.isArray(order.purchasedCategories)) {
        orderCategories.push(...order.purchasedCategories);
      }
      if (Array.isArray(order.items)) {
        order.items.forEach(item => {
          if (item.category) orderCategories.push(item.category);
        });
      }

      const whatsappConsent = order.whatsappConsent !== false;

      if (!map.has(phoneKey)) {
        map.set(phoneKey, {
          phone: rawPhone,
          name: order.customerName || 'Client DamShop',
          address: order.address || order.deliveryAddress || 'Non spécifiée',
          city: order.customerCity || 'Abidjan / Lomé',
          ordersCount: 1,
          totalSpent: Number(order.total) || 0,
          lastOrderDate: order.date || 'Récemment',
          whatsappConsent,
          categories: Array.from(new Set(orderCategories)),
          orders: [order]
        });
      } else {
        const existing = map.get(phoneKey);
        existing.ordersCount += 1;
        existing.totalSpent += (Number(order.total) || 0);
        existing.orders.push(order);
        orderCategories.forEach(cat => {
          if (!existing.categories.includes(cat)) {
            existing.categories.push(cat);
          }
        });
        if (whatsappConsent) existing.whatsappConsent = true;
      }
    });
    return Array.from(map.values());
  }, [orders]);

  // Filtered list based on search, segment, and category
  const filteredCustomers = useMemo(() => {
    return customersDirectory.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                            c.phone.includes(customerSearch) ||
                            c.city.toLowerCase().includes(customerSearch.toLowerCase());
      
      let matchesSegment = true;
      if (customerFilter === 'vip') matchesSegment = c.totalSpent >= 100000;
      if (customerFilter === 'repeat') matchesSegment = c.ordersCount >= 2;
      if (customerFilter === 'optin') matchesSegment = c.whatsappConsent === true;

      let matchesCategory = true;
      if (selectedCategoryFilter !== 'all') {
        matchesCategory = c.categories.some(cat => 
          cat.toLowerCase() === selectedCategoryFilter.toLowerCase()
        );
      }

      return matchesSearch && matchesSegment && matchesCategory;
    });
  }, [customersDirectory, customerSearch, customerFilter, selectedCategoryFilter]);

  const handleCopyBroadcastList = () => {
    if (!filteredCustomers.length) {
      alert('Aucun client disponible dans la liste.');
      return;
    }
    const numbersList = filteredCustomers.map(c => c.phone).join('\n');
    navigator.clipboard.writeText(numbersList);
    setCopiedBroadcastStatus(true);
    setTimeout(() => setCopiedBroadcastStatus(false), 3000);
    alert(`${filteredCustomers.length} numéro(s) de téléphone copiés ! Vous pouvez les coller directement dans votre liste de diffusion WhatsApp.`);
  };

  const handleExportCustomersCSV = () => {
    if (!filteredCustomers.length) {
      alert('Aucun client disponible à exporter.');
      return;
    }
    let csv = 'Nom du Client,Telephone,Ville,Adresse,Commandes,Total Depense (FCFA),Categories d Interet,Accord WhatsApp,Derniere Commande\n';
    filteredCustomers.forEach(c => {
      const cleanName = `"${(c.name || '').replace(/"/g, '""')}"`;
      const cleanPhone = `"${(c.phone || '').replace(/"/g, '""')}"`;
      const cleanCity = `"${(c.city || '').replace(/"/g, '""')}"`;
      const cleanAddr = `"${(c.address || '').replace(/"/g, '""')}"`;
      const cleanCats = `"${(c.categories || []).join(', ').replace(/"/g, '""')}"`;
      const optIn = c.whatsappConsent ? 'Oui' : 'Non';
      csv += `${cleanName},${cleanPhone},${cleanCity},${cleanAddr},${c.ordersCount},${c.totalSpent},${cleanCats},${optIn},${c.lastOrderDate}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Repertoire_Clients_DamShop_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open Message Modal for a customer
  const handleOpenWhatsAppModal = (customer) => {
    setTargetCustomer(customer);
    const mainCat = customer.categories[0] || 'vos articles préférés';
    const catObj = categories.find(cat => cat.id === mainCat || cat.name.toLowerCase() === mainCat.toLowerCase());
    const catName = catObj ? catObj.name : mainCat;

    const initialMsg = `Bonjour ${customer.name} ! 👋\nDe nouveaux arrivages sont arrivés chez DamShop dans la catégorie *${catName}* ! 🛍️\n\nDécouvrez les nouveautés directement sur notre boutique : ${window.location.origin}`;
    setSelectedTemplate('category');
    setCustomMessage(initialMsg);
  };

  const handleTemplateChange = (templateType) => {
    if (!targetCustomer) return;
    setSelectedTemplate(templateType);
    const mainCat = targetCustomer.categories[0] || 'vos articles préférés';
    const catObj = categories.find(cat => cat.id === mainCat || cat.name.toLowerCase() === mainCat.toLowerCase());
    const catName = catObj ? catObj.name : mainCat;

    if (templateType === 'category') {
      setCustomMessage(`Bonjour ${targetCustomer.name} ! 👋\nDe nouveaux arrivages sont arrivés chez DamShop dans la catégorie *${catName}* ! 🛍️\n\nDécouvrez les nouveautés sur notre boutique : ${window.location.origin}`);
    } else if (templateType === 'vip') {
      setCustomMessage(`Bonjour ${targetCustomer.name} ! 👑\nEn tant que client(e) privilégie(e) de DamShop, nous vous offrons une remise spéciale sur notre nouvelle collection !\n\nProfitez-en ici : ${window.location.origin}`);
    } else if (templateType === 'revival') {
      setCustomMessage(`Bonjour ${targetCustomer.name} ! 👋\nCela fait un moment ! De superbes nouveautés sont disponibles sur DamShop.\n\nVenez jeter un coup d'œil : ${window.location.origin}`);
    }
  };

  const handleSendWhatsAppMessage = () => {
    if (!targetCustomer) return;
    const cleanPhone = (targetCustomer.phone || '').replace(/[^\d+]/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(customMessage)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setTargetCustomer(null);
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxSizing: 'border-box' }}>
      
      {/* Top CRM Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem', background: '#ffffff', borderRadius: '16px', borderLeft: '4px solid #25D366' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Users size={18} color="#25D366" /> Contacts WhatsApp Capturés
          </div>
          <div className="font-display" style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a' }}>
            {customersDirectory.length} Client(s)
          </div>
          <div style={{ fontSize: '0.78rem', color: '#16a34a', marginTop: '0.3rem', fontWeight: 700 }}>
            {customersDirectory.filter(c => c.whatsappConsent).length} abonnés aux offres WhatsApp
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', background: '#ffffff', borderRadius: '16px', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <DollarSign size={18} color="#10b981" /> Chiffre d'Affaires Répertoire
          </div>
          <div className="font-mono" style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a' }}>
            {formatCurrency(customersDirectory.reduce((sum, c) => sum + c.totalSpent, 0))}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.3rem' }}>
            Cumul global des achats effectués en mode invité
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', background: '#ffffff', borderRadius: '16px', borderLeft: '4px solid #2563eb' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Zap size={18} color="#2563eb" /> Clients Fidèles (2+ Achats)
          </div>
          <div className="font-display" style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a' }}>
            {customersDirectory.filter(c => c.ordersCount >= 2).length} Client(s)
          </div>
          <div style={{ fontSize: '0.78rem', color: '#2563eb', marginTop: '0.3rem', fontWeight: 700 }}>
            Clients récurrents à relancer en priorité
          </div>
        </div>
      </div>

      {/* CRM Marketing Action Toolbar */}
      <div className="glass-panel" style={{ padding: '1.5rem', background: '#ffffff', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Search & Segment Filters */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', flex: 1, minWidth: '280px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Rechercher par nom, téléphone, ville..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              style={{ maxWidth: '300px', fontSize: '0.88rem' }}
            />

            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={`btn ${customerFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setCustomerFilter('all')}
                style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
              >
                Tous ({customersDirectory.length})
              </button>
              <button
                type="button"
                className={`btn ${customerFilter === 'vip' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setCustomerFilter('vip')}
                style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
              >
                👑 VIP (&gt;100k)
              </button>
              <button
                type="button"
                className={`btn ${customerFilter === 'repeat' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setCustomerFilter('repeat')}
                style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
              >
                🔄 Fidèles (2+)
              </button>
            </div>
          </div>

          {/* Export & Broadcast Tools */}
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleCopyBroadcastList}
              style={{ background: '#25D366', borderColor: '#25D366', fontSize: '0.85rem' }}
              title="Copier les numéros de la sélection pour votre liste de diffusion WhatsApp"
            >
              <MessageCircle size={16} /> {copiedBroadcastStatus ? 'Copié !' : 'Copier Liste WhatsApp'}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleExportCustomersCSV}
              style={{ fontSize: '0.85rem' }}
              title="Télécharger le fichier Excel/CSV du répertoire"
            >
              <Download size={16} /> Exporter CSV
            </button>
          </div>
        </div>

        {/* Category Interest Filter Toolbar */}
        {categories.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Filter size={14} color="#2563eb" /> Filtrer par Intérêt / Catégorie :
            </span>
            
            <button
              type="button"
              onClick={() => setSelectedCategoryFilter('all')}
              className={`badge ${selectedCategoryFilter === 'all' ? 'badge-blue' : ''}`}
              style={{
                cursor: 'pointer',
                padding: '0.35rem 0.75rem',
                borderRadius: '20px',
                fontSize: '0.78rem',
                border: selectedCategoryFilter === 'all' ? '1px solid #2563eb' : '1px solid #e2e8f0',
                background: selectedCategoryFilter === 'all' ? '#eff6ff' : '#f8fafc',
                color: selectedCategoryFilter === 'all' ? '#2563eb' : '#64748b',
                fontWeight: 700
              }}
            >
              Toutes les catégories
            </button>

            {categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategoryFilter(cat.id)}
                style={{
                  cursor: 'pointer',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '0.78rem',
                  border: selectedCategoryFilter === cat.id ? '1px solid #25D366' : '1px solid #e2e8f0',
                  background: selectedCategoryFilter === cat.id ? '#f0fdf4' : '#ffffff',
                  color: selectedCategoryFilter === cat.id ? '#166534' : '#475569',
                  fontWeight: 700
                }}
              >
                🏷️ {cat.name}
              </button>
            ))}
          </div>
        )}

      </div>

      {/* Customer Directory Table */}
      <div className="glass-panel" style={{ overflowX: 'auto', width: '100%', background: '#ffffff', borderRadius: '16px', boxSizing: 'border-box' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0', background: '#f8fafc' }}>
              <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Client Invité</th>
              <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>WhatsApp</th>
              <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Catégories d'Intérêt</th>
              <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Commandes</th>
              <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Dépensé</th>
              <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Action WhatsApp</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  <Users size={36} style={{ marginBottom: '0.5rem', opacity: 0.4 }} />
                  <div>Aucun client trouvé dans le répertoire pour les filtres sélectionnés.</div>
                </td>
              </tr>
            ) : (
              filteredCustomers.map((customer, idx) => {
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: '#0f172a' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: '#f1f5f9',
                          color: '#2563eb',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.9rem'
                        }}>
                          {(customer.name?.[0] || 'C').toUpperCase()}
                        </div>
                        <div>
                          <div>{customer.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400 }}>
                            📍 {customer.address}
                          </div>
                          {customer.totalSpent >= 100000 && (
                            <span className="badge badge-gold" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', marginTop: '0.2rem' }}>👑 Client VIP</span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '1rem 1.25rem' }} className="font-mono">
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{customer.phone}</div>
                      {customer.whatsappConsent ? (
                        <span style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                          <CheckCircle2 size={12} /> Opt-in WhatsApp
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Standard</span>
                      )}
                    </td>

                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                        {customer.categories.length > 0 ? (
                          customer.categories.map((catId, cIdx) => {
                            const catObj = categories.find(c => c.id === catId || c.name.toLowerCase() === catId.toLowerCase());
                            const label = catObj ? catObj.name : catId;
                            return (
                              <span key={cIdx} className="badge badge-blue" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', background: '#eff6ff', color: '#1d4ed8' }}>
                                🏷️ {label}
                              </span>
                            );
                          })
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Commandes générales</span>
                        )}
                      </div>
                    </td>

                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span className="badge badge-blue font-mono" style={{ fontWeight: 800 }}>
                        {customer.ordersCount} Commande(s)
                      </span>
                    </td>

                    <td style={{ padding: '1rem 1.25rem', fontWeight: 900, color: '#10b981' }} className="font-mono">
                      {formatCurrency(customer.totalSpent)}
                    </td>

                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => handleOpenWhatsAppModal(customer)}
                          style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem', background: '#25D366', borderColor: '#25D366', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}
                        >
                          <MessageCircle size={15} /> Message WhatsApp
                        </button>

                        {onDeleteCustomer && (
                          <button
                            type="button"
                            className="btn btn-danger"
                            style={{ padding: '0.45rem 0.65rem', background: '#ef4444', borderColor: '#ef4444', color: '#ffffff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}
                            onClick={() => onDeleteCustomer(customer)}
                            title="Supprimer ce client du répertoire"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* WHATSAPP MESSAGE GENERATOR MODAL */}
      {targetCustomer && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }} onClick={() => setTargetCustomer(null)}>
          
          <div 
            className="glass-panel animate-scale-up" 
            style={{
              maxWidth: '520px',
              width: '100%',
              background: '#ffffff',
              borderRadius: '20px',
              padding: '1.5rem',
              color: '#0f172a',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.85rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#15803d' }}>
                <MessageCircle size={22} color="#25D366" />
                <h3 className="font-display" style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                  Envoyer une Offre WhatsApp
                </h3>
              </div>
              <button 
                onClick={() => setTargetCustomer(null)} 
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Target Customer Info */}
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.85rem', borderRadius: '12px', marginBottom: '1rem', fontSize: '0.85rem' }}>
              <div style={{ fontWeight: 800, color: '#166534', marginBottom: '0.25rem' }}>
                👤 {targetCustomer.name} ({targetCustomer.phone})
              </div>
              <div style={{ color: '#15803d', fontSize: '0.78rem' }}>
                Catégories préférées : <strong>{targetCustomer.categories.join(', ') || 'Général'}</strong> • {targetCustomer.ordersCount} commande(s)
              </div>
            </div>

            {/* Template Selection */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem', display: 'block' }}>
                Choisir un modèle de message :
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => handleTemplateChange('category')}
                  style={{
                    padding: '0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    borderRadius: '8px',
                    border: selectedTemplate === 'category' ? '2px solid #25D366' : '1px solid #cbd5e1',
                    background: selectedTemplate === 'category' ? '#f0fdf4' : '#ffffff',
                    color: selectedTemplate === 'category' ? '#166534' : '#475569',
                    cursor: 'pointer'
                  }}
                >
                  🏷️ Nouveautés
                </button>
                <button
                  type="button"
                  onClick={() => handleTemplateChange('vip')}
                  style={{
                    padding: '0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    borderRadius: '8px',
                    border: selectedTemplate === 'vip' ? '2px solid #25D366' : '1px solid #cbd5e1',
                    background: selectedTemplate === 'vip' ? '#f0fdf4' : '#ffffff',
                    color: selectedTemplate === 'vip' ? '#166534' : '#475569',
                    cursor: 'pointer'
                  }}
                >
                  👑 Offre VIP
                </button>
                <button
                  type="button"
                  onClick={() => handleTemplateChange('revival')}
                  style={{
                    padding: '0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    borderRadius: '8px',
                    border: selectedTemplate === 'revival' ? '2px solid #25D366' : '1px solid #cbd5e1',
                    background: selectedTemplate === 'revival' ? '#f0fdf4' : '#ffffff',
                    color: selectedTemplate === 'revival' ? '#166534' : '#475569',
                    cursor: 'pointer'
                  }}
                >
                  👋 Relance Client
                </button>
              </div>
            </div>

            {/* Custom Textarea */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem', display: 'block' }}>
                Personnaliser le texte du message :
              </label>
              <textarea
                rows={5}
                className="form-input"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                style={{ width: '100%', fontSize: '0.85rem', lineHeight: 1.4, resize: 'vertical' }}
              />
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setTargetCustomer(null)}
              >
                Annuler
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 2, background: '#25D366', borderColor: '#25D366', justifyContent: 'center' }}
                onClick={handleSendWhatsAppMessage}
              >
                <Send size={18} /> Ouvrir sur WhatsApp 🚀
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
