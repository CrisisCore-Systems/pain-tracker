export type BetaFlags = {
  advancedAnalytics: boolean;
  workSafeBCExport: boolean;
  emergencyProtocols: boolean;
  experimentalUI: boolean;
};

const betaConfig: BetaFlags = {
  advancedAnalytics: true,
  workSafeBCExport: true,
  emergencyProtocols: false,
  experimentalUI: false,
};

export default betaConfig;

export function isFeatureEnabled<K extends keyof BetaFlags>(k: K) {
  return betaConfig[k];
}

export const BETA_WARNING = {
  title: 'Beta Software Notice',
  message:
    "You're running a beta version of Pain Tracker. Please backup your data regularly. This build is intended for testing and feedback. Report issues at the repository issues page.",
  supportUrl: 'https://github.com/CrisisCore-Systems/pain-tracker/issues',
};

export const BETA_LOCALSTORAGE_KEY = 'pain-tracker:beta-dismissed';
