import { Task, TaskId, TaskList, Timestamp } from '../../../src/types/task';
import {
  addTask,
  toggleTask,
  updateTask,
  deleteTask,
} from '../../../src/services/taskService';

describe('taskService', () => {
  describe('addTask', () => {
    it('should add task to empty list', () => {
      const result = addTask([], 'Buy milk');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).toHaveLength(1);
        expect(result.data[0]?.title).toBe('Buy milk');
        expect(result.data[0]?.completed).toBe(false);
      }
    });

    it('should reject empty title', () => {
      const result = addTask([], '');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain('empty');
      }
    });

    it('should reject whitespace-only title', () => {
      const result = addTask([], '   ');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain('empty');
      }
    });

    it('should trim title', () => {
      const result = addTask([], '  Test  ');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data[0]?.title).toBe('Test');
      }
    });

    it('should reject title exceeding max length', () => {
      const longTitle = 'a'.repeat(501);
      const result = addTask([], longTitle);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain('500');
      }
    });

    it('should preserve existing tasks', () => {
      const existing: TaskList = [
        {
          id: 'existing-id' as TaskId,
          title: 'Existing',
          completed: false,
          createdAt: 1000 as Timestamp,
          updatedAt: 1000 as Timestamp,
        },
      ];

      const result = addTask(existing, 'New task');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).toHaveLength(2);
        expect(result.data[0]?.title).toBe('Existing');
        expect(result.data[1]?.title).toBe('New task');
      }
    });

    it('should reject when task limit is reached', () => {
      const limit = 10000;
      const tasks = Array.from({ length: limit }, (_, i) => ({
        id: `task-${i}` as TaskId,
        title: `Task ${i}`,
        completed: false,
        createdAt: 1000 as Timestamp,
        updatedAt: 1000 as Timestamp,
      }));

      const result = addTask(tasks, 'New task');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain('limit');
      }
    });

    it('should allow adding task when below limit', () => {
      const limit = 10000;
      const tasks = Array.from({ length: limit - 1 }, (_, i) => ({
        id: `task-${i}` as TaskId,
        title: `Task ${i}`,
        completed: false,
        createdAt: 1000 as Timestamp,
        updatedAt: 1000 as Timestamp,
      }));

      const result = addTask(tasks, 'New task');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).toHaveLength(limit);
      }
    });
  });

  describe('toggleTask', () => {
    const tasks: TaskList = [
      {
        id: 'test-id' as TaskId,
        title: 'Test',
        completed: false,
        createdAt: 1000 as Timestamp,
        updatedAt: 1000 as Timestamp,
      },
    ];

    it('should toggle completion status to true', () => {
      const result = toggleTask(tasks, 'test-id' as TaskId);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data[0]?.completed).toBe(true);
        expect(result.data[0]?.updatedAt).toBeGreaterThan(1000);
      }
    });

    it('should toggle completion status back to false', () => {
      const completedTasks: TaskList = [
        {
          ...tasks[0]!,
          completed: true,
        },
      ];

      const result = toggleTask(completedTasks, 'test-id' as TaskId);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data[0]?.completed).toBe(false);
      }
    });

    it('should return error for non-existent task', () => {
      const result = toggleTask(tasks, 'non-existent' as TaskId);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain('not found');
      }
    });
  });

  describe('updateTask', () => {
    const tasks: TaskList = [
      {
        id: 'test-id' as TaskId,
        title: 'Old title',
        completed: false,
        createdAt: 1000 as Timestamp,
        updatedAt: 1000 as Timestamp,
      },
    ];

    it('should update task title', () => {
      const result = updateTask(tasks, 'test-id' as TaskId, 'New title');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data[0]?.title).toBe('New title');
        expect(result.data[0]?.updatedAt).toBeGreaterThan(1000);
      }
    });

    it('should trim updated title', () => {
      const result = updateTask(tasks, 'test-id' as TaskId, '  Trimmed  ');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data[0]?.title).toBe('Trimmed');
      }
    });

    it('should reject empty title', () => {
      const result = updateTask(tasks, 'test-id' as TaskId, '');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain('empty');
      }
    });

    it('should reject title exceeding max length', () => {
      const longTitle = 'a'.repeat(501);
      const result = updateTask(tasks, 'test-id' as TaskId, longTitle);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain('500');
      }
    });

    it('should return error for non-existent task', () => {
      const result = updateTask(tasks, 'non-existent' as TaskId, 'New title');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain('not found');
      }
    });
  });

  describe('deleteTask', () => {
    const tasks: TaskList = [
      {
        id: 'task-1' as TaskId,
        title: 'Task 1',
        completed: false,
        createdAt: 1000 as Timestamp,
        updatedAt: 1000 as Timestamp,
      },
      {
        id: 'task-2' as TaskId,
        title: 'Task 2',
        completed: true,
        createdAt: 2000 as Timestamp,
        updatedAt: 2000 as Timestamp,
      },
    ];

    it('should delete existing task', () => {
      const result = deleteTask(tasks, 'task-1' as TaskId);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).toHaveLength(1);
        expect(result.data[0]?.id).toBe('task-2');
      }
    });

    it('should return error for non-existent task', () => {
      const result = deleteTask(tasks, 'non-existent' as TaskId);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain('not found');
      }
    });

    it('should handle empty list', () => {
      const result = deleteTask([], 'any-id' as TaskId);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain('not found');
      }
    });
  });
});
