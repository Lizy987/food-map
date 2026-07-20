import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import 'leaflet/dist/leaflet.css';
import './index.css';

// 使用原生 Leaflet（非 react-leaflet），避免 Vite 预打包 CJS/ESM 兼容问题
ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
