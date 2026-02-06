/**
 * Service for handling storage operations
 * @module services/storageService
 */

import { Result } from '../types/result';
import { TaskListState } from '../types/state';
import { Task, TaskList, isTaskList } from '../types/task';
import {
  saveToStorage as saveToStorageUtil,
  loadFromStorage as loadFromStorageUtil,
} from '../utils/storage';

/**
 * Saves the current state to persistent storage
 * @param state - The state to save
 * @returns Result indicating success or failure
 */
export function saveState(state: TaskListState): Result<void, string> {
  return saveToStorageUtil(state);
}

/**
 * Loads the state from persistent storage
 * @returns Result containing the loaded state or error
 */
export function loadState(): Result<TaskListState, string> {
  return loadFromStorageUtil();
}

/**
 * Exports tasks to a JSON string
 * @param tasks - The tasks to export
 * @returns Result containing the JSON string or error
 */
export function exportTasks(tasks: TaskList | Task[]): Result<string, string> {
  try {
    const json = JSON.stringify(tasks);
    return { ok: true, data: json };
  } catch (error) {
    return { ok: false, error: `Failed to export tasks: ${error}` };
  }
}

/**
 * Imports tasks from a JSON string
 * @param json - The JSON string to import
 * @returns Result containing the imported tasks or error
 */
export function importTasks(json: string): Result<Task[], string> {
  try {
    const parsed = JSON.parse(json);

    if (!isTaskList(parsed)) {
      return { ok: false, error: 'Imported data is not a valid task list' };
    }

    return { ok: true, data: parsed as Task[] };
  } catch (error) {
    if (error instanceof SyntaxError) {
      return { ok: false, error: `Invalid JSON format: ${error.message}` };
    }
    return { ok: false, error: `Failed to import tasks: ${error}` };
  }
}
