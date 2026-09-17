/**
 * Vercel serverless entry point.
 *
 * Vercel never runs `node src/server.js`, so `app.listen()` is never reached
 * there. It imports this file and calls the exported Express app as a handler.
 * The database connection is opened lazily inside app.js on the first request.
 */
import dotenv from 'dotenv';
import app from '../src/app.js';

dotenv.config();

export default app;
