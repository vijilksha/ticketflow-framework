import { test, expect } from '../fixtures/page-fixtures';
import { DataReader, AuthTestData } from '../utils/data-reader';

test.describe('Authentication - Data Driven Tests', () => {
  const dataReader = new DataReader();
  let authTestData: Record<string, string>[];

  test.beforeAll(() => {
    // Load CSV test data
    authTestData = dataReader.readCSV('auth-test-data.csv');
  });

  // Test valid signup scenarios
  authTestData
    ?.filter(data => data.testCase.includes('valid_signup') || data.testCase.includes('valid_signin'))
    .forEach((testData) => {
      test(`${testData.testCase}: ${testData.description}`, async ({ page, authPage }) => {
        const timestamp = Date.now();
        const uniqueEmail = `${timestamp}_${testData.email}`;

        await authPage.goto();

        if (testData.testCase.includes('signup')) {
          await authPage.switchToSignUp();
          await authPage.fillSignUpForm(uniqueEmail, testData.password, testData.fullName);
          await authPage.submitSignUp();

          if (testData.expectedResult === 'success') {
            // Should redirect to events page
            await page.waitForURL('**/events', { timeout: 10000 });
            await expect(page.locator('[data-testid="events-grid"]')).toBeVisible();
          }
        } else if (testData.testCase.includes('signin')) {
          // First create the user
          await authPage.switchToSignUp();
          await authPage.fillSignUpForm(uniqueEmail, testData.password, testData.fullName);
          await authPage.submitSignUp();
          await page.waitForURL('**/events', { timeout: 10000 });

          // Sign out
          await page.locator('[data-testid="signout-button"]').click();
          await page.waitForURL('**/auth', { timeout: 5000 });

          // Now sign in
          await authPage.fillSignInForm(uniqueEmail, testData.password);
          await authPage.submitSignIn();

          if (testData.expectedResult === 'success') {
            await page.waitForURL('**/events', { timeout: 10000 });
            await expect(page.locator('[data-testid="events-grid"]')).toBeVisible();
          }
        }
      });
    });

  // Test invalid scenarios
  authTestData
    ?.filter(data => data.expectedResult === 'error' && !data.testCase.includes('signin'))
    .forEach((testData) => {
      test(`${testData.testCase}: ${testData.description}`, async ({ page, authPage }) => {
        await authPage.goto();
        await authPage.switchToSignUp();

        // Fill form with test data
        if (testData.email) {
          await page.locator('[data-testid="signup-email"]').fill(testData.email);
        }
        if (testData.password) {
          await page.locator('[data-testid="signup-password"]').fill(testData.password);
        }
        if (testData.fullName) {
          await page.locator('[data-testid="signup-name"]').fill(testData.fullName);
        }

        // Submit should fail or show validation
        const submitButton = page.locator('[data-testid="signup-button"]');
        
        // Check if form validation prevents submission
        const isDisabled = await submitButton.isDisabled().catch(() => false);
        const hasRequiredFields = await page.locator('input[required]:invalid').count() > 0;

        // Either button should be disabled or there should be invalid required fields
        expect(isDisabled || hasRequiredFields).toBeTruthy();
      });
    });
});
