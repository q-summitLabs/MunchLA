import mongoose, { Mongoose } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

// Module-scoped variables to cache the connection
let cachedConn: Mongoose | null = null;
let cachedPromise: Promise<Mongoose> | null = null;

async function dbConnect(): Promise<Mongoose> {
  if (cachedConn) {
    return cachedConn;
  }

  if (!cachedPromise) {
    const opts = {
      bufferCommands: false,
      // Connection pooling options
      maxPoolSize: 10, // Adjust the pool size as needed
      minPoolSize: 1,
      autoIndex: true,
      serverSelectionTimeoutMS: 10000, // Adjust the server selection timeout as needed
    };

    const uri = MONGODB_URI || "def"; // Provide a default value
    cachedPromise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      console.log("Connected to MongoDB using connection pooling");
      return mongooseInstance;
    });
  }

  try {
    cachedConn = await cachedPromise;
  } catch (e: unknown) {
    if (e instanceof Error) {
      cachedPromise = null;
      throw e;
    }
  }

  return cachedConn as typeof import("mongoose");
}

export default dbConnect;
