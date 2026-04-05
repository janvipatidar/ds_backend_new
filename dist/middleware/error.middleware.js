import { AppError } from '../utils/AppError.js';
import { logger } from '../lib/logger.js';
export const errorHandler = (err, _req, res, _next) => {
    if (err instanceof AppError) {
        logger.error({
            statusCode: err.statusCode,
            code: err.code,
            message: err.message,
            details: err.details,
        });
        res.status(err.statusCode).json({
            success: false,
            error: {
                message: err.message,
                code: err.code,
                details: err.details,
            },
        });
        return;
    }
    // Unexpected errors
    logger.error({
        message: err.message,
        stack: err.stack,
    });
    res.status(500).json({
        success: false,
        error: {
            message: 'An unexpected error occurred',
            code: 'INTERNAL_ERROR',
        },
    });
};
//# sourceMappingURL=error.middleware.js.map