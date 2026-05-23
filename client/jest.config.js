module.exports = {
  transform: {
    '^.+\\.m?js$': 'babel-jest',
  },
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
  ],
  testEnvironment: 'jsdom',
};
