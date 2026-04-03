import { runSync } from '../lib/sync/runSync';
import * as dotenv from 'dotenv';

// Load environment variables for local execution
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

runSync()
  .then(() => {
    console.log('Sync complete');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Sync failed:', err);
    process.exit(1);
  });