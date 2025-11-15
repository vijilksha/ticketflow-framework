import { test, expect } from '../fixtures/page-fixtures';
import { generateTestUser } from '../fixtures/test-data';

test.describe('Functional Regression Tests', () => {
  test('Authentication flow remains functional', async ({ page, authPage }) => {
    const testUser = generateTestUser();
    
    // Sign up
    await authPage.goto();
    await authPage.switchToSignUp();
    await authPage.fillSignUpForm(testUser.email, testUser.password, testUser.fullName);
    await authPage.submitSignUp();
    
    await page.waitForURL('**/events', { timeout: 10000 });
    await expect(page.locator('[data-testid="events-grid"]')).toBeVisible();
    
    // Sign out
    await page.locator('[data-testid="signout-button"]').click();
    await page.waitForURL('**/auth', { timeout: 5000 });
    
    // Sign in
    await authPage.fillSignInForm(testUser.email, testUser.password);
    await authPage.submitSignIn();
    
    await page.waitForURL('**/events', { timeout: 10000 });
    await expect(page.locator('[data-testid="events-grid"]')).toBeVisible();
  });

  test('Event booking flow remains functional', async ({ page, authPage, eventsPage }) => {
    const testUser = generateTestUser();
    
    // Login
    await authPage.goto();
    await authPage.switchToSignUp();
    await authPage.fillSignUpForm(testUser.email, testUser.password, testUser.fullName);
    await authPage.submitSignUp();
    await page.waitForURL('**/events', { timeout: 10000 });
    
    // Book event
    await eventsPage.expectPageLoaded();
    const initialEventsCount = await eventsPage.getEventsCount();
    expect(initialEventsCount).toBeGreaterThan(0);
    
    await eventsPage.bookFirstEvent();
    await page.waitForTimeout(2000);
    
    // Verify booking exists
    await page.goto('/dashboard');
    await expect(page.locator('[data-testid="booking-card"]').first()).toBeVisible();
  });

  test('Dashboard display remains functional', async ({ page, authPage, dashboardPage }) => {
    const testUser = generateTestUser();
    
    // Login
    await authPage.goto();
    await authPage.switchToSignUp();
    await authPage.fillSignUpForm(testUser.email, testUser.password, testUser.fullName);
    await authPage.submitSignUp();
    await page.waitForURL('**/events', { timeout: 10000 });
    
    // Navigate to dashboard
    await dashboardPage.goto();
    await dashboardPage.expectPageLoaded();
    
    const title = await dashboardPage.getDashboardTitle();
    expect(title).toContain('Dashboard');
  });

  test('Navigation between pages remains functional', async ({ page, authPage, eventsPage, dashboardPage }) => {
    const testUser = generateTestUser();
    
    // Login
    await authPage.goto();
    await authPage.switchToSignUp();
    await authPage.fillSignUpForm(testUser.email, testUser.password, testUser.fullName);
    await authPage.submitSignUp();
    await page.waitForURL('**/events', { timeout: 10000 });
    
    // Navigate to dashboard
    await eventsPage.navigateToDashboard();
    await page.waitForURL('**/dashboard', { timeout: 5000 });
    await expect(page.locator('[data-testid="dashboard-title"]')).toBeVisible();
    
    // Navigate back to events
    await dashboardPage.clickBackToEvents();
    await page.waitForURL('**/events', { timeout: 5000 });
    await expect(page.locator('[data-testid="events-grid"]')).toBeVisible();
  });

  test('Form validation remains functional', async ({ page, authPage }) => {
    await authPage.goto();
    
    // Try to submit empty form
    await authPage.submitSignIn();
    
    // Check for required field validation
    const emailInput = page.locator('[data-testid="signin-email"]');
    await expect(emailInput).toHaveAttribute('required');
  });

  test('Error handling remains functional', async ({ authPage }) => {
    await authPage.goto();
    await authPage.fillSignInForm('nonexistent@example.com', 'wrongpassword');
    await authPage.submitSignIn();
    
    // Should remain on auth page
    await authPage.page.waitForTimeout(2000);
    const currentUrl = authPage.page.url();
    expect(currentUrl).toContain('/auth');
  });

  test('Protected routes remain functional', async ({ page }) => {
    // Clear any existing session
    await page.context().clearCookies();
    
    // Try to access protected route
    await page.goto('/dashboard');
    
    // Should redirect to auth
    await page.waitForURL('**/auth', { timeout: 5000 });
    await expect(page.locator('[data-testid="signin-tab"]')).toBeVisible();
  });

  test('Data persistence remains functional', async ({ page, authPage, eventsPage, dashboardPage }) => {
    const testUser = generateTestUser();
    
    // Login and book event
    await authPage.goto();
    await authPage.switchToSignUp();
    await authPage.fillSignUpForm(testUser.email, testUser.password, testUser.fullName);
    await authPage.submitSignUp();
    await page.waitForURL('**/events', { timeout: 10000 });
    
    await eventsPage.bookFirstEvent();
    await page.waitForTimeout(2000);
    
    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Check dashboard still shows booking
    await dashboardPage.goto();
    await dashboardPage.expectPageLoaded();
    
    const bookingsCount = await dashboardPage.getBookingsCount();
    expect(bookingsCount).toBeGreaterThan(0);
  });
});
