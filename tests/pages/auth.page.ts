import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * AuthPage - Implements Single Responsibility Principle
 * Handles only authentication-related interactions
 */
export class AuthPage extends BasePage {
  protected readonly pageUrl = '/auth';
  
  private readonly signInTab: Locator;
  private readonly signUpTab: Locator;
  private readonly signInEmailInput: Locator;
  private readonly signInPasswordInput: Locator;
  private readonly signInButton: Locator;
  private readonly signUpNameInput: Locator;
  private readonly signUpEmailInput: Locator;
  private readonly signUpPasswordInput: Locator;
  private readonly signUpButton: Locator;

  constructor(page: Page) {
    super(page);
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

  async expectPageLoaded(): Promise<void> {
    await this.signInTab.waitFor({ state: 'visible' });
    await this.signUpTab.waitFor({ state: 'visible' });
  }

  async switchToSignIn(): Promise<void> {
    await this.clickElement(this.signInTab);
  }

  async switchToSignUp(): Promise<void> {
    await this.clickElement(this.signUpTab);
  }

  async fillSignInForm(email: string, password: string): Promise<void> {
    await this.fillInput(this.signInEmailInput, email);
    await this.fillInput(this.signInPasswordInput, password);
  }

  async fillSignUpForm(email: string, password: string, name: string): Promise<void> {
    await this.fillInput(this.signUpNameInput, name);
    await this.fillInput(this.signUpEmailInput, email);
    await this.fillInput(this.signUpPasswordInput, password);
  }

  async submitSignIn(): Promise<void> {
    await this.clickElement(this.signInButton);
  }

  async submitSignUp(): Promise<void> {
    await this.clickElement(this.signUpButton);
  }

  async expectSignInTabVisible(): Promise<void> {
    await this.signInEmailInput.waitFor({ state: 'visible' });
  }

  async expectSignUpTabVisible(): Promise<void> {
    await this.signUpNameInput.waitFor({ state: 'visible' });
  }

  async isSignInTabActive(): Promise<boolean> {
    return await this.isVisible(this.signInEmailInput);
  }
}
