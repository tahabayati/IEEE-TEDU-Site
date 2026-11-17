import "server-only";
import { MongoClient } from "mongodb";
import { mongodbConfig } from "./service-config.mjs";

// Reuse the pool across requests and development hot reloads.
const cache = globalThis.__ieeeMongo ??= { client: null, promise: null };

export async function getMongoClient() {
  if (!cache.promise) {
    const { uri } = mongodbConfig();
    const client = new MongoClient(uri, {
      maxPoolSize: 5,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 10000,
    });
    cache.client = client;
    cache.promise = client.connect().catch(async (error) => {
      cache.promise = null;
      cache.client = null;
      await client.close();
      throw error;
    });
  }
  return cache.promise;
}

export async function getDatabase() {
  const { database } = mongodbConfig();
  return (await getMongoClient()).db(database);
}

// For command-line checks; application requests should reuse the pool.
export async function closeMongoClient() {
  const client = cache.client;
  cache.client = null;
  cache.promise = null;
  await client?.close();
}
