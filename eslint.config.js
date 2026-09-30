import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores([
    'dist/**',
    'public/**',
    'src/vendor/**',
    '.tmp-minutes/**',
    'artifacts/**',
    'benchmark-*/**',
    'build-illustrated-longpage/**',
    'deliverables/**',
    'draft_*/**',
    'spider-longpage/**',
    'tmp-minutes-analysis/**',
  ]),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      'react-refresh/only-export-components': [
        'error',
        { allowConstantExport: true },
      ],
    },
  },
  {
    // These editors predate the compiler-oriented React hook lint rules.
    files: ['src/modules/vibecoding/components/tower-defense/**/*.{ts,tsx}'],
    rules: {
      'prefer-const': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/rules-of-hooks': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    files: [
      'server/**/*.{js,mjs,cjs}',
      'api/**/*.{js,mjs,cjs}',
      'tests/**/*.{js,mjs,cjs}',
      'scripts/**/*.{js,mjs,cjs}',
    ],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
    },
  },
])
