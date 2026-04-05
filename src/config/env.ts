import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  MONGODB_URI: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
  RATE_LIMIT_MAX: z.string().default('100'),
});

const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  console.error('❌ Invalid environment variables:');
  console.error(JSON.stringify(parseResult.error.format(), null, 2));
  process.exit(1);
}

export const config = {
  nodeEnv: parseResult.data.NODE_ENV,
  port: parseResult.data.PORT,
  mongoUri: parseResult.data.MONGODB_URI,
  jwt: {
    secret: parseResult.data.JWT_SECRET,
    expiresIn: parseResult.data.JWT_EXPIRES_IN,
    refreshExpiresIn: parseResult.data.JWT_REFRESH_EXPIRES_IN,
  },
  corsOrigin: parseResult.data.CORS_ORIGIN.split(','),
  rateLimit: {
    windowMs: parseResult.data.RATE_LIMIT_WINDOW_MS,
    max: parseResult.data.RATE_LIMIT_MAX,
  },
};

export default config;