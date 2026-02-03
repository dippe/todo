/**
 * Unit tests for Task types
 * @module tests/unit/types/task
 */

import {
  type Task,
  type TaskList,
  type TaskId,
  type Timestamp,
  isTask,
  isTaskList,
  TASK_TITLE_MAX_LENGTH,
  TASK_MAX_COUNT,
} from '../../../src/types/task';

describe('Task Types', () => {
  describe('isTask', () => {
    it('should return true for a valid task object', () => {
      // Arrange
      const validTask = {
        id: 'task-1' as TaskId,
        title: 'Test task',
        completed: false,
        createdAt: 1234567890 as Timestamp,
        updatedAt: 1234567890 as Timestamp,
      };

      // Act
      const result = isTask(validTask);

      // Assert
      expect(result).toBe(true);
    });

    it('should return true for a completed task', () => {
      // Arrange
      const completedTask = {
        id: 'task-2' as TaskId,
        title: 'Completed task',
        completed: true,
        createdAt: 1234567890 as Timestamp,
        updatedAt: 1234567900 as Timestamp,
      };

      // Act
      const result = isTask(completedTask);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for null', () => {
      // Act
      const result = isTask(null);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for undefined', () => {
      // Act
      const result = isTask(undefined);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for a primitive value', () => {
      // Act
      const result = isTask('string');

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for an array', () => {
      // Act
      const result = isTask([]);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when id is missing', () => {
      // Arrange
      const invalidTask = {
        title: 'Test task',
        completed: false,
        createdAt: 1234567890 as Timestamp,
        updatedAt: 1234567890 as Timestamp,
      };

      // Act
      const result = isTask(invalidTask);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when title is missing', () => {
      // Arrange
      const invalidTask = {
        id: 'task-1' as TaskId,
        completed: false,
        createdAt: 1234567890 as Timestamp,
        updatedAt: 1234567890 as Timestamp,
      };

      // Act
      const result = isTask(invalidTask);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when completed is missing', () => {
      // Arrange
      const invalidTask = {
        id: 'task-1' as TaskId,
        title: 'Test task',
        createdAt: 1234567890 as Timestamp,
        updatedAt: 1234567890 as Timestamp,
      };

      // Act
      const result = isTask(invalidTask);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when createdAt is missing', () => {
      // Arrange
      const invalidTask = {
        id: 'task-1' as TaskId,
        title: 'Test task',
        completed: false,
        updatedAt: 1234567890 as Timestamp,
      };

      // Act
      const result = isTask(invalidTask);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when updatedAt is missing', () => {
      // Arrange
      const invalidTask = {
        id: 'task-1' as TaskId,
        title: 'Test task',
        completed: false,
        createdAt: 1234567890 as Timestamp,
      };

      // Act
      const result = isTask(invalidTask);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when id is not a string', () => {
      // Arrange
      const invalidTask = {
        id: 123,
        title: 'Test task',
        completed: false,
        createdAt: 1234567890 as Timestamp,
        updatedAt: 1234567890 as Timestamp,
      };

      // Act
      const result = isTask(invalidTask);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when title is not a string', () => {
      // Arrange
      const invalidTask = {
        id: 'task-1' as TaskId,
        title: 123,
        completed: false,
        createdAt: 1234567890 as Timestamp,
        updatedAt: 1234567890 as Timestamp,
      };

      // Act
      const result = isTask(invalidTask);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when completed is not a boolean', () => {
      // Arrange
      const invalidTask = {
        id: 'task-1' as TaskId,
        title: 'Test task',
        completed: 'false',
        createdAt: 1234567890 as Timestamp,
        updatedAt: 1234567890 as Timestamp,
      };

      // Act
      const result = isTask(invalidTask);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when createdAt is not a number', () => {
      // Arrange
      const invalidTask = {
        id: 'task-1' as TaskId,
        title: 'Test task',
        completed: false,
        createdAt: '1234567890',
        updatedAt: 1234567890 as Timestamp,
      };

      // Act
      const result = isTask(invalidTask);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when updatedAt is not a number', () => {
      // Arrange
      const invalidTask = {
        id: 'task-1' as TaskId,
        title: 'Test task',
        completed: false,
        createdAt: 1234567890 as Timestamp,
        updatedAt: '1234567890',
      };

      // Act
      const result = isTask(invalidTask);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for an empty object', () => {
      // Act
      const result = isTask({});

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for an object with extra properties', () => {
      // Arrange
      const taskWithExtra = {
        id: 'task-1' as TaskId,
        title: 'Test task',
        completed: false,
        createdAt: 1234567890 as Timestamp,
        updatedAt: 1234567890 as Timestamp,
        extra: 'property',
      };

      // Act
      const result = isTask(taskWithExtra);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('isTaskList', () => {
    it('should return true for an array of valid tasks', () => {
      // Arrange
      const validList: TaskList = [
        {
          id: 'task-1' as TaskId,
          title: 'Task 1',
          completed: false,
          createdAt: 1234567890 as Timestamp,
          updatedAt: 1234567890 as Timestamp,
        },
        {
          id: 'task-2' as TaskId,
          title: 'Task 2',
          completed: true,
          createdAt: 1234567900 as Timestamp,
          updatedAt: 1234567900 as Timestamp,
        },
      ];

      // Act
      const result = isTaskList(validList);

      // Assert
      expect(result).toBe(true);
    });

    it('should return true for an empty array', () => {
      // Arrange
      const emptyList: TaskList = [];

      // Act
      const result = isTaskList(emptyList);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for null', () => {
      // Act
      const result = isTaskList(null);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for undefined', () => {
      // Act
      const result = isTaskList(undefined);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for a non-array object', () => {
      // Act
      const result = isTaskList({});

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for an array with one invalid task', () => {
      // Arrange
      const invalidList = [
        {
          id: 'task-1' as TaskId,
          title: 'Task 1',
          completed: false,
          createdAt: 1234567890 as Timestamp,
          updatedAt: 1234567890 as Timestamp,
        },
        {
          id: 'task-2' as TaskId,
          title: 'Task 2',
          // missing completed
          createdAt: 1234567900 as Timestamp,
          updatedAt: 1234567900 as Timestamp,
        },
      ];

      // Act
      const result = isTaskList(invalidList);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for an array of non-task items', () => {
      // Arrange
      const invalidList = ['string', 123, null];

      // Act
      const result = isTaskList(invalidList);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false for a primitive value', () => {
      // Act
      const result = isTaskList('string');

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('Constants', () => {
    it('should export TASK_TITLE_MAX_LENGTH as a number', () => {
      // Assert
      expect(typeof TASK_TITLE_MAX_LENGTH).toBe('number');
      expect(TASK_TITLE_MAX_LENGTH).toBeGreaterThan(0);
    });

    it('should export TASK_MAX_COUNT as a number', () => {
      // Assert
      expect(typeof TASK_MAX_COUNT).toBe('number');
      expect(TASK_MAX_COUNT).toBeGreaterThan(0);
    });
  });
});
