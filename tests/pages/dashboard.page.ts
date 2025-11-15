import { Page, Locator } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly dashboardTitle: Locator;
  readonly totalBookingsCard: Locator;
  readonly bookingsList: Locator;
  readonly bookingCard: Locator;
  readonly backToEventsButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dashboardTitle = page.locator('[data-testid="dashboard-title"]');
    this.totalBookingsCard = page.locator('[data-testid="total-bookings"]');
    this.bookingsList = page.locator('[data-testid="bookings-list"]');
    this.bookingCard = page.locator('[data-testid="booking-card"]');
    this.backToEventsButton = page.locator('button:has-text("Back to Events")');
  }

  async goto() {
    await this.page.goto('/dashboard');
  }

  async expectPageLoaded() {
    await this.dashboardTitle.waitFor({ state: 'visible' });
  }

  async getDashboardTitle(): Promise<string> {
    return await this.dashboardTitle.textContent() || '';
  }

  async getTotalBookings(): Promise<string> {
    return await this.totalBookingsCard.textContent() || '0';
  }

  async expectBookingCardVisible() {
    await this.bookingCard.first().waitFor({ state: 'visible' });
  }

  async clickBackToEvents() {
    await this.backToEventsButton.click();
  }

  async getBookingsCount(): Promise<number> {
    const count = await this.bookingCard.count();
    return count;
  }
}
