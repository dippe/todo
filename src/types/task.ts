/**
 * Task type definitions
 * @module types/task
 *
 * Contains all type definitions and type guards for Task entities.
 * Uses branded types for type safety and readonly for immutability.
 */

/** Branded type for Task IDs to prevent mixing with other strings */
export type TaskId = string & { readonly __brand: unique symbol };

/** Type for Unix timestamps in milliseconds */
export type Timestamp = number & { readonly __brand: unique symbol };

/** Maximum length for task titles */
export const TASK_TITLE_MAX_LENGTH = 500;

/** Maximum number of tasks allowed in the list */
export const TASK_MAX_COUNT = 10_000;

/** Storage size limit in bytes (~5MB) */
export const STORAGE_SIZE_LIMIT = 5_000_000;

/** Minimum length for task titles */
export const TASK_TITLE_MIN_LENGTH = 1;

/**
 * Task entity representing a single todo item
 * All fields are readonly to enforce immutability
 */
export interface Task {
  /** Unique identifier for the task */
  readonly id: TaskId;
  /** Title/description of the task */
  readonly title: string;
  /** Whether the task is completed */
  readonly completed: boolean;
  /** Unix timestamp when task was created */
  readonly createdAt: Timestamp;
  /** Unix timestamp when task was last updated */
  readonly updatedAt: Timestamp;
}

/** Readonly array of Tasks */
export type TaskList = readonly Task[];

/**
 * Type guard to check if a value is a valid TaskId
 * @param value - The value to check
 * @returns True if the value is a string (TaskId is a branded string)
 */
export function isTaskId(value: unknown): value is TaskId {
  return typeof value === 'string';
}

/**
 * Type guard to check if a value is a valid Timestamp
 * @param value - The value to check
 * @returns True if the value is a number (Timestamp is a branded number)
 */
export function isTimestamp(value: unknown): value is Timestamp {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Type guard to check if a value is a valid Task object
 * Validates all required fields and their types
 * @param value - The value to check
 * @returns True if the value is a valid Task
 */
export function isTask(value: unknown): value is Task {
  if (value === null || typeof value !== 'object') {
    return false;
  }

  const task = value as Record<string, unknown>;

  return (
    'id' in task &&
    typeof task.id === 'string' &&
    'title' in task &&
    typeof task.title === 'string' &&
    'completed' in task &&
    typeof task.completed === 'boolean' &&
    'createdAt' in task &&
    typeof task.createdAt === 'number' &&
    'updatedAt' in task &&
    typeof task.updatedAt === 'number'
  );
}

/**
 * Type guard to check if a value is a valid TaskList
 * Validates that the value is an array and all items are valid Tasks
 * @param value - The value to check
 * @returns True if the value is a valid TaskList
 */
export function isTaskList(value: unknown): value is TaskList {
  if (!Array.isArray(value)) {
    return false;
  }

  return value.every(isTask);
}
