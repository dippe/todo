import {
  combineReducers,
  configureStore,
  Middleware,
  Action,
} from '@reduxjs/toolkit';
import tasksReducer from './slices/tasksSlice';
import uiReducer, { setNotification } from './slices/uiSlice';
import { loadState, saveState } from '../services/storageService';
import {
  createInitialTaskListState,
  createInitialUIState,
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
          const result = saveState(state.taskList);
          if (!result.ok) {
            // Check for quota error specifically or just generic save error
            if (result.error === 'Storage quota exceeded') {
              storeAPI.dispatch(
                setNotification({
                  message:
                    'Storage quota exceeded. Some changes may not be saved.',
                  type: 'error',
                })
              );
            } else {
              storeAPI.dispatch(
                setNotification({
                  message: 'Failed to save changes.',
                  type: 'error',
                })
              );
            }
          }
        }
      }, 300);
    }

    return result;
  };

const rootReducer = combineReducers({
  taskList: tasksReducer,
  ui: uiReducer,
});

export const createStore = (preloadedState?: Partial<AppRootState>) => {
  const initialTaskListState = loadState();

  const initialState: AppRootState = {
    taskList: initialTaskListState.ok
      ? initialTaskListState.data
      : createInitialTaskListState(),
    ui: createInitialUIState(),
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
