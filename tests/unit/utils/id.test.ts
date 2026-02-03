/**
 * Unit tests for ID utility functions
 * @module tests/unit/utils/id
 *
 * Tests UUID generation functionality following TDD methodology.
 */

import type { TaskId } from '../../../src/types/task';

describe('id utilities', () => {
  describe('generateId', () => {
    let generateId: () => TaskId;

    beforeEach(async () => {
      // Dynamic import to avoid hoisting issues
      const module = await import('../../../src/utils/id');
      generateId = module.generateId;
    });

    it('should return a string', () => {
      // Arrange & Act
      const id = generateId();

      // Assert
      expect(typeof id).toBe('string');
    });

    it('should return unique IDs', () => {
      // Arrange & Act
      const id1 = generateId();
      const id2 = generateId();
      const id3 = generateId();

      // Assert - all IDs should be different
      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });

    it('should return non-empty string', () => {
      // Arrange & Act
      const id = generateId();

      // Assert
      expect(id.length).toBeGreaterThan(0);
    });

    it('should return ID matching TaskId type (branded string)', () => {
      // Arrange & Act
      const id = generateId();

      // Assert - TaskId is a branded string, so it should be assignable to string
      // and have the structure of a UUID
      expect(typeof id).toBe('string');
      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(uuidRegex.test(id)).toBe(true);
    });

    it('should return valid UUID v4 format', () => {
      // Arrange & Act
      const id = generateId();

      // Assert - UUID v4 has specific format requirements
      const parts = id.split('-');
      expect(parts).toHaveLength(5);
      expect(parts[0]).toHaveLength(8);
      expect(parts[1]).toHaveLength(4);
      expect(parts[2]).toHaveLength(4);
      expect(parts[3]).toHaveLength(4);
      expect(parts[4]).toHaveLength(12);
      // Version bit (13th character should be '4')
      expect(parts[2][0]).toBe('4');
      // Variant bits (17th character should be 8, 9, a, or b)
      const variantChar = parts[3][0].toLowerCase();
      expect(['8', '9', 'a', 'b']).toContain(variantChar);
    });

    it('should generate many unique IDs without collisions', () => {
      // Arrange
      const ids: Set<string> = new Set();
      const count = 100;

      // Act
      for (let i = 0; i < count; i++) {
        ids.add(generateId());
      }

      // Assert - all 100 IDs should be unique
      expect(ids.size).toBe(count);
    });
  });
});
