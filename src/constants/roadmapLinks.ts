const FEATURE_MATRIX_BASE_PATH = '/docs/FEATURE_MATRIX.md';

export interface RoadmapLink {
  href: string;
  label: string;
  summary: string;
  issueUrl?: string;
  issueLabel?: string;
}

const matrixAnchor = (anchor: string) => `${FEATURE_MATRIX_BASE_PATH}#${anchor}`;

export const roadmapLinks = {
  holisticMilestones: {
    href: matrixAnchor('holistic-progress-milestones'),
    label: 'Holistic Progress Milestones',
    summary:
      'Milestone timelines will showcase celebrations and breakthrough moments gathered from your progress entries.',
    issueUrl:
      'https://github.com/CrisisCore-Systems/pain-tracker/issues?q=is%3Aopen+holistic+milestones',
    issueLabel: 'see related issues',
  },
  copingCoach: {
    href: matrixAnchor('adaptive-coping-strategy-coach'),
    label: 'Adaptive Coping Strategy Coach',
    summary: 'Personalized coping strategy guidance is being wired into the tracker next.',
    issueUrl:
      'https://github.com/CrisisCore-Systems/pain-tracker/issues?q=is%3Aopen+coping+strategy',
    issueLabel: 'explore open tasks',
  },
  comparisonAnalytics: {
    href: matrixAnchor('comparison-analytics-20'),
    label: 'Comparison Analytics 2.0',
    summary:
      'We are expanding comparison analytics to contrast treatments, time ranges, and custom cohorts.',
    issueUrl:
      'https://github.com/CrisisCore-Systems/pain-tracker/issues?q=is%3Aopen+comparison+analytics',
    issueLabel: 'track roadmap work',
  },
  visualComparison: {
    href: matrixAnchor('visual-comparison-charts'),
    label: 'Visual Comparison Charts',
    summary:
      'Interactive charts will let you visualize how outcomes shift across time periods and treatments.',
    issueUrl:
      'https://github.com/CrisisCore-Systems/pain-tracker/issues?q=is%3Aopen+visual+comparison',
    issueLabel: 'view design thread',
  },
  empathyIntelligence: {
    href: matrixAnchor('empathy-intelligence-deep-dives'),
    label: 'Pattern-aware insights deep dives',
    summary: 'Expanded insights dashboards will surface granular patterns and progress signals.',
    issueUrl:
      'https://github.com/CrisisCore-Systems/pain-tracker/issues?q=is%3Aopen+empathy+intelligence',
    issueLabel: 'review empathy IQ roadmap',
  },
  neuralPatterns: {
    href: matrixAnchor('empathy-intelligence-deep-dives'),
    label: 'Pattern-aware insights deep dives',
    summary: 'Neural pattern exploration will unpack simulated mirror neuron signals and trends.',
    issueUrl:
      'https://github.com/CrisisCore-Systems/pain-tracker/issues?q=is%3Aopen+neural+empathy',
    issueLabel: 'inspect neural pattern tasks',
  },
  wisdomJourney: {
    href: matrixAnchor('empathy-intelligence-deep-dives'),
    label: 'Pattern-aware insights deep dives',
    summary:
      'Wisdom journey timelines will chart insights, learning arcs, and reflection milestones.',
    issueUrl:
      'https://github.com/CrisisCore-Systems/pain-tracker/issues?q=is%3Aopen+wisdom+journey',
    issueLabel: 'follow wisdom tracker work',
  },
  temporalAnalysis: {
    href: matrixAnchor('empathy-intelligence-deep-dives'),
    label: 'Pattern-aware insights deep dives',
    summary:
      'Temporal analysis will highlight daily, weekly, and seasonal rhythms.',
    issueUrl:
      'https://github.com/CrisisCore-Systems/pain-tracker/issues?q=is%3Aopen+temporal+empathy',
    issueLabel: 'monitor temporal analysis work',
  },
  predictiveInsights: {
    href: matrixAnchor('empathy-intelligence-deep-dives'),
    label: 'Pattern-aware insights deep dives',
    summary: 'Predictive insights will forecast burnout risks and growth windows.',
    issueUrl:
      'https://github.com/CrisisCore-Systems/pain-tracker/issues?q=is%3Aopen+predictive+empathy',
    issueLabel: 'review predictive roadmap',
  },
  culturalEmpathy: {
    href: matrixAnchor('empathy-intelligence-deep-dives'),
    label: 'Pattern-aware insights deep dives',
    summary: 'Cultural empathy explorers will surface intersectional patterns and guidance.',
    issueUrl:
      'https://github.com/CrisisCore-Systems/pain-tracker/issues?q=is%3Aopen+cultural+empathy',
    issueLabel: 'browse cultural empathy work',
  },
  microMoments: {
    href: matrixAnchor('empathy-intelligence-deep-dives'),
    label: 'Pattern-aware insights deep dives',
    summary: 'Micro-moment tracking will capture and celebrate quick wins.',
    issueUrl: 'https://github.com/CrisisCore-Systems/pain-tracker/issues?q=is%3Aopen+micro+empathy',
    issueLabel: 'follow micro-moment tasks',
  },
  clinicAppointments: {
    href: matrixAnchor('clinic-portal-expansion'),
    label: 'Clinic Appointments',
    summary: 'Integrated appointment scheduling and management for clinical practitioners.',
    issueUrl: 'https://github.com/CrisisCore-Systems/pain-tracker/issues?q=is%3Aopen+clinic+portal',
    issueLabel: 'track portal work',
  },
  clinicCompliance: {
    href: matrixAnchor('clinic-portal-expansion'),
    label: 'Compliance Logs',
    summary: 'Privacy-aligned audit logging and access tracking for administrative oversight.',
    issueUrl: 'https://github.com/CrisisCore-Systems/pain-tracker/issues?q=is%3Aopen+clinic+portal',
    issueLabel: 'track portal work',
  },
  clinicReports: {
    href: matrixAnchor('clinic-portal-expansion'),
    label: 'Clinical Reports',
    summary: 'Population health summaries and advanced patient reporting tools.',
    issueUrl: 'https://github.com/CrisisCore-Systems/pain-tracker/issues?q=is%3Aopen+clinic+portal',
    issueLabel: 'track portal work',
  },
  visualBodyMap: {
    href: matrixAnchor('heatmaps'),
    label: 'Interactive Body Maps',
    summary: 'Visual selection and heatmap overlays for intuitive pain localization.',
    issueUrl: 'https://github.com/CrisisCore-Systems/pain-tracker/issues?q=is%3Aopen+body+map',
    issueLabel: 'follow visualization work',
  },
} satisfies Record<string, RoadmapLink>;

type RoadmapKey = keyof typeof roadmapLinks;

export type { RoadmapKey };
