import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    // Transform ESM-only packages so Jest (CJS) can consume them
    '^.+\\.jsx?$': 'ts-jest',
  },
  transformIgnorePatterns: [
    // Only ignore node_modules that are NOT ESM-only
    '<rootDir>/node_modules/(?!(uuid|@aws-sdk)/)',
  ],
  testMatch: ['**/__tests__/**/*.test.ts'],
  testTimeout: 15000,
};

export default config;
