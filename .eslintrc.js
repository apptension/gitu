module.exports = {
  extends: [
    'airbnb-base',
    'airbnb-typescript/base',
  ],
  parserOptions: {
    project: ['./tsconfig.json'],
  },
  overrides: [
    {
      files: ['*.ts'],
    }
  ],
  ignorePatterns: [
    '.eslintrc.js',
    'dist/',
    'node_modules/',
  ],
  'rules': {
    'import/prefer-default-export': 'off',
    'no-console': 'off',
    'class-methods-use-this': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    'max-len': ["error", { "code": 120 }],
    'no-param-reassign': ['error', { 'props': false }],
  },
};
