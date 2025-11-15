import { test, expect } from '../fixtures/page-fixtures';
import { DataReader } from '../utils/data-reader';
import { generateTestUser } from '../fixtures/test-data';

interface EventsTestData {
  eventFilters: Array<{
    testCase: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    expectedMinCount: number;
    description: string;
  }>;
  bookingScenarios: Array<{
    testCase: string;
    eventIndex?: number;
    events?: number[];
    quantity: number;
    expectedStatus: string;
    description: string;
  }>;
}

test.describe('Events - Data Driven Tests', () => {
  const dataReader = new DataReader();
  let eventsTestData: EventsTestData;
  const testUser = generateTestUser();

  test.beforeAll(() => {
    // Load JSON test data
    eventsTestData = dataReader.readJSON<EventsTestData>('events-test-data.json');
  });

  test.beforeEach(async ({ authPage, eventsPage }) => {
    // Sign up and navigate to events page
    await authPage.goto();
    await authPage.switchToSignUp();
    await authPage.fillSignUpForm(testUser.email, testUser.password, testUser.fullName);
    await authPage.submitSignUp();
    
    await eventsPage.expectPageLoaded();
  });

  // Test booking scenarios
  eventsTestData?.bookingScenarios?.forEach((scenario) => {
    test(`${scenario.testCase}: ${scenario.description}`, async ({ page, eventsPage, dashboardPage }) => {
      if (scenario.eventIndex !== undefined) {
        // Book single event
        await eventsPage.bookEventByIndex(scenario.eventIndex);
        await page.waitForTimeout(2000);

        // Verify booking in dashboard
        await dashboardPage.goto();
        await dashboardPage.expectPageLoaded();

        const bookingsCount = await dashboardPage.getBookingsCount();
        expect(bookingsCount).toBeGreaterThan(0);
      } else if (scenario.events) {
        // Book multiple events
        for (const eventIndex of scenario.events) {
          await eventsPage.goto();
          await eventsPage.expectPageLoaded();
          await eventsPage.bookEventByIndex(eventIndex);
          await page.waitForTimeout(2000);
        }

        // Verify bookings in dashboard
        await dashboardPage.goto();
        await dashboardPage.expectPageLoaded();

        const bookingsCount = await dashboardPage.getBookingsCount();
        expect(bookingsCount).toBe(scenario.events.length);
      }
    });
  });

  // Test event display and count
  test('should display events based on test data', async ({ eventsPage }) => {
    const eventsCount = await eventsPage.getEventsCount();
    
    // Should have at least some events
    expect(eventsCount).toBeGreaterThan(0);
  });

  // Test event details
  test('should display complete event information', async ({ eventsPage }) => {
    const eventsCount = await eventsPage.getEventsCount();
    
    if (eventsCount > 0) {
      const eventTitle = await eventsPage.getEventTitle(0);
      expect(eventTitle).toBeTruthy();
      expect(eventTitle.length).toBeGreaterThan(0);
    }
  });
});
