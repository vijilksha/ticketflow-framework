import { test, expect } from './fixtures/page-fixtures';
import { generateTestUser } from './fixtures/test-data';

test.describe('Events Page', () => {
  const testUser = generateTestUser();

  test.beforeEach(async ({ authPage, eventsPage }) => {
    // Sign up and navigate to events page
    await authPage.goto();
    await authPage.switchToSignUp();
    await authPage.fillSignUpForm(testUser.email, testUser.password, testUser.fullName);
    await authPage.submitSignUp();
    
    await eventsPage.expectPageLoaded();
  });

  test('should display events grid', async ({ eventsPage }) => {
    const isVisible = await eventsPage.isEventsGridVisible();
    expect(isVisible).toBeTruthy();
  });

  test('should display multiple events', async ({ eventsPage }) => {
    const eventsCount = await eventsPage.getEventsCount();
    expect(eventsCount).toBeGreaterThan(0);
  });

  test('should book an event successfully', async ({ page, eventsPage }) => {
    await eventsPage.bookFirstEvent();
    
    // Wait for success notification
    await page.waitForTimeout(2000);
  });

  test('should navigate to dashboard', async ({ page, eventsPage }) => {
    await eventsPage.navigateToDashboard();
    
    await page.waitForURL('**/dashboard', { timeout: 5000 });
    await expect(page.locator('[data-testid="dashboard-title"]')).toBeVisible();
  });

  test('should sign out successfully', async ({ page, eventsPage }) => {
    await eventsPage.signOut();
    
    await page.waitForURL('**/auth', { timeout: 5000 });
    await expect(page.locator('[data-testid="signin-tab"]')).toBeVisible();
  });

  test('should display event details', async ({ eventsPage }) => {
    const eventTitle = await eventsPage.getEventTitle(0);
    expect(eventTitle).toBeTruthy();
    expect(eventTitle.length).toBeGreaterThan(0);
  });
});
