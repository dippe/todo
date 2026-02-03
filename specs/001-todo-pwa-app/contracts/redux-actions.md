# Redux Action Contracts

**Version**: 1.0  
**Date**: 2026-02-03  
**Status**: Design Complete

## Overview

This document defines the contract for all Redux actions in the TODO PWA application. All actions are type-safe using Redux Toolkit's `createSlice` and `PayloadAction<T>` types.

---

## Task Actions

### addTask

Creates a new task with the provided title.

**Action Creator Signature**:
```typescript
addTask(title: string): PayloadAction<string>
```

**Payload**:
```typescript
{
  type: 'tasks/addTask',
  payload: string  // Task title (validated, trimmed)
}
```

**Example**:
```typescript
dispatch(addTask('Buy groceries'));
```

**Reducer Behavior**:
- Validates title (1-500 chars, non-empty after trim)
- Generates unique UUID v4 for task ID
- Sets `completed = false`
- Sets `createdAt` and `updatedAt` to current timestamp
- Appends task to `items` array

**Edge Cases**:
- Empty title → no-op (validate before dispatch)
- Duplicate title → allowed (not validated)
- Max tasks (10,000) → no-op (check before dispatch)

---

### updateTask

Updates the title of an existing task.

**Action Creator Signature**:
```typescript
updateTask(payload: { id: TaskId; title: string }): PayloadAction<{ id: TaskId; title: string }>
```

**Payload**:
```typescript
{
  type: 'tasks/updateTask',
  payload: {
    id: TaskId,      // Task to update
    title: string    // New title (validated, trimmed)
  }
}
```

**Example**:
```typescript
dispatch(updateTask({ 
  id: '550e8400-e29b-41d4-a716-446655440000' as TaskId, 
  title: 'Buy groceries and milk' 
}));
```

**Reducer Behavior**:
- Finds task by `id`
- Updates `title` to new value (trimmed)
- Updates `updatedAt` to current timestamp
- Preserves all other fields

**Edge Cases**:
- Task ID not found → no-op
- Empty title → no-op (validate before dispatch)
- Same title → updates `updatedAt` anyway

---

### toggleTask

Toggles the completion status of a task.

**Action Creator Signature**:
```typescript
toggleTask(id: TaskId): PayloadAction<TaskId>
```

**Payload**:
```typescript
{
  type: 'tasks/toggleTask',
  payload: TaskId  // Task ID to toggle
}
```

**Example**:
```typescript
dispatch(toggleTask('550e8400-e29b-41d4-a716-446655440000' as TaskId));
```

**Reducer Behavior**:
- Finds task by `id`
- Flips `completed` boolean (`true` → `false`, `false` → `true`)
- Updates `updatedAt` to current timestamp

**Edge Cases**:
- Task ID not found → no-op

---

### deleteTask

Permanently deletes a task from the list.

**Action Creator Signature**:
```typescript
deleteTask(id: TaskId): PayloadAction<TaskId>
```

**Payload**:
```typescript
{
  type: 'tasks/deleteTask',
  payload: TaskId  // Task ID to delete
}
```

**Example**:
```typescript
dispatch(deleteTask('550e8400-e29b-41d4-a716-446655440000' as TaskId));
```

**Reducer Behavior**:
- Filters out task with matching `id`
- No undo capability (permanent deletion)

**Edge Cases**:
- Task ID not found → no-op
- Deleting while editing → clears `editingId` if match

---

### setFilter

Changes the active filter for task list display.

**Action Creator Signature**:
```typescript
setFilter(filter: TaskFilter): PayloadAction<TaskFilter>
```

**Payload**:
```typescript
{
  type: 'tasks/setFilter',
  payload: 'all' | 'active' | 'completed'
}
```

**Example**:
```typescript
dispatch(setFilter('active'));
```

**Reducer Behavior**:
- Updates `filter` field in state
- Does not modify `items` array (filtering happens in selectors)

---

### setEditingId

Sets the ID of the task currently being edited (or null).

**Action Creator Signature**:
```typescript
setEditingId(id: TaskId | null): PayloadAction<TaskId | null>
```

**Payload**:
```typescript
{
  type: 'tasks/setEditingId',
  payload: TaskId | null  // Task ID to edit, or null to clear
}
```

**Example**:
```typescript
// Start editing
dispatch(setEditingId('550e8400-e29b-41d4-a716-446655440000' as TaskId));

// Cancel editing
dispatch(setEditingId(null));
```

**Reducer Behavior**:
- Updates `editingId` field
- No validation (can set to non-existent ID)

---

### loadTasks

Loads tasks from LocalStorage (used on app init).

**Action Creator Signature**:
```typescript
loadTasks(tasks: readonly Task[]): PayloadAction<readonly Task[]>
```

**Payload**:
```typescript
{
  type: 'tasks/loadTasks',
  payload: Task[]  // Tasks loaded from storage
}
```

**Example**:
```typescript
const tasks = loadFromStorage();
dispatch(loadTasks(tasks));
```

**Reducer Behavior**:
- Replaces entire `items` array
- Resets `filter` to 'all'
- Clears `editingId`

---

### clearCompleted

Deletes all completed tasks.

**Action Creator Signature**:
```typescript
clearCompleted(): PayloadAction<void>
```

**Payload**:
```typescript
{
  type: 'tasks/clearCompleted',
  payload: undefined
}
```

**Example**:
```typescript
dispatch(clearCompleted());
```

**Reducer Behavior**:
- Filters out all tasks where `completed === true`
- Clears `editingId` if editing a completed task

---

## Action Summary Table

| Action | Payload Type | Mutates Items | Updates Timestamp | Use Case |
|--------|--------------|---------------|-------------------|----------|
| `addTask` | `string` | ✅ (append) | ✅ (new task) | User creates task (FR-001) |
| `updateTask` | `{id, title}` | ✅ (modify) | ✅ | User edits task (FR-005) |
| `toggleTask` | `TaskId` | ✅ (modify) | ✅ | User marks complete/incomplete (FR-003) |
| `deleteTask` | `TaskId` | ✅ (remove) | ❌ | User deletes task (FR-004) |
| `setFilter` | `TaskFilter` | ❌ | ❌ | User changes view filter |
| `setEditingId` | `TaskId \| null` | ❌ | ❌ | User starts/cancels edit |
| `loadTasks` | `Task[]` | ✅ (replace) | ❌ | App initialization (FR-013) |
| `clearCompleted` | `void` | ✅ (remove) | ❌ | User clears completed tasks |

---

## Validation Requirements

All actions assume pre-validated inputs. Validation occurs in:
1. **UI layer**: Input components validate before dispatch
2. **Service layer**: Pure functions validate before calling actions

**Example Validation Flow**:
```typescript
// services/taskService.ts (validation)
export const validateTaskTitle = (title: string): Result<string> => {
  const trimmed = title.trim();
  
  if (trimmed === '') {
    return { ok: false, error: 'Title cannot be empty' };
  }
  
  if (trimmed.length > 500) {
    return { ok: false, error: 'Title cannot exceed 500 characters' };
  }
  
  return { ok: true, value: trimmed };
};

// containers/TaskFormContainer.tsx (pre-dispatch validation)
const handleSubmit = (title: string) => {
  const result = validateTaskTitle(title);
  
  if (result.ok) {
    dispatch(addTask(result.value));
  } else {
    setError(result.error);
  }
};
```

---

## Error Handling

**No errors thrown by reducers**. Invalid actions result in no-ops:
- Unknown task ID → state unchanged
- Invalid payload → state unchanged (TypeScript prevents at compile time)

**Rationale**: Reducers must be pure functions. Errors handled before dispatch.

---

## Immutability Guarantees

All reducers use immutable update patterns:
```typescript
// ✅ Correct: Immutable update
reducers: {
  addTask: (state, action: PayloadAction<string>) => {
    state.items = [...state.items, newTask];  // Redux Toolkit allows this syntax
  }
}

// ❌ Wrong: Direct mutation (not allowed)
reducers: {
  addTask: (state, action: PayloadAction<string>) => {
    state.items.push(newTask);  // Would fail ESLint rules
  }
}
```

**Note**: Redux Toolkit uses Immer internally, allowing "mutation-like" syntax that actually produces immutable updates.

---

## Testing Contracts

Each action must have unit tests covering:
1. **Happy path**: Normal operation
2. **Edge cases**: Empty inputs, not found, etc.
3. **Immutability**: Original state unchanged
4. **Timestamp updates**: `updatedAt` modified when appropriate

**Example Test**:
```typescript
describe('tasksSlice', () => {
  describe('addTask', () => {
    it('should add task to empty list', () => {
      const initialState: TaskListState = {
        items: [],
        filter: 'all',
        editingId: null,
      };

      const action = addTask('Buy milk');
      const newState = tasksReducer(initialState, action);

      expect(newState.items).toHaveLength(1);
      expect(newState.items[0].title).toBe('Buy milk');
      expect(newState.items[0].completed).toBe(false);
      expect(initialState.items).toHaveLength(0); // Immutability check
    });

    it('should generate unique IDs for multiple tasks', () => {
      let state: TaskListState = { items: [], filter: 'all', editingId: null };

      state = tasksReducer(state, addTask('Task 1'));
      state = tasksReducer(state, addTask('Task 2'));

      expect(state.items[0].id).not.toBe(state.items[1].id);
    });
  });

  describe('toggleTask', () => {
    it('should toggle completion status', () => {
      const task: Task = {
        id: 'test-id' as TaskId,
        title: 'Test',
        completed: false,
        createdAt: 1000,
        updatedAt: 1000,
      };

      const initialState: TaskListState = {
        items: [task],
        filter: 'all',
        editingId: null,
      };

      const action = toggleTask('test-id' as TaskId);
      const newState = tasksReducer(initialState, action);

      expect(newState.items[0].completed).toBe(true);
      expect(newState.items[0].updatedAt).toBeGreaterThan(1000);
    });

    it('should no-op for unknown task ID', () => {
      const initialState: TaskListState = {
        items: [],
        filter: 'all',
        editingId: null,
      };

      const action = toggleTask('unknown-id' as TaskId);
      const newState = tasksReducer(initialState, action);

      expect(newState).toEqual(initialState);
    });
  });
});
```

---

## Middleware Integration

### LocalStorage Persistence Middleware

```typescript
const localStorageMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);
  
  // Save to LocalStorage after state updates
  if (action.type.startsWith('tasks/')) {
    const state = store.getState();
    saveToStorage(state.tasks);
  }
  
  return result;
};
```

### Multi-Tab Sync Middleware

```typescript
// Listen for storage events from other tabs
window.addEventListener('storage', (event) => {
  if (event.key === STORAGE_KEY && event.newValue) {
    const tasks = parseStorage(event.newValue);
    dispatch(loadTasks(tasks));
  }
});
```

---

## Type Exports

```typescript
// src/store/slices/tasksSlice.ts
export const {
  addTask,
  updateTask,
  toggleTask,
  deleteTask,
  setFilter,
  setEditingId,
  loadTasks,
  clearCompleted,
} = tasksSlice.actions;

export type TasksActions = ReturnType<
  | typeof addTask
  | typeof updateTask
  | typeof toggleTask
  | typeof deleteTask
  | typeof setFilter
  | typeof setEditingId
  | typeof loadTasks
  | typeof clearCompleted
>;
```

---

**Status**: ✅ Complete - All Redux action contracts defined
