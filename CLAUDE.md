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

## Quality Metrics

- **Coverage**: 100% goal (min 90%)
- **Function length**: Max 20 lines (15 preferred)
- **Parameters**: Max 3
- **Complexity**: Max 5
- **No duplication**: DRY

See `STANDARDS.md` for violations/patterns.

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->

## Git Workflow

- **Main Branch**: `main_glm` - This is the target branch for all modifications
- **Feature Branches**: Create from `main_glm`, merge back to `main_glm`
- **Current Feature**: `001-todo-pwa-app` - TODO PWA Application

## Active Technologies
- TypeScript 5.x (strict mode), JavaScript ES2022 + React 18+, Redux Toolkit, shadcn/ui, Tailwind CSS (001-todo-pwa-app)
- Browser LocalStorage for persistence (in-memory runtime with sync to LocalStorage) (001-todo-pwa-app)

## Recent Changes
- 001-todo-pwa-app: Added TypeScript 5.x (strict mode), JavaScript ES2022 + React 18+, Redux Toolkit, shadcn/ui, Tailwind CSS
