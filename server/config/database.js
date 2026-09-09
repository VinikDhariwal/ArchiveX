import mongoose from 'mongoose';
import env from './env.js';

/**
 * MongoDB Atlas connection for ArchiveX.
 * Phase 4 models require a URI for seeding; the API can still boot without it in development.
 */
export async function connectDatabase() {
  if (!env.mongodbUri) {
    console.warn('[database] MONGODB_URI not set — skipping MongoDB connection.');
    return null;
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(env.mongodbUri, {
    dbName: env.mongodbDbName,
  });

  console.info(`[database] Connected to MongoDB (${env.mongodbDbName})`);
  return mongoose.connection;
}

export function getDatabaseStatus() {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return {
    configured: Boolean(env.mongodbUri),
    readyState: states[mongoose.connection.readyState] || 'unknown',
  };
}
