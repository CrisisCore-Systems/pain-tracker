# 🎨 Manual Screenshot Templates & Guidelines

This document provides specifications and templates for creating screenshots that require manual design (infographics, composites, etc.).

---

## 📐 Design Specifications

### Standard Dimensions
- **Social Media:** 1200x630px (Open Graph)
- **Instagram Square:** 1080x1080px
- **Instagram Story:** 1080x1920px
- **Documentation:** 1920x1080px

### Brand Colors
Based on Pain Tracker branding:
- **Primary Blue:** `#3B82F6`
- **Secondary Purple:** `#8B5CF6`
- **Success Green:** `#10B981`
- **Warning Yellow:** `#F59E0B`
- **Danger Red:** `#EF4444`
- **Neutral Gray:** `#6B7280`
- **Background:** `#F9FAFB`
- **Text:** `#111827`

### Typography
- **Headings:** Inter Bold, 24-32px
- **Body:** Inter Regular, 16-18px
- **Captions:** Inter Medium, 14px
- **Line Height:** 1.5x

### Grid System
- **Margins:** 48px on all sides
- **Gutters:** 24px between elements
- **Columns:** 12-column grid for layouts

---

## 🖼️ Required Manual Screenshots

### 1. Comparison Grid (`comparison-grid.png`)

**Dimensions:** 1200x630px

**Layout:**
```
+------------------------------------------+
|  Pain Tracker vs Competitors             |
|                                          |
|  Feature          | PT | Comp A | Comp B|
|  ----------------+----+--------+--------|
|  Local Storage   | ✓  |   ✗    |   ✗    |
|  WCB Forms       | ✓  |   ✗    |   ✓    |
|  Free core       | ✓  |   ✗    |   ✗    |
|  Offline Mode    | ✓  |   ✓    |   ✗    |
|  Trauma-Informed | ✓  |   ✗    |   ✗    |
|                                          |
|  "Why Pay for Less When You Can Get More"|
+------------------------------------------+
```

**Design Elements:**
- Header with gradient background (blue to purple)
- Checkmarks in green (#10B981)
- X marks in red (#EF4444)
- Bold column for "Pain Tracker"
- Footer tagline in white text on gradient

**Figma Template Available:** [Link to Figma]

---

### 2. Benefit Icons Grid (`benefit-icons-grid.png`)

**Dimensions:** 1200x630px

**Layout:**
```
+------------------------------------------+
|          Why Pain Tracker?               |
|                                          |
|  +-------+  +-------+  +-------+        |
|  | 🔒    |  | ⚡    |  | 💸    |        |
|  |Privacy|  |1-Click|  | Free  |        |
|  | First |  | Forms |  |Forever|        |
|  +-------+  +-------+  +-------+        |
|                                          |
|  +-------+  +-------+  +-------+        |
|  | 🏥    |  | 📱    |  | 🇨🇦   |        |
|  |Clinical| |Works  |  | Built |        |
|  | Grade |  |Offline|  | in BC |        |
|  +-------+  +-------+  +-------+        |
+------------------------------------------+
```

**Design Elements:**
- 3x2 grid of benefit cards
- Each card: white background, subtle shadow
- Icon at top (48x48px)
- Title below icon (Inter Bold, 18px)
- Short description (Inter Regular, 14px)
- Gradient background (blue to purple)

**Icons to Use:**
- Privacy: Lock icon (Lucide or Heroicons)
- 1-Click: Lightning bolt
- Free: Dollar sign with slash
- Clinical: Heart with pulse
- Offline: Wifi off
- Built in BC: Canadian flag or map pin

---

### 3. Process Flow Infographic (`process-flow.png`)

**Dimensions:** 1200x630px

**Layout:**
```
+------------------------------------------+
|  From Pain to Submitted Forms in < 2 Min |
|                                          |
|  ┌──────┐  →  ┌──────┐  →  ┌──────┐   |
|  │ TRACK│     │CLICK │     │SUBMIT│   |
|  │      │     │      │     │      │   |
|  │  📝  │     │  📊  │     │  ✅  │   |
|  │      │     │      │     │      │   |
|  └──────┘     └──────┘     └──────┘   |
|    30s           15s          1min     |
|                                          |
|  Simple. Fast. Accurate.                 |
+------------------------------------------+
```

**Design Elements:**
- 3-step horizontal flow
- Large icons for each step (64x64px)
- Arrows between steps (24px, blue)
- Time estimates below each step
- Title at top (Inter Bold, 28px)
- Tagline at bottom (Inter Medium, 20px)

**Step Details:**
1. **Track:** Notebook icon, "Enter your pain details"
2. **Click:** Chart icon, "Generate perfect forms"
3. **Submit:** Checkmark icon, "Ready for WorkSafe BC"

---

### 4. Architecture Diagram (`architecture-diagram.png`)

**Dimensions:** 1200x630px

**Layout:**
```
+------------------------------------------+
|  Local-First Architecture                 |
|                                          |
|  ┌──────────────────────────────────┐   |
|  │   Your Device (Private)          │   |
|  │                                  │   |
|  │  ┌────────┐    ┌────────┐      │   |
|  │  │Browser │    │IndexedDB│      │   |
|  │  │  App   │───▶│Encrypted│      │   |
|  │  └────────┘    └────────┘      │   |
|  │       │                          │   |
|  │       ▼                          │   |
|  │  ┌────────┐                     │   |
|  │  │  PWA   │                     │   |
|  │  │ Cache  │                     │   |
|  │  └────────┘                     │   |
|  └──────────────────────────────────┘   |
|                                          |
|  ❌ No Cloud  ❌ No Tracking            |
+------------------------------------------+
```

**Design Elements:**
- Device boundary box (dashed, gray)
- Component boxes (white, subtle shadow)
- Arrows showing data flow (blue)
- Encryption badge on IndexedDB
- Icons for each component
- Bottom tagline with X marks

**Technical Notes:**
- Show data stays local
- Highlight encryption
- Emphasize offline capability
- Note: Core tracking works without server communication

---

### 5. Mobile Responsiveness (`mobile-responsiveness.png`)

**Dimensions:** 1200x630px

**Layout:**
```
+------------------------------------------+
|  Works Across Phone, Tablet, Desktop     |
|                                          |
|   ┌────┐   ┌─────────┐   ┌────────┐    |
|   │📱 │   │  💻     │   │  🖥️    │    |
|   │    │   │         │   │         │    |
|   │    │   │         │   │         │    |
|   └────┘   └─────────┘   └────────┘    |
|   Mobile    Tablet       Desktop        |
|                                          |
|  No App Store Required • PWA Technology  |
+------------------------------------------+
```

**Design Elements:**
- 3 device mockups showing the same UI
- Screenshots of actual app inside frames
- Device labels below
- Tagline at bottom
- Consistent UI across all sizes

**Mockup Sources:**
- Use Shots.so or MockUPhone
- Show pain entry form in each
- Ensure UI scales appropriately

---

### 6. Trauma-Informed Mode (`trauma-informed-mode.png`)

**Dimensions:** 1200x630px

**Layout:**
```
+------------------------------------------+
|  Switch Between Clinical & Gentle        |
|                                          |
|  ┌────────────┐    ┌────────────┐      |
|  │ Clinical   │    │  Gentle    │      |
|  │ Mode       │    │  Mode      │      |
|  │            │    │            │      |
|  │ "Rate pain"│    │"How are you│      |
|  │ 0────────10│    │ feeling?"  │      |
|  │            │    │ 😊───────😢│      |
|  └────────────┘    └────────────┘      |
|                                          |
|  Your Comfort, Your Choice               |
+------------------------------------------+
```

**Design Elements:**
- Side-by-side comparison
- Clinical mode: professional, data-focused
- Gentle mode: empathetic, emoji-based
- Clear labeling
- Tagline emphasizing choice

---

## 🛠️ Tools & Resources

### Design Tools
1. **Figma** (Recommended)
   - Free for personal use
   - Collaborative
   - Web-based
   - Template library

2. **Canva**
   - Quick graphics
   - Social media templates
   - Easy to use

3. **Adobe Illustrator**
   - Professional quality
   - Vector graphics
   - Advanced features

### Icon Libraries
- **Lucide Icons:** https://lucide.dev
- **Heroicons:** https://heroicons.com
- **Feather Icons:** https://feathericons.com

### Device Mockups
- **Shots.so:** https://shots.so
- **MockUPhone:** https://mockuphone.com
- **Previewed:** https://previewed.app

### Color Palette Tools
- **Coolors:** Generate harmonious palettes
- **Adobe Color:** Professional color schemes
- **Color Hunt:** Curated palettes

---

## ✅ Quality Checklist

Before finalizing manual screenshots:

- [ ] Correct dimensions for intended use
- [ ] Brand colors used consistently
- [ ] Typography follows guidelines
- [ ] All text is readable at 50% size
- [ ] No spelling or grammar errors
- [ ] Icons are clear and recognizable
- [ ] Sufficient contrast (WCAG AA minimum)
- [ ] Exported at 2x resolution (Retina)
- [ ] File size < 500KB
- [ ] PNG format with transparency (if needed)

---

## 📦 Export Settings

### For Social Media
```
Format: PNG
Resolution: 2x (@2x for Retina)
Color Profile: sRGB
Compression: Medium (80-90% quality)
```

### For Documentation
```
Format: PNG or WebP
Resolution: 2x
Color Profile: sRGB
Compression: Low (90-95% quality)
```

### For Print (if needed)
```
Format: PDF or PNG
Resolution: 300 DPI
Color Profile: CMYK
Compression: Minimal
```

---

## 🔄 Updating Manual Screenshots

When app design changes:

1. **Review Impact**
   - Check if UI changes affect infographics
   - Identify outdated elements

2. **Update Designs**
   - Modify Figma/Canva templates
   - Export new versions
   - Maintain naming convention

3. **Replace Files**
   - Update files in appropriate directories
   - Run image optimization
   - Update metadata

4. **Document Changes**
   - Note version in filename
   - Update PORTFOLIO.md
   - Log changes in changelog

---

## 📞 Getting Help

- **Design Questions:** See BRANDING_GUIDE.md
- **Technical Issues:** Open GitHub issue
- **Figma Templates:** [Link to shared templates]

---

**Template Version:** 1.0  
**Last Updated:** November 2024  
**Maintainer:** CrisisCore Systems Design Team
