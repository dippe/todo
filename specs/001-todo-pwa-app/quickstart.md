# Quickstart Guide: TODO PWA Application

**Branch**: `001-todo-pwa-app` | **Date**: 2026-02-03  
**Status**: Ready for Implementation

## Overview

This quickstart guide provides step-by-step instructions for implementing the TODO PWA application following TDD methodology, functional programming principles, and the project's architectural standards.

---

## Prerequisites

- Node.js 18+ and npm
- Git
- Code editor (VS Code recommended)
- Browser with DevTools (Chrome/Firefox)

---

## Phase 1: Project Setup

### 1.1 Initialize Project

```bash
# Create project with Vite + React + TypeScript
npm create vite@latest todo-pwa -- --template react-ts
cd todo-pwa
npm install

# Install dependencies
npm install react-redux @reduxjs/toolkit
npm install -D tailwindcss postcss autoprefixer
npm install -D @types/react-redux

# Initialize Tailwind CSS
npx tailwindcss init -p
```

### 1.2 Configure TypeScript (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    
    /* Strict Type Checking */
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    
    /* Additional Checks */
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    
    /* Module Resolution */
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "esModuleInterop": true
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

### 1.3 Configure ESLint (.eslintrc.cjs)

```javascript
module.exports = {
  root: true,
  env: { browser: true, es2022: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: { 
    ecmaVersion: 'latest', 
    sourceType: 'module',
    ecmaFeatures: { jsx: true }
  },
  plugins: ['react-refresh', '@typescript-eslint', 'functional'],
  rules: {
    // TypeScript
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    
    // Functional Programming
    'functional/no-let': 'error',
    'functional/immutable-data': 'error',
    'functional/no-loop-statement': 'error',
    'functional/prefer-readonly-type': 'warn',
    
    // React (NO HOOKS - except in containers)
    'react-hooks/rules-of-hooks': 'off', // We don't use hooks
    
    // Code Quality
    'max-lines-per-function': ['error', 20],
    'max-params': ['error', 3],
    'complexity': ['error', 5],
    'no-magic-numbers': ['warn', { ignore: [0, 1, -1] }],
  },
  settings: {
    react: { version: 'detect' }
  }
};
```

### 1.4 Configure Prettier (.prettierrc)

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "arrowParens": "always"
}
```

### 1.5 Configure Tailwind (tailwind.config.js)

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
      },
    },
  },
  plugins: [],
}
```

### 1.6 Setup Testing

```bash
# Install Jest + React Testing Library
npm install -D jest @testing-library/react @testing-library/jest-dom
npm install -D @testing-library/user-event @types/jest
npm install -D jest-environment-jsdom ts-jest

# Install Playwright for E2E
npm init playwright@latest
```

**jest.config.js**:
```javascript
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/main.tsx',
    '!src/**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90,
    },
  },
};
```

**src/setupTests.ts**:
```typescript
import '@testing-library/jest-dom';
```

### 1.7 Setup shadcn/ui

```bash
# Install shadcn/ui CLI
npx shadcn-ui@latest init

# Add required components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add scroll-area
```

---

## Phase 2: TDD - Core Types & Utils

### 2.1 Create Type Definitions (Test First!)

**tests/unit/types/task.test.ts**:
```typescript
import { isTask, isTaskList } from '../../../src/types/task';

describe('Task Type Guards', () => {
  describe('isTask', () => {
    it('should validate correct task object', () => {
      const task = {
        id: 'test-id',
        title: 'Test',
        completed: false,
        createdAt: 1000,
        updatedAt: 1000,
      };

      expect(isTask(task)).toBe(true);
    });

    it('should reject invalid task', () => {
      expect(isTask(null)).toBe(false);
      expect(isTask({})).toBe(false);
      expect(isTask({ id: 'test' })).toBe(false);
    });
  });
});
```

**src/types/task.ts**:
```typescript
export type TaskId = string & { readonly __brand: 'TaskId' };
export type Timestamp = number;

export interface Task {
  readonly id: TaskId;
  readonly title: string;
  readonly completed: boolean;
  readonly createdAt: Timestamp;
  readonly updatedAt: Timestamp;
}

export type TaskList = readonly Task[];

export const isTask = (value: unknown): value is Task => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'title' in value &&
    'completed' in value &&
    'createdAt' in value &&
    'updatedAt' in value &&
    typeof (value as Task).id === 'string' &&
    typeof (value as Task).title === 'string' &&
    typeof (value as Task).completed === 'boolean' &&
    typeof (value as Task).createdAt === 'number' &&
    typeof (value as Task).updatedAt === 'number'
  );
};

export const isTaskList = (value: unknown): value is TaskList => {
  return Array.isArray(value) && value.every(isTask);
};
```

### 2.2 Create ID Generator (Test First!)

**tests/unit/utils/id.test.ts**:
```typescript
import { generateId } from '../../../src/utils/id';

describe('ID Generator', () => {
  it('should generate unique IDs', () => {
    const id1 = generateId();
    const id2 = generateId();

    expect(id1).not.toBe(id2);
    expect(typeof id1).toBe('string');
    expect(id1.length).toBeGreaterThan(0);
  });
});
```

**src/utils/id.ts**:
```typescript
import { TaskId } from '../types/task';

export const generateId = (): TaskId => {
  return crypto.randomUUID() as TaskId;
};
```

---

## Phase 3: TDD - Business Logic (Services)

### 3.1 Task Service (Test First!)

**tests/unit/services/taskService.test.ts**:
```typescript
import { addTask, updateTask, toggleTask, deleteTask } from '../../../src/services/taskService';
import { Task, TaskList } from '../../../src/types/task';

describe('taskService', () => {
  describe('addTask', () => {
    it('should add task to empty list', () => {
      const result = addTask([], 'Buy milk');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveLength(1);
        expect(result.value[0]?.title).toBe('Buy milk');
        expect(result.value[0]?.completed).toBe(false);
      }
    });

    it('should reject empty title', () => {
      const result = addTask([], '');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain('empty');
      }
    });

    it('should trim title', () => {
      const result = addTask([], '  Test  ');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value[0]?.title).toBe('Test');
      }
    });
  });

  describe('toggleTask', () => {
    it('should toggle completion status', () => {
      const tasks: TaskList = [{
        id: 'test-id' as TaskId,
        title: 'Test',
        completed: false,
        createdAt: 1000,
        updatedAt: 1000,
      }];

      const result = toggleTask(tasks, 'test-id' as TaskId);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value[0]?.completed).toBe(true);
        expect(result.value[0]?.updatedAt).toBeGreaterThan(1000);
      }
    });
  });
});
```

**src/services/taskService.ts**:
```typescript
import { Task, TaskId, TaskList } from '../types/task';
import { Result } from '../types/result';
import { generateId } from '../utils/id';

export const addTask = (tasks: TaskList, title: string): Result<TaskList> => {
  const trimmed = title.trim();

  if (trimmed === '') {
    return { ok: false, error: 'Title cannot be empty' };
  }

  if (trimmed.length > 500) {
    return { ok: false, error: 'Title cannot exceed 500 characters' };
  }

  const newTask: Task = {
    id: generateId(),
    title: trimmed,
    completed: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  return { ok: true, value: [...tasks, newTask] };
};

export const toggleTask = (tasks: TaskList, id: TaskId): Result<TaskList> => {
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return { ok: false, error: 'Task not found' };
  }

  const updated = tasks.map((t) =>
    t.id === id
      ? { ...t, completed: !t.completed, updatedAt: Date.now() }
      : t
  );

  return { ok: true, value: updated };
};

export const updateTask = (
  tasks: TaskList,
  id: TaskId,
  title: string
): Result<TaskList> => {
  const trimmed = title.trim();

  if (trimmed === '') {
    return { ok: false, error: 'Title cannot be empty' };
  }

  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return { ok: false, error: 'Task not found' };
  }

  const updated = tasks.map((t) =>
    t.id === id
      ? { ...t, title: trimmed, updatedAt: Date.now() }
      : t
  );

  return { ok: true, value: updated };
};

export const deleteTask = (tasks: TaskList, id: TaskId): Result<TaskList> => {
  const filtered = tasks.filter((t) => t.id !== id);
  return { ok: true, value: filtered };
};
```

---

## Phase 4: TDD - Redux Store

### 4.1 Redux Slice (Test First!)

**tests/unit/store/tasksSlice.test.ts**:
```typescript
import tasksReducer, { addTask, toggleTask } from '../../../src/store/slices/tasksSlice';
import { TaskListState } from '../../../src/types/state';

describe('tasksSlice', () => {
  const initialState: TaskListState = {
    items: [],
    filter: 'all',
    editingId: null,
  };

  describe('addTask', () => {
    it('should add task to state', () => {
      const action = addTask('Buy milk');
      const newState = tasksReducer(initialState, action);

      expect(newState.items).toHaveLength(1);
      expect(newState.items[0]?.title).toBe('Buy milk');
    });
  });

  describe('toggleTask', () => {
    it('should toggle task completion', () => {
      const stateWithTask: TaskListState = {
        ...initialState,
        items: [{
          id: 'test-id' as TaskId,
          title: 'Test',
          completed: false,
          createdAt: 1000,
          updatedAt: 1000,
        }],
      };

      const action = toggleTask('test-id' as TaskId);
      const newState = tasksReducer(stateWithTask, action);

      expect(newState.items[0]?.completed).toBe(true);
    });
  });
});
```

**src/store/slices/tasksSlice.ts**:
```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TaskListState } from '../../types/state';
import { TaskId } from '../../types/task';
import * as taskService from '../../services/taskService';

const initialState: TaskListState = {
  items: [],
  filter: 'all',
  editingId: null,
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addTask: (state, action: PayloadAction<string>) => {
      const result = taskService.addTask(state.items, action.payload);
      if (result.ok) {
        state.items = result.value;
      }
    },
    
    toggleTask: (state, action: PayloadAction<TaskId>) => {
      const result = taskService.toggleTask(state.items, action.payload);
      if (result.ok) {
        state.items = result.value;
      }
    },

    updateTask: (state, action: PayloadAction<{ id: TaskId; title: string }>) => {
      const { id, title } = action.payload;
      const result = taskService.updateTask(state.items, id, title);
      if (result.ok) {
        state.items = result.value;
      }
    },

    deleteTask: (state, action: PayloadAction<TaskId>) => {
      const result = taskService.deleteTask(state.items, action.payload);
      if (result.ok) {
        state.items = result.value;
      }
    },

    setFilter: (state, action: PayloadAction<TaskFilter>) => {
      state.filter = action.payload;
    },

    setEditingId: (state, action: PayloadAction<TaskId | null>) => {
      state.editingId = action.payload;
    },

    loadTasks: (state, action: PayloadAction<TaskList>) => {
      state.items = action.payload;
      state.filter = 'all';
      state.editingId = null;
    },

    clearCompleted: (state) => {
      state.items = state.items.filter((t) => !t.completed);
    },
  },
});

export const {
  addTask,
  toggleTask,
  updateTask,
  deleteTask,
  setFilter,
  setEditingId,
  loadTasks,
  clearCompleted,
} = tasksSlice.actions;

export default tasksSlice.reducer;
```

---

## Phase 5: TDD - React Components

### 5.1 TaskItem Component (Test First!)

**tests/integration/components/TaskItem.test.tsx**:
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskItem } from '../../../src/components/TaskItem';
import { TaskId } from '../../../src/types/task';

describe('TaskItem', () => {
  const mockProps = {
    id: 'test-id' as TaskId,
    title: 'Test Task',
    completed: false,
    onToggle: jest.fn(),
    onDelete: jest.fn(),
    onEdit: jest.fn(),
  };

  it('should render task title', () => {
    render(<TaskItem {...mockProps} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('should call onToggle when checkbox clicked', () => {
    render(<TaskItem {...mockProps} />);
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(mockProps.onToggle).toHaveBeenCalledWith('test-id');
  });

  it('should have accessible label', () => {
    render(<TaskItem {...mockProps} />);
    expect(screen.getByLabelText(/Mark.*Test Task.*as complete/i)).toBeInTheDocument();
  });
});
```

**src/components/TaskItem.tsx**:
```typescript
import { FC } from 'react';
import { TaskId } from '../types/task';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';

interface TaskItemProps {
  readonly id: TaskId;
  readonly title: string;
  readonly completed: boolean;
  readonly onToggle: (id: TaskId) => void;
  readonly onDelete: (id: TaskId) => void;
  readonly onEdit: (id: TaskId) => void;
}

export const TaskItem: FC<TaskItemProps> = ({
  id,
  title,
  completed,
  onToggle,
  onDelete,
  onEdit,
}) => (
  <div className="flex items-center gap-2 p-2 border-b">
    <Checkbox
      checked={completed}
      onCheckedChange={() => onToggle(id)}
      aria-label={`Mark "${title}" as ${completed ? 'incomplete' : 'complete'}`}
    />
    <span className={completed ? 'line-through text-gray-500' : ''}>
      {title}
    </span>
    <div className="ml-auto flex gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onEdit(id)}
        aria-label={`Edit "${title}"`}
      >
        Edit
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(id)}
        aria-label={`Delete "${title}"`}
      >
        Delete
      </Button>
    </div>
  </div>
);
```

---

## Phase 6: PWA Setup

### 6.1 Service Worker

**public/service-worker.js**:
```javascript
const CACHE_NAME = 'todo-pwa-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/index.css',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => 
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
});
```

### 6.2 Manifest

**public/manifest.json**:
```json
{
  "name": "TODO PWA",
  "short_name": "TODO",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "description": "Progressive Web App for task management",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 6.3 Register Service Worker

**src/main.tsx**:
```typescript
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(() => console.log('Service Worker registered'))
      .catch((error) => console.error('Service Worker failed:', error));
  });
}
```

---

## Phase 7: E2E Tests (Playwright)

**tests/e2e/task-creation.spec.ts**:
```typescript
import { test, expect } from '@playwright/test';

test('should create and display new task', async ({ page }) => {
  await page.goto('/');

  await page.fill('[aria-label="Task title"]', 'Buy groceries');
  await page.click('button:has-text("Add")');

  await expect(page.getByText('Buy groceries')).toBeVisible();
});

test('should prevent empty task creation', async ({ page }) => {
  await page.goto('/');

  await page.click('button:has-text("Add")');

  await expect(page.getByRole('alert')).toContainText('empty');
});
```

---

## Commands

```bash
# Development
npm run dev              # Start dev server

# Testing
npm test                 # Run unit + integration tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
npm run test:e2e         # Playwright E2E tests

# Linting
npm run lint             # ESLint check
npm run lint:fix         # Auto-fix issues
npm run format           # Prettier format

# Build
npm run build            # Production build
npm run preview          # Preview production build
```

---

## TDD Workflow

1. **Write test** (Red) → Test fails
2. **Implement code** (Green) → Test passes
3. **Refactor** → Improve code quality
4. **Repeat**

**Example Session**:
```bash
# 1. Write test
code tests/unit/services/taskService.test.ts

# 2. Run test (should fail)
npm test -- taskService

# 3. Implement service
code src/services/taskService.ts

# 4. Run test (should pass)
npm test -- taskService

# 5. Refactor if needed
npm run lint
npm run format

# 6. Move to next feature
```

---

## Next Steps

After completing this quickstart:

1. **Phase 2**: Break down into tasks using `/speckit.tasks` command
2. **Implementation**: Follow TDD for each task
3. **Code Review**: Use `code-reviewer` and `reviewer` agents
4. **Deploy**: Configure hosting (Netlify/Vercel) with HTTPS

---

**Status**: ✅ Complete - Ready for task breakdown and implementation
