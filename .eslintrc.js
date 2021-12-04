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
  }
};
