import { test, expect } from '../fixtures/api-fixtures';
import { generateTestUser } from '../fixtures/test-data';

test.describe('Bookings API', () => {
  test('should create a booking via API', async ({ apiClient }) => {
    const testUser = generateTestUser();
    
    // Sign up and get auth token
    const { data: authData } = await apiClient.signUp(
      testUser.email,
      testUser.password,
      testUser.fullName
    );
    
    const userId = authData.user.id;
    
    // Get events
    const { data: events } = await apiClient.getEvents();
    expect(events.length).toBeGreaterThan(0);
    
    const eventId = events[0].id;
    const quantity = 1;
    const totalAmount = events[0].price;
    
    // Create booking
    const { response, data } = await apiClient.createBooking(
      eventId,
      quantity,
      totalAmount,
      userId
    );
    
    expect(response.ok()).toBeTruthy();
    expect(Array.isArray(data)).toBeTruthy();
    
    if (data.length > 0) {
      expect(data[0]).toHaveProperty('id');
      expect(data[0].event_id).toBe(eventId);
      expect(data[0].user_id).toBe(userId);
      expect(data[0].quantity).toBe(quantity);
    }
  });

  test('should fetch user bookings via API', async ({ apiClient }) => {
    const testUser = generateTestUser();
    
    // Sign up
    const { data: authData } = await apiClient.signUp(
      testUser.email,
      testUser.password,
      testUser.fullName
    );
    
    const userId = authData.user.id;
    
    // Get events and create a booking
    const { data: events } = await apiClient.getEvents();
    const eventId = events[0].id;
    
    await apiClient.createBooking(eventId, 1, events[0].price, userId);
    
    // Fetch user bookings
    const { response, data } = await apiClient.getUserBookings(userId);
    
    expect(response.ok()).toBeTruthy();
    expect(Array.isArray(data)).toBeTruthy();
    expect(data.length).toBeGreaterThan(0);
    
    // Verify booking structure
    const booking = data[0];
    expect(booking).toHaveProperty('id');
    expect(booking).toHaveProperty('user_id');
    expect(booking).toHaveProperty('event_id');
    expect(booking).toHaveProperty('quantity');
    expect(booking).toHaveProperty('total_amount');
    expect(booking).toHaveProperty('booking_status');
    expect(booking.user_id).toBe(userId);
  });

  test('should verify booking data structure via API', async ({ apiClient }) => {
    const testUser = generateTestUser();
    
    // Sign up
    const { data: authData } = await apiClient.signUp(
      testUser.email,
      testUser.password,
      testUser.fullName
    );
    
    const userId = authData.user.id;
    
    // Create booking
    const { data: events } = await apiClient.getEvents();
    const { data: bookingData } = await apiClient.createBooking(
      events[0].id,
      1,
      events[0].price,
      userId
    );
    
    if (bookingData.length > 0) {
      const booking = bookingData[0];
      
      // Verify all required fields
      expect(booking).toHaveProperty('id');
      expect(booking).toHaveProperty('user_id');
      expect(booking).toHaveProperty('event_id');
      expect(booking).toHaveProperty('quantity');
      expect(booking).toHaveProperty('total_amount');
      expect(booking).toHaveProperty('booking_status');
      expect(booking).toHaveProperty('booking_date');
      expect(booking).toHaveProperty('created_at');
      expect(booking).toHaveProperty('updated_at');
      
      // Verify data types
      expect(typeof booking.id).toBe('string');
      expect(typeof booking.user_id).toBe('string');
      expect(typeof booking.event_id).toBe('string');
      expect(typeof booking.quantity).toBe('number');
      expect(typeof booking.total_amount).toBe('number');
      expect(typeof booking.booking_status).toBe('string');
    }
  });

  test('should return empty array for user with no bookings via API', async ({ apiClient }) => {
    const testUser = generateTestUser();
    
    // Sign up
    const { data: authData } = await apiClient.signUp(
      testUser.email,
      testUser.password,
      testUser.fullName
    );
    
    const userId = authData.user.id;
    
    // Fetch bookings (should be empty)
    const { response, data } = await apiClient.getUserBookings(userId);
    
    expect(response.ok()).toBeTruthy();
    expect(Array.isArray(data)).toBeTruthy();
    expect(data.length).toBe(0);
  });
});
