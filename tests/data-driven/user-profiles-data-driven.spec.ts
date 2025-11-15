import { test, expect } from '../fixtures/page-fixtures';
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
  invalidUsers: Array<{
    testCase: string;
    email: string;
    password: string;
    fullName: string;
    expectedResult: string;
    description: string;
  }>;
}

test.describe('User Profiles - Data Driven Tests', () => {
  const dataReader = new DataReader();
  let userProfilesData: UserProfilesData;

  test.beforeAll(() => {
    // Load JSON test data
    userProfilesData = dataReader.readJSON<UserProfilesData>('user-profiles.json');
  });

  // Test valid user profiles
  userProfilesData?.testUsers?.forEach((user) => {
    test(`${user.role}: ${user.description}`, async ({ page, authPage, eventsPage }) => {
      const timestamp = Date.now();
      const uniqueEmail = `${timestamp}_${user.email}`;

      // Sign up with user profile
      await authPage.goto();
      await authPage.switchToSignUp();
      await authPage.fillSignUpForm(uniqueEmail, user.password, user.fullName);
      await authPage.submitSignUp();

      // Should redirect to events page
      await page.waitForURL('**/events', { timeout: 10000 });
      await eventsPage.expectPageLoaded();

      // Verify user can view events (basic permission)
      if (user.expectedPermissions.includes('view_events')) {
        const eventsCount = await eventsPage.getEventsCount();
        expect(eventsCount).toBeGreaterThan(0);
      }

      // Verify user can create booking (if permitted)
      if (user.expectedPermissions.includes('create_booking')) {
        const isBookButtonVisible = await page.locator('[data-testid="book-button"]').first().isVisible();
        expect(isBookButtonVisible).toBeTruthy();
      }
    });
  });

  // Test invalid user profiles (security tests)
  userProfilesData?.invalidUsers?.forEach((user) => {
    test(`Security: ${user.testCase} - ${user.description}`, async ({ page, authPage }) => {
      await authPage.goto();
      await authPage.switchToSignUp();

      // Attempt to sign up with invalid/malicious data
      await page.locator('[data-testid="signup-email"]').fill(user.email);
      await page.locator('[data-testid="signup-password"]').fill(user.password);
      await page.locator('[data-testid="signup-name"]').fill(user.fullName);

      const submitButton = page.locator('[data-testid="signup-button"]');
      await submitButton.click();

      // Should not redirect to events page
      await page.waitForTimeout(2000);
      const currentUrl = page.url();
      
      // Should stay on auth page or show error
      expect(currentUrl).toContain('/auth');
    });
  });

  // Test user workflow with different profiles
  test('should handle multiple user workflows', async ({ page, authPage, eventsPage, dashboardPage }) => {
    for (const user of userProfilesData.testUsers.slice(0, 2)) {
      const timestamp = Date.now();
      const uniqueEmail = `${timestamp}_${user.email}`;

      // Sign up
      await authPage.goto();
      await authPage.switchToSignUp();
      await authPage.fillSignUpForm(uniqueEmail, user.password, user.fullName);
      await authPage.submitSignUp();

      await page.waitForURL('**/events', { timeout: 10000 });
      
      // Book an event if permitted
      if (user.expectedPermissions.includes('create_booking')) {
        await eventsPage.bookFirstEvent();
        await page.waitForTimeout(2000);

        // Verify in dashboard
        await dashboardPage.goto();
        await dashboardPage.expectPageLoaded();
        
        const bookingsCount = await dashboardPage.getBookingsCount();
        expect(bookingsCount).toBeGreaterThan(0);
      }

      // Sign out
      await eventsPage.goto();
      await eventsPage.signOut();
      await page.waitForURL('**/auth', { timeout: 5000 });
    }
  });
});
