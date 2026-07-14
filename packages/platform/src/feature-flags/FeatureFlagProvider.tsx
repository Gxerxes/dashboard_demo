import React, { createContext } from 'react';
import type { FeatureFlag } from '../types';

interface FeatureFlagContextValue {
  isEnabled: (key: string) => boolean;
  getFlag: (key: string) => FeatureFlag | undefined;
  flags: FeatureFlag[];
}

export const FeatureFlagContext = createContext<FeatureFlagContextValue | null>(null);

interface FeatureFlagProviderProps {
  flags: FeatureFlag[];
  children: React.ReactNode;
}

export function FeatureFlagProvider({ flags, children }: FeatureFlagProviderProps) {
  const flagMap = new Map(flags.map((f) => [f.key, f]));

  const value: FeatureFlagContextValue = {
    isEnabled: (key: string) => flagMap.get(key)?.enabled ?? false,
    getFlag: (key: string) => flagMap.get(key),
    flags,
  };

  return <FeatureFlagContext.Provider value={value}>{children}</FeatureFlagContext.Provider>;
}