import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ApiError } from './error.middleware';

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const apiError: ApiError = new Error(
          error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
        );
        apiError.statusCode = 400;
        apiError.code = 'VALIDATION_ERROR';
        return next(apiError);
      }
      return next(error);
    }
  };
};
