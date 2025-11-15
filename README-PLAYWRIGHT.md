# Playwright Testing Framework - SOLID Principles & Data-Driven Testing

This Playwright testing framework follows SOLID principles for maintainable and scalable test automation with comprehensive data-driven testing capabilities.

## CI/CD Integration

This project includes a complete **Jenkins CI/CD pipeline** configuration for automated testing and deployment.

### Quick Start with Jenkins

1. **Install Required Jenkins Plugins**: Pipeline, NodeJS, HTML Publisher, JUnit, Credentials Binding
2. **Configure Credentials**: Set up Supabase environment variables as Jenkins credentials
3. **Create Pipeline Job**: Point to the `Jenkinsfile` in the repository
4. **Configure Triggers**: Set up webhooks or SCM polling for automatic builds

### Pipeline Features

- ✅ **Parallel Test Execution**: API, Integration, E2E, and Data-Driven tests run simultaneously
- 📊 **Comprehensive Reporting**: HTML reports, JUnit results, and custom dashboards
- 🚀 **Automated Deployments**: Branch-specific deployment to staging and production
- 🔒 **Manual Approval**: Production deployments require manual confirmation
- 📦 **Artifact Archiving**: Build outputs and test results preserved
- 🎯 **Branch Strategy**: Different stages for main, develop, and feature branches

For detailed Jenkins setup instructions, see the [Jenkins README](jenkins/README.md).

## Architecture Overview

### SOLID Principles Implementation

#### 1. Single Responsibility Principle (SRP)
- **BasePage**: Handles common page operations
- **AuthPage**: Handles only authentication interactions
- **EventsPage**: Handles only events page interactions
- **DashboardPage**: Handles only dashboard interactions
- **ApiClient**: Handles only API requests

#### 2. Open/Closed Principle (OCP)
- Base classes are open for extension but closed for modification
- New page objects extend `BasePage` without modifying it
- New features can be added through inheritance

#### 3. Liskov Substitution Principle (LSP)
- All page objects can be substituted with their base type
- Derived classes maintain the contract of base classes

#### 4. Interface Segregation Principle (ISP)
- Page objects only implement methods relevant to their page
- No forced implementation of unused methods

#### 5. Dependency Inversion Principle (DIP)
- Tests depend on fixtures (abstractions) not concrete implementations
- Page objects are injected via fixtures

## Project Structure

```
tests/
├── data/                          # Test data files
│   ├── auth-test-data.csv         # Authentication test scenarios
│   ├── events-test-data.json      # Events and booking scenarios
│   └── user-profiles.json         # User profile test data
├── data-driven/                   # Data-driven test specs
│   ├── auth-data-driven.spec.ts   # Auth tests using CSV/JSON data
│   ├── events-data-driven.spec.ts # Events tests using JSON data
│   └── user-profiles-data-driven.spec.ts # User profile tests
├── integration/                   # Integration test specs
│   ├── auth-integration.spec.ts   # Authentication workflow integration tests
│   ├── booking-integration.spec.ts # Booking workflow integration tests
│   └── dashboard-integration.spec.ts # Dashboard workflow integration tests
├── performance/                   # Performance test specs
│   ├── page-load-performance.spec.ts # Page load time tests
│   ├── api-performance.spec.ts    # API response time tests
│   └── transaction-performance.spec.ts # Transaction duration tests
├── regression/                    # Regression test specs
│   ├── functional-regression.spec.ts # Functional regression tests
│   └── visual-regression.spec.ts  # Visual regression tests
├── fixtures/
│   ├── page-fixtures.ts           # Page object fixtures for dependency injection
│   ├── api-fixtures.ts            # API client fixtures
│   ├── data-fixtures.ts           # Data reader fixtures
│   ├── performance-fixtures.ts    # Performance metrics fixtures
│   └── test-data.ts               # Test data generators
├── pages/
│   ├── base.page.ts               # Base page with common functionality
│   ├── auth.page.ts               # Authentication page object
│   ├── events.page.ts             # Events page object
│   └── dashboard.page.ts          # Dashboard page object
├── api/
│   ├── api-client.ts              # API client for backend testing
│   ├── auth.api.spec.ts           # Authentication API tests
│   ├── events.api.spec.ts         # Events API tests
│   ├── bookings.api.spec.ts       # Bookings API tests
│   └── data-driven-api.spec.ts    # Data-driven API tests
├── utils/
│   ├── data-reader.ts             # CSV and JSON data reader utility
│   ├── performance-metrics.ts     # Performance measurement utilities
│   └── visual-regression.ts       # Visual comparison utilities
├── helpers/
│   └── auth-helper.ts             # Authentication helper functions
├── auth.spec.ts                   # Authentication UI tests
├── dashboard.spec.ts              # Dashboard UI tests
└── events.spec.ts                 # Events UI tests
```

## Features

### 1. Page Object Model with SOLID Principles
- Base page provides common functionality
- Each page object extends base and adds specific methods
- Encapsulation of page-specific logic

### 2. Fixture-Based Dependency Injection
- Automatic page object instantiation
- Clean test code without manual setup
- Easy to extend with new fixtures

### 3. API Testing
- Direct backend API testing
- Authentication flow testing
- Data validation
- Error handling verification

### 4. Data-Driven Testing
- CSV file support for tabular test data
- JSON file support for complex test scenarios
- Centralized test data management
- Easy to add new test cases without code changes
- Supports parameterized testing

### 5. Integration Testing
- Combines UI interactions with API calls
- Tests complete end-to-end user workflows
- Validates data consistency across layers
- Real-world user journey simulation
- Cross-layer verification (UI ↔ API ↔ Database)

### 6. Performance Testing
- Page load time measurements
- API response time benchmarking
- Transaction duration tracking
- Performance threshold validation
- Detailed performance reports

### 7. Regression Testing
- Functional regression testing
- Visual regression testing
- Critical path validation
- Screenshot comparison
- Baseline management

### 8. Reusable Components
- Test data generators
- Authentication helpers
- Common utilities
- Data reader utilities
- Performance metrics utilities
- Visual comparison utilities

## Test Reporting

This project includes comprehensive test reporting with multiple formats:

### Report Types

1. **HTML Report** - Interactive web-based report
   - Location: `playwright-report/index.html`
   - View: `npx playwright show-report`
   - Features: Screenshots, videos, traces, and detailed test results

2. **JSON Report** - Machine-readable format
   - Location: `test-results/results.json`
   - Use for CI/CD integrations and custom processing

3. **JUnit Report** - XML format for CI systems
   - Location: `test-results/junit.xml`
   - Compatible with Jenkins, GitLab CI, and other CI tools

4. **Custom HTML Summary** - Quick overview dashboard
   - Location: `test-results/summary.html`
   - Features: Visual statistics, success rates, and failed test highlights

5. **Custom JSON Report** - Enhanced test analytics
   - Location: `test-results/custom-report.json`
   - Includes detailed metrics and test categorization

### Viewing Reports

```bash
# Open HTML report in browser
npx playwright show-report

# View custom summary
open test-results/summary.html

# View JSON data
cat test-results/custom-report.json | jq
```

### Report Configuration

Reports are configured in `playwright.config.ts`:
- Traces captured on failure for debugging
- Screenshots taken on test failure
- Videos recorded for failed tests
- Custom reporter for enhanced console output

## Running Tests

### Run All Tests
```bash
npm run test
```

### Run UI Tests Only
```bash
npx playwright test tests/*.spec.ts
```

### Run API Tests Only
```bash
npx playwright test tests/api/
```

### Run Data-Driven Tests Only
```bash
npx playwright test tests/data-driven/
```

### Run Integration Tests Only
```bash
npx playwright test tests/integration/
```

### Run Performance Tests Only
```bash
npx playwright test tests/performance/
```

### Run Regression Tests Only
```bash
npx playwright test tests/regression/
```

### Run Specific Test File
```bash
npx playwright test tests/auth.spec.ts
```

### Run Tests in UI Mode
```bash
npx playwright test --ui
```

### Run Tests in Headed Mode
```bash
npx playwright test --headed
```

### Debug Tests
```bash
npx playwright test --debug
```

## Using Fixtures

### Page Object Fixtures
```typescript
import { test, expect } from './fixtures/page-fixtures';

test('my test', async ({ authPage, eventsPage }) => {
  // Page objects are automatically injected
  await authPage.goto();
  await authPage.expectPageLoaded();
});
```

### API Client Fixture
```typescript
import { test, expect } from './fixtures/api-fixtures';

test('my api test', async ({ apiClient }) => {
  // API client is automatically initialized
  const { response, data } = await apiClient.getEvents();
  expect(response.ok()).toBeTruthy();
});
```

### Data Reader Fixture
```typescript
import { test, expect } from './fixtures/data-fixtures';

test('data-driven test', async ({ dataReader }) => {
  // Read CSV data
  const csvData = dataReader.readCSV('auth-test-data.csv');
  
  // Read JSON data
  const jsonData = dataReader.readJSON('events-test-data.json');
  
  // Use data in tests
  csvData.forEach(row => {
    // Test with row data
  });
});
```

## Test Categories

This testing framework supports multiple test types to ensure comprehensive coverage:

1. **UI Tests** (`tests/*.spec.ts`) - Test user interface interactions using page objects
2. **API Tests** (`tests/api/`) - Test backend API endpoints directly
3. **Integration Tests** (`tests/integration/`) - Test complete end-to-end workflows combining UI and API
4. **Data-Driven Tests** (`tests/data-driven/`) - Test multiple scenarios with different datasets from CSV/JSON
5. **Performance Tests** (`tests/performance/`) - Measure and validate application performance metrics
6. **Regression Tests** (`tests/regression/`) - Ensure stability across releases with functional and visual testing

## Architecture Highlights

### SOLID Principles Implementation

1. **Single Responsibility Principle (SRP)**
   - Each page class handles only one page's interactions
   - API client handles only API requests
   - Integration tests orchestrate UI and API interactions
   - Utilities handle only their specific concerns (data reading, performance metrics, visual comparison)

2. **Open/Closed Principle (OCP)**
   - Base page class provides core functionality
   - Page classes extend base without modifying it
   - Easy to add new pages by extending BasePage
   - Integration tests can combine page objects in different ways

3. **Liskov Substitution Principle (LSP)**
   - All page objects can be used through BasePage interface
   - Fixtures provide consistent interfaces across tests
   - Integration tests use same page objects as UI tests

4. **Interface Segregation Principle (ISP)**
   - Separate fixtures for different concerns (pages, API, data, performance)
   - Tests only depend on fixtures they actually use
   - Integration tests compose multiple fixtures as needed

5. **Dependency Inversion Principle (DIP)**
   - Tests depend on fixtures (abstractions), not concrete implementations
   - Easy to mock or replace implementations
   - Integration tests use same abstractions as unit tests

## Writing New Tests

### Creating a New Page Object
1. Extend `BasePage`
2. Define page-specific locators
3. Implement `expectPageLoaded()` method
4. Add page-specific methods

```typescript
import { BasePage } from './base.page';

export class NewPage extends BasePage {
  protected readonly pageUrl = '/new';
  
  async expectPageLoaded(): Promise<void> {
    // Implementation
  }
  
  async customMethod(): Promise<void> {
    // Page-specific logic
  }
}
```

### Adding a New Fixture
1. Extend the test object
2. Define fixture type
3. Implement fixture logic

```typescript
type MyFixtures = {
  myFixture: MyType;
};

export const test = base.extend<MyFixtures>({
  myFixture: async ({ page }, use) => {
    const instance = new MyType(page);
    await use(instance);
  },
});
```

### Writing API Tests
1. Use API client fixture
2. Test API endpoints directly
3. Verify response structure and data

```typescript
test('api test', async ({ apiClient }) => {
  const { response, data } = await apiClient.someMethod();
  expect(response.ok()).toBeTruthy();
  expect(data).toHaveProperty('field');
});
```

## Performance Testing

### Overview
Performance testing measures page load times, API response times, and transaction durations to ensure optimal application performance.

### Performance Metrics Collected
- **Page Load Time**: Time from navigation start to page load complete
- **Time to Interactive (TTI)**: Time until page is fully interactive
- **API Response Time**: Time for API calls to complete
- **Transaction Duration**: Time for complete user flows

### Performance Thresholds

**Page Load Times:**
- Excellent: < 1000ms
- Good: < 2500ms
- Acceptable: < 4000ms

**API Response Times:**
- Excellent: < 200ms
- Good: < 500ms
- Acceptable: < 1000ms

**Transaction Times:**
- Excellent: < 2000ms
- Good: < 5000ms
- Acceptable: < 10000ms

### Running Performance Tests

```bash
# Run all performance tests
npx playwright test tests/performance/

# Run specific performance test
npx playwright test tests/performance/page-load-performance.spec.ts
npx playwright test tests/performance/api-performance.spec.ts
npx playwright test tests/performance/transaction-performance.spec.ts
```

### Performance Test Types

#### 1. Page Load Performance
Tests page load times for all major pages:
```typescript
test('Events page should load within acceptable time', async ({ page, performanceMetrics }) => {
  const loadTime = await performanceMetrics.measurePageLoad(page, '/events');
  expect(loadTime).toBeLessThan(4000);
});
```

#### 2. API Performance
Measures API response times:
```typescript
test('Events list API response time', async ({ apiClient, performanceMetrics }) => {
  const responseTime = await performanceMetrics.measureApiResponse(async () => {
    await apiClient.getEvents();
  });
  expect(responseTime).toBeLessThan(1000);
});
```

#### 3. Transaction Performance
Measures complete user workflows:
```typescript
test('Complete signup flow', async ({ authPage, performanceMetrics }) => {
  const { duration } = await performanceMetrics.measureTransaction(
    'signup_transaction',
    async () => {
      // Complete signup flow
    }
  );
  expect(duration).toBeLessThan(10000);
});
```

### Performance Reports
After each test run, detailed performance reports are generated showing:
- Count of measurements
- Min, Max, Average times
- 50th, 90th, 95th, 99th percentiles

## Visual Regression Testing

### Overview
Visual regression testing detects unintended visual changes by comparing screenshots across test runs.

### Features
- Full page screenshots
- Element-specific screenshots
- Responsive design testing (multiple viewports)
- Masked elements for dynamic content
- Dark mode testing

### Running Visual Regression Tests

```bash
# Run all visual regression tests
npx playwright test tests/regression/visual-regression.spec.ts

# Update baseline screenshots
npx playwright test tests/regression/visual-regression.spec.ts --update-snapshots
```

### Visual Test Examples

#### Full Page Comparison
```typescript
test('Landing page visual regression', async ({ page, visualRegression }) => {
  await page.goto('/');
  await visualRegression.compareFullPage(page, 'landing-page');
});
```

#### Element Comparison
```typescript
test('Event card component', async ({ page, visualRegression }) => {
  await visualRegression.compareElement(
    page,
    '[data-testid="event-card"]',
    'event-card'
  );
});
```

#### Responsive Testing
```typescript
test('Multiple viewports', async ({ page, visualRegression }) => {
  await visualRegression.compareResponsive(page, 'landing-responsive', [
    CommonViewports.MOBILE,
    CommonViewports.TABLET,
    CommonViewports.DESKTOP,
  ]);
});
```

#### Masked Elements
```typescript
test('Mask dynamic content', async ({ page, visualRegression }) => {
  await visualRegression.compareWithMask(
    page,
    'events-masked',
    ['[data-testid="event-date"]', 'time'] // Mask dynamic dates/times
  );
});
```

### Screenshot Comparison Settings
- **maxDiffPixels**: Maximum allowed pixel differences (default: 100)
- **threshold**: Pixel color difference threshold 0-1 (default: 0.2)
- **animations**: Disable animations for consistent screenshots

## Functional Regression Testing

### Overview
Functional regression tests ensure existing functionality continues to work after code changes.

### Test Coverage
- Authentication flows
- Event booking flows
- Dashboard functionality
- Navigation between pages
- Form validation
- Error handling
- Protected routes
- Data persistence

### Running Functional Regression Tests

```bash
npx playwright test tests/regression/functional-regression.spec.ts
```

### Regression Test Strategy
1. **Critical Path Testing**: Test main user journeys
2. **Integration Testing**: Test feature interactions
3. **Edge Case Testing**: Test boundary conditions
4. **Error Scenario Testing**: Test error handling

## Data-Driven Testing

### Overview
Data-driven testing allows you to run the same test logic with multiple sets of data, making tests more maintainable and comprehensive.

### CSV Data Files
Perfect for tabular data with consistent structure:

**Example: `auth-test-data.csv`**
```csv
testCase,email,password,fullName,expectedResult,description
valid_signup,test@example.com,Test123456!,Test User,success,Valid user signup
weak_password,test@example.com,test,Test User,error,Weak password test
```

### JSON Data Files
Ideal for complex, nested data structures:

**Example: `events-test-data.json`**
```json
{
  "bookingScenarios": [
    {
      "testCase": "book_single_ticket",
      "eventIndex": 0,
      "quantity": 1,
      "expectedStatus": "confirmed"
    }
  ]
}
```

### Using Data in Tests

#### CSV Data Example
```typescript
import { DataReader } from '../utils/data-reader';

const dataReader = new DataReader();
const testData = dataReader.readCSV('auth-test-data.csv');

testData.forEach((row) => {
  test(`${row.testCase}: ${row.description}`, async ({ authPage }) => {
    // Use row.email, row.password, etc.
  });
});
```

#### JSON Data Example
```typescript
const testData = dataReader.readJSON('events-test-data.json');

testData.bookingScenarios.forEach((scenario) => {
  test(`${scenario.testCase}`, async ({ eventsPage }) => {
    // Use scenario properties
  });
});
```

### Creating New Data Files

1. **Create CSV file** in `tests/data/`:
   - First row: column headers
   - Following rows: test data
   - Use commas to separate values
   - Quote values containing commas

2. **Create JSON file** in `tests/data/`:
   - Use valid JSON format
   - Structure data logically
   - Include descriptive field names

3. **Use DataReader** to load data:
   ```typescript
   const data = dataReader.readCSV('your-file.csv');
   // or
   const data = dataReader.readJSON('your-file.json');
   ```

### Data Reader Utilities

**Filter data:**
```typescript
const validUsers = dataReader.filterByColumn(data, 'expectedResult', 'success');
```

**Get unique values:**
```typescript
const testCases = dataReader.getUniqueValues(data, 'testCase');
```

## Integration Testing

### Overview
Integration tests combine UI interactions (via Page Objects) with API calls to verify complete end-to-end user workflows. These tests ensure data flows correctly between frontend and backend, validating the application works as a cohesive system.

### Running Integration Tests

```bash
# Run all integration tests
npx playwright test tests/integration

# Run specific integration suite
npx playwright test tests/integration/auth-integration.spec.ts
npx playwright test tests/integration/booking-integration.spec.ts
npx playwright test tests/integration/dashboard-integration.spec.ts

# Run with UI mode
npx playwright test tests/integration --ui
```

### Integration Test Suites

#### 1. Authentication Integration (`auth-integration.spec.ts`)
Tests complete authentication workflows:
- Complete signup flow: UI signup → API verification → UI dashboard access
- Complete signin flow: API user creation → UI login → API session verification  
- Complete logout flow: UI login → UI logout → API session invalidation
- Authentication persistence: UI login → Page reload → Session maintained

#### 2. Booking Integration (`booking-integration.spec.ts`)
Tests complete booking workflows:
- Complete booking flow: UI login → Browse events → Create booking → API verification
- Booking data consistency: API booking → UI verification → API data match
- Event availability update: UI booking → API event verification → Seats decreased
- Concurrent bookings: Multiple users → Same event → Data consistency

#### 3. Dashboard Integration (`dashboard-integration.spec.ts`)
Tests complete dashboard workflows:
- Dashboard data sync: API bookings → UI display → Real-time updates
- Profile data sync: UI profile update → API verification → Dashboard reflects changes
- Empty state handling: New user → No bookings → UI shows empty state → API confirms
- Booking statistics: Multiple bookings → UI aggregates → API validates totals
- Navigation flow: Dashboard → Events → Booking → Back to Dashboard → Data persists

### Writing Integration Tests

Integration tests use both page fixtures and API client:

```typescript
import { test, expect } from '../fixtures/page-fixtures';
import { ApiClient } from '../api/api-client';
import { generateTestUser } from '../fixtures/test-data';

test('Complete booking flow', async ({ authPage, eventsPage, dashboardPage }) => {
  // Initialize API client
  const apiClient = new ApiClient();
  await apiClient.init();
  
  const testUser = generateTestUser();
  
  // Step 1: UI - Create account and login
  await authPage.navigate();
  await authPage.fillSignupForm(testUser.email, testUser.password, testUser.fullName);
  await authPage.submitSignup();
  
  // Step 2: UI - Navigate to events
  await eventsPage.navigate();
  await expect(eventsPage.page).toHaveURL(/.*events/);
  
  // Step 3: API - Get event data
  const { data: events } = await apiClient.getEvents();
  const selectedEvent = events[0];
  
  // Step 4: Get user session for API calls
  const sessionData = await authPage.page.evaluate(() => {
    const session = localStorage.getItem('supabase.auth.token');
    return session ? JSON.parse(session) : null;
  });
  
  if (sessionData?.currentSession?.access_token) {
    apiClient.setAuthToken(sessionData.currentSession.access_token);
    const userId = sessionData.currentSession.user.id;
    
    // Step 5: API - Create booking
    const { data } = await apiClient.createBooking(
      selectedEvent.id,
      2,
      selectedEvent.price * 2,
      userId
    );
    
    expect(data[0].event_id).toBe(selectedEvent.id);
    
    // Step 6: UI - Verify booking appears in dashboard
    await dashboardPage.navigate();
    await expect(dashboardPage.page.getByText(selectedEvent.title, { exact: false })).toBeVisible();
  }
  
  // Cleanup
  await apiClient.dispose();
});
```

### Integration Testing Best Practices

1. **Test Complete User Journeys**: Focus on end-to-end flows users actually perform
2. **Verify Data at Multiple Levels**: Check consistency across UI, API, and database
3. **Use Both UI and API Actions**: Combine UI for interactions, API for fast setup
4. **Handle Session Management**: Properly manage authentication between UI and API
5. **Clean Up Resources**: Always dispose of API clients and clean up test data

### Data Flow Verification

Each integration test should verify:
- **UI State**: What users see in the browser
- **API Responses**: What the backend returns
- **Database State**: What's actually stored

### Common Integration Patterns

**Pattern 1: API Setup, UI Verification**
```typescript
// Fast data setup via API
const { data } = await apiClient.createBooking(...);

// Verify user can see it in UI
await dashboardPage.navigate();
await expect(page.getByText(data.event.title)).toBeVisible();
```

**Pattern 2: UI Action, API Verification**
```typescript
// User performs action in UI
await eventsPage.bookEvent();

// Verify backend state changed correctly
const { data } = await apiClient.getEvents();
expect(data[0].available_seats).toBe(initialSeats - 1);
```

**Pattern 3: Round-Trip Verification**
```typescript
// Create via UI
await authPage.fillSignupForm(...);
await authPage.submitSignup();

// Verify via API
const { data } = await apiClient.getProfile(userId);

// Verify shows in UI
await expect(dashboardPage.page.getByText(data.full_name)).toBeVisible();
```

## Best Practices

1. **Keep Tests Independent**: Each test should run independently
2. **Use Fixtures**: Leverage fixtures for dependency injection
3. **Follow SOLID**: Maintain single responsibility in page objects
4. **Test Both UI and API**: Cover functionality at multiple levels
5. **Use Data Generators**: Generate unique test data for each run
6. **Clean Test Data**: Use unique identifiers to avoid conflicts
7. **Meaningful Assertions**: Assert specific, meaningful values
8. **Page Object Methods**: Keep methods focused and reusable
9. **Data-Driven Tests**: Use CSV/JSON for parameterized testing
10. **Centralize Test Data**: Keep all test data in `tests/data/` directory
11. **Document Data Files**: Include descriptions in data files
12. **Version Control Data**: Track data file changes in git
13. **Monitor Performance**: Run performance tests regularly
14. **Set Realistic Thresholds**: Adjust performance thresholds based on infrastructure
15. **Update Baseline Screenshots**: Update visual baselines when designs change intentionally
16. **Mask Dynamic Content**: Mask dates, times, and dynamic IDs in visual tests
17. **Test Multiple Viewports**: Ensure responsive design works across devices
18. **Run Regression Tests**: Run before major releases
19. **Track Performance Trends**: Monitor performance metrics over time
20. **Investigate Failures**: Analyze performance degradation and visual changes

## Test Data Management

### Generate Unique Test Users
```typescript
import { generateTestUser } from './fixtures/test-data';

const testUser = generateTestUser();
// Creates unique user with timestamp-based email
```

### Predefined Test Data
```typescript
import { VALID_CREDENTIALS, INVALID_CREDENTIALS } from './fixtures/test-data';
```

## Debugging

### View Test Report
```bash
npx playwright show-report
```

### Run with Trace
Traces are automatically captured on first retry. View them in the test report.

### Screenshots
Screenshots are taken automatically on failure and saved to `test-results/`

## CI/CD Integration

The framework is configured for CI/CD:
- Retries on failure (2 retries in CI)
- HTML reporter
- Automatic test artifacts
- Video recording on failure

## API Testing Details

### Authentication API
- Sign up new users
- Sign in with credentials
- Sign out
- Error handling

### Events API
- Fetch all events
- Fetch event by ID
- Verify data structure
- Handle invalid requests

### Bookings API
- Create bookings
- Fetch user bookings
- Verify booking data
- Test authorization

## Advanced Features

### Base Page Methods
- `goto()`: Navigate to page
- `expectPageLoaded()`: Wait for page load
- `waitForNavigation()`: Wait for URL change
- `takeScreenshot()`: Capture screenshot
- `isVisible()`: Check element visibility
- `clickElement()`: Safe click with wait
- `fillInput()`: Fill input with wait
- `getTextContent()`: Extract text safely
- `countElements()`: Count matching elements

### API Client Methods
- Authentication: `signUp()`, `signIn()`, `signOut()`
- Events: `getEvents()`, `getEventById()`
- Bookings: `createBooking()`, `getUserBookings()`, `getBookingById()`
- Profile: `getProfile()`
- Token Management: `setAuthToken()`, `getAuthToken()`

## Troubleshooting

### Tests Failing in CI
- Check retry configuration
- Verify base URL is correct
- Ensure web server is running

### Page Object Not Found
- Check import paths
- Verify fixture registration
- Ensure page object extends BasePage

### API Tests Failing
- Verify backend configuration
- Check API base URL
- Confirm auth tokens are valid

## Contributing

When adding new tests or page objects:
1. Follow SOLID principles
2. Add appropriate fixtures
3. Update this README
4. Write clear, descriptive test names
5. Add comments for complex logic
