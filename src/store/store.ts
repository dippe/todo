import {
  combineReducers,
  configureStore,
  Middleware,
  Action,
} from '@reduxjs/toolkit';
import tasksReducer from './slices/tasksSlice';
import { loadFromStorage, saveToStorage } from '../utils/storage';
import {
  createInitialTaskListState,
  RootState as AppRootState,
} from '../types/state';

let saveTimeoutId: ReturnType<typeof setTimeout> | null = null;

const persistenceMiddleware: Middleware<unknown, AppRootState> =
  (storeAPI) => (next) => (action: unknown) => {
    // Skip saving if the action is loading from storage to prevent loops
    if ((action as Action).type === 'taskList/loadTasks') {
      return next(action as Action);
    }

    const prevState = storeAPI.getState();
    const result = next(action as Action);
    const nextState = storeAPI.getState();

    // Only save if state actually changed
    if (prevState.taskList !== nextState.taskList) {
      if (saveTimeoutId !== null) {
        clearTimeout(saveTimeoutId);
      }

      saveTimeoutId = setTimeout(() => {
        const state = storeAPI.getState();
        if (state.taskList) {
          saveToStorage(state.taskList);
        }
      }, 300);
    }

    return result;
  };

const rootReducer = combineReducers({
  taskList: tasksReducer,
});

export const createStore = (preloadedState?: Partial<AppRootState>) => {
  const initialTaskListState = loadFromStorage();

  const initialState: AppRootState = {
    taskList: initialTaskListState.ok
      ? initialTaskListState.data
      : createInitialTaskListState(),
  };

  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(persistenceMiddleware),
    preloadedState: preloadedState || initialState,
  });
};

export type AppStore = ReturnType<typeof createStore>;
export type AppDispatch = AppStore['dispatch'];
export type RootState = ReturnType<typeof rootReducer>;
