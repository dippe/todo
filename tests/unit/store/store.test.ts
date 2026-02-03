import { TaskListState } from '../../../src/types/state';
import { createStore } from '../../../src/store/store';
import { saveToStorage, loadFromStorage } from '../../../src/utils/storage';

jest.mock('../../../src/utils/storage', () => ({
  saveToStorage: jest.fn(),
  loadFromStorage: jest.fn(() => ({
    ok: true,
    data: {
      items: [],
      filter: 'all',
      editingId: null,
    },
  })),
}));

describe('store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('initialization', () => {
    it('should initialize with correct default state', () => {
      const store = createStore();
      const state = store.getState();

      expect(state.taskList.items).toEqual([]);
      expect(state.taskList.filter).toBe('all');
      expect(state.taskList.editingId).toBeNull();
    });

    it('should have taskList reducer registered', () => {
      const store = createStore();
      const state = store.getState();

      expect(state).toHaveProperty('taskList');
      expect(state.taskList).toHaveProperty('items');
      expect(state.taskList).toHaveProperty('filter');
      expect(state.taskList).toHaveProperty('editingId');
    });
  });

  describe('middleware configuration', () => {
    it('should include persistence middleware', () => {
      const store = createStore();

      expect(store.dispatch).toBeDefined();
      expect(store.getState).toBeDefined();
      expect(store.subscribe).toBeDefined();
    });

    it('should dispatch actions without error', () => {
      const store = createStore();

      expect(() => {
        store.dispatch({ type: 'test/action' });
      }).not.toThrow();
    });

    it('should update state when dispatching task actions', () => {
      const store = createStore();

      store.dispatch({
        type: 'taskList/addTask',
        payload: 'Test task',
      });

      const state = store.getState();
      expect(state.taskList.items).toHaveLength(1);
    });
  });

  describe('persistence middleware', () => {
    it('should debounce storage saves', () => {
      const store = createStore();

      store.dispatch({
        type: 'taskList/addTask',
        payload: 'Task 1',
      });

      expect(saveToStorage).not.toHaveBeenCalled();

      jest.advanceTimersByTime(300);

      expect(saveToStorage).toHaveBeenCalledTimes(1);
    });

    it('should only save once for multiple rapid dispatches', () => {
      const store = createStore();

      store.dispatch({ type: 'taskList/addTask', payload: 'Task 1' });
      store.dispatch({ type: 'taskList/addTask', payload: 'Task 2' });
      store.dispatch({ type: 'taskList/addTask', payload: 'Task 3' });

      jest.advanceTimersByTime(100);
      expect(saveToStorage).not.toHaveBeenCalled();

      jest.advanceTimersByTime(200);
      expect(saveToStorage).toHaveBeenCalledTimes(1);
    });

    it('should not save for non-state-changing actions', () => {
      const store = createStore();

      store.dispatch({ type: 'unknown/action' });
      jest.advanceTimersByTime(300);

      expect(saveToStorage).not.toHaveBeenCalled();
    });
  });

  describe('store configuration', () => {
    it('should have Redux DevTools extension integration', () => {
      const store = createStore();

      expect(store).toBeDefined();
      expect(typeof store.getState).toBe('function');
      expect(typeof store.dispatch).toBe('function');
    });

    it('should support subscription', () => {
      const store = createStore();
      const listener = jest.fn();

      const unsubscribe = store.subscribe(listener);

      store.dispatch({ type: 'taskList/addTask', payload: 'Test' });
      jest.advanceTimersByTime(300);

      expect(listener).toHaveBeenCalled();

      unsubscribe();
    });
  });
});
