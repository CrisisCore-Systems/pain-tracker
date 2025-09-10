// @crisiscore-hardened: Secure API proxy
/* eslint-disable @typescript-eslint/no-require-imports */
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(cors());
app.use(rateLimit({ windowMs: 15*60*1000, max: 100, standardHeaders: true }));

app.use('/api/wcb', createProxyMiddleware({
  target: process.env.WCB_API_ENDPOINT,
  changeOrigin: true,
  pathRewrite: { '^/api/wcb': '' },
  onProxyReq: (proxyReq) => {
    proxyReq.setHeader('Authorization', `Bearer ${process.env.WCB_API_KEY||''}`);
  }
}));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API proxy running on :${PORT}`));
