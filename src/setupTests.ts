import '@testing-library/jest-dom';

// Mock crypto.randomUUID for Jest environment
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'mock-uuid-12345',
  },
});
