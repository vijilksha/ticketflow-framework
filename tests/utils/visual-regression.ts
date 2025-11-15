import { Page, expect } from '@playwright/test';
import * as path from 'path';

/**
 * VisualRegression - Utility for visual regression testing
 * Implements Single Responsibility Principle
 */
export class VisualRegression {
  private readonly screenshotsDir: string;

  constructor(screenshotsDir: string = 'tests/screenshots') {
    this.screenshotsDir = screenshotsDir;
  }

  /**
   * Take and compare full page screenshot
   */
  async compareFullPage(
    page: Page,
    name: string,
    options?: ScreenshotOptions
  ): Promise<void> {
    await expect(page).toHaveScreenshot(`${name}-fullpage.png`, {
      fullPage: true,
      maxDiffPixels: options?.maxDiffPixels || 100,
      threshold: options?.threshold || 0.2,
      ...options,
    });
  }

  /**
   * Take and compare element screenshot
   */
  async compareElement(
    page: Page,
    selector: string,
    name: string,
    options?: ScreenshotOptions
  ): Promise<void> {
    const element = page.locator(selector);
    await expect(element).toHaveScreenshot(`${name}-element.png`, {
      maxDiffPixels: options?.maxDiffPixels || 50,
      threshold: options?.threshold || 0.2,
      ...options,
    });
  }

  /**
   * Take screenshot of viewport only
   */
  async compareViewport(
    page: Page,
    name: string,
    options?: ScreenshotOptions
  ): Promise<void> {
    await expect(page).toHaveScreenshot(`${name}-viewport.png`, {
      fullPage: false,
      maxDiffPixels: options?.maxDiffPixels || 100,
      threshold: options?.threshold || 0.2,
      ...options,
    });
  }

  /**
   * Take screenshot with masked elements
   */
  async compareWithMask(
    page: Page,
    name: string,
    maskSelectors: string[],
    options?: ScreenshotOptions
  ): Promise<void> {
    const mask = maskSelectors.map(selector => page.locator(selector));
    
    await expect(page).toHaveScreenshot(`${name}-masked.png`, {
      fullPage: true,
      mask,
      maxDiffPixels: options?.maxDiffPixels || 100,
      threshold: options?.threshold || 0.2,
      ...options,
    });
  }

  /**
   * Compare multiple viewports for responsive design
   */
  async compareResponsive(
    page: Page,
    name: string,
    viewports: Viewport[]
  ): Promise<void> {
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500); // Wait for layout to settle
      
      await expect(page).toHaveScreenshot(
        `${name}-${viewport.width}x${viewport.height}.png`,
        {
          fullPage: true,
          maxDiffPixels: 100,
        }
      );
    }
  }

  /**
   * Take baseline screenshot (manual approval needed)
   */
  async takeBaseline(page: Page, name: string): Promise<string> {
    const filename = `${name}-baseline.png`;
    const filepath = path.join(this.screenshotsDir, filename);
    
    await page.screenshot({
      path: filepath,
      fullPage: true,
    });
    
    return filepath;
  }

  /**
   * Compare with animation states
   */
  async compareAnimation(
    page: Page,
    name: string,
    states: string[]
  ): Promise<void> {
    for (const state of states) {
      await expect(page).toHaveScreenshot(`${name}-${state}.png`, {
        fullPage: false,
        animations: 'disabled',
      });
    }
  }
}

/**
 * Common viewport sizes for testing
 */
export const CommonViewports = {
  MOBILE: { width: 375, height: 667 },
  MOBILE_LANDSCAPE: { width: 667, height: 375 },
  TABLET: { width: 768, height: 1024 },
  TABLET_LANDSCAPE: { width: 1024, height: 768 },
  DESKTOP: { width: 1920, height: 1080 },
  DESKTOP_SMALL: { width: 1366, height: 768 },
};

/**
 * Type definitions
 */
interface ScreenshotOptions {
  maxDiffPixels?: number;
  threshold?: number;
  animations?: 'disabled' | 'allow';
  caret?: 'hide' | 'initial';
}

interface Viewport {
  width: number;
  height: number;
}
