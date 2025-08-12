# Pain Tracker Development Instructions

Pain Tracker is a React 18 + TypeScript + Vite web application for comprehensive pain and injury tracking. The application helps users monitor pain patterns, track treatments, and generate WCB reports.

**Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Working Effectively

### Bootstrap and Build the Repository
- **CRITICAL**: Install dependencies with legacy peer deps flag:
  - `npm install --legacy-peer-deps` -- takes 2 minutes. **NEVER CANCEL**. Set timeout to 180+ seconds.
  - Standard `npm install` fails due to ESLint 9 + react-hooks plugin compatibility issues.
- **Environment Setup**: Copy and update environment variables:
  - `cp .env.example .env`
  - Add `VITE_APP_TITLE=Pain Tracker` to .env file (required for build)
- **Build Production**: 
  - `npx vite build` -- takes 8 seconds. **NEVER CANCEL**. Set timeout to 60+ seconds.
  - `npm run build` fails due to prebuild script requiring environment variables in process.env
- **Development Server**:
  - `npm run dev` -- starts in <1 second on port 3000
  - Access at: http://localhost:3000/pain-tracker/
- **Production Preview**:
  - `npm run preview` -- starts on port 4173
  - Access at: http://localhost:4173/pain-tracker/

### Testing and Code Quality
- **Run Tests**: 
  - `npm run test` -- takes 5 seconds. **NEVER CANCEL**. Set timeout to 30+ seconds.
  - Many tests fail due to DOM setup issues, but Vitest runs successfully
  - Test failures are known issues, not blocking for development
- **Type Checking**: 
  - `npm run typecheck` -- takes 2 seconds. Has TypeScript errors but syntax is correct.
  - Errors are mostly unused imports and type mismatches, not blocking for development
- **Code Formatting**: 
  - `npm run format` -- takes 2 seconds. Always run before committing.
- **Linting**: 
  - `npm run lint` -- **FAILS** due to ESLint 9 + react-hooks plugin compatibility
  - Known issue: ESLint flat config incompatible with react-hooks plugin version
  - Do not attempt to fix linting until plugin compatibility is resolved

### Validation Scenarios
- **ALWAYS** test the complete pain entry workflow after making changes:
  1. Start dev server with `npm run dev`
  2. Navigate to http://localhost:3000/pain-tracker/
  3. Test pain level slider (adjust from 0 to any value)
  4. Select pain locations (e.g., lower back, neck)
  5. Select symptoms (e.g., aching, sharp, stiffness)
  6. Click "Next section" to advance to Functional Impact
  7. Verify step counter updates and form navigation works
- **Manual UI Testing**: The application loads completely and all interactive elements work
- **Build Validation**: Always run `npx vite build` and `npm run format` before committing
- **NEVER** skip validation because commands take time - all validated commands complete quickly

## Key Technologies and Architecture

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite 4.5.5
- **Styling**: Tailwind CSS, custom CSS
- **Testing**: Vitest, React Testing Library, jsdom
- **Code Quality**: ESLint 9, Prettier, Husky
- **Charts**: Recharts, Chart.js
- **State Management**: React hooks, localStorage
- **Build**: Vite with TypeScript, source maps enabled

### Project Structure
```
src/
├── components/
│   ├── pain-tracker/           # Main pain tracking components
│   │   ├── form-sections/      # Multi-step form sections
│   │   ├── PainAssessment.tsx  # Pain level and location input
│   │   ├── PainAnalytics.tsx   # Charts and analytics
│   │   ├── WCBReport.tsx       # WCB report generation
│   │   └── index.tsx           # Main pain tracker component
│   └── ui/                     # Reusable UI components
├── hooks/                      # Custom React hooks
├── services/                   # API and external services
├── types/                      # TypeScript type definitions
├── utils/                      # Utility functions and constants
└── test/                       # Test setup and utilities
```

### Key Components and Files
- `src/components/pain-tracker/index.tsx` - Main pain tracker interface
- `src/components/pain-tracker/PainAssessment.tsx` - Pain level slider and location selection
- `src/components/pain-tracker/form-sections/` - Multi-step form implementation
- `src/components/pain-tracker/PainAnalytics.tsx` - Data visualization and charts
- `src/services/wcb-submission.ts` - WCB API integration (has syntax errors fixed)
- `src/types/index.ts` - Core TypeScript interfaces
- `vite.config.ts` - Vite configuration with Sentry plugin
- `package.json` - Dependencies and scripts

## Common Tasks and Commands

### Repository Root Contents
```
.env.example              # Environment variable template
.eslintrc.json           # Legacy ESLint config (not used)
.github/                 # GitHub workflows and configs
.gitignore              # Git ignore rules
.husky/                 # Git hooks
.prettierrc             # Prettier configuration
CONTRIBUTING.md         # Contribution guidelines
LICENSE                 # MIT license
README.md               # Project documentation
eslint.config.js        # ESLint flat config (v9)
index.html              # Vite entry point
package.json            # Dependencies and scripts
postcss.config.js       # PostCSS configuration
scripts/                # Build and utility scripts
src/                    # Source code
tailwind.config.js      # Tailwind CSS configuration
tsconfig.json           # TypeScript configuration
vite.config.ts          # Vite build configuration
```

### Package.json Scripts
```json
{
  "dev": "vite",                    // Development server
  "build": "vite build",            // Production build (fails - use npx vite build)
  "lint": "eslint .",               // Linting (fails - compatibility issue)
  "preview": "vite preview",        // Preview built app
  "test": "vitest",                 // Run tests (has failures)
  "test:ui": "vitest --ui",         // Vitest UI
  "test:coverage": "vitest run --coverage",  // Coverage report
  "typecheck": "tsc --noEmit",      // Type checking (has errors)
  "format": "prettier --write \"src/**/*.{ts,tsx}\"",  // Code formatting
  "proxy:start": "node scripts/api-proxy.mjs"  // API proxy server
}
```

### Environment Variables Required
```bash
# Frontend vars (VITE_ prefix exposes to client)
VITE_WCB_API_ENDPOINT=/api/wcb
VITE_APP_ENVIRONMENT=development
VITE_SENTRY_DSN=
VITE_APP_TITLE=Pain Tracker

# Backend secrets (never VITE_ prefixed)
WCB_API_KEY=backend_only_secret
```

## Known Issues and Workarounds

### Critical Issues
1. **npm install requires --legacy-peer-deps**: Standard install fails due to ESLint 9 + react-hooks plugin conflict
2. **npm run lint fails**: ESLint flat config incompatible with react-hooks plugin version
3. **npm run build fails**: Prebuild script expects env vars in process.env, use `npx vite build` instead
4. **Tests have DOM setup issues**: Many tests fail with "document is not defined" but Vitest runs

### Working Alternatives
- Use `npx vite build` instead of `npm run build`
- Use `npm install --legacy-peer-deps` instead of `npm install`
- Skip linting until ESLint compatibility is resolved
- Ignore test failures - they are configuration issues, not functional problems

### Timing Expectations
- **npm install --legacy-peer-deps**: ~2 minutes
- **npx vite build**: ~8 seconds
- **npm run dev**: <1 second startup
- **npm run test**: ~5 seconds (with failures)
- **npm run format**: ~2 seconds
- **npm run typecheck**: ~2 seconds (with errors)

## CI/CD and Deployment

### GitHub Actions
- **Workflow**: `.github/workflows/pages.yml`
- **Trigger**: Push to main branch
- **Process**: Build with npm ci, deploy to GitHub Pages
- **Environment**: Sets production environment variables
- **URL**: https://crisiscore-systems.github.io/pain-tracker

### Manual Deployment
```bash
npm run build          # Fails - use npx vite build instead
npx vite build         # Works - creates dist/ directory
npm run deploy         # Deploys dist/ to gh-pages branch
```

## Development Workflow

### Making Changes
1. **Start development**: `npm run dev`
2. **Make changes**: Edit files in src/
3. **Test functionality**: Complete pain entry workflow
4. **Format code**: `npm run format`
5. **Build check**: `npx vite build`
6. **Commit changes**: Git hooks run automatically

### Validation Checklist
- [ ] Dev server starts without errors
- [ ] Pain level slider responds to clicks
- [ ] Location and symptom checkboxes work
- [ ] Form navigation advances properly
- [ ] Step counter updates correctly
- [ ] Build completes successfully
- [ ] Code is formatted with Prettier

**Always validate the complete user workflow - simply starting the server is not sufficient validation.**