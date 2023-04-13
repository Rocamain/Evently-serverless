module.exports = {
  env: {
    commonjs: true,
    node: true,
    jest: true,
    es2021: true,
  },
  extends: ['standard', 'eslint-config-prettier'],
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    semi: ['error', 'never'],
    'line-break-style': 'off',
    'linebreak-style': 'off',
    'no-use-before-define': 'off',
    'import/prefer-default-export': 'off',
    'comma-dangle': 'off',
    'no-console': 'off',
    'import/no-extraneous-dependencies': 'off',
  },
}
