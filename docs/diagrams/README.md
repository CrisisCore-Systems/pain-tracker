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

### 4. Trust Hardening Review (`trust-hardening-review.svg`) 🛡️

**Purpose**: Process architecture diagram showing exactly what happens during a Trust Hardening Review — inputs, sequential analysis gates, and output artifacts.

**Use Cases**:
- Trust architecture documentation and communications
- Onboarding reviewers to the verification process
- Marketing evidence that the system has been reviewed under real conditions
- Technical authority material for security-conscious audiences

**Flow**:
- **INPUT**: Codebase surface, system constraints, user conditions
- **ANALYSIS LAYERS**: Threat model (A) → Boundary mapping (B) → Failure path analysis (C) → Abuse case review (D)
- **OUTPUT**: Defensibility packet + prioritized hardening roadmap

**Visual Features**:
- Left-rail stage labels for instant orientation
- Each analysis layer references the specific doc it draws from
- Color-coded stages: blue (input), green (analysis), purple (output)
- Footer assertion: every claim maps to code/test/docs evidence

### 5. Defensibility Packet Artifact (`defensibility-packet-artifact.svg`) 📄

**Purpose**: A dense, evidence-artifact visual that looks like a real captured output from a trust review cycle — not a concept, not a UI mockup.

**Use Cases**:
- Authority signal for security and trust communications
- "Proof texture" — demonstrates the system produces real structured outputs
- Complement to the trust hardening review process diagram
- Screenshot-grade marketing material for technical audiences

**Sections included**:
- **§1 System Intent** — scope and audience
- **§2 Top 10 Risks** — severity-classified risk register with partial redaction
- **§3 Boundary Violations** — this-pass boundary delta
- **§4 Failure Mode Classification** — reversibility, containment, status table
- **§5 Build + Runtime Receipts** — command + result evidence log
- **§6 Mitigation Priority** — P1 critical through P4 low with owners
- **§7 Gate Decision** — pass/block verdict with required follow-ups

**Visual Features**:
- Monospace font for engineering texture
- Grid background (subtle alignment cues)
- Redacted blocks for sections beyond published scope
- PLS (Protective Legitimacy Score) composite scoring
- Real command output format (references actual test suites)

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

<!-- Trust evidence: process + artifact -->
![Trust Hardening Review Process](docs/diagrams/trust-hardening-review.svg)
![Defensibility Packet Artifact](docs/diagrams/defensibility-packet-artifact.svg)
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

**Last Updated**: 2026-03-17  
**Maintained By**: CrisisCore Systems
