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
 * Turn a driver error into a sentence that names the actual fix.
 *
 * Every database failure used to surface as the same line ("Database
 * unavailable, open /api/health/db"), which meant the person seeing it on the
 * register form still had to go and look somewhere else. The driver already
 * knows which of the four things went wrong; this reads it out.
 */
export const explainDbError = (error) => {
  const uri = describeMongoUri();
  const message = String(error?.message || '');

  if (!uri.configured) {
    return 'MONGO_URI is not set on the server. Add it to server/.env locally, or to the Vercel project’s Environment Variables, then restart or redeploy.';
  }

  if (uri.isLocal && process.env.VERCEL) {
    return 'MONGO_URI points at localhost, which a deployed server can never reach. Use a MongoDB Atlas connection string (mongodb+srv://...).';
  }

  if (/bad auth|Authentication failed|auth failed|SCRAM/i.test(message)) {
    return 'The database username or password in MONGO_URI is wrong. Check the user under Atlas → Database Access. A password containing @ : / ? or # must be URL-encoded.';
  }

  if (/ENOTFOUND|EAI_AGAIN|querySrv|getaddrinfo/i.test(message)) {
    return `The database host (${uri.host}) could not be resolved. Check MONGO_URI for a typo, and that this machine has working DNS.`;
  }

  if (/IP|whitelist|not allowed/i.test(message)) {
    return 'Atlas is refusing this server’s IP address. Open Atlas → Network Access and allow 0.0.0.0/0 (a serverless function has no fixed IP to allow-list).';
  }

  if (/ECONNREFUSED/i.test(message)) {
    return uri.isLocal
      ? `Nothing is listening at ${uri.host}. Start MongoDB locally, or point MONGO_URI at an Atlas cluster.`
      : `${uri.host} refused the connection.`;
  }

  if (/timed out|timeout|ETIMEDOUT|Server selection/i.test(message)) {
    return uri.kind === 'atlas'
      ? `Could not reach ${uri.host} in time. Two usual causes: Atlas → Network Access does not allow this server (use 0.0.0.0/0), or this network blocks outbound port 27017. Run "npm run check:db" in the server folder to tell the two apart.`
      : `${uri.host} did not answer in time. Confirm MongoDB is running and reachable from here.`;
  }

  return `Database error: ${message}`;
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
