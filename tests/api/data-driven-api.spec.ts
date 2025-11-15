import { test, expect } from '../fixtures/api-fixtures';
import { DataReader } from '../utils/data-reader';

interface UserProfilesData {
  testUsers: Array<{
    role: string;
    email: string;
    password: string;
    fullName: string;
    expectedPermissions: string[];
    description: string;
  }>;
}

test.describe('API - Data Driven Tests', () => {
  const dataReader = new DataReader();
  let userProfilesData: UserProfilesData;

  test.beforeAll(() => {
    userProfilesData = dataReader.readJSON<UserProfilesData>('user-profiles.json');
  });

  // Test API authentication with different user profiles
  userProfilesData?.testUsers?.forEach((user) => {
    test(`API Auth - ${user.role}: ${user.description}`, async ({ apiClient }) => {
      const timestamp = Date.now();
      const uniqueEmail = `${timestamp}_${user.email}`;

      // Sign up via API
      const { response: signupResponse, data: signupData } = await apiClient.signUp(
        uniqueEmail,
        user.password,
        user.fullName
      );

      expect(signupResponse.ok()).toBeTruthy();
      expect(signupData).toHaveProperty('access_token');
      expect(signupData.user.email).toBe(uniqueEmail);

      // Verify token is set
      const token = apiClient.getAuthToken();
      expect(token).toBeTruthy();

      // Test permissions by attempting to access resources
      if (user.expectedPermissions.includes('view_events')) {
        const { response: eventsResponse, data: eventsData } = await apiClient.getEvents();
        expect(eventsResponse.ok()).toBeTruthy();
        expect(Array.isArray(eventsData)).toBeTruthy();
      }

      // Test booking creation if permitted
      if (user.expectedPermissions.includes('create_booking')) {
        const { data: events } = await apiClient.getEvents();
        
        if (events.length > 0) {
          const { response: bookingResponse } = await apiClient.createBooking(
            events[0].id,
            1,
            events[0].price,
            signupData.user.id
          );

          expect(bookingResponse.ok()).toBeTruthy();
        }
      }
    });
  });

  // Test CSV data with API
  test('API Auth - Test CSV data scenarios', async ({ apiClient }) => {
    const authTestData = dataReader.readCSV('auth-test-data.csv');
    
    // Filter for valid signup scenarios
    const validSignups = authTestData.filter(
      data => data.expectedResult === 'success' && data.testCase.includes('signup')
    );

    for (const testData of validSignups.slice(0, 2)) {
      const timestamp = Date.now();
      const uniqueEmail = `${timestamp}_${testData.email}`;

      const { response, data } = await apiClient.signUp(
        uniqueEmail,
        testData.password,
        testData.fullName
      );

      expect(response.ok()).toBeTruthy();
      expect(data).toHaveProperty('access_token');
      expect(data.user.email).toBe(uniqueEmail);
    }
  });

  // Test event booking with different quantities
  test('API Bookings - Test different booking quantities', async ({ apiClient }) => {
    const eventsTestData = dataReader.readJSON<any>('events-test-data.json');
    
    // Create a test user first
    const timestamp = Date.now();
    const { data: authData } = await apiClient.signUp(
      `test${timestamp}@example.com`,
      'Test123456!',
      'Test User'
    );

    const userId = authData.user.id;
    const { data: events } = await apiClient.getEvents();

    if (events.length > 0) {
      for (const scenario of eventsTestData.bookingScenarios.slice(0, 2)) {
        if (scenario.eventIndex !== undefined) {
          const eventId = events[scenario.eventIndex].id;
          const totalAmount = events[scenario.eventIndex].price * scenario.quantity;

          const { response, data } = await apiClient.createBooking(
            eventId,
            scenario.quantity,
            totalAmount,
            userId
          );

          expect(response.ok()).toBeTruthy();
          
          if (Array.isArray(data) && data.length > 0) {
            expect(data[0].quantity).toBe(scenario.quantity);
            expect(data[0].booking_status).toBe(scenario.expectedStatus);
          }
        }
      }
    }
  });
});
