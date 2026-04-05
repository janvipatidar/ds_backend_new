import { logger } from '../lib/logger.js';
export const loggerMiddleware = (req, res, next) => {
    const startTime = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        logger.info({
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('user-agent'),
        });
    });
    next();
};
//# sourceMappingURL=logger.middleware.js.map