import { ForbiddenError } from '../utils/AppError.js';

/**
 * After authMiddleware, ensures req.user.role is one of the allowed roles.
 */
export const rbacMiddleware = (...allowedRoles) => {
  return (req, _res, next) => {
    const user = req.user;

    if (!user) {
      next(new ForbiddenError('User not authenticated'));
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      next(new ForbiddenError('Insufficient permissions'));
      return;
    }

    next();
  };
};
