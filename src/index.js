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

// Render, Heroku, etc. sit behind a reverse proxy — needed for correct client IP and rate limits
app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);
app.use(hpp());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', routes);

app.use(errorHandler);

const startServer = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    logger.info('Connected to MongoDB');

    await Admin.seedDefaultAdmin();

    const port = Number(config.port);
    const host = '0.0.0.0';

    const server = app.listen(port, host, () => {
      logger.info(`Server listening on http://${host}:${port} (${config.nodeEnv})`);
    });

    server.on('error', (err) => {
      console.error('HTTP server failed to start:', err.message);
      process.exit(1);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message || error);

    // Atlas blocks unknown IPs by default; Render uses different egress IPs than your laptop
    if (
      error.name === 'MongooseServerSelectionError' ||
      String(error.message).includes('whitelist')
    ) {
      console.error(`
MongoDB Atlas: allow your app host to connect
  • Atlas → Network Access → Add IP Address → allow "0.0.0.0/0" (anywhere) for dev/hobby, OR
  • Add Render’s outbound IPs only (Render Dashboard → your service → outbound IPs), for tighter security.
  • Docs: https://www.mongodb.com/docs/atlas/security/ip-access-list/
`);
    }

    if (error?.stack) console.error(error.stack);
    process.exit(1);
  }
};

startServer();

export default app;
