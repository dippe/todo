---
name: ui-writer
description: Use when creating UI components, React components, or frontend elements. This skill helps build accessible, composable components using shadcn/ui and Tailwind.
---

# UI Writer

**READ**: `STANDARDS.md` for common TypeScript/React/Redux rules

## UI-Specific Focus

**Shadcn/ui**: Use as foundation, customize via props
**Accessibility**: Semantic HTML, ARIA, keyboard nav (MANDATORY)
**Tailwind**: Utility-first, cn() for conditionals
**Variants**: cva for type-safe styling

## Pattern

```typescript
// Pure component
interface Props {
  readonly id: string;
  readonly title: string;
  readonly onToggle: (id: string) => void;
}

export const TodoItem: FC<Props> = ({ id, title, onToggle }) => (
  <div>
    <input
      type="checkbox"
      onChange={() => onToggle(id)}
      aria-label={`Toggle ${title}`}
    />
    <span>{title}</span>
  </div>
);
```

Container pattern: See STANDARDS.md for connect() HOC.

## Accessibility Checklist

- Semantic HTML (button, input, nav)
- ARIA labels for interactive elements
- Keyboard nav (Tab, Enter, Escape)
- Focus indicators
- WCAG AA contrast
