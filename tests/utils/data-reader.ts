import * as fs from 'fs';
import * as path from 'path';

/**
 * DataReader - Utility class for reading test data from CSV and JSON files
 * Implements Single Responsibility Principle - handles only data reading
 */
export class DataReader {
  private readonly dataDir: string;

  constructor(dataDir: string = 'tests/data') {
    this.dataDir = dataDir;
  }

  /**
   * Read and parse CSV file
   * @param filename - Name of the CSV file
   * @returns Array of objects where keys are column headers
   */
  readCSV(filename: string): Record<string, string>[] {
    const filePath = path.join(process.cwd(), this.dataDir, filename);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`CSV file not found: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length === 0) {
      return [];
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const data: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      const row: Record<string, string> = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      data.push(row);
    }

    return data;
  }

  /**
   * Read and parse JSON file
   * @param filename - Name of the JSON file
   * @returns Parsed JSON object
   */
  readJSON<T = any>(filename: string): T {
    const filePath = path.join(process.cwd(), this.dataDir, filename);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`JSON file not found: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T;
  }

  /**
   * Parse a single CSV line handling quoted values with commas
   * @param line - CSV line to parse
   * @returns Array of values
   */
  private parseCSVLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    values.push(current.trim());
    return values;
  }

  /**
   * Filter CSV data by column value
   * @param data - Array of CSV data
   * @param column - Column name to filter by
   * @param value - Value to match
   * @returns Filtered array
   */
  filterByColumn(data: Record<string, string>[], column: string, value: string): Record<string, string>[] {
    return data.filter(row => row[column] === value);
  }

  /**
   * Get unique values from a column
   * @param data - Array of CSV data
   * @param column - Column name
   * @returns Array of unique values
   */
  getUniqueValues(data: Record<string, string>[], column: string): string[] {
    return [...new Set(data.map(row => row[column]))];
  }
}

/**
 * Type definitions for test data
 */
export interface AuthTestData {
  testCase: string;
  email: string;
  password: string;
  fullName: string;
  expectedResult: string;
  description: string;
}

export interface EventFilterData {
  testCase: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  expectedMinCount: number;
  description: string;
}

export interface BookingScenarioData {
  testCase: string;
  eventIndex?: number;
  events?: number[];
  quantity: number;
  expectedStatus: string;
  description: string;
}

export interface UserProfileData {
  role: string;
  email: string;
  password: string;
  fullName: string;
  expectedPermissions: string[];
  description: string;
}
