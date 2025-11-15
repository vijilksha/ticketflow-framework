import { test, expect } from '../fixtures/api-fixtures';
import { generateTestUser } from '../fixtures/test-data';

test.describe('Authentication API', () => {
  test('should sign up a new user via API', async ({ apiClient }) => {
    const testUser = generateTestUser();
    
    const { response, data } = await apiClient.signUp(
      testUser.email,
      testUser.password,
      testUser.fullName
    );
    
    expect(response.ok()).toBeTruthy();
    expect(data).toHaveProperty('access_token');
    expect(data).toHaveProperty('user');
    expect(data.user.email).toBe(testUser.email);
  });

  test('should sign in with valid credentials via API', async ({ apiClient }) => {
    const testUser = generateTestUser();
    
    // First sign up
    await apiClient.signUp(testUser.email, testUser.password, testUser.fullName);
    
    // Then sign in
    const { response, data } = await apiClient.signIn(testUser.email, testUser.password);
    
    expect(response.ok()).toBeTruthy();
    expect(data).toHaveProperty('access_token');
    expect(data).toHaveProperty('user');
    expect(data.user.email).toBe(testUser.email);
  });

  test('should fail sign in with invalid credentials via API', async ({ apiClient }) => {
    const { response } = await apiClient.signIn('invalid@example.com', 'wrongpassword');
    
    expect(response.ok()).toBeFalsy();
    expect(response.status()).toBe(400);
  });

  test('should sign out successfully via API', async ({ apiClient }) => {
    const testUser = generateTestUser();
    
    // Sign up first
    await apiClient.signUp(testUser.email, testUser.password, testUser.fullName);
    
    // Sign out
    const response = await apiClient.signOut();
    
    expect(response.ok()).toBeTruthy();
    expect(apiClient.getAuthToken()).toBeNull();
  });

  test('should fail to sign up with existing email via API', async ({ apiClient }) => {
    const testUser = generateTestUser();
    
    // First sign up
    await apiClient.signUp(testUser.email, testUser.password, testUser.fullName);
    
    // Try to sign up again with same email
    const { response } = await apiClient.signUp(testUser.email, testUser.password, testUser.fullName);
    
    expect(response.ok()).toBeFalsy();
  });
});
