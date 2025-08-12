# Pain Tracker Development Instructions

**ALWAYS follow these instructions first. Only search for additional context if the information here is incomplete or found to be in error.**

## Project Overview

Pain Tracker is a comprehensive React TypeScript web application for tracking and analyzing chronic pain and injuries. Built with Vite, it features a 7-step pain entry form, data visualization, WCB (Workers' Compensation Board) reporting, and local browser storage.

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite 4.5.5
- **Styling**: Tailwind CSS
- **Testing**: Vitest + React Testing Library + jsdom
- **Charts**: Recharts + Chart.js
- **Linting**: ESLint 9 + Prettier
- **Deployment**: GitHub Pages via GitHub Actions

## Essential Setup Instructions

### Environment Setup (REQUIRED)
**CRITICAL**: The build will fail without proper environment variables.

```bash
# Copy environment template
cp .env.example .env

# Edit .env to include all required variables:
VITE_APP_TITLE="Pain Tracker"
VITE_WCB_API_ENDPOINT="/api/wcb"  
VITE_APP_ENVIRONMENT="development"
VITE_SENTRY_DSN=""
```

### Dependency Installation
**CRITICAL**: Must use legacy peer deps due to ESLint 9 compatibility issues.

```bash
npm install --legacy-peer-deps
```
- **Time**: ~2 minutes
- **NEVER CANCEL**: Wait for completion, dependency resolution takes time

## Build and Development Commands

### Production Build
```bash
npm run build
```
- **Time**: ~7 seconds (very fast!)
- **NEVER CANCEL**: Set timeout to 60+ minutes (though it's fast)
- **Output**: Creates optimized build in `dist/` directory
- **Requirements**: Environment variables must be set first

### Development Server
```bash
npm run dev
```
- **Time**: ~500ms startup (extremely fast!)
- **URL**: http://localhost:3000/pain-tracker/
- **Features**: Hot reload, source maps, development mode

### Type Checking
```bash
npm run typecheck
```
- **Time**: ~2 seconds
- **Status**: Works but shows TypeScript warnings (non-blocking)
- **Note**: Warnings about unused imports are expected

### Code Formatting
```bash
npm run format
```
- **Time**: ~1.5 seconds
- **Action**: Formats all TypeScript/TSX files with Prettier
- **Always run**: Before committing changes

### Linting (BROKEN)
```bash
npm run lint
```
- **Status**: ❌ **BROKEN** - ESLint 9 incompatibility with react-hooks plugin
- **Error**: `context.getSource is not a function`
- **Workaround**: Skip linting or downgrade ESLint to v8
- **CI Impact**: May cause CI failures if linting is required

### Testing
```bash
npm run test
```
- **Time**: ~8 seconds
- **NEVER CANCEL**: Set timeout to 30+ minutes
- **Status**: Runs with some failing tests (infrastructure works)
- **Environment**: jsdom + React Testing Library configured

## Application Validation Scenarios

### Complete User Flow Test
After making changes, ALWAYS test this complete scenario:

1. **Start development server**: `npm run dev`
2. **Navigate to**: http://localhost:3000/pain-tracker/
3. **Test pain entry form**:
   - Move pain slider to level 5
   - Select "lower back" location
   - Select "aching" symptom
   - Click "Next" to advance to step 2
   - Verify functional impact form loads
4. **Test navigation**:
   - Click between form tabs
   - Verify step counter updates (1-7)
   - Test Previous/Next buttons work
5. **Verify interface**:
   - Check pain history chart displays
   - Verify WCB Report button is present
   - Confirm responsive layout

### Key Features to Test
- **7-step pain tracking form**: Pain Assessment → Functional Impact → Medications → Treatments → Quality of Life → Work Impact → Comparison
- **Data visualization**: Pain history charts and analytics
- **Form validation**: Required fields and multi-step progression
- **Local storage**: Data persistence across browser sessions

## Repository Structure

### Critical Directories
- `src/components/pain-tracker/`: Main application components
- `src/components/pain-tracker/form-sections/`: 7-step form sections
- `src/services/`: API integration and WCB submission
- `src/utils/pain-tracker/`: Core business logic and calculations
- `src/test/`: Test setup and utilities
- `.github/workflows/`: CI/CD pipeline (GitHub Pages deployment)

### Important Files
- `src/App.tsx`: Main application entry point
- `src/components/pain-tracker/PainEntryForm.tsx`: Multi-step form logic
- `src/types/index.ts`: TypeScript type definitions
- `vite.config.ts`: Build configuration with Vitest setup
- `package.json`: Dependencies and scripts

## Common Development Tasks

### Adding New Pain Tracking Features
1. **Types**: Update `src/types/index.ts` for new data structures
2. **Form sections**: Add to `src/components/pain-tracker/form-sections/`
3. **Business logic**: Extend `src/utils/pain-tracker/calculations.ts`
4. **Tests**: Add tests in same directory as component
5. **Always validate**: Test complete user flow after changes

### Fixing Build Issues
1. **Environment variables**: Verify `.env` has all required VITE_ variables
2. **Dependencies**: Use `npm install --legacy-peer-deps` only
3. **TypeScript errors**: Check `src/services/wcb-submission.ts` for template literal issues
4. **Import errors**: Verify all React imports and component exports

### Working with Tests
1. **Run tests**: `npm run test` (expect some failures)
2. **Add new tests**: Follow existing pattern in component directories
3. **Test environment**: jsdom configured, React Testing Library available
4. **Debugging**: Use `npm run test:ui` for visual test interface

## CI/CD Pipeline

### GitHub Actions Workflow
- **File**: `.github/workflows/pages.yml`
- **Trigger**: Push to main branch
- **Process**: Build → Deploy to GitHub Pages
- **Requirements**: Repository secrets for SENTRY_DSN and WCB_API_ENDPOINT
- **Build time**: ~2-3 minutes in CI environment

### Pre-commit Validation
Always run these commands before committing:
```bash
npm run format        # Format code with Prettier
npm run typecheck     # Check TypeScript (warnings OK)
npm run build         # Verify production build works
npm run test          # Run test suite (some failures expected)
```

## Troubleshooting

### Build Failures
- **"Missing env" error**: Add all VITE_ variables to `.env`
- **NPM install fails**: Use `--legacy-peer-deps` flag
- **TypeScript errors**: Check template literals in wcb-submission.ts

### Development Issues  
- **Slow startup**: Normal, Vite is very fast (~500ms)
- **Hot reload not working**: Restart dev server
- **404 errors**: Ensure using correct URL path `/pain-tracker/`

### Test Issues
- **"document is not defined"**: Vitest/jsdom configured correctly in vite.config.ts
- **Component test failures**: Many tests need updates, infrastructure works
- **Import errors**: Check test setup in `src/test/setup.ts`

## Performance Expectations

- **Initial npm install**: ~2 minutes
- **Development server startup**: ~500ms  
- **Production build**: ~7 seconds
- **Type checking**: ~2 seconds
- **Testing**: ~8 seconds
- **Code formatting**: ~1.5 seconds

**NEVER CANCEL any build or test commands.** All operations complete quickly, but set generous timeouts (60+ minutes) to avoid premature cancellation.