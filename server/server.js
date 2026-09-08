import app from './app.js';
import env from './config/env.js';
import { connectDatabase } from './config/database.js';

async function start() {
  try {
    await connectDatabase();
  } catch (error) {
    console.error('[database] Connection failed — continuing without MongoDB in Phase 1.');
    console.error(error.message);
  }

  const server = app.listen(env.port, () => {
    console.info(`[server] ${env.apiName} listening on port ${env.port}`);
    console.info(`[server] Health path: /api/${env.apiVersion}/health`);
  });

  const shutdown = (signal) => {
    console.info(`[server] Received ${signal}, shutting down`);
    server.close(() => process.exit(0));
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start();
