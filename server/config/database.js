import mongoose from 'mongoose';
import env from './env.js';

/**
 * MongoDB Atlas only — ArchiveX stores all durable data in Atlas
 * (documents + GridFS media). No local MongoDB or disk datastore.
 */
export async function connectDatabase() {
  if (!env.mongodbUri) {
    throw new Error(
      '[database] MONGODB_URI is required. ArchiveX uses MongoDB Atlas only (no local DB).'
    );
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(env.mongodbUri, {
    dbName: env.mongodbDbName,
  });

  console.info(`[database] Connected to MongoDB Atlas (${env.mongodbDbName})`);
  return mongoose.connection;
}

export function getDatabaseStatus() {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return {
    configured: Boolean(env.mongodbUri),
    readyState: states[mongoose.connection.readyState] || 'unknown',
  };
}
