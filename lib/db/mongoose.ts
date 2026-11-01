import mongoose from "mongoose";

// SECURITY: neutralise query-operator injection on every findOne/find filter.
// Attacker-supplied objects like { $ne: null } are wrapped in { $eq: ... }.
mongoose.set("sanitizeFilter", true);

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not defined");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI!, {
      bufferCommands: false,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    // Do not cache a rejected promise: a transient failure must not wedge the
    // process forever. Reset so the next call retries the connection.
    cached.promise = null;
    throw err;
  }
  return cached.conn;
}
