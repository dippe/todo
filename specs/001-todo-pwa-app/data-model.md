# Data Model: TODO PWA Application

**Branch**: `001-todo-pwa-app` | **Date**: 2026-02-03  
**Status**: Design Complete

## Overview

This document defines the data model for the TODO PWA application. All types follow immutable, functional programming principles with `readonly` modifiers and strict TypeScript typing.

---

## Core Entities

### Task

Represents a single TODO item.

**Type Definition**:
```typescript
interface Task {
  readonly id: TaskId;
  readonly title: string;
  readonly completed: boolean;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
}

type TaskId = string & { readonly __brand: 'TaskId' };
type Timestamp = number; // Unix epoch milliseconds
```

**Fields**:

| Field | Type | Required | Description | Validation |
|-------|------|----------|-------------|------------|
| `id` | `TaskId` | Yes | Unique identifier (UUID v4) | Non-empty string, unique across all tasks |
| `title` | `string` | Yes | Task description text | 1-500 characters, trimmed, non-empty |
| `completed` | `boolean` | Yes | Completion status | `true` = completed, `false` = incomplete |
| `createdAt` | `Timestamp` | Yes | Creation timestamp | Unix epoch milliseconds, immutable |
| `updatedAt` | `Timestamp` | Yes | Last modification timestamp | Unix epoch milliseconds, updated on changes |

**Invariants**:
- `id` is immutable (set once on creation)
- `createdAt` is immutable (set once on creation)
- `updatedAt >= createdAt` (always)
- `title` never empty after trimming
- `title` max length 500 characters (prevents storage bloat)

**State Transitions**:
```text
┌─────────────┐   toggleTask()   ┌─────────────┐
│  completed  │<───────────────> │  incomplete │
│  = true     │                  │  = false    │
└─────────────┘                  └─────────────┘
```

**Example**:
```typescript
const task: Task = {
  id: '550e8400-e29b-41d4-a716-446655440000' as TaskId,
  title: 'Buy groceries',
  completed: false,
  createdAt: 1738598400000,
  updatedAt: 1738598400000,
};
```

---

### TaskList

Represents the ordered collection of all tasks.

**Type Definition**:
```typescript
interface TaskListState {
  readonly items: readonly Task[];
  readonly filter: TaskFilter;
}

type TaskFilter = 'all' | 'active' | 'completed';
```

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `items` | `readonly Task[]` | Ordered array of tasks (creation order) |
| `filter` | `TaskFilter` | Current view filter (default: 'all') |

**Derived Properties** (computed via selectors):
```typescript
interface TaskListMetrics {
  readonly totalCount: number;       // items.length
  readonly completedCount: number;   // items.filter(t => t.completed).length
  readonly activeCount: number;      // items.filter(t => !t.completed).length
}
```

**Invariants**:
- `items` array is immutable (use spread/map/filter for updates)
- Task `id` values are unique within `items`
- Order preserved unless explicitly sorted
- Maximum 10,000 tasks (storage limit mitigation)

---

## Supporting Types

### Result Type (Error Handling)

```typescript
type Result<T, E = string> = 
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };
```

**Usage**:
```typescript
const result: Result<Task> = addTask(tasks, 'Buy milk');

if (result.ok) {
  console.log(result.value); // Task
} else {
  console.error(result.error); // string
}
```

**Rationale**: Replaces exceptions with explicit error handling (functional approach).

---

### Redux State Shape

```typescript
interface RootState {
  readonly tasks: TaskListState;
}

interface TaskListState {
  readonly items: readonly Task[];
  readonly filter: TaskFilter;
  readonly editingId: TaskId | null;
}
```

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `items` | `readonly Task[]` | All tasks |
| `filter` | `TaskFilter` | Active filter ('all' \| 'active' \| 'completed') |
| `editingId` | `TaskId \| null` | ID of task currently being edited (null if none) |

---

### Form Input Types

```typescript
interface TaskFormInput {
  readonly title: string;
}

interface TaskFormErrors {
  readonly title?: string;
}
```

**Validation Rules**:
- `title`: Required, 1-500 chars, trimmed

---

## Relationships

```text
┌──────────────┐
│ TaskListState│
└──────┬───────┘
       │ 1
       │
       │ contains
       │
       │ *
┌──────▼───────┐
│     Task     │
└──────────────┘
```

**Cardinality**: One TaskListState contains zero or many Tasks (1:*)

**Referential Integrity**: 
- `editingId` (if not null) must match an existing `Task.id` in `items`
- Enforced by selectors and reducers

---

## Validation Rules

### Task Creation (FR-001, FR-011)

```typescript
const validateTaskInput = (input: TaskFormInput): Result<TaskFormInput, TaskFormErrors> => {
  const errors: TaskFormErrors = {};
  
  // Title required
  if (input.title.trim() === '') {
    errors.title = 'Title cannot be empty';
  }
  
  // Title max length
  if (input.title.length > 500) {
    errors.title = 'Title cannot exceed 500 characters';
  }
  
  return Object.keys(errors).length > 0
    ? { ok: false, error: errors }
    : { ok: true, value: input };
};
```

---

### Task Update (FR-005)

```typescript
const validateTaskUpdate = (id: TaskId, updates: Partial<Task>): Result<Partial<Task>> => {
  // Title validation (if provided)
  if ('title' in updates && updates.title?.trim() === '') {
    return { ok: false, error: 'Title cannot be empty' };
  }
  
  if ('title' in updates && (updates.title?.length ?? 0) > 500) {
    return { ok: false, error: 'Title cannot exceed 500 characters' };
  }
  
  // Immutable fields (prevent updates)
  if ('id' in updates || 'createdAt' in updates) {
    return { ok: false, error: 'Cannot modify immutable fields' };
  }
  
  return { ok: true, value: updates };
};
```

---

### Storage Limits (Edge Case)

```typescript
const validateStorageCapacity = (tasks: TaskList): Result<void> => {
  // Max 10,000 tasks
  if (tasks.length >= 10_000) {
    return { ok: false, error: 'Maximum task limit reached (10,000)' };
  }
  
  // Estimate storage size (~1KB per task)
  const estimatedSize = tasks.length * 1024;
  if (estimatedSize > 5_000_000) { // ~5MB
    return { ok: false, error: 'Storage limit approaching' };
  }
  
  return { ok: true, value: undefined };
};
```

---

## State Transitions

### Task Lifecycle

```text
┌─────────┐
│ CREATE  │
└────┬────┘
     │ addTask(title)
     │
     v
┌────────────────┐
│ ACTIVE         │
│ completed=false│
└────┬───────────┘
     │
     ├─ toggleTask(id) ──────> ┌────────────────┐
     │                          │ COMPLETED      │
     │                          │ completed=true │
     │              <────────── └────┬───────────┘
     │              toggleTask(id)   │
     │                               │
     ├─ updateTask(id, title) ───────┤ (both states)
     │                               │
     v                               v
┌─────────┐                   ┌─────────┐
│ DELETE  │<─── deleteTask(id)│ DELETE  │
└─────────┘                   └─────────┘
```

**Operations**:
- **CREATE**: `addTask(title)` → New task with `completed=false`
- **UPDATE**: `updateTask(id, title)` → Modify title, update `updatedAt`
- **TOGGLE**: `toggleTask(id)` → Flip `completed` status, update `updatedAt`
- **DELETE**: `deleteTask(id)` → Remove from list permanently (no undo)

---

### Filter State Machine

```text
┌───────┐     setFilter('active')      ┌────────┐
│  all  │<──────────────────────────> │ active │
└───┬───┘                              └───┬────┘
    │                                      │
    │ setFilter('completed')               │
    │                                      │
    v                                      │
┌───────────┐  setFilter('active')        │
│ completed │<────────────────────────────┘
└───────────┘
```

---

## Persistence Schema (LocalStorage)

### Storage Key
```typescript
const STORAGE_KEY = 'todo-pwa-state';
```

### Schema Version 1
```typescript
interface StorageSchema {
  readonly version: 1;
  readonly data: {
    readonly tasks: {
      readonly items: readonly Task[];
      readonly filter: TaskFilter;
    };
  };
  readonly lastSaved: Timestamp;
}
```

**Example Serialized Data**:
```json
{
  "version": 1,
  "data": {
    "tasks": {
      "items": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "title": "Buy groceries",
          "completed": false,
          "createdAt": 1738598400000,
          "updatedAt": 1738598400000
        }
      ],
      "filter": "all"
    }
  },
  "lastSaved": 1738598450000
}
```

---

### Migration Strategy

```typescript
const migrateStorage = (raw: unknown): Result<StorageSchema> => {
  if (!isObject(raw)) {
    return { ok: false, error: 'Invalid storage format' };
  }
  
  // Version 1 (current)
  if (raw.version === 1) {
    return validateV1Schema(raw);
  }
  
  // Future versions (v2, v3...)
  // if (raw.version === 2) return migrateV2ToV1(raw);
  
  // Unknown version or missing version (reset to defaults)
  return { ok: false, error: 'Unknown schema version' };
};
```

---

## Selectors (Derived State)

### Basic Selectors
```typescript
const selectAllTasks = (state: RootState): readonly Task[] => 
  state.tasks.items;

const selectFilter = (state: RootState): TaskFilter => 
  state.tasks.filter;

const selectEditingId = (state: RootState): TaskId | null => 
  state.tasks.editingId;
```

### Computed Selectors (Memoized)
```typescript
import { createSelector } from '@reduxjs/toolkit';

const selectFilteredTasks = createSelector(
  [selectAllTasks, selectFilter],
  (tasks, filter): readonly Task[] => {
    switch (filter) {
      case 'active':
        return tasks.filter(t => !t.completed);
      case 'completed':
        return tasks.filter(t => t.completed);
      case 'all':
      default:
        return tasks;
    }
  }
);

const selectMetrics = createSelector(
  [selectAllTasks],
  (tasks): TaskListMetrics => ({
    totalCount: tasks.length,
    completedCount: tasks.filter(t => t.completed).length,
    activeCount: tasks.filter(t => !t.completed).length,
  })
);

const selectEditingTask = createSelector(
  [selectAllTasks, selectEditingId],
  (tasks, editingId): Task | null => {
    if (!editingId) return null;
    return tasks.find(t => t.id === editingId) ?? null;
  }
);
```

---

## Type Guards

```typescript
const isTask = (value: unknown): value is Task => {
  return (
    isObject(value) &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.completed === 'boolean' &&
    typeof value.createdAt === 'number' &&
    typeof value.updatedAt === 'number' &&
    value.updatedAt >= value.createdAt
  );
};

const isTaskList = (value: unknown): value is readonly Task[] => {
  return Array.isArray(value) && value.every(isTask);
};
```

---

## Constants

```typescript
// Validation
export const TASK_TITLE_MIN_LENGTH = 1;
export const TASK_TITLE_MAX_LENGTH = 500;
export const TASK_MAX_COUNT = 10_000;
export const STORAGE_SIZE_LIMIT = 5_000_000; // ~5MB

// Storage
export const STORAGE_KEY = 'todo-pwa-state';
export const STORAGE_VERSION = 1;

// Timing
export const STORAGE_DEBOUNCE_MS = 300;
export const SYNC_CHECK_INTERVAL_MS = 1000; // Multi-tab sync
```

---

## Summary

The data model follows strict functional programming principles:
- **Immutability**: All types use `readonly`
- **Type Safety**: Strict TypeScript, no `any`
- **Explicit Errors**: `Result<T, E>` instead of exceptions
- **Pure Functions**: All operations return new values
- **Validation**: Explicit rules for all mutations
- **Versioning**: Schema version for future migrations

All types support:
- ✅ Serialization (JSON.stringify/parse)
- ✅ Type guards for runtime validation
- ✅ Redux Toolkit reducers (immutable updates)
- ✅ LocalStorage persistence
- ✅ Testing (deterministic, no side effects)

---

**Status**: ✅ Design Complete - Ready for contract generation
