import { Page } from '@playwright/test';
import { AuthPage } from '../pages/auth.page';

export class AuthHelper {
  static async signUpAndLogin(
    page: Page,
    email: string,
    password: string,
    fullName: string
  ): Promise<void> {
    const authPage = new AuthPage(page);
    await authPage.goto();
    await authPage.switchToSignUp();
    await authPage.fillSignUpForm(email, password, fullName);
    await authPage.submitSignUp();
    
    // Wait for redirect to events page
    await page.waitForURL('**/events', { timeout: 10000 });
  }

  static async login(page: Page, email: string, password: string): Promise<void> {
    const authPage = new AuthPage(page);
    await authPage.goto();
    await authPage.fillSignInForm(email, password);
    await authPage.submitSignIn();
    
    // Wait for redirect to events page
    await page.waitForURL('**/events', { timeout: 10000 });
  }

  static async logout(page: Page): Promise<void> {
    const signOutButton = page.locator('[data-testid="signout-button"]');
    await signOutButton.click();
    
    // Wait for redirect to auth page
    await page.waitForURL('**/auth', { timeout: 5000 });
  }
}
