import React, { useState, useMemo } from 'react';
import { 
  Users, 
  DollarSign, 
  Zap, 
  MessageCircle, 
  Download, 
  MapPin,
  Trash2
} from 'lucide-react';

export default function AdminCustomersTab({ orders = [], formatCurrency, onDeleteCustomer }) {
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerFilter, setCustomerFilter] = useState('all'); // 'all' | 'vip' | 'repeat'
  const [copiedBroadcastStatus, setCopiedBroadcastStatus] = useState(false);

  const customersDirectory = useMemo(() => {
    const map = new Map();
    orders.forEach(order => {
      const rawPhone = order.phone || order.customerPhone || '';
      const phoneKey = rawPhone.replace(/[^\d+]/g, '');
      if (!phoneKey) return;

      if (!map.has(phoneKey)) {
        map.set(phoneKey, {
          phone: rawPhone,
          name: order.customerName || 'Client DamShop',
          address: order.address || order.deliveryAddress || 'Non spécifiée',
          city: order.customerCity || 'Abidjan / Lomé',
          ordersCount: 1,
          totalSpent: Number(order.total) || 0,
          lastOrderDate: order.date || 'Récemment',
          orders: [order]
        });
      } else {
        const existing = map.get(phoneKey);
        existing.ordersCount += 1;
        existing.totalSpent += (Number(order.total) || 0);
        existing.orders.push(order);
      }
    });
    return Array.from(map.values());
  }, [orders]);

  const filteredCustomers = useMemo(() => {
    return customersDirectory.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                            c.phone.includes(customerSearch) ||
                            c.city.toLowerCase().includes(customerSearch.toLowerCase());
      
      if (customerFilter === 'vip') return matchesSearch && c.totalSpent >= 100000;
      if (customerFilter === 'repeat') return matchesSearch && c.ordersCount >= 2;
      return matchesSearch;
    });
  }, [customersDirectory, customerSearch, customerFilter]);

  const handleCopyBroadcastList = () => {
    if (!filteredCustomers.length) {
      alert('Aucun client disponible dans la liste.');
      return;
    }
    const numbersList = filteredCustomers.map(c => c.phone).join('\n');
    navigator.clipboard.writeText(numbersList);
    setCopiedBroadcastStatus(true);
    setTimeout(() => setCopiedBroadcastStatus(false), 3000);
    alert(`${filteredCustomers.length} numéro(s) de téléphone copiés ! Vous pouvez les coller dans votre liste de diffusion WhatsApp.`);
  };

  const handleExportCustomersCSV = () => {
    if (!filteredCustomers.length) {
      alert('Aucun client disponible à exporter.');
      return;
    }
    let csv = 'Nom du Client,Telephone,Ville,Adresse,Commandes Effectuees,Total Depense (FCFA),Derniere Commande\n';
    filteredCustomers.forEach(c => {
      const cleanName = `"${(c.name || '').replace(/"/g, '""')}"`;
      const cleanPhone = `"${(c.phone || '').replace(/"/g, '""')}"`;
      const cleanCity = `"${(c.city || '').replace(/"/g, '""')}"`;
      const cleanAddr = `"${(c.address || '').replace(/"/g, '""')}"`;
      csv += `${cleanName},${cleanPhone},${cleanCity},${cleanAddr},${c.ordersCount},${c.totalSpent},${c.lastOrderDate}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Repertoire_Clients_Xor_Boutique_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxSizing: 'border-box' }}>
      
      {/* Top CRM Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem', background: '#ffffff', borderRadius: '16px', borderLeft: '4px solid #ec4899' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Users size={18} color="#ec4899" /> Répertoire Clients Unique
          </div>
          <div className="font-display" style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a' }}>
            {customersDirectory.length} Client(s)
          </div>
          <div style={{ fontSize: '0.78rem', color: '#10b981', marginTop: '0.3rem', fontWeight: 700 }}>
            Numéros WhatsApp extraits et prêts à contacter
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
            Cumul global des achats effectués par les clients
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
            Clients récurrents à cibler en priorité
          </div>
        </div>
      </div>

      {/* CRM Marketing Action Toolbar */}
      <div className="glass-panel" style={{ padding: '1.5rem', background: '#ffffff', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Search & Segment Filters */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', flex: 1, minWidth: '280px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Rechercher par nom, téléphone, ville..."
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
            style={{ maxWidth: '320px', fontSize: '0.88rem' }}
          />

          <div style={{ display: 'flex', gap: '0.4rem' }}>
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
            title="Copier tous les numéros sous forme de liste de diffusion WhatsApp"
          >
            <MessageCircle size={16} /> Copier Liste Diffusion WhatsApp
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleExportCustomersCSV}
            style={{ fontSize: '0.85rem' }}
            title="Télécharger le fichier Excel/CSV du répertoire clients"
          >
            <Download size={16} /> Exporter Répertoire CSV
          </button>
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className="glass-panel" style={{ overflowX: 'auto', width: '100%', background: '#ffffff', borderRadius: '16px', boxSizing: 'border-box' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0', background: '#f8fafc' }}>
              <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Client</th>
              <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Téléphone / WhatsApp</th>
              <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>📍 Localité / Adresse</th>
              <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Commandes</th>
              <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Dépensé</th>
              <th style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Marketing Direct</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  <Users size={36} style={{ marginBottom: '0.5rem', opacity: 0.4 }} />
                  <div>Aucun client trouvé dans le répertoire pour le moment.</div>
                </td>
              </tr>
            ) : (
              filteredCustomers.map((customer, idx) => {
                const cleanPhone = (customer.phone || '').replace(/[^\d+]/g, '');
                const whatsappLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Bonjour ${customer.name} ! 👋 Merci pour vos achats chez Xor Boutique. Découvrez nos nouveaux arrivages ! 🛍️`)}`;

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
                          {customer.totalSpent >= 100000 && (
                            <span className="badge badge-gold" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>👑 Client VIP</span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '1rem 1.25rem' }} className="font-mono">
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{customer.phone}</div>
                    </td>

                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#475569', fontSize: '0.85rem' }}>
                        <MapPin size={15} color="#2563eb" style={{ flexShrink: 0 }} />
                        <span>{customer.address} ({customer.city})</span>
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
                        <a
                          href={whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary"
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem', background: '#25D366', borderColor: '#25D366', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                        >
                          <MessageCircle size={14} /> Envoyer Offre WhatsApp
                        </a>

                        {onDeleteCustomer && (
                          <button
                            type="button"
                            className="btn btn-danger"
                            style={{ padding: '0.4rem 0.65rem', background: '#ef4444', borderColor: '#ef4444', color: '#ffffff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}
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
    </div>
  );
}
