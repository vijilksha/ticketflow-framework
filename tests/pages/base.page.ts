import { Page, Locator, expect } from '@playwright/test';

/**
 * BasePage - Implements Single Responsibility Principle
 * Provides common page functionality that all pages inherit
 */
export abstract class BasePage {
  protected readonly page: Page;
  protected abstract readonly pageUrl: string;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to the page
   */
  async goto(): Promise<void> {
    await this.page.goto(this.pageUrl);
  }

  /**
   * Wait for page to be fully loaded
   */
  abstract expectPageLoaded(): Promise<void>;

  /**
   * Get current page URL
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation(url: string, timeout: number = 10000): Promise<void> {
    await this.page.waitForURL(url, { timeout });
  }

  /**
   * Take screenshot
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `test-results/${name}.png` });
  }

  /**
   * Check if element is visible
   */
  protected async isVisible(locator: Locator): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Wait for element and click
   */
  protected async clickElement(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    await locator.click();
  }

  /**
   * Fill input field
   */
  protected async fillInput(locator: Locator, value: string): Promise<void> {
    await locator.waitFor({ state: 'visible' });
    await locator.fill(value);
  }

  /**
   * Get text content
   */
  protected async getTextContent(locator: Locator): Promise<string> {
    return await locator.textContent() || '';
  }

  /**
   * Count elements
   */
  protected async countElements(locator: Locator): Promise<number> {
    return await locator.count();
  }
}
