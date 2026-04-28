module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/vue3-recommended',
    'prettier',
  ],
  plugins: ['@typescript-eslint', 'vue'],
  rules: {
    'vue/multi-word-component-names': 'off',
    'vue/html-self-closing': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    'vue/max-attributes-per-line': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/consistent-type-imports': 'error',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
  ignorePatterns: [
    'dist',
    'node_modules',
    'src/lib/cnki2bib/__fixtures__',
    '*.cjs',
    'coverage',
  ],
};
