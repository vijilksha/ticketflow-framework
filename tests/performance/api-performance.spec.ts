import { test, expect } from '../fixtures/api-fixtures';
import { PerformanceMetrics, PerformanceThresholds } from '../utils/performance-metrics';
import { generateTestUser } from '../fixtures/test-data';

test.describe('API Performance', () => {
  let performanceMetrics: PerformanceMetrics;

  test.beforeEach(() => {
    performanceMetrics = new PerformanceMetrics();
  });

  test.afterEach(() => {
    const report = performanceMetrics.generateReport();
    console.log('API Performance Report:', JSON.stringify(report, null, 2));
  });

  test('Authentication signup API response time', async ({ apiClient }) => {
    const testUser = generateTestUser();
    
    const responseTime = await performanceMetrics.measureApiResponse(async () => {
      await apiClient.signUp(testUser.email, testUser.password, testUser.fullName);
    });
    
    console.log(`Signup API response time: ${responseTime}ms`);
    expect(responseTime).toBeLessThan(PerformanceThresholds.API_RESPONSE.ACCEPTABLE);
  });

  test('Authentication signin API response time', async ({ apiClient }) => {
    const testUser = generateTestUser();
    
    // Create user first
    await apiClient.signUp(testUser.email, testUser.password, testUser.fullName);
    
    // Measure signin
    const responseTime = await performanceMetrics.measureApiResponse(async () => {
      await apiClient.signIn(testUser.email, testUser.password);
    });
    
    console.log(`Signin API response time: ${responseTime}ms`);
    expect(responseTime).toBeLessThan(PerformanceThresholds.API_RESPONSE.ACCEPTABLE);
  });

  test('Events list API response time', async ({ apiClient }) => {
    const responseTime = await performanceMetrics.measureApiResponse(async () => {
      await apiClient.getEvents();
    });
    
    console.log(`Events list API response time: ${responseTime}ms`);
    expect(responseTime).toBeLessThan(PerformanceThresholds.API_RESPONSE.ACCEPTABLE);
  });

  test('Single event fetch API response time', async ({ apiClient }) => {
    const { data: events } = await apiClient.getEvents();
    
    if (events.length > 0) {
      const responseTime = await performanceMetrics.measureApiResponse(async () => {
        await apiClient.getEventById(events[0].id);
      });
      
      console.log(`Single event API response time: ${responseTime}ms`);
      expect(responseTime).toBeLessThan(PerformanceThresholds.API_RESPONSE.EXCELLENT);
    }
  });

  test('Create booking API response time', async ({ apiClient }) => {
    const testUser = generateTestUser();
    
    const { data: authData } = await apiClient.signUp(
      testUser.email,
      testUser.password,
      testUser.fullName
    );
    
    const { data: events } = await apiClient.getEvents();
    
    if (events.length > 0) {
      const responseTime = await performanceMetrics.measureApiResponse(async () => {
        await apiClient.createBooking(
          events[0].id,
          1,
          events[0].price,
          authData.user.id
        );
      });
      
      console.log(`Create booking API response time: ${responseTime}ms`);
      expect(responseTime).toBeLessThan(PerformanceThresholds.API_RESPONSE.ACCEPTABLE);
    }
  });

  test('User bookings fetch API response time', async ({ apiClient }) => {
    const testUser = generateTestUser();
    
    const { data: authData } = await apiClient.signUp(
      testUser.email,
      testUser.password,
      testUser.fullName
    );
    
    const responseTime = await performanceMetrics.measureApiResponse(async () => {
      await apiClient.getUserBookings(authData.user.id);
    });
    
    console.log(`User bookings API response time: ${responseTime}ms`);
    expect(responseTime).toBeLessThan(PerformanceThresholds.API_RESPONSE.ACCEPTABLE);
  });

  test('Concurrent API requests performance', async ({ apiClient }) => {
    const promises = [];
    
    const startTime = Date.now();
    
    // Make 5 concurrent requests
    for (let i = 0; i < 5; i++) {
      promises.push(apiClient.getEvents());
    }
    
    await Promise.all(promises);
    
    const totalTime = Date.now() - startTime;
    const avgTime = totalTime / 5;
    
    console.log(`Concurrent requests total time: ${totalTime}ms`);
    console.log(`Average time per request: ${avgTime}ms`);
    
    // With concurrency, average should be better than sequential
    expect(avgTime).toBeLessThan(PerformanceThresholds.API_RESPONSE.ACCEPTABLE);
  });

  test('API response time consistency', async ({ apiClient }) => {
    const iterations = 5;
    
    for (let i = 0; i < iterations; i++) {
      await performanceMetrics.measureApiResponse(async () => {
        await apiClient.getEvents();
      });
    }
    
    const avgTime = performanceMetrics.getAverage('api_response');
    const p95Time = performanceMetrics.getPercentile('api_response', 95);
    const p99Time = performanceMetrics.getPercentile('api_response', 99);
    
    console.log(`Average API response: ${avgTime.toFixed(2)}ms`);
    console.log(`95th percentile: ${p95Time.toFixed(2)}ms`);
    console.log(`99th percentile: ${p99Time.toFixed(2)}ms`);
    
    expect(p95Time).toBeLessThan(PerformanceThresholds.API_RESPONSE.ACCEPTABLE);
  });
});
