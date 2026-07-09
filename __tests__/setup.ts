/**
 * Jest setup file
 * Runs before all tests
 */

import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.SERVICE_API_KEY = 'test-api-key';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/iconradar_test';

// Global test timeout
jest.setTimeout(30000);

// Mock external services
jest.mock('../src/services/langflowClient', () => ({
  langflowClient: {
    executeFlow: jest.fn(),
    getFlowStatus: jest.fn(),
    healthCheck: jest.fn().mockResolvedValue(true)
  }
}));
