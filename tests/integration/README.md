# Integration Tests

Integration tests combine UI interactions (via Page Objects) with API calls to test complete end-to-end user workflows. These tests verify that data flows correctly between the frontend and backend, ensuring the application works as a cohesive system.

## Test Suites

### Authentication Integration (`auth-integration.spec.ts`)
Tests complete authentication workflows:
- **Complete signup flow**: UI signup → API verification → UI dashboard access
- **Complete signin flow**: API user creation → UI login → API session verification
- **Complete logout flow**: UI login → UI logout → API session invalidation
- **Authentication persistence**: UI login → Page reload → Session maintained

### Booking Integration (`booking-integration.spec.ts`)
Tests complete booking workflows:
- **Complete booking flow**: UI login → Browse events → Create booking → API verification
- **Booking data consistency**: API booking → UI verification → API data match
- **Event availability update**: UI booking → API event verification → Seats decreased
- **Concurrent bookings**: Multiple users → Same event → Data consistency

### Dashboard Integration (`dashboard-integration.spec.ts`)
Tests complete dashboard workflows:
- **Dashboard data sync**: API bookings → UI display → Real-time updates
- **Profile data sync**: UI profile update → API verification → Dashboard reflects changes
- **Empty state handling**: New user → No bookings → UI shows empty state → API confirms
- **Booking statistics**: Multiple bookings → UI aggregates → API validates totals
- **Navigation flow**: Dashboard → Events → Booking → Back to Dashboard → Data persists

## Key Features

### Hybrid Testing Approach
Integration tests use both:
- **Page Objects**: For UI interactions and validations
- **API Client**: For direct backend operations and verifications

### Data Flow Verification
Each test verifies data consistency across:
1. **UI State**: What users see in the browser
2. **API Responses**: What the backend returns
3. **Database State**: What's actually stored

### Real-World Scenarios
Tests simulate actual user journeys:
- Complete signup to first booking flow
- Multiple bookings and data aggregation
- Concurrent user operations
- Navigation between pages with state persistence

## Running Integration Tests

### Run all integration tests
```bash
npx playwright test tests/integration
```

### Run specific integration suite
```bash
# Authentication integration tests
npx playwright test tests/integration/auth-integration.spec.ts

# Booking integration tests
npx playwright test tests/integration/booking-integration.spec.ts

# Dashboard integration tests
npx playwright test tests/integration/dashboard-integration.spec.ts
```

### Run with UI mode (recommended for debugging)
```bash
npx playwright test tests/integration --ui
```

### Run with specific browser
```bash
npx playwright test tests/integration --project=chromium
```

## Test Structure

Each integration test follows this pattern:

```typescript
test('Test name: Step 1 → Step 2 → Step 3', async ({ 
  authPage,    // UI page objects
  eventsPage, 
  dashboardPage 
}) => {
  // Initialize API client
  const apiClient = new ApiClient();
  await apiClient.init();
  
  // Step 1: Perform UI action
  await authPage.navigate();
  await authPage.fillSignupForm(...);
  
  // Step 2: Verify via API
  const { data } = await apiClient.getProfile(userId);
  expect(data).toBeDefined();
  
  // Step 3: Verify in UI
  await expect(dashboardPage.page.getByText(...)).toBeVisible();
  
  // Cleanup
  await apiClient.dispose();
});
```

## Best Practices

### 1. Test Complete User Journeys
Focus on end-to-end flows that users actually perform:
```typescript
// Good: Complete flow
test('User can signup, browse events, and create booking', async ({ ... }) => {
  // Test entire journey from start to finish
});

// Avoid: Isolated steps without context
test('User can click signup button', async ({ ... }) => {
  // Too granular for integration tests
});
```

### 2. Verify Data at Multiple Levels
Check consistency across UI, API, and database:
```typescript
// Create booking via UI
await eventsPage.selectEvent();
await eventsPage.bookEvent();

// Verify in UI
await expect(dashboardPage.page.getByText('Booking confirmed')).toBeVisible();

// Verify via API
const { data } = await apiClient.getUserBookings(userId);
expect(data).toHaveLength(1);
```

### 3. Use Both UI and API Actions
Combine UI and API operations strategically:
```typescript
// Fast: Create test data via API
await apiClient.createBooking(...);

// Thorough: Verify results in UI
await dashboardPage.navigate();
await expect(dashboardPage.page.getByText('Booking #123')).toBeVisible();
```

### 4. Handle Session Management
Properly manage authentication between UI and API:
```typescript
// Get session from UI
const sessionData = await page.evaluate(() => {
  const session = localStorage.getItem('supabase.auth.token');
  return session ? JSON.parse(session) : null;
});

// Use session in API calls
apiClient.setAuthToken(sessionData.currentSession.access_token);
```

### 5. Clean Up Resources
Always dispose of API clients and clean up test data:
```typescript
test.afterEach(async () => {
  await apiClient.dispose();
});
```

## Debugging Integration Tests

### View Test Steps
```bash
npx playwright test tests/integration --debug
```

### Check Both UI and API Logs
When tests fail, check:
1. Browser console logs
2. Network requests
3. API response status codes
4. Database state

### Use Traces
```bash
npx playwright test tests/integration --trace on
npx playwright show-report
```

## Common Integration Patterns

### Pattern 1: API Setup, UI Verification
```typescript
// Fast data setup via API
const { data } = await apiClient.createBooking(...);

// Verify user can see it in UI
await dashboardPage.navigate();
await expect(page.getByText(data.event.title)).toBeVisible();
```

### Pattern 2: UI Action, API Verification
```typescript
// User performs action in UI
await eventsPage.bookEvent();

// Verify backend state changed correctly
const { data } = await apiClient.getEvents();
expect(data[0].available_seats).toBe(initialSeats - 1);
```

### Pattern 3: Round-Trip Verification
```typescript
// Create via UI
await authPage.fillSignupForm(...);
await authPage.submitSignup();

// Verify via API
const { data } = await apiClient.getProfile(userId);

// Verify shows in UI
await expect(dashboardPage.page.getByText(data.full_name)).toBeVisible();
```

## Test Data Management

Integration tests use:
- **Unique test users**: Generated via `generateTestUser()`
- **Real event data**: Fetched from actual database
- **Isolated test data**: Each test creates its own users and bookings

## CI/CD Considerations

Integration tests are:
- **Slower**: Combine UI and API operations
- **More comprehensive**: Test complete workflows
- **More realistic**: Mirror actual user behavior

Run integration tests:
- Before major releases
- After significant feature changes
- When debugging cross-layer issues

## Related Documentation

- [Page Object Model](../pages/README.md)
- [API Testing](../api/README.md)
- [Test Fixtures](../fixtures/README.md)
- [Main README](../../README-PLAYWRIGHT.md)
