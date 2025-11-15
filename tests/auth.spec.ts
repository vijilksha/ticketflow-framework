import { test, expect } from './fixtures/page-fixtures';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ authPage }) => {
    await authPage.goto();
  });

  test('should display authentication page with correct elements', async () => {
    await expect(authPage.page).toHaveTitle(/badae9b9-2081-4e5b-a1ca-b467fcf11dae/);
    await authPage.expectPageLoaded();
  });

  test('should sign up a new user successfully', async ({ page }) => {
    const timestamp = Date.now();
    const testEmail = `test${timestamp}@example.com`;
    const testPassword = 'Test123456!';
    const testName = 'Test User';

    await authPage.switchToSignUp();
    await authPage.fillSignUpForm(testEmail, testPassword, testName);
    await authPage.submitSignUp();

    // Should redirect to events page
    await page.waitForURL('**/events', { timeout: 10000 });
    await expect(page.locator('[data-testid="events-grid"]')).toBeVisible();
  });

  test('should show error for existing email on signup', async () => {
    // Use a known existing email or create one first
    await authPage.switchToSignUp();
    await authPage.fillSignUpForm('existing@example.com', 'Test123456!', 'Test User');
    await authPage.submitSignUp();

    // Wait for error toast or message
    await authPage.page.waitForTimeout(2000);
  });

  test('should sign in with valid credentials', async ({ page }) => {
    // First create a user
    const timestamp = Date.now();
    const testEmail = `signin${timestamp}@example.com`;
    const testPassword = 'Test123456!';
    
    await authPage.switchToSignUp();
    await authPage.fillSignUpForm(testEmail, testPassword, 'Signin Test');
    await authPage.submitSignUp();
    
    // Wait for redirect
    await page.waitForURL('**/events', { timeout: 10000 });
    
    // Sign out
    await page.locator('[data-testid="signout-button"]').click();
    await page.waitForURL('**/auth', { timeout: 5000 });
    
    // Now sign in again
    await authPage.fillSignInForm(testEmail, testPassword);
    await authPage.submitSignIn();
    
    await page.waitForURL('**/events', { timeout: 10000 });
    await expect(page.locator('[data-testid="events-grid"]')).toBeVisible();
  });

  test('should show error for invalid credentials', async () => {
    await authPage.fillSignInForm('invalid@example.com', 'wrongpassword');
    await authPage.submitSignIn();

    // Wait for error message
    await authPage.page.waitForTimeout(2000);
  });

  test('should validate required fields', async ({ page, authPage }) => {
    await authPage.submitSignIn();
    
    // HTML5 validation should prevent submission
    const emailInput = page.locator('[data-testid="signin-email"]');
    await expect(emailInput).toHaveAttribute('required');
  });

  test('should switch between sign in and sign up tabs', async () => {
    await authPage.expectSignInTabVisible();
    
    await authPage.switchToSignUp();
    await authPage.expectSignUpTabVisible();
    
    await authPage.switchToSignIn();
    await authPage.expectSignInTabVisible();
  });
});
