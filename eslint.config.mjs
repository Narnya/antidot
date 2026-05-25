// Flat ESLint config for the monorepo (infrastructure tooling only).
// Minimal, non-type-checked ruleset for INFRA-002; per-package/app rules can be
// added later (e.g. React Native / Next.js) in their own tickets.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/.expo/**',
      '**/.next/**',
      'docs/**',
      'promo-assets/**',
      // Tooling config files (CommonJS/ESM build config — not application source).
      '**/*.config.{js,cjs,mjs}',
      // Framework-generated type shims (should not be edited or linted).
      '**/next-env.d.ts',
      '**/expo-env.d.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
);
