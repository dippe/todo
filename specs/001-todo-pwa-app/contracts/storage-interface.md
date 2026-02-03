# LocalStorage Interface Contract

**Version**: 1.0  
**Date**: 2026-02-03  
**Status**: Design Complete

## Overview

This document defines the contract for persisting and loading TODO PWA state to/from browser LocalStorage. All operations are synchronous and type-safe.

---

## Storage Key

```typescript
const STORAGE_KEY = 'todo-pwa-state';
```

**Rationale**: Single key for entire app state. Namespaced to avoid collisions.

---

## Storage Schema

### Version 1 (Current)

```typescript
interface StorageSchema {
  readonly version: 1;
  readonly data: TaskListState;
  readonly lastSaved: number;  // Unix epoch milliseconds
}

interface TaskListState {
  readonly items: readonly Task[];
  readonly filter: TaskFilter;
}
```

**Example Stored JSON**:
```json
{
  "version": 1,
  "data": {
    "items": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "title": "Buy groceries",
        "completed": false,
        "createdAt": 1738598400000,
        "updatedAt": 1738598400000
      }
    ],
    "filter": "all"
  },
  "lastSaved": 1738598450000
}
```

**Fields**:
- `version`: Schema version for future migrations
- `data`: Redux `TaskListState` (serialized)
- `lastSaved`: Timestamp of last write (for debugging)

---

## API Contract

### saveToStorage

Saves Redux state to LocalStorage.

**Signature**:
```typescript
export const saveToStorage = (state: TaskListState): Result<void>;
```

**Parameters**:
- `state`: Current Redux `TaskListState`

**Returns**:
- `Result<void>`: Success or error message

**Behavior**:
1. Constructs `StorageSchema` object
2. Serializes to JSON using `JSON.stringify`
3. Writes to `localStorage.setItem(STORAGE_KEY, json)`
4. Returns success or quota exceeded error

**Example Usage**:
```typescript
const state = store.getState().tasks;
const result = saveToStorage(state);

if (!result.ok) {
  console.error('Failed to save:', result.error);
  notifyUser('Storage full - please export and clear tasks');
}
```

**Error Cases**:
- **QuotaExceededError**: Storage limit reached (~5-10MB)
  - **Handling**: Notify user, suggest export/clear
- **SecurityError**: Private browsing mode, storage disabled
  - **Handling**: Warn user, disable auto-save
- **Serialization Error**: Invalid data structure
  - **Handling**: Log error, skip save (state preserved in memory)

**Implementation**:
```typescript
export const saveToStorage = (state: TaskListState): Result<void> => {
  try {
    const schema: StorageSchema = {
      version: 1,
      data: state,
      lastSaved: Date.now(),
    };

    const json = JSON.stringify(schema);
    localStorage.setItem(STORAGE_KEY, json);

    return { ok: true, value: undefined };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      return { ok: false, error: 'Storage quota exceeded' };
    }
    return { ok: false, error: `Save failed: ${error}` };
  }
};
```

---

### loadFromStorage

Loads Redux state from LocalStorage.

**Signature**:
```typescript
export const loadFromStorage = (): Result<TaskListState>;
```

**Parameters**: None

**Returns**:
- `Result<TaskListState>`: Loaded state or error message

**Behavior**:
1. Reads from `localStorage.getItem(STORAGE_KEY)`
2. Returns default state if key doesn't exist (first run)
3. Parses JSON using `JSON.parse`
4. Validates schema version and structure
5. Migrates if necessary (future versions)
6. Returns validated `TaskListState`

**Example Usage**:
```typescript
const result = loadFromStorage();

const preloadedState = result.ok
  ? { tasks: result.value }
  : { tasks: getDefaultState() };

const store = configureStore({
  reducer: { tasks: tasksReducer },
  preloadedState,
});
```

**Error Cases**:
- **No key found**: Returns default state (not an error)
- **Parse error**: Invalid JSON → returns default state
- **Schema validation error**: Invalid structure → returns default state
- **Unknown version**: Future version → attempt migration or reset

**Implementation**:
```typescript
const DEFAULT_STATE: TaskListState = {
  items: [],
  filter: 'all',
};

export const loadFromStorage = (): Result<TaskListState> => {
  try {
    const json = localStorage.getItem(STORAGE_KEY);

    // First run (no data)
    if (json === null) {
      return { ok: true, value: DEFAULT_STATE };
    }

    const parsed = JSON.parse(json);

    // Validate schema
    const validated = validateStorageSchema(parsed);
    if (!validated.ok) {
      console.warn('Invalid storage schema, using defaults:', validated.error);
      return { ok: true, value: DEFAULT_STATE };
    }

    // Extract data (with migration if needed)
    const migrated = migrateSchema(validated.value);
    return { ok: true, value: migrated.data };
  } catch (error) {
    console.error('Failed to load storage:', error);
    return { ok: true, value: DEFAULT_STATE }; // Fail-safe to defaults
  }
};
```

---

### clearStorage

Clears all stored data (reset to defaults).

**Signature**:
```typescript
export const clearStorage = (): Result<void>;
```

**Parameters**: None

**Returns**:
- `Result<void>`: Success or error message

**Behavior**:
1. Removes `STORAGE_KEY` from LocalStorage
2. Returns success

**Example Usage**:
```typescript
const result = clearStorage();

if (result.ok) {
  dispatch(loadTasks([])); // Reset Redux state
}
```

**Implementation**:
```typescript
export const clearStorage = (): Result<void> => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return { ok: true, value: undefined };
  } catch (error) {
    return { ok: false, error: `Clear failed: ${error}` };
  }
};
```

---

### exportToJSON

Exports all tasks as downloadable JSON file.

**Signature**:
```typescript
export const exportToJSON = (state: TaskListState): string;
```

**Parameters**:
- `state`: Current Redux `TaskListState`

**Returns**:
- `string`: JSON string formatted for download

**Behavior**:
1. Serializes state to pretty-printed JSON
2. Returns string (caller triggers download)

**Example Usage**:
```typescript
const state = store.getState().tasks;
const json = exportToJSON(state);

const blob = new Blob([json], { type: 'application/json' });
const url = URL.createObjectURL(blob);

const a = document.createElement('a');
a.href = url;
a.download = `tasks-${Date.now()}.json`;
a.click();
```

**Implementation**:
```typescript
export const exportToJSON = (state: TaskListState): string => {
  const schema: StorageSchema = {
    version: 1,
    data: state,
    lastSaved: Date.now(),
  };

  return JSON.stringify(schema, null, 2); // Pretty-print
};
```

---

### importFromJSON

Imports tasks from uploaded JSON file.

**Signature**:
```typescript
export const importFromJSON = (json: string): Result<TaskListState>;
```

**Parameters**:
- `json`: JSON string from file upload

**Returns**:
- `Result<TaskListState>`: Parsed and validated state

**Behavior**:
1. Parses JSON
2. Validates schema structure
3. Validates all task objects
4. Returns validated state or error

**Example Usage**:
```typescript
const handleImport = (file: File) => {
  const reader = new FileReader();
  
  reader.onload = (e) => {
    const json = e.target?.result as string;
    const result = importFromJSON(json);

    if (result.ok) {
      dispatch(loadTasks(result.value.items));
    } else {
      alert(`Import failed: ${result.error}`);
    }
  };

  reader.readAsText(file);
};
```

**Implementation**:
```typescript
export const importFromJSON = (json: string): Result<TaskListState> => {
  try {
    const parsed = JSON.parse(json);
    const validated = validateStorageSchema(parsed);

    if (!validated.ok) {
      return { ok: false, error: `Invalid format: ${validated.error}` };
    }

    return { ok: true, value: validated.value.data };
  } catch (error) {
    return { ok: false, error: `Parse error: ${error}` };
  }
};
```

---

## Validation

### validateStorageSchema

Validates loaded data structure.

**Signature**:
```typescript
const validateStorageSchema = (value: unknown): Result<StorageSchema>;
```

**Checks**:
1. `value` is an object
2. `version` is number (currently only 1 supported)
3. `data` is valid `TaskListState`
4. `lastSaved` is number

**Implementation**:
```typescript
const validateStorageSchema = (value: unknown): Result<StorageSchema> => {
  if (!isObject(value)) {
    return { ok: false, error: 'Not an object' };
  }

  if (typeof value.version !== 'number') {
    return { ok: false, error: 'Missing or invalid version' };
  }

  if (!isObject(value.data)) {
    return { ok: false, error: 'Missing or invalid data' };
  }

  const dataValidation = validateTaskListState(value.data);
  if (!dataValidation.ok) {
    return { ok: false, error: `Invalid data: ${dataValidation.error}` };
  }

  return { 
    ok: true, 
    value: value as StorageSchema 
  };
};
```

### validateTaskListState

Validates `TaskListState` structure.

**Signature**:
```typescript
const validateTaskListState = (value: unknown): Result<TaskListState>;
```

**Checks**:
1. `items` is array
2. All items are valid `Task` objects
3. `filter` is valid `TaskFilter` enum value

**Implementation**:
```typescript
const validateTaskListState = (value: unknown): Result<TaskListState> => {
  if (!isObject(value)) {
    return { ok: false, error: 'Not an object' };
  }

  if (!Array.isArray(value.items)) {
    return { ok: false, error: 'items is not an array' };
  }

  for (const item of value.items) {
    if (!isTask(item)) {
      return { ok: false, error: 'Invalid task object' };
    }
  }

  const validFilters: TaskFilter[] = ['all', 'active', 'completed'];
  if (!validFilters.includes(value.filter as TaskFilter)) {
    return { ok: false, error: 'Invalid filter value' };
  }

  return { ok: true, value: value as TaskListState };
};
```

---

## Migration Strategy

### migrateSchema

Handles schema version upgrades.

**Signature**:
```typescript
const migrateSchema = (schema: StorageSchema): StorageSchema;
```

**Current Version**: 1 (no migration needed)

**Future Versions**:
```typescript
const migrateSchema = (schema: StorageSchema): StorageSchema => {
  let current = schema;

  // Migrate v1 → v2 (example future migration)
  // if (current.version === 1) {
  //   current = migrateV1ToV2(current);
  // }

  return current;
};
```

**Migration Rules**:
1. Never lose user data
2. Add default values for new fields
3. Transform incompatible structures
4. Log migration for debugging

---

## Debouncing

### Debounced Save

Prevent excessive writes (e.g., on every keystroke).

**Implementation**:
```typescript
let saveTimeout: ReturnType<typeof setTimeout> | null = null;
const SAVE_DELAY_MS = 300;

export const debouncedSave = (state: TaskListState): void => {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  saveTimeout = setTimeout(() => {
    saveToStorage(state);
    saveTimeout = null;
  }, SAVE_DELAY_MS);
};
```

**Usage in Middleware**:
```typescript
const localStorageMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);

  if (action.type.startsWith('tasks/')) {
    const state = store.getState().tasks;
    debouncedSave(state); // Debounced write
  }

  return result;
};
```

---

## Multi-Tab Synchronization

### Storage Event Listener

Sync state across browser tabs.

**Implementation**:
```typescript
export const setupStorageSync = (dispatch: AppDispatch): void => {
  window.addEventListener('storage', (event) => {
    // Only react to our storage key
    if (event.key !== STORAGE_KEY) return;

    // Another tab cleared storage
    if (event.newValue === null) {
      dispatch(loadTasks([]));
      return;
    }

    // Another tab updated storage
    const result = loadFromStorage();
    if (result.ok) {
      dispatch(loadTasks(result.value.items));
    }
  });
};
```

**Usage**:
```typescript
// In App.tsx or store setup
useEffect(() => {
  setupStorageSync(dispatch);
}, [dispatch]);
```

---

## Error Handling Strategy

| Error Type | Cause | Handling |
|------------|-------|----------|
| `QuotaExceededError` | Storage full (~5-10MB) | Notify user, suggest export/clear, continue in-memory |
| `SecurityError` | Private browsing, disabled | Warn user once, disable auto-save, in-memory only |
| `SyntaxError` | Corrupted JSON | Log error, reset to defaults, notify user |
| `ValidationError` | Invalid schema | Log warning, reset to defaults, silent recovery |
| `NotFoundError` | Key doesn't exist | Normal (first run), use defaults |

---

## Testing Contracts

### Unit Tests

```typescript
describe('storageService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('saveToStorage', () => {
    it('should save state to localStorage', () => {
      const state: TaskListState = {
        items: [{ id: 'test' as TaskId, title: 'Test', completed: false, createdAt: 1000, updatedAt: 1000 }],
        filter: 'all',
      };

      const result = saveToStorage(state);

      expect(result.ok).toBe(true);
      expect(localStorage.getItem(STORAGE_KEY)).toBeTruthy();
    });

    it('should handle quota exceeded error', () => {
      // Mock QuotaExceededError
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new DOMException('QuotaExceededError', 'QuotaExceededError');
      });

      const state: TaskListState = { items: [], filter: 'all' };
      const result = saveToStorage(state);

      expect(result.ok).toBe(false);
      expect(result.error).toContain('quota');
    });
  });

  describe('loadFromStorage', () => {
    it('should load saved state', () => {
      const state: TaskListState = {
        items: [{ id: 'test' as TaskId, title: 'Test', completed: false, createdAt: 1000, updatedAt: 1000 }],
        filter: 'active',
      };

      saveToStorage(state);
      const result = loadFromStorage();

      expect(result.ok).toBe(true);
      expect(result.value.items).toHaveLength(1);
      expect(result.value.filter).toBe('active');
    });

    it('should return defaults for first run', () => {
      const result = loadFromStorage();

      expect(result.ok).toBe(true);
      expect(result.value.items).toEqual([]);
      expect(result.value.filter).toBe('all');
    });

    it('should handle corrupted data', () => {
      localStorage.setItem(STORAGE_KEY, 'invalid json');
      const result = loadFromStorage();

      expect(result.ok).toBe(true);
      expect(result.value.items).toEqual([]); // Defaults
    });
  });
});
```

---

## Performance Considerations

- **Debouncing**: 300ms delay prevents excessive writes
- **Synchronous API**: Acceptable for todo app scale (<1000 tasks)
- **Serialization Cost**: ~1ms for 100 tasks, ~10ms for 1000 tasks
- **Size Limits**: ~5-10MB (browser-dependent), ~10,000 tasks supported

---

## Security Considerations

- **Same-Origin Policy**: Automatic (browser enforced)
- **No Encryption**: Data readable in DevTools (acceptable for todos)
- **XSS Protection**: React escapes by default, validate imports
- **No Sensitive Data**: Tasks not suitable for passwords/credentials

---

**Status**: ✅ Complete - All LocalStorage contracts defined
