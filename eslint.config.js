import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  { ignores: ['dist', 'node_modules', 'coverage'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Apply type-aware rules only to TypeScript files.
    // Three tsconfigs cover the whole project:
    //   tsconfig.app.json  — production source
    //   tsconfig.test.json — test files (extends app + vitest globals)
    //   tsconfig.node.json — vite.config.ts, vitest.config.ts
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.app.json', './tsconfig.test.json', './tsconfig.node.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
];
