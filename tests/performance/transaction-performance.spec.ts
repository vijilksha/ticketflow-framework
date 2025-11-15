import { test, expect } from '../fixtures/page-fixtures';
import { PerformanceMetrics, PerformanceThresholds } from '../utils/performance-metrics';
import { generateTestUser } from '../fixtures/test-data';

test.describe('Transaction Performance', () => {
  let performanceMetrics: PerformanceMetrics;
  const testUser = generateTestUser();

  test.beforeEach(() => {
    performanceMetrics = new PerformanceMetrics();
  });

  test.afterEach(() => {
    const report = performanceMetrics.generateReport();
    console.log('Transaction Performance Report:', JSON.stringify(report, null, 2));
  });

  test('Complete signup flow transaction', async ({ page, authPage }) => {
    const { duration } = await performanceMetrics.measureTransaction(
      'signup_transaction',
      async () => {
        await authPage.goto();
        await authPage.switchToSignUp();
        await authPage.fillSignUpForm(testUser.email, testUser.password, testUser.fullName);
        await authPage.submitSignUp();
        await page.waitForURL('**/events', { timeout: 10000 });
      }
    );
    
    console.log(`Signup transaction duration: ${duration}ms`);
    expect(duration).toBeLessThan(PerformanceThresholds.TRANSACTION.ACCEPTABLE);
  });

  test('Complete signin flow transaction', async ({ page, authPage }) => {
    // Create user first
    await authPage.goto();
    await authPage.switchToSignUp();
    await authPage.fillSignUpForm(testUser.email, testUser.password, testUser.fullName);
    await authPage.submitSignUp();
    await page.waitForURL('**/events', { timeout: 10000 });
    
    // Sign out
    await page.locator('[data-testid="signout-button"]').click();
    await page.waitForURL('**/auth', { timeout: 5000 });
    
    // Measure signin transaction
    const { duration } = await performanceMetrics.measureTransaction(
      'signin_transaction',
      async () => {
        await authPage.fillSignInForm(testUser.email, testUser.password);
        await authPage.submitSignIn();
        await page.waitForURL('**/events', { timeout: 10000 });
      }
    );
    
    console.log(`Signin transaction duration: ${duration}ms`);
    expect(duration).toBeLessThan(PerformanceThresholds.TRANSACTION.ACCEPTABLE);
  });

  test('Event booking transaction', async ({ page, authPage, eventsPage }) => {
    // Setup: login
    await authPage.goto();
    await authPage.switchToSignUp();
    await authPage.fillSignUpForm(testUser.email, testUser.password, testUser.fullName);
    await authPage.submitSignUp();
    await page.waitForURL('**/events', { timeout: 10000 });
    
    // Measure booking transaction
    const { duration } = await performanceMetrics.measureTransaction(
      'booking_transaction',
      async () => {
        await eventsPage.bookFirstEvent();
        await page.waitForTimeout(2000); // Wait for booking confirmation
      }
    );
    
    console.log(`Booking transaction duration: ${duration}ms`);
    expect(duration).toBeLessThan(PerformanceThresholds.TRANSACTION.EXCELLENT);
  });

  test('View dashboard transaction', async ({ page, authPage, dashboardPage }) => {
    // Setup: login and create a booking
    await authPage.goto();
    await authPage.switchToSignUp();
    await authPage.fillSignUpForm(testUser.email, testUser.password, testUser.fullName);
    await authPage.submitSignUp();
    await page.waitForURL('**/events', { timeout: 10000 });
    
    // Book an event
    await page.locator('[data-testid="book-button"]').first().click();
    await page.waitForTimeout(2000);
    
    // Measure dashboard load transaction
    const { duration } = await performanceMetrics.measureTransaction(
      'dashboard_load_transaction',
      async () => {
        await dashboardPage.goto();
        await dashboardPage.expectPageLoaded();
        await page.locator('[data-testid="booking-card"]').first().waitFor({ state: 'visible' });
      }
    );
    
    console.log(`Dashboard load transaction duration: ${duration}ms`);
    expect(duration).toBeLessThan(PerformanceThresholds.TRANSACTION.GOOD);
  });

  test('Complete user journey transaction', async ({ page, authPage, eventsPage, dashboardPage }) => {
    const { duration } = await performanceMetrics.measureTransaction(
      'complete_user_journey',
      async () => {
        // 1. Sign up
        await authPage.goto();
        await authPage.switchToSignUp();
        await authPage.fillSignUpForm(testUser.email, testUser.password, testUser.fullName);
        await authPage.submitSignUp();
        await page.waitForURL('**/events', { timeout: 10000 });
        
        // 2. View events
        await eventsPage.expectPageLoaded();
        
        // 3. Book event
        await eventsPage.bookFirstEvent();
        await page.waitForTimeout(2000);
        
        // 4. View dashboard
        await dashboardPage.goto();
        await dashboardPage.expectPageLoaded();
        
        // 5. Navigate back to events
        await dashboardPage.clickBackToEvents();
        await page.waitForURL('**/events', { timeout: 5000 });
      }
    );
    
    console.log(`Complete user journey duration: ${duration}ms`);
    expect(duration).toBeLessThan(15000); // 15 seconds for complete journey
  });

  test('Navigation transaction times', async ({ page, authPage, eventsPage, dashboardPage }) => {
    // Setup
    await authPage.goto();
    await authPage.switchToSignUp();
    await authPage.fillSignUpForm(testUser.email, testUser.password, testUser.fullName);
    await authPage.submitSignUp();
    await page.waitForURL('**/events', { timeout: 10000 });
    
    // Measure navigation to dashboard
    const dashboardNavDuration = await performanceMetrics.measureTransaction(
      'nav_to_dashboard',
      async () => {
        await eventsPage.navigateToDashboard();
        await page.waitForURL('**/dashboard', { timeout: 5000 });
      }
    );
    
    console.log(`Navigation to dashboard: ${dashboardNavDuration.duration}ms`);
    
    // Measure navigation back to events
    const eventsNavDuration = await performanceMetrics.measureTransaction(
      'nav_to_events',
      async () => {
        await dashboardPage.clickBackToEvents();
        await page.waitForURL('**/events', { timeout: 5000 });
      }
    );
    
    console.log(`Navigation to events: ${eventsNavDuration.duration}ms`);
    
    expect(dashboardNavDuration.duration).toBeLessThan(3000);
    expect(eventsNavDuration.duration).toBeLessThan(3000);
  });
});
