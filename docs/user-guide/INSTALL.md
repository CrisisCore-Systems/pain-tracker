# Installation Guide

## Quick Start (Recommended)

Pain Tracker is a Progressive Web App (PWA). The easiest way to use it is to visit the hosted version:

**🌐 [paintracker.ca](https://paintracker.ca)**

No installation required — it works directly in your browser and can be installed as an app on your device.

---

## Install as a PWA

### Desktop (Chrome, Edge, Brave)

1. Visit [paintracker.ca](https://paintracker.ca)
2. Click the **install icon** in your browser's address bar (or the "Install" prompt if shown)
3. Click **Install**
4. Pain Tracker now appears as a standalone app on your desktop

### Mobile (Android)

1. Visit [paintracker.ca](https://paintracker.ca) in Chrome
2. Tap **"Add to Home Screen"** when prompted (or open the browser menu → "Install app")
3. Pain Tracker appears on your home screen like a native app

### Mobile (iOS / Safari)

1. Visit [paintracker.ca](https://paintracker.ca) in Safari
2. Tap the **Share** button (square with arrow)
3. Scroll down and tap **"Add to Home Screen"**
4. Tap **Add**

---

## Run Locally (Developers)

If you want to run Pain Tracker from source:

### Prerequisites

- **Node.js 20 (LTS)** — an `.nvmrc` file is included
- **npm 9+**
- A modern browser with IndexedDB support

### Steps

```bash
# Clone the repository
git clone https://github.com/CrisisCore-Systems/pain-tracker.git
cd pain-tracker

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Production Build

```bash
# Build for production
npm run build

# Preview the production build
npm run preview
```

---

## System Requirements

| Requirement | Minimum |
|-------------|---------|
| **Browser** | Chrome 90+, Firefox 90+, Safari 15+, Edge 90+ |
| **Storage** | ~50 MB available IndexedDB storage |
| **JavaScript** | Must be enabled |
| **Internet** | Required for initial load only; works offline after |

---

## Offline Support

Pain Tracker works offline after your first visit. The service worker caches the application so you can:

- Log pain entries without internet
- View your history and analytics
- Generate export reports

Data syncs automatically when you reconnect.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| App won't load | Clear browser cache and reload |
| Data not saving | Check that IndexedDB is not disabled in your browser |
| PWA won't install | Ensure you're using HTTPS (paintracker.ca) |
| Forgot passphrase | Data cannot be recovered — this is by design for security |

For more help, see the [FAQ](FAQ.md) or [open an issue](https://github.com/CrisisCore-Systems/pain-tracker/issues).
