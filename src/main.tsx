import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// 注册 Service Worker，确保本主页打开一次后完全离线可用
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('App updated.');
  },
  onOfflineReady() {
    console.log('App is completely ready to work offline.');
  },
});

createRoot(document.getElementById('root')!).render(<App />);
