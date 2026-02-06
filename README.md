# TODO PWA Application

A modern, offline-capable Progressive Web App for task management, built with React, Redux Toolkit, and TypeScript.
This project adheres to strict functional programming principles, TDD, and Clean Architecture.

## Architecture Overview

This application follows a layered architecture:

- **UI Layer**: React components (functional, no hooks except in containers) and shadcn/ui.
- **Container Layer**: Connects UI to Redux store using `connect()` HOC (Flux pattern).
- **State Management**: Redux Toolkit with strict unidirectional data flow.
- **Service Layer**: Pure business logic functions (no side effects).
- **Storage Layer**: Persistence using LocalStorage with sync capabilities.

Key principles:

- **TDD**: Tests written before implementation.
- **Functional**: Pure functions, immutability.
- **SOLID**: Single responsibility, dependency inversion.
- **No Hooks**: Redux + `connect()` used instead of local state hooks where possible.
- **Strict Typing**: TypeScript strict mode enabled.

## Prerequisites

- Node.js 18+ and npm
- Git

## Setup

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd todo-pwa
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

## Commands

### Development

- `npm run dev`: Start the development server.

### Testing

- `npm test`: Run unit and integration tests.
- `npm run test:watch`: Run tests in watch mode.
- `npm run test:coverage`: Generate test coverage report.
- `npm run test:e2e`: Run Playwright E2E tests.

### Code Quality

- `npm run lint`: Run ESLint to check for code quality issues.
- `npm run lint:fix`: Fix automatic linting issues.
- `npm run format`: Format code using Prettier.

### Build

- `npm run build`: Build the application for production.
- `npm run preview`: Preview the production build locally.

## Testing Instructions

This project heavily relies on TDD.

1. **Unit Tests**: Located in `tests/unit/`. Run with `npm test`.
2. **Integration Tests**: Located in `tests/integration/`. Run with `npm test`.
3. **E2E Tests**: Located in `tests/e2e/`. Run with `npm run test:e2e`.

Ensure all tests pass before committing changes.
Coverage goal is >90%.
