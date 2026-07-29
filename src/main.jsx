import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import './index.css';

// Global error listener to automatically recover from stale PWA cache / 404 script loading errors on new deployments
window.addEventListener('error', (event) => {
  const isChunkError = 
    (event.message && (event.message.includes('Loading chunk') || event.message.includes('ERR_ABORTED') || event.message.includes('404'))) ||
    (event.target && event.target.tagName === 'SCRIPT');
    
  if (isChunkError) {
    console.warn('New deployment asset detected. Clearing stale Service Worker cache & refreshing page...');
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (let registration of registrations) {
          registration.unregister();
        }
      }).finally(() => {
        window.location.reload();
      });
    } else {
      window.location.reload();
    }
  }
}, true);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
