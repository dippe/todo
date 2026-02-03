# Data Model: TODO PWA

## Overview
This document defines the data structures, validation rules, and state transitions for the TODO PWA application.

---

## Entities

### Todo

**Description:** Represents a single TODO item

**Fields:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | string | Yes | - | Unique identifier (UUID v4) |
| text | string | Yes | - | TODO item description |
| completed | boolean | Yes | false | Completion status |
| createdAt | Date | Yes | now() | Creation timestamp |
| updatedAt | Date | Yes | now() | Last update timestamp |

**TypeScript Definition:**
```typescript
interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Validation Rules:**
- `id`: Must be valid UUID v4 format
- `text`: 
  - Minimum length: 1 character
  - Maximum length: 500 characters
  - Cannot be only whitespace
- `completed`: Must be boolean
- `createdAt`: Must be valid Date, cannot be in future
- `updatedAt`: Must be valid Date, must be >= createdAt

**Constraints:**
- `text` must be trimmed before storage
- `id` must be unique within the store
- `updatedAt` must be updated on any modification

---

## Relationships

**None** - Single entity design (no relationships required)

---

## State Transitions

### Todo Lifecycle

```
┌─────────┐
│ Created │ (completed = false)
└────┬────┘
     │
     ├──> [Mark Complete] ──> completed = true
     │
     ├──> [Mark Incomplete] ──> completed = false
     │
     ├──> [Edit Text] ──> text updated, updatedAt = now()
     │
     └──> [Delete] ──> removed from store
```

**Valid Transitions:**
1. **Create**: New todo with `completed = false`
2. **Toggle Complete**: `completed` flips between true/false
3. **Edit**: Update `text`, set `updatedAt = now()`
4. **Delete**: Remove from store

**Invalid Transitions:**
- Cannot create todo with empty text
- Cannot set createdAt in the future
- Cannot set updatedAt before createdAt

---

## Storage Schema

### In-Memory Map Structure

```typescript
class TodoStore {
  private todos: Map<string, Todo>;
  // Key: todo.id
  // Value: Todo object
}
```

**Operations:**
- `add(todo: Todo): void` - O(1)
- `update(id: string, updates: Partial<Todo>): void` - O(1)
- `delete(id: string): void` - O(1)
- `get(id: string): Todo | undefined` - O(1)
- `getAll(): Todo[]` - O(n)
- `getCompleted(): Todo[]` - O(n)
- `getIncomplete(): Todo[]` - O(n)

**Memory Estimate:**
- Average todo: ~100 bytes (text + metadata)
- 1,000 todos: ~100KB
- Expected usage: <100 todos per session

---

## Validation Implementation

### Create Todo Validator

```typescript
interface CreateTodoInput {
  text: string;
}

function validateCreateTodo(input: CreateTodoInput): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!input.text || input.text.trim().length === 0) {
    errors.push('Text is required');
  }
  
  if (input.text && input.text.length > 500) {
    errors.push('Text must be 500 characters or less');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

### Update Todo Validator

```typescript
interface UpdateTodoInput {
  text?: string;
  completed?: boolean;
}

function validateUpdateTodo(input: UpdateTodoInput): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (input.text !== undefined) {
    if (input.text.trim().length === 0) {
      errors.push('Text cannot be empty');
    }
    if (input.text.length > 500) {
      errors.push('Text must be 500 characters or less');
    }
  }
  
  if (input.completed !== undefined && typeof input.completed !== 'boolean') {
    errors.push('Completed must be a boolean');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

---

## Edge Cases

### Text Handling
- **Whitespace**: Trim leading/trailing spaces before storage
- **Line breaks**: Allow but count toward character limit
- **Special characters**: Allow all Unicode characters
- **Empty after trim**: Reject with validation error

### Concurrent Operations
- **In-memory only**: No race conditions (single-threaded JS)
- **UI updates**: Observer pattern ensures consistency

### Data Loss Scenarios
- **Browser refresh**: All data lost (expected behavior)
- **Browser crash**: All data lost (expected behavior)
- **Session close**: All data lost (expected behavior)

**Mitigation:** Display warning message on first use explaining data is session-only

---

## Sample Data

### Valid Todo Examples

```typescript
const examples: Todo[] = [
  {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    text: 'Buy groceries',
    completed: false,
    createdAt: new Date('2026-02-03T10:00:00Z'),
    updatedAt: new Date('2026-02-03T10:00:00Z')
  },
  {
    id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    text: 'Complete project documentation',
    completed: true,
    createdAt: new Date('2026-02-03T09:00:00Z'),
    updatedAt: new Date('2026-02-03T11:30:00Z')
  }
];
```

### Invalid Examples

```typescript
// Invalid: empty text
{
  id: 'xyz',
  text: '',
  completed: false
}

// Invalid: text too long
{
  id: 'xyz',
  text: 'a'.repeat(501),
  completed: false
}

// Invalid: whitespace only
{
  id: 'xyz',
  text: '   ',
  completed: false
}
```

---

## Performance Considerations

### Memory Management
- **Target**: Support 1,000 todos comfortably
- **Threshold**: Warn user at 500 todos (optional)
- **Cleanup**: None needed (session-only)

### Query Optimization
- **All operations**: O(1) except filters
- **Filters** (completed/incomplete): O(n) but acceptable for <1000 items
- **Sorting**: Optional, implement if needed

---

## Future Enhancements (Out of Scope)

- Priority levels (high, medium, low)
- Due dates
- Categories/tags
- Subtasks
- Rich text descriptions
- Attachments
- Persistence to localStorage
- Sync between devices

These are explicitly NOT included in the initial implementation per the in-memory-only requirement.
