import mongoose from 'mongoose';
import env from './env.js';

/**
 * Optional MongoDB Atlas connection foundation.
 * Phase 1 keeps this isolated so the API can boot without a URI.
 */
export async function connectDatabase() {
  if (!env.mongodbUri) {
    console.warn('[database] MONGODB_URI not set — skipping MongoDB connection (Phase 1).');
    return null;
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(env.mongodbUri, {
    dbName: env.mongodbDbName,
  });

  console.info('[database] Connected to MongoDB Atlas');
  return mongoose.connection;
}

export function getDatabaseStatus() {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return {
    configured: Boolean(env.mongodbUri),
    readyState: states[mongoose.connection.readyState] || 'unknown',
  };
}
