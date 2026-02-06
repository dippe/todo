import {
  TaskListState,
  TaskListMetrics,
  RootState,
} from '../../../src/types/state';
import { Task, TaskList, TaskId, Timestamp } from '../../../src/types/task';
import {
  selectAllTasks,
  selectFilter,
  selectEditingId,
  selectFilteredTasks,
  selectMetrics,
  selectEditingTask,
} from '../../../src/store/selectors';

describe('selectors', () => {
  const createMockTask = (
    id: string,
    title: string,
    completed: boolean
  ): Task => ({
    id: id as TaskId,
    title,
    completed,
    createdAt: 1000 as Timestamp,
    updatedAt: 1000 as Timestamp,
  });

  const createMockState = (
    overrides: Partial<TaskListState> = {}
  ): RootState => ({
    taskList: {
      items: [],
      filter: 'all',
      editingId: null,
      ...overrides,
    },
  });

  describe('selectAllTasks', () => {
    it('should return all tasks', () => {
      const tasks: TaskList = [
        createMockTask('1', 'Task 1', false),
        createMockTask('2', 'Task 2', true),
      ];
      const state = createMockState({ items: tasks });

      expect(selectAllTasks(state)).toEqual(tasks);
    });

    it('should return empty array when no tasks', () => {
      const state = createMockState({ items: [] });

      expect(selectAllTasks(state)).toEqual([]);
    });

    it('should return reference to same array (memoized)', () => {
      const tasks: TaskList = [createMockTask('1', 'Task', false)];
      const state = createMockState({ items: tasks });

      const first = selectAllTasks(state);
      const second = selectAllTasks(state);

      expect(first).toBe(second);
    });
  });

  describe('selectFilter', () => {
    it('should return current filter', () => {
      const state = createMockState({ filter: 'active' });

      expect(selectFilter(state)).toBe('active');
    });

    it('should return all by default', () => {
      const state = createMockState();

      expect(selectFilter(state)).toBe('all');
    });
  });

  describe('selectEditingId', () => {
    it('should return editing ID', () => {
      const state = createMockState({ editingId: 'task-1' as TaskId });

      expect(selectEditingId(state)).toBe('task-1');
    });

    it('should return null when not editing', () => {
      const state = createMockState({ editingId: null });

      expect(selectEditingId(state)).toBeNull();
    });
  });

  describe('selectFilteredTasks', () => {
    it('should return all tasks when filter is all', () => {
      const tasks: TaskList = [
        createMockTask('1', 'Task 1', false),
        createMockTask('2', 'Task 2', true),
      ];
      const state = createMockState({ items: tasks, filter: 'all' });

      expect(selectFilteredTasks(state)).toEqual(tasks);
    });

    it('should return only active tasks when filter is active', () => {
      const tasks: TaskList = [
        createMockTask('1', 'Active', false),
        createMockTask('2', 'Completed', true),
        createMockTask('3', 'Another Active', false),
      ];
      const state = createMockState({ items: tasks, filter: 'active' });
      const result = selectFilteredTasks(state);

      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe('1');
      expect(result[1]?.id).toBe('3');
    });

    it('should return only completed tasks when filter is completed', () => {
      const tasks: TaskList = [
        createMockTask('1', 'Active', false),
        createMockTask('2', 'Completed 1', true),
        createMockTask('3', 'Completed 2', true),
      ];
      const state = createMockState({ items: tasks, filter: 'completed' });
      const result = selectFilteredTasks(state);

      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe('2');
      expect(result[1]?.id).toBe('3');
    });

    it('should return empty array when no matching tasks', () => {
      const tasks: TaskList = [createMockTask('1', 'Task', false)];
      const state = createMockState({ items: tasks, filter: 'completed' });

      expect(selectFilteredTasks(state)).toEqual([]);
    });

    it('should be memoized for same state', () => {
      const tasks: TaskList = [
        createMockTask('1', 'Task 1', false),
        createMockTask('2', 'Task 2', true),
      ];
      const state = createMockState({ items: tasks, filter: 'all' });

      const first = selectFilteredTasks(state);
      const second = selectFilteredTasks(state);

      expect(first).toBe(second);
    });

    it('should recalculate when filter changes', () => {
      const tasks: TaskList = [
        createMockTask('1', 'Task 1', false),
        createMockTask('2', 'Task 2', true),
      ];
      const state1 = createMockState({ items: tasks, filter: 'all' });
      const state2 = createMockState({ items: tasks, filter: 'active' });

      const result1 = selectFilteredTasks(state1);
      const result2 = selectFilteredTasks(state2);

      expect(result1).toHaveLength(2);
      expect(result2).toHaveLength(1);
      expect(result1).not.toBe(result2);
    });

    it('should recalculate when tasks change', () => {
      const tasks1: TaskList = [createMockTask('1', 'Task 1', false)];
      const tasks2: TaskList = [
        createMockTask('1', 'Task 1', false),
        createMockTask('2', 'Task 2', true),
      ];
      const state1 = createMockState({ items: tasks1, filter: 'all' });
      const state2 = createMockState({ items: tasks2, filter: 'all' });

      const result1 = selectFilteredTasks(state1);
      const result2 = selectFilteredTasks(state2);

      expect(result1).toHaveLength(1);
      expect(result2).toHaveLength(2);
      expect(result1).not.toBe(result2);
    });
  });

  describe('selectMetrics', () => {
    it('should calculate metrics for all tasks', () => {
      const tasks: TaskList = [
        createMockTask('1', 'Active 1', false),
        createMockTask('2', 'Completed 1', true),
        createMockTask('3', 'Active 2', false),
        createMockTask('4', 'Completed 2', true),
      ];
      const state = createMockState({ items: tasks, filter: 'all' });
      const metrics: TaskListMetrics = selectMetrics(state);

      expect(metrics.total).toBe(4);
      expect(metrics.active).toBe(2);
      expect(metrics.completed).toBe(2);
      expect(metrics.filtered).toBe(4);
    });

    it('should calculate metrics for active filter', () => {
      const tasks: TaskList = [
        createMockTask('1', 'Active 1', false),
        createMockTask('2', 'Completed 1', true),
        createMockTask('3', 'Active 2', false),
      ];
      const state = createMockState({ items: tasks, filter: 'active' });
      const metrics: TaskListMetrics = selectMetrics(state);

      expect(metrics.total).toBe(3);
      expect(metrics.active).toBe(2);
      expect(metrics.completed).toBe(1);
      expect(metrics.filtered).toBe(2);
    });

    it('should calculate metrics for completed filter', () => {
      const tasks: TaskList = [
        createMockTask('1', 'Active 1', false),
        createMockTask('2', 'Completed 1', true),
        createMockTask('3', 'Completed 2', true),
      ];
      const state = createMockState({ items: tasks, filter: 'completed' });
      const metrics: TaskListMetrics = selectMetrics(state);

      expect(metrics.total).toBe(3);
      expect(metrics.active).toBe(1);
      expect(metrics.completed).toBe(2);
      expect(metrics.filtered).toBe(2);
    });

    it('should handle empty task list', () => {
      const state = createMockState({ items: [], filter: 'all' });
      const metrics: TaskListMetrics = selectMetrics(state);

      expect(metrics.total).toBe(0);
      expect(metrics.active).toBe(0);
      expect(metrics.completed).toBe(0);
      expect(metrics.filtered).toBe(0);
    });

    it('should be memoized for same state', () => {
      const tasks: TaskList = [
        createMockTask('1', 'Task 1', false),
        createMockTask('2', 'Task 2', true),
      ];
      const state = createMockState({ items: tasks, filter: 'all' });

      const first = selectMetrics(state);
      const second = selectMetrics(state);

      expect(first).toBe(second);
    });

    it('should recalculate when tasks change', () => {
      const tasks1: TaskList = [createMockTask('1', 'Task', false)];
      const tasks2: TaskList = [
        createMockTask('1', 'Task', false),
        createMockTask('2', 'Task 2', false),
      ];
      const state1 = createMockState({ items: tasks1, filter: 'all' });
      const state2 = createMockState({ items: tasks2, filter: 'all' });

      const result1 = selectMetrics(state1);
      const result2 = selectMetrics(state2);

      expect(result1.total).toBe(1);
      expect(result2.total).toBe(2);
      expect(result1).not.toBe(result2);
    });

    it('should recalculate when filter changes', () => {
      const tasks: TaskList = [
        createMockTask('1', 'Active', false),
        createMockTask('2', 'Completed', true),
      ];
      const state1 = createMockState({ items: tasks, filter: 'all' });
      const state2 = createMockState({ items: tasks, filter: 'active' });

      const result1 = selectMetrics(state1);
      const result2 = selectMetrics(state2);

      expect(result1.filtered).toBe(2);
      expect(result2.filtered).toBe(1);
      expect(result1).not.toBe(result2);
    });
  });

  describe('selectEditingTask', () => {
    it('should return the task being edited', () => {
      const tasks: TaskList = [
        createMockTask('1', 'Task 1', false),
        createMockTask('2', 'Task 2', false),
      ];
      const state = createMockState({ items: tasks, editingId: '2' as TaskId });
      const editingTask = selectEditingTask(state);

      expect(editingTask).toBeDefined();
      expect(editingTask?.id).toBe('2');
      expect(editingTask?.title).toBe('Task 2');
    });

    it('should return undefined when not editing', () => {
      const tasks: TaskList = [createMockTask('1', 'Task 1', false)];
      const state = createMockState({ items: tasks, editingId: null });

      expect(selectEditingTask(state)).toBeUndefined();
    });

    it('should return undefined for non-existent editing ID', () => {
      const tasks: TaskList = [createMockTask('1', 'Task 1', false)];
      const state = createMockState({
        items: tasks,
        editingId: 'non-existent' as TaskId,
      });

      expect(selectEditingTask(state)).toBeUndefined();
    });

    it('should be memoized for same state', () => {
      const tasks: TaskList = [createMockTask('1', 'Task 1', false)];
      const state = createMockState({ items: tasks, editingId: '1' as TaskId });

      const first = selectEditingTask(state);
      const second = selectEditingTask(state);

      expect(first).toBe(second);
    });

    it('should recalculate when editingId changes', () => {
      const tasks: TaskList = [
        createMockTask('1', 'Task 1', false),
        createMockTask('2', 'Task 2', false),
      ];
      const state1 = createMockState({
        items: tasks,
        editingId: '1' as TaskId,
      });
      const state2 = createMockState({
        items: tasks,
        editingId: '2' as TaskId,
      });

      const result1 = selectEditingTask(state1);
      const result2 = selectEditingTask(state2);

      expect(result1?.title).toBe('Task 1');
      expect(result2?.title).toBe('Task 2');
      expect(result1).not.toBe(result2);
    });

    it('should recalculate when tasks change', () => {
      const tasks1: TaskList = [createMockTask('1', 'Old Title', false)];
      const tasks2: TaskList = [createMockTask('1', 'New Title', false)];
      const state1 = createMockState({
        items: tasks1,
        editingId: '1' as TaskId,
      });
      const state2 = createMockState({
        items: tasks2,
        editingId: '1' as TaskId,
      });

      const result1 = selectEditingTask(state1);
      const result2 = selectEditingTask(state2);

      expect(result1?.title).toBe('Old Title');
      expect(result2?.title).toBe('New Title');
    });
  });
});
