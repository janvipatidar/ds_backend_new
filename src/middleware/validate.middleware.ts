import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../utils/AppError.js';

export const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const result = schema.safeParse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (!result.success) {
        const errors = result.error.flatten();
        throw new ValidationError('Validation failed', {
          fieldErrors: errors.fieldErrors,
          formErrors: errors.formErrors,
        });
      }

      // Replace with validated data
      req.body = result.data.body;
      req.query = result.data.query;
      req.params = result.data.params;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new ValidationError('Validation failed', { errors: error.errors }));
      } else {
        next(error as Error);
      }
    }
  };
};