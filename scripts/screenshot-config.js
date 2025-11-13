/**
 * Screenshot Portfolio Configuration
 * Defines all screenshots needed for marketing, documentation, and social media
 */

export const SCREENSHOT_CATEGORIES = {
  MARKETING: 'marketing',
  TECHNICAL: 'technical',
  SOCIAL: 'social',
  DOCUMENTATION: 'documentation',
  WCB_FORMS: 'wcb-forms'
};

export const SCREENSHOT_PORTFOLIO = [
  // BRANCH 1: Problem → Solution Flow
  {
    id: 'blank-wcb-form',
    name: 'blank-wcb-form-6.png',
    category: SCREENSHOT_CATEGORIES.MARKETING,
    description: 'Blank WorkSafeBC Form 6 - The Pain Point',
    caption: 'This is what claimants face - hours of manual form filling',
    url: '/pain-tracker/#demo-blank-form',
    width: 1200,
    height: 630,
    priority: 'phase1',
    useCase: 'Social media posts, blog introductions',
    deviceScaleFactor: 2
  },
  {
    id: 'export-modal',
    name: 'export-modal-solution.png',
    category: SCREENSHOT_CATEGORIES.MARKETING,
    description: 'Export Modal - The Solution',
    caption: 'This is the alternative - one click to generate perfect forms',
    url: '/pain-tracker/#demo-export',
    width: 1200,
    height: 630,
    priority: 'phase1',
    useCase: 'Hero image, landing page above the fold',
    deviceScaleFactor: 2
  },

  // BRANCH 2: Core User Journey
  {
    id: 'pain-entry-interface',
    name: 'pain-entry-interface.png',
    category: SCREENSHOT_CATEGORIES.MARKETING,
    description: 'Pain Entry Interface',
    caption: 'Track your pain in 30 seconds - no complex interfaces',
    url: '/pain-tracker/',
    width: 1200,
    height: 630,
    priority: 'phase1',
    useCase: 'Demo sequences, feature explanations',
    deviceScaleFactor: 2
  },
  {
    id: 'body-map-interaction',
    name: 'body-map-interaction.png',
    category: SCREENSHOT_CATEGORIES.MARKETING,
    description: 'Body Map Interaction',
    caption: 'Pinpoint exact pain locations with clinical precision',
    url: '/pain-tracker/#demo-body-map',
    width: 1200,
    height: 630,
    priority: 'phase2',
    useCase: 'Showing advanced tracking capabilities',
    deviceScaleFactor: 2
  },
  {
    id: 'export-process',
    name: 'export-process.png',
    category: SCREENSHOT_CATEGORIES.MARKETING,
    description: 'Export Process with Form 6/7 Options',
    caption: 'One click exports your data to WorkSafeBC-ready formats',
    url: '/pain-tracker/#demo-export-modal',
    width: 1200,
    height: 630,
    priority: 'phase1',
    useCase: 'Conversion-focused content',
    deviceScaleFactor: 2
  },

  // BRANCH 3: Social Proof & Results
  {
    id: 'form-6-preview',
    name: 'generated-form-6-preview.png',
    category: SCREENSHOT_CATEGORIES.WCB_FORMS,
    description: 'Generated Form 6 Preview',
    caption: 'Perfectly formatted Form 6, generated automatically from your entries',
    url: '/pain-tracker/#demo-form-6',
    width: 1200,
    height: 630,
    priority: 'phase1',
    useCase: 'Trust-building, result demonstrations',
    deviceScaleFactor: 2
  },
  {
    id: 'form-7-preview',
    name: 'generated-form-7-preview.png',
    category: SCREENSHOT_CATEGORIES.WCB_FORMS,
    description: 'Generated Form 7 Preview',
    caption: 'Employer reports generated with the same accuracy',
    url: '/pain-tracker/#demo-form-7',
    width: 1200,
    height: 630,
    priority: 'phase1',
    useCase: 'Comprehensive solution showcasing',
    deviceScaleFactor: 2
  },

  // BRANCH 4: Trust & Security
  {
    id: 'privacy-settings',
    name: 'privacy-security-settings.png',
    category: SCREENSHOT_CATEGORIES.TECHNICAL,
    description: 'Privacy/Security Settings',
    caption: 'Your data never leaves your device - unlike cloud-based competitors',
    url: '/pain-tracker/#demo-settings',
    width: 1200,
    height: 630,
    priority: 'phase1',
    useCase: 'Privacy-focused marketing, addressing concerns',
    deviceScaleFactor: 2
  },
  {
    id: 'offline-functionality',
    name: 'offline-functionality.png',
    category: SCREENSHOT_CATEGORIES.TECHNICAL,
    description: 'Offline Functionality',
    caption: 'Full functionality without internet - crucial for rural BC users',
    url: '/pain-tracker/#demo-offline',
    width: 1200,
    height: 630,
    priority: 'phase2',
    useCase: 'Rural outreach, reliability messaging',
    deviceScaleFactor: 2,
    requiresOfflineMode: true
  },

  // BRANCH 5: Advanced Features
  {
    id: 'analytics-dashboard',
    name: 'analytics-dashboard.png',
    category: SCREENSHOT_CATEGORIES.MARKETING,
    description: 'Analytics Dashboard',
    caption: 'Advanced analytics competitors charge for - included free',
    url: '/pain-tracker/dashboard',
    width: 1200,
    height: 630,
    priority: 'phase2',
    useCase: 'Upsell to power users, feature comparisons',
    deviceScaleFactor: 2
  },
  {
    id: 'trauma-informed-comparison',
    name: 'trauma-informed-mode.png',
    category: SCREENSHOT_CATEGORIES.SOCIAL,
    description: 'Trauma-Informed Mode Comparison',
    caption: 'Switch between clinical and gentle language based on your needs',
    url: '/pain-tracker/#demo-trauma-mode',
    width: 1200,
    height: 630,
    priority: 'phase3',
    useCase: 'Mental health communities, trauma-sensitive outreach',
    deviceScaleFactor: 2
  },

  // BRANCH 6: Social Media Optimization
  {
    id: 'comparison-grid',
    name: 'comparison-grid.png',
    category: SCREENSHOT_CATEGORIES.SOCIAL,
    description: 'Comparison Grid (App vs Competitors)',
    caption: 'Why pay for less when you can get more for free?',
    url: '/pain-tracker/#demo-comparison',
    width: 1200,
    height: 630,
    priority: 'phase2',
    useCase: 'Twitter, Instagram, Facebook posts',
    deviceScaleFactor: 2,
    isInfographic: true
  },
  {
    id: 'benefit-icons-grid',
    name: 'benefit-icons-grid.png',
    category: SCREENSHOT_CATEGORIES.SOCIAL,
    description: 'Benefit Icons Grid',
    caption: '🔒 Privacy First ⚡ One-Click Forms 💸 Free Forever 🏥 Clinical Grade',
    width: 1200,
    height: 630,
    priority: 'phase2',
    useCase: 'Quick social media posts, email headers',
    deviceScaleFactor: 2,
    isInfographic: true
  },
  {
    id: 'process-flow-infographic',
    name: 'process-flow.png',
    category: SCREENSHOT_CATEGORIES.SOCIAL,
    description: 'Process Flow Infographic',
    caption: 'From pain tracking to submitted forms in under 2 minutes',
    width: 1200,
    height: 630,
    priority: 'phase3',
    useCase: 'Explainer content, onboarding sequences',
    deviceScaleFactor: 2,
    isInfographic: true
  },

  // BRANCH 7: Technical Proof
  {
    id: 'architecture-diagram',
    name: 'architecture-diagram.png',
    category: SCREENSHOT_CATEGORIES.TECHNICAL,
    description: 'Architecture Diagram',
    caption: 'Local-first architecture means we can\'t access your data even if we wanted to',
    width: 1200,
    height: 630,
    priority: 'phase3',
    useCase: 'Developer communities, privacy forums',
    deviceScaleFactor: 2,
    isInfographic: true
  },
  {
    id: 'mobile-responsiveness',
    name: 'mobile-responsiveness.png',
    category: SCREENSHOT_CATEGORIES.DOCUMENTATION,
    description: 'Mobile Responsiveness (Phone, Tablet, Desktop)',
    caption: 'Works perfectly on every device - no app store required',
    width: 1200,
    height: 630,
    priority: 'phase2',
    useCase: 'PWA promotion, mobile optimization claims',
    deviceScaleFactor: 2,
    multiDevice: true
  },

  // BRANCH 8: Emotional Connection
  {
    id: 'built-in-bc',
    name: 'built-in-bc.png',
    category: SCREENSHOT_CATEGORIES.SOCIAL,
    description: 'Built in BC Element',
    caption: 'Built by BC developers for BC workers',
    url: '/pain-tracker/#demo-bc-branding',
    width: 1200,
    height: 630,
    priority: 'phase3',
    useCase: 'Local marketing, community outreach',
    deviceScaleFactor: 2
  },
  {
    id: 'crisis-support',
    name: 'crisis-support-feature.png',
    category: SCREENSHOT_CATEGORIES.SOCIAL,
    description: 'Crisis Support Feature',
    caption: 'Built-in crisis detection and support for when pain becomes overwhelming',
    url: '/pain-tracker/#demo-crisis',
    width: 1200,
    height: 630,
    priority: 'phase3',
    useCase: 'Mental health advocacy groups',
    deviceScaleFactor: 2
  }
];

// Additional screenshot sizes for specific use cases
export const SCREENSHOT_SIZES = {
  SOCIAL_SHARE: { width: 1200, height: 630 }, // Open Graph / Twitter Card
  INSTAGRAM_POST: { width: 1080, height: 1080 }, // Square
  INSTAGRAM_STORY: { width: 1080, height: 1920 }, // Vertical
  PWA_NARROW: { width: 540, height: 720 }, // Mobile PWA
  PWA_WIDE: { width: 1280, height: 720 }, // Desktop PWA
  DOCUMENTATION: { width: 1920, height: 1080 } // High-res docs
};

// Helper to get screenshots by priority phase
export function getScreenshotsByPhase(phase) {
  return SCREENSHOT_PORTFOLIO.filter(s => s.priority === phase);
}

// Helper to get screenshots by category
export function getScreenshotsByCategory(category) {
  return SCREENSHOT_PORTFOLIO.filter(s => s.category === category);
}

// Helper to get screenshots that need special handling
export function getInfographicScreenshots() {
  return SCREENSHOT_PORTFOLIO.filter(s => s.isInfographic);
}

export function getMultiDeviceScreenshots() {
  return SCREENSHOT_PORTFOLIO.filter(s => s.multiDevice);
}

export function getOfflineScreenshots() {
  return SCREENSHOT_PORTFOLIO.filter(s => s.requiresOfflineMode);
}
