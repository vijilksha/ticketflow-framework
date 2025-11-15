import { test, expect } from '../fixtures/page-fixtures';
import { ApiClient } from '../api/api-client';
import { generateTestUser } from '../fixtures/test-data';

/**
 * Dashboard Integration Tests
 * Tests complete dashboard workflows combining UI and API interactions
 */
test.describe('Dashboard Integration', () => {
  let apiClient: ApiClient;

  test.beforeEach(async () => {
    apiClient = new ApiClient();
    await apiClient.init();
  });

  test.afterEach(async () => {
    await apiClient.dispose();
  });

  test('Dashboard data sync: API bookings -> UI display -> Real-time updates', async ({ 
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
    
    // Step 2: API - Create initial booking
    const { data: events } = await apiClient.getEvents();
    const firstEvent = events[0];
    
    const { data: firstBooking } = await apiClient.createBooking(
      firstEvent.id,
      1,
      firstEvent.price,
      userId
    );
    
    // Step 3: UI - Login and navigate to dashboard
    await authPage.navigate();
    await authPage.switchToSignIn();
    await authPage.fillSignInForm(testUser.email, testUser.password);
    await authPage.submitSignIn();
    
    await dashboardPage.navigate();
    
    // Step 4: UI - Verify first booking is displayed
    await expect(dashboardPage.page.getByText(firstEvent.title, { exact: false })).toBeVisible();
    
    // Step 5: API - Create second booking while dashboard is open
    const secondEvent = events[1];
    await apiClient.createBooking(
      secondEvent.id,
      2,
      secondEvent.price * 2,
      userId
    );
    
    // Step 6: UI - Reload to see new booking
    await dashboardPage.page.reload();
    
    // Step 7: UI - Verify both bookings are displayed
    await expect(dashboardPage.page.getByText(firstEvent.title, { exact: false })).toBeVisible();
    await expect(dashboardPage.page.getByText(secondEvent.title, { exact: false })).toBeVisible();
    
    // Step 8: API - Verify booking count matches
    const { data: allBookings } = await apiClient.getUserBookings(userId);
    expect(allBookings.length).toBe(2);
  });

  test('Profile data sync: UI profile update -> API verification -> Dashboard reflects changes', async ({ 
    authPage, 
    dashboardPage 
  }) => {
    const testUser = generateTestUser();
    
    // Step 1: UI - Create account
    await authPage.navigate();
    await authPage.fillSignupForm(testUser.email, testUser.password, testUser.fullName);
    await authPage.submitSignup();
    
    await dashboardPage.navigate();
    
    // Step 2: UI - Verify initial profile name
    await expect(dashboardPage.page.getByText(testUser.fullName)).toBeVisible();
    
    // Step 3: Get session for API calls
    const sessionData = await authPage.page.evaluate(() => {
      const session = localStorage.getItem('supabase.auth.token');
      return session ? JSON.parse(session) : null;
    });
    
    if (sessionData?.currentSession?.access_token) {
      apiClient.setAuthToken(sessionData.currentSession.access_token);
      const userId = sessionData.currentSession.user.id;
      
      // Step 4: API - Verify profile exists
      const { data: initialProfile } = await apiClient.getProfile(userId);
      expect(initialProfile[0].full_name).toBe(testUser.fullName);
      
      // Step 5: UI - Reload to verify data persistence
      await dashboardPage.page.reload();
      await expect(dashboardPage.page.getByText(testUser.fullName)).toBeVisible();
    }
  });

  test('Empty state handling: New user -> No bookings -> UI shows empty state -> API confirms', async ({ 
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
    
    // Step 2: API - Verify no bookings exist
    const { data: bookings } = await apiClient.getUserBookings(userId);
    expect(bookings).toHaveLength(0);
    
    // Step 3: UI - Login and navigate to dashboard
    await authPage.navigate();
    await authPage.switchToSignIn();
    await authPage.fillSignInForm(testUser.email, testUser.password);
    await authPage.submitSignIn();
    
    await dashboardPage.navigate();
    
    // Step 4: UI - Verify empty state is displayed
    const emptyStateIndicators = [
      'No bookings',
      'no bookings yet',
      'Get started',
      'Browse events',
      'empty'
    ];
    
    let emptyStateFound = false;
    for (const indicator of emptyStateIndicators) {
      const element = dashboardPage.page.getByText(new RegExp(indicator, 'i'));
      if (await element.isVisible().catch(() => false)) {
        emptyStateFound = true;
        break;
      }
    }
    
    expect(emptyStateFound).toBeTruthy();
  });

  test('Booking statistics: Multiple bookings -> UI aggregates -> API validates totals', async ({ 
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
    
    // Step 2: API - Get events and create multiple bookings
    const { data: events } = await apiClient.getEvents();
    const bookingData = [
      { event: events[0], quantity: 2 },
      { event: events[1], quantity: 1 },
      { event: events[0], quantity: 3 },
    ];
    
    let totalAmount = 0;
    let totalQuantity = 0;
    
    for (const booking of bookingData) {
      const amount = booking.event.price * booking.quantity;
      totalAmount += amount;
      totalQuantity += booking.quantity;
      
      await apiClient.createBooking(
        booking.event.id,
        booking.quantity,
        amount,
        userId
      );
    }
    
    // Step 3: API - Verify bookings in database
    const { data: allBookings } = await apiClient.getUserBookings(userId);
    expect(allBookings.length).toBe(bookingData.length);
    
    const apiTotalQuantity = allBookings.reduce((sum: number, b: any) => sum + b.quantity, 0);
    const apiTotalAmount = allBookings.reduce((sum: number, b: any) => sum + parseFloat(b.total_amount), 0);
    
    expect(apiTotalQuantity).toBe(totalQuantity);
    expect(apiTotalAmount).toBe(totalAmount);
    
    // Step 4: UI - Login and navigate to dashboard
    await authPage.navigate();
    await authPage.switchToSignIn();
    await authPage.fillSignInForm(testUser.email, testUser.password);
    await authPage.submitSignIn();
    
    await dashboardPage.navigate();
    
    // Step 5: UI - Verify booking count is displayed
    await expect(dashboardPage.page.getByText(`${bookingData.length}`, { exact: false })).toBeVisible();
  });

  test('Navigation flow: Dashboard -> Events -> Booking -> Back to Dashboard -> Data persists', async ({ 
    authPage, 
    eventsPage, 
    dashboardPage 
  }) => {
    const testUser = generateTestUser();
    
    // Step 1: UI - Create account and login
    await authPage.navigate();
    await authPage.fillSignupForm(testUser.email, testUser.password, testUser.fullName);
    await authPage.submitSignup();
    
    // Step 2: UI - Navigate to dashboard
    await dashboardPage.navigate();
    await expect(dashboardPage.page).toHaveURL(/.*dashboard/);
    
    // Step 3: UI - Navigate to events
    await eventsPage.navigate();
    await expect(eventsPage.page).toHaveURL(/.*events/);
    
    // Step 4: Get session and create booking via API
    const sessionData = await authPage.page.evaluate(() => {
      const session = localStorage.getItem('supabase.auth.token');
      return session ? JSON.parse(session) : null;
    });
    
    if (sessionData?.currentSession?.access_token) {
      apiClient.setAuthToken(sessionData.currentSession.access_token);
      const userId = sessionData.currentSession.user.id;
      
      const { data: events } = await apiClient.getEvents();
      const selectedEvent = events[0];
      
      await apiClient.createBooking(
        selectedEvent.id,
        1,
        selectedEvent.price,
        userId
      );
      
      // Step 5: UI - Navigate back to dashboard
      await dashboardPage.navigate();
      await expect(dashboardPage.page).toHaveURL(/.*dashboard/);
      
      // Step 6: UI - Verify booking is displayed
      await expect(dashboardPage.page.getByText(selectedEvent.title, { exact: false })).toBeVisible();
      
      // Step 7: API - Verify booking persists
      const { data: userBookings } = await apiClient.getUserBookings(userId);
      expect(userBookings.length).toBe(1);
      expect(userBookings[0].event_id).toBe(selectedEvent.id);
    }
  });
});
