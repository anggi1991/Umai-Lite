import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactNative from 'eslint-plugin-react-native';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';

export default [
  {
    ignores: [
      '**/eslint.config.js',
      '**/.eslintrc.js',
      '**/app.config.js',
      '**/expo-env.d.ts',
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/*.d.ts',
      '**/MASCOT/**',
      '**/scripts/**',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { 
          jsx: true,
          tsx: true 
        },
      },
      globals: {
        process: true,
        console: true,
        module: true,
        require: true,
        setTimeout: true,
        setInterval: true,
        clearInterval: true,
        clearTimeout: true,
        fetch: true,
        __DEV__: true,
        FormData: true,
        Blob: true,
        localStorage: true,
        window: true,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      react,
      'react-native': reactNative,
    },
    rules: {
      'no-console': 'off', // Allow console in development
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', {  // Changed to warn instead of error
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_',
        'caughtErrorsIgnorePattern': '^_',
        'destructuredArrayIgnorePattern': '^_'
      }],
      '@typescript-eslint/no-explicit-any': 'off',
      'react/react-in-jsx-scope': 'off',
      'no-case-declarations': 'warn', // Changed to warn
      'no-undef': 'warn', // Changed to warn
    },
  },
  {
    files: ['app.config.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        require: true,
        process: true,
        module: true,
        console: true,
      },
    },
    rules: {
      'no-undef': 'off',
      'no-unused-vars': 'warn',
    },
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/__tests__/**'],
    languageOptions: {
      globals: {
        jest: true,
        describe: true,
        it: true,
        expect: true,
        beforeEach: true,
        afterEach: true,
        beforeAll: true,
        afterAll: true,
      },
    },
  },
  {
    files: ['supabase/functions/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: null, // Disable project for supabase functions
      },
    },
    rules: {
      'no-undef': 'off',
    },
  },
  prettier,
];