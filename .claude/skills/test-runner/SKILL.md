---
name: test-runner
description: Use when running tests, analyzing test results, or debugging test failures. This skill helps execute test suites and interpret results.
---

# Test Runner

## Commands

```bash
npm test                           # Run all
npm test -- path/to/file.test.ts  # Run specific
npm test -- --coverage             # With coverage
npm test -- --watch                # Watch mode
```

## Output

```
## Test Results

Status: ✅ / ❌
Total: X tests (Y passed, Z failed)
Coverage: X% lines, Y% branches

## Failures

❌ path/to/file.test.ts:42
Test: should do X
Error: Expected Y but got Z
Cause: [likely root cause]

## Coverage Gaps

Missing:
- file.ts:15-23 (error handling)
- file.ts:45 (edge case)
```

## Common Issues

**Type errors**: Mismatched types
**Async**: Missing await
**Mocks**: Not configured
**State**: Shared between tests
**Hooks**: Using hooks (should use connect())
**Timing**: Race conditions
