import { rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const buildHash =
  process.env.VERCEL_GIT_COMMIT_SHA ??
  process.env.VERCEL_DEPLOYMENT_ID ??
  'unknown';

process.env.VITE_BUILD_HASH = buildHash;

const pathsToRemove = [
  'packages/design-system/dist',
  'packages/services/dist',
  'packages/utils/dist',
  'packages/design-system/.tsbuildinfo',
  'packages/services/.tsbuildinfo',
  'packages/utils/.tsbuildinfo'
];

for (const pathToRemove of pathsToRemove) {
  rmSync(pathToRemove, { recursive: true, force: true });
}

function runCommand(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    ...options
  });

  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

runCommand(
  process.execPath,
  [
    './node_modules/typescript/bin/tsc',
    '-b',
    'packages/design-system',
    'packages/services',
    'packages/utils'
  ]
);

runCommand(process.execPath, ['./scripts/check-env.mjs']);
runCommand(process.execPath, ['./scripts/validate-trust-claims.js']);
runCommand(process.execPath, ['./scripts/validate-clinic-auth-env.js']);
runCommand(process.execPath, ['./node_modules/vite/bin/vite.js', 'build']);
runCommand(process.execPath, ['./scripts/seo/prerender-public-routes.mjs']);
