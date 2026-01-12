# 📸 Screenshot Portfolio - Quick Reference

> **TL;DR:** Comprehensive screenshot system ready for marketing, social media, and documentation.

---

## 🚀 Quick Start

```bash
# Generate all screenshots
npm run screenshots:portfolio

# Generate specific phase
npm run screenshots:portfolio:phase1   # Essential (Week 1)
npm run screenshots:portfolio:phase2   # Growth (Weeks 2-3)
npm run screenshots:portfolio:phase3   # Advanced (Month 1)

# Test without saving
npm run screenshots:portfolio -- --dry-run

# Generate specific category
npm run screenshots:portfolio -- --category=marketing
```

---

## 📁 Directory Structure

```
public/screenshots/
├── marketing/          # Hero images, features
├── technical/          # Architecture, security
├── social/            # Social media optimized
├── documentation/     # Tutorials, guides
└── wcb-forms/        # Form previews
```

---

## 🎯 Screenshot Inventory (18 Total)

### ⭐ Phase 1: Essential (6 screenshots)
1. ✅ `pain-entry-interface.png` - Main tracking UI
2. ✅ `export-modal-solution.png` - Hero screenshot
3. ✅ `export-process.png` - Form generation
4. ⚠️ `generated-form-6-preview.png` - WCB Form 6 (manual)
5. ⚠️ `generated-form-7-preview.png` - WCB Form 7 (manual)
6. ✅ `privacy-security-settings.png` - Privacy features

### 📈 Phase 2: Growth (5 screenshots)
7. ✅ `body-map-interaction.png` - Interactive map
8. ✅ `analytics-dashboard.png` - Charts/analytics
9. ✅ `offline-functionality.png` - Offline demo
10. ⚠️ `comparison-grid.png` - Feature table (manual)
11. ⚠️ `mobile-responsiveness.png` - Multi-device (manual)

### 🎨 Phase 3: Advanced (7 screenshots)
12. ✅ `trauma-informed-mode.png` - Gentle UI
13. ⚠️ `process-flow.png` - User journey (manual)
14. ⚠️ `architecture-diagram.png` - Tech diagram (manual)
15. ✅ `built-in-bc.png` - BC branding
16. ✅ `crisis-support-feature.png` - Crisis UI
17. ⚠️ `benefit-icons-grid.png` - Benefits (manual)
18. ✅ `blank-wcb-form.png` - Problem demo

**Legend:**
- ✅ = Auto-generated
- ⚠️ = Requires manual creation

---

## 🎬 Demo Routes

Test showcase pages locally:
```
http://localhost:3000/pain-tracker/#demo-export
http://localhost:3000/pain-tracker/#demo-body-map
http://localhost:3000/pain-tracker/#demo-settings
http://localhost:3000/pain-tracker/#demo-comparison
http://localhost:3000/pain-tracker/#demo-crisis
http://localhost:3000/pain-tracker/#demo-benefits
```

---

## 📱 Platform Cheat Sheet

| Platform | Size | Format | Best Performers |
|----------|------|--------|-----------------|
| Twitter | 1200x630 | PNG | comparison-grid, export-modal |
| Facebook | 1200x630 | PNG | body-map, analytics-dashboard |
| Instagram Post | 1080x1080 | PNG | benefit-icons, pain-entry |
| Instagram Story | 1080x1920 | PNG | process-flow, mobile-responsive |
| LinkedIn | 1200x627 | PNG | architecture, privacy-settings |
| Blog/Landing | 1920x1080 | PNG | export-modal, analytics |

---

## 💬 Caption Templates

### Short (Twitter)
```
Pain tracking that respects privacy. Built for BC workers.
```

### Medium (Facebook/Instagram)
```
Stop wasting hours on WorkSafe BC paperwork. 
Pain Tracker generates perfect forms in one click.
Track naturally. Export instantly. 100% free.
```

### Long (LinkedIn/Blog)
```
Privacy-first architecture meets clinical-grade pain tracking.
Pain Tracker uses local-first IndexedDB with AES-256 encryption,
ensuring your medical data never leaves your device. 

WorkSafe BC integration included. Forever free.
Built in BC, for BC workers.
```

---

## 🎨 Manual Creation Checklist

For screenshots marked ⚠️:

- [ ] Review design templates in `docs/marketing/MANUAL_SCREENSHOT_TEMPLATES.md`
- [ ] Use brand colors (Blue: #3B82F6, Purple: #8B5CF6)
- [ ] Follow typography (Inter font, 16-32px)
- [ ] Maintain 1200x630px dimension
- [ ] Export at 2x resolution (@2x)
- [ ] Optimize file size (< 500KB)
- [ ] Save in correct category folder
- [ ] Update metadata in `portfolio-metadata.json`

---

## ⚡ Common Tasks

### Add New Screenshot
1. Add to `scripts/screenshot-config.js`
2. Create demo route in `src/pages/ScreenshotShowcase.tsx` (if needed)
3. Run `npm run screenshots:portfolio`
4. Update documentation

### Update Existing Screenshot
1. Make UI changes in app
2. Run `npm run screenshots:portfolio -- --phase=<phase>`
3. Review generated files
4. Commit changes

### Optimize Screenshots
```bash
# Batch optimize PNGs
for file in public/screenshots/**/*.png; do
  pngquant --quality=80-95 "$file" --output "${file%.png}-opt.png"
done

# Convert to WebP
for file in public/screenshots/**/*.png; do
  cwebp -q 85 "$file" -o "${file%.png}.webp"
done
```

---

## 📊 Success Metrics

Track these for each screenshot:
- **CTR** (Click-Through Rate)
- **Engagement** (Likes, shares, comments)
- **Conversions** (Sign-ups from campaigns)
- **Platform Performance** (Which platforms work best)

Use UTM parameters:
```
https://crisiscore-systems.github.io/pain-tracker/?utm_source=twitter&utm_medium=social&utm_campaign=screenshot-export-modal
```

---

## 🆘 Troubleshooting

**Screenshots not generating?**
```bash
# Check Playwright installation
npx playwright install chromium

# Verify dev server starts
npm run dev

# Try dry run first
npm run screenshots:portfolio -- --dry-run
```

**Demo routes not working?**
- Clear browser cache
- Check App.tsx includes `ScreenshotShowcase`
- Verify hash navigation is working

**Poor quality screenshots?**
- Increase `deviceScaleFactor` in config
- Use higher resolution display for capture
- Ensure Retina/HiDPI mode enabled

---

## 📚 Full Documentation

- **Complete Guide:** `public/screenshots/README.md`
- **Marketing Strategies:** `docs/marketing/SCREENSHOT_MARKETING_GUIDE.md`
- **Manual Templates:** `docs/marketing/MANUAL_SCREENSHOT_TEMPLATES.md`
- **Configuration:** `scripts/screenshot-config.js`

---

## 🎯 Next Steps

1. ✅ Infrastructure created
2. ⏭️ Generate Phase 1 screenshots
3. ⏭️ Create manual infographics
4. ⏭️ Launch social media campaign
5. ⏭️ Track performance metrics

---

**Version:** 1.0  
**Last Updated:** November 2024  
**Quick Access:** Add to browser bookmarks for easy reference
