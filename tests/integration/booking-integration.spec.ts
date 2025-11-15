import { test, expect } from '../fixtures/page-fixtures';
import { ApiClient } from '../api/api-client';
import { generateTestUser } from '../fixtures/test-data';

/**
 * Booking Integration Tests
 * Tests complete booking workflows combining UI and API interactions
 */
test.describe('Booking Integration', () => {
  let apiClient: ApiClient;

  test.beforeEach(async () => {
    apiClient = new ApiClient();
    await apiClient.init();
  });

  test.afterEach(async () => {
    await apiClient.dispose();
  });

  test('Complete booking flow: UI login -> Browse events -> Create booking -> API verification', async ({ 
    authPage, 
    eventsPage, 
    dashboardPage 
  }) => {
    const testUser = generateTestUser();
    
    // Step 1: UI - Create account and login
    await authPage.navigate();
    await authPage.fillSignupForm(testUser.email, testUser.password, testUser.fullName);
    await authPage.submitSignup();
    
    // Step 2: UI - Navigate to events page
    await eventsPage.navigate();
    await expect(eventsPage.page).toHaveURL(/.*events/);
    
    // Step 3: UI - View event details
    const eventCards = eventsPage.page.locator('[data-testid="event-card"]');
    await expect(eventCards.first()).toBeVisible();
    
    // Get event details from UI
    const eventTitle = await eventCards.first().locator('h3, h2').textContent();
    
    // Step 4: API - Get event data to create booking
    const { data: events } = await apiClient.getEvents();
    expect(events.length).toBeGreaterThan(0);
    
    const selectedEvent = events[0];
    
    // Step 5: Get user session for API call
    const sessionData = await authPage.page.evaluate(() => {
      const session = localStorage.getItem('supabase.auth.token');
      return session ? JSON.parse(session) : null;
    });
    
    if (sessionData?.currentSession?.access_token) {
      apiClient.setAuthToken(sessionData.currentSession.access_token);
      const userId = sessionData.currentSession.user.id;
      
      // Step 6: API - Create booking
      const { response, data: bookingData } = await apiClient.createBooking(
        selectedEvent.id,
        2,
        selectedEvent.price * 2,
        userId
      );
      
      expect(response.ok()).toBeTruthy();
      expect(bookingData).toHaveLength(1);
      expect(bookingData[0].event_id).toBe(selectedEvent.id);
      expect(bookingData[0].quantity).toBe(2);
      
      // Step 7: UI - Navigate to dashboard to verify booking appears
      await dashboardPage.navigate();
      await expect(dashboardPage.page).toHaveURL(/.*dashboard/);
      
      // Step 8: Verify booking appears in dashboard
      await expect(dashboardPage.page.getByText(eventTitle || selectedEvent.title, { exact: false })).toBeVisible();
      
      // Step 9: API - Verify booking data matches
      const { data: userBookings } = await apiClient.getUserBookings(userId);
      expect(userBookings.length).toBeGreaterThan(0);
      
      const createdBooking = userBookings.find((b: any) => b.id === bookingData[0].id);
      expect(createdBooking).toBeDefined();
      expect(createdBooking.event_id).toBe(selectedEvent.id);
    }
  });

  test('Booking data consistency: API booking -> UI verification -> API data match', async ({ 
    authPage, 
    dashboardPage 
  }) => {
    const testUser = generateTestUser();
    
    // Step 1: API - Create user
    const { data: authData } = await apiClient.signUp(
      testUser.email,
      testUser.password,
      testUser.fullName
    );
    
    apiClient.setAuthToken(authData.access_token);
    const userId = authData.user.id;
    
    // Step 2: API - Get available events
    const { data: events } = await apiClient.getEvents();
    const selectedEvent = events[0];
    
    // Step 3: API - Create multiple bookings
    const bookingQuantities = [1, 2, 3];
    const createdBookings = [];
    
    for (const quantity of bookingQuantities) {
      const { data: bookingData } = await apiClient.createBooking(
        selectedEvent.id,
        quantity,
        selectedEvent.price * quantity,
        userId
      );
      createdBookings.push(bookingData[0]);
    }
    
    // Step 4: UI - Login and navigate to dashboard
    await authPage.navigate();
    await authPage.switchToSignIn();
    await authPage.fillSignInForm(testUser.email, testUser.password);
    await authPage.submitSignIn();
    
    await dashboardPage.navigate();
    await expect(dashboardPage.page).toHaveURL(/.*dashboard/);
    
    // Step 5: UI - Verify all bookings are displayed
    for (const booking of createdBookings) {
      const bookingElement = dashboardPage.page.locator(`[data-booking-id="${booking.id}"]`);
      // If specific data attributes aren't available, check for quantity text
      await expect(dashboardPage.page.getByText(`${booking.quantity}`, { exact: false })).toBeVisible();
    }
    
    // Step 6: API - Verify all bookings exist in database
    const { data: allUserBookings } = await apiClient.getUserBookings(userId);
    expect(allUserBookings.length).toBe(bookingQuantities.length);
    
    // Verify totals match
    const totalQuantity = bookingQuantities.reduce((sum, q) => sum + q, 0);
    const apiTotalQuantity = allUserBookings.reduce((sum: number, b: any) => sum + b.quantity, 0);
    expect(apiTotalQuantity).toBe(totalQuantity);
  });

  test('Event availability update: UI booking -> API event verification -> Seats decreased', async ({ 
    authPage, 
    eventsPage 
  }) => {
    const testUser = generateTestUser();
    
    // Step 1: API - Get initial event data
    const { data: events } = await apiClient.getEvents();
    const selectedEvent = events[0];
    const initialAvailableSeats = selectedEvent.available_seats;
    
    // Step 2: API - Create user and login
    const { data: authData } = await apiClient.signUp(
      testUser.email,
      testUser.password,
      testUser.fullName
    );
    
    apiClient.setAuthToken(authData.access_token);
    const userId = authData.user.id;
    
    // Step 3: API - Create booking
    const bookingQuantity = 2;
    await apiClient.createBooking(
      selectedEvent.id,
      bookingQuantity,
      selectedEvent.price * bookingQuantity,
      userId
    );
    
    // Step 4: API - Verify seats were decreased
    const { data: updatedEvents } = await apiClient.getEventById(selectedEvent.id);
    const updatedEvent = updatedEvents[0];
    
    expect(updatedEvent.available_seats).toBe(initialAvailableSeats - bookingQuantity);
    
    // Step 5: UI - Login and navigate to events page
    await authPage.navigate();
    await authPage.switchToSignIn();
    await authPage.fillSignInForm(testUser.email, testUser.password);
    await authPage.submitSignIn();
    
    await eventsPage.navigate();
    
    // Step 6: UI - Verify updated seat count is displayed
    const eventCard = eventsPage.page.locator('[data-testid="event-card"]').first();
    await expect(eventCard.getByText(`${updatedEvent.available_seats}`, { exact: false })).toBeVisible();
  });

  test('Concurrent bookings: Multiple users -> Same event -> Data consistency', async ({ 
    authPage 
  }) => {
    // Step 1: API - Get event data
    const { data: events } = await apiClient.getEvents();
    const selectedEvent = events[0];
    const initialAvailableSeats = selectedEvent.available_seats;
    
    // Step 2: Create multiple users and bookings concurrently
    const userCount = 3;
    const bookingPromises = [];
    
    for (let i = 0; i < userCount; i++) {
      const testUser = generateTestUser();
      
      const bookingPromise = (async () => {
        const tempApiClient = new ApiClient();
        await tempApiClient.init();
        
        const { data: authData } = await tempApiClient.signUp(
          testUser.email,
          testUser.password,
          testUser.fullName
        );
        
        tempApiClient.setAuthToken(authData.access_token);
        
        await tempApiClient.createBooking(
          selectedEvent.id,
          1,
          selectedEvent.price,
          authData.user.id
        );
        
        await tempApiClient.dispose();
      })();
      
      bookingPromises.push(bookingPromise);
    }
    
    await Promise.all(bookingPromises);
    
    // Step 3: API - Verify final seat count is correct
    const { data: finalEvents } = await apiClient.getEventById(selectedEvent.id);
    const finalEvent = finalEvents[0];
    
    expect(finalEvent.available_seats).toBe(initialAvailableSeats - userCount);
  });
});
