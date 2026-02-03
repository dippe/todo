# Research: TODO PWA Application

**Branch**: `001-todo-pwa-app` | **Date**: 2026-02-03  
**Status**: Complete

## Overview

This document captures research findings, technology decisions, and best practices for implementing a TODO PWA application following strict functional programming principles, TDD methodology, and the project's constitutional requirements.

## Key Technology Decisions

### 1. State Management: Redux Toolkit with connect() HOC

**Decision**: Use Redux Toolkit with `connect()` HOC pattern instead of React hooks

**Rationale**:
- Aligns with project STANDARDS.md: "ZERO HOOKS" policy
- `connect()` is a Higher-Order Component (HOC), not a hook
- Provides unidirectional data flow (Flux architecture)
- Separates container logic from presentation components
- Enables pure functional components (props in, JSX out)
- Better testability through prop injection

**Alternatives Considered**:
- **React Context + useContext**: Rejected (uses hooks, violates STANDARDS.md)
- **useState/useReducer**: Rejected (hooks forbidden)
- **MobX**: Rejected (relies on classes and mutations, violates functional programming principles)
- **Zustand**: Rejected (uses hooks for consumption)

**Best Practices**:
- Create slices per feature domain using `createSlice()`
- Use `PayloadAction<T>` for type-safe actions
- Immutable updates only (spread operators, map/filter/reduce)
- Containers in `containers/` directory using `connect()`
- Pure components in `components/` directory
- Selectors for computed state (memoized with `createSelector`)

**References**:
- Redux Toolkit docs: https://redux-toolkit.js.org/
- connect() API: https://react-redux.js.org/api/connect

---

### 2. LocalStorage Persistence Strategy

**Decision**: Synchronous LocalStorage with Redux middleware for persistence

**Rationale**:
- Simple API, no dependencies
- Synchronous operations suitable for todo app scale
- ~5-10MB storage (sufficient for thousands of tasks)
- Automatic same-origin security
- Works offline by design
- Native browser API (no polyfills needed)

**Alternatives Considered**:
- **IndexedDB**: Rejected (overkill for simple key-value storage, async complexity)
- **In-memory only**: Rejected (requirement FR-006 requires persistence)
- **SessionStorage**: Rejected (clears on tab close, doesn't meet persistence requirement)
- **Third-party libraries (localForage)**: Rejected (adds dependency, violates simplicity principle)

**Implementation Pattern**:
```typescript
// Redux middleware approach
const localStorageMiddleware = (store: MiddlewareAPI) => 
  (next: Dispatch) => 
  (action: AnyAction) => {
    const result = next(action);
    const state = store.getState();
    localStorage.setItem('todos', JSON.stringify(state.tasks));
    return result;
  };

// Load on init
const preloadedState = {
  tasks: JSON.parse(localStorage.getItem('todos') || '{"items": []}')
};
```

**Best Practices**:
- Debounce writes (avoid write on every keystroke)
- Handle quota exceeded errors
- Validate/migrate data on load (schema versioning)
- Atomic updates (write complete state)
- Use JSON.stringify/parse for serialization

**Limitations**:
- ~5MB typical limit (varies by browser)
- Synchronous API blocks main thread (mitigate with debouncing)
- No encryption (data readable in DevTools)
- Cleared with browser cache (document for users)

---

### 3. PWA Architecture: Service Worker + Manifest

**Decision**: Custom service worker with cache-first strategy for static assets

**Rationale**:
- Meets FR-008, FR-012 (offline functionality)
- Cache-first ensures instant load times
- Full control over caching strategy (no Workbox complexity)
- Aligns with simplicity principle

**Service Worker Strategy**:
```javascript
// Cache static assets on install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => 
      cache.addAll([
        '/',
        '/index.html',
        '/main.js',
        '/styles.css',
        '/manifest.json'
      ])
    )
  );
});

// Cache-first for assets, network-first for data
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
```

**Manifest Requirements** (FR-009):
```json
{
  "name": "TODO PWA",
  "short_name": "TODO",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {"src": "/icon-192.png", "sizes": "192x192", "type": "image/png"},
    {"src": "/icon-512.png", "sizes": "512x512", "type": "image/png"}
  ]
}
```

**Alternatives Considered**:
- **Workbox**: Rejected (adds build complexity and dependencies)
- **Network-first strategy**: Rejected (requires network, defeats offline-first goal)
- **No service worker**: Rejected (fails FR-008, FR-012)

**Best Practices**:
- Version cache names for updates
- Clear old caches on activate
- Skip waiting for immediate updates
- Test offline scenarios (Playwright network throttling)
- Register service worker conditionally (dev vs prod)

---

### 4. Responsive Design: Tailwind CSS + shadcn/ui

**Decision**: Tailwind CSS utility-first approach with shadcn/ui components

**Rationale**:
- Constitution V mandates shadcn/ui for consistency
- Tailwind provides responsive utilities (sm, md, lg breakpoints)
- No custom CSS needed (aligns with simplicity)
- Tree-shaking removes unused styles
- Excellent mobile-first DX

**Breakpoint Strategy** (FR-007, FR-014):
```typescript
// Tailwind config
module.exports = {
  theme: {
    screens: {
      'sm': '640px',   // Mobile landscape
      'md': '768px',   // Tablet (FR-007 breakpoint)
      'lg': '1024px',  // Desktop
      'xl': '1280px',  // Large desktop
    }
  }
};

// Usage in components
<div className="
  flex flex-col md:flex-row
  space-y-4 md:space-y-0 md:space-x-4
  p-4 md:p-6
">
  {/* Stacks vertically on mobile, horizontally on desktop */}
</div>
```

**Touch Target Compliance** (FR-014):
```typescript
// Minimum 44x44px for touch targets (WCAG 2.1)
<button className="
  min-h-[44px] min-w-[44px]
  touch-manipulation
  active:scale-95
">
```

**shadcn/ui Components to Use**:
- `Button`: Primary actions (add, delete, edit)
- `Input`: Task text entry
- `Checkbox`: Task completion toggle
- `Card`: Task item container
- `Dialog`: Edit task modal
- `ScrollArea`: Task list scrolling

**Alternatives Considered**:
- **Custom CSS**: Rejected (violates Constitution V consistency requirement)
- **Material-UI**: Rejected (not specified in constitution, heavier bundle)
- **Bootstrap**: Rejected (not specified in constitution, jQuery legacy)

---

### 5. Testing Strategy: Jest + React Testing Library + Playwright

**Decision**: Three-tier testing approach with TDD methodology

**Rationale**:
- Constitution IV mandates TDD
- RTL encourages testing user behavior, not implementation
- Playwright provides cross-browser E2E coverage
- Jest provides excellent TS support and mocking

**Testing Pyramid**:
```text
     /\
    /E2E\    Playwright (10% - critical user flows)
   /------\
  /  INT   \  RTL + Redux (30% - container integration)
 /----------\
/    UNIT    \ Jest (60% - services, utils, pure functions)
```

**Unit Testing Pattern** (services/utils):
```typescript
// TDD: Write test FIRST
describe('taskService', () => {
  describe('addTask', () => {
    it('should add task to empty list', () => {
      const result = addTask([], 'Buy milk');
      expect(result.ok).toBe(true);
      expect(result.value).toHaveLength(1);
      expect(result.value[0].title).toBe('Buy milk');
    });

    it('should reject empty title', () => {
      const result = addTask([], '');
      expect(result.ok).toBe(false);
      expect(result.error).toBe('Title cannot be empty');
    });
  });
});
```

**Integration Testing Pattern** (containers):
```typescript
// Test Redux + Component integration
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

describe('TaskListContainer', () => {
  it('should display tasks from store', () => {
    const store = configureStore({
      reducer: { tasks: tasksReducer },
      preloadedState: {
        tasks: { items: [{ id: '1', title: 'Test', completed: false }] }
      }
    });

    render(
      <Provider store={store}>
        <TaskListContainer />
      </Provider>
    );

    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

**E2E Testing Pattern** (Playwright):
```typescript
test('should create and complete task', async ({ page }) => {
  await page.goto('/');
  
  // Create task
  await page.fill('[aria-label="Task input"]', 'Buy groceries');
  await page.click('[aria-label="Add task"]');
  
  // Verify created
  await expect(page.getByText('Buy groceries')).toBeVisible();
  
  // Complete task
  await page.click('[aria-label="Toggle Buy groceries"]');
  
  // Verify completed
  await expect(page.getByText('Buy groceries')).toHaveClass(/completed/);
});
```

**Best Practices**:
- Write tests BEFORE implementation (TDD)
- Use BDD naming: "should..." or "Given-When-Then"
- Test behavior, not implementation details
- Mock external dependencies (localStorage, timers)
- Aim for 100% coverage (minimum 90%)
- Run tests in CI/CD pipeline
- Use `data-testid` sparingly (prefer aria-labels)

**Alternatives Considered**:
- **Enzyme**: Rejected (deprecated, implementation-focused)
- **Cypress**: Rejected (slower than Playwright, less browser coverage)
- **Vitest**: Rejected (Jest more established, better ecosystem)

---

### 6. TypeScript Configuration: Strict Mode

**Decision**: Enable all strict type checking options

**Rationale**:
- STANDARDS.md mandates strict mode
- Catches errors at compile time
- Enforces explicit types (no implicit `any`)
- Improves code quality and maintainability

**tsconfig.json**:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  }
}
```

**Type Patterns**:
```typescript
// Result type for error handling (no exceptions)
type Result<T, E = string> = 
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

// Domain types (immutable)
interface Task {
  readonly id: string;
  readonly title: string;
  readonly completed: boolean;
  readonly createdAt: number;
  readonly updatedAt: number;
}

type TaskList = readonly Task[];

// Discriminated unions for state machines
type TaskFormState =
  | { readonly type: 'idle' }
  | { readonly type: 'editing'; readonly taskId: string }
  | { readonly type: 'creating' };
```

---

### 7. Code Quality Tools: ESLint + Prettier

**Decision**: ESLint with functional programming rules + Prettier for formatting

**Rationale**:
- Constitution III mandates linters
- Enforces STANDARDS.md rules automatically
- Catches violations in CI/CD
- Automates code formatting

**ESLint Configuration**:
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:functional/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "functional/no-let": "error",
    "functional/immutable-data": "error",
    "functional/no-loop-statement": "error",
    "functional/prefer-readonly-type": "error",
    "react-hooks/rules-of-hooks": "off",  // No hooks used
    "max-lines-per-function": ["error", 20],
    "max-params": ["error", 3],
    "complexity": ["error", 5]
  }
}
```

**Prettier Configuration**:
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

---

## Architecture Patterns

### Flux Unidirectional Data Flow

```text
┌─────────┐     dispatch      ┌─────────┐
│Component├──────────────────>│  Store  │
└─────────┘                   └────┬────┘
     ^                             │
     │                             │ state update
     │                             v
     │                        ┌────────┐
     └────────────────────────┤Selector│
          props via connect() └────────┘
```

### Component Architecture

```typescript
// Pure Component (presentation)
interface Props {
  readonly tasks: readonly Task[];
  readonly onToggle: (id: string) => void;
}

export const TaskList: FC<Props> = ({ tasks, onToggle }) => (
  <div>
    {tasks.map(task => (
      <TaskItem key={task.id} {...task} onToggle={onToggle} />
    ))}
  </div>
);

// Container (Redux connect)
const mapStateToProps = (state: RootState) => ({
  tasks: selectAllTasks(state),
});

const mapDispatchToProps = (dispatch: AppDispatch) => ({
  onToggle: (id: string) => dispatch(toggleTask(id)),
});

export const TaskListContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(TaskList);
```

### Service Layer (Pure Functions)

```typescript
// Pure business logic
export const addTask = (
  tasks: TaskList,
  title: string
): Result<TaskList> => {
  if (title.trim() === '') {
    return { ok: false, error: 'Title cannot be empty' };
  }

  const newTask: Task = {
    id: generateId(),
    title: title.trim(),
    completed: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  return { ok: true, value: [...tasks, newTask] };
};
```

---

## Performance Considerations

### Bundle Size Optimization
- Tree-shaking (ES modules)
- Code splitting (React.lazy for routes)
- Minification (Vite production build)
- Compression (gzip/brotli on server)
- Target: <200KB initial bundle

### Runtime Performance
- Memoization with `createSelector` (Redux)
- Virtual scrolling for large lists (>100 tasks)
- Debounce localStorage writes (300ms)
- Avoid re-renders with `React.memo`
- Target: <200ms UI response (FR constraint)

### Load Performance
- Service worker cache-first strategy
- Preload critical resources
- Lazy load non-critical code
- Target: <2s load on 3G (SC-002)

---

## Accessibility Requirements

### WCAG AA Compliance
- Semantic HTML (button, input, nav, main)
- ARIA labels for all interactive elements
- Keyboard navigation (Tab, Enter, Escape)
- Focus indicators (visible outline)
- Color contrast 4.5:1 minimum
- Touch targets 44x44px minimum (FR-014)
- Screen reader tested (NVDA, VoiceOver)

### Example Implementation
```typescript
<button
  onClick={() => onToggle(id)}
  aria-label={`Mark "${title}" as ${completed ? 'incomplete' : 'complete'}`}
  className="min-h-[44px] min-w-[44px] focus:outline-2 focus:outline-blue-500"
>
  {completed ? '✓' : '○'}
</button>
```

---

## Security Considerations

### Client-Side Security
- XSS prevention (React escapes by default)
- Content Security Policy (CSP) headers
- No eval() or dangerouslySetInnerHTML
- Validate all user input (max length, sanitization)
- LocalStorage same-origin policy (automatic)

### PWA Security
- HTTPS required for service worker
- Manifest scope restrictions
- Subresource Integrity (SRI) for CDN assets

---

## Edge Cases & Error Handling

### Storage Limits
- Detect quota exceeded: `try/catch` on `localStorage.setItem`
- Warn user when approaching limit
- Provide export/clear data options

### Multi-Tab Sync
- Listen to `storage` event: `window.addEventListener('storage', ...)`
- Update Redux state when other tabs modify data
- Handle conflicts (last-write-wins strategy)

### Data Migration
- Version localStorage schema: `{ version: 1, data: {...} }`
- Migrate on load if version mismatch
- Fallback to defaults on parse errors

### Network Edge Cases
- Service worker updates (bypass cache on new version)
- Handle service worker registration failures gracefully
- Test offline scenarios extensively

---

## Development Workflow

### TDD Red-Green-Refactor
1. **Red**: Write failing test
2. **Green**: Implement minimal code to pass
3. **Refactor**: Improve code quality
4. **Repeat**: Next test

### Git Workflow
1. Branch from main: `001-todo-pwa-app`
2. Feature branches: `001-todo-pwa-app/task-creation`
3. PR to main with review
4. Squash merge after approval

### Commands
```bash
npm test          # Run all tests
npm run lint      # ESLint check
npm run format    # Prettier format
npm run build     # Production build
npm run preview   # Test production build
```

---

## Complexity Tracking

No violations of Constitution found. All requirements align with simplicity and functional programming principles.

---

## Open Questions

None - all technical context clarified in plan.md.

---

## References

- [Redux Toolkit Best Practices](https://redux-toolkit.js.org/usage/usage-guide)
- [PWA Service Worker Guide](https://web.dev/service-workers-cache-storage/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [TypeScript Strict Mode](https://www.typescriptlang.org/tsconfig#strict)

---

**Status**: ✅ Complete - All technology decisions documented, no clarifications needed
