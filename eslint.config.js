import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import angular from '@angular-eslint/eslint-plugin';
import angularTemplate from '@angular-eslint/eslint-plugin-template';

export default tseslint.config(
  {
    ignores: [
      'projects/**',
      'dist/',
      'node_modules/',
      'coverage/',
      'cypress/results/**',
      'cypress/screenshots/**',
      'cypress/videos/**',
    ],
  },

  js.configs.recommended,

  {
    files: ['**/*.ts'],
    ...tseslint.configs.recommended,
    plugins: {
      '@angular-eslint': angular,
    },
    languageOptions: {
      parserOptions: {
        project: [
          './tsconfig.json',
          './e2e/tsconfig.json',
        ],
      },
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
      'no-unused-vars': 'error',
      'no-undef': 'error',
      camelcase: 'error',
      'prefer-const': 'error',
      'consistent-return': 'error',
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-shadow': 'error',
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

      indent: [
        'error',
        2,
        {
          SwitchCase: 1,
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
    files: ['**/*.html'],
    ...angularTemplate.configs.recommended,
  },
);
