# Tasks: TODO PWA Application

**Input**: Design documents from `/specs/001-todo-pwa-app/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: TDD is REQUIRED per Constitution IV. All tests are written BEFORE implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single-package structure**: `src/`, `tests/` at repository root
- All paths follow plan.md structure
- Tests follow TDD: Write → Fail → Implement → Pass → Refactor

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure per quickstart.md

- [ ] T001 Initialize Vite + React + TypeScript project with create vite@latest
- [ ] T002 [P] Install core dependencies: react-redux @reduxjs/toolkit
- [ ] T003 [P] Install UI dependencies: shadcn/ui tailwindcss postcss autoprefixer
- [ ] T004 [P] Install dev dependencies: @types/react-redux typescript
- [ ] T005 Configure TypeScript strict mode in tsconfig.json per research.md section 6
- [ ] T006 [P] Configure ESLint with functional programming rules in .eslintrc.cjs
- [ ] T007 [P] Configure Prettier formatting in .prettierrc
- [ ] T008 [P] Initialize Tailwind CSS with npx tailwindcss init -p
- [ ] T009 Configure Tailwind responsive breakpoints in tailwind.config.js (768px mobile/desktop)
- [ ] T010 [P] Install Jest dependencies: jest @testing-library/react @testing-library/jest-dom
- [ ] T011 [P] Install testing utilities: @testing-library/user-event @types/jest jest-environment-jsdom ts-jest
- [ ] T012 [P] Initialize Playwright for E2E tests with npm init playwright@latest
- [ ] T013 Configure Jest in jest.config.js with 90% coverage threshold
- [ ] T014 Create test setup file in src/setupTests.ts
- [ ] T015 [P] Initialize shadcn/ui with npx shadcn-ui@latest init
- [ ] T016 [P] Add shadcn Button component with npx shadcn-ui@latest add button
- [ ] T017 [P] Add shadcn Input component with npx shadcn-ui@latest add input
- [ ] T018 [P] Add shadcn Checkbox component with npx shadcn-ui@latest add checkbox
- [ ] T019 [P] Add shadcn Card component with npx shadcn-ui@latest add card
- [ ] T020 [P] Add shadcn Dialog component with npx shadcn-ui@latest add dialog
- [ ] T021 Create project directory structure: src/{components,containers,store/slices,services,utils,types}
- [ ] T022 Create test directory structure: tests/{unit,integration,e2e}
- [ ] T023 Create public directory structure: public/{icons} for PWA assets
- [ ] T024 Add package.json scripts: test, test:watch, test:coverage, test:e2e, lint, lint:fix, format

**Checkpoint**: Project structure initialized, dependencies installed, tooling configured

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Core Type Definitions (TDD)

- [ ] T025 [P] Write test for Task type guard in tests/unit/types/task.test.ts
- [ ] T026 [P] Implement Task type and type guards in src/types/task.ts
- [ ] T027 [P] Write test for Result type in tests/unit/types/result.test.ts
- [ ] T028 [P] Implement Result type in src/types/result.ts
- [ ] T029 [P] Write test for TaskListState type in tests/unit/types/state.test.ts
- [ ] T030 [P] Implement state types in src/types/state.ts

### Utility Functions (TDD)

- [ ] T031 [P] Write test for ID generator in tests/unit/utils/id.test.ts
- [ ] T032 [P] Implement generateId utility in src/utils/id.ts using crypto.randomUUID()
- [ ] T033 [P] Write test for date utilities in tests/unit/utils/date.test.ts
- [ ] T034 [P] Implement date utilities in src/utils/date.ts for timestamps
- [ ] T035 [P] Write test for storage helper in tests/unit/utils/storage.test.ts
- [ ] T036 [P] Implement storage helper functions in src/utils/storage.ts

### Core Services (TDD - Business Logic)

- [ ] T037 [P] Write tests for addTask service in tests/unit/services/taskService.test.ts
- [ ] T038 [P] Write tests for toggleTask service in tests/unit/services/taskService.test.ts
- [ ] T039 [P] Write tests for updateTask service in tests/unit/services/taskService.test.ts
- [ ] T040 [P] Write tests for deleteTask service in tests/unit/services/taskService.test.ts
- [ ] T041 Implement taskService pure functions in src/services/taskService.ts (all CRUD operations)
- [ ] T042 [P] Write tests for validation service in tests/unit/services/validationService.test.ts
- [ ] T043 [P] Implement validationService in src/services/validationService.ts (title validation, storage limits)
- [ ] T044 [P] Write tests for storage service in tests/unit/services/storageService.test.ts
- [ ] T045 [P] Implement storageService in src/services/storageService.ts (save/load/clear/export/import)

### Redux Store Setup (TDD)

- [ ] T046 [P] Write tests for Redux slice in tests/unit/store/tasksSlice.test.ts
- [ ] T047 Implement tasksSlice with all reducers in src/store/slices/tasksSlice.ts
- [ ] T048 [P] Write tests for selectors in tests/unit/store/selectors.test.ts
- [ ] T049 [P] Implement memoized selectors in src/store/slices/tasksSlice.ts (selectFilteredTasks, selectMetrics)
- [ ] T050 Configure Redux store in src/store/store.ts with middleware for LocalStorage persistence
- [ ] T051 Implement LocalStorage middleware for auto-save with 300ms debounce

### Global Styles & Layout Foundation

- [ ] T052 Create global styles in src/index.css with Tailwind imports
- [ ] T053 [P] Create Layout component structure (no tests needed - pure UI)
- [ ] T054 [P] Create base responsive layout in src/components/Layout.tsx with header/main/footer

**Checkpoint**: Foundation ready - all shared infrastructure complete, user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create and View Tasks (Priority: P1) 🎯 MVP

**Goal**: Users can create tasks with text input and view all created tasks in a list. Tasks persist across browser sessions using LocalStorage. This is the MINIMUM VIABLE PRODUCT.

**Independent Test**: Create several tasks, view them in the list, close browser, reopen - all tasks should persist and display.

### Tests for User Story 1 (TDD - Write First, Ensure Fail)

- [ ] T055 [P] [US1] Write E2E test for task creation flow in tests/e2e/task-creation.spec.ts
- [ ] T056 [P] [US1] Write E2E test for empty task validation in tests/e2e/task-creation.spec.ts
- [ ] T057 [P] [US1] Write E2E test for task persistence in tests/e2e/task-creation.spec.ts
- [ ] T058 [P] [US1] Write integration test for TaskForm component in tests/integration/TaskFormContainer.test.tsx
- [ ] T059 [P] [US1] Write integration test for TaskList component in tests/integration/TaskListContainer.test.tsx

### Implementation for User Story 1

- [ ] T060 [P] [US1] Create TaskForm pure component in src/components/TaskForm.tsx (props: mode, initialValue, onSubmit, onCancel, submitLabel, placeholder)
- [ ] T061 [P] [US1] Create TaskItem pure component in src/components/TaskItem.tsx (props: id, title, completed, onToggle, onDelete, onEdit)
- [ ] T062 [P] [US1] Create TaskList pure component in src/components/TaskList.tsx (props: tasks, onToggle, onDelete, onEdit, emptyMessage)
- [ ] T063 [US1] Create TaskFormContainer with connect() HOC in src/containers/TaskFormContainer.tsx (maps dispatch to addTask)
- [ ] T064 [US1] Create TaskListContainer with connect() HOC in src/containers/TaskListContainer.tsx (maps state to tasks, dispatch to handlers)
- [ ] T065 [US1] Create App root component in src/App.tsx integrating Layout + TaskFormContainer + TaskListContainer
- [ ] T066 [US1] Create main entry point in src/main.tsx with Redux Provider and store initialization
- [ ] T067 [US1] Load tasks from LocalStorage on app init in src/main.tsx
- [ ] T068 [US1] Add form validation for empty task in TaskFormContainer (FR-011)
- [ ] T069 [US1] Add form validation for max 500 char title in TaskFormContainer
- [ ] T070 [US1] Implement accessibility: aria-labels for TaskForm input and submit button
- [ ] T071 [US1] Implement accessibility: aria-labels for TaskItem checkbox and actions

**Checkpoint**: User Story 1 complete - Users can create, view, and persist tasks. This is a functional MVP!

---

## Phase 4: User Story 4 - Mobile-Responsive Access (Priority: P1)

**Goal**: App layout adapts to mobile (<768px) and desktop (>=768px) screen sizes with touch-optimized controls on mobile. Critical for PWA value proposition.

**Independent Test**: Access app on mobile device (or Chrome DevTools mobile view), verify single-column layout and 44x44px touch targets. Access on desktop, verify optimal spacing. Rotate device, verify layout adapts.

### Tests for User Story 4 (TDD)

- [ ] T072 [P] [US4] Write E2E responsive layout tests in tests/e2e/responsive.spec.ts (mobile/tablet/desktop viewports)
- [ ] T073 [P] [US4] Write E2E touch target size tests in tests/e2e/responsive.spec.ts (min 44x44px validation)
- [ ] T074 [P] [US4] Write E2E orientation change tests in tests/e2e/responsive.spec.ts

### Implementation for User Story 4

- [ ] T075 [P] [US4] Add responsive Tailwind classes to Layout.tsx (flex-col on mobile, optimized desktop spacing)
- [ ] T076 [P] [US4] Add responsive Tailwind classes to TaskForm.tsx (full-width mobile input, desktop sizing)
- [ ] T077 [P] [US4] Add responsive Tailwind classes to TaskItem.tsx (mobile-friendly spacing, stacked buttons on small screens)
- [ ] T078 [P] [US4] Add responsive Tailwind classes to TaskList.tsx (scrollable area, mobile padding)
- [ ] T079 [US4] Ensure all button components meet min-h-[44px] min-w-[44px] requirement (FR-014)
- [ ] T080 [US4] Ensure all checkbox components meet min-h-[44px] min-w-[44px] requirement
- [ ] T081 [US4] Add touch-manipulation class to all interactive elements
- [ ] T082 [US4] Test responsive behavior on mobile device emulator (320px to 768px)
- [ ] T083 [US4] Test responsive behavior on tablet emulator (768px to 1024px)
- [ ] T084 [US4] Test responsive behavior on desktop (1024px+)

**Checkpoint**: App is fully responsive with mobile-optimized UI. P1 stories complete - ready for MVP deployment!

---

## Phase 5: User Story 2 - Complete and Delete Tasks (Priority: P2)

**Goal**: Users can mark tasks as complete/incomplete and permanently delete tasks. Provides task lifecycle management.

**Independent Test**: Create tasks, toggle completion (visual distinction), toggle back to incomplete, delete tasks. All operations should update immediately and persist.

### Tests for User Story 2 (TDD)

- [ ] T085 [P] [US2] Write E2E test for task completion toggle in tests/e2e/task-completion.spec.ts
- [ ] T086 [P] [US2] Write E2E test for completed task visual styling in tests/e2e/task-completion.spec.ts
- [ ] T087 [P] [US2] Write E2E test for task deletion in tests/e2e/task-completion.spec.ts
- [ ] T088 [P] [US2] Write integration test for toggle functionality in tests/integration/TaskListContainer.test.tsx
- [ ] T089 [P] [US2] Write integration test for delete functionality in tests/integration/TaskListContainer.test.tsx

### Implementation for User Story 2

- [ ] T090 [US2] Add onToggle handler to TaskListContainer connect() mapDispatchToProps (dispatch toggleTask)
- [ ] T091 [US2] Add onDelete handler to TaskListContainer connect() mapDispatchToProps (dispatch deleteTask)
- [ ] T092 [US2] Update TaskItem component to handle toggle action on checkbox click
- [ ] T093 [US2] Update TaskItem component to handle delete action on delete button click
- [ ] T094 [US2] Add visual styling for completed tasks in TaskItem.tsx (line-through, gray color - FR-010)
- [ ] T095 [US2] Add confirmation dialog for delete action using shadcn Dialog
- [ ] T096 [US2] Implement accessibility: aria-label for delete button with task title
- [ ] T097 [US2] Implement accessibility: aria-checked state for checkbox
- [ ] T098 [US2] Test multi-tab sync when task deleted in another tab (storage event listener)

**Checkpoint**: Users can manage task lifecycle (create, complete, delete). Core functionality complete!

---

## Phase 6: User Story 5 - Offline PWA Functionality (Priority: P2)

**Goal**: App functions fully offline with service worker caching. Users can install app to home screen. Differentiates from regular web apps.

**Independent Test**: Install app via browser prompt, open from home screen (standalone mode), go offline (airplane mode), verify all CRUD operations work, verify instant load from cache.

### Tests for User Story 5 (TDD)

- [ ] T099 [P] [US5] Write E2E test for offline functionality in tests/e2e/offline.spec.ts (network throttling)
- [ ] T100 [P] [US5] Write E2E test for service worker installation in tests/e2e/offline.spec.ts
- [ ] T101 [P] [US5] Write E2E test for cached resource loading in tests/e2e/offline.spec.ts
- [ ] T102 [P] [US5] Write E2E test for PWA installability in tests/e2e/offline.spec.ts

### Implementation for User Story 5

- [ ] T103 [P] [US5] Create PWA manifest.json in public/manifest.json (name, icons, display: standalone, start_url)
- [ ] T104 [P] [US5] Create service worker in public/service-worker.js with cache-first strategy
- [ ] T105 [US5] Implement service worker install event to cache static assets (/index.html, /main.js, /styles.css)
- [ ] T106 [US5] Implement service worker fetch event with cache-first fallback
- [ ] T107 [US5] Implement service worker activate event to clear old caches
- [ ] T108 [US5] Register service worker in src/main.tsx (production only)
- [ ] T109 [P] [US5] Create PWA icon assets in public/icons/ (192x192, 512x512)
- [ ] T110 [US5] Add manifest link to index.html <head>
- [ ] T111 [US5] Add theme-color meta tag to index.html
- [ ] T112 [US5] Test offline create task (should work, stored in LocalStorage)
- [ ] T113 [US5] Test offline toggle task (should work, stored in LocalStorage)
- [ ] T114 [US5] Test offline delete task (should work, stored in LocalStorage)
- [ ] T115 [US5] Test app install on mobile Safari (iOS)
- [ ] T116 [US5] Test app install on Android Chrome
- [ ] T117 [US5] Test app install on desktop browsers (Chrome, Edge)
- [ ] T118 [US5] Verify standalone mode launch (no browser chrome)

**Checkpoint**: App is fully offline-capable PWA with home screen installation. P2 stories complete!

---

## Phase 7: User Story 3 - Edit Task Details (Priority: P3)

**Goal**: Users can update existing task text after creation. Enhances usability beyond delete/recreate workaround.

**Independent Test**: Create task, click edit button, modify text, save - updated text displays and persists. Click edit, modify text, cancel - original text preserved.

### Tests for User Story 3 (TDD)

- [ ] T119 [P] [US3] Write E2E test for task editing in tests/e2e/task-editing.spec.ts
- [ ] T120 [P] [US3] Write E2E test for empty text validation during edit in tests/e2e/task-editing.spec.ts
- [ ] T121 [P] [US3] Write E2E test for edit cancellation in tests/e2e/task-editing.spec.ts
- [ ] T122 [P] [US3] Write integration test for EditTaskDialog in tests/integration/EditTaskDialogContainer.test.tsx

### Implementation for User Story 3

- [ ] T123 [P] [US3] Create EditTaskDialog pure component in src/components/EditTaskDialog.tsx (props: open, task, onSave, onClose)
- [ ] T124 [US3] Create EditTaskDialogContainer with connect() HOC in src/containers/EditTaskDialogContainer.tsx
- [ ] T125 [US3] Add onEdit handler to TaskListContainer to dispatch setEditingId(id)
- [ ] T126 [US3] Map editingId and editingTask from state in EditTaskDialogContainer (using selectEditingTask selector)
- [ ] T127 [US3] Implement onSave handler in EditTaskDialogContainer to dispatch updateTask({ id, title })
- [ ] T128 [US3] Implement onClose handler in EditTaskDialogContainer to dispatch setEditingId(null)
- [ ] T129 [US3] Integrate EditTaskDialogContainer into App.tsx
- [ ] T130 [US3] Add edit button to TaskItem component that calls onEdit(id)
- [ ] T131 [US3] Reuse TaskForm component inside EditTaskDialog (mode: 'edit', initialValue: task.title)
- [ ] T132 [US3] Add validation for empty text during edit (same as create)
- [ ] T133 [US3] Implement accessibility: Dialog role, aria-modal, focus trap
- [ ] T134 [US3] Implement accessibility: Escape key to close dialog
- [ ] T135 [US3] Implement accessibility: Focus returns to edit button on close

**Checkpoint**: Users can edit tasks in-place. All P1-P3 user stories complete!

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and enhancements across all user stories

### Filtering & Metrics

- [ ] T136 [P] Create FilterBar pure component in src/components/FilterBar.tsx (props: currentFilter, onFilterChange, counts)
- [ ] T137 [P] Create FilterBarContainer with connect() HOC in src/containers/FilterBarContainer.tsx
- [ ] T138 [P] Create TaskStats pure component in src/components/TaskStats.tsx (props: totalCount, completedCount, activeCount, onClearCompleted)
- [ ] T139 [P] Create TaskStatsContainer with connect() HOC in src/containers/TaskStatsContainer.tsx
- [ ] T140 Integrate FilterBarContainer into App.tsx
- [ ] T141 Integrate TaskStatsContainer into App.tsx
- [ ] T142 Implement clearCompleted reducer in tasksSlice.ts
- [ ] T143 Wire up onClearCompleted handler in TaskStatsContainer

### Multi-Tab Sync

- [ ] T144 Implement storage event listener for multi-tab sync in src/main.tsx
- [ ] T145 Dispatch loadTasks action when storage event detected from other tab
- [ ] T146 Test multi-tab create task sync
- [ ] T147 Test multi-tab toggle task sync
- [ ] T148 Test multi-tab delete task sync

### Edge Cases & Error Handling

- [ ] T149 [P] Implement quota exceeded error handling in storageService.ts
- [ ] T150 [P] Add user notification for storage quota exceeded (show alert)
- [ ] T151 [P] Implement export tasks to JSON functionality in storageService.ts
- [ ] T152 [P] Implement import tasks from JSON functionality in storageService.ts
- [ ] T153 Add export button to UI (downloads tasks.json file)
- [ ] T154 Add import button to UI (file upload input)
- [ ] T155 Implement storage schema version migration logic
- [ ] T156 Add validation for max 10,000 tasks limit
- [ ] T157 Add user notification when approaching task limit

### Performance Optimizations

- [ ] T158 [P] Add React.memo to TaskItem component to prevent unnecessary re-renders
- [ ] T159 [P] Add React.memo to TaskList component
- [ ] T160 [P] Add React.memo to TaskForm component
- [ ] T161 Verify createSelector memoization working for selectFilteredTasks
- [ ] T162 Verify createSelector memoization working for selectMetrics
- [ ] T163 Test performance with 1000+ tasks (should complete operations in <1s per SC-008)
- [ ] T164 Verify app load time <2s on 3G network throttling (per SC-002)

### Accessibility Final Pass

- [ ] T165 Run Lighthouse accessibility audit (target: 100 score)
- [ ] T166 Run axe DevTools accessibility scan (zero violations)
- [ ] T167 Test keyboard navigation: Tab through all interactive elements
- [ ] T168 Test keyboard navigation: Enter to submit forms
- [ ] T169 Test keyboard navigation: Escape to close dialogs
- [ ] T170 Verify WCAG AA color contrast ratios (4.5:1 minimum)
- [ ] T171 Test with NVDA screen reader (Windows)
- [ ] T172 Test with VoiceOver screen reader (macOS/iOS)
- [ ] T173 Verify focus indicators visible on all interactive elements

### Code Quality & Documentation

- [ ] T174 Run ESLint and fix all violations (npm run lint:fix)
- [ ] T175 Run Prettier and format all code (npm run format)
- [ ] T176 Verify TypeScript strict mode compliance (zero errors)
- [ ] T177 Run test coverage report (npm run test:coverage)
- [ ] T178 Verify 90%+ test coverage (per Constitution IV)
- [ ] T179 [P] Add TSDoc comments to all public service functions
- [ ] T180 [P] Add TSDoc comments to all Redux actions and selectors
- [ ] T181 Update README.md with setup instructions from quickstart.md
- [ ] T182 Update README.md with architecture overview
- [ ] T183 Update README.md with testing instructions

### Production Build & Validation

- [ ] T184 Run production build (npm run build)
- [ ] T185 Verify bundle size <200KB (per research.md performance goals)
- [ ] T186 Run Lighthouse performance audit (target: 90+ score)
- [ ] T187 Run Lighthouse PWA audit (target: 100 score)
- [ ] T188 Test production build preview (npm run preview)
- [ ] T189 Verify service worker caching in production build
- [ ] T190 Verify PWA installability in production build
- [ ] T191 Run all E2E tests against production build
- [ ] T192 Verify quickstart.md validation steps pass

**Checkpoint**: All features complete, optimized, accessible, and production-ready!

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - **US1 (Phase 3)**: Can start after Phase 2 - No dependencies on other stories ✅ **MVP**
  - **US4 (Phase 4)**: Can start after Phase 2 - No dependencies, but enhances US1 ✅ **MVP**
  - **US2 (Phase 5)**: Can start after Phase 2 - Extends US1 but independently testable
  - **US5 (Phase 6)**: Can start after Phase 2 - Enhances all stories but independently testable
  - **US3 (Phase 7)**: Can start after Phase 2 - Extends US1 but independently testable
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Independence

All user stories are designed to be independently implementable and testable:

- **US1**: Standalone - Create/view tasks
- **US2**: Adds to US1 - Toggle/delete (but US1 works without it)
- **US3**: Adds to US1 - Edit (but US1 works without it)
- **US4**: Enhances US1 - Responsive (but US1 works on desktop without it)
- **US5**: Enhances all - Offline/PWA (but app works online without it)

### Within Each User Story

1. **Tests FIRST** (TDD) - Write and verify they FAIL
2. **Pure Components** (no state, parallelizable)
3. **Containers** (connect() HOC, depends on components)
4. **Integration** (wire into App.tsx)
5. **Accessibility** (final pass for story)

### Parallel Opportunities

**Phase 1 (Setup)**: All tasks marked [P] can run in parallel

**Phase 2 (Foundational)**:
- Type tests (T025, T027, T029) - parallel
- Type implementations (T026, T028, T030) - parallel
- Utility tests (T031, T033, T035) - parallel
- Utility implementations (T032, T034, T036) - parallel
- Service tests (T037-T045) - parallel
- Service implementations can follow tests

**Phase 3+ (User Stories)**: 
- All test writing within a story can be parallel
- All pure component creation can be parallel
- Different user stories can be worked on in parallel by different developers

---

## Parallel Example: User Story 1 (MVP)

```bash
# Day 1: Write all US1 tests in parallel (TDD - ensure they FAIL)
Task T055: "Write E2E test for task creation flow"
Task T056: "Write E2E test for empty task validation"
Task T057: "Write E2E test for task persistence"
Task T058: "Write integration test for TaskForm component"
Task T059: "Write integration test for TaskList component"

# Day 2: Create all US1 pure components in parallel
Task T060: "Create TaskForm pure component"
Task T061: "Create TaskItem pure component"
Task T062: "Create TaskList pure component"

# Day 3: Wire up containers and integration (sequential)
Task T063: "Create TaskFormContainer with connect() HOC"
Task T064: "Create TaskListContainer with connect() HOC"
Task T065: "Create App root component"
Task T066: "Create main entry point"
...

# Verify tests now PASS (Green)
# Refactor if needed
```

---

## Implementation Strategy

### Recommended Approach: MVP First (US1 + US4 Only)

1. **Complete Phase 1**: Setup (~2-4 hours)
   - Initialize project
   - Install dependencies
   - Configure tooling

2. **Complete Phase 2**: Foundational (~1-2 days)
   - TDD: Write all tests first
   - Implement types, utils, services
   - Setup Redux store
   - CRITICAL GATE: Everything must pass before proceeding

3. **Complete Phase 3**: User Story 1 (~1-2 days)
   - TDD: Write E2E/integration tests first (FAIL)
   - Implement create/view tasks
   - Implement LocalStorage persistence
   - Tests should now PASS (Green)
   - **STOP and VALIDATE**: Test independently

4. **Complete Phase 4**: User Story 4 (~0.5-1 day)
   - TDD: Write responsive tests first
   - Add responsive Tailwind classes
   - Test on multiple screen sizes
   - **MVP COMPLETE**: Deploy/demo capable!

5. **Optional Incremental Delivery**:
   - Add Phase 5 (US2 - toggle/delete) → Deploy
   - Add Phase 6 (US5 - offline/PWA) → Deploy
   - Add Phase 7 (US3 - edit) → Deploy
   - Add Phase 8 (Polish) → Final release

### Parallel Team Strategy

With 2-3 developers after Phase 2:

- **Developer A**: US1 (Phase 3) - Core MVP
- **Developer B**: US4 (Phase 4) - Responsive
- **Developer C**: US2 (Phase 5) - Toggle/Delete

Once foundational phase complete, developers can work independently on different user stories.

### TDD Workflow (Red-Green-Refactor)

**CRITICAL**: Follow TDD strictly per Constitution IV

1. **RED**: Write test → Verify it FAILS
2. **GREEN**: Write minimal code → Test passes
3. **REFACTOR**: Improve code quality (tests still pass)
4. **REPEAT**: Next test

---

## Notes

- **[P] tasks**: Different files, no dependencies, run in parallel
- **[Story] label**: Maps task to specific user story for traceability
- **TDD REQUIRED**: Tests before implementation (Constitution IV)
- **Each user story independently testable**: Can stop after any phase
- **MVP = Phase 1 + 2 + 3 + 4**: Minimal deployable product
- **Verify tests fail before implementing**: Ensures tests actually work
- **Commit after each task**: Or logical groups for clean history
- **No cross-story dependencies**: Each story is self-contained

---

## Task Count Summary

- **Phase 1 (Setup)**: 24 tasks
- **Phase 2 (Foundational)**: 27 tasks
- **Phase 3 (US1 - MVP Core)**: 17 tasks
- **Phase 4 (US4 - Responsive)**: 13 tasks
- **Phase 5 (US2 - Complete/Delete)**: 14 tasks
- **Phase 6 (US5 - Offline PWA)**: 20 tasks
- **Phase 7 (US3 - Edit)**: 17 tasks
- **Phase 8 (Polish)**: 57 tasks

**Total**: 189 tasks

**MVP Scope** (Phases 1-4): 81 tasks
**Full Feature Set**: 189 tasks

---

## Success Criteria Mapping

- **SC-001** (5s task creation): US1 Phase 3
- **SC-002** (<2s load on 3G): US5 Phase 6 + T164
- **SC-003** (offline CRUD): US5 Phase 6
- **SC-004** (responsive 320-2560px): US4 Phase 4
- **SC-005** (95% creation success): US1 Phase 3
- **SC-006** (install on all browsers): US5 Phase 6
- **SC-007** (44x44px touch targets): US4 Phase 4
- **SC-008** (1000+ tasks <1s): Phase 8 T163
- **SC-009** (offline days/weeks): US5 Phase 6
- **SC-010** (zero data loss): US5 Phase 6 + T144-148

All functional requirements (FR-001 to FR-015) mapped to specific user story phases.
