import { Page, Locator } from '@playwright/test';

export class EventsPage {
  readonly page: Page;
  readonly eventsGrid: Locator;
  readonly eventCard: Locator;
  readonly bookButton: Locator;
  readonly dashboardLink: Locator;
  readonly signOutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.eventsGrid = page.locator('[data-testid="events-grid"]');
    this.eventCard = page.locator('[data-testid="event-card"]');
    this.bookButton = page.locator('[data-testid="book-button"]');
    this.dashboardLink = page.locator('[data-testid="dashboard-link"]');
    this.signOutButton = page.locator('[data-testid="signout-button"]');
  }

  async goto() {
    await this.page.goto('/events');
  }

  async expectPageLoaded() {
    await this.eventsGrid.waitFor({ state: 'visible' });
  }

  async bookFirstEvent() {
    const firstBookButton = this.bookButton.first();
    await firstBookButton.waitFor({ state: 'visible' });
    await firstBookButton.click();
  }

  async navigateToDashboard() {
    await this.dashboardLink.click();
  }

  async signOut() {
    await this.signOutButton.click();
  }

  async getEventsCount(): Promise<number> {
    return await this.eventCard.count();
  }
}
