import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import env from './config/env.js';
import apiRoutes from './routes/index.js';
import requestIdMiddleware from './middleware/requestIdMiddleware.js';
import sanitizeRequest from './middleware/sanitizeMiddleware.js';
import { apiRateLimiter } from './middleware/rateLimitMiddleware.js';
import notFoundMiddleware from './middleware/notFoundMiddleware.js';
import errorMiddleware from './middleware/errorMiddleware.js';
import { successResponse } from './utils/response.js';

const app = express();

if (env.trustProxy) {
  app.set('trust proxy', 1);
}

app.disable('x-powered-by');
app.use(requestIdMiddleware);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  })
);
app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser clients (curl, server tests) with no Origin header.
      if (!origin) return callback(null, true);
      if (env.clientOrigins.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(cookieParser());
app.use(sanitizeRequest);
app.use(apiRateLimiter);
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

app.get('/', (req, res) => {
  return successResponse(res, {
    name: env.apiName,
    version: env.apiVersion,
    domains: env.supportedProductTypes,
  });
});

app.use(`/api/${env.apiVersion}`, apiRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
