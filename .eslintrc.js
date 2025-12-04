module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  plugins: ['@typescript-eslint', 'react', 'react-native'],
  parserOptions: {
    ecmaFeatures: { jsx: true },
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json'
  },
  env: { browser: true, node: true, es2021: true },
  settings: { react: { version: 'detect' } },
  rules: {
    'no-console': 'warn',
    '@typescript-eslint/no-explicit-any': 'off',
    'react/react-in-jsx-scope': 'off'
  },
  ignorePatterns: ['**/*.d.ts', 'node_modules/', 'dist/', 'build/', '*.d.ts'],
};
