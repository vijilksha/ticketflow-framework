import { test as base } from '@playwright/test';
import { ApiClient } from '../api/api-client';

/**
 * API Fixtures - Implements Dependency Inversion Principle
 * Automatically provides API client to tests
 */
type ApiFixtures = {
  apiClient: ApiClient;
};

export const test = base.extend<ApiFixtures>({
  apiClient: async ({}, use) => {
    const apiClient = new ApiClient();
    await apiClient.init();
    await use(apiClient);
    await apiClient.dispose();
  },
});

export { expect } from '@playwright/test';
