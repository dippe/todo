module.exports = {
  root: true,
  env: { browser: true, es2022: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
    project: './tsconfig.json',
  },
  plugins: ['react-refresh', '@typescript-eslint', 'functional'],
  ignorePatterns: [
    'tests/**',
    'node_modules/**',
    'dist/**',
    'playwright.config.ts',
    'vite.config.ts',
  ],
  rules: {
    // TypeScript
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',

    // Functional Programming (disabled due to plugin issues)
    // 'functional/no-let': 'error',
    // 'functional/immutable-data': 'error',
    // 'functional/no-loop-statement': 'error',
    // 'functional/prefer-readonly-type': 'warn',

    // React (NO HOOKS - except in containers)
    'react-hooks/rules-of-hooks': 'off', // We don't use hooks
    'react/react-in-jsx-scope': 'off', // JSX transform handles this

    // Code Quality
    'max-lines-per-function': ['error', 20],
    'max-params': ['error', 3],
    complexity: ['error', 5],
    'no-magic-numbers': ['warn', { ignore: [0, 1, -1] }],
  },
  settings: {
    react: { version: 'detect' },
  },
};
