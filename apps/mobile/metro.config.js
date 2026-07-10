// Metro config for an Expo app inside a pnpm monorepo.
// Lets Metro watch the workspace root and resolve hoisted dependencies.
// See https://docs.expo.dev/guides/monorepos/.
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files in the monorepo.
config.watchFolders = [monorepoRoot];

// 2. Resolve modules from the app first, then the monorepo root (hoisted).
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// 3. Stub optional deps Metro can't resolve.
// @supabase/supabase-js references an optional `@opentelemetry/api` import
// (tracing) that we do not use. Metro cannot resolve optional deps, so map it to
// an empty module for every platform — otherwise web/native bundling fails with
// "Unable to resolve @opentelemetry/api".
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === '@opentelemetry/api') {
    return { type: 'empty' };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
