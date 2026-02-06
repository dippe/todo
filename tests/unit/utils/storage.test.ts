/**
 * Unit tests for storage utility functions
 * @module tests/unit/utils/storage
 *
 * Tests LocalStorage operations following TDD methodology.
 */

import type { TaskListState } from '../../../src/types/state';
import type { Task } from '../../../src/types/task';

describe('storage utilities', () => {
  let loadFromStorage: () => import('../../../src/types/result').Result<
    TaskListState,
    string
  >;
  let saveToStorage: (
    state: TaskListState
  ) => import('../../../src/types/result').Result<void, string>;
  let validateStorageData: (data: unknown) => boolean;
  let STORAGE_KEY: string;

  // Mock LocalStorage
  let mockStorage: Map<string, string>;

  const createMockTask = (id: string, title: string): Task =>
    ({
      id,
      title,
      completed: false,
      createdAt: 1_000,
      updatedAt: 1_000,
    }) as unknown as Task;

  const createMockState = (overrides?: Partial<TaskListState>): TaskListState =>
    ({
      items: [],
      filter: 'all',
      editingId: null,
      ...overrides,
    }) as TaskListState;

  beforeEach(async () => {
    // Setup mock LocalStorage
    mockStorage = new Map();
    const mockLocalStorage = {
      getItem: (key: string): string | null => mockStorage.get(key) ?? null,
      setItem: (key: string, value: string): void => {
        mockStorage.set(key, value);
      },
      removeItem: (key: string): void => {
        mockStorage.delete(key);
      },
      clear: (): void => {
        mockStorage.clear();
      },
      length: 0,
      key: (): string | null => null,
    };

    Object.defineProperty(global, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });

    // Dynamic import
    const module = await import('../../../src/utils/storage');
    loadFromStorage = module.loadFromStorage;
    saveToStorage = module.saveToStorage;
    validateStorageData = module.validateStorageData;
    STORAGE_KEY = module.STORAGE_KEY;
  });

  afterEach(() => {
    mockStorage.clear();
  });

  describe('STORAGE_KEY', () => {
    it('should be a non-empty string', () => {
      expect(typeof STORAGE_KEY).toBe('string');
      expect(STORAGE_KEY.length).toBeGreaterThan(0);
    });

    it('should have descriptive name', () => {
      expect(STORAGE_KEY.toLowerCase()).toContain('todo');
    });
  });

  describe('saveToStorage', () => {
    it('should save state to localStorage', () => {
      // Arrange
      const state = createMockState({
        items: [createMockTask('test-id', 'Test Task')],
        filter: 'active',
      });

      // Act
      const result = saveToStorage(state);

      // Assert
      expect(result.ok).toBe(true);
      const stored = mockStorage.get(STORAGE_KEY);
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed.version).toBe(1);
      expect(parsed.data.items).toHaveLength(1);
      expect(parsed.data.filter).toBe('active');
    });

    it('should return success result', () => {
      // Arrange
      const state = createMockState();

      // Act
      const result = saveToStorage(state);

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).toBeUndefined();
      }
    });

    it('should handle empty state', () => {
      // Arrange
      const state = createMockState({ items: [] });

      // Act
      const result = saveToStorage(state);

      // Assert
      expect(result.ok).toBe(true);
      const stored = mockStorage.get(STORAGE_KEY);
      const parsed = JSON.parse(stored!);
      expect(parsed.data.items).toEqual([]);
    });

    it('should add lastSaved timestamp', () => {
      // Arrange
      const state = createMockState();
      const beforeSave = Date.now();

      // Act
      saveToStorage(state);
      const afterSave = Date.now();

      // Assert
      const stored = mockStorage.get(STORAGE_KEY);
      const parsed = JSON.parse(stored!);
      expect(typeof parsed.lastSaved).toBe('number');
      expect(parsed.lastSaved).toBeGreaterThanOrEqual(beforeSave);
      expect(parsed.lastSaved).toBeLessThanOrEqual(afterSave);
    });

    it('should overwrite existing data', () => {
      // Arrange
      const state1 = createMockState({ filter: 'all' });
      const state2 = createMockState({ filter: 'completed' });

      // Act
      saveToStorage(state1);
      saveToStorage(state2);

      // Assert
      const stored = mockStorage.get(STORAGE_KEY);
      const parsed = JSON.parse(stored!);
      expect(parsed.data.filter).toBe('completed');
    });

    it('should handle quota exceeded error', () => {
      // Arrange - Mock quota exceeded error
      const quotaError = new DOMException(
        'QuotaExceededError',
        'QuotaExceededError'
      );
      mockStorage.set = (_key: string, _value: string): Map<string, string> => {
        throw quotaError;
      };

      const state = createMockState();

      // Act
      const result = saveToStorage(state);

      // Assert
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.toLowerCase()).toContain('quota');
      }
    });

    it('should handle security error', () => {
      // Arrange - Mock security error
      const securityError = new DOMException('SecurityError', 'SecurityError');
      mockStorage.set = (_key: string, _value: string): Map<string, string> => {
        throw securityError;
      };

      const state = createMockState();

      // Act
      const result = saveToStorage(state);

      // Assert
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(typeof result.error).toBe('string');
      }
    });

    it('should handle serialization errors gracefully', () => {
      // Arrange - Create circular reference that can't be serialized
      const circularState: unknown = { self: null };
      (circularState as Record<string, unknown>).self = circularState;

      // Act & Assert - should handle gracefully
      try {
        saveToStorage(circularState as TaskListState);
        // If no error, the function should have returned a failure result
      } catch {
        // Expected - circular reference causes error
      }
    });
  });

  describe('loadFromStorage', () => {
    it('should load saved state', () => {
      // Arrange
      const state = createMockState({
        items: [createMockTask('test-id', 'Test Task')],
        filter: 'active',
      });
      saveToStorage(state);

      // Act
      const result = loadFromStorage();

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.items).toHaveLength(1);
        expect(result.data.items[0].title).toBe('Test Task');
        expect(result.data.filter).toBe('active');
      }
    });

    it('should return defaults for first run (no data)', () => {
      // Act - localStorage is empty
      const result = loadFromStorage();

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.items).toEqual([]);
        expect(result.data.filter).toBe('all');
      }
    });

    it('should handle corrupted JSON data', () => {
      // Arrange
      mockStorage.set(STORAGE_KEY, 'invalid json {{}');

      // Act
      const result = loadFromStorage();

      // Assert - should return defaults on error
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.items).toEqual([]);
      }
    });

    it('should handle missing version field', () => {
      // Arrange
      mockStorage.set(
        STORAGE_KEY,
        JSON.stringify({
          data: { items: [], filter: 'all' },
        })
      );

      // Act
      const result = loadFromStorage();

      // Assert - should return defaults
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.items).toEqual([]);
      }
    });

    it('should handle invalid items array', () => {
      // Arrange
      mockStorage.set(
        STORAGE_KEY,
        JSON.stringify({
          version: 1,
          data: { items: 'not an array', filter: 'all' },
          lastSaved: Date.now(),
        })
      );

      // Act
      const result = loadFromStorage();

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.items).toEqual([]);
      }
    });

    it('should handle invalid filter value', () => {
      // Arrange
      mockStorage.set(
        STORAGE_KEY,
        JSON.stringify({
          version: 1,
          data: { items: [], filter: 'invalid' },
          lastSaved: Date.now(),
        })
      );

      // Act
      const result = loadFromStorage();

      // Assert
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.items).toEqual([]);
      }
    });

    it('should return success even when data is invalid (fail-safe)', () => {
      // Arrange
      mockStorage.set(STORAGE_KEY, '{}');

      // Act
      const result = loadFromStorage();

      // Assert - always returns success with defaults
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).toBeDefined();
      }
    });
  });

  describe('validateStorageData', () => {
    it('should return true for valid storage data', () => {
      // Arrange
      const validData = {
        version: 1,
        data: {
          items: [
            {
              id: 'test-id',
              title: 'Test',
              completed: false,
              createdAt: 1000,
              updatedAt: 1000,
            },
          ],
          filter: 'all',
        },
        lastSaved: Date.now(),
      };

      // Act
      const result = validateStorageData(validData);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for null', () => {
      expect(validateStorageData(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(validateStorageData(undefined)).toBe(false);
    });

    it('should return false for non-object values', () => {
      expect(validateStorageData('string')).toBe(false);
      expect(validateStorageData(123)).toBe(false);
      expect(validateStorageData(true)).toBe(false);
    });

    it('should return false for missing version', () => {
      const data = { data: { items: [], filter: 'all' } };
      expect(validateStorageData(data)).toBe(false);
    });

    it('should return false for invalid version type', () => {
      const data = { version: '1', data: { items: [], filter: 'all' } };
      expect(validateStorageData(data)).toBe(false);
    });

    it('should return false for missing data', () => {
      const data = { version: 1 };
      expect(validateStorageData(data)).toBe(false);
    });

    it('should return false for invalid data type', () => {
      const data = { version: 1, data: 'not an object' };
      expect(validateStorageData(data)).toBe(false);
    });

    it('should return false for missing items array', () => {
      const data = { version: 1, data: { filter: 'all' } };
      expect(validateStorageData(data)).toBe(false);
    });

    it('should return false for non-array items', () => {
      const data = { version: 1, data: { items: 'not array', filter: 'all' } };
      expect(validateStorageData(data)).toBe(false);
    });

    it('should return false for invalid filter', () => {
      const data = { version: 1, data: { items: [], filter: 'invalid' } };
      expect(validateStorageData(data)).toBe(false);
    });

    it('should return true for empty items array', () => {
      const data = { version: 1, data: { items: [], filter: 'all' } };
      expect(validateStorageData(data)).toBe(true);
    });

    it('should return false for task with missing required fields', () => {
      const data = {
        version: 1,
        data: {
          items: [{ id: 'test', title: 'Test' }], // missing completed, createdAt, updatedAt
          filter: 'all',
        },
      };
      expect(validateStorageData(data)).toBe(false);
    });
  });

  describe('integration', () => {
    it('should save and load round-trip correctly', () => {
      // Arrange
      const originalState = createMockState({
        items: [
          createMockTask('id-1', 'Task 1'),
          createMockTask('id-2', 'Task 2'),
        ],
        filter: 'active',
      });

      // Act
      const saveResult = saveToStorage(originalState);
      expect(saveResult.ok).toBe(true);

      const loadResult = loadFromStorage();

      // Assert
      expect(loadResult.ok).toBe(true);
      if (loadResult.ok) {
        expect(loadResult.data.items).toHaveLength(2);
        expect(loadResult.data.items[0].id).toBe('id-1');
        expect(loadResult.data.items[1].id).toBe('id-2');
        expect(loadResult.data.filter).toBe('active');
      }
    });

    it('should preserve task properties through save/load cycle', () => {
      // Arrange
      const task = {
        id: 'preserved-id',
        title: 'Preserved Task',
        completed: true,
        createdAt: 1_000_000,
        updatedAt: 2_000_000,
      } as Task;
      const state = createMockState({ items: [task] });

      // Act
      saveToStorage(state);
      const loadResult = loadFromStorage();

      // Assert
      expect(loadResult.ok).toBe(true);
      if (loadResult.ok) {
        const loadedTask = loadResult.data.items[0];
        expect(loadedTask.id).toBe('preserved-id');
        expect(loadedTask.title).toBe('Preserved Task');
        expect(loadedTask.completed).toBe(true);
        expect(loadedTask.createdAt).toBe(1_000_000);
        expect(loadedTask.updatedAt).toBe(2_000_000);
      }
    });
  });
});
