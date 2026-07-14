module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
      },
    ],
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@platform/(.*)$': '<rootDir>/packages/platform/src/$1',
    '^@shared/(.*)$': '<rootDir>/packages/shared/$1',
  },
  setupFilesAfterSetup: ['@testing-library/jest-dom'],
  setupFiles: ['<rootDir>/jest.setup.ts'],
  testPathPattern: ['__tests__/**/*.(test|spec).(ts|tsx)', 'src/**/*.(test|spec).(ts|tsx)'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/.turbo/',
    '/__mocks__/',
    'index.ts',
    'vite-env.d.ts',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/vite-env.d.ts',
  ],
  coverageThresholds: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testTimeout: 10000,
  verbose: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};