import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { createStore } from './store/store';
import App from './App';
import './index.css';

/**
 * Register service worker for PWA offline functionality
 * Only registers in production builds
 */
const registerServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    if (import.meta.env?.MODE === 'production') {
      try {
        const registration = await navigator.serviceWorker.register(
          '/service-worker.js',
          { scope: '/' }
        );
        console.log(
          'Service Worker registered successfully:',
          registration.scope
        );

        // Check for updates periodically
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (
                newWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                console.log('New service worker available. Reload to update.');
              }
            });
          }
        });
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    } else {
      // Unregister service worker in development to avoid caching issues
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
          console.log('Service Worker unregistered in development mode');
        }
      });
    }
  }
};

const initializeApp = (): void => {
  const store = createStore();

  const rootElement = document.getElementById('root');

  if (!rootElement) {
    throw new Error('Root element not found');
  }

  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>
  );

  // Register service worker after app initialization
  registerServiceWorker();
};

initializeApp();
