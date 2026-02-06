import {
  saveState,
  loadState,
  exportTasks,
  importTasks,
} from '../../../src/services/storageService';
import * as storageUtils from '../../../src/utils/storage';
import { TaskListState } from '../../../src/types/state';
import { Task, TaskId, Timestamp } from '../../../src/types/task';

// Mock utils/storage
jest.mock('../../../src/utils/storage');

describe('storageService', () => {
  const mockTask: Task = {
    id: '1' as TaskId,
    title: 'Test Task',
    completed: false,
    createdAt: 1234567890 as Timestamp,
    updatedAt: 1234567890 as Timestamp,
  };

  const mockState: TaskListState = {
    items: [mockTask],
    filter: 'all',
    editingId: null,
    formInput: '',
    editingValue: '',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveState', () => {
    it('should call storage.saveToStorage and return success result', () => {
      (storageUtils.saveToStorage as jest.Mock).mockReturnValue({
        ok: true,
        data: undefined,
      });

      const result = saveState(mockState);

      expect(storageUtils.saveToStorage).toHaveBeenCalledWith(mockState);
      expect(result).toEqual({ ok: true, data: undefined });
    });

    it('should return error result if saveToStorage fails', () => {
      const errorMessage = 'Storage full';
      (storageUtils.saveToStorage as jest.Mock).mockReturnValue({
        ok: false,
        error: errorMessage,
      });

      const result = saveState(mockState);

      expect(storageUtils.saveToStorage).toHaveBeenCalledWith(mockState);
      expect(result).toEqual({ ok: false, error: errorMessage });
    });
  });

  describe('loadState', () => {
    it('should call storage.loadFromStorage and return state', () => {
      (storageUtils.loadFromStorage as jest.Mock).mockReturnValue({
        ok: true,
        data: mockState,
      });

      const result = loadState();

      expect(storageUtils.loadFromStorage).toHaveBeenCalled();
      expect(result).toEqual({ ok: true, data: mockState });
    });

    it('should return error result if loadFromStorage fails', () => {
      const errorMessage = 'Load failed';
      (storageUtils.loadFromStorage as jest.Mock).mockReturnValue({
        ok: false,
        error: errorMessage,
      });

      const result = loadState();

      expect(storageUtils.loadFromStorage).toHaveBeenCalled();
      expect(result).toEqual({ ok: false, error: errorMessage });
    });
  });

  describe('exportTasks', () => {
    it('should serialize tasks to JSON string', () => {
      const tasks = [mockTask];
      const result = exportTasks(tasks);

      expect(result.ok).toBe(true);
      if (result.ok) {
        const parsed = JSON.parse(result.data);
        expect(parsed).toEqual(tasks);
      }
    });

    it('should handle empty task list', () => {
      const result = exportTasks([]);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).toBe('[]');
      }
    });

    it('should return error if JSON serialization fails', () => {
      // Construct a circular structure to force stringify failure
      const circular: any = {};
      circular.myself = circular;
      // We can't actually pass circular structure as Task[], so we might need to mock JSON.stringify
      // or just accept that typed Task[] will usually stringify fine.
      // But to test error handling, let's mock JSON.stringify temporarily.

      const originalStringify = JSON.stringify;
      JSON.stringify = jest.fn().mockImplementation(() => {
        throw new Error('Serialization failed');
      });

      const result = exportTasks([mockTask]);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain('Failed to export tasks');
      }

      JSON.stringify = originalStringify;
    });
  });

  describe('importTasks', () => {
    it('should parse valid JSON and return tasks', () => {
      const json = JSON.stringify([mockTask]);
      const result = importTasks(json);

      expect(result).toEqual({ ok: true, data: [mockTask] });
    });

    it('should return error for invalid JSON', () => {
      const json = '{ invalid json }';
      const result = importTasks(json);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain('Invalid JSON format');
      }
    });

    it('should return error if parsed data is not an array', () => {
      const json = JSON.stringify({ not: 'an array' });
      const result = importTasks(json);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain(
          'Imported data is not a valid task list'
        );
      }
    });

    it('should return error if array items are not valid tasks', () => {
      const invalidTasks = [{ ...mockTask, title: 123 }]; // Invalid title type
      const json = JSON.stringify(invalidTasks);
      const result = importTasks(json);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain(
          'Imported data is not a valid task list'
        );
      }
    });
  });
});
