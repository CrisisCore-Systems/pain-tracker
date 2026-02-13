# Screenshot Portfolio

This directory contains a comprehensive screenshot portfolio for the Pain Tracker application.

## 📁 Directory Structure

- **marketing/** - Marketing and promotional screenshots
- **technical/** - Technical architecture and privacy screenshots  
- **social/** - Social media optimized screenshots
- **documentation/** - Documentation and tutorial screenshots
- **wcb-forms/** - WorkSafe BC form preview screenshots

## 📸 Screenshot Inventory

### Phase 1 (Essential - Week 1)
- **dashboard.png** - Dashboard view (in-app)
  - Use Case: CNET submission screenshot
  - Caption: "Dashboard"

- **entry.png** - New entry (Quick Log) view
  - Use Case: CNET submission screenshot
  - Caption: "New entry"

- **trends.png** - Trends / Analytics view
  - Use Case: CNET submission screenshot
  - Caption: "Trends"

- **report.png** - Reports / Export view
  - Use Case: CNET submission screenshot
  - Caption: "Report"

- **blank-wcb-form-6.png** - Blank WorkSafeBC Form 6 - The Pain Point
  - Use Case: Social media posts, blog introductions
  - Caption: "This is what claimants face - hours of manual form filling"

- **export-modal-solution.png** - Export Modal - The Solution
  - Use Case: Hero image, landing page above the fold
  - Caption: "This is the alternative - one click to generate perfect forms"

- **pain-entry-interface.png** - Pain Entry Interface
  - Use Case: Demo sequences, feature explanations
  - Caption: "Track your pain in 30 seconds - no complex interfaces"

- **export-process.png** - Export Process with Form 6/7 Options
  - Use Case: Conversion-focused content
  - Caption: "One click exports your data to WorkSafeBC-ready formats"

- **generated-form-6-preview.png** - Generated Form 6 Preview
  - Use Case: Trust-building, result demonstrations
  - Caption: "Perfectly formatted Form 6, generated automatically from your entries"

- **generated-form-7-preview.png** - Generated Form 7 Preview
  - Use Case: Comprehensive solution showcasing
  - Caption: "Employer reports generated with the same accuracy"

- **privacy-security-settings.png** - Privacy/Security Settings
  - Use Case: Privacy-focused marketing, addressing concerns
  - Caption: "Your data never leaves your device - unlike cloud-based competitors"

### Phase 2 (Growth - Weeks 2-3)
- **body-map-interaction.png** - Body Map Interaction
  - Use Case: Showing advanced tracking capabilities
  - Caption: "Pinpoint exact pain locations with clinical precision"

- **offline-functionality.png** - Offline Functionality
  - Use Case: Rural outreach, reliability messaging
  - Caption: "Full functionality without internet - crucial for rural BC users"

- **analytics-dashboard.png** - Analytics Dashboard
  - Use Case: Upsell to power users, feature comparisons
  - Caption: "Advanced analytics competitors charge for - included free"

- **comparison-grid.png** - Comparison Grid (App vs Competitors)
  - Use Case: Twitter, Instagram, Facebook posts
  - Caption: "Why pay for less when you can get more for free?"

- **benefit-icons-grid.png** - Benefit Icons Grid
  - Use Case: Quick social media posts, email headers
  - Caption: "🔒 Privacy First ⚡ One-Click Forms 💸 Free Forever 🏥 Clinical Grade"

- **mobile-responsiveness.png** - Mobile Responsiveness (Phone, Tablet, Desktop)
  - Use Case: PWA promotion, mobile optimization claims
  - Caption: "Works perfectly on every device - no app store required"

### Phase 3 (Advanced - Month 1)
- **trauma-informed-mode.png** - Trauma-Informed Mode Comparison
  - Use Case: Mental health communities, trauma-sensitive outreach
  - Caption: "Switch between clinical and gentle language based on your needs"

- **process-flow.png** - Process Flow Infographic
  - Use Case: Explainer content, onboarding sequences
  - Caption: "From pain tracking to submitted forms in under 2 minutes"

- **architecture-diagram.png** - Architecture Diagram
  - Use Case: Developer communities, privacy forums
  - Caption: "Local-first architecture means we can't access your data even if we wanted to"

- **built-in-bc.png** - Built in BC Element
  - Use Case: Local marketing, community outreach
  - Caption: "Built by BC developers for BC workers"

- **crisis-support-feature.png** - Crisis Support Feature
  - Use Case: Mental health advocacy groups
  - Caption: "Built-in crisis detection and support for when pain becomes overwhelming"

## 🎨 Manual Creation Required

The following screenshots require manual creation as infographics or composites:

- **process-flow.png** - Process Flow Infographic
- **architecture-diagram.png** - Architecture Diagram

## 📐 Standard Sizes

- **Social Media Share**: 1200x630px (Open Graph / Twitter Card)
- **Instagram Post**: 1080x1080px (Square)
- **Instagram Story**: 1080x1920px (Vertical)
- **PWA Narrow**: 540x720px (Mobile)
- **PWA Wide**: 1280x720px (Desktop)

## 🔄 Regenerating Screenshots

To regenerate all screenshots:
```bash
npm run screenshots:portfolio
```

To regenerate specific phases:
```bash
npm run screenshots:portfolio -- --phase=phase1
npm run screenshots:portfolio -- --phase=phase2
npm run screenshots:portfolio -- --phase=phase3
```

To regenerate specific categories:
```bash
npm run screenshots:portfolio -- --category=marketing
npm run screenshots:portfolio -- --category=technical
npm run screenshots:portfolio -- --category=social
```

## 📊 Usage Guidelines

- All screenshots are optimized for 2x device pixel ratio (Retina displays)
- PNG format for transparency and quality
- Captions provided for each screenshot for consistent messaging
- Organized by use case for easy discovery

## 🤝 Contributing

When adding new screenshots:
1. Add configuration to `scripts/screenshot-config.js`
2. Assign appropriate phase and category
3. Include caption and use case
4. Run the capture script
5. Update this README

---

*Last updated: 2/10/2026*
