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
  addTask,
  toggleTask,
  updateTask,
  deleteTask,
  setFilter,
  setEditingId,
  loadTasks,
  clearCompleted,
  setFormInput,
  clearFormInput,
  setEditingValue,
} = tasksSlice.actions;

export default tasksSlice.reducer;
