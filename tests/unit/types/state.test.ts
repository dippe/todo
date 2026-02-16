import {
  isTaskFilter,
  isTaskListState,
  DEFAULT_TASK_LIST_STATE,
} from '@/types/state';
import type { TaskListState } from '@/types/state';
import type { Task, TaskId } from '@/types/task';

describe('State Types', () => {
  describe('isTaskFilter', () => {
    it('should validate "all" filter', () => {
      expect(isTaskFilter('all')).toBe(true);
    });

    it('should validate "active" filter', () => {
      expect(isTaskFilter('active')).toBe(true);
    });

    it('should validate "completed" filter', () => {
      expect(isTaskFilter('completed')).toBe(true);
    });

    it('should reject invalid filter values', () => {
      expect(isTaskFilter('invalid')).toBe(false);
      expect(isTaskFilter('')).toBe(false);
      expect(isTaskFilter('ALL')).toBe(false);
      expect(isTaskFilter(null)).toBe(false);
      expect(isTaskFilter(undefined)).toBe(false);
      expect(isTaskFilter(123)).toBe(false);
    });
  });

  describe('isTaskListState', () => {
    const validTask: Task = {
      id: 'test-id' as TaskId,
      title: 'Test Task',
      completed: false,
      createdAt: 1000,
      updatedAt: 1000,
    };

    it('should validate empty state', () => {
      const state: TaskListState = {
        items: [],
        filter: 'all',
        editingId: null,
      };

      expect(isTaskListState(state)).toBe(true);
    });

    it('should validate state with tasks', () => {
      const state: TaskListState = {
        items: [validTask],
        filter: 'active',
        editingId: null,
      };

      expect(isTaskListState(state)).toBe(true);
    });

    it('should validate state with editingId', () => {
      const state: TaskListState = {
        items: [validTask],
        filter: 'all',
        editingId: 'test-id' as TaskId,
      };

      expect(isTaskListState(state)).toBe(true);
    });

    it('should reject null', () => {
      expect(isTaskListState(null)).toBe(false);
    });

    it('should reject undefined', () => {
      expect(isTaskListState(undefined)).toBe(false);
    });

    it('should reject non-object types', () => {
      expect(isTaskListState('state')).toBe(false);
      expect(isTaskListState(123)).toBe(false);
    });

    it('should reject object with missing items', () => {
      expect(
        isTaskListState({
          filter: 'all',
          editingId: null,
        })
      ).toBe(false);
    });

    it('should reject object with invalid items', () => {
      expect(
        isTaskListState({
          items: 'not an array',
          filter: 'all',
          editingId: null,
        })
      ).toBe(false);
    });

    it('should reject object with invalid filter', () => {
      expect(
        isTaskListState({
          items: [],
          filter: 'invalid',
          editingId: null,
        })
      ).toBe(false);
    });

    it('should reject object with invalid editingId type', () => {
      expect(
        isTaskListState({
          items: [],
          filter: 'all',
          editingId: 123,
        })
      ).toBe(false);
    });
  });

  describe('DEFAULT_TASK_LIST_STATE', () => {
    it('should have empty items array', () => {
      expect(DEFAULT_TASK_LIST_STATE.items).toEqual([]);
    });

    it('should have "all" filter', () => {
      expect(DEFAULT_TASK_LIST_STATE.filter).toBe('all');
    });

    it('should have null editingId', () => {
      expect(DEFAULT_TASK_LIST_STATE.editingId).toBeNull();
    });

    it('should be immutable (frozen)', () => {
      expect(Object.isFrozen(DEFAULT_TASK_LIST_STATE)).toBe(true);
    });
  });
});
