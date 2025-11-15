import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * DashboardPage - Implements Single Responsibility Principle
 * Handles only dashboard page interactions
 */
export class DashboardPage extends BasePage {
  protected readonly pageUrl = '/dashboard';
  
  private readonly dashboardTitle: Locator;
  private readonly totalBookingsCard: Locator;
  private readonly bookingsList: Locator;
  private readonly bookingCard: Locator;
  private readonly backToEventsButton: Locator;

  constructor(page: Page) {
    super(page);
    this.dashboardTitle = page.locator('[data-testid="dashboard-title"]');
    this.totalBookingsCard = page.locator('[data-testid="total-bookings"]');
    this.bookingsList = page.locator('[data-testid="bookings-list"]');
    this.bookingCard = page.locator('[data-testid="booking-card"]');
    this.backToEventsButton = page.locator('button:has-text("Back to Events")');
  }

  async expectPageLoaded(): Promise<void> {
    await this.dashboardTitle.waitFor({ state: 'visible' });
  }

  async getDashboardTitle(): Promise<string> {
    return await this.getTextContent(this.dashboardTitle);
  }

  async getTotalBookings(): Promise<string> {
    return await this.getTextContent(this.totalBookingsCard);
  }

  async expectBookingCardVisible(): Promise<void> {
    await this.bookingCard.first().waitFor({ state: 'visible' });
  }

  async clickBackToEvents(): Promise<void> {
    await this.clickElement(this.backToEventsButton);
  }

  async getBookingsCount(): Promise<number> {
    return await this.countElements(this.bookingCard);
  }

  async getBookingDetails(index: number): Promise<string> {
    const bookingCard = this.bookingCard.nth(index);
    return await this.getTextContent(bookingCard);
  }

  async isBookingsListVisible(): Promise<boolean> {
    return await this.isVisible(this.bookingsList);
  }
}
