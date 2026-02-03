# todo2 Development Guidelines

**READ FIRST**: `.opencode/agents/STANDARDS.md` for coding rules

## Tech Stack

- TypeScript 5.x / JavaScript ES2022
- React 18+ with Flux (Redux Toolkit + connect() HOC)
- shadcn/ui for UI components

## Project Structure

```text
src/
  components/    # Pure UI (NO HOOKS)
  containers/    # connect() HOC
  store/         # Redux Toolkit slices
    slices/
    store.ts
  utils/         # Pure functions
  types/         # TypeScript types
  services/      # Business logic
tests/
  unit/
  integration/
.opencode/
  agents/        # Specialized agents
    STANDARDS.md # Common coding rules
```

## Commands

```bash
npm test && npm run lint
```

## Core Principles

1. **TDD**: Tests before implementation
2. **Functional**: Pure functions, immutability, no side effects
3. **SOLID**: Single responsibility, dependency inversion
4. **No Hooks**: Redux + connect() HOC only
5. **Type Safety**: Strict TypeScript, no `any`
6. **Flux**: Unidirectional data flow

See `STANDARDS.md` for detailed rules.

## Specialized Agents

### Core Development
- **test-writer**: Write tests BEFORE code (TDD)
- **logic-writer**: Business logic (pure functions)
- **ui-writer**: React components (shadcn/ui, accessibility)
- **test-runner**: Execute tests, analyze failures
- **bugfixer**: Fix bugs systematically
- **code-reviewer**: Review quality, standards compliance
- **reviewer**: Validate architecture (SOLID, Flux)

### Supporting
- **refactorer**: Improve code quality (test-driven)
- **documentation-writer**: TSDoc, README, ADRs

## TDD Workflow

```bash
# 1. Write test (Red)
test-writer agent

# 2. Run test (should fail)
test-runner agent

# 3. Implement code (Green)
logic-writer or ui-writer agent

# 4. Run test (should pass)
test-runner agent

# 5. Refactor
refactorer agent

# 6. Review
code-reviewer agent
reviewer agent
```

## Quality Metrics

- **Coverage**: 100% goal (min 90%)
- **Function length**: Max 20 lines (15 preferred)
- **Parameters**: Max 3
- **Complexity**: Max 5
- **No duplication**: DRY

See `STANDARDS.md` for violations/patterns.

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->

## Active Technologies
- TypeScript 5.x (strict mode), JavaScript ES2022 + React 18+, Redux Toolkit, shadcn/ui, Tailwind CSS (001-todo-pwa-app)
- Browser LocalStorage for persistence (in-memory runtime with sync to LocalStorage) (001-todo-pwa-app)

## Recent Changes
- 001-todo-pwa-app: Added TypeScript 5.x (strict mode), JavaScript ES2022 + React 18+, Redux Toolkit, shadcn/ui, Tailwind CSS
