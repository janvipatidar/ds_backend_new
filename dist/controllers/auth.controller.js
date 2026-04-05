import { authService } from '../services/auth.service.js';
import { logger } from '../lib/logger.js';
export class AuthController {
    async register(req, res, next) {
        try {
            const { name, email, password } = req.body;
            const result = await authService.register(name, email, password);
            logger.info(`User registered: ${email}`);
            res.status(201).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await authService.login(email, password);
            logger.info(`User logged in: ${email}`);
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getMe(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: { message: 'Unauthorized', code: 'UNAUTHORIZED' },
                });
                return;
            }
            const user = await authService.getUserById(userId);
            res.json({
                success: true,
                data: { user },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async logout(_req, res, next) {
        try {
            // In a real app, you might want to invalidate the token
            res.json({
                success: true,
                data: { message: 'Logged out successfully' },
            });
        }
        catch (error) {
            next(error);
        }
    }
    async refreshToken(req, res, next) {
        try {
            const { refreshToken } = req.body;
            const tokens = await authService.refreshToken(refreshToken);
            res.json({
                success: true,
                data: tokens,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
export const authController = new AuthController();
//# sourceMappingURL=auth.controller.js.map