/**
 * Unit tests for State types
 * @module tests/unit/types/state
 */

import {
  type TaskFilter,
  type TaskListState,
  type RootState,
  type TaskListMetrics,
  isTaskFilter,
  createInitialTaskListState,
  createInitialRootState,
} from '../../../src/types/state';
import type { Task, TaskList, TaskId, Timestamp } from '../../../src/types/task';

describe('State Types', () => {
  describe('TaskFilter', () => {
    it('should accept "all" as a valid filter', () => {
      // Arrange
      const filter: TaskFilter = 'all';

      // Assert
      expect(filter).toBe('all');
      expect(isTaskFilter(filter)).toBe(true);
    });

    it('should accept "active" as a valid filter', () => {
      // Arrange
      const filter: TaskFilter = 'active';

      // Assert
      expect(filter).toBe('active');
      expect(isTaskFilter(filter)).toBe(true);
    });

    it('should accept "completed" as a valid filter', () => {
      // Arrange
      const filter: TaskFilter = 'completed';

      // Assert
      expect(filter).toBe('completed');
      expect(isTaskFilter(filter)).toBe(true);
    });

    it('should not accept invalid filter values', () => {
      // Assert
      expect(isTaskFilter('invalid')).toBe(false);
      expect(isTaskFilter('')).toBe(false);
      expect(isTaskFilter(null)).toBe(false);
      expect(isTaskFilter(undefined)).toBe(false);
      expect(isTaskFilter(123)).toBe(false);
    });
  });

  describe('TaskListState', () => {
    it('should create a valid initial state', () => {
      // Act
      const state = createInitialTaskListState();

      // Assert
      expect(state).toEqual({
        items: [],
        filter: 'all',
        editingId: null,
      });
    });

    it('should accept a state with tasks', () => {
      // Arrange
      const tasks: TaskList = [
        {
          id: 'task-1' as TaskId,
          title: 'Task 1',
          completed: false,
          createdAt: 1234567890 as Timestamp,
          updatedAt: 1234567890 as Timestamp,
        },
      ];

      const state: TaskListState = {
        items: tasks,
        filter: 'active',
        editingId: 'task-1' as TaskId,
      };

      // Assert
      expect(state.items).toHaveLength(1);
      expect(state.filter).toBe('active');
      expect(state.editingId).toBe('task-1');
    });

    it('should accept null editingId', () => {
      // Arrange
      const state: TaskListState = {
        items: [],
        filter: 'all',
        editingId: null,
      };

      // Assert
      expect(state.editingId).toBeNull();
    });

    it('should have readonly items array', () => {
      // Arrange
      const state = createInitialTaskListState();

      // The readonly nature is enforced at compile time,
      // but we can verify the structure
      expect(Array.isArray(state.items)).toBe(true);
    });
  });

  describe('RootState', () => {
    it('should create a valid initial root state', () => {
      // Act
      const state = createInitialRootState();

      // Assert
      expect(state).toHaveProperty('taskList');
      expect(state.taskList).toEqual({
        items: [],
        filter: 'all',
        editingId: null,
      });
    });

    it('should contain TaskListState as taskList property', () => {
      // Arrange
      const tasks: TaskList = [
        {
          id: 'task-1' as TaskId,
          title: 'Task 1',
          completed: true,
          createdAt: 1234567890 as Timestamp,
          updatedAt: 1234567890 as Timestamp,
        },
      ];

      const rootState: RootState = {
        taskList: {
          items: tasks,
          filter: 'completed',
          editingId: null,
        },
      };

      // Assert
      expect(rootState.taskList.items).toHaveLength(1);
      expect(rootState.taskList.filter).toBe('completed');
    });
  });

  describe('TaskListMetrics', () => {
    it('should accept a valid metrics object', () => {
      // Arrange
      const metrics: TaskListMetrics = {
        total: 10,
        active: 5,
        completed: 5,
        filtered: 5,
      };

      // Assert
      expect(metrics.total).toBe(10);
      expect(metrics.active).toBe(5);
      expect(metrics.completed).toBe(5);
      expect(metrics.filtered).toBe(5);
    });

    it('should accept zero values', () => {
      // Arrange
      const metrics: TaskListMetrics = {
        total: 0,
        active: 0,
        completed: 0,
        filtered: 0,
      };

      // Assert
      expect(metrics.total).toBe(0);
    });

    it('should have all required number properties', () => {
      // Arrange
      const metrics: TaskListMetrics = {
        total: 100,
        active: 50,
        completed: 50,
        filtered: 25,
      };

      // Assert
      expect(typeof metrics.total).toBe('number');
      expect(typeof metrics.active).toBe('number');
      expect(typeof metrics.completed).toBe('number');
      expect(typeof metrics.filtered).toBe('number');
    });
  });

  describe('isTaskFilter type guard', () => {
    it('should return true for "all"', () => {
      expect(isTaskFilter('all')).toBe(true);
    });

    it('should return true for "active"', () => {
      expect(isTaskFilter('active')).toBe(true);
    });

    it('should return true for "completed"', () => {
      expect(isTaskFilter('completed')).toBe(true);
    });

    it('should return false for invalid string', () => {
      expect(isTaskFilter('invalid')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isTaskFilter('')).toBe(false);
    });

    it('should return false for null', () => {
      expect(isTaskFilter(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isTaskFilter(undefined)).toBe(false);
    });

    it('should return false for number', () => {
      expect(isTaskFilter(123)).toBe(false);
    });

    it('should return false for object', () => {
      expect(isTaskFilter({})).toBe(false);
    });
  });

  describe('createInitialTaskListState', () => {
    it('should return state with empty items array', () => {
      const state = createInitialTaskListState();
      expect(state.items).toEqual([]);
    });

    it('should return state with filter set to "all"', () => {
      const state = createInitialTaskListState();
      expect(state.filter).toBe('all');
    });

    it('should return state with editingId set to null', () => {
      const state = createInitialTaskListState();
      expect(state.editingId).toBeNull();
    });
  });

  describe('createInitialRootState', () => {
    it('should return state with taskList property', () => {
      const state = createInitialRootState();
      expect(state.taskList).toBeDefined();
    });

    it('should return state with initialized taskList', () => {
      const state = createInitialRootState();
      expect(state.taskList.items).toEqual([]);
      expect(state.taskList.filter).toBe('all');
      expect(state.taskList.editingId).toBeNull();
    });
  });
});
