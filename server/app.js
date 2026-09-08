import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import env from './config/env.js';
import apiRoutes from './routes/index.js';
import requestIdMiddleware from './middleware/requestIdMiddleware.js';
import notFoundMiddleware from './middleware/notFoundMiddleware.js';
import errorMiddleware from './middleware/errorMiddleware.js';
import { successResponse } from './utils/response.js';

const app = express();

app.disable('x-powered-by');
app.use(requestIdMiddleware);
app.use(helmet());
app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true,
  })
);
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
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
