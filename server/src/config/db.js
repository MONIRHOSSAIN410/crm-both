import mongoose from 'mongoose';

/**
 * Describe MONGO_URI without ever printing the password.
 * Used by /api/health/db so a deployment problem can be diagnosed from the
 * browser instead of guessing.
 */
export const describeMongoUri = () => {
  const uri = process.env.MONGO_URI;
  if (!uri) return { configured: false, kind: 'missing', host: null };

  const kind = uri.startsWith('mongodb+srv://') ? 'atlas' : 'standard';
  let host = null;
  try {
    host = uri.replace(/^mongodb(\+srv)?:\/\//, '').split('@').pop().split('/')[0];
  } catch {
    host = 'unparseable';
  }

  const isLocal = /^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])/i.test(host || '');
  return { configured: true, kind, host, isLocal };
};

/**
 * Serverless-safe connection.
 *
 * On Vercel every request may hit a cold or warm lambda. Without caching,
 * each invocation opens a new connection pool and MongoDB quickly starts
 * refusing connections. The cached promise is reused for the life of the
 * container. Locally this behaves like a normal single connection.
 */
let cached = global._muldhonMongoose;
if (!cached) cached = global._muldhonMongoose = { conn: null, promise: null };

export const connectDB = async () => {
  if (cached.conn) return cached.conn;

  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/muldhon';

  // A serverless function on Vercel is killed at ~10s. With a 10s selection
  // timeout the driver was still waiting when the platform gave up, so the
  // browser got an HTML gateway-timeout page with no JSON message — which is
  // what turned every failure into a bare "Login failed". Failing at 6s lets
  // the API answer with a readable 503 instead.
  const serverSelectionTimeoutMS = Number(process.env.MONGO_TIMEOUT_MS || 6000);

  if (!cached.promise) {
    mongoose.set('strictQuery', true);
    cached.promise = mongoose
      .connect(uri, {
        serverSelectionTimeoutMS,
        connectTimeoutMS: serverSelectionTimeoutMS,
        socketTimeoutMS: 20000,
        maxPoolSize: 10,
      })
      .then((conn) => {
        console.log(
          `\x1b[32m✔ MongoDB connected:\x1b[0m ${conn.connection.host}/${conn.connection.name}`
        );
        return conn;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    // Don't cache a failed attempt — let the next request retry.
    cached.promise = null;
    // Previously this called process.exit(1), which kills a serverless
    // function instead of returning a readable error to the client.
    throw error;
  }

  return cached.conn;
};

export default connectDB;
