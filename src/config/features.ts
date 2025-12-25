export type FeatureFlags = {
  advancedAnalytics: boolean;
  workSafeBCExport: boolean;
  emergencyProtocols: boolean;
  experimentalUI: boolean;
};

const featureConfig: FeatureFlags = {
  advancedAnalytics: true,
  workSafeBCExport: true,
  emergencyProtocols: false,
  experimentalUI: false,
};

export default featureConfig;

export function isFeatureEnabled<K extends keyof FeatureFlags>(k: K) {
  return featureConfig[k];
}
