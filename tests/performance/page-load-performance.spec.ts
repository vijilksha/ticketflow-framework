import { test, expect } from '../fixtures/performance-fixtures';
import { PerformanceThresholds } from '../utils/performance-metrics';
import { generateTestUser } from '../fixtures/test-data';

test.describe('Page Load Performance', () => {
  const testUser = generateTestUser();

  test.beforeEach(async ({ page }) => {
    // Sign up user for authenticated tests
    await page.goto('/auth');
    await page.locator('[data-testid="signup-tab"]').click();
    await page.locator('[data-testid="signup-name"]').fill(testUser.fullName);
    await page.locator('[data-testid="signup-email"]').fill(testUser.email);
    await page.locator('[data-testid="signup-password"]').fill(testUser.password);
    await page.locator('[data-testid="signup-button"]').click();
    await page.waitForURL('**/events', { timeout: 10000 });
  });

  test('Landing page should load within acceptable time', async ({ page, performanceMetrics }) => {
    // Clear session
    await page.context().clearCookies();
    
    const loadTime = await performanceMetrics.measurePageLoad(page, '/');
    
    console.log(`Landing page load time: ${loadTime}ms`);
    
    // Assert against thresholds
    expect(loadTime).toBeLessThan(PerformanceThresholds.PAGE_LOAD.ACCEPTABLE);
    
    if (loadTime < PerformanceThresholds.PAGE_LOAD.EXCELLENT) {
      console.log('✓ Excellent performance!');
    } else if (loadTime < PerformanceThresholds.PAGE_LOAD.GOOD) {
      console.log('✓ Good performance');
    }
  });

  test('Auth page should load quickly', async ({ page, performanceMetrics }) => {
    await page.context().clearCookies();
    
    const loadTime = await performanceMetrics.measurePageLoad(page, '/auth');
    
    console.log(`Auth page load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(PerformanceThresholds.PAGE_LOAD.ACCEPTABLE);
  });

  test('Events page should load within acceptable time', async ({ page, performanceMetrics }) => {
    const loadTime = await performanceMetrics.measurePageLoad(page, '/events');
    
    console.log(`Events page load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(PerformanceThresholds.PAGE_LOAD.ACCEPTABLE);
  });

  test('Dashboard page should load efficiently', async ({ page, performanceMetrics }) => {
    const loadTime = await performanceMetrics.measurePageLoad(page, '/dashboard');
    
    console.log(`Dashboard page load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(PerformanceThresholds.PAGE_LOAD.ACCEPTABLE);
  });

  test('Time to interactive for Events page', async ({ page, performanceMetrics }) => {
    const ttiTime = await performanceMetrics.measureTimeToInteractive(page, '/events');
    
    console.log(`Events page TTI: ${ttiTime}ms`);
    expect(ttiTime).toBeLessThan(PerformanceThresholds.PAGE_LOAD.ACCEPTABLE * 1.5);
  });

  test('Page metrics breakdown for Events page', async ({ page, performanceMetrics }) => {
    await page.goto('/events');
    await page.waitForLoadState('load');
    
    const metrics = await performanceMetrics.calculatePageMetrics(page);
    
    console.log('Page Metrics:', {
      DNS: `${metrics.dns}ms`,
      TCP: `${metrics.tcp}ms`,
      Request: `${metrics.request}ms`,
      Response: `${metrics.response}ms`,
      DOM: `${metrics.dom}ms`,
      Load: `${metrics.load}ms`,
      Total: `${metrics.total}ms`,
    });
    
    // Assert reasonable times for each phase
    expect(metrics.dns).toBeLessThan(500);
    expect(metrics.tcp).toBeLessThan(500);
    expect(metrics.response).toBeLessThan(1000);
    expect(metrics.total).toBeLessThan(PerformanceThresholds.PAGE_LOAD.ACCEPTABLE);
  });

  test('Multiple page loads - consistency check', async ({ page, performanceMetrics }) => {
    const iterations = 3;
    
    for (let i = 0; i < iterations; i++) {
      await performanceMetrics.measurePageLoad(page, '/events');
      await page.waitForTimeout(1000);
    }
    
    const avgLoadTime = performanceMetrics.getAverage('page_load');
    const p95LoadTime = performanceMetrics.getPercentile('page_load', 95);
    
    console.log(`Average load time: ${avgLoadTime.toFixed(2)}ms`);
    console.log(`95th percentile: ${p95LoadTime.toFixed(2)}ms`);
    
    expect(p95LoadTime).toBeLessThan(PerformanceThresholds.PAGE_LOAD.ACCEPTABLE);
  });
});
