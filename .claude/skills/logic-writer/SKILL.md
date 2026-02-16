---
name: logic-writer
description: Use when writing business logic, domain logic, or pure functions. This skill helps implement composable, type-safe logic using functional programming patterns.
---

# Logic Writer

**READ**: `.claude/skills/standards/SKILL.md` for functional programming rules

## Pattern

```typescript
// Result type for errors
type Result<T, E> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

// Domain types
interface Todo {
  readonly id: TodoId;
  readonly title: string;
  readonly completed: boolean;
}

type TodoList = readonly Todo[];

// Pure functions
const addTodo = (todos: TodoList, title: string): TodoList => [
  ...todos,
  { id: generateId(), title, completed: false }
];

const toggleTodo = (todos: TodoList, id: TodoId): TodoList =>
  todos.map(todo =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );

// Composition
const pipe = <T>(...fns: Array<(arg: T) => T>) =>
  (value: T): T => fns.reduce((acc, fn) => fn(acc), value);

const process = pipe(
  filterActive,
  sortByDate,
  limitToTen
);
```

## Focus

- Pure functions (no side effects)
- Immutable operations (spread, map/filter/reduce)
- Type-safe Result types for errors
- Function composition
- Small functions (max 15 lines)
- Domain logic only (no UI, no I/O)
