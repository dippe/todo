import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { TaskListState, TaskFilter } from '../../types/state';
import type { TaskId, TaskList } from '../../types/task';
import { createInitialTaskListState } from '../../types/state';
import * as taskService from '../../services/taskService';

export interface UpdateTaskPayload {
  readonly id: TaskId;
  readonly title: string;
}

const tasksSlice = createSlice({
  name: 'taskList',
  initialState: createInitialTaskListState(),
  reducers: {
    addTask: (state, action: PayloadAction<string>): TaskListState => {
      const title = action.payload;
      const result = taskService.addTask(state.items, title);

      if (!result.ok) {
        return state;
      }

      return {
        ...state,
        items: result.data,
      };
    },

    toggleTask: (state, action: PayloadAction<TaskId>): TaskListState => {
      const id = action.payload;
      const result = taskService.toggleTask(state.items, id);

      if (!result.ok) {
        return state;
      }

      return {
        ...state,
        items: result.data,
      };
    },

    updateTask: (
      state,
      action: PayloadAction<UpdateTaskPayload>
    ): TaskListState => {
      const { id, title } = action.payload;
      const result = taskService.updateTask(state.items, id, title);

      if (!result.ok) {
        return state;
      }

      return {
        ...state,
        items: result.data,
      };
    },

    deleteTask: (state, action: PayloadAction<TaskId>): TaskListState => {
      const id = action.payload;
      const result = taskService.deleteTask(state.items, id);

      if (!result.ok) {
        return state;
      }

      return {
        ...state,
        items: result.data,
      };
    },

    setFilter: (state, action: PayloadAction<TaskFilter>): TaskListState => ({
      ...state,
      filter: action.payload,
    }),

    setEditingId: (
      state,
      action: PayloadAction<TaskId | null>
    ): TaskListState => {
      const editingId = action.payload;
      const task = editingId
        ? state.items.find((t) => t.id === editingId)
        : null;
      return {
        ...state,
        editingId,
        editingValue: task ? task.title : '',
      };
    },

    loadTasks: (state, action: PayloadAction<TaskList>): TaskListState => ({
      ...state,
      items: action.payload,
    }),

    clearCompleted: (state): TaskListState => ({
      ...state,
      items: state.items.filter((task) => !task.completed),
    }),

    setFormInput: (state, action: PayloadAction<string>): TaskListState => ({
      ...state,
      formInput: action.payload,
    }),

    clearFormInput: (state): TaskListState => ({
      ...state,
      formInput: '',
    }),

    setEditingValue: (state, action: PayloadAction<string>): TaskListState => ({
      ...state,
      editingValue: action.payload,
    }),
  },
});

export const {
  /**
   * Action to add a new task.
   * Payload: Task title string.
   */
  addTask,

  /**
   * Action to toggle task completion status.
   * Payload: Task ID.
   */
  toggleTask,

  /**
   * Action to update a task's title.
   * Payload: { id: TaskId, title: string }.
   */
  updateTask,

  /**
   * Action to delete a task.
   * Payload: Task ID.
   */
  deleteTask,

  /**
   * Action to set the current task filter.
   * Payload: 'all' | 'active' | 'completed'.
   */
  setFilter,

  /**
   * Action to set the task currently being edited.
   * Payload: Task ID or null (to stop editing).
   */
  setEditingId,

  /**
   * Action to load tasks (e.g. from storage or sync).
   * Payload: Array of tasks.
   */
  loadTasks,

  /**
   * Action to clear all completed tasks.
   * No payload.
   */
  clearCompleted,

  /**
   * Action to set the form input value.
   * Payload: Input string.
   */
  setFormInput,

  /**
   * Action to clear the form input value.
   * No payload.
   */
  clearFormInput,

  /**
   * Action to set the value of the task being edited.
   * Payload: New title string.
   */
  setEditingValue,
} = tasksSlice.actions;

/**
 * The Redux reducer for the task list state.
 */
export default tasksSlice.reducer;
