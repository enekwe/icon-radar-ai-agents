/**
 * Agent Orchestration Service
 * Coordinates execution of multiple agents in pipelines
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '@enekwe/icon-radar-shared';
import { BrandLinkService } from './brandlinkService';
import { BizDataCleanService } from './bizdatacleanService';
import { BrandTrendService } from './brandtrendService';
import { ChampionIndexService } from './championindexService';
import { PipelineExecutionRequest, PipelineExecutionResult } from '../types';

export class OrchestrationService {
  private brandLinkService: BrandLinkService;
  private bizDataCleanService: BizDataCleanService;
  private brandTrendService: BrandTrendService;
  private championIndexService: ChampionIndexService;

  constructor(prisma: PrismaClient) {
    this.brandLinkService = new BrandLinkService(prisma);
    this.bizDataCleanService = new BizDataCleanService(prisma);
    this.brandTrendService = new BrandTrendService(prisma);
    this.championIndexService = new ChampionIndexService(prisma);
  }

  async executePipeline(request: PipelineExecutionRequest): Promise<PipelineExecutionResult> {
    const startTime = Date.now();
    const result: PipelineExecutionResult = {
      athleteId: request.athleteId,
      brandId: request.brandId,
      totalExecutionTime: 0,
      completedSteps: [],
      failedSteps: []
    };

    logger.info(`Orchestration: Starting pipeline execution`, {
      athleteId: request.athleteId,
      steps: request.steps
    });

    for (const step of request.steps) {
      try {
        switch (step) {
          case 'discovery':
            if (request.athleteId) {
              const discoveryResult = await this.brandLinkService.discoverBrands(
                request.athleteId,
                'Athlete Name', // Would be fetched from database
                undefined,
                20
              );

              if (discoveryResult.success && discoveryResult.data) {
                result.discovery = discoveryResult.data;
                result.completedSteps.push('discovery');
              } else {
                result.failedSteps.push('discovery');
              }
            }
            break;

          case 'verification':
            if (result.discovery && result.discovery.length > 0) {
              const verifications = [];
              for (const discovery of result.discovery) {
                const verificationResult = await this.bizDataCleanService.verifyOwnership(
                  discovery.brandName,
                  discovery.athleteName
                );

                if (verificationResult.success && verificationResult.data) {
                  verifications.push(verificationResult.data);
                }
              }
              result.verification = verifications;
              result.completedSteps.push('verification');
            }
            break;

          case 'metrics':
            if (request.brandId) {
              const metricsResult = await this.brandTrendService.collectMetrics(
                'Brand Name', // Would be fetched from database
                request.brandId
              );

              if (metricsResult.success && metricsResult.data) {
                result.metrics = metricsResult.data;
                result.completedSteps.push('metrics');
              } else {
                result.failedSteps.push('metrics');
              }
            }
            break;

          case 'scoring':
            if (request.brandId && request.athleteId) {
              const scoringResult = await this.championIndexService.calculateScore(
                request.brandId,
                request.athleteId
              );

              if (scoringResult.success && scoringResult.data) {
                result.scoring = scoringResult.data;
                result.completedSteps.push('scoring');
              } else {
                result.failedSteps.push('scoring');
              }
            }
            break;
        }
      } catch (error) {
        logger.error(`Orchestration: Step ${step} failed`, { error });
        result.failedSteps.push(step);
      }
    }

    result.totalExecutionTime = Date.now() - startTime;

    logger.info(`Orchestration: Pipeline execution completed`, {
      athleteId: request.athleteId,
      completedSteps: result.completedSteps,
      failedSteps: result.failedSteps,
      executionTime: result.totalExecutionTime
    });

    return result;
  }
}
