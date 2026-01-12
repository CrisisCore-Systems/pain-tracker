# Screenshot Suite (Automated)

This repo includes an automated Playwright screenshot suite that:
- Creates/unlocks a fresh vault ("login")
- Loads comprehensive sample user data after login
- Captures a set of key screens into a predictable folder

## Run

```powershell
npm run -s playwright:install
npm run -s e2e:screenshots
```

Optional (mobile):

```powershell
npm run -s e2e:screenshots:mobile
```

## Output

Screenshots are written to:
- `e2e/results/screenshots/<project>/`

Example:
- `e2e/results/screenshots/chromium/01-dashboard.png`

## Notes

- The suite loads `src/data/sampleData.ts` (comprehensive dataset) after vault unlock to match the "fresh account then import" workflow.
- If UI popups/toasts intercept clicks, the suite uses aggressive, test-only dismissal to keep screenshot capture deterministic.
