const { query } = require('../config/queries');
const cron = require('node-cron');

const generateSlotsForTurfSport = async (turfSport, date) => {
  const { id, open_time, close_time, slot_duration_min } = turfSport;

  const openMinutes  = parseInt(open_time.split(':')[0])  * 60 + parseInt(open_time.split(':')[1]);
  const closeMinutes = parseInt(close_time.split(':')[0]) * 60 + parseInt(close_time.split(':')[1]);

  for (let start = openMinutes; start < closeMinutes; start += slot_duration_min) {
    const end = start + slot_duration_min;
    if (end > closeMinutes) break;

    const fmt = (mins) => `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;

    const existing = await query(
      `SELECT id FROM slots WHERE turf_sport_id = $1 AND date = $2 AND start_time = $3`,
      [id, date, fmt(start)]
    );

    if (existing.rows.length === 0) {
      await query(
        `INSERT INTO slots (turf_sport_id, date, start_time, end_time, status)
         VALUES ($1, $2, $3, $4, 'available')`,
        [id, date, fmt(start), fmt(end)]
      );
    }
  }
};

const generateSlotsForDays = async (days = 7) => {
  try {
    console.log(`[SlotGen] Generating slots for next ${days} days...`);

    const turfSports = await query(`
      SELECT ts.*
      FROM turf_sports ts
      JOIN turfs t ON t.id = ts.turf_id
      WHERE t.status = 'active'
    `);

    for (const turfSport of turfSports.rows) {
      for (let i = 0; i < days; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        await generateSlotsForTurfSport(turfSport, dateStr);
      }
    }

    console.log('[SlotGen] Done.');
  } catch (error) {
    console.error('[SlotGen] Failed:', error);
  }
};

const cleanupPastSlots = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const now   = new Date();
    const currentTime = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

    const result = await query(`
      UPDATE slots
      SET status = 'blocked'
      WHERE status = 'available'
        AND (
          date < $1
          OR (date = $1 AND end_time <= $2)
        )
    `, [today, currentTime]);

    if (result.rowCount > 0) {
      console.log(`[SlotGen] Blocked ${result.rowCount} past slots`);
    }
  } catch (error) {
    console.error('[SlotGen] Cleanup failed:', error);
  }
};

const startSlotGenerationJob = () => {
  cron.schedule('0 0 * * *', () => {
    console.log('[SlotGen] Daily job running...');
    generateSlotsForDays(7);
  });

  cron.schedule('*/30 * * * *', () => {
    cleanupPastSlots();
  });

  generateSlotsForDays(7);
  cleanupPastSlots();

  console.log('[SlotGen] Jobs scheduled (daily gen + 30min cleanup)');
};

module.exports = { generateSlotsForDays, startSlotGenerationJob };