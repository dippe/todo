import { Task, TaskId, TaskList, Timestamp } from '../../../src/types/task';
import { TaskListState, TaskFilter } from '../../../src/types/state';
import tasksReducer, {
  addTask,
  toggleTask,
  updateTask,
  deleteTask,
  setFilter,
  setEditingId,
  loadTasks,
  clearCompleted,
} from '../../../src/store/slices/tasksSlice';

describe('tasksSlice', () => {
  const createMockTask = (id: string, title: string, completed: boolean): Task => ({
    id: id as TaskId,
    title,
    completed,
    createdAt: 1000 as Timestamp,
    updatedAt: 1000 as Timestamp,
  });

  const createMockState = (overrides: Partial<TaskListState> = {}): TaskListState => ({
    items: [],
    filter: 'all',
    editingId: null,
    ...overrides,
  });

  describe('initial state', () => {
    it('should have empty items array', () => {
      const state = tasksReducer(undefined, { type: 'unknown' });
      expect(state.items).toEqual([]);
    });

    it('should have filter set to all', () => {
      const state = tasksReducer(undefined, { type: 'unknown' });
      expect(state.filter).toBe('all');
    });

    it('should have editingId set to null', () => {
      const state = tasksReducer(undefined, { type: 'unknown' });
      expect(state.editingId).toBeNull();
    });
  });

  describe('addTask', () => {
    it('should add task to empty list', () => {
      const initialState = createMockState();
      const action = addTask('Buy milk');
      const state = tasksReducer(initialState, action);

      expect(state.items).toHaveLength(1);
      expect(state.items[0]?.title).toBe('Buy milk');
      expect(state.items[0]?.completed).toBe(false);
    });

    it('should add task to existing list', () => {
      const existingTask = createMockTask('task-1', 'Existing', false);
      const initialState = createMockState({ items: [existingTask] });
      const action = addTask('New task');
      const state = tasksReducer(initialState, action);

      expect(state.items).toHaveLength(2);
      expect(state.items[0]?.title).toBe('Existing');
      expect(state.items[1]?.title).toBe('New task');
    });

    it('should trim task title', () => {
      const initialState = createMockState();
      const action = addTask('  Test  ');
      const state = tasksReducer(initialState, action);

      expect(state.items[0]?.title).toBe('Test');
    });

    it('should reject empty title', () => {
      const initialState = createMockState();
      const action = addTask('');
      const state = tasksReducer(initialState, action);

      expect(state.items).toHaveLength(0);
    });

    it('should reject whitespace-only title', () => {
      const initialState = createMockState();
      const action = addTask('   ');
      const state = tasksReducer(initialState, action);

      expect(state.items).toHaveLength(0);
    });

    it('should reject title exceeding max length', () => {
      const initialState = createMockState();
      const longTitle = 'a'.repeat(501);
      const action = addTask(longTitle);
      const state = tasksReducer(initialState, action);

      expect(state.items).toHaveLength(0);
    });
  });

  describe('toggleTask', () => {
    it('should toggle incomplete task to complete', () => {
      const task = createMockTask('task-1', 'Test', false);
      const initialState = createMockState({ items: [task] });
      const action = toggleTask('task-1' as TaskId);
      const state = tasksReducer(initialState, action);

      expect(state.items[0]?.completed).toBe(true);
      expect(state.items[0]?.updatedAt).toBeGreaterThan(1000);
    });

    it('should toggle complete task to incomplete', () => {
      const task = createMockTask('task-1', 'Test', true);
      const initialState = createMockState({ items: [task] });
      const action = toggleTask('task-1' as TaskId);
      const state = tasksReducer(initialState, action);

      expect(state.items[0]?.completed).toBe(false);
    });

    it('should not modify state for non-existent task', () => {
      const task = createMockTask('task-1', 'Test', false);
      const initialState = createMockState({ items: [task] });
      const action = toggleTask('non-existent' as TaskId);
      const state = tasksReducer(initialState, action);

      expect(state.items[0]?.completed).toBe(false);
    });
  });

  describe('updateTask', () => {
    it('should update task title', () => {
      const task = createMockTask('task-1', 'Old title', false);
      const initialState = createMockState({ items: [task] });
      const action = updateTask({ id: 'task-1' as TaskId, title: 'New title' });
      const state = tasksReducer(initialState, action);

      expect(state.items[0]?.title).toBe('New title');
      expect(state.items[0]?.updatedAt).toBeGreaterThan(1000);
    });

    it('should trim updated title', () => {
      const task = createMockTask('task-1', 'Old', false);
      const initialState = createMockState({ items: [task] });
      const action = updateTask({ id: 'task-1' as TaskId, title: '  New  ' });
      const state = tasksReducer(initialState, action);

      expect(state.items[0]?.title).toBe('New');
    });

    it('should reject empty title', () => {
      const task = createMockTask('task-1', 'Old title', false);
      const initialState = createMockState({ items: [task] });
      const action = updateTask({ id: 'task-1' as TaskId, title: '' });
      const state = tasksReducer(initialState, action);

      expect(state.items[0]?.title).toBe('Old title');
    });

    it('should not modify state for non-existent task', () => {
      const task = createMockTask('task-1', 'Title', false);
      const initialState = createMockState({ items: [task] });
      const action = updateTask({ id: 'non-existent' as TaskId, title: 'New title' });
      const state = tasksReducer(initialState, action);

      expect(state.items[0]?.title).toBe('Title');
    });
  });

  describe('deleteTask', () => {
    it('should delete existing task', () => {
      const tasks: TaskList = [
        createMockTask('task-1', 'Task 1', false),
        createMockTask('task-2', 'Task 2', true),
      ];
      const initialState = createMockState({ items: tasks });
      const action = deleteTask('task-1' as TaskId);
      const state = tasksReducer(initialState, action);

      expect(state.items).toHaveLength(1);
      expect(state.items[0]?.id).toBe('task-2');
    });

    it('should not modify state for non-existent task', () => {
      const task = createMockTask('task-1', 'Task', false);
      const initialState = createMockState({ items: [task] });
      const action = deleteTask('non-existent' as TaskId);
      const state = tasksReducer(initialState, action);

      expect(state.items).toHaveLength(1);
    });

    it('should handle empty list', () => {
      const initialState = createMockState();
      const action = deleteTask('any-id' as TaskId);
      const state = tasksReducer(initialState, action);

      expect(state.items).toHaveLength(0);
    });
  });

  describe('setFilter', () => {
    it('should set filter to active', () => {
      const initialState = createMockState({ filter: 'all' });
      const action = setFilter('active');
      const state = tasksReducer(initialState, action);

      expect(state.filter).toBe('active');
    });

    it('should set filter to completed', () => {
      const initialState = createMockState({ filter: 'all' });
      const action = setFilter('completed');
      const state = tasksReducer(initialState, action);

      expect(state.filter).toBe('completed');
    });

    it('should set filter to all', () => {
      const initialState = createMockState({ filter: 'active' });
      const action = setFilter('all');
      const state = tasksReducer(initialState, action);

      expect(state.filter).toBe('all');
    });
  });

  describe('setEditingId', () => {
    it('should set editingId to task ID', () => {
      const initialState = createMockState();
      const action = setEditingId('task-1' as TaskId);
      const state = tasksReducer(initialState, action);

      expect(state.editingId).toBe('task-1' as TaskId);
    });

    it('should set editingId to null', () => {
      const initialState = createMockState({ editingId: 'task-1' as TaskId });
      const action = setEditingId(null);
      const state = tasksReducer(initialState, action);

      expect(state.editingId).toBeNull();
    });
  });

  describe('loadTasks', () => {
    it('should load tasks from payload', () => {
      const tasks: TaskList = [
        createMockTask('task-1', 'Task 1', false),
        createMockTask('task-2', 'Task 2', true),
      ];
      const initialState = createMockState();
      const action = loadTasks(tasks);
      const state = tasksReducer(initialState, action);

      expect(state.items).toEqual(tasks);
    });

    it('should replace existing tasks', () => {
      const existingTasks: TaskList = [createMockTask('old-1', 'Old', false)];
      const newTasks: TaskList = [createMockTask('new-1', 'New', true)];
      const initialState = createMockState({ items: existingTasks });
      const action = loadTasks(newTasks);
      const state = tasksReducer(initialState, action);

      expect(state.items).toEqual(newTasks);
      expect(state.items).toHaveLength(1);
    });

    it('should handle empty array', () => {
      const existingTasks: TaskList = [createMockTask('task-1', 'Task', false)];
      const initialState = createMockState({ items: existingTasks });
      const action = loadTasks([]);
      const state = tasksReducer(initialState, action);

      expect(state.items).toEqual([]);
    });
  });

  describe('clearCompleted', () => {
    it('should remove completed tasks', () => {
      const tasks: TaskList = [
        createMockTask('task-1', 'Active', false),
        createMockTask('task-2', 'Completed', true),
        createMockTask('task-3', 'Active 2', false),
      ];
      const initialState = createMockState({ items: tasks });
      const action = clearCompleted();
      const state = tasksReducer(initialState, action);

      expect(state.items).toHaveLength(2);
      expect(state.items[0]?.id).toBe('task-1');
      expect(state.items[1]?.id).toBe('task-3');
    });

    it('should handle all completed tasks', () => {
      const tasks: TaskList = [
        createMockTask('task-1', 'Completed 1', true),
        createMockTask('task-2', 'Completed 2', true),
      ];
      const initialState = createMockState({ items: tasks });
      const action = clearCompleted();
      const state = tasksReducer(initialState, action);

      expect(state.items).toHaveLength(0);
    });

    it('should not modify active tasks', () => {
      const tasks: TaskList = [
        createMockTask('task-1', 'Active 1', false),
        createMockTask('task-2', 'Active 2', false),
      ];
      const initialState = createMockState({ items: tasks });
      const action = clearCompleted();
      const state = tasksReducer(initialState, action);

      expect(state.items).toHaveLength(2);
      expect(state.items[0]?.id).toBe('task-1');
      expect(state.items[1]?.id).toBe('task-2');
    });

    it('should handle empty list', () => {
      const initialState = createMockState();
      const action = clearCompleted();
      const state = tasksReducer(initialState, action);

      expect(state.items).toHaveLength(0);
    });
  });
});
