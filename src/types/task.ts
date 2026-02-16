/**
 * Task type definitions for TODO PWA Application
 * @see specs/001-todo-pwa-app/data-model.md
 */

/**
 * Branded type for Task IDs (UUID v4)
 * Prevents accidental use of plain strings
 */
export type TaskId = string & { readonly __brand: 'TaskId' };

/**
 * Unix epoch timestamp in milliseconds
 */
export type Timestamp = number;

/**
 * Represents a single TODO item
 * All fields are readonly for immutability
 */
export interface Task {
  readonly id: TaskId;
  readonly title: string;
  readonly completed: boolean;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
}

/**
 * Immutable array of tasks
 */
export type TaskList = readonly Task[];

/**
 * Validates Task field types
 */
const hasValidTaskFields = (obj: Record<string, unknown>): boolean =>
  typeof obj.id === 'string' &&
  typeof obj.title === 'string' &&
  typeof obj.completed === 'boolean' &&
  typeof obj.createdAt === 'number' &&
  typeof obj.updatedAt === 'number';

/**
 * Validates Task timestamp ordering
 */
const hasValidTimestampOrder = (obj: Record<string, unknown>): boolean =>
  (obj.updatedAt as number) >= (obj.createdAt as number);

/**
 * Type guard for Task
 * Validates all required fields and their types
 */
export const isTask = (value: unknown): value is Task => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return hasValidTaskFields(candidate) && hasValidTimestampOrder(candidate);
};

/**
 * Type guard for TaskList (array of Task)
 */
export const isTaskList = (value: unknown): value is TaskList => {
  if (!Array.isArray(value)) {
    return false;
  }

  return value.every(isTask);
};
