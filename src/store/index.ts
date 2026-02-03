/**
 * Store exports
 * @module store
 *
 * Central export point for all store-related functionality.
 * Follows the barrel pattern for clean imports.
 */

export { createStore, type AppStore, type AppDispatch, type RootState } from './store';
export {
  selectAllTasks,
  selectFilter,
  selectEditingId,
  selectFilteredTasks,
  selectMetrics,
  selectEditingTask,
} from './selectors';
export {
  addTask,
  toggleTask,
  updateTask,
  deleteTask,
  setFilter,
  setEditingId,
  loadTasks,
  clearCompleted,
} from './slices/tasksSlice';
