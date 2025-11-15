import { Page } from '@playwright/test';

/**
 * PerformanceMetrics - Utility class for measuring performance
 * Implements Single Responsibility Principle
 */
export class PerformanceMetrics {
  private metrics: Map<string, number[]> = new Map();

  /**
   * Measure page load time
   */
  async measurePageLoad(page: Page, url: string): Promise<number> {
    const startTime = Date.now();
    await page.goto(url);
    await page.waitForLoadState('domcontentloaded');
    const endTime = Date.now();
    
    const duration = endTime - startTime;
    this.recordMetric('page_load', duration);
    return duration;
  }

  /**
   * Measure time to interactive
   */
  async measureTimeToInteractive(page: Page, url: string): Promise<number> {
    const startTime = Date.now();
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    const endTime = Date.now();
    
    const duration = endTime - startTime;
    this.recordMetric('time_to_interactive', duration);
    return duration;
  }

  /**
   * Measure API response time
   */
  async measureApiResponse(apiCall: () => Promise<any>): Promise<number> {
    const startTime = Date.now();
    await apiCall();
    const endTime = Date.now();
    
    const duration = endTime - startTime;
    this.recordMetric('api_response', duration);
    return duration;
  }

  /**
   * Measure transaction duration
   */
  async measureTransaction<T>(
    transactionName: string,
    transaction: () => Promise<T>
  ): Promise<{ result: T; duration: number }> {
    const startTime = Date.now();
    const result = await transaction();
    const endTime = Date.now();
    
    const duration = endTime - startTime;
    this.recordMetric(transactionName, duration);
    
    return { result, duration };
  }

  /**
   * Get browser performance metrics
   */
  async getBrowserMetrics(page: Page): Promise<PerformanceTiming> {
    const performanceTimingJson = await page.evaluate(() => 
      JSON.stringify(window.performance.timing)
    );
    return JSON.parse(performanceTimingJson);
  }

  /**
   * Calculate page metrics from Performance API
   */
  async calculatePageMetrics(page: Page): Promise<PageMetrics> {
    const timing = await this.getBrowserMetrics(page);
    
    return {
      dns: timing.domainLookupEnd - timing.domainLookupStart,
      tcp: timing.connectEnd - timing.connectStart,
      request: timing.responseStart - timing.requestStart,
      response: timing.responseEnd - timing.responseStart,
      dom: timing.domComplete - timing.domLoading,
      load: timing.loadEventEnd - timing.loadEventStart,
      total: timing.loadEventEnd - timing.navigationStart,
    };
  }

  /**
   * Record metric value
   */
  private recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);
  }

  /**
   * Get average for a metric
   */
  getAverage(metricName: string): number {
    const values = this.metrics.get(metricName) || [];
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  /**
   * Get percentile for a metric
   */
  getPercentile(metricName: string, percentile: number): number {
    const values = this.metrics.get(metricName) || [];
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  /**
   * Get all metrics for a name
   */
  getMetrics(metricName: string): number[] {
    return this.metrics.get(metricName) || [];
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
  }

  /**
   * Generate performance report
   */
  generateReport(): PerformanceReport {
    const report: PerformanceReport = {};
    
    for (const [name, values] of this.metrics.entries()) {
      report[name] = {
        count: values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        avg: this.getAverage(name),
        p50: this.getPercentile(name, 50),
        p90: this.getPercentile(name, 90),
        p95: this.getPercentile(name, 95),
        p99: this.getPercentile(name, 99),
      };
    }
    
    return report;
  }
}

/**
 * Performance thresholds for different metrics
 */
export const PerformanceThresholds = {
  PAGE_LOAD: {
    EXCELLENT: 1000,
    GOOD: 2500,
    ACCEPTABLE: 4000,
  },
  API_RESPONSE: {
    EXCELLENT: 200,
    GOOD: 500,
    ACCEPTABLE: 1000,
  },
  TRANSACTION: {
    EXCELLENT: 2000,
    GOOD: 5000,
    ACCEPTABLE: 10000,
  },
};

/**
 * Type definitions
 */
interface PerformanceTiming {
  navigationStart: number;
  domainLookupStart: number;
  domainLookupEnd: number;
  connectStart: number;
  connectEnd: number;
  requestStart: number;
  responseStart: number;
  responseEnd: number;
  domLoading: number;
  domComplete: number;
  loadEventStart: number;
  loadEventEnd: number;
}

interface PageMetrics {
  dns: number;
  tcp: number;
  request: number;
  response: number;
  dom: number;
  load: number;
  total: number;
}

interface MetricStats {
  count: number;
  min: number;
  max: number;
  avg: number;
  p50: number;
  p90: number;
  p95: number;
  p99: number;
}

export interface PerformanceReport {
  [metricName: string]: MetricStats;
}
