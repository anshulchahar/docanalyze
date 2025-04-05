// jest.config.js
import { createJestConfig } from 'next/jest.js';

const config = createJestConfig({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})({
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // Handle module aliases (if you're using these in your Next.js project)
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/_*.{js,jsx,ts,tsx}',
    '!src/**/node_modules/**',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/.next/']
});

export default config;