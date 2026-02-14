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

const tscResult = spawnSync(
  process.execPath,
  [
    './node_modules/typescript/bin/tsc',
    '-b',
    'packages/design-system',
    'packages/services',
    'packages/utils'
  ],
  { stdio: 'inherit' }
);

if (tscResult.status !== 0) {
  process.exit(tscResult.status ?? 1);
}

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const buildResult = spawnSync(npmCommand, ['run', '-s', 'build'], {
  stdio: 'inherit'
});

process.exit(buildResult.status ?? 1);
