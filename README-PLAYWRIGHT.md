# Playwright Testing Framework for Ticket Booking System

This document describes the complete Playwright testing framework for the TicketHub booking system.

## Project Structure

```
tests/
├── auth.spec.ts              # Authentication flow tests
├── dashboard.spec.ts         # User dashboard tests
├── pages/                    # Page Object Models
│   ├── auth.page.ts          # Authentication page object
│   ├── dashboard.page.ts     # Dashboard page object
│   └── events.page.ts        # Events page object
├── fixtures/                 # Test data and fixtures
│   └── test-data.ts          # Test user data generators
└── helpers/                  # Utility functions
    └── auth-helper.ts        # Authentication helper functions
```

## Test Coverage

### 1. Authentication Tests (`auth.spec.ts`)
- ✅ Page load and element visibility
- ✅ User sign up with new account
- ✅ Error handling for existing email
- ✅ Sign in with valid credentials
- ✅ Error handling for invalid credentials
- ✅ Form validation for required fields
- ✅ Tab switching between sign in and sign up

### 2. Dashboard Tests (`dashboard.spec.ts`)
- ✅ Dashboard page load with user information
- ✅ Empty bookings state display
- ✅ Booking creation and display
- ✅ Navigation back to events
- ✅ Booking statistics accuracy
- ✅ Booking details verification

## Page Object Models

### AuthPage (`tests/pages/auth.page.ts`)
Encapsulates all interactions with the authentication page:
- Sign in/Sign up tab switching
- Form filling and submission
- Element visibility checks

### DashboardPage (`tests/pages/dashboard.page.ts`)
Handles dashboard interactions:
- Booking list viewing
- Statistics checking
- Navigation controls

### EventsPage (`tests/pages/events.page.ts`)
Manages events page operations:
- Event browsing
- Booking creation
- Navigation to dashboard

## Setup and Installation

1. **Install Playwright**:
```bash
npm install @playwright/test --save-dev
npx playwright install
```

2. **Run Tests**:
```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test tests/auth.spec.ts

# Run tests in headed mode
npx playwright test --headed

# Run tests in specific browser
npx playwright test --project=chromium

# Debug tests
npx playwright test --debug
```

3. **View Test Results**:
```bash
npx playwright show-report
```

## Configuration

The `playwright.config.ts` file includes:
- Test directory configuration
- Browser projects (Chromium, Firefox, WebKit)
- Base URL for the application
- Retry and timeout settings
- Screenshot and video capture on failure
- Web server configuration

## Test Data Management

### Fixtures (`tests/fixtures/test-data.ts`)
- `generateTestUser()`: Creates unique test users with timestamp
- Predefined valid/invalid credentials for testing

### Helpers (`tests/helpers/auth-helper.ts`)
- `signUpAndLogin()`: Complete user registration flow
- `login()`: Quick login for existing users
- `logout()`: Sign out functionality

## Best Practices

1. **Use Page Object Models**: All page interactions go through POM classes
2. **Data Test IDs**: Components use `data-testid` attributes for reliable selection
3. **Wait Strategies**: Proper waits for navigation and async operations
4. **Unique Test Data**: Each test run uses unique emails to avoid conflicts
5. **Parallel Execution**: Tests can run in parallel safely
6. **Screenshots on Failure**: Automatic capture for debugging
7. **Retries**: Configured retries for flaky test handling

## Running Tests in CI/CD

The framework is CI-ready with:
- Automatic browser installation
- Headless mode by default
- HTML report generation
- Retry strategy for flaky tests
- Video recording on failures

Example GitHub Actions workflow:
```yaml
- name: Install dependencies
  run: npm ci
  
- name: Install Playwright Browsers
  run: npx playwright install --with-deps
  
- name: Run Playwright tests
  run: npx playwright test
  
- name: Upload test results
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
```

## Debugging Tests

1. **Headed Mode**:
```bash
npx playwright test --headed
```

2. **Debug Mode**:
```bash
npx playwright test --debug
```

3. **Specific Test**:
```bash
npx playwright test tests/auth.spec.ts:10 --debug
```

4. **Trace Viewer**:
```bash
npx playwright show-trace trace.zip
```

## Test Maintenance

- Update test data in `tests/fixtures/test-data.ts`
- Modify page objects when UI changes
- Keep test IDs consistent across components
- Regular test runs to catch regressions
- Update configuration for new browsers/devices

## Common Issues and Solutions

1. **Timeout Errors**: Increase timeout in `playwright.config.ts`
2. **Element Not Found**: Check data-testid attributes
3. **Flaky Tests**: Add explicit waits or increase retries
4. **Authentication Issues**: Verify Supabase configuration

## Future Enhancements

- [ ] Visual regression testing
- [ ] API testing integration
- [ ] Performance testing
- [ ] Accessibility testing
- [ ] Mobile device testing
- [ ] Cross-browser screenshot comparison
