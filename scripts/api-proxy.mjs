// @crisiscore-hardened: Secure API proxy (ESM + health + timeouts)
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
app.use(cors());
app.use(rateLimit({ windowMs: 15*60*1000, max: 100, standardHeaders: true }));

// Local healthcheck (does NOT hit upstream)
app.get('/health', (_req, res) => res.status(200).json({ ok: true, service: 'api-proxy', ts: Date.now() }));

const target = process.env.WCB_API_ENDPOINT;
if (!target) { console.error('WCB_API_ENDPOINT is not set'); process.exit(1); }

// Helpful logs
console.log('[proxy] target =', target);
console.log('[proxy] auth  =', process.env.WCB_API_KEY ? 'present' : 'missing');

// Proxy WCB traffic
app.use('/api/wcb', createProxyMiddleware({
  target,
  changeOrigin: true,
  // Keep your endpoint as-is. Example:
  //   VITE side calls  /api/wcb/submissions
  //   target ends with  https://api.wcb.gov
  // If your target ALREADY includes /submissions, do NOT rewrite here:
  pathRewrite: (path) => path.replace(/^\/api\/wcb/, ''),
  // Timeouts & retries
  proxyTimeout: 10_000,
  timeout: 12_000,
  onProxyReq: (proxyReq) => {
    const key = process.env.WCB_API_KEY || '';
    if (key) proxyReq.setHeader('Authorization', `Bearer ${key}`);
    proxyReq.setHeader('Content-Type', 'application/json');
  },
  onError: (err, req, res) => {
    console.error('[proxy:error]', err?.code || err?.message);
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok:false, code:'UPSTREAM_ERROR', detail:String(err?.code||err?.message) }));
  },
}));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API proxy running on :${PORT}`));
