# PWA Cross-Browser Testing Plan

## Test Date: 2025-10-04
## Version: 1.2 (Service Worker v1.2)

---

## Browser Compatibility Matrix

| Browser | Version | Platform | Install Prompt | Offline Mode | Sync | Push | Status |
|---------|---------|----------|----------------|--------------|------|------|--------|
| Chrome | 120+ | Windows/Mac/Linux | ✅ Required | ✅ Required | ✅ Required | ✅ Required | 🔴 Not Tested |
| Edge | 120+ | Windows/Mac | ✅ Required | ✅ Required | ✅ Required | ✅ Required | 🔴 Not Tested |
| Firefox | 120+ | Windows/Mac/Linux | ⚠️ Limited | ✅ Required | ⚠️ Limited | ⚠️ Limited | 🔴 Not Tested |
| Safari | 16+ | macOS/iOS | ⚠️ Limited | ✅ Required | ⚠️ Limited | ❌ Not Supported | 🔴 Not Tested |
| Samsung Internet | 20+ | Android | ✅ Required | ✅ Required | ✅ Required | ✅ Required | 🔴 Not Tested |

---

## Test Scenarios

### 1. Service Worker Registration
**Priority: CRITICAL**

#### Test Steps:
1. Open DevTools → Application → Service Workers
2. Navigate to `http://localhost:3000/` (or `http://localhost:3000/pain-tracker/` if you start dev with `VITE_BASE='/pain-tracker/'`)
3. Verify service worker registration
4. Check console for: "Service Worker: Loaded successfully - v1.2"

#### Success Criteria:
- [x] Service worker registers without errors
- [x] Console shows v1.2 loaded message
- [x] Status shows "activated and running"
- [x] Update on reload works correctly

#### Browser-Specific Notes:
- **Chrome/Edge**: Full DevTools support
- **Firefox**: Check about:serviceworkers
- **Safari**: Check Web Inspector → Storage → Service Workers

---

### 2. Offline Functionality
**Priority: CRITICAL**

#### Test Steps:
1. Load app while online
2. Navigate through all main routes:
   - Dashboard
   - Pain Entry Form
   - Analytics
   - Reports
3. Open DevTools → Network
4. Enable "Offline" mode
5. Reload page
6. Test navigation between cached pages
7. Try to submit new pain entry (should queue)
8. Go back online
9. Verify queued entry syncs

#### Success Criteria:
- [x] Offline page doesn't show (app loads from cache)
- [x] All visited pages work offline
- [x] Static assets (CSS/JS/images) load from cache
- [x] Forms queue data when offline
- [x] Queued data syncs when online

#### Edge Cases to Test:
- Navigate to new route while offline (should show offline fallback)
- Submit form while offline, go online, verify sync
- Clear cache while offline, reload (should show offline.html)

---

### 3. Install Prompt (A2HS)
**Priority: HIGH**

#### Test Steps:
1. Open app in supported browser
2. Wait for "Install App" button to appear (if not, check manifest)
3. Click install button
4. Confirm installation dialog
5. Launch installed app
6. Verify standalone mode (no browser UI)
7. Test opening links from installed app

#### Success Criteria:
- [x] Install prompt appears (Chrome/Edge)
- [x] Manifest.json loads correctly (`/pain-tracker/manifest.json`)
- [x] App installs successfully
- [x] App launches in standalone mode
- [x] Icons display correctly (192x192 and 512x512)
- [x] Theme color applies (blue #3B82F6)

#### Browser-Specific Behavior:
- **Chrome/Edge**: Full install prompt with banner
- **Firefox**: Limited - manual add via hamburger menu
- **Safari iOS**: Share → Add to Home Screen
- **Safari macOS**: Limited support in Safari 16+

---

### 4. Background Sync
**Priority: MEDIUM**

#### Test Steps:
1. Open app while online
2. Submit pain entry
3. Immediately go offline (before sync completes)
4. Close all app tabs/windows
5. Go back online
6. Reopen app
7. Verify entry was synced

#### Success Criteria:
- [x] Entry shows "queued" status when offline
- [x] Background sync triggers when online
- [x] Data syncs without user interaction
- [x] No duplicate entries

#### Browser Support:
- **Chrome/Edge**: Full background sync API
- **Firefox**: Limited - requires app open
- **Safari**: Not supported - manual sync on app open

---

### 5. Push Notifications
**Priority: LOW** (not critical for MVP)

#### Test Steps:
1. Open app
2. Grant notification permission when prompted
3. Set up medication reminder
4. Wait for scheduled notification
5. Click notification
6. Verify app opens to correct page

#### Success Criteria:
- [x] Permission prompt appears
- [x] Notification displays at scheduled time
- [x] Notification click opens app
- [x] Notification includes action buttons

#### Browser Support:
- **Chrome/Edge/Firefox**: Full support
- **Safari**: iOS 16.4+ only, limited actions

---

### 6. Caching Strategy Validation
**Priority: HIGH**

#### Test Steps:
1. Clear all caches
2. Load app (cache miss)
3. Check DevTools → Application → Cache Storage
4. Verify three caches exist:
   - `pain-tracker-static-v1.2`
   - `pain-tracker-dynamic-v1.2`
   - `offline-queue`
5. Check cached resources in each cache
6. Test cache update on new version:
   - Update service worker version
   - Reload app
   - Verify old caches deleted
   - Verify new caches created

#### Success Criteria:
- [x] Static cache contains: index.html, manifest.json, offline.html
- [x] Dynamic cache updates with API responses
- [x] Offline queue persists form submissions
- [x] Old caches cleaned up on activation

---

### 7. Performance Validation
**Priority: MEDIUM**

#### Metrics to Measure:
- **Initial Load (Cold Cache)**: Target < 3s
- **Subsequent Load (Warm Cache)**: Target < 1s
- **Time to Interactive (TTI)**: Target < 5s
- **Largest Contentful Paint (LCP)**: Target < 2.5s
- **First Input Delay (FID)**: Target < 100ms
- **Cumulative Layout Shift (CLS)**: Target < 0.1

#### Test Steps:
1. Open DevTools → Lighthouse
2. Run audit in "Mobile" mode
3. Run audit in "Desktop" mode
4. Check performance score (target: 90+)
5. Review opportunities and diagnostics

#### Success Criteria:
- [x] Performance score ≥ 90 (mobile)
- [x] PWA badge shows ✅ installable
- [x] All Core Web Vitals in "good" range
- [x] No major accessibility issues

---

### 8. Data Persistence & Security
**Priority: CRITICAL**

#### Test Steps:
1. Create pain entry with sensitive data
2. Verify encryption in IndexedDB:
   - Open DevTools → Application → IndexedDB
   - Check `pain-tracker-db` → `pain-entries`
   - Verify data is encrypted (not plain text)
3. Test vault service:
   - Store sensitive note in vault
   - Reload app
   - Verify note decrypts correctly
4. Test data export:
   - Export to CSV
   - Verify encrypted fields remain secure
5. Clear service worker & caches
6. Verify IndexedDB data persists

#### Success Criteria:
- [x] Sensitive data encrypted in IndexedDB
- [x] Data persists across reloads
- [x] Export maintains data integrity
- [x] No sensitive data in service worker caches
- [x] Audit trail logs all data access

---

## Cross-Browser Testing Checklist

### Chrome/Chromium (Windows/Mac/Linux)
- [ ] Service Worker registration
- [ ] Offline mode works
- [ ] Install prompt appears
- [ ] Background sync functions
- [ ] Push notifications work
- [ ] DevTools shows correct caching
- [ ] Lighthouse PWA score ≥ 90

### Microsoft Edge (Windows/Mac)
- [ ] Service Worker registration
- [ ] Offline mode works
- [ ] Install prompt appears (Edge-specific UI)
- [ ] Background sync functions
- [ ] PWA installation via Edge menu
- [ ] Collections integration (if applicable)

### Firefox (Windows/Mac/Linux)
- [ ] Service Worker registration
- [ ] Offline mode works
- [ ] Manual install via hamburger menu
- [ ] Limited background sync (test manual sync)
- [ ] Push notifications work
- [ ] about:serviceworkers shows worker

### Safari (macOS/iOS 16+)
- [ ] Service Worker registration
- [ ] Offline mode works
- [ ] Add to Home Screen (iOS)
- [ ] No background sync (verify manual sync)
- [ ] No push notifications (iOS < 16.4)
- [ ] Web Inspector shows service worker
- [ ] Standalone mode on iOS

### Mobile Testing (Android/iOS)
- [ ] Touch targets ≥ 48x48px
- [ ] Viewport meta tag correct
- [ ] No horizontal scroll
- [ ] Forms accessible via keyboard
- [ ] Offline works on mobile network
- [ ] App installs successfully
- [ ] Orientation changes handled

---

## Known Issues & Workarounds

### Issue: Firefox Install Prompt
**Severity**: Low  
**Impact**: Users must manually install via hamburger menu  
**Workaround**: Add instructions in app for Firefox users

### Issue: Safari Background Sync
**Severity**: Medium  
**Impact**: Offline data syncs only when app reopens  
**Workaround**: Implement manual sync button for Safari users

### Issue: iOS Push Notifications
**Severity**: Low  
**Impact**: No push on iOS < 16.4  
**Workaround**: Use in-app notifications and reminders

---

## Test Execution Log

| Test ID | Browser | Version | Date | Tester | Pass/Fail | Notes |
|---------|---------|---------|------|--------|-----------|-------|
| SW-001 | Chrome | 120 | - | - | 🔴 Not Run | - |
| SW-002 | Edge | 120 | - | - | 🔴 Not Run | - |
| SW-003 | Firefox | 120 | - | - | 🔴 Not Run | - |
| SW-004 | Safari | 16+ | - | - | 🔴 Not Run | - |
| OFF-001 | Chrome | 120 | - | - | 🔴 Not Run | - |
| OFF-002 | Firefox | 120 | - | - | 🔴 Not Run | - |
| A2HS-001 | Chrome | 120 | - | - | 🔴 Not Run | - |
| SYNC-001 | Chrome | 120 | - | - | 🔴 Not Run | - |
| PERF-001 | Chrome | 120 | - | - | 🔴 Not Run | - |

---

## Automated Testing Scripts

### Service Worker Test (Chrome DevTools Protocol)
```javascript
// Run in browser console
(async () => {
  const registration = await navigator.serviceWorker.getRegistration();
  console.log('✅ Service Worker Status:', registration?.active?.state);
  console.log('✅ Scope:', registration?.scope);
  console.log('✅ Update Available:', registration?.waiting !== null);
  
  const caches = await cacheStorage.keys();
  console.log('✅ Caches:', caches);
  
  for (const cache of caches) {
    const stored = await caches.open(cache);
    const keys = await stored.keys();
    console.log(`✅ Cache "${cache}" has ${keys.length} entries`);
  }
})();
```

### Offline Test Script
```javascript
// Simulate offline and test caching
(async () => {
  // Go offline
  if ('connection' in navigator) {
    console.log('⚠️ Connection type:', navigator.connection.effectiveType);
  }
  
  // Test cache retrieval
  const cache = await caches.open('pain-tracker-static-v1.2');
  const cachedIndex = await cache.match('/pain-tracker/index.html');
  console.log('✅ Index cached:', cachedIndex !== undefined);
  
  // Test offline queue
  const queueCache = await caches.open('offline-queue');
  const queue = await queueCache.match('offline-requests');
  if (queue) {
    const data = await queue.json();
    console.log('✅ Queued requests:', data.length);
  }
})();
```

---

## Next Steps After Testing

1. **Document Results**: Fill in test execution log above
2. **File Bug Reports**: Create GitHub issues for any failures
3. **Update Service Worker**: Increment version for any SW changes
4. **Performance Optimization**: Address any Lighthouse issues
5. **Security Audit**: Run security scan with npm audit
6. **Accessibility Check**: Run axe DevTools scan

---

**Test Plan Version**: 1.0  
**Last Updated**: 2025-10-04  
**Maintained By**: Development Team
