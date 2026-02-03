/**
 * Storage utility functions
 * @module utils/storage
 *
 * Provides functions for persisting and loading state from LocalStorage.
 * All functions are pure and return Result types for error handling.
 * Follows the storage interface contract for schema validation.
 */

import type { Result } from '../types/result';
import type { TaskListState } from '../types/state';
import type { Task, TaskId, Timestamp } from '../types/task';

/** Storage key for todo app state */
export const STORAGE_KEY = 'todo-pwa-state';

/** Current storage schema version */
const STORAGE_VERSION = 1;

/**
 * Storage schema interface for LocalStorage
 * Wraps TaskListState with versioning for future migrations
 */
interface StorageSchema {
  readonly version: number;
  readonly data: TaskListState;
  readonly lastSaved: Timestamp;
}

/**
 * Validates storage data structure
 * Checks all required fields and their types
 * @param data - The data to validate
 * @returns True if data is valid StorageSchema
 */
export function validateStorageData(data: unknown): boolean {
  if (data === null || typeof data !== 'object') {
    return false;
  }

  const schema = data as Record<string, unknown>;

  // Check version
  if (typeof schema.version !== 'number') {
    return false;
  }

  // Check data object exists
  if (!schema.data || typeof schema.data !== 'object') {
    return false;
  }

  const dataObj = schema.data as Record<string, unknown>;

  // Check items is an array
  if (!Array.isArray(dataObj.items)) {
    return false;
  }

  // Validate each task has required fields
  for (const item of dataObj.items) {
    if (!isValidTask(item)) {
      return false;
    }
  }

  // Check filter is valid
  const validFilters: string[] = ['all', 'active', 'completed'];
  if (
    typeof dataObj.filter !== 'string' ||
    !validFilters.includes(dataObj.filter)
  ) {
    return false;
  }

  return true;
}

/**
 * Type guard to check if value is a valid Task object
 * @param value - Value to check
 * @returns True if value has all required Task fields
 */
function isValidTask(value: unknown): boolean {
  if (value === null || typeof value !== 'object') {
    return false;
  }

  const task = value as Record<string, unknown>;

  return (
    typeof task.id === 'string' &&
    typeof task.title === 'string' &&
    typeof task.completed === 'boolean' &&
    typeof task.createdAt === 'number' &&
    typeof task.updatedAt === 'number'
  );
}

/**
 * Saves state to LocalStorage
 * Wraps state in StorageSchema with version and timestamp
 * @param state - The TaskListState to save
 * @returns Success if saved, or Failure with error message
 * @example
 * const result = saveToStorage({ items: [], filter: 'all' });
 * if (!result.ok) console.error(result.error);
 */
export function saveToStorage(
  state: TaskListState
): Result<void, string> {
  try {
    const schema: StorageSchema = {
      version: STORAGE_VERSION,
      data: state,
      lastSaved: Date.now() as Timestamp,
    };

    const json = JSON.stringify(schema);
    localStorage.setItem(STORAGE_KEY, json);

    return { ok: true, data: undefined };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      return { ok: false, error: 'Storage quota exceeded' };
    }
    return { ok: false, error: `Save failed: ${error}` };
  }
}

/**
 * Creates default empty state
 * @returns Default TaskListState with empty items
 */
function createDefaultState(): TaskListState {
  return {
    items: [] as Task[],
    filter: 'all',
    editingId: null as TaskId | null,
  } as TaskListState;
}

/**
 * Loads state from LocalStorage
 * Returns defaults if no data or corrupted data found
 * @returns Success with loaded state (or defaults), never fails
 * @example
 * const result = loadFromStorage();
 * const state = result.ok ? result.data : { items: [], filter: 'all' };
 */
export function loadFromStorage(): Result<TaskListState, string> {
  try {
    const json = localStorage.getItem(STORAGE_KEY);

    // First run - no data stored yet
    if (json === null) {
      return { ok: true, data: createDefaultState() };
    }

    const parsed: unknown = JSON.parse(json);

    // Validate schema structure
    if (!validateStorageData(parsed)) {
      console.warn('Invalid storage schema, using defaults');
      return { ok: true, data: createDefaultState() };
    }

    const schema = parsed as StorageSchema;

    // Return the stored data (with migration if needed in future)
    return { ok: true, data: schema.data };
  } catch (error) {
    console.error('Failed to load storage:', error);
    // Fail-safe: return defaults on any error
    return { ok: true, data: createDefaultState() };
  }
}
