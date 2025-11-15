import { test, expect } from '@playwright/test';
import { AuthPage } from './pages/auth.page';
import { DashboardPage } from './pages/dashboard.page';
import { EventsPage } from './pages/events.page';

test.describe('User Dashboard', () => {
  let authPage: AuthPage;
  let dashboardPage: DashboardPage;
  let eventsPage: EventsPage;
  const timestamp = Date.now();
  const testEmail = `dashboard${timestamp}@example.com`;
  const testPassword = 'Test123456!';

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    dashboardPage = new DashboardPage(page);
    eventsPage = new EventsPage(page);

    // Create and login user
    await authPage.goto();
    await authPage.switchToSignUp();
    await authPage.fillSignUpForm(testEmail, testPassword, 'Dashboard Test User');
    await authPage.submitSignUp();
    
    await page.waitForURL('**/events', { timeout: 10000 });
  });

  test('should display dashboard with user information', async ({ page }) => {
    await dashboardPage.goto();
    await dashboardPage.expectPageLoaded();
    
    const title = await dashboardPage.getDashboardTitle();
    expect(title).toContain('My Dashboard');
  });

  test('should show empty bookings state initially', async () => {
    await dashboardPage.goto();
    await dashboardPage.expectPageLoaded();
    
    const totalBookings = await dashboardPage.getTotalBookings();
    expect(totalBookings).toBe('0');
  });

  test('should display booking after making one', async ({ page }) => {
    // First book an event
    await eventsPage.goto();
    await eventsPage.expectPageLoaded();
    await eventsPage.bookFirstEvent();
    
    // Wait for success toast
    await page.waitForTimeout(2000);
    
    // Navigate to dashboard
    await dashboardPage.goto();
    await dashboardPage.expectPageLoaded();
    
    // Check bookings count
    const totalBookings = await dashboardPage.getTotalBookings();
    expect(parseInt(totalBookings)).toBeGreaterThan(0);
    
    // Check if booking card is visible
    await dashboardPage.expectBookingCardVisible();
  });

  test('should navigate back to events from dashboard', async ({ page }) => {
    await dashboardPage.goto();
    await dashboardPage.clickBackToEvents();
    
    await page.waitForURL('**/events', { timeout: 5000 });
    await expect(page.locator('[data-testid="events-grid"]')).toBeVisible();
  });

  test('should show correct booking statistics', async ({ page }) => {
    // Book multiple events
    await eventsPage.goto();
    await eventsPage.expectPageLoaded();
    
    // Book first event
    await eventsPage.bookFirstEvent();
    await page.waitForTimeout(2000);
    
    // Navigate to dashboard
    await dashboardPage.goto();
    await dashboardPage.expectPageLoaded();
    
    const totalBookings = await dashboardPage.getTotalBookings();
    expect(parseInt(totalBookings)).toBe(1);
  });

  test('should display booking details correctly', async ({ page }) => {
    // Book an event first
    await eventsPage.goto();
    await eventsPage.expectPageLoaded();
    await eventsPage.bookFirstEvent();
    await page.waitForTimeout(2000);
    
    // Go to dashboard
    await dashboardPage.goto();
    await dashboardPage.expectPageLoaded();
    
    // Verify booking card has required information
    const bookingCard = page.locator('[data-testid="booking-card"]').first();
    await expect(bookingCard).toBeVisible();
    
    // Check for event details in booking
    await expect(bookingCard).toContainText(/\$/); // Price
  });
});
