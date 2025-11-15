import { test, expect } from '../fixtures/api-fixtures';

test.describe('Events API', () => {
  test('should fetch all events via API', async ({ apiClient }) => {
    const { response, data } = await apiClient.getEvents();
    
    expect(response.ok()).toBeTruthy();
    expect(Array.isArray(data)).toBeTruthy();
    
    if (data.length > 0) {
      expect(data[0]).toHaveProperty('id');
      expect(data[0]).toHaveProperty('title');
      expect(data[0]).toHaveProperty('price');
      expect(data[0]).toHaveProperty('event_date');
      expect(data[0]).toHaveProperty('venue');
    }
  });

  test('should fetch event by ID via API', async ({ apiClient }) => {
    // First get all events
    const { data: events } = await apiClient.getEvents();
    
    if (events.length > 0) {
      const firstEventId = events[0].id;
      
      // Fetch specific event
      const { response, data } = await apiClient.getEventById(firstEventId);
      
      expect(response.ok()).toBeTruthy();
      expect(Array.isArray(data)).toBeTruthy();
      expect(data.length).toBe(1);
      expect(data[0].id).toBe(firstEventId);
    }
  });

  test('should verify event data structure via API', async ({ apiClient }) => {
    const { response, data } = await apiClient.getEvents();
    
    expect(response.ok()).toBeTruthy();
    
    if (data.length > 0) {
      const event = data[0];
      
      // Verify all required fields
      expect(event).toHaveProperty('id');
      expect(event).toHaveProperty('title');
      expect(event).toHaveProperty('description');
      expect(event).toHaveProperty('price');
      expect(event).toHaveProperty('event_date');
      expect(event).toHaveProperty('venue');
      expect(event).toHaveProperty('category');
      expect(event).toHaveProperty('total_seats');
      expect(event).toHaveProperty('available_seats');
      expect(event).toHaveProperty('created_at');
      expect(event).toHaveProperty('updated_at');
      
      // Verify data types
      expect(typeof event.id).toBe('string');
      expect(typeof event.title).toBe('string');
      expect(typeof event.price).toBe('number');
      expect(typeof event.total_seats).toBe('number');
      expect(typeof event.available_seats).toBe('number');
    }
  });

  test('should return 406 for non-existent event ID via API', async ({ apiClient }) => {
    const { response } = await apiClient.getEventById('non-existent-id-12345');
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
    expect(data.length).toBe(0);
  });
});
