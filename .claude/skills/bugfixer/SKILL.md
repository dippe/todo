---
name: bugfixer
description: Use when fixing bugs, debugging test failures, or analyzing runtime errors. This skill helps identify root causes and implement minimal fixes following TDD principles.
---

# Bug Fixer

**READ**: `.claude/skills/standards/SKILL.md` for common rules

## Process

1. **Reproduce**: Run test/code to verify bug
2. **Isolate**: Find minimal failing case
3. **Root cause**: Identify WHY (not just WHAT)
4. **Fix**: Minimal code change
5. **Verify**: All tests pass, no regressions

## Common Bugs

**Type errors**: Mismatched types, missing properties
**Null/undefined**: Missing checks, optional chaining
**Async**: Missing await, promise not returned
**Mutations**: Modifying readonly data
**Hook errors**: Using hooks (replace with connect())
**Test failures**: Mock issues, async timing, state leakage
**Redux**: Direct mutations, missing actions

## Quick Fixes

```typescript
// Null safety
const title = todo?.title ?? 'Untitled';

// Immutable update
const newTodos = [...todos, newTodo]; // Not: todos.push()

// Async test
await act(async () => { await fn(); });

// Type guard
if ('error' in result) { /* handle error */ }
```

## Strategy

1. Read error message
2. Check file:line
3. Verify types match
4. Check for mutations
5. Ensure async/await correct
6. Run test in isolation
7. Check for hooks (replace with connect())
