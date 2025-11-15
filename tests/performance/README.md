# Performance Testing Guide

This directory contains performance tests for the Ticket Booking System.

## Test Files

### page-load-performance.spec.ts
Measures page load times and time-to-interactive for all major pages:
- Landing page
- Auth page
- Events page
- Dashboard page
- Page metrics breakdown (DNS, TCP, Request, Response, DOM, Load)

### api-performance.spec.ts
Measures API response times:
- Authentication (signup, signin)
- Events list and single event fetch
- Booking creation
- User bookings fetch
- Concurrent request performance
- API response consistency

### transaction-performance.spec.ts
Measures complete user transaction durations:
- Complete signup flow
- Complete signin flow
- Event booking transaction
- Dashboard load transaction
- Complete user journey (signup → book → dashboard)
- Navigation between pages

## Performance Thresholds

All tests use predefined thresholds from `PerformanceThresholds`:

**Page Load:**
- Excellent: < 1000ms
- Good: < 2500ms
- Acceptable: < 4000ms

**API Response:**
- Excellent: < 200ms
- Good: < 500ms
- Acceptable: < 1000ms

**Transaction:**
- Excellent: < 2000ms
- Good: < 5000ms
- Acceptable: < 10000ms

## Running Tests

```bash
# Run all performance tests
npx playwright test tests/performance/

# Run specific test file
npx playwright test tests/performance/page-load-performance.spec.ts

# Run with reporter
npx playwright test tests/performance/ --reporter=html
```

## Reading Performance Reports

After each test, a performance report is logged showing:

```json
{
  "page_load": {
    "count": 3,
    "min": 850,
    "max": 1200,
    "avg": 1015.67,
    "p50": 1000,
    "p90": 1180,
    "p95": 1190,
    "p99": 1198
  }
}
```

- **count**: Number of measurements
- **min/max**: Fastest and slowest times
- **avg**: Average time
- **p50/p90/p95/p99**: Percentile values

## Performance Optimization Tips

If tests fail:

1. **Check Network**: Slow network can impact all tests
2. **Review Browser Performance**: Use DevTools Performance tab
3. **Optimize Assets**: Compress images, minimize JS/CSS
4. **Enable Caching**: Use browser caching effectively
5. **Reduce API Calls**: Batch requests when possible
6. **Database Indexing**: Ensure proper indexes on queried fields
7. **CDN Usage**: Use CDN for static assets

## Continuous Monitoring

Run performance tests:
- Before major releases
- After significant code changes
- Weekly for trend analysis
- After infrastructure changes

Track metrics over time to identify performance degradation early.
