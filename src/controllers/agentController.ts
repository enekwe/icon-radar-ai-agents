/**
 * Agent Controller
 * Handles HTTP requests for all AI agent operations
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from '@enekwe/icon-radar-shared';
import { BrandLinkService } from '../services/brandlinkService';
import { BizDataCleanService } from '../services/bizdatacleanService';
import { BrandTrendService } from '../services/brandtrendService';
import { ChampionIndexService } from '../services/championindexService';
import { OrchestrationService } from '../services/orchestrationService';

const prisma = new PrismaClient();

// Initialize services
const brandLinkService = new BrandLinkService(prisma);
const bizDataCleanService = new BizDataCleanService(prisma);
const brandTrendService = new BrandTrendService(prisma);
const championIndexService = new ChampionIndexService(prisma);
const orchestrationService = new OrchestrationService(prisma);

/**
 * POST /api/v1/agents/brandlink/discover
 * Discover brands for an athlete
 */
export async function discoverBrands(req: Request, res: Response) {
  try {
    const { athleteId, athleteName, sport, maxResults } = req.body;

    logger.info('Request: Discover brands', { athleteId, athleteName });

    const result = await brandLinkService.discoverBrands(
      athleteId,
      athleteName,
      sport,
      maxResults
    );

    if (result.success) {
      res.status(200).json({
        success: true,
        data: result.data,
        metadata: result.metadata,
        executionTime: result.executionTime
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Error in discoverBrands:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * POST /api/v1/agents/bizdataclean/verify
 * Verify ownership relationship
 */
export async function verifyOwnership(req: Request, res: Response) {
  try {
    const { brandName, athleteName, brandId, athleteId } = req.body;

    logger.info('Request: Verify ownership', { brandName, athleteName });

    const result = await bizDataCleanService.verifyOwnership(
      brandName,
      athleteName,
      brandId,
      athleteId
    );

    if (result.success) {
      res.status(200).json({
        success: true,
        data: result.data,
        confidence: result.confidence,
        metadata: result.metadata,
        executionTime: result.executionTime
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Error in verifyOwnership:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * POST /api/v1/agents/brandtrend/collect
 * Collect social media metrics
 */
export async function collectMetrics(req: Request, res: Response) {
  try {
    const { brandName, brandId, socialProfiles, website } = req.body;

    logger.info('Request: Collect metrics', { brandName, brandId });

    const result = await brandTrendService.collectMetrics(
      brandName,
      brandId,
      socialProfiles,
      website
    );

    if (result.success) {
      res.status(200).json({
        success: true,
        data: result.data,
        metadata: result.metadata,
        executionTime: result.executionTime
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Error in collectMetrics:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * POST /api/v1/agents/championindex/calculate
 * Calculate Champion Index score
 */
export async function calculateScore(req: Request, res: Response) {
  try {
    const { brandId, athleteId } = req.body;

    logger.info('Request: Calculate score', { brandId, athleteId });

    const result = await championIndexService.calculateScore(brandId, athleteId);

    if (result.success) {
      res.status(200).json({
        success: true,
        data: result.data,
        confidence: result.confidence,
        metadata: result.metadata,
        executionTime: result.executionTime
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Error in calculateScore:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * POST /api/v1/agents/pipeline/execute
 * Execute full agent pipeline
 */
export async function executePipeline(req: Request, res: Response) {
  try {
    const pipelineRequest = req.body;

    logger.info('Request: Execute pipeline', {
      athleteId: pipelineRequest.athleteId,
      steps: pipelineRequest.steps
    });

    const result = await orchestrationService.executePipeline(pipelineRequest);

    res.status(200).json({
      success: true,
      data: result,
      completedSteps: result.completedSteps,
      failedSteps: result.failedSteps,
      executionTime: result.totalExecutionTime
    });
  } catch (error) {
    logger.error('Error in executePipeline:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * GET /api/v1/agents/status/:jobId
 * Get job status
 */
export async function getJobStatus(req: Request, res: Response) {
  try {
    const { jobId } = req.params;

    logger.info('Request: Get job status', { jobId });

    // TODO: Implement job status tracking
    res.status(200).json({
      success: true,
      data: {
        jobId,
        status: 'completed',
        progress: 100
      }
    });
  } catch (error) {
    logger.error('Error in getJobStatus:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * GET /api/v1/agents/results/:jobId
 * Get job results
 */
export async function getJobResults(req: Request, res: Response) {
  try {
    const { jobId } = req.params;

    logger.info('Request: Get job results', { jobId });

    // TODO: Implement job results retrieval
    res.status(200).json({
      success: true,
      data: {
        jobId,
        results: []
      }
    });
  } catch (error) {
    logger.error('Error in getJobResults:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}
