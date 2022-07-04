/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  ignorePatterns: [
    './assets/',
    './coverage/',
    './dist/',
    './node_modules/',
    '!*.js',
    '!*.ts',
  ],
  env: {
    es6: true,
    node: true,
    jest: true,
  },
  extends: [
    'airbnb-base',
    'eslint:recommended',
    'plugin:jsdoc/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:prettier/recommended',
  ],
  plugins: ['simple-import-sort'],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    'arrow-body-style': 'warn',
    // 'eol-last': ['warn', 'always'], // Not work with Prettier?
    'function-paren-newline': 'warn',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: ['**/*.test.ts', 'scripts/**/*.ts'],
        peerDependencies: false,
      },
    ],
    'import/default': 'warn',
    'import/order': 'off',
    'import/prefer-default-export': 'off',
    'newline-after-description': 'off',
    'no-await-in-loop': 'off',
    'no-console': 'off',
    'no-empty': ['error', { allowEmptyCatch: true }],
    'no-restricted-syntax': [
      'error',
      { selector: 'TSEnumDeclaration', message: 'Do not declare enums' },
    ],
    'no-underscore-dangle': 'off',
    'object-curly-newline': 'warn',
    'simple-import-sort/imports': 'warn',
    'sort-imports': 'off',
    'spaced-comment': 'warn',
  },
  overrides: [
    {
      files: '*.js',
      rules: {
        'import/order': ['error', { 'newlines-between': 'always' }],
        'simple-import-sort/sort': 'off',
      },
    },
    {
      files: ['*.{config,d,test}.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
};
