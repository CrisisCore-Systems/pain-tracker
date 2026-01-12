Project References & Faster TypeScript Checks

This repository now includes two example package projects to demonstrate TypeScript project references:

- `packages/design-system`
- `packages/services`

What changed

- Root `tsconfig.json` now references the package tsconfigs. Run `tsc -b` to build the whole composite project.
- Each package uses `"composite": true` so they can be referenced and built separately.
- New npm scripts in `package.json`:
  - `npm run tsc-build` – runs `tsc -b` (build mode) for the whole project.
  - `npm run build:packages` – builds just `packages/design-system` and `packages/services`.
  - `npm run typecheck` – (noEmit, incremental) fast type-checking.
  - `npm run typecheck:watch` – watch mode for live checking.
  - `npm run typecheck:ci` – CI-friendly full type-check.
  - `npm run typecheck:memory:ps` – PowerShell helper that increases Node memory for slow projects.

Next steps

- Integrate your existing submodules into `packages/` (move code, add package-level tsconfig and package.json, update imports).
- Consider using `tsc -b --watch` for incremental builds of references during development.
- For dev builds, consider moving transpilation to Vite/Babel and using `tsc --noEmit` only for type checks in CI.
- For bundlers using Webpack, consider `ts-loader` with `transpileOnly: true` and `fork-ts-checker-webpack-plugin` to offload types.

If you want, I can:

- Move a selected subset of files into one package and wire imports.
- Add package-level `package.json` (with local `name` and `version`) and a small build/test script per package.
- Wire up the monorepo with pnpm workspace or npm workspaces.
