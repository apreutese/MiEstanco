// server.js — Servidor de producción para MiEstanco PWA
// Sirve el build de Angular + proxy /api → Spring Boot 8080

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4201;
const DIST = path.join(__dirname, 'dist/miestanco-frontend/browser');

// Salta la pantalla de aviso de ngrok en TODAS las respuestas
// Necesario para que la PWA cargue directamente sin interstitial
app.use((req, res, next) => {
  res.setHeader('ngrok-skip-browser-warning', 'true');
  next();
});

// 1. Proxy de API al backend Spring Boot
app.use(
  createProxyMiddleware({
    pathFilter: '/api',
    target: 'http://localhost:8080',
    changeOrigin: true,
  })
);

// 2. Proxy de /uploads al backend (fotos de productos)
//    Backend context-path es /api, así que /uploads → /api/uploads
app.use(
  createProxyMiddleware({
    pathFilter: '/uploads',
    target: 'http://localhost:8080',
    changeOrigin: true,
    pathRewrite: { '^/uploads': '/api/uploads' },
  })
);

// 2. Archivos estáticos del build de Angular
app.use(express.static(DIST, {
  // Service worker: no cachear ngsw.json ni ngsw-worker.js
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('ngsw.json') || filePath.endsWith('ngsw-worker.js')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// 3. SPA fallback → index.html para todas las rutas Angular
app.use((req, res) => {
  res.sendFile(path.join(DIST, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ MiEstanco producción en http://0.0.0.0:${PORT}`);
  console.log(`   API → http://localhost:8080`);
});
