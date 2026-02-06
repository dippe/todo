import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../types/state';
import type { TaskList, Task } from '../types/task';

const selectTaskListState = (state: RootState) => state.taskList;

/**
 * Selects all tasks from the state.
 */
export const selectAllTasks = createSelector(
  [selectTaskListState],
  (taskList) => taskList.items
);

/**
 * Selects the current task filter.
 */
export const selectFilter = createSelector(
  [selectTaskListState],
  (taskList) => taskList.filter
);

/**
 * Selects the ID of the task currently being edited.
 */
export const selectEditingId = createSelector(
  [selectTaskListState],
  (taskList) => taskList.editingId
);

/**
 * Selects tasks filtered by the current filter state.
 * Memoized to avoid recalculation if tasks and filter remain unchanged.
 */
export const selectFilteredTasks = createSelector(
  [selectAllTasks, selectFilter],
  (tasks, filter): TaskList => {
    switch (filter) {
      case 'active':
        return tasks.filter((task) => !task.completed);
      case 'completed':
        return tasks.filter((task) => task.completed);
      case 'all':
      default:
        return tasks;
    }
  }
);

/**
 * Selects task metrics (total, active, completed, filtered counts).
 * Memoized to avoid recalculation.
 */
export const selectMetrics = createSelector(
  [selectAllTasks, selectFilter, selectFilteredTasks],
  (allTasks, _filter, filteredTasks) => {
    const total = allTasks.length;
    const active = allTasks.filter((task) => !task.completed).length;
    const completed = allTasks.filter((task) => task.completed).length;
    const filtered = filteredTasks.length;

    return {
      total,
      active,
      completed,
      filtered,
    };
  }
);

/**
 * Selects the full Task object for the task currently being edited.
 * Returns undefined if no task is being edited or if the ID is invalid.
 */
export const selectEditingTask = createSelector(
  [selectAllTasks, selectEditingId],
  (tasks, editingId): Task | undefined => {
    if (!editingId) {
      return undefined;
    }
    return tasks.find((task) => task.id === editingId);
  }
);
