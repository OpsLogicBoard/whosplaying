// Flat config — consumed by all apps/packages. Keep minimal; per-app extras stack on top.
module.exports = [
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/.expo/**', '**/build/**'],
  },
  {
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
]
