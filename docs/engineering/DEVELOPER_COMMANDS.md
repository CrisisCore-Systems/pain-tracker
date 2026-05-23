# Developer Commands

This page holds the routine developer commands and workflow notes that do not need to live in the top-level README.

## Primary Commands

Use PowerShell commands by default.

```powershell
npm run dev
npm run doctor
npm run check:quick
npm run check
npm run lint -- --fix
```

## Verification Commands

```powershell
npm run test:coverage
npm run test:seo
npm run security-full
npm run build
```

## Typechecking and Testing

```powershell
npm run typecheck:ci
npm run test
npm run test:watch
npm run e2e
npm run accessibility:scan
```

## Optional Makefile Shortcuts

The repository includes a Makefile for contributors using WSL or another POSIX shell. On Windows, prefer the npm commands above unless you already run the project through WSL or Git Bash.

```text
make setup
make doctor
make dev
make test
make check
make lint-fix
```

## Commit Conventions

- `feat(scope): add new feature`
- `fix(api): resolve endpoint issue`
- `docs(readme): update documentation`
- `chore(deps): upgrade dependencies`

Examples:

```text
feat(tracker): add pain heatmap visualization
fix(api): resolve WCB integration timeout
docs(readme): simplify top-level docs
```

Skip tags supported by repo automation:

- `[skip lint]`
- `[skip build]`
- `[skip all]`

## Related Docs

- [../README.md](../README.md)
- [../../QUICKSTART.md](../../QUICKSTART.md)
- [ARCHITECTURE.md](ARCHITECTURE.md)
- [QUICK_START_TESTING.md](QUICK_START_TESTING.md)
