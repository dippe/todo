# Common Coding Standards

**All agents MUST follow these standards.**

## TypeScript Rules
- Strict mode enabled
- No `any` (use `unknown` + type guards)
- Explicit return types for public APIs
- `readonly` for immutability
- Discriminated unions for state machines

## Functional Programming (MANDATORY)
- Pure functions only (no side effects)
- `const` only (never `let`/`var`)
- Immutable operations (spread, map/filter/reduce)
- No loops (for/while)
- No mutations
- No classes for logic

## React (NO HOOKS)
- Functional components only
- **ZERO HOOKS**: No useState, useEffect, useContext, useCallback, useMemo, custom hooks
- **Exception**: React.memo only (HOC, not hook)
- Props only, no internal state
- connect() HOC for containers
- Pure functions of props

## Redux Toolkit Pattern
```typescript
// Slice
const slice = createSlice({
  name: 'feature',
  initialState: { items: [] } as State,
  reducers: {
    addItem: (state, action: PayloadAction<Item>) => {
      state.items = [...state.items, action.payload]
    }
  }
})

// Container (connect() HOC - NO HOOKS)
const mapStateToProps = (state: RootState) => ({
  items: state.feature.items
})

const mapDispatchToProps = (dispatch: AppDispatch) => ({
  onAdd: (item: Item) => dispatch(addItem(item))
})

export const Container = connect(
  mapStateToProps,
  mapDispatchToProps
)(Component)

// Component (Pure)
interface Props {
  readonly items: readonly Item[]
  readonly onAdd: (item: Item) => void
}

export const Component = ({ items, onAdd }: Props) => (
  <div>{items.map(item => <Item key={item.id} {...item} />)}</div>
)
```

## Quality Metrics
- Function length: Max 20 lines (15 preferred)
- Parameters: Max 3 (use object for more)
- Cyclomatic complexity: Max 5
- No magic values
- No duplication

## Testing (TDD)
- Tests BEFORE implementation
- BDD naming: "should..." or "Given-When-Then"
- 100% coverage goal
- Test edge cases and errors
- Use Result types for error handling

## Common Violations
❌ Hooks (useState, useEffect, etc.)
❌ Mutations (array.push, obj.prop = x)
❌ Loops (for, while)
❌ `any` types
❌ Classes for business logic
❌ Internal component state
❌ Functions > 20 lines

✅ connect() HOC
✅ Pure functions, immutable data
✅ map/filter/reduce
✅ Strict types, readonly
✅ Props only
✅ Small focused functions
