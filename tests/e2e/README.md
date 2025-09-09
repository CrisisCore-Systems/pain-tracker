# End-to-End Testing with Playwright

This directory contains comprehensive end-to-end tests for the Pain Tracker application using Playwright.

## Setup

### Installation

```bash
# Install Playwright
npm install

# Install Playwright browsers
npx playwright install

# Install specific browsers only
npx playwright install chromium firefox webkit
```

### Configuration

The e2e tests are configured in `playwright.config.ts` with the following features:

- **Multi-browser testing**: Chrome, Firefox, Safari, and mobile browsers
- **Automatic server startup**: Starts the dev server before running tests
- **Rich reporting**: HTML, JSON, and JUnit reports
- **Screenshots and videos**: Captured on failures
- **Retry logic**: Configurable retries for CI environments

## Test Structure

### Page Object Models

- `pages/PainTrackerPage.ts` - Main application page interactions
- `utils/TestUtils.ts` - Utility functions for common operations
- `fixtures/index.ts` - Custom test fixtures and setup

### Test Suites

#### Core Functionality (`pain-tracker-core.spec.ts`)
- Application loading and basic rendering
- Pain entry creation and validation
- Form navigation and submission
- Data persistence
- Multiple entry handling

#### Analytics and Export (`analytics-export.spec.ts`)
- Analytics dashboard functionality
- Chart rendering and data visualization
- Data export (JSON/PDF)
- WCB report generation
- Empty state handling

#### Accessibility (`accessibility.spec.ts`)
- Keyboard navigation
- Screen reader compatibility
- ARIA labels and roles
- Color contrast compliance
- Reduced motion support

#### Error Handling (`error-handling.spec.ts`)
- Network error scenarios
- Invalid input validation
- Large dataset handling
- Browser compatibility edge cases
- Concurrent action handling

#### Cross-Platform (`cross-platform.spec.ts`)
- Mobile responsiveness
- Touch interactions
- Multiple screen orientations
- Browser compatibility
- Performance testing

## Running Tests

### Local Development

```bash
# Run all e2e tests
npm run test:e2e

# Run tests in headed mode (visible browser)
npm run test:e2e:headed

# Run tests with UI mode (interactive)
npm run test:e2e:ui

# Debug specific test
npm run test:e2e:debug -- --grep "should create a new pain entry"

# Run specific test file
npm run test:e2e -- analytics-export.spec.ts

# Run on specific browser
npm run test:e2e -- --project=chromium
```

### CI/CD Environment

```bash
# Run tests in CI mode (headless, with retries)
CI=true npm run test:e2e

# Generate and view HTML report
npm run test:e2e:report
```

## Test Data and Utilities

### Test Data (`fixtures/testData.ts`)
- Predefined pain entry samples
- Common test constants
- Error message patterns
- Viewport configurations

### Utility Functions (`utils/TestUtils.ts`)
- Application state management
- Accessibility testing helpers
- Network condition simulation
- Screenshot and debugging utilities

## Best Practices

### Writing Tests

1. **Use Page Object Models**: Encapsulate UI interactions in page classes
2. **Write Descriptive Test Names**: Clearly describe what the test validates
3. **Use Fixtures**: Leverage custom fixtures for consistent setup
4. **Handle Async Operations**: Use proper waits and expectations
5. **Test Edge Cases**: Include error scenarios and boundary conditions

### Test Organization

1. **Group Related Tests**: Use `describe` blocks for logical grouping
2. **Use beforeEach/afterEach**: Clean up state between tests
3. **Isolate Tests**: Each test should be independent
4. **Test Real User Flows**: Focus on end-to-end scenarios

### Performance Considerations

1. **Minimize Test Data**: Use only necessary data for each test
2. **Parallelize When Possible**: Use Playwright's parallel execution
3. **Use Efficient Selectors**: Prefer stable, semantic selectors
4. **Cache Test State**: Share expensive setup when appropriate

## Troubleshooting

### Common Issues

#### Browser Installation
```bash
# If browsers fail to install
npx playwright install --force

# Check browser status
npx playwright install --dry-run
```

#### Test Failures
```bash
# Run with debug mode
npx playwright test --debug

# Generate trace for failed tests
npx playwright test --trace=on
```

#### CI/CD Issues
```bash
# Run with verbose logging
npx playwright test --reporter=verbose

# Check system requirements
npx playwright install-deps
```

### Debug Mode

Playwright provides excellent debugging capabilities:

1. **Playwright Inspector**: Step through tests interactively
2. **Trace Viewer**: Analyze test execution with timeline
3. **Screenshots**: Automatic capture on failures
4. **Video Recording**: Full test execution videos

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: E2E Tests
on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Coverage and Metrics

The e2e tests cover the following user journeys:

- ✅ First-time user onboarding
- ✅ Pain entry creation and management
- ✅ Multi-step form navigation
- ✅ Data visualization and analytics
- ✅ Export functionality
- ✅ WCB report generation
- ✅ Mobile and responsive design
- ✅ Accessibility compliance
- ✅ Error handling and edge cases
- ✅ Cross-browser compatibility
- ✅ Performance testing

## Future Enhancements

1. **Visual Regression Testing**: Screenshot comparison tests
2. **API Testing**: Backend integration tests
3. **Load Testing**: Performance under stress
4. **Internationalization**: Multi-language testing
5. **Advanced Accessibility**: Automated a11y scanning
6. **Security Testing**: XSS and injection testing