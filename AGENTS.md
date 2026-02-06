# todo2 Development Guidelines

**READ FIRST**: `.opencode/agents/standards/STANDARDS.md` for coding rules

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
  unit/          # Pure function tests
  integration/   # Component + Redux tests
  e2e/           # Playwright E2E tests
.opencode/
  agents/        # Specialized agents
    standards/   # Common standards
      STANDARDS.md # Common coding rules
      E2E-TESTING.md # E2E patterns
      COMMON-TESTING.md # Shared testing patterns
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

See `standards/STANDARDS.md` for detailed rules.

## How to Use Subagents

**Subagents are specialized tools for specific tasks. Use the Task tool to invoke them.**

### When to Use Subagents

Use subagents for:

- Writing tests (unit/integration/E2E)
- Writing code (logic/UI)
- Running tests (unit/integration/E2E)
- Fixing bugs
- Refactoring
- Code review
- Documentation

### How to Invoke

```typescript
// Use Task tool with subagent_type
task({
  subagent_type: 'test-writer',
  prompt: 'Write unit tests for addTodo function in taskService.ts',
  description: 'Write tests for addTodo',
});
```

### Subagent Selection Guide

**For writing tests:**

- `test-writer` - Unit/integration tests (Jest, React Testing Library)
- `e2e-test-writer` - End-to-end tests (Playwright)

**For running tests:**

- `test-runner` - Execute unit/integration tests, analyze failures
- `e2e-test-runner` - Execute E2E tests with Playwright MCP (token-efficient debugging)

**For writing code:**

- `logic-writer` - Pure functions, services, utilities (NO UI, NO I/O)
- `ui-writer` - React components, shadcn/ui (NO logic, props only)

**For fixing bugs:**

- `bugfixer` - Debug and fix test failures, runtime errors

**For improving code:**

- `refactorer` - Improve structure while keeping tests green

**For review:**

- `code-reviewer` - Quality, standards, maintainability
- `reviewer` - Architecture (SOLID, Flux, system design)

**For documentation:**

- `documentation-writer` - TSDoc, README, ADRs

**For project management:**

- `github` - Create, update, close issues and manage implementation workflow

## Complete Subagent List

### Core Development

| Subagent            | Use When                                                                              | Input                                                                 | Output                                    |
| ------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------- |
| **test-writer**     | Creating unit or integration tests for logic or components (Jest/RTL)                 | Source file path, function signature, or feature requirement          | `.test.ts` files with Jest tests          |
| **e2e-test-writer** | Creating end-to-end user flow tests (Playwright)                                      | User story, flow steps, or behavior description                       | `.spec.ts` files with Playwright tests    |
| **logic-writer**    | Implementing business logic, services, utilities, or algorithms. **NO UI generation** | Requirements, type definitions, or test cases                         | Pure functions, services, types           |
| **ui-writer**       | Implementing React UI components using shadcn/ui. **NO business logic**               | Visual design description, props interface, or component requirements | Functional components (NO HOOKS)          |
| **test-runner**     | Executing Jest unit/integration tests to verify logic/components                      | Test file path(s) or "all"                                            | Pass/fail report, coverage, root causes   |
| **e2e-test-runner** | Executing Playwright E2E tests using MCP tools for debugging                          | E2E test file path(s) or "all"                                        | Pass/fail report, MCP debugging output    |
| **bugfixer**        | Resolving test failures, runtime errors, or specific bugs                             | Error message, failing test output, or bug description + file path    | Fixed code, passing tests                 |
| **code-reviewer**   | General code quality check, style enforcement, and best practices review              | File path(s) or git diff                                              | Quality assessment, issues, suggestions   |
| **reviewer**        | High-level architectural validation, SOLID/Flux compliance, and design pattern check  | File path(s) or system design description                             | Architecture assessment, SOLID violations |

### Supporting

| Subagent                 | Use When                                                                                     | Input                                                         | Output                            |
| ------------------------ | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | --------------------------------- |
| **refactorer**           | Restructuring existing code without changing behavior (e.g., extraction, simplification)     | File path(s) and refactoring goal (e.g. "extract function")   | Refactored code, tests still pass |
| **documentation-writer** | Generating comments, READMEs, or architectural records (ADRs)                                | Source code file, feature description, or undocumented module | TSDoc, README, ADRs               |
| **github**               | Managing GitHub issues: create (with spec), implement (read issue+spec), close (commit+push) | Action (create/implement/close) + Issue ID/Details            | GitHub issue updates, commits     |

## Important Rules for LLMs

1. **ALWAYS use subagents for their specialized tasks** - Don't write tests/code directly when a subagent exists
2. **Use Task tool with subagent_type parameter** - Don't invoke subagents any other way
3. **Follow TDD workflow** - Test subagents BEFORE code subagents
4. **Use e2e-test-runner with Playwright MCP** - NOT bash screenshots (token-efficient)
5. **One task per subagent** - Don't ask one subagent to do another's job
6. **Provide clear, specific prompts** - Include file paths, function names, requirements
7. **Check subagent output** - Verify work before proceeding to next step
8. **Minimize token usage** - DECREASE token usage if possible. Every output generated for the end user (e.g. summary at the end) should be minimized using short bullet point lists with minimal details. This is a CORE RULE.

## TDD Workflow

### For Features with UI (E2E + Unit/Integration)

```bash
# 1. Write E2E test (Red)
e2e-test-writer agent

# 2. Run E2E test (should fail)
e2e-test-runner agent

# 3. Write unit/integration tests (Red)
test-writer agent

# 4. Run unit/integration tests (should fail)
test-runner agent

# 5. Implement code (Green)
logic-writer or ui-writer agent

# 6. Run all tests (should pass)
test-runner agent
e2e-test-runner agent

# 7. Refactor
refactorer agent

# 8. Review
code-reviewer agent
reviewer agent

# 9. task and issue updater
check the specification checklist and github issue content. validate and update those.

```

### For Logic-Only Features (Unit/Integration)

```bash
# 1. Write test (Red)
test-writer agent

# 2. Run test (should fail)
test-runner agent

# 3. Implement code (Green)
logic-writer agent

# 4. Run test (should pass)
test-runner agent

# 5. Refactor
refactorer agent

# 6. Review
code-reviewer agent
reviewer agent

# 7. task and issue updater
check the specification checklist and github issue content. validate and update those.

```

## Quality Metrics

- **Coverage**: 100% goal (min 90%)
- **Function length**: Max 20 lines (15 preferred)
- **Parameters**: Max 3
- **Complexity**: Max 5
- **No duplication**: DRY

See `standards/STANDARDS.md` for violations/patterns.

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->

## Active Technologies

- TypeScript 5.x (strict mode), JavaScript ES2022 + React 18+, Redux Toolkit, shadcn/ui, Tailwind CSS (001-todo-pwa-app)
- Browser LocalStorage for persistence (in-memory runtime with sync to LocalStorage) (001-todo-pwa-app)

## Recent Changes

- 001-todo-pwa-app: Added TypeScript 5.x (strict mode), JavaScript ES2022 + React 18+, Redux Toolkit, shadcn/ui, Tailwind CSS
