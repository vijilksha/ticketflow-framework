import { test as base } from '@playwright/test';
import { PerformanceMetrics } from '../utils/performance-metrics';
import { VisualRegression } from '../utils/visual-regression';

/**
 * Performance Fixtures - Implements Dependency Inversion Principle
 * Automatically provides performance utilities to tests
 */
type PerformanceFixtures = {
  performanceMetrics: PerformanceMetrics;
  visualRegression: VisualRegression;
};

export const test = base.extend<PerformanceFixtures>({
  performanceMetrics: async ({}, use) => {
    const metrics = new PerformanceMetrics();
    await use(metrics);
    
    // Generate report after test
    const report = metrics.generateReport();
    console.log('Performance Report:', JSON.stringify(report, null, 2));
  },

  visualRegression: async ({}, use) => {
    const visualRegression = new VisualRegression();
    await use(visualRegression);
  },
});

export { expect } from '@playwright/test';
