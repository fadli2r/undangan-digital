import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env or .env.local'
  );
}

const opts = {
  bufferCommands: false,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  family: 4
};

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const withTimeout = (promise, ms) => {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]);
};

async function dbConnect() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (mongoose.connection.readyState !== 1) {
    if (cached.conn) {
      try {
        await mongoose.connection.close();
      } catch (err) {
        console.warn('Error closing existing connection:', err);
      }
    }
    cached.conn = null;
    cached.promise = null;
  }

  try {
    if (!cached.promise) {
      cached.promise = mongoose.connect(MONGODB_URI, opts);
    }

    cached.conn = await cached.promise;

    // Tambahkan ini untuk menjamin koneksi sudah aktif
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Mongoose connected but not ready (readyState !== 1)');
    }

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      cached.conn = null;
      cached.promise = null;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
      cached.conn = null;
      cached.promise = null;
    });

    console.log('MongoDB connected successfully');
    return cached.conn;
  } catch (err) {
    cached.promise = null;
    cached.conn = null;
    console.error('MongoDB connection failed:', err);
    throw err;
  }
}

export async function ensureMongoConnected(timeout = 5000) {
  const start = Date.now();

  while (mongoose.connection.readyState !== 1) {
    if (Date.now() - start > timeout) {
      throw new Error('Timeout waiting for MongoDB connection');
    }
    await new Promise((res) => setTimeout(res, 100));
  }
}

export const checkDbHealth = async () => {
  try {
    if (!cached.conn || mongoose.connection.readyState !== 1) {
      await dbConnect();
    }
    await mongoose.connection.db.admin().ping();
    return { 
      status: 'healthy', 
      readyState: mongoose.connection.readyState 
    };
  } catch (error) {
    return { 
      status: 'unhealthy', 
      error: error.message, 
      readyState: mongoose.connection.readyState 
    };
  }
};

export default dbConnect;
