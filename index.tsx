
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Register Service Worker for Offline Capabilities & Updates
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('SW registered: ', registration);

      // Check for updates
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New update available
              console.log('New content is available; please refresh.');
              // Dispatch event for App component to listen to
              window.dispatchEvent(new Event('pwa-update-available'));
            } else {
              // Content is cached for offline use.
              console.log('Content is cached for offline use.');
            }
          }
        };
      };
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
