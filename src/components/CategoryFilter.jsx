import React from 'react';
import { LayoutGrid, Sparkles, User, Cpu, Watch, Tag } from 'lucide-react';

const ICON_MAP = {
  Sparkles,
  User,
  Cpu,
  Watch,
  Tag
};

export default function CategoryFilter({ categories, activeCategory, onSelectCategory }) {
  return (
    <div style={{
      maxWidth: '1440px',
      margin: '0 auto 2rem auto',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      overflowX: 'auto',
      paddingBottom: '0.5rem'
    }}>
      {/* "Tous" Pill */}
      <button
        onClick={() => onSelectCategory('all')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.65rem 1.35rem',
          borderRadius: 'var(--radius-full)',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          border: activeCategory === 'all' ? '1px solid #0f172a' : '1px solid #e2e8f0',
          background: activeCategory === 'all' ? '#0f172a' : '#ffffff',
          color: activeCategory === 'all' ? '#ffffff' : '#0f172a',
          fontWeight: activeCategory === 'all' ? 700 : 500,
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
          transition: 'all 0.2s ease'
        }}
      >
        <LayoutGrid size={16} />
        <span>Tous les produits</span>
      </button>

      {/* Dynamic Categories */}
      {categories.map((category) => {
        const IconComponent = ICON_MAP[category.icon] || Tag;
        const isActive = activeCategory === category.id;

        return (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.35rem',
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              border: isActive ? '1px solid #0f172a' : '1px solid #e2e8f0',
              background: isActive ? '#0f172a' : '#ffffff',
              color: isActive ? '#ffffff' : '#0f172a',
              fontWeight: isActive ? 700 : 500,
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
              transition: 'all 0.2s ease'
            }}
          >
            <IconComponent size={16} style={{ color: isActive ? '#ffffff' : (category.color || '#2563eb') }} />
            <span>{category.name}</span>
            <span className="font-mono" style={{
              fontSize: '0.75rem',
              padding: '0.1rem 0.5rem',
              borderRadius: '10px',
              background: isActive ? 'rgba(255, 255, 255, 0.2)' : '#f1f5f9',
              color: isActive ? '#ffffff' : '#64748b',
              marginLeft: '0.2rem'
            }}>
              {category.count || 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}
