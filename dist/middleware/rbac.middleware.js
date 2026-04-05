import { ForbiddenError } from '../utils/AppError.js';
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
//# sourceMappingURL=rbac.middleware.js.map