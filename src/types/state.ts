/**
 * Redux state type definitions
 * @see specs/001-todo-pwa-app/data-model.md
 */

import type { Task, TaskId } from './task';

/**
 * Filter options for task list display
 */
export type TaskFilter = 'all' | 'active' | 'completed';

/**
 * Redux state for the tasks slice
 */
export interface TaskListState {
  readonly items: readonly Task[];
  readonly filter: TaskFilter;
  readonly editingId: TaskId | null;
}

/**
 * Root Redux state shape
 */
export interface RootState {
  readonly tasks: TaskListState;
}

/**
 * Metrics derived from task list
 */
export interface TaskListMetrics {
  readonly totalCount: number;
  readonly completedCount: number;
  readonly activeCount: number;
}

/**
 * Type guard for TaskFilter
 * @param value - Value to check
 * @returns true if value is a valid TaskFilter
 */
export const isTaskFilter = (value: unknown): value is TaskFilter => {
  return value === 'all' || value === 'active' || value === 'completed';
};

/**
 * Validates items array property
 */
const hasValidItems = (obj: Record<string, unknown>): boolean =>
  Array.isArray(obj.items);

/**
 * Validates editingId property
 */
const hasValidEditingId = (obj: Record<string, unknown>): boolean =>
  obj.editingId === null || typeof obj.editingId === 'string';

/**
 * Type guard for TaskListState
 * @param value - Value to check
 * @returns true if value is a valid TaskListState
 */
export const isTaskListState = (value: unknown): value is TaskListState => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    hasValidItems(candidate) &&
    isTaskFilter(candidate.filter) &&
    hasValidEditingId(candidate)
  );
};

/**
 * Default initial state for tasks slice
 * Frozen to ensure immutability
 */
export const DEFAULT_TASK_LIST_STATE: TaskListState = Object.freeze({
  items: [],
  filter: 'all',
  editingId: null,
});
