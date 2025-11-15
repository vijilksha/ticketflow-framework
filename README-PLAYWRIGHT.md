# Playwright Testing Framework - SOLID Principles & Data-Driven Testing

This Playwright testing framework follows SOLID principles for maintainable and scalable test automation with comprehensive data-driven testing capabilities.

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
├── fixtures/
│   ├── page-fixtures.ts           # Page object fixtures for dependency injection
│   ├── api-fixtures.ts            # API client fixtures
│   ├── data-fixtures.ts           # Data reader fixtures
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
│   └── data-reader.ts             # CSV and JSON data reader utility
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

### 5. Reusable Components
- Test data generators
- Authentication helpers
- Common utilities
- Data reader utilities

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
