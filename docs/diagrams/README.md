# Pain Tracker Data Flow Diagrams

This directory contains visual diagrams illustrating Pain Tracker's privacy-first, local-first architecture.

## Available Diagrams

### 1. Architectural Data Flow (`architectural-data-flow.svg`) ⭐ **RECOMMENDED**

**Purpose**: High-level diagram showing Pain Tracker's privacy-first data flow contrasted with traditional health apps.

**Use Cases**:
- **Primary marketing diagram** for landing pages and presentations
- Technical documentation and architecture reviews
- Privacy policy and security communications
- User education and onboarding materials

**Top Flow (Pain Tracker - Privacy-First)**:
- 📱 **Smartphone with Shield**: Your device with built-in security
- 🔐 **Local Encryption Layer**: AES-GCM encryption helpers for sensitive local storage (IndexedDB)
- 📤 **User-Controlled Export**: Manual exports for WorkSafe BC, PDF clinical reports, CSV data
- 🤝 **Explicit Sharing Choice**: You decide when and where to share (doctor, WorkSafe BC, or keep private)

**Bottom Flow (Traditional Apps - Crossed Out)**:
- ❌ Device auto-upload → Corporate servers → Data mining → Third-party sharing
- Giant red X across the traditional flow emphasizing what this project aims to avoid by default

**Visual Features**:
- Side-by-side comparison in a single view
- Clear color coding (green=secure, purple=export, orange=choice, red=danger)
- Clean layout suitable for technical and non-technical audiences

### 2. Privacy-First Flow (`privacy-first-flow.svg`)

**Purpose**: Vertical flow diagram illustrating how Pain Tracker keeps your data secure and private on your device.

**Use Cases**:
- Simplified privacy explanations
- User documentation
- Privacy policy illustrations
- Educational content about data security

**Highlights**:
- 🖥️ **Your Device**: Local-first storage by default (offline-capable)
- 🔐 **Encryption Layer**: IndexedDB with AES-GCM encryption helpers
- 📤 **User-Controlled Export**: Manual exports only for WorkSafe BC and clinical reports
- ❌ **Default stance**: No background uploads by default; optional integrations may use network calls when configured

### 3. Data Flow Comparison (`data-flow-comparison.svg`)

**Purpose**: Side-by-side comparison of Pain Tracker's privacy-first approach versus traditional health apps.

**Use Cases**:
- Competitive positioning
- User education
- Privacy advocacy
- Trust-building content

**Left Side (Pain Tracker)**:
- Local device storage with encryption
- User-initiated exports only
- Local-first by default; network integrations (if enabled) are explicitly configured

**Right Side (Traditional Apps)**:
- Automatic cloud upload
- Corporate server storage
- Data shared with advertisers, insurance companies, and data brokers
- Data mining and privacy violations

## Design Principles

All diagrams follow these principles:

1. **Clear Visual Hierarchy**: Important information stands out
2. **Color Coding**:
   - Green: Secure, private, user-controlled actions
   - Purple: Export and user control
   - Red: Dangers and warnings (patterns this project aims to avoid by default)
   - Blue/Indigo: User devices and local processing
3. **Accessibility**: High contrast, clear labels, readable fonts
4. **Professional**: Clean design suitable for both technical and non-technical audiences

## Usage

These diagrams are available in both **SVG** (vector) and **PNG** (raster) formats:

- **SVG**: Scalable, lightweight, perfect for web and documentation (recommended)
- **PNG**: High-resolution raster images for presentations, social media, and print

### SVG vs PNG: When to Use Which

**Use SVG when:**
- Embedding in websites and GitHub markdown
- Need perfect scaling at any size
- Want smaller file sizes
- Supporting modern browsers

**Use PNG when:**
- Creating presentations (PowerPoint, Keynote)
- Posting on social media
- Email newsletters or attachments
- Need broad compatibility across platforms

These SVG diagrams can be embedded in:
- Markdown files (GitHub, documentation sites)
- HTML pages
- Presentations
- Print materials

**Example Markdown Embedding (SVG)**:
```markdown
<!-- Recommended: Architectural diagram -->
![Architectural Data Flow](docs/diagrams/architectural-data-flow.svg)

<!-- Alternative: Vertical flow -->
![Privacy-First Data Flow](docs/diagrams/privacy-first-flow.svg)

<!-- Alternative: Side-by-side comparison -->
![Data Flow Comparison](docs/diagrams/data-flow-comparison.svg)
```

**Example Markdown Embedding (PNG)**:
```markdown
<!-- PNG versions for better compatibility -->
![Architectural Data Flow](docs/diagrams/architectural-data-flow.png)
![Privacy-First Data Flow](docs/diagrams/privacy-first-flow.png)
![Data Flow Comparison](docs/diagrams/data-flow-comparison.png)
```

**Example HTML Embedding**:
```html
<!-- SVG (recommended for web) -->
<img src="docs/diagrams/architectural-data-flow.svg" alt="Architectural Data Flow" width="1200" />

<!-- PNG (for maximum compatibility) -->
<img src="docs/diagrams/architectural-data-flow.png" alt="Architectural Data Flow" width="1400" />

<!-- Alternative diagrams -->
<img src="docs/diagrams/privacy-first-flow.svg" alt="Privacy-First Data Flow" width="800" />
<img src="docs/diagrams/data-flow-comparison.svg" alt="Data Flow Comparison" width="1000" />
```

## Regenerating PNG Files

If you modify any SVG diagrams, regenerate the PNG versions:

```bash
npm run diagrams:svg-to-png
```

This will convert all SVG diagrams in `docs/diagrams/` to high-resolution PNG files.

## Editing

These diagrams are created as SVG (Scalable Vector Graphics) and can be edited with:
- Text editor (for minor tweaks to text, colors, positioning)
- Vector graphics software (Inkscape, Adobe Illustrator, Figma)
- Online SVG editors (SVG-Edit, Vectr)

## License

These diagrams are part of the Pain Tracker project and are licensed under the same MIT License as the main project.

---

**Last Updated**: 2025-11-22  
**Maintained By**: CrisisCore Systems
