// @crisiscore-hardened: Secure API proxy (ESM)
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
app.use(cors());
app.use(rateLimit({ windowMs: 15*60*1000, max: 100, standardHeaders: true }));

const target = process.env.WCB_API_ENDPOINT;
if (!target) {
  console.error('WCB_API_ENDPOINT is not set'); process.exit(1);
}

app.use('/api/wcb', createProxyMiddleware({
  target,
  changeOrigin: true,
  pathRewrite: { '^/api/wcb': '' },
  onProxyReq: (proxyReq) => {
    const key = process.env.WCB_API_KEY || '';
    proxyReq.setHeader('Authorization', `Bearer ${key}`);
  }
}));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API proxy running on :${PORT} -> ${target}`));
