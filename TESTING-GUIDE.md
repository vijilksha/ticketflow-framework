# Complete Testing Framework Guide for TicketHub

## 📚 Table of Contents
1. [Introduction to Testing](#introduction-to-testing)
2. [Testing Framework Overview](#testing-framework-overview)
3. [Setup and Installation](#setup-and-installation)
4. [Testing Topics Covered](#testing-topics-covered)
5. [Hands-On Examples](#hands-on-examples)
6. [Best Practices](#best-practices)
7. [CI/CD Integration](#cicd-integration)

---

## 🎯 Introduction to Testing

### What is Software Testing?
Software testing is the process of evaluating and verifying that a software application does what it's supposed to do. It helps prevent bugs, reduces development costs, and improves performance.

### Why Test?
- **Quality Assurance**: Ensures the app works as expected
- **Bug Detection**: Catches issues before users do
- **Confidence**: Allows safe refactoring and updates
- **Documentation**: Tests serve as living documentation
- **Cost Savings**: Finding bugs early is cheaper than fixing them in production

### Types of Testing
1. **Unit Tests**: Test individual functions/components in isolation
2. **Integration Tests**: Test how different parts work together
3. **End-to-End (E2E) Tests**: Test complete user workflows
4. **API Tests**: Test backend endpoints directly
5. **Performance Tests**: Measure speed and resource usage
6. **Regression Tests**: Ensure new changes don't break existing features

---

## 🛠 Testing Framework Overview

### Playwright - Our Testing Framework

**What is Playwright?**
Playwright is a modern testing framework created by Microsoft that allows you to:
- Automate web browsers (Chrome, Firefox, Safari)
- Test web applications like a real user would
- Run tests in parallel for speed
- Generate screenshots and videos of test runs

**Key Features:**
- Cross-browser testing
- Auto-waiting for elements
- Mobile device emulation
- Network interception
- Parallel execution
- Built-in reporting

### Project Structure
```
tests/
├── api/                    # API endpoint tests
│   ├── auth.api.spec.ts
│   ├── events.api.spec.ts
│   └── bookings.api.spec.ts
├── integration/            # Combined UI + API tests
│   ├── auth-integration.spec.ts
│   ├── booking-integration.spec.ts
│   └── dashboard-integration.spec.ts
├── data-driven/           # Tests using external data files
│   ├── auth-data-driven.spec.ts
│   └── events-data-driven.spec.ts
├── performance/           # Speed and load tests
│   ├── page-load-performance.spec.ts
│   └── api-performance.spec.ts
├── regression/            # Catch breaking changes
│   ├── functional-regression.spec.ts
│   └── visual-regression.spec.ts
├── pages/                 # Page Object Models
│   ├── auth.page.ts
│   ├── events.page.ts
│   └── dashboard.page.ts
├── fixtures/              # Reusable test setup
├── utils/                 # Helper functions
└── data/                  # Test data files
```

---

## 📦 Setup and Installation

### Prerequisites
```bash
# Node.js (v18 or higher)
node --version

# Package manager
npm --version
```

### Installation Steps

1. **Install Dependencies**
```bash
npm install
```

2. **Install Playwright Browsers**
```bash
npx playwright install
```

3. **Set Up Environment Variables**
Create a `.env` file (already exists in this project):
```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

4. **Run Your First Test**
```bash
# Run all tests
npm run test

# Run specific test file
npx playwright test tests/auth.spec.ts

# Run with UI mode (interactive)
npx playwright test --ui

# Run in headed mode (see browser)
npx playwright test --headed
```

---

## 📖 Testing Topics Covered

### 1. **Basic E2E Testing** (`auth.spec.ts`, `events.spec.ts`)

**What you'll learn:**
- Writing your first test
- Locating elements on a page
- Simulating user interactions
- Making assertions

**Example:**
```typescript
test('user can sign in', async ({ page }) => {
  // Navigate to page
  await page.goto('/auth');
  
  // Fill in form
  await page.fill('[data-testid="signin-email"]', 'test@example.com');
  await page.fill('[data-testid="signin-password"]', 'password123');
  
  // Click button
  await page.click('[data-testid="signin-button"]');
  
  // Verify navigation
  await expect(page).toHaveURL('/events');
});
```

### 2. **Page Object Model (POM)** (`pages/`)

**What you'll learn:**
- Organizing test code
- Reusable page methods
- Separation of concerns
- Maintainable test structure

**Example:**
```typescript
// pages/auth.page.ts
export class AuthPage {
  async signIn(email: string, password: string) {
    await this.page.fill('[data-testid="signin-email"]', email);
    await this.page.fill('[data-testid="signin-password"]', password);
    await this.page.click('[data-testid="signin-button"]');
  }
}

// Using in test
test('sign in with POM', async ({ authPage }) => {
  await authPage.signIn('test@example.com', 'password123');
  await expect(authPage.page).toHaveURL('/events');
});
```

### 3. **API Testing** (`api/`)

**What you'll learn:**
- Testing backend endpoints directly
- HTTP methods (GET, POST, PUT, DELETE)
- Request/response validation
- Authentication headers
- Status code assertions

**Example:**
```typescript
test('fetch events via API', async ({ request }) => {
  const response = await request.get('/api/events');
  
  expect(response.status()).toBe(200);
  const data = await response.json();
  expect(data).toBeInstanceOf(Array);
});
```

### 4. **Integration Testing** (`integration/`)

**What you'll learn:**
- Combining UI and API tests
- Testing complete user workflows
- State management across tests
- Real-world scenarios

**Example:**
```typescript
test('complete booking flow', async ({ page, request }) => {
  // Sign in via UI
  await page.goto('/auth');
  await page.fill('[data-testid="signin-email"]', 'user@test.com');
  await page.click('[data-testid="signin-button"]');
  
  // Verify via API
  const response = await request.get('/api/user/bookings');
  expect(response.status()).toBe(200);
  
  // Continue with UI booking
  await page.click('[data-testid="book-event"]');
  await expect(page.locator('text=Booking confirmed')).toBeVisible();
});
```

### 5. **Data-Driven Testing** (`data-driven/`)

**What you'll learn:**
- Running same test with different data
- CSV and JSON data files
- Parameterized tests
- Test data management

**Example:**
```typescript
// Load test data from JSON
const testUsers = require('../data/user-profiles.json');

testUsers.forEach(user => {
  test(`login with ${user.email}`, async ({ page }) => {
    await page.goto('/auth');
    await page.fill('[data-testid="signin-email"]', user.email);
    await page.fill('[data-testid="signin-password"]', user.password);
    await page.click('[data-testid="signin-button"]');
    await expect(page).toHaveURL('/events');
  });
});
```

### 6. **Fixtures** (`fixtures/`)

**What you'll learn:**
- Reusable test setup
- Dependency injection
- Custom test contexts
- Clean test architecture

**Example:**
```typescript
// fixtures/page-fixtures.ts
export const test = base.extend({
  authPage: async ({ page }, use) => {
    const authPage = new AuthPage(page);
    await use(authPage);
  }
});

// Use in tests
test('use fixture', async ({ authPage }) => {
  await authPage.signIn('test@example.com', 'password');
});
```

### 7. **Performance Testing** (`performance/`)

**What you'll learn:**
- Measuring page load times
- API response times
- Performance budgets
- Bottleneck identification

**Example:**
```typescript
test('page loads under 3 seconds', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/events');
  const loadTime = Date.now() - startTime;
  
  expect(loadTime).toBeLessThan(3000);
});
```

### 8. **Regression Testing** (`regression/`)

**What you'll learn:**
- Preventing breaking changes
- Visual regression testing
- Functional regression testing
- Change detection

**Example:**
```typescript
test('visual regression', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('homepage.png');
});
```

### 9. **Custom Reporting** (`utils/custom-reporter.ts`)

**What you'll learn:**
- Creating custom test reporters
- Test result formatting
- HTML report generation
- Metrics tracking

### 10. **CI/CD Integration** (`Jenkinsfile`)

**What you'll learn:**
- Automated test execution
- Pipeline configuration
- Parallel test runs
- Deployment gates

---

## 🎓 Hands-On Examples

### Exercise 1: Write Your First Test

**Task:** Test the homepage navigation

```typescript
import { test, expect } from '@playwright/test';

test('homepage has correct title', async ({ page }) => {
  // 1. Navigate to homepage
  await page.goto('/');
  
  // 2. Check the title
  await expect(page).toHaveTitle(/TicketHub/);
  
  // 3. Verify "Get Started" button exists
  const getStartedButton = page.locator('text=Get Started');
  await expect(getStartedButton).toBeVisible();
  
  // 4. Click and verify navigation
  await getStartedButton.click();
  await expect(page).toHaveURL('/auth');
});
```

### Exercise 2: Create a Page Object

**Task:** Create a page object for the Events page

```typescript
// pages/events.page.ts
import { Page, Locator } from '@playwright/test';

export class EventsPage {
  readonly page: Page;
  readonly eventsHeader: Locator;
  readonly eventCards: Locator;

  constructor(page: Page) {
    this.page = page;
    this.eventsHeader = page.locator('h2:has-text("Upcoming Events")');
    this.eventCards = page.locator('[data-testid="event-card"]');
  }

  async goto() {
    await this.page.goto('/events');
  }

  async getEventCount(): Promise<number> {
    return await this.eventCards.count();
  }

  async bookFirstEvent() {
    await this.eventCards.first().locator('button:has-text("Book Now")').click();
  }
}
```

### Exercise 3: API Test with Authentication

**Task:** Test the bookings API endpoint

```typescript
test('get user bookings', async ({ request }) => {
  // Sign in and get token
  const loginResponse = await request.post('/auth/v1/token?grant_type=password', {
    data: {
      email: 'test@example.com',
      password: 'testpassword123'
    }
  });
  
  const { access_token } = await loginResponse.json();
  
  // Make authenticated request
  const bookingsResponse = await request.get('/rest/v1/bookings', {
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'apikey': process.env.VITE_SUPABASE_PUBLISHABLE_KEY!
    }
  });
  
  expect(bookingsResponse.status()).toBe(200);
  const bookings = await bookingsResponse.json();
  expect(Array.isArray(bookings)).toBeTruthy();
});
```

---

## ✅ Best Practices

### 1. **Use Test IDs**
```typescript
// Good
<button data-testid="submit-button">Submit</button>
await page.click('[data-testid="submit-button"]');

// Avoid
await page.click('.btn-primary'); // Fragile, may break with styling changes
```

### 2. **Independent Tests**
Each test should be able to run independently:
```typescript
test.beforeEach(async ({ page }) => {
  // Set up fresh state for each test
  await page.goto('/');
});
```

### 3. **Meaningful Test Names**
```typescript
// Good
test('user can book an event when logged in', ...);

// Bad
test('test 1', ...);
```

### 4. **Wait for Network Calls**
```typescript
await page.waitForResponse(response => 
  response.url().includes('/api/events') && response.status() === 200
);
```

### 5. **Use Page Objects**
Keep tests clean by abstracting page interactions into page objects.

### 6. **Handle Flaky Tests**
```typescript
// Retry flaky tests
test.describe.configure({ retries: 2 });

// Use proper waits
await expect(element).toBeVisible({ timeout: 10000 });
```

---

## 🚀 CI/CD Integration

### Jenkins Pipeline

Our Jenkins pipeline runs all tests automatically:

```groovy
pipeline {
  stages {
    stage('Install') {
      steps {
        sh 'npm install'
      }
    }
    
    stage('Test') {
      parallel {
        stage('Unit Tests') {
          steps {
            sh 'npm run test:unit'
          }
        }
        stage('E2E Tests') {
          steps {
            sh 'npm run test:e2e'
          }
        }
        stage('API Tests') {
          steps {
            sh 'npm run test:api'
          }
        }
      }
    }
    
    stage('Report') {
      steps {
        publishHTML([reportDir: 'playwright-report'])
      }
    }
  }
}
```

### Running Tests Locally vs CI

**Locally (Development):**
```bash
# Run with UI for debugging
npx playwright test --ui

# Run specific test
npx playwright test auth.spec.ts

# Debug mode
npx playwright test --debug
```

**CI (Automated):**
```bash
# Headless mode
npx playwright test

# With retries
npx playwright test --retries=2

# Generate report
npx playwright test --reporter=html
```

---

## 📊 Test Reports

### HTML Report
```bash
npx playwright test --reporter=html
npx playwright show-report
```

### Custom Report
Our custom reporter generates:
- Detailed test results
- Performance metrics
- Failure screenshots
- Test duration analysis

Location: `test-results/custom-report.json`

---

## 🎯 Quick Reference

### Common Commands
```bash
# Run all tests
npm run test

# Run specific test file
npx playwright test tests/auth.spec.ts

# Run tests in UI mode
npx playwright test --ui

# Run tests in headed mode
npx playwright test --headed

# Debug tests
npx playwright test --debug

# Generate report
npx playwright show-report

# Update snapshots
npx playwright test --update-snapshots
```

### Common Assertions
```typescript
// Visibility
await expect(element).toBeVisible();
await expect(element).toBeHidden();

// Text
await expect(element).toHaveText('Expected text');
await expect(element).toContainText('partial');

// Attributes
await expect(element).toHaveAttribute('href', '/path');

// Count
await expect(elements).toHaveCount(5);

// URL
await expect(page).toHaveURL('/expected-path');

// Title
await expect(page).toHaveTitle('Expected Title');
```

### Locator Strategies
```typescript
// By test ID (Recommended)
page.locator('[data-testid="submit-button"]');

// By text
page.locator('text=Submit');

// By role
page.getByRole('button', { name: 'Submit' });

// By placeholder
page.getByPlaceholder('Enter email');

// By label
page.getByLabel('Email address');

// CSS selector
page.locator('.btn-primary');

// XPath
page.locator('//button[@type="submit"]');
```

---

## 📚 Additional Resources

### Official Documentation
- [Playwright Docs](https://playwright.dev)
- [Playwright API](https://playwright.dev/docs/api/class-playwright)
- [Best Practices](https://playwright.dev/docs/best-practices)

### Learning Path
1. Start with basic E2E tests
2. Learn Page Object Model
3. Explore API testing
4. Practice data-driven testing
5. Implement performance tests
6. Set up CI/CD integration

### Next Steps
1. Run the existing tests: `npm run test`
2. Modify an existing test
3. Create your own test for a new feature
4. Set up the Jenkins pipeline
5. Explore the HTML reports

---

## 💡 Tips for Beginners

1. **Start Small**: Begin with simple tests before complex scenarios
2. **Use --headed Mode**: See what's happening in the browser
3. **Use --debug Mode**: Step through tests line by line
4. **Read Error Messages**: They usually tell you exactly what's wrong
5. **Use Page Objects**: Makes tests more maintainable
6. **Keep Tests Independent**: Each test should be able to run alone
7. **Use Test IDs**: More reliable than CSS selectors
8. **Practice Regularly**: Testing is a skill that improves with practice

---

## 🆘 Troubleshooting

### Test Fails with "Element not found"
- Wait for element: `await expect(element).toBeVisible()`
- Check the test ID exists in the code
- Use `--headed` mode to see what's happening

### Test Passes Locally but Fails in CI
- Check environment variables are set
- Ensure database is seeded
- Add more explicit waits

### Slow Tests
- Use `page.waitForLoadState('networkidle')` sparingly
- Run tests in parallel
- Optimize your application

---

This guide covers all the testing concepts implemented in the TicketHub project. Practice each section hands-on to build confidence in test automation!
