<!--
Sync Impact Report
==================
Version change: N/A → 1.0.0 (Initial creation)
Modified principles: None (new file)
Added sections: All (new file)
Removed sections: None
Templates requiring updates:
  - .specify/templates/plan-template.md: ✅ Compatible (Constitution Check section present)
  - .specify/templates/spec-template.md: ✅ Compatible (Requirements section aligns)
  - .specify/templates/tasks-template.md: ✅ Compatible (Phase structure supports TDD)
Follow-up TODOs: None
-->

# todo2 Constitution

## Core Principles

### I. Test-First Development (NON-NEGOTIABLE)

Tests MUST be written before implementation. The Red-Green-Refactor cycle is strictly enforced:

- Write failing tests first
- Obtain user approval of tests
- Verify tests fail (red)
- Implement minimum code to pass (green)
- Refactor while keeping tests green

**Rationale**: TDD ensures code is testable, reduces bugs, and provides living documentation of expected behavior.

### II. Functional Programming

All code MUST follow functional programming principles:

- Pure functions only (no side effects)
- `const` only (never `let`/`var`)
- Immutable operations (spread, map/filter/reduce)
- No loops (for/while) - use array methods
- No mutations
- No classes for business logic

**Rationale**: Functional code is easier to test, reason about, and debug. It eliminates an entire class of bugs related to mutable state.

### III. SOLID Principles

Code MUST adhere to SOLID principles:

- **Single Responsibility**: Each module/function has one purpose
- **Open/Closed**: Extend behavior without modifying existing code
- **Liskov Substitution**: Subtypes must be substitutable for base types
- **Interface Segregation**: Many specific interfaces over one general-purpose interface
- **Dependency Inversion**: Depend on abstractions, not concretions

**Rationale**: SOLID principles produce maintainable, extensible, and loosely coupled code.

### IV. No Hooks Architecture

React components MUST NOT use hooks. Instead:

- Functional components only
- **ZERO HOOKS**: No useState, useEffect, useContext, useCallback, useMemo, custom hooks
- **Exception**: React.memo only (HOC, not hook)
- Props only, no internal component state
- connect() HOC for containers
- Pure functions of props

**Rationale**: Hooks introduce implicit complexity and make data flow harder to trace. The connect() HOC pattern provides explicit, testable data flow.

### V. Type Safety

TypeScript MUST be used in strict mode with no exceptions:

- Strict mode enabled
- No `any` (use `unknown` + type guards)
- Explicit return types for public APIs
- `readonly` for immutability
- Discriminated unions for state machines

**Rationale**: Type safety catches errors at compile time, improves IDE support, and serves as documentation.

### VI. Flux Architecture

State management MUST follow unidirectional data flow:

- Redux Toolkit for state management
- Slices define state shape and reducers
- Actions describe state changes
- Selectors for derived state
- connect() HOC connects components to store

**Rationale**: Unidirectional data flow makes state changes predictable and debuggable.

## Technology Constraints

### Approved Stack

- **Language**: TypeScript 5.x (strict mode), JavaScript ES2022
- **UI Framework**: React 18+
- **State Management**: Redux Toolkit with connect() HOC
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Persistence**: Browser LocalStorage (in-memory runtime with sync)

### Quality Metrics

| Metric | Requirement | Preferred |
|--------|-------------|-----------|
| Test Coverage | 90% minimum | 100% |
| Function Length | Max 20 lines | 15 lines |
| Parameters | Max 3 | Use objects for more |
| Cyclomatic Complexity | Max 5 | Lower |
| Duplication | None | DRY |

### Common Violations (FORBIDDEN)

- ❌ Hooks (useState, useEffect, etc.)
- ❌ Mutations (array.push, obj.prop = x)
- ❌ Loops (for, while)
- ❌ `any` types
- ❌ Classes for business logic
- ❌ Internal component state
- ❌ Functions > 20 lines

## Development Workflow

### Git Workflow

- **Main Branch**: `main_glm` - Target for all modifications
- **Feature Branches**: Create from `main_glm`, merge back to `main_glm`
- **Commit Frequency**: After each task or logical group

### Quality Gates

1. **Pre-Implementation**: Tests written and failing
2. **Implementation**: Code passes all tests
3. **Pre-Commit**: `npm test && npm run lint` passes
4. **Pre-Merge**: All quality gates passed on feature branch

### Project Structure

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
```

## Governance

### Amendment Procedure

1. Propose amendment with rationale
2. Document impact on existing code
3. Update constitution with version bump
4. Propagate changes to dependent templates
5. Update affected documentation

### Versioning Policy

- **MAJOR**: Backward incompatible governance/principle removals or redefinitions
- **MINOR**: New principle/section added or materially expanded guidance
- **PATCH**: Clarifications, wording, typo fixes, non-semantic refinements

### Compliance Review

All code changes MUST be verified against this constitution:

- PRs must reference which principles are satisfied
- Complexity violations must be justified in Complexity Tracking table
- Use `STANDARDS.md` for detailed coding rules and patterns

**Version**: 1.0.0 | **Ratified**: 2026-02-16 | **Last Amended**: 2026-02-16
