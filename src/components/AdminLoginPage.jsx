import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  AlertCircle,
  KeyRound,
  Sparkles
} from 'lucide-react';
import { getAdminAccounts, setActiveAdminSession } from '../services/store';

export default function AdminLoginPage({ onLoginSuccess, onBackToStore }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password.trim()) {
      setErrorMsg('Veuillez remplir votre identifiant et votre mot de passe.');
      return;
    }

    setIsLoading(true);

    // Simulate secure auth delay for smooth UX
    setTimeout(() => {
      const accounts = getAdminAccounts();
      const inputUser = username.trim().toLowerCase();
      const inputPass = password.trim();

      const matchedAccount = accounts.find(acc => {
        const accUser = (acc.username || '').trim().toLowerCase();
        const accPass = (acc.password || '').trim();
        return accUser === inputUser && accPass === inputPass;
      });

      // Default fallback owner check
      const isDefaultOwner = (inputUser === 'admin' || inputUser === 'admin@damshop.com') && 
                             (inputPass === 'admin' || inputPass === 'damshop2026' || inputPass === '1234');

      if (matchedAccount || isDefaultOwner) {
        const sessionUser = matchedAccount || {
          id: 'acc_super',
          username: 'admin',
          role: 'super_admin',
          name: 'Propriétaire (Super Admin)'
        };

        setActiveAdminSession(sessionUser, rememberMe);

        if (rememberMe) {
          localStorage.setItem('damshop_admin_authenticated', 'true');
        } else {
          sessionStorage.setItem('damshop_admin_authenticated', 'true');
        }
        setIsLoading(false);
        onLoginSuccess();
      } else {
        setIsLoading(false);
        setErrorMsg('Identifiant ou mot de passe incorrect. (Note: Si vous avez créé ce collaborateur sur un autre appareil ou sur localhost, connectez-vous avec le compte admin sur ce site pour ajouter le collaborateur)');
      }
    }, 600);
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Hanken Grotesk', system-ui, sans-serif"
    }} className="animate-fade-in">
      
      {/* Background Decorative Ambient Soft Orbs */}
      <div style={{
        position: 'absolute',
        top: '-150px',
        left: '-150px',
        width: '450px',
        height: '450px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(37, 99, 235, 0.08) 0%, rgba(255,255,255,0) 70%)',
        pointerEvents: 'none',
        filter: 'blur(40px)'
      }} />

      <div style={{
        position: 'absolute',
        bottom: '-150px',
        right: '-150px',
        width: '450px',
        height: '450px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(217, 119, 6, 0.08) 0%, rgba(255,255,255,0) 70%)',
        pointerEvents: 'none',
        filter: 'blur(40px)'
      }} />

      {/* Main Clean White Authentication Card */}
      <div style={{
        maxWidth: '460px',
        width: '100%',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '24px',
        padding: '2.75rem 2.25rem',
        boxShadow: '0 25px 70px rgba(15, 23, 42, 0.08)',
        position: 'relative',
        zIndex: 10,
        boxSizing: 'border-box'
      }}>
        
        {/* Brand Logo & Security Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            border: '1px solid rgba(228, 186, 113, 0.4)',
            marginBottom: '1rem',
            boxShadow: '0 8px 20px rgba(15, 23, 42, 0.15)'
          }}>
            <ShieldCheck size={32} color="#E4BA71" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
            <h1 className="font-display" style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
              Xor Boutique
            </h1>
            <span style={{
              fontSize: '0.65rem',
              fontWeight: 800,
              color: '#b45309',
              background: '#fef3c7',
              border: '1px solid #fde68a',
              padding: '0.15rem 0.55rem',
              borderRadius: '20px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em'
            }}>
              PRO ADMIN
            </span>
          </div>

          <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0 }}>
            Connexion sécurisée au Tableau de Bord
          </p>
        </div>

        {/* Error Alert Bar */}
        {errorMsg && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '0.85rem 1rem',
            borderRadius: '12px',
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            lineHeight: 1.4
          }}>
            <AlertCircle size={18} color="#dc2626" style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Username Field */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Identifiant Administrateur
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem 0.85rem 2.75rem',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  color: '#0f172a',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
                onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Mot de Passe
              </label>
            </div>
            
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.85rem 2.75rem 0.85rem 2.75rem',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  color: '#0f172a',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
                onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '4px'
                }}
                title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0.2rem 0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: '#475569' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: '#0f172a', width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <span>Rester connecté sur cet appareil</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '0.95rem',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '1rem',
              cursor: isLoading ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              boxShadow: '0 4px 20px rgba(15, 23, 42, 0.25)',
              transition: 'all 0.2s ease',
              marginTop: '0.5rem'
            }}
          >
            {isLoading ? (
              <span>Vérification en cours...</span>
            ) : (
              <>
                <KeyRound size={18} />
                <span>Se Connecter à l'Administration</span>
              </>
            )}
          </button>

        </form>


        {/* Back to Store Public Page Button */}
        <div style={{ textAlign: 'center', marginTop: '1.75rem' }}>
          <button
            onClick={onBackToStore}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'color 0.2s ease'
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = '#0f172a')}
            onMouseOut={(e) => (e.currentTarget.style.color = '#64748b')}
          >
            <ArrowLeft size={16} /> Retour à la boutique publique
          </button>
        </div>

      </div>

    </div>
  );
}
