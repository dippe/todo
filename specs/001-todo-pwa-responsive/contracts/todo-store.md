# TodoStore API Contract

## Overview
This document defines the contract for the TodoStore service, which manages TODO items in-memory.

---

## Service Interface

### TodoStore

**Description:** In-memory storage and management service for TODO items

**Implementation:** TypeScript class with observer pattern

---

## Methods

### `add(input: CreateTodoInput): Todo`

**Description:** Creates a new TODO item

**Input:**
```typescript
interface CreateTodoInput {
  text: string;
}
```

**Output:**
```typescript
interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Validation:**
- `text` is required
- `text` must be 1-500 characters after trimming
- `text` cannot be only whitespace

**Errors:**
```typescript
type TodoError = {
  code: 'VALIDATION_ERROR' | 'NOT_FOUND' | 'INTERNAL_ERROR';
  message: string;
  field?: string;
}
```

**Example:**
```typescript
const todo = todoStore.add({ text: 'Buy groceries' });
// Returns: { id: 'uuid', text: 'Buy groceries', completed: false, ... }
```

---

### `update(id: string, input: UpdateTodoInput): Todo`

**Description:** Updates an existing TODO item

**Input:**
```typescript
interface UpdateTodoInput {
  text?: string;
  completed?: boolean;
}
```

**Output:** Updated `Todo` object

**Validation:**
- `id` must exist in store
- If `text` provided: must be 1-500 characters after trimming
- If `completed` provided: must be boolean

**Errors:**
- `NOT_FOUND`: If todo with `id` doesn't exist
- `VALIDATION_ERROR`: If input validation fails

**Example:**
```typescript
const updated = todoStore.update('uuid', { completed: true });
// Returns: { id: 'uuid', ..., completed: true, updatedAt: <now> }
```

---

### `delete(id: string): void`

**Description:** Removes a TODO item from the store

**Input:** `id: string`

**Output:** `void`

**Validation:**
- `id` must exist in store

**Errors:**
- `NOT_FOUND`: If todo with `id` doesn't exist

**Example:**
```typescript
todoStore.delete('uuid');
// Todo is removed from store
```

---

### `get(id: string): Todo | undefined`

**Description:** Retrieves a single TODO item by ID

**Input:** `id: string`

**Output:** `Todo | undefined`

**Example:**
```typescript
const todo = todoStore.get('uuid');
// Returns: Todo object or undefined if not found
```

---

### `getAll(): Todo[]`

**Description:** Retrieves all TODO items

**Input:** None

**Output:** Array of `Todo` objects

**Example:**
```typescript
const todos = todoStore.getAll();
// Returns: [{ id: '1', ... }, { id: '2', ... }]
```

---

### `getCompleted(): Todo[]`

**Description:** Retrieves all completed TODO items

**Input:** None

**Output:** Array of `Todo` objects where `completed = true`

**Example:**
```typescript
const completed = todoStore.getCompleted();
// Returns: [{ id: '1', completed: true, ... }]
```

---

### `getIncomplete(): Todo[]`

**Description:** Retrieves all incomplete TODO items

**Input:** None

**Output:** Array of `Todo` objects where `completed = false`

**Example:**
```typescript
const incomplete = todoStore.getIncomplete();
// Returns: [{ id: '2', completed: false, ... }]
```

---

### `subscribe(listener: TodoListener): () => void`

**Description:** Subscribes to TODO store changes

**Input:**
```typescript
type TodoListener = (todos: Todo[]) => void;
```

**Output:** Unsubscribe function

**Behavior:**
- Listener is called immediately with current todos
- Listener is called on any change (add, update, delete)
- Returns function to unsubscribe

**Example:**
```typescript
const unsubscribe = todoStore.subscribe((todos) => {
  console.log('Todos changed:', todos);
});

// Later, to unsubscribe:
unsubscribe();
```

---

## Error Handling

### Error Types

```typescript
enum TodoErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

interface TodoError {
  code: TodoErrorCode;
  message: string;
  field?: string;
}
```

### Error Examples

**Validation Error:**
```typescript
{
  code: 'VALIDATION_ERROR',
  message: 'Text must be 500 characters or less',
  field: 'text'
}
```

**Not Found Error:**
```typescript
{
  code: 'NOT_FOUND',
  message: 'Todo with id "xyz" not found'
}
```

---

## Usage Examples

### Complete CRUD Flow

```typescript
import { TodoStore } from './services/todo-store';

const store = new TodoStore();

// Subscribe to changes
const unsubscribe = store.subscribe((todos) => {
  console.log('Current todos:', todos.length);
});

// Create
const todo1 = store.add({ text: 'Buy milk' });
console.log(todo1); // { id: 'uuid', text: 'Buy milk', completed: false, ... }

// Read
const allTodos = store.getAll();
console.log(allTodos.length); // 1

// Update
const updated = store.update(todo1.id, { completed: true });
console.log(updated.completed); // true

// Delete
store.delete(todo1.id);
console.log(store.getAll().length); // 0

// Cleanup
unsubscribe();
```

### Error Handling Example

```typescript
try {
  store.add({ text: '' }); // Will throw
} catch (error) {
  if (error.code === 'VALIDATION_ERROR') {
    console.error('Validation failed:', error.message);
  }
}

try {
  store.update('invalid-id', { completed: true }); // Will throw
} catch (error) {
  if (error.code === 'NOT_FOUND') {
    console.error('Todo not found');
  }
}
```

---

## Performance Characteristics

| Operation | Time Complexity | Notes |
|-----------|----------------|-------|
| `add()` | O(1) | Uses Map.set() |
| `update()` | O(1) | Uses Map.get() + Map.set() |
| `delete()` | O(1) | Uses Map.delete() |
| `get()` | O(1) | Uses Map.get() |
| `getAll()` | O(n) | Iterates all todos |
| `getCompleted()` | O(n) | Filters all todos |
| `getIncomplete()` | O(n) | Filters all todos |
| `subscribe()` | O(1) | Adds to Set |

**Note:** All operations notify subscribers, which is O(m) where m = number of subscribers

---

## Concurrency

**Single-threaded JavaScript:** No race conditions in browser environment

**Observer Pattern:** All subscribers notified synchronously after state change

---

## Memory Management

**Storage:** JavaScript Map in memory

**Lifecycle:** Data lost on browser refresh/close (intentional)

**Capacity:** No hard limit, but UI may degrade with >1000 items

**Warning:** Consider adding UI warning at 500 items
