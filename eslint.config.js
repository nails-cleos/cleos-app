import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import { configs, templateParser, templatePlugin, tsPlugin, } from 'angular-eslint';
import cypress from 'eslint-plugin-cypress';

export default tseslint.config(
  {
    ignores: [
      'projects/**',
      'dist/**',
      'node_modules/**',
      'coverage/**',
      'cypress/results/**',
      'cypress/screenshots/**',
      'cypress/videos/**',
    ],
  },

  js.configs.recommended,

  ...tseslint.configs.recommended,

  ...configs.tsRecommended,

  {
    files: ['**/*.ts'],

    languageOptions: {
      parserOptions: {
        project: [
          './tsconfig.json',
          './e2e/tsconfig.json',
        ],
      },
    },

    plugins: {
      '@angular-eslint': tsPlugin,
    },

    rules: {
      quotes: [
        'error',
        'single',
      ],

      semi: [
        'error',
        'always',
      ],

      'no-console': [
        'error',
        {
          allow: ['warn', 'error'],
        },
      ],

      eqeqeq: 'error',

      curly: [
        'error',
        'all',
      ],

      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
      'no-useless-escape': 'off',
      'no-undef': 'off',

      camelcase: 'error',

      'prefer-const': 'error',

      'consistent-return': 'error',

      'no-debugger': 'error',

      'no-alert': 'error',

      'no-shadow': 'off',

      'comma-dangle': [
        'error',
        'always-multiline',
      ],

      'object-curly-spacing': [
        'error',
        'always',
      ],

      'array-bracket-spacing': [
        'error',
        'never',
      ],

      '@typescript-eslint/no-explicit-any': 'off',

      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],

      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],

      'max-len': [
        'error',
        {
          code: 120,
          tabWidth: 2,
          ignoreComments: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreRegExpLiterals: true,
        },
      ],
    },
  },
  {
    files: ['cypress/**/*.ts'],
    plugins: {
      cypress,
    },
    languageOptions: {
      globals: {
        cy: 'readonly',
        Cypress: 'readonly',
        expect: 'readonly',
        assert: 'readonly',
        chai: 'readonly',
      },
    },
    rules: {
      ...cypress.configs.recommended.rules,
    },
  },
  {
    files: ['**/*.html'],
    languageOptions: {
      parser: templateParser,
    },
    plugins: {
      '@angular-eslint/template': templatePlugin,
    },
    rules: {
      ...configs.templateRecommended.rules,
      'no-shadow': 'off',
    },
  },
);
