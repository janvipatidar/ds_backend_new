import { Request, Response, NextFunction } from 'express';
interface ErrorResponse {
    success: false;
    error: {
        message: string;
        code: string;
        details?: Record<string, unknown>;
    };
}
export declare const errorHandler: (err: Error, _req: Request, res: Response<ErrorResponse>, _next: NextFunction) => void;
export {};
//# sourceMappingURL=error.middleware.d.ts.map