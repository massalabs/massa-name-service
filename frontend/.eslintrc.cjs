module.exports = {
  extends: ['@massalabs', 'plugin:react-hooks/recommended'],
  plugins: ['html', 'import'],
  rules: {
    'no-console': 'off',
    'max-len': ['error', { ignoreStrings: true, code: 120 }],
  },
};
