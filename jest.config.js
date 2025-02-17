module.exports = {
  preset: 'ts-jest', // Use ts-jest preset for TypeScript
  testEnvironment: 'node', // Use Node.js environment for the tests
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest', // Handle TypeScript files with ts-jest
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json', // Use your tsconfig.json for Jest
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1', // Support for your alias in paths
  },
  transformIgnorePatterns: [
    '/node_modules/', // Ignore transformation in node_modules unless necessary
  ],
};
