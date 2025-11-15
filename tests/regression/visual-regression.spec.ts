import { test } from '../fixtures/performance-fixtures';
import { CommonViewports } from '../utils/visual-regression';
import { generateTestUser } from '../fixtures/test-data';

test.describe('Visual Regression Tests', () => {
  const testUser = generateTestUser();

  test('Landing page visual regression', async ({ page, visualRegression }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await visualRegression.compareFullPage(page, 'landing-page');
  });

  test('Auth page visual regression', async ({ page, visualRegression }) => {
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    
    // Sign in tab
    await visualRegression.compareFullPage(page, 'auth-signin');
    
    // Sign up tab
    await page.locator('[data-testid="signup-tab"]').click();
    await page.waitForTimeout(500);
    await visualRegression.compareFullPage(page, 'auth-signup');
  });

  test('Events page visual regression', async ({ page, visualRegression }) => {
    // Login first
    await page.goto('/auth');
    await page.locator('[data-testid="signup-tab"]').click();
    await page.locator('[data-testid="signup-name"]').fill(testUser.fullName);
    await page.locator('[data-testid="signup-email"]').fill(testUser.email);
    await page.locator('[data-testid="signup-password"]').fill(testUser.password);
    await page.locator('[data-testid="signup-button"]').click();
    await page.waitForURL('**/events', { timeout: 10000 });
    
    await page.waitForLoadState('networkidle');
    await visualRegression.compareFullPage(page, 'events-page');
  });

  test('Dashboard page visual regression', async ({ page, visualRegression }) => {
    // Login and book an event
    await page.goto('/auth');
    await page.locator('[data-testid="signup-tab"]').click();
    await page.locator('[data-testid="signup-name"]').fill(testUser.fullName);
    await page.locator('[data-testid="signup-email"]').fill(testUser.email);
    await page.locator('[data-testid="signup-password"]').fill(testUser.password);
    await page.locator('[data-testid="signup-button"]').click();
    await page.waitForURL('**/events', { timeout: 10000 });
    
    // Book an event
    await page.locator('[data-testid="book-button"]').first().click();
    await page.waitForTimeout(2000);
    
    // Go to dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    await visualRegression.compareFullPage(page, 'dashboard-page');
  });

  test('Event card component visual regression', async ({ page, visualRegression }) => {
    // Login
    await page.goto('/auth');
    await page.locator('[data-testid="signup-tab"]').click();
    await page.locator('[data-testid="signup-name"]').fill(testUser.fullName);
    await page.locator('[data-testid="signup-email"]').fill(testUser.email);
    await page.locator('[data-testid="signup-password"]').fill(testUser.password);
    await page.locator('[data-testid="signup-button"]').click();
    await page.waitForURL('**/events', { timeout: 10000 });
    
    await page.waitForLoadState('networkidle');
    
    // Compare first event card
    await visualRegression.compareElement(
      page,
      '[data-testid="event-card"]',
      'event-card'
    );
  });

  test('Responsive design - Mobile view', async ({ page, visualRegression }) => {
    await page.setViewportSize(CommonViewports.MOBILE);
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await visualRegression.compareFullPage(page, 'landing-mobile');
  });

  test('Responsive design - Tablet view', async ({ page, visualRegression }) => {
    await page.setViewportSize(CommonViewports.TABLET);
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await visualRegression.compareFullPage(page, 'landing-tablet');
  });

  test('Responsive design - Multiple viewports', async ({ page, visualRegression }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await visualRegression.compareResponsive(page, 'landing-responsive', [
      CommonViewports.MOBILE,
      CommonViewports.TABLET,
      CommonViewports.DESKTOP,
    ]);
  });

  test('Masked elements - Dynamic content', async ({ page, visualRegression }) => {
    // Login
    await page.goto('/auth');
    await page.locator('[data-testid="signup-tab"]').click();
    await page.locator('[data-testid="signup-name"]').fill(testUser.fullName);
    await page.locator('[data-testid="signup-email"]').fill(testUser.email);
    await page.locator('[data-testid="signup-password"]').fill(testUser.password);
    await page.locator('[data-testid="signup-button"]').click();
    await page.waitForURL('**/events', { timeout: 10000 });
    
    // Mask dynamic elements (dates, times, etc.)
    await visualRegression.compareWithMask(
      page,
      'events-masked',
      ['[data-testid="event-date"]', 'time']
    );
  });

  test('Dark mode visual regression', async ({ page, visualRegression }) => {
    await page.goto('/');
    
    // Enable dark mode if supported
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });
    
    await page.waitForTimeout(500);
    await visualRegression.compareFullPage(page, 'landing-dark-mode');
  });
});
