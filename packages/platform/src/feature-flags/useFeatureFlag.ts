import { useContext } from 'react';
import { FeatureFlagContext } from './FeatureFlagProvider';

export function useFeatureFlag() {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error('useFeatureFlag must be used within a FeatureFlagProvider');
  }
  return context;
}