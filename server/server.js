import app from './app.js';
import env from './config/env.js';
import { connectDatabase } from './config/database.js';

async function start() {
  try {
    await connectDatabase();
  } catch (error) {
    console.error('[database] Atlas connection required — refusing to start without MongoDB.');
    console.error(error.message);
    process.exit(1);
  }

  const server = app.listen(env.port, () => {
    console.info(`[server] ${env.apiName} listening on port ${env.port}`);
    console.info(`[server] Health path: /api/${env.apiVersion}/health`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(
        `[server] Port ${env.port} is already in use. Stop the other process (or run: lsof -ti :${env.port} | xargs kill) and try again.`
      );
      process.exit(1);
    }
    throw error;
  });

  const shutdown = (signal) => {
    console.info(`[server] Received ${signal}, shutting down`);
    server.close(() => process.exit(0));
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start();
