import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import mongoose from 'mongoose';
import config from './config/env.js';
import { logger } from './lib/logger.js';
import { errorHandler } from './middleware/error.middleware.js';
import routes from './routes/index.js';
import { Admin } from './models/Admin.model.js';
const app = express();
// Security middleware
app.use(helmet());
app.use(cors({
    origin: config.corsOrigin,
    credentials: true,
}));
app.use(hpp());
// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter);
// Body parsing - increased for file uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// API routes
app.use('/api', routes);
// Error handling
app.use(errorHandler);
// Connect to MongoDB and start server
const startServer = async () => {
    try {
        await mongoose.connect(config.mongoUri);
        logger.info('Connected to MongoDB');
        // Seed default admin
        await Admin.seedDefaultAdmin();
        app.listen(config.port, () => {
            logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
export default app;
//# sourceMappingURL=index.js.map