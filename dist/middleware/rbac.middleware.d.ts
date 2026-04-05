import { Request, Response, NextFunction } from 'express';
type Role = 'admin' | 'user' | 'moderator';
export declare const rbacMiddleware: (...allowedRoles: Role[]) => (req: Request, _res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=rbac.middleware.d.ts.map