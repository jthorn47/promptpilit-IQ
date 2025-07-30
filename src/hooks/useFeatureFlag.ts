import { featureFlags, FeatureFlagKey } from '@/config/featureFlags';

export const useFeatureFlag = (flagKey: FeatureFlagKey): boolean => {
  return featureFlags[flagKey];
};