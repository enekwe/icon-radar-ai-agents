import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import logger from '../utils/logger';

export function validateRequest(schema: z.ZodObject<any, any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn('Request validation failed', {
          path: req.path,
          errors: error.errors
        });

        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        });
      }

      next(error);
    }
  };
}

// Common validation schemas
export const BrandDiscoverySchema = z.object({
  athleteId: z.string().uuid(),
  athleteName: z.string().min(1).max(255),
  sport: z.string().optional(),
  maxResults: z.number().int().positive().max(50).optional()
});

export const VerificationSchema = z.object({
  brandName: z.string().min(1).max(255),
  athleteName: z.string().min(1).max(255),
  brandId: z.string().uuid().optional(),
  athleteId: z.string().uuid().optional()
});

export const MetricsCollectionSchema = z.object({
  brandId: z.string().uuid().optional(),
  brandName: z.string().min(1).max(255),
  socialProfiles: z.object({
    instagram: z.string().optional(),
    tiktok: z.string().optional(),
    linkedin: z.string().optional(),
    twitter: z.string().optional()
  }).optional(),
  website: z.string().url().optional()
});

export const ScoringSchema = z.object({
  brandId: z.string().uuid(),
  athleteId: z.string().uuid()
});

export const PipelineSchema = z.object({
  athleteId: z.string().uuid(),
  brandId: z.string().uuid().optional(),
  steps: z.array(z.enum(['discovery', 'verification', 'metrics', 'scoring'])),
  priority: z.enum(['low', 'normal', 'high']).optional()
});
