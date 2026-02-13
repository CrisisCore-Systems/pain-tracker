const { app, BrowserWindow, session } = require('electron');
const path = require('path');
const express = require('express');

let server;

function startLocalServer() {
  return new Promise((resolve) => {
    const ex = express();
    const appDir = path.join(__dirname, '..', 'app');

    ex.disable('x-powered-by');
    // Serve static build output first.
    ex.use(
      express.static(appDir, {
        etag: true,
        lastModified: true,
      })
    );

    // SPA fallback: for routes like /pricing, serve index.html.
    // Avoid intercepting real asset requests (e.g., /sw.js, /assets/*.js).
    ex.get('*', (req, res, next) => {
      try {
        if (req.path && req.path.includes('.')) return next();
        res.sendFile(path.join(appDir, 'index.html'));
      } catch {
        next();
      }
    });

    server = ex.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve(`http://127.0.0.1:${port}/index.html`);
    });
  });
}

function configureSessionSecurity() {
  // Reduce surprise OS prompts: deny by default.
  session.defaultSession.setPermissionRequestHandler((_wc, _perm, cb) => cb(false));

  // Strict outbound network behavior:
  // Allow only loopback traffic (for our local server) and block everything else.
  session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
    const u = details.url;

    const allowed =
      u.startsWith('http://127.0.0.1:') ||
      u.startsWith('http://localhost:') ||
      u.startsWith('ws://127.0.0.1:') ||
      u.startsWith('ws://localhost:') ||
      u.startsWith('devtools://');

    callback({ cancel: !allowed });
  });
}

async function createWindow() {
  configureSessionSecurity();

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: '#0b0f14',
    show: true,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  // Block popup windows.
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));

  const url = await startLocalServer();
  await win.loadURL(url);
}

app.setAppUserModelId('ca.paintracker.desktop');

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (server) server.close();
  if (process.platform !== 'darwin') app.quit();
});
