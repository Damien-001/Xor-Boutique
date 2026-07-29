import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
          fontFamily: 'sans-serif',
          background: '#0f172a',
          color: '#ffffff'
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '1rem'
          }}>🛍️</div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#f8fafc' }}>
            Xor Boutique - Une erreur est survenue
          </h2>
          <p style={{ color: '#94a3b8', maxWidth: '480px', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            L'application s'est interrompue inopinément. Cliquez sur le bouton ci-dessous pour rafraîchir la page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 1.75rem',
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '0.95rem'
            }}
          >
            🔄 Recharger la page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
