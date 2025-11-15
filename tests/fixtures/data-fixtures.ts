import { test as base } from '@playwright/test';
import { DataReader } from '../utils/data-reader';

/**
 * Data Reader Fixtures - Implements Dependency Inversion Principle
 * Automatically provides data reader to tests
 */
type DataFixtures = {
  dataReader: DataReader;
};

export const test = base.extend<DataFixtures>({
  dataReader: async ({}, use) => {
    const dataReader = new DataReader();
    await use(dataReader);
  },
});

export { expect } from '@playwright/test';
