import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * EventsPage - Implements Single Responsibility Principle
 * Handles only events page interactions
 */
export class EventsPage extends BasePage {
  protected readonly pageUrl = '/events';
  
  private readonly eventsGrid: Locator;
  private readonly eventCard: Locator;
  private readonly bookButton: Locator;
  private readonly dashboardLink: Locator;
  private readonly signOutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.eventsGrid = page.locator('[data-testid="events-grid"]');
    this.eventCard = page.locator('[data-testid="event-card"]');
    this.bookButton = page.locator('[data-testid="book-button"]');
    this.dashboardLink = page.locator('[data-testid="dashboard-link"]');
    this.signOutButton = page.locator('[data-testid="signout-button"]');
  }

  async expectPageLoaded(): Promise<void> {
    await this.eventsGrid.waitFor({ state: 'visible' });
  }

  async bookFirstEvent(): Promise<void> {
    const firstBookButton = this.bookButton.first();
    await this.clickElement(firstBookButton);
  }

  async bookEventByIndex(index: number): Promise<void> {
    const bookButton = this.bookButton.nth(index);
    await this.clickElement(bookButton);
  }

  async navigateToDashboard(): Promise<void> {
    await this.clickElement(this.dashboardLink);
  }

  async signOut(): Promise<void> {
    await this.clickElement(this.signOutButton);
  }

  async getEventsCount(): Promise<number> {
    return await this.countElements(this.eventCard);
  }

  async getEventTitle(index: number): Promise<string> {
    const eventCard = this.eventCard.nth(index);
    return await this.getTextContent(eventCard.locator('h3'));
  }

  async isEventsGridVisible(): Promise<boolean> {
    return await this.isVisible(this.eventsGrid);
  }
}
