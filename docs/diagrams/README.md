# Pain Tracker Data Flow Diagrams

This directory contains visual diagrams illustrating Pain Tracker's privacy-first, local-first architecture.

## Available Diagrams

### 1. Privacy-First Flow (`privacy-first-flow.svg`)

**Purpose**: Illustrates how Pain Tracker keeps your data secure and private on your device.

**Use Cases**:
- Marketing and landing pages
- User documentation
- Privacy policy illustrations
- Educational content about data security

**Highlights**:
- 🖥️ **Your Device**: 100% local storage, no cloud upload
- 🔐 **Encryption Layer**: IndexedDB with AES-GCM encryption, zero-knowledge architecture
- 📤 **User-Controlled Export**: Manual exports only for WorkSafe BC and clinical reports
- ❌ **What We DON'T Do**: No corporate servers, third-party sharing, data mining, or tracking

### 2. Data Flow Comparison (`data-flow-comparison.svg`)

**Purpose**: Side-by-side comparison of Pain Tracker's privacy-first approach versus traditional health apps.

**Use Cases**:
- Competitive positioning
- User education
- Privacy advocacy
- Trust-building content

**Left Side (Pain Tracker)**:
- Local device storage with encryption
- User-initiated exports only
- Clear "NO" to corporate servers and third-party sharing

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
   - Red: Dangers, warnings, what we DON'T do
   - Blue/Indigo: User devices and local processing
3. **Accessibility**: High contrast, clear labels, readable fonts
4. **Professional**: Clean design suitable for both technical and non-technical audiences

## Usage

These SVG diagrams can be embedded in:
- Markdown files (GitHub, documentation sites)
- HTML pages
- Presentations
- Print materials

**Example Markdown Embedding**:
```markdown
![Privacy-First Data Flow](docs/diagrams/privacy-first-flow.svg)
```

**Example HTML Embedding**:
```html
<img src="docs/diagrams/privacy-first-flow.svg" alt="Privacy-First Data Flow" width="800" />
```

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
