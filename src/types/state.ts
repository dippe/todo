/**
 * State type definitions for Redux store
 * @module types/state
 *
 * Contains all state-related type definitions for the application store.
 * Follows Flux architecture patterns with strict typing.
 */

import type { TaskId, TaskList } from './task';

/** Filter options for task list display */
export type TaskFilter = 'all' | 'active' | 'completed';

/** Valid filter values as a constant array for runtime checks */
const VALID_FILTERS: readonly TaskFilter[] = ['all', 'active', 'completed'];

/**
 * State for the task list slice
 * All fields are readonly to enforce immutability
 */
export interface TaskListState {
  /** Array of all tasks */
  readonly items: TaskList;
  /** Current filter applied to the task list */
  readonly filter: TaskFilter;
  /** ID of the task currently being edited, or null if none */
  readonly editingId: TaskId | null;
  /** Current form input value */
  readonly formInput: string;
  /** Current editing input value */
  readonly editingValue: string;
}

/**
 * State for the UI slice
 * All fields are readonly to enforce immutability
 */
export interface UIState {
  readonly notification: {
    readonly message: string;
    readonly type: 'success' | 'error' | 'info';
    readonly id: string;
  } | null;
}

/**
 * Root state interface for the entire application store
 */
export interface RootState {
  /** Task list slice state */
  readonly taskList: TaskListState;
  /** UI slice state */
  readonly ui: UIState;
}

/**
 * Computed metrics for a task list
 * Used for displaying statistics and filtering
 */
export interface TaskListMetrics {
  /** Total number of tasks */
  readonly total: number;
  /** Number of active (incomplete) tasks */
  readonly active: number;
  /** Number of completed tasks */
  readonly completed: number;
  /** Number of tasks matching current filter */
  readonly filtered: number;
}

/**
 * Type guard to check if a value is a valid TaskFilter
 * @param value - The value to check
 * @returns True if the value is a valid TaskFilter
 */
export function isTaskFilter(value: unknown): value is TaskFilter {
  return (
    typeof value === 'string' && VALID_FILTERS.includes(value as TaskFilter)
  );
}

/**
 * Creates the initial state for the task list slice
 * @returns Initial TaskListState with empty items and default filter
 */
export function createInitialTaskListState(): TaskListState {
  return {
    items: [],
    filter: 'all',
    editingId: null,
    formInput: '',
    editingValue: '',
  };
}

/**
 * Creates the initial state for the UI slice
 * @returns Initial UIState with null notification
 */
export function createInitialUIState(): UIState {
  return {
    notification: null,
  };
}

/**
 * Creates the initial root state for the entire application
 * @returns Initial RootState with all slices initialized
 */
export function createInitialRootState(): RootState {
  return {
    taskList: createInitialTaskListState(),
    ui: createInitialUIState(),
  };
}
