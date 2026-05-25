import { defineConfig } from 'vitest/config';

// Vitest is scoped to the framework-free shared packages only.
// Apps are intentionally excluded: Expo (mobile) will use jest-expo + RNTL, and the
// Next.js admin app will get its own runner later. See /docs/20_TESTING_STRATEGY.md.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['packages/**/src/**/*.{test,spec}.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', 'apps/**'],
  },
});
