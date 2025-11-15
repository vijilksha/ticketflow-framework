import { test as base } from '@playwright/test';
import { AuthPage } from '../pages/auth.page';
import { EventsPage } from '../pages/events.page';
import { DashboardPage } from '../pages/dashboard.page';

/**
 * Page Object Fixtures - Implements Dependency Inversion Principle
 * Automatically provides page objects to tests
 */
type PageFixtures = {
  authPage: AuthPage;
  eventsPage: EventsPage;
  dashboardPage: DashboardPage;
};

export const test = base.extend<PageFixtures>({
  authPage: async ({ page }, use) => {
    const authPage = new AuthPage(page);
    await use(authPage);
  },

  eventsPage: async ({ page }, use) => {
    const eventsPage = new EventsPage(page);
    await use(eventsPage);
  },

  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },
});

export { expect } from '@playwright/test';
