/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import http from 'http';
import type { IncomingMessage, ServerResponse } from 'http';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

/**
 * /api so'rovlarini backendga uzatadi.
 * Muhim: body parser DAN OLDIN ishlashi kerak — aks holda payload yo'qoladi.
 */
function proxyToBackend(req: IncomingMessage, res: ServerResponse): void {
  const originalUrl = (req as any).originalUrl || req.url || '/';
  const targetPath = originalUrl.startsWith('/api') ? originalUrl : `/api${originalUrl}`;
  const target = new URL(targetPath, BACKEND_URL);

  const headers = { ...req.headers, host: target.host };

  const proxyReq = http.request(
    {
      protocol: target.protocol,
      hostname: target.hostname,
      port: target.port,
      path: target.pathname + target.search,
      method: req.method,
      headers,
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
      proxyRes.pipe(res);
    }
  );

  proxyReq.on('error', (err) => {
    console.error('[proxy] Backendga ulanish xatosi:', err.message);
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
    }
    res.end(JSON.stringify({ message: 'Backend serverga ulanib bo\'lmadi' }));
  });

  req.pipe(proxyReq);
}

async function startServer() {
  // API proxy — Vite va body parser dan oldin
  app.use(['/api', '/auth'], (req, res) => {
    proxyToBackend(req, res);
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.json());
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Yordamchi med] Frontend: http://localhost:${PORT}`);
    console.log(`[Yordamchi med] API proxy: /api → ${BACKEND_URL}`);
  });
}

startServer();
