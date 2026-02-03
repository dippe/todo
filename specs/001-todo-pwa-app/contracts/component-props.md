# Component Props Contracts

**Version**: 1.0  
**Date**: 2026-02-03  
**Status**: Design Complete

## Overview

This document defines the props interface contracts for all React components. All components are pure functions with no internal state (no hooks), following strict functional programming principles.

---

## Core Component Contracts

### TaskItem

Displays a single task with toggle and delete actions.

**Props Interface**:
```typescript
interface TaskItemProps {
  readonly id: TaskId;
  readonly title: string;
  readonly completed: boolean;
  readonly onToggle: (id: TaskId) => void;
  readonly onDelete: (id: TaskId) => void;
  readonly onEdit: (id: TaskId) => void;
}
```

**Prop Descriptions**:
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `TaskId` | Yes | Unique task identifier |
| `title` | `string` | Yes | Task text to display |
| `completed` | `boolean` | Yes | Completion status (affects styling) |
| `onToggle` | `(id: TaskId) => void` | Yes | Callback when checkbox clicked |
| `onDelete` | `(id: TaskId) => void` | Yes | Callback when delete button clicked |
| `onEdit` | `(id: TaskId) => void` | Yes | Callback when edit button clicked |

**Usage Example**:
```typescript
<TaskItem
  id="550e8400-e29b-41d4-a716-446655440000" as TaskId
  title="Buy groceries"
  completed={false}
  onToggle={(id) => dispatch(toggleTask(id))}
  onDelete={(id) => dispatch(deleteTask(id))}
  onEdit={(id) => dispatch(setEditingId(id))}
/>
```

**Accessibility Requirements**:
- Checkbox: `aria-label="Mark '${title}' as ${completed ? 'incomplete' : 'complete'}"`
- Delete button: `aria-label="Delete '${title}'"`
- Edit button: `aria-label="Edit '${title}'"`
- Completed tasks: `aria-checked="true"`

---

### TaskList

Displays a list of tasks.

**Props Interface**:
```typescript
interface TaskListProps {
  readonly tasks: readonly Task[];
  readonly onToggle: (id: TaskId) => void;
  readonly onDelete: (id: TaskId) => void;
  readonly onEdit: (id: TaskId) => void;
  readonly emptyMessage?: string;
}
```

**Prop Descriptions**:
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `tasks` | `readonly Task[]` | Yes | Tasks to display (filtered by container) |
| `onToggle` | `(id: TaskId) => void` | Yes | Forward to TaskItem |
| `onDelete` | `(id: TaskId) => void` | Yes | Forward to TaskItem |
| `onEdit` | `(id: TaskId) => void` | Yes | Forward to TaskItem |
| `emptyMessage` | `string` | No | Message when list empty (default: "No tasks") |

**Usage Example**:
```typescript
<TaskList
  tasks={filteredTasks}
  onToggle={(id) => dispatch(toggleTask(id))}
  onDelete={(id) => dispatch(deleteTask(id))}
  onEdit={(id) => dispatch(setEditingId(id))}
  emptyMessage="No active tasks"
/>
```

**Behavior**:
- Empty list: Display `emptyMessage` in styled container
- Non-empty: Map tasks to `<TaskItem>` components
- Virtual scrolling: Not implemented in MVP (add if >100 tasks)

---

### TaskForm

Form for creating or editing tasks.

**Props Interface**:
```typescript
interface TaskFormProps {
  readonly mode: 'create' | 'edit';
  readonly initialValue?: string;
  readonly onSubmit: (title: string) => void;
  readonly onCancel?: () => void;
  readonly submitLabel?: string;
  readonly placeholder?: string;
}
```

**Prop Descriptions**:
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `mode` | `'create' \| 'edit'` | Yes | Form mode (affects labels) |
| `initialValue` | `string` | No | Pre-filled value (for edit mode) |
| `onSubmit` | `(title: string) => void` | Yes | Called when form submitted (validated) |
| `onCancel` | `() => void` | No | Called when cancel clicked (edit mode only) |
| `submitLabel` | `string` | No | Submit button text (default: mode-dependent) |
| `placeholder` | `string` | No | Input placeholder (default: "Enter task...") |

**Usage Examples**:
```typescript
// Create mode
<TaskForm
  mode="create"
  onSubmit={(title) => dispatch(addTask(title))}
  placeholder="What needs to be done?"
/>

// Edit mode
<TaskForm
  mode="edit"
  initialValue={editingTask.title}
  onSubmit={(title) => dispatch(updateTask({ id: editingTask.id, title }))}
  onCancel={() => dispatch(setEditingId(null))}
  submitLabel="Save"
/>
```

**Validation**:
- Title required (non-empty after trim)
- Max 500 characters
- Display inline error message
- Disable submit button when invalid

**Accessibility**:
- Input: `aria-label="Task title"`, `aria-invalid="true"` when error
- Error: `role="alert"` for screen readers

---

### FilterBar

Filter buttons for task view (all/active/completed).

**Props Interface**:
```typescript
interface FilterBarProps {
  readonly currentFilter: TaskFilter;
  readonly onFilterChange: (filter: TaskFilter) => void;
  readonly counts: {
    readonly all: number;
    readonly active: number;
    readonly completed: number;
  };
}
```

**Prop Descriptions**:
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `currentFilter` | `TaskFilter` | Yes | Active filter (for styling) |
| `onFilterChange` | `(filter: TaskFilter) => void` | Yes | Callback when filter clicked |
| `counts` | `{ all, active, completed }` | Yes | Task counts for each filter (badges) |

**Usage Example**:
```typescript
<FilterBar
  currentFilter={filter}
  onFilterChange={(filter) => dispatch(setFilter(filter))}
  counts={{ all: 10, active: 7, completed: 3 }}
/>
```

**Behavior**:
- Render 3 buttons: "All (10)", "Active (7)", "Completed (3)"
- Highlight current filter
- Keyboard navigation: Arrow keys

---

### TaskStats

Display task statistics (metrics).

**Props Interface**:
```typescript
interface TaskStatsProps {
  readonly totalCount: number;
  readonly completedCount: number;
  readonly activeCount: number;
  readonly onClearCompleted?: () => void;
}
```

**Prop Descriptions**:
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `totalCount` | `number` | Yes | Total tasks |
| `completedCount` | `number` | Yes | Completed tasks |
| `activeCount` | `number` | Yes | Active (incomplete) tasks |
| `onClearCompleted` | `() => void` | No | Callback to clear completed tasks |

**Usage Example**:
```typescript
<TaskStats
  totalCount={10}
  completedCount={3}
  activeCount={7}
  onClearCompleted={() => dispatch(clearCompleted())}
/>
```

**Display**:
- "7 items left"
- "Clear completed (3)" button (only if `completedCount > 0`)

---

### Layout

Root layout component with header, main, footer.

**Props Interface**:
```typescript
interface LayoutProps {
  readonly children: React.ReactNode;
  readonly title: string;
}
```

**Prop Descriptions**:
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `children` | `React.ReactNode` | Yes | Main content area |
| `title` | `string` | Yes | App title (header) |

**Usage Example**:
```typescript
<Layout title="TODO">
  <TaskFormContainer />
  <FilterBarContainer />
  <TaskListContainer />
  <TaskStatsContainer />
</Layout>
```

**Semantic HTML**:
```html
<div class="layout">
  <header>
    <h1>{title}</h1>
  </header>
  <main>
    {children}
  </main>
  <footer>
    <p>PWA TODO App</p>
  </footer>
</div>
```

---

### EditTaskDialog

Modal dialog for editing a task (alternative to inline edit).

**Props Interface**:
```typescript
interface EditTaskDialogProps {
  readonly open: boolean;
  readonly task: Task | null;
  readonly onSave: (id: TaskId, title: string) => void;
  readonly onClose: () => void;
}
```

**Prop Descriptions**:
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `open` | `boolean` | Yes | Dialog visibility |
| `task` | `Task \| null` | Yes | Task to edit (null if closed) |
| `onSave` | `(id: TaskId, title: string) => void` | Yes | Save callback |
| `onClose` | `() => void` | Yes | Close callback (cancel/escape) |

**Usage Example**:
```typescript
<EditTaskDialog
  open={editingId !== null}
  task={editingTask}
  onSave={(id, title) => dispatch(updateTask({ id, title }))}
  onClose={() => dispatch(setEditingId(null))}
/>
```

**Accessibility**:
- `role="dialog"`, `aria-modal="true"`
- Focus trap (Tab cycles within dialog)
- Escape key closes dialog
- Focus returns to trigger element on close

---

## Container Prop Patterns

Containers use `connect()` HOC to inject props from Redux.

**Pattern**:
```typescript
// Container file: TaskListContainer.tsx
import { connect } from 'react-redux';
import { TaskList } from '../components/TaskList';

const mapStateToProps = (state: RootState) => ({
  tasks: selectFilteredTasks(state),
});

const mapDispatchToProps = (dispatch: AppDispatch) => ({
  onToggle: (id: TaskId) => dispatch(toggleTask(id)),
  onDelete: (id: TaskId) => dispatch(deleteTask(id)),
  onEdit: (id: TaskId) => dispatch(setEditingId(id)),
});

export const TaskListContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(TaskList);
```

**Type Safety**:
```typescript
// Component receives correct props (inferred from connect())
type TaskListProps = ConnectedProps<typeof connector>;
const connector = connect(mapStateToProps, mapDispatchToProps);
```

---

## Prop Validation Rules

### Required Props
All required props must be provided (TypeScript enforces).

### Optional Props
Provide sensible defaults in component:
```typescript
export const TaskList: FC<TaskListProps> = ({ 
  tasks, 
  emptyMessage = "No tasks" 
}) => {
  // ...
};
```

### Callback Props
Must be stable references (no inline functions in containers):
```typescript
// ✅ Correct: Stable callback
const mapDispatchToProps = (dispatch: AppDispatch) => ({
  onToggle: (id: TaskId) => dispatch(toggleTask(id)),
});

// ❌ Wrong: New function every render (causes re-renders)
const TaskListContainer = ({ tasks }: Props) => (
  <TaskList 
    tasks={tasks} 
    onToggle={(id) => dispatch(toggleTask(id))} // New function reference
  />
);
```

---

## Accessibility Checklist

All components must:
- ✅ Use semantic HTML (`button`, `input`, `nav`, etc.)
- ✅ Provide `aria-label` for icon-only buttons
- ✅ Support keyboard navigation (Tab, Enter, Escape)
- ✅ Include focus indicators (`:focus` styles)
- ✅ Meet WCAG AA contrast ratios (4.5:1 minimum)
- ✅ Use `role` attributes for custom widgets
- ✅ Announce errors to screen readers (`role="alert"`)

---

## Responsive Design

All components must:
- ✅ Use Tailwind responsive utilities (`md:`, `lg:`)
- ✅ Stack vertically on mobile (<768px)
- ✅ Expand horizontally on desktop (≥768px)
- ✅ Touch targets ≥44x44px on mobile
- ✅ No horizontal scrolling at any breakpoint

**Example**:
```typescript
<button className="
  min-h-[44px] min-w-[44px]  // Touch target
  p-2 md:p-4                 // Responsive padding
  text-sm md:text-base       // Responsive text size
">
  Delete
</button>
```

---

## Testing Contracts

Each component must have:
1. **Render tests**: Verify output with various prop combinations
2. **Interaction tests**: Verify callbacks fired correctly
3. **Accessibility tests**: Verify ARIA attributes and keyboard nav
4. **Snapshot tests**: Detect unintended UI changes

**Example**:
```typescript
describe('TaskItem', () => {
  it('should render task title', () => {
    render(
      <TaskItem
        id="test-id" as TaskId
        title="Test Task"
        completed={false}
        onToggle={jest.fn()}
        onDelete={jest.fn()}
        onEdit={jest.fn()}
      />
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('should call onToggle when checkbox clicked', () => {
    const onToggle = jest.fn();
    
    render(
      <TaskItem
        id="test-id" as TaskId
        title="Test Task"
        completed={false}
        onToggle={onToggle}
        onDelete={jest.fn()}
        onEdit={jest.fn()}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(onToggle).toHaveBeenCalledWith('test-id');
  });

  it('should have accessible labels', () => {
    render(
      <TaskItem
        id="test-id" as TaskId
        title="Test Task"
        completed={false}
        onToggle={jest.fn()}
        onDelete={jest.fn()}
        onEdit={jest.fn()}
      />
    );

    expect(screen.getByLabelText(/Mark.*Test Task.*as complete/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Delete.*Test Task/i)).toBeInTheDocument();
  });
});
```

---

## Component Dependency Graph

```text
Layout
  ├── TaskFormContainer
  │     └── TaskForm
  ├── FilterBarContainer
  │     └── FilterBar
  ├── TaskListContainer
  │     └── TaskList
  │           └── TaskItem
  └── TaskStatsContainer
        └── TaskStats

EditTaskDialogContainer
  └── EditTaskDialog
        └── TaskForm (reused)
```

**Container → Component pattern**:
- **Container**: Connects to Redux (`mapStateToProps`, `mapDispatchToProps`)
- **Component**: Pure function of props (no state, no side effects)

---

## Common Patterns

### Conditional Rendering
```typescript
{tasks.length === 0 ? (
  <EmptyState message={emptyMessage} />
) : (
  <ul>
    {tasks.map(task => <TaskItem key={task.id} {...task} />)}
  </ul>
)}
```

### List Rendering
```typescript
{tasks.map(task => (
  <TaskItem
    key={task.id}
    {...task}
    onToggle={onToggle}
    onDelete={onDelete}
    onEdit={onEdit}
  />
))}
```

### Event Handling
```typescript
// Pass ID to callbacks (avoid inline functions)
<button onClick={() => onDelete(id)}>Delete</button>
```

---

**Status**: ✅ Complete - All component contracts defined
