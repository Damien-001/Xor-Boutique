import React, { useState } from 'react';
import { Star, ThumbsUp, CheckCircle, MessageSquare, Plus, User } from 'lucide-react';
import { getReviews, addReview } from '../services/store';

export default function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState(() => getReviews(productId));
  const [isAdding, setIsAdding] = useState(false);
  const [newReview, setNewReview] = useState({
    author: '',
    rating: 5,
    comment: '',
    city: 'Abidjan'
  });

  const handleAddReview = (e) => {
    e.preventDefault();
    if (!newReview.author.trim() || !newReview.comment.trim()) {
      alert('Veuillez renseigner votre nom et votre avis.');
      return;
    }

    const created = addReview({
      productId,
      author: newReview.author.trim(),
      rating: Number(newReview.rating),
      comment: newReview.comment.trim(),
      city: newReview.city.trim() || 'Abidjan',
      date: new Date().toLocaleDateString('fr-FR')
    });

    setReviews(getReviews(productId));
    setIsAdding(false);
    setNewReview({ author: '', rating: 5, comment: '', city: 'Abidjan' });
  };

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + Number(r.rating || 5), 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <div style={{ marginTop: '3rem', borderTop: '1px solid #e2e8f0', paddingTop: '2.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h3 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <MessageSquare size={22} color="#2563eb" /> Avis & Expériences Clients ({reviews.length})
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ display: 'flex', gap: '0.15rem' }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={18} fill="#f59e0b" color="#f59e0b" />
              ))}
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>{avgRating} / 5.0</span>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>({reviews.length} avis vérifiés)</span>
          </div>
        </div>

        <button 
          className="btn btn-primary"
          onClick={() => setIsAdding(!isAdding)}
          style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Plus size={16} /> Écrire un Avis Client
        </button>
      </div>

      {/* Add Review Form Modal / Inline Box */}
      {isAdding && (
        <form onSubmit={handleAddReview} className="glass-panel" style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '16px', marginBottom: '2rem', border: '1px solid #cbd5e1' }}>
          <h4 style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: '1rem', color: '#0f172a' }}>
            Partagez votre avis sur cet article
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label className="form-label">Votre Nom / Prénom</label>
              <input 
                type="text"
                className="form-input"
                placeholder="ex: Aminata K."
                value={newReview.author}
                onChange={(e) => setNewReview({ ...newReview, author: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="form-label">Votre Ville</label>
              <input 
                type="text"
                className="form-input"
                placeholder="ex: Abidjan, Bouaké..."
                value={newReview.city}
                onChange={(e) => setNewReview({ ...newReview, city: e.target.value })}
              />
            </div>

            <div>
              <label className="form-label">Note globale sur 5</label>
              <select 
                className="form-input"
                value={newReview.rating}
                onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
              >
                <option value="5">⭐⭐⭐⭐⭐ Excellent (5/5)</option>
                <option value="4">⭐⭐⭐⭐ Très bon (4/5)</option>
                <option value="3">⭐⭐⭐ Correct (3/5)</option>
                <option value="2">⭐⭐ Moyen (2/5)</option>
                <option value="1">⭐ Décevant (1/5)</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Votre Commentaire</label>
            <textarea 
              className="form-input"
              rows="3"
              placeholder="Qu'avez-vous pensé de cet article ? (Qualité, livraison, taille...)"
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              required
            ></textarea>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAdding(false)}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary">
              Publier l'Avis
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', background: '#f8fafc', borderRadius: '16px', color: '#64748b' }}>
            Soyez le premier à donner votre avis sur cet article !
          </div>
        ) : (
          reviews.map((r, idx) => (
            <div key={r.id || idx} className="glass-card" style={{ padding: '1.25rem', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#dbeafe', color: '#2563eb', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>
                    {r.author ? r.author.charAt(0).toUpperCase() : 'C'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {r.author}
                      <span className="badge badge-success" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem' }}>
                        <CheckCircle size={10} /> Achat Vérifié
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {r.city || 'Abidjan'} • {r.date || 'Récemment'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.1rem' }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star 
                      key={s} 
                      size={14} 
                      fill={s <= Number(r.rating || 5) ? "#f59e0b" : "none"} 
                      color={s <= Number(r.rating || 5) ? "#f59e0b" : "#cbd5e1"} 
                    />
                  ))}
                </div>
              </div>

              <p style={{ color: '#334155', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                "{r.comment}"
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
