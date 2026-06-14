import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from './error.middleware';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const error: ApiError = new Error('Authentication required');
    error.statusCode = 401;
    error.code = 'UNAUTHORIZED';
    return next(error);
  }

  const token = authHeader.split(' ')[1];
  try {
    const secret = process.env.JWT_SECRET || 'fallback_secret_minimum_32_characters_long_for_auth_js';
    const decoded = jwt.verify(token, secret) as { id: string; email: string };
    req.user = decoded;
    next();
  } catch (err) {
    const error: ApiError = new Error('Invalid or expired token');
    error.statusCode = 401;
    error.code = 'INVALID_TOKEN';
    return next(error);
  }
};
