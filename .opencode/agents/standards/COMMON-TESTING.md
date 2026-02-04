# Common Testing Patterns

**Shared testing concepts referenced by test-writer, e2e-test-writer, and test-runner agents.**

## TDD Cycle (MANDATORY for ALL test types)

1. **Red**: Write failing test first
2. **Green**: Minimal code to pass
3. **Refactor**: Improve while tests green

**Tests are ALWAYS written BEFORE implementation.**

## Test Structure (AAA / Given-When-Then)

```typescript
describe('Feature', () => {
  it('should do X when Y', () => {
    // Arrange / Given
    const input = setupTestData();

    // Act / When
    const result = functionUnderTest(input);

    // Assert / Then
    expect(result).toEqual(expected);
  });
});
```

## Naming Conventions

Use "should..." format or Given-When-Then:

```typescript
// ✅ Good
test('should return success when input is valid');
test('should throw error when input is null');
test('Given empty array, When adding item, Then array has one item');

// ❌ Bad
test('test1');
test('check function');
test('it works');
```

## Coverage Requirements

All test types must cover:

- **Happy paths**: Expected successful flows
- **Edge cases**: Empty, null, undefined, boundaries (min/max), whitespace
- **Error paths**: Exceptions, validation failures, invalid input
- **State changes**: Before/after comparison
- **Persistence**: Data survives reload/restart (where applicable)

## Test Independence

```typescript
// ✅ Good - Independent
test('should add item', () => {
  const list = [];
  const result = addItem(list, 'test');
  expect(result).toHaveLength(1);
});

test('should remove item', () => {
  const list = ['test'];
  const result = removeItem(list, 'test');
  expect(result).toHaveLength(0);
});

// ❌ Bad - Shared state
let sharedList = [];

test('should add item', () => {
  sharedList = addItem(sharedList, 'test');
  expect(sharedList).toHaveLength(1);
});

test('should remove item', () => {
  // Depends on previous test!
  sharedList = removeItem(sharedList, 'test');
  expect(sharedList).toHaveLength(0);
});
```

## Test Organization

### Unit Tests

```
tests/unit/
  utils/
    date.test.ts
    id.test.ts
  services/
    taskService.test.ts
  types/
    result.test.ts
```

### Integration Tests

```
tests/integration/
  TaskListContainer.test.tsx
  TaskFormContainer.test.tsx
```

### E2E Tests

```
tests/e2e/
  task-creation.spec.ts
  task-editing.spec.ts
  offline.spec.ts
```

## Quality Metrics

- **Coverage**: 100% goal (90% minimum)
  - Lines covered
  - Branches covered (if/else, switch, ternary)
  - Functions covered
- **Speed**: Fast feedback
  - Unit: <1ms per test
  - Integration: <100ms per test
  - E2E: <5s per test
- **Reliability**: Zero flaky tests
  - Deterministic (same input = same output)
  - No race conditions
  - No shared state
  - No dependencies on external services (mock them)

## Anti-Patterns

❌ **Test implementation, not behavior**

```typescript
// Bad - testing implementation
expect(component.state.isLoading).toBe(true);

// Good - testing behavior
expect(screen.getByText('Loading...')).toBeVisible();
```

❌ **Shared mutable state**

```typescript
// Bad
let count = 0;
test('test 1', () => {
  count++;
});
test('test 2', () => {
  count++;
}); // Depends on test 1

// Good
test('test 1', () => {
  let count = 0;
  count++;
  expect(count).toBe(1);
});
test('test 2', () => {
  let count = 0;
  count++;
  expect(count).toBe(1);
});
```

❌ **Too many assertions in one test**

```typescript
// Bad - multiple unrelated assertions
test('user operations', () => {
  expect(createUser()).toBeDefined();
  expect(deleteUser()).toBeTruthy();
  expect(updateUser()).toEqual({});
  expect(listUsers()).toHaveLength(0);
});

// Good - one concept per test
test('should create user', () => {
  expect(createUser()).toBeDefined();
});

test('should delete user', () => {
  expect(deleteUser()).toBeTruthy();
});
```

❌ **No test isolation (setup/teardown missing)**

```typescript
// Bad - state leaks between tests
test('test 1', () => {
  localStorage.setItem('key', 'value');
});
test('test 2', () => {
  /* expects clean localStorage */
});

// Good - clean state
beforeEach(() => {
  localStorage.clear();
});

test('test 1', () => {
  localStorage.setItem('key', 'value');
});
test('test 2', () => {
  /* clean localStorage guaranteed */
});
```

❌ **Testing framework internals**

```typescript
// Bad
expect(component.props.onClick).toHaveBeenCalled();

// Good
expect(mockHandler).toHaveBeenCalled();
```

## Best Practices

1. **Write tests FIRST** (TDD)
2. **One concept per test** (single responsibility)
3. **Clear test names** (describes what it tests)
4. **AAA structure** (Arrange, Act, Assert)
5. **Test behavior** not implementation
6. **Independent tests** (no shared state)
7. **Fast execution** (mock slow operations)
8. **Deterministic** (no randomness, no time dependencies)
9. **Readable** (clear intent, minimal setup)
10. **Maintainable** (update when behavior changes, not refactors)

## Test Data Builders

```typescript
// Builder pattern for test data
const createTestTodo = (overrides?: Partial<Todo>): Todo => ({
  id: 'test-id',
  title: 'Test todo',
  completed: false,
  createdAt: new Date('2024-01-01'),
  ...overrides,
});

// Usage
test('should mark todo as completed', () => {
  const todo = createTestTodo({ completed: false });
  const result = toggleTodo(todo);
  expect(result.completed).toBe(true);
});
```

## Mocking Strategy

Mock at boundaries only:

```typescript
// ✅ Good - mock at boundary (storage)
const mockStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
};

// ❌ Bad - mock internal functions
const mockHelper = jest.fn(); // Don't mock your own code
```

## Async Testing

```typescript
// ✅ Good - explicit async/await
test('should fetch data', async () => {
  const result = await fetchData();
  expect(result).toBeDefined();
});

// ❌ Bad - missing await
test('should fetch data', () => {
  const result = fetchData(); // Returns Promise, not resolved
  expect(result).toBeDefined(); // Wrong!
});
```

## Type-Safe Testing

```typescript
// ✅ Good - types enforced
const result: Result<Todo, Error> = createTodo('Test');
if (result.ok) {
  expect(result.value.title).toBe('Test');
} else {
  fail('Expected success');
}

// ❌ Bad - type assertions
const result = createTodo('Test') as any;
expect(result.title).toBe('Test'); // Type error hidden
```
