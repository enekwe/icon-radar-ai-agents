/**
 * Agent Controller Tests
 */

import request from 'supertest';
import app from '../src/index';

describe('Agent Controller', () => {
  const serviceApiKey = process.env.SERVICE_API_KEY || 'test-api-key';

  describe('POST /api/v1/agents/brandlink/discover', () => {
    it('should discover brands for an athlete', async () => {
      const response = await request(app)
        .post('/api/v1/agents/brandlink/discover')
        .set('x-service-api-key', serviceApiKey)
        .send({
          athleteId: '123e4567-e89b-12d3-a456-426614174000',
          athleteName: 'LeBron James',
          sport: 'Basketball',
          maxResults: 10
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should return 400 for invalid input', async () => {
      const response = await request(app)
        .post('/api/v1/agents/brandlink/discover')
        .set('x-service-api-key', serviceApiKey)
        .send({
          athleteName: 'LeBron James'
          // Missing athleteId
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 403 without API key', async () => {
      const response = await request(app)
        .post('/api/v1/agents/brandlink/discover')
        .send({
          athleteId: '123e4567-e89b-12d3-a456-426614174000',
          athleteName: 'LeBron James'
        });

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/v1/agents/bizdataclean/verify', () => {
    it('should verify ownership relationship', async () => {
      const response = await request(app)
        .post('/api/v1/agents/bizdataclean/verify')
        .set('x-service-api-key', serviceApiKey)
        .send({
          brandName: 'SpringHill Entertainment',
          athleteName: 'LeBron James'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('POST /api/v1/agents/brandtrend/collect', () => {
    it('should collect social media metrics', async () => {
      const response = await request(app)
        .post('/api/v1/agents/brandtrend/collect')
        .set('x-service-api-key', serviceApiKey)
        .send({
          brandName: 'SpringHill Entertainment',
          brandId: '123e4567-e89b-12d3-a456-426614174001',
          socialProfiles: {
            instagram: '@springhill',
            twitter: '@springhill'
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/agents/championindex/calculate', () => {
    it('should calculate Champion Index score', async () => {
      const response = await request(app)
        .post('/api/v1/agents/championindex/calculate')
        .set('x-service-api-key', serviceApiKey)
        .send({
          brandId: '123e4567-e89b-12d3-a456-426614174001',
          athleteId: '123e4567-e89b-12d3-a456-426614174000'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('POST /api/v1/agents/pipeline/execute', () => {
    it('should execute full pipeline', async () => {
      const response = await request(app)
        .post('/api/v1/agents/pipeline/execute')
        .set('x-service-api-key', serviceApiKey)
        .send({
          athleteId: '123e4567-e89b-12d3-a456-426614174000',
          brandId: '123e4567-e89b-12d3-a456-426614174001',
          steps: ['discovery', 'verification', 'metrics', 'scoring'],
          priority: 'high'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('GET /api/v1/agents/status/:jobId', () => {
    it('should get job status', async () => {
      const response = await request(app)
        .get('/api/v1/agents/status/job-123')
        .set('x-service-api-key', serviceApiKey);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
      expect(response.body.service).toBe('ai-agents');
    });
  });
});
