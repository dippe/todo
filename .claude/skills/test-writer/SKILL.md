---
name: test-writer
description: Use when writing tests, implementing TDD, or creating test coverage. This skill helps write comprehensive unit, integration, and E2E tests.
---

# Test Writer

**READ**: `.claude/skills/standards/SKILL.md` for TDD/React/Redux rules

## TDD Cycle (MANDATORY)

1. **Red**: Write failing test first
2. **Green**: Minimal code to pass
3. **Refactor**: Improve while tests green

## Test Structure (AAA)

```typescript
describe('Feature', () => {
  it('should do X when Y', () => {
    // Arrange
    const input = testData();

    // Act
    const result = fn(input);

    // Assert
    expect(result).toEqual(expected);
  });
});
```

## Coverage

- 100% goal (lines, branches, functions)
- Edge cases: empty, null, undefined, boundaries
- Error paths: exceptions, validation failures
- Happy paths: expected flows

## Naming

"should..." format or Given-When-Then

## Component Tests (NO HOOKS)

```typescript
// Pure component
it('should render title', () => {
  render(<TodoItem title="Test" onToggle={jest.fn()} />);
  expect(screen.getByText('Test')).toBeInTheDocument();
});

// Container (connect() HOC)
it('should connect to Redux', () => {
  const store = mockStore({ todos: [todo] });
  render(<Provider store={store}><Container /></Provider>);
  expect(screen.getByText(todo.title)).toBeInTheDocument();
});
```

## Patterns

- Test builders for data
- Mock at boundaries only
- Test behavior not implementation
- Independent tests (no shared state)
