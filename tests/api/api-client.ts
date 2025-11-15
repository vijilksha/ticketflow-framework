import { request, APIRequestContext } from '@playwright/test';

/**
 * ApiClient - Implements Single Responsibility Principle
 * Handles API requests to the backend
 */
export class ApiClient {
  private context: APIRequestContext | null = null;
  private readonly baseURL: string;
  private readonly supabaseKey: string;
  private authToken: string | null = null;

  constructor(baseURL: string = 'http://localhost:54321', supabaseKey: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVka2dyanpvZ29tbnZtYml4ZXJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMzY0OTEsImV4cCI6MjA3ODcxMjQ5MX0.lZZKbvViUfV8KgVcwCmpQx_wRHkf3vsgvIidumzoLck') {
    this.baseURL = baseURL;
    this.supabaseKey = supabaseKey;
  }

  async init(): Promise<void> {
    this.context = await request.newContext({
      baseURL: this.baseURL,
      extraHTTPHeaders: {
        'apikey': this.supabaseKey,
        'Content-Type': 'application/json',
      },
    });
  }

  async dispose(): Promise<void> {
    if (this.context) {
      await this.context.dispose();
    }
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'apikey': this.supabaseKey,
      'Content-Type': 'application/json',
    };
    
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    
    return headers;
  }

  /**
   * Authentication API calls
   */
  async signUp(email: string, password: string, fullName: string) {
    if (!this.context) throw new Error('ApiClient not initialized');
    
    const response = await this.context.post('/auth/v1/signup', {
      headers: this.getHeaders(),
      data: {
        email,
        password,
        data: { full_name: fullName },
      },
    });
    
    const data = await response.json();
    if (data.access_token) {
      this.authToken = data.access_token;
    }
    
    return { response, data };
  }

  async signIn(email: string, password: string) {
    if (!this.context) throw new Error('ApiClient not initialized');
    
    const response = await this.context.post('/auth/v1/token?grant_type=password', {
      headers: this.getHeaders(),
      data: { email, password },
    });
    
    const data = await response.json();
    if (data.access_token) {
      this.authToken = data.access_token;
    }
    
    return { response, data };
  }

  async signOut() {
    if (!this.context) throw new Error('ApiClient not initialized');
    
    const response = await this.context.post('/auth/v1/logout', {
      headers: this.getHeaders(),
    });
    
    this.authToken = null;
    return response;
  }

  /**
   * Events API calls
   */
  async getEvents() {
    if (!this.context) throw new Error('ApiClient not initialized');
    
    const response = await this.context.get('/rest/v1/events?select=*', {
      headers: this.getHeaders(),
    });
    
    return { response, data: await response.json() };
  }

  async getEventById(id: string) {
    if (!this.context) throw new Error('ApiClient not initialized');
    
    const response = await this.context.get(`/rest/v1/events?id=eq.${id}&select=*`, {
      headers: this.getHeaders(),
    });
    
    return { response, data: await response.json() };
  }

  /**
   * Bookings API calls
   */
  async createBooking(eventId: string, quantity: number, totalAmount: number, userId: string) {
    if (!this.context) throw new Error('ApiClient not initialized');
    
    const response = await this.context.post('/rest/v1/bookings', {
      headers: this.getHeaders(),
      data: {
        event_id: eventId,
        quantity,
        total_amount: totalAmount,
        user_id: userId,
      },
    });
    
    return { response, data: await response.json() };
  }

  async getUserBookings(userId: string) {
    if (!this.context) throw new Error('ApiClient not initialized');
    
    const response = await this.context.get(`/rest/v1/bookings?user_id=eq.${userId}&select=*,events(*)`, {
      headers: this.getHeaders(),
    });
    
    return { response, data: await response.json() };
  }

  async getBookingById(id: string) {
    if (!this.context) throw new Error('ApiClient not initialized');
    
    const response = await this.context.get(`/rest/v1/bookings?id=eq.${id}&select=*`, {
      headers: this.getHeaders(),
    });
    
    return { response, data: await response.json() };
  }

  /**
   * Profile API calls
   */
  async getProfile(userId: string) {
    if (!this.context) throw new Error('ApiClient not initialized');
    
    const response = await this.context.get(`/rest/v1/profiles?user_id=eq.${userId}&select=*`, {
      headers: this.getHeaders(),
    });
    
    return { response, data: await response.json() };
  }

  setAuthToken(token: string): void {
    this.authToken = token;
  }

  getAuthToken(): string | null {
    return this.authToken;
  }
}
