import { useContext } from 'react';
import { FeatureFlagContext } from '../feature-flags/FeatureFlagProvider';

export function usePlugin() {
  return {
    plugins: [],
    getPlugin: (id: string) => null,
    isPluginEnabled: (id: string) => false,
  };
}