import { Page, Locator } from '@playwright/test';

export class AuthPage {
  readonly page: Page;
  readonly signInTab: Locator;
  readonly signUpTab: Locator;
  readonly signInEmailInput: Locator;
  readonly signInPasswordInput: Locator;
  readonly signInButton: Locator;
  readonly signUpNameInput: Locator;
  readonly signUpEmailInput: Locator;
  readonly signUpPasswordInput: Locator;
  readonly signUpButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.signInTab = page.locator('[data-testid="signin-tab"]');
    this.signUpTab = page.locator('[data-testid="signup-tab"]');
    this.signInEmailInput = page.locator('[data-testid="signin-email"]');
    this.signInPasswordInput = page.locator('[data-testid="signin-password"]');
    this.signInButton = page.locator('[data-testid="signin-button"]');
    this.signUpNameInput = page.locator('[data-testid="signup-name"]');
    this.signUpEmailInput = page.locator('[data-testid="signup-email"]');
    this.signUpPasswordInput = page.locator('[data-testid="signup-password"]');
    this.signUpButton = page.locator('[data-testid="signup-button"]');
  }

  async goto() {
    await this.page.goto('/auth');
  }

  async expectPageLoaded() {
    await this.signInTab.waitFor({ state: 'visible' });
    await this.signUpTab.waitFor({ state: 'visible' });
  }

  async switchToSignIn() {
    await this.signInTab.click();
  }

  async switchToSignUp() {
    await this.signUpTab.click();
  }

  async fillSignInForm(email: string, password: string) {
    await this.signInEmailInput.fill(email);
    await this.signInPasswordInput.fill(password);
  }

  async fillSignUpForm(email: string, password: string, name: string) {
    await this.signUpNameInput.fill(name);
    await this.signUpEmailInput.fill(email);
    await this.signUpPasswordInput.fill(password);
  }

  async submitSignIn() {
    await this.signInButton.click();
  }

  async submitSignUp() {
    await this.signUpButton.click();
  }

  async expectSignInTabVisible() {
    await this.signInEmailInput.waitFor({ state: 'visible' });
  }

  async expectSignUpTabVisible() {
    await this.signUpNameInput.waitFor({ state: 'visible' });
  }
}
