/**
 * Agent Routes
 * API endpoints for all AI agent operations
 */

import { Router } from 'express';
import * as agentController from '../controllers/agentController';
import { validateRequest, BrandDiscoverySchema, VerificationSchema, MetricsCollectionSchema, ScoringSchema, PipelineSchema } from '../middleware/validation';
import { requireServiceAuth } from '../middleware/auth';

const router = Router();

// All routes require service authentication
router.use(requireServiceAuth);

// BrandLink Agent endpoints
router.post(
  '/brandlink/discover',
  validateRequest(BrandDiscoverySchema),
  agentController.discoverBrands
);

// BizDataClean Agent endpoints
router.post(
  '/bizdataclean/verify',
  validateRequest(VerificationSchema),
  agentController.verifyOwnership
);

// BrandTrend Agent endpoints
router.post(
  '/brandtrend/collect',
  validateRequest(MetricsCollectionSchema),
  agentController.collectMetrics
);

// ChampionIndex Agent endpoints
router.post(
  '/championindex/calculate',
  validateRequest(ScoringSchema),
  agentController.calculateScore
);

// Pipeline orchestration endpoints
router.post(
  '/pipeline/execute',
  validateRequest(PipelineSchema),
  agentController.executePipeline
);

// Job status and results endpoints
router.get('/status/:jobId', agentController.getJobStatus);
router.get('/results/:jobId', agentController.getJobResults);

export default router;
