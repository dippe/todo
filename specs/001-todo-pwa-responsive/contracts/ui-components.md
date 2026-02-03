# UI Component Contracts

## Overview
This document defines the contract for React components in the TODO PWA application.

---

## Components

### TodoApp (Root Component)

**Description:** Main application container

**Props:** None

**State:**
- Manages global TodoStore instance
- Provides store to child components via context

**Responsibilities:**
- Initialize TodoStore
- Provide store context
- Render TodoList and TodoForm components

**Example:**
```tsx
<TodoApp />
```

---

### TodoForm

**Description:** Form for creating new TODO items

**Props:** None (uses TodoStore from context)

**State:**
- `inputText: string` - Current input value

**Events:**
- `onSubmit` - Calls `todoStore.add()` with input text

**Validation:**
- Shows error if text is empty
- Shows error if text exceeds 500 characters
- Clears input on successful submission

**UI Elements:**
- Text input field
- "Add" button
- Error message display (if validation fails)

**Example:**
```tsx
<TodoForm />
```

**Behavior:**
- Pressing Enter submits form
- Button click submits form
- Input is cleared after successful submission
- Error messages appear below input

---

### TodoList

**Description:** Displays list of TODO items

**Props:**
```typescript
interface TodoListProps {
  filter?: 'all' | 'completed' | 'incomplete';
}
```

**State:**
- Subscribes to TodoStore changes
- Maintains filtered todo list

**Responsibilities:**
- Subscribe to store on mount
- Unsubscribe on unmount
- Filter todos based on `filter` prop
- Render TodoItem for each todo

**Example:**
```tsx
<TodoList filter="all" />
<TodoList filter="completed" />
<TodoList filter="incomplete" />
```

**UI Elements:**
- List container
- Empty state message (when no todos)
- TodoItem components

---

### TodoItem

**Description:** Single TODO item display and controls

**Props:**
```typescript
interface TodoItemProps {
  todo: Todo;
}
```

**Events:**
- `onToggle` - Calls `todoStore.update(id, { completed: !completed })`
- `onDelete` - Calls `todoStore.delete(id)`
- `onEdit` - Inline editing of todo text

**UI Elements:**
- Checkbox (toggle completion)
- Text display (with strikethrough if completed)
- Edit button (inline editing mode)
- Delete button
- Save/Cancel buttons (in edit mode)

**States:**
- **View Mode:** Display text, checkbox, edit/delete buttons
- **Edit Mode:** Text input, save/cancel buttons

**Example:**
```tsx
<TodoItem todo={todo} />
```

**Behavior:**
- Click checkbox: Toggle completion
- Click edit: Enter edit mode
- Click delete: Confirm and delete
- In edit mode: Save updates text, Cancel reverts

---

### TodoFilter

**Description:** Filter controls for TODO list

**Props:**
```typescript
interface TodoFilterProps {
  currentFilter: 'all' | 'completed' | 'incomplete';
  onFilterChange: (filter: 'all' | 'completed' | 'incomplete') => void;
}
```

**UI Elements:**
- Three buttons: "All", "Completed", "Incomplete"
- Active filter is highlighted

**Example:**
```tsx
<TodoFilter 
  currentFilter="all" 
  onFilterChange={(f) => setFilter(f)} 
/>
```

---

### TodoStats

**Description:** Statistics display (optional enhancement)

**Props:** None (uses TodoStore from context)

**Display:**
- Total todos count
- Completed count
- Incomplete count

**Example:**
```tsx
<TodoStats />
```

**UI:**
```
Total: 10 | Completed: 4 | Remaining: 6
```

---

## Component Hierarchy

```
TodoApp
├── TodoForm
├── TodoFilter
├── TodoStats (optional)
└── TodoList
    └── TodoItem (multiple)
```

---

## Context API

### TodoStoreContext

**Description:** React Context for sharing TodoStore

**Definition:**
```typescript
const TodoStoreContext = React.createContext<TodoStore | null>(null);

export function useTodoStore(): TodoStore {
  const store = useContext(TodoStoreContext);
  if (!store) {
    throw new Error('useTodoStore must be used within TodoStoreProvider');
  }
  return store;
}
```

**Usage:**
```tsx
// Provider (in TodoApp)
<TodoStoreContext.Provider value={todoStore}>
  <TodoForm />
  <TodoList />
</TodoStoreContext.Provider>

// Consumer (in any component)
const store = useTodoStore();
```

---

## Styling Contracts

### Responsive Breakpoints

```css
/* Mobile first (default) */
.todo-container {
  padding: 1rem;
}

/* Tablet: 768px */
@media (min-width: 768px) {
  .todo-container {
    padding: 2rem;
    max-width: 960px;
    margin: 0 auto;
  }
}

/* Desktop: 1200px */
@media (min-width: 1200px) {
  .todo-container {
    max-width: 1200px;
  }
}
```

### ShadCN Components to Use

- **Button** - For all buttons
- **Input** - For text inputs
- **Checkbox** - For todo completion toggle
- **Card** - For TodoItem container
- **Dialog** - For delete confirmation (optional)
- **Badge** - For todo count display (optional)

---

## Accessibility Requirements

### ARIA Labels

**TodoForm:**
```tsx
<input 
  type="text" 
  aria-label="New todo text"
  aria-invalid={hasError}
  aria-describedby={hasError ? "error-message" : undefined}
/>
<button aria-label="Add todo">Add</button>
```

**TodoItem:**
```tsx
<input 
  type="checkbox" 
  aria-label={`Mark "${todo.text}" as ${todo.completed ? 'incomplete' : 'complete'}`}
  checked={todo.completed}
/>
<button aria-label={`Delete "${todo.text}"`}>Delete</button>
<button aria-label={`Edit "${todo.text}"`}>Edit</button>
```

### Keyboard Navigation

- **Tab** - Navigate between interactive elements
- **Enter** - Activate buttons, submit forms
- **Space** - Toggle checkboxes
- **Escape** - Cancel edit mode

---

## Event Flow Examples

### Creating a Todo

```
User types "Buy milk" in TodoForm input
  ↓
User clicks "Add" button or presses Enter
  ↓
TodoForm validates input (length, not empty)
  ↓
TodoForm calls todoStore.add({ text: "Buy milk" })
  ↓
TodoStore creates new Todo with generated ID
  ↓
TodoStore notifies all subscribers
  ↓
TodoList receives update via subscription
  ↓
TodoList re-renders with new todo
  ↓
TodoForm clears input field
```

### Completing a Todo

```
User clicks checkbox on TodoItem
  ↓
TodoItem calls onToggle handler
  ↓
Handler calls todoStore.update(id, { completed: true })
  ↓
TodoStore updates todo and notifies subscribers
  ↓
TodoList receives update
  ↓
TodoItem re-renders with strikethrough text
```

### Deleting a Todo

```
User clicks delete button on TodoItem
  ↓
TodoItem shows confirmation (optional)
  ↓
User confirms deletion
  ↓
TodoItem calls todoStore.delete(id)
  ↓
TodoStore removes todo and notifies subscribers
  ↓
TodoList receives update
  ↓
TodoItem is removed from UI
```

---

## Error Handling in Components

### TodoForm

```tsx
const [error, setError] = useState<string | null>(null);

const handleSubmit = () => {
  try {
    todoStore.add({ text: inputText });
    setInputText('');
    setError(null);
  } catch (err) {
    if (err.code === 'VALIDATION_ERROR') {
      setError(err.message);
    }
  }
};
```

### TodoItem

```tsx
const handleUpdate = (updates: UpdateTodoInput) => {
  try {
    todoStore.update(todo.id, updates);
    setEditMode(false);
  } catch (err) {
    // Show error toast or inline message
    console.error('Failed to update todo:', err);
  }
};
```

---

## Performance Optimizations

### Memoization

```tsx
// Memoize TodoItem to prevent unnecessary re-renders
const TodoItem = React.memo(({ todo }: TodoItemProps) => {
  // Component implementation
}, (prevProps, nextProps) => {
  return prevProps.todo.id === nextProps.todo.id &&
         prevProps.todo.text === nextProps.todo.text &&
         prevProps.todo.completed === nextProps.todo.completed;
});
```

### Efficient Subscriptions

```tsx
// Subscribe only once in TodoList
useEffect(() => {
  const unsubscribe = todoStore.subscribe((todos) => {
    setTodos(todos);
  });
  return unsubscribe;
}, [todoStore]);
```

---

## Testing Contracts

### TodoForm Tests

- Renders input and button
- Validates empty input
- Validates text > 500 characters
- Calls todoStore.add() on submit
- Clears input after successful submission
- Shows error message for invalid input

### TodoList Tests

- Renders all todos
- Filters completed todos correctly
- Filters incomplete todos correctly
- Shows empty state when no todos
- Subscribes to store on mount
- Unsubscribes on unmount

### TodoItem Tests

- Renders todo text
- Shows checkbox
- Toggles completion on checkbox click
- Shows strikethrough when completed
- Enters edit mode on edit button click
- Saves changes in edit mode
- Cancels changes in edit mode
- Deletes todo on delete button click
