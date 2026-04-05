import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../utils/AppError.js';
import { AuthUser } from './auth.middleware.js';

type Role = 'admin' | 'user' | 'moderator';

export const rbacMiddleware = (...allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = req.user as AuthUser | undefined;

    if (!user) {
      next(new ForbiddenError('User not authenticated'));
      return;
    }

    if (!allowedRoles.includes(user.role as Role)) {
      next(new ForbiddenError('Insufficient permissions'));
      return;
    }

    next();
  };
};