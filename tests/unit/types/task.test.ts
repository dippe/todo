import { isTask, isTaskList } from '@/types/task';
import type { Task, TaskId } from '@/types/task';

describe('Task Type Guards', () => {
  describe('isTask', () => {
    it('should validate a correct task object', () => {
      const task: Task = {
        id: '550e8400-e29b-41d4-a716-446655440000' as TaskId,
        title: 'Buy groceries',
        completed: false,
        createdAt: 1738598400000,
        updatedAt: 1738598400000,
      };

      expect(isTask(task)).toBe(true);
    });

    it('should reject null', () => {
      expect(isTask(null)).toBe(false);
    });

    it('should reject undefined', () => {
      expect(isTask(undefined)).toBe(false);
    });

    it('should reject non-object types', () => {
      expect(isTask('string')).toBe(false);
      expect(isTask(123)).toBe(false);
      expect(isTask(true)).toBe(false);
    });

    it('should reject empty object', () => {
      expect(isTask({})).toBe(false);
    });

    it('should reject object with missing fields', () => {
      expect(isTask({ id: 'test' })).toBe(false);
      expect(isTask({ id: 'test', title: 'Test' })).toBe(false);
    });

    it('should reject object with wrong field types', () => {
      expect(
        isTask({
          id: 123,
          title: 'Test',
          completed: false,
          createdAt: 1000,
          updatedAt: 1000,
        })
      ).toBe(false);

      expect(
        isTask({
          id: 'test',
          title: 123,
          completed: false,
          createdAt: 1000,
          updatedAt: 1000,
        })
      ).toBe(false);

      expect(
        isTask({
          id: 'test',
          title: 'Test',
          completed: 'yes',
          createdAt: 1000,
          updatedAt: 1000,
        })
      ).toBe(false);
    });

    it('should reject when updatedAt is before createdAt', () => {
      expect(
        isTask({
          id: 'test',
          title: 'Test',
          completed: false,
          createdAt: 2000,
          updatedAt: 1000,
        })
      ).toBe(false);
    });

    it('should accept completed task', () => {
      const task: Task = {
        id: 'test-id' as TaskId,
        title: 'Completed task',
        completed: true,
        createdAt: 1000,
        updatedAt: 2000,
      };

      expect(isTask(task)).toBe(true);
    });
  });

  describe('isTaskList', () => {
    it('should validate empty array', () => {
      expect(isTaskList([])).toBe(true);
    });

    it('should validate array of tasks', () => {
      const tasks: readonly Task[] = [
        {
          id: 'task-1' as TaskId,
          title: 'Task 1',
          completed: false,
          createdAt: 1000,
          updatedAt: 1000,
        },
        {
          id: 'task-2' as TaskId,
          title: 'Task 2',
          completed: true,
          createdAt: 2000,
          updatedAt: 3000,
        },
      ];

      expect(isTaskList(tasks)).toBe(true);
    });

    it('should reject non-array', () => {
      expect(isTaskList(null)).toBe(false);
      expect(isTaskList({})).toBe(false);
      expect(isTaskList('tasks')).toBe(false);
    });

    it('should reject array with non-task items', () => {
      expect(isTaskList(['not a task'])).toBe(false);
      expect(isTaskList([{}])).toBe(false);
      expect(isTaskList([{ id: 'test' }])).toBe(false);
    });

    it('should reject array with mixed valid and invalid items', () => {
      expect(
        isTaskList([
          {
            id: 'test' as TaskId,
            title: 'Test',
            completed: false,
            createdAt: 1000,
            updatedAt: 1000,
          },
          'invalid',
        ])
      ).toBe(false);
    });
  });
});
