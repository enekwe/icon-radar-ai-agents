import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    role: string;
    email: string;
  };
}

export function requireServiceAuth(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-service-api-key'] as string;

  if (!apiKey || apiKey !== process.env.SERVICE_API_KEY) {
    logger.warn('Unauthorized service-to-service request', {
      path: req.path,
      ip: req.ip,
      headers: req.headers
    });

    return res.status(403).json({
      success: false,
      error: 'Forbidden: Invalid service API key'
    });
  }

  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: No authentication token provided'
    });
  }

  const token = authHeader.substring(7);

  try {
    // In a real implementation, verify JWT token here
    // For now, we'll extract basic user info from the token
    // This should integrate with your auth service

    req.user = {
      userId: 'user-id', // Extract from JWT
      role: 'user', // Extract from JWT
      email: 'user@example.com' // Extract from JWT
    };

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid token'
    });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Insufficient permissions'
      });
    }
    next();
  };
}
