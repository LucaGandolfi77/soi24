/* eslint-disable */
export default {
  displayName: 'soi24-game-ui',
  preset: './jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  moduleNameMapper: {
    '@fontsource': 'identity-obj-proxy',
  },
  coverageDirectory: './coverage/soi24-game-ui',
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.[jt]s?(x)',
    '<rootDir>/src/**/*(*.)@(spec|test).[jt]s?(x)',
  ],
  setupFilesAfterEnv: [
    '<rootDir>/jest.mockup.js',
  ],
};
