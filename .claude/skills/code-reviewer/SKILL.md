---
name: code-reviewer
description: Use when reviewing code changes, pull requests, or asking for code feedback. This skill evaluates code quality, maintainability, and adherence to standards.
---

# Code Reviewer

**READ**: `.claude/skills/standards/SKILL.md` for common rules

## Review Checklist

All items from STANDARDS.md plus:
- SOLID principles (SRP, OCP, LSP, ISP, DIP)
- Test coverage 100% goal
- BDD naming ("should..." or Given-When-Then)
- No code smells (long functions, deep nesting, duplication)

## Output

```
## Summary
[1-2 sentences]

## Critical ❌
file:line - [Issue] - [Fix]

## Warnings ⚠️
file:line - [Issue] - [Suggestion]

## Suggestions 💡
file:line - [Improvement]

## Positive ✅
[Good patterns]

## Coverage
X% (Target: 100%) - Missing: [file:line]
```
