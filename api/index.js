/**
 * Vercel serverless entry point for the whole project.
 *
 * One Vercel project serves both halves of Muldhon:
 *   - the built React app (client/dist) as static files, and
 *   - this Express app on /api/*.
 *
 * Because both live on the same origin, the browser calls a relative `/api`
 * URL: there is no VITE_API_URL to keep in sync and no CORS preflight to get
 * wrong — the two most common reasons login and register used to fail after a
 * deploy.
 *
 * Vercel never runs `node src/server.js`, so `app.listen()` is never reached
 * here. It imports this file and calls the exported Express app as a handler.
 * The database connection is opened lazily inside app.js on the first request.
 */
import dotenv from 'dotenv';
import app from '../server/src/app.js';

dotenv.config();

export default app;
