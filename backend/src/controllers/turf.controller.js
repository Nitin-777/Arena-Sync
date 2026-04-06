const { query } = require('../config/queries');

const getAllTurfs = async (req, res) => {
  try {
    const result = await query(`
      SELECT t.*, 
        json_agg(
          json_build_object(
            'id', ts.id,
            'sport', ts.sport,
            'base_price', ts.base_price,
            'open_time', ts.open_time,
            'close_time', ts.close_time
          )
        ) as sports
      FROM turfs t
      LEFT JOIN turf_sports ts ON ts.turf_id = t.id
      WHERE t.status = 'active'
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `);

    res.json({ turfs: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getTurfById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT t.*, 
        json_agg(
          json_build_object(
            'id', ts.id,
            'sport', ts.sport,
            'base_price', ts.base_price,
            'open_time', ts.open_time,
            'close_time', ts.close_time,
            'slot_duration_min', ts.slot_duration_min
          )
        ) as sports
      FROM turfs t
      LEFT JOIN turf_sports ts ON ts.turf_id = t.id
      WHERE t.id = $1 AND t.status = 'active'
      GROUP BY t.id
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Turf not found' });
    }

    res.json({ turf: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createTurf = async (req, res) => {
  try {
    const {
      name,
      address,
      latitude,
      longitude,
      amenities,
      images,
      sports,
    } = req.body;

    if (!name || !address || !sports || sports.length === 0) {
      return res.status(400).json({ message: 'Name, address and at least one sport are required' });
    }

    const turfResult = await query(
      `INSERT INTO turfs (owner_id, name, address, latitude, longitude, amenities, images)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        req.user.id,
        name,
        address,
        latitude || null,
        longitude || null,
        JSON.stringify(amenities || []),
        JSON.stringify(images || []),
      ]
    );

    const turf = turfResult.rows[0];

    for (const sport of sports) {
      await query(
        `INSERT INTO turf_sports (turf_id, sport, base_price, open_time, close_time, slot_duration_min)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          turf.id,
          sport.sport,
          sport.base_price,
          sport.open_time,
          sport.close_time,
          sport.slot_duration_min || 60,
        ]
      );
    }

    const cancellationPolicies = [
      { hours_before: 24, refund_percent: 100 },
      { hours_before: 6, refund_percent: 50 },
      { hours_before: 0, refund_percent: 0 },
    ];

    for (const policy of cancellationPolicies) {
      await query(
        `INSERT INTO cancellation_policies (turf_id, hours_before, refund_percent)
         VALUES ($1, $2, $3)`,
        [turf.id, policy.hours_before, policy.refund_percent]
      );
    }

    res.status(201).json({ message: 'Turf created successfully', turf });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateTurf = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, latitude, longitude, amenities, status } = req.body;

    const existing = await query('SELECT * FROM turfs WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ message: 'Turf not found' });
    }

    const turf = existing.rows[0];
    if (turf.owner_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const result = await query(
      `UPDATE turfs SET
        name = COALESCE($1, name),
        address = COALESCE($2, address),
        latitude = COALESCE($3, latitude),
        longitude = COALESCE($4, longitude),
        amenities = COALESCE($5, amenities),
        status = COALESCE($6, status)
       WHERE id = $7 RETURNING *`,
      [name, address, latitude, longitude,
       amenities ? JSON.stringify(amenities) : null,
       status, id]
    );

    res.json({ message: 'Turf updated', turf: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAllTurfs, getTurfById, createTurf, updateTurf };