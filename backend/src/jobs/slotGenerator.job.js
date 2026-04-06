const { query } = require('../config/queries');
const cron = require('node-cron');

const generateSlotsForTurfSport = async (turfSport, date) => {
  const { id, open_time, close_time, slot_duration_min } = turfSport;

  const openHour = parseInt(open_time.split(':')[0]);
  const openMin = parseInt(open_time.split(':')[1]);
  const closeHour = parseInt(close_time.split(':')[0]);
  const closeMin = parseInt(close_time.split(':')[1]);

  const openMinutes = openHour * 60 + openMin;
  const closeMinutes = closeHour * 60 + closeMin;

  const slots = [];
  for (let start = openMinutes; start < closeMinutes; start += slot_duration_min) {
    const end = start + slot_duration_min;
    if (end > closeMinutes) break;

    const startHour = Math.floor(start / 60).toString().padStart(2, '0');
    const startMin = (start % 60).toString().padStart(2, '0');
    const endHour = Math.floor(end / 60).toString().padStart(2, '0');
    const endMin = (end % 60).toString().padStart(2, '0');

    slots.push({
      start_time: `${startHour}:${startMin}`,
      end_time: `${endHour}:${endMin}`,
    });
  }

  for (const slot of slots) {
    const existing = await query(
      `SELECT id FROM slots 
       WHERE turf_sport_id = $1 AND date = $2 AND start_time = $3`,
      [id, date, slot.start_time]
    );

    if (existing.rows.length === 0) {
      await query(
        `INSERT INTO slots (turf_sport_id, date, start_time, end_time, status)
         VALUES ($1, $2, $3, $4, 'available')`,
        [id, date, slot.start_time, slot.end_time]
      );
    }
  }
};

const generateSlotsForDays = async (days = 7) => {
  try {
    console.log('Running slot generation job...');

    const turfSports = await query(`
      SELECT ts.*, t.status as turf_status 
      FROM turf_sports ts
      JOIN turfs t ON t.id = ts.turf_id
      WHERE t.status = 'active'
    `);

    for (const turfSport of turfSports.rows) {
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        await generateSlotsForTurfSport(turfSport, dateStr);
      }
    }

    console.log('Slot generation completed successfully');
  } catch (error) {
    console.error('Slot generation failed:', error);
  }
};

const startSlotGenerationJob = () => {
  cron.schedule('0 0 * * *', () => {
    generateSlotsForDays(7);
  });
  console.log('Slot generation cron job scheduled');
};

module.exports = { generateSlotsForDays, startSlotGenerationJob };