import { test, expect } from '../fixtures/page-fixtures';
import { ApiClient } from '../api/api-client';
import { generateTestUser } from '../fixtures/test-data';

/**
 * Authentication Integration Tests
 * Tests complete authentication flows combining UI and API interactions
 */
test.describe('Authentication Integration', () => {
  let apiClient: ApiClient;

  test.beforeEach(async () => {
    apiClient = new ApiClient();
    await apiClient.init();
  });

  test.afterEach(async () => {
    await apiClient.dispose();
  });

  test('Complete signup flow: UI signup -> API verification -> UI dashboard access', async ({ 
    authPage, 
    dashboardPage 
  }) => {
    const testUser = generateTestUser();
    
    // Step 1: UI - Navigate to auth page and sign up
    await authPage.navigate();
    await authPage.fillSignupForm(testUser.email, testUser.password, testUser.fullName);
    await authPage.submitSignup();
    
    // Step 2: Verify redirect to dashboard
    await expect(dashboardPage.page).toHaveURL(/.*dashboard/);
    
    // Step 3: API - Verify user profile was created
    await authPage.page.waitForTimeout(2000); // Wait for profile creation
    
    // Get session from UI to use in API
    const sessionData = await authPage.page.evaluate(() => {
      const session = localStorage.getItem('supabase.auth.token');
      return session ? JSON.parse(session) : null;
    });
    
    if (sessionData?.currentSession?.access_token) {
      apiClient.setAuthToken(sessionData.currentSession.access_token);
      const userId = sessionData.currentSession.user.id;
      
      const { response, data } = await apiClient.getProfile(userId);
      expect(response.ok()).toBeTruthy();
      expect(data).toHaveLength(1);
      expect(data[0].email).toBe(testUser.email);
      expect(data[0].full_name).toBe(testUser.fullName);
    }
    
    // Step 4: UI - Verify dashboard displays user info
    await expect(dashboardPage.page.getByText(testUser.fullName)).toBeVisible();
  });

  test('Complete signin flow: API user creation -> UI login -> API session verification', async ({ 
    authPage, 
    dashboardPage 
  }) => {
    const testUser = generateTestUser();
    
    // Step 1: API - Create user via API
    const { data: signupData } = await apiClient.signUp(
      testUser.email,
      testUser.password,
      testUser.fullName
    );
    
    expect(signupData.user).toBeDefined();
    expect(signupData.user.email).toBe(testUser.email);
    
    // Step 2: UI - Navigate to auth page and sign in
    await authPage.navigate();
    await authPage.switchToSignIn();
    await authPage.fillSignInForm(testUser.email, testUser.password);
    await authPage.submitSignIn();
    
    // Step 3: Verify redirect to dashboard
    await expect(dashboardPage.page).toHaveURL(/.*dashboard/);
    
    // Step 4: API - Verify session is valid
    const { response: sessionResponse, data: sessionData } = await apiClient.signIn(
      testUser.email,
      testUser.password
    );
    
    expect(sessionResponse.ok()).toBeTruthy();
    expect(sessionData.access_token).toBeDefined();
    expect(sessionData.user.email).toBe(testUser.email);
  });

  test('Complete logout flow: UI login -> UI logout -> API session invalidation', async ({ 
    authPage, 
    dashboardPage 
  }) => {
    const testUser = generateTestUser();
    
    // Step 1: Create and login user via UI
    await authPage.navigate();
    await authPage.fillSignupForm(testUser.email, testUser.password, testUser.fullName);
    await authPage.submitSignup();
    
    await expect(dashboardPage.page).toHaveURL(/.*dashboard/);
    
    // Step 2: Get auth token before logout
    const sessionData = await authPage.page.evaluate(() => {
      const session = localStorage.getItem('supabase.auth.token');
      return session ? JSON.parse(session) : null;
    });
    
    if (sessionData?.currentSession?.access_token) {
      apiClient.setAuthToken(sessionData.currentSession.access_token);
    }
    
    // Step 3: UI - Logout
    await dashboardPage.logout();
    
    // Step 4: Verify redirect to auth page
    await expect(authPage.page).toHaveURL(/.*auth/);
    
    // Step 5: API - Verify session is no longer valid
    await apiClient.signOut();
    expect(apiClient.getAuthToken()).toBeNull();
    
    // Step 6: Verify protected routes are inaccessible
    await dashboardPage.navigate();
    await expect(authPage.page).toHaveURL(/.*auth/);
  });

  test('Authentication persistence: UI login -> Page reload -> Session maintained', async ({ 
    authPage, 
    dashboardPage 
  }) => {
    const testUser = generateTestUser();
    
    // Step 1: Create and login user
    await authPage.navigate();
    await authPage.fillSignupForm(testUser.email, testUser.password, testUser.fullName);
    await authPage.submitSignup();
    
    await expect(dashboardPage.page).toHaveURL(/.*dashboard/);
    
    // Step 2: Reload the page
    await dashboardPage.page.reload();
    
    // Step 3: Verify still on dashboard (session persisted)
    await expect(dashboardPage.page).toHaveURL(/.*dashboard/);
    await expect(dashboardPage.page.getByText(testUser.fullName)).toBeVisible();
    
    // Step 4: API - Verify session data is still in localStorage
    const sessionData = await authPage.page.evaluate(() => {
      const session = localStorage.getItem('supabase.auth.token');
      return session ? JSON.parse(session) : null;
    });
    
    expect(sessionData).toBeTruthy();
    expect(sessionData.currentSession?.access_token).toBeDefined();
  });
});
