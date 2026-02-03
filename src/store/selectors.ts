import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../types/state';
import type { TaskList, Task } from '../types/task';

const selectTaskListState = (state: RootState) => state.taskList;

export const selectAllTasks = createSelector(
  [selectTaskListState],
  (taskList) => taskList.items
);

export const selectFilter = createSelector(
  [selectTaskListState],
  (taskList) => taskList.filter
);

export const selectEditingId = createSelector(
  [selectTaskListState],
  (taskList) => taskList.editingId
);

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

export const selectEditingTask = createSelector(
  [selectAllTasks, selectEditingId],
  (tasks, editingId): Task | undefined => {
    if (!editingId) {
      return undefined;
    }
    return tasks.find((task) => task.id === editingId);
  }
);
