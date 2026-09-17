import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

/**
 * Local development entry point.
 *
 * On Vercel this file is never executed — `api/index.js` imports `app.js`
 * directly, because a serverless function has no long-lived process to listen on.
 */
const start = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error(`\x1b[31m✖ Could not reach MongoDB:\x1b[0m ${error.message}`);
    console.error('  Is MongoDB running? Check MONGO_URI in server/.env');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(
      `\x1b[32m✔ Muldhon API running\x1b[0m in ${process.env.NODE_ENV || 'development'} on http://localhost:${PORT}`
    );
  });
};

start();

process.on('unhandledRejection', (err) => {
  console.error(`Unhandled rejection: ${err.message}`);
  process.exit(1);
});
