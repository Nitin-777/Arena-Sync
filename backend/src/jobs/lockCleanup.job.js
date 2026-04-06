const { query } = require('../config/queries');
const cron = require('node-cron');

const cleanupExpiredLocks = async () => {
  try {
    const result = await query(`
      UPDATE slots 
      SET status = 'available', locked_by = NULL, lock_expires_at = NULL
      WHERE status = 'locked' AND lock_expires_at < NOW()
    `);

    if (result.rowCount > 0) {
      console.log(`Released ${result.rowCount} expired slot locks`);
    }
  } catch (error) {
    console.error('Lock cleanup failed:', error);
  }
};

const startLockCleanupJob = () => {
  cron.schedule('* * * * *', () => {
    cleanupExpiredLocks();
  });
  console.log('Lock cleanup cron job scheduled');
};

module.exports = { cleanupExpiredLocks, startLockCleanupJob };