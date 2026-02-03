import '@testing-library/jest-dom';

// Mock crypto.randomUUID for Jest environment
// Generate unique UUIDs using a simple incrementing counter
let uuidCounter = 0;
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => {
      // Generate a valid UUID v4 format with unique values
      const counter = (uuidCounter++).toString(16).padStart(12, '0');
      return `550e8400-e29b-41d4-a716-${counter}` as string;
    },
  },
});
