# todo2 Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-02-03

## Active Technologies

- TypeScript 5.x / JavaScript ES2022 (001-todo-pwa-responsive)
- React 18+ with Flux architecture (Zustand for state management)
- shadcn/ui for UI components

## Project Structure

```text
src/
  components/    # React UI components (presentational, props-only)
  containers/    # HOC containers connecting Flux state to components
  store/         # Zustand store definitions (Flux state management)
  utils/         # Pure utility functions
  types/         # TypeScript type definitions
  services/      # Business logic (pure functions)
tests/
  unit/          # Unit tests (TDD/BDD)
  integration/   # Integration tests
.opencode/
  agents/        # Specialized development agents
```

## Commands

npm test && npm run lint

## Development Philosophy

### Core Principles (MANDATORY)
1. **Test-Driven Development (TDD)**: Write tests before implementation
2. **Functional Programming**: Pure functions, immutability, no side effects
3. **SOLID Principles**: Single responsibility, dependency inversion, etc.
4. **Minimal State**: Components use props, state lifted to containers
5. **Type Safety**: Strict TypeScript, no `any` types
6. **Flux Architecture**: Unidirectional data flow for state management

## Code Style

TypeScript 5.x / JavaScript ES2022: Follow standard conventions

### TypeScript Standards
- Strict mode enabled
- No `any` types (use `unknown` + type guards)
- Explicit return types for public APIs
- Readonly properties for immutability
- Discriminated unions for state machines
- Branded types for domain IDs

### Functional Programming
- All functions must be pure (no side effects)
- Use `const`, never `let` or `var`
- Immutable data structures (`readonly`, `Readonly<T>`)
- Prefer `map`, `filter`, `reduce` over loops
- Function composition over inheritance
- No classes for business logic (functions + data)

### React Components
- Functional components only (no class components)
- **Presentational components**: Pure, stateless, receive all data via props
- **Container components**: HOCs that connect Flux state to presentational components
- **NO useEffect**: Side effects belong in services, not components
- **Minimal hooks**: Avoid useState, useEffect; prefer props and HOC containers
- **Allowed hooks**: Only React.memo for performance, useCallback/useMemo sparingly
- Destructure props immediately
- Use TypeScript interfaces for props
- shadcn/ui for UI components

### Flux State Management (Zustand)
- **Unidirectional data flow**: Actions → Store → Containers → Components
- **Store structure**: Pure reducer functions, immutable state updates
- **Container pattern**: HOCs subscribe to store, pass data as props to components
- **No component state**: Lift all state to Flux store via containers
- **Selectors**: Use pure selector functions for derived state
- **Actions**: Pure functions that return new state
- **Example pattern**:
  ```typescript
  // Store (src/store/todoStore.ts)
  const useTodoStore = create<TodoState>((set) => ({
    todos: [],
    addTodo: (todo) => set((state) => ({ todos: [...state.todos, todo] }))
  }))
  
  // Container (src/containers/TodoListContainer.tsx)
  const TodoListContainer = () => {
    const { todos, addTodo } = useTodoStore()
    return <TodoList todos={todos} onAddTodo={addTodo} />
  }
  
  // Component (src/components/TodoList.tsx)
  interface TodoListProps {
    todos: Todo[]
    onAddTodo: (todo: Todo) => void
  }
  const TodoList = ({ todos, onAddTodo }: TodoListProps) => (...)
  ```

### Testing
- Write tests BEFORE implementation (TDD)
- BDD naming: "should..." or "Given-When-Then"
- 100% code coverage goal
- Test edge cases and error paths
- Use Result types for error handling

## Specialized Agents

This project uses specialized agents for different development tasks. Each agent follows strict best practices and ensures code quality.

### Core Development Agents

#### 1. code-reviewer
**Purpose**: Reviews code for quality, best practices, and architectural compliance  
**When to use**: After writing code, before committing  
**Focus**: Type safety, functional programming, SOLID principles, test coverage  
**File**: `.opencode/agents/code-reviewer.md`

#### 2. test-writer
**Purpose**: Writes comprehensive tests following TDD/BDD practices  
**When to use**: BEFORE writing implementation code  
**Focus**: Unit tests, integration tests, edge cases, 100% coverage  
**File**: `.opencode/agents/test-writer.md`

#### 3. ui-writer
**Purpose**: Creates React components using shadcn/ui with minimal state  
**When to use**: When building UI components  
**Focus**: Functional components, props over state, accessibility, shadcn patterns  
**File**: `.opencode/agents/ui-writer.md`

#### 4. logic-writer
**Purpose**: Implements business logic using functional programming  
**When to use**: When writing domain logic, utilities, or services  
**Focus**: Pure functions, immutability, Result types, function composition  
**File**: `.opencode/agents/logic-writer.md`

#### 5. test-runner
**Purpose**: Executes tests and analyzes results with detailed reporting  
**When to use**: To run test suites and identify failures  
**Focus**: Test execution, failure analysis, coverage reporting, root cause identification  
**File**: `.opencode/agents/test-runner.md`

#### 6. bugfixer
**Purpose**: Fixes test failures and runtime bugs systematically  
**When to use**: When tests fail or bugs are discovered  
**Focus**: Root cause analysis, TDD bug fixing, regression prevention  
**File**: `.opencode/agents/bugfixer.md`

#### 7. reviewer
**Purpose**: Validates architectural patterns and design principles  
**When to use**: For architectural reviews and design validation  
**Focus**: SOLID principles, Flux architecture, functional patterns, system design  
**File**: `.opencode/agents/reviewer.md`

### Supporting Agents

#### 8. refactorer
**Purpose**: Improves code quality while maintaining functionality  
**When to use**: To clean up code, remove smells, improve structure  
**Focus**: Test-driven refactoring, code smells, functional patterns  
**File**: `.opencode/agents/refactorer.md`

#### 9. documentation-writer
**Purpose**: Creates clear, maintainable technical documentation  
**When to use**: To document APIs, components, or architectural decisions  
**Focus**: TSDoc, README files, ADRs, examples  
**File**: `.opencode/agents/documentation-writer.md`

## Development Workflow

### 1. Feature Development (TDD Approach)
```bash
# Step 1: Write tests first
# Use: test-writer agent

# Step 2: Run tests (should fail - Red phase)
# Use: test-runner agent

# Step 3: Implement minimal code (Green phase)
# Use: logic-writer or ui-writer agent

# Step 4: Run tests again (should pass)
# Use: test-runner agent

# Step 5: Refactor while keeping tests green
# Use: refactorer agent

# Step 6: Review code quality
# Use: code-reviewer agent

# Step 7: Validate architecture
# Use: reviewer agent
```

### 2. Bug Fixing
```bash
# Step 1: Run tests to reproduce bug
# Use: test-runner agent

# Step 2: Write failing test that captures bug
# Use: test-writer agent

# Step 3: Fix the bug
# Use: bugfixer agent

# Step 4: Verify tests pass
# Use: test-runner agent

# Step 5: Review fix
# Use: code-reviewer agent
```

### 3. Code Review
```bash
# Step 1: Review code quality
# Use: code-reviewer agent

# Step 2: Validate architecture
# Use: reviewer agent

# Step 3: Check test coverage
# Use: test-runner agent
```

## Quality Standards

### Code Quality Metrics
- **Test Coverage**: 100% goal (minimum 90%)
- **Function Length**: Max 20 lines (15 preferred)
- **Parameters**: Max 3 (use object parameter for more)
- **Cyclomatic Complexity**: Max 5
- **No magic numbers**: Extract to named constants
- **No code duplication**: DRY principle

### Performance Standards
- **Bundle size**: Monitor and optimize
- **Component re-renders**: Minimize with memoization
- **Test speed**: Unit tests < 100ms each
- **Build time**: Keep under 30 seconds

## Recent Changes

- 001-todo-pwa-responsive: Added TypeScript 5.x / JavaScript ES2022
- 2026-02-03: Created specialized development agents for TDD/FP workflow

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
