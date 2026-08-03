import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {registerSW} from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

// Register PWA service worker for offline caching and instant loading
const updateSW = registerSW({
  onNeedRefresh() {
    console.log('DropLink update available, refreshing SW...');
    updateSW(true);
  },
  onOfflineReady() {
    console.log('DropLink PWA is ready for offline use.');
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
