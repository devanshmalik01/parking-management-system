const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');

// Search vehicles
router.get('/vehicles', authenticate, async (req, res) => {
  try {
    const { vehicleNo, vehicleType, assistantId } = req.query;
    let query = 'SELECT v.*, u.name as assistant_name FROM vehicles v JOIN users u ON v.allowed_by = u.id WHERE 1=1';
    const params = [];

    if (vehicleNo) {
      query += ' AND v.vehicle_no LIKE ?';
      params.push(`%${vehicleNo}%`);
    }

    if (vehicleType) {
      query += ' AND v.vehicle_type = ?';
      params.push(vehicleType);
    }

    if (assistantId) {
      query += ' AND v.allowed_by = ?';
      params.push(assistantId);
    }

    query += ' ORDER BY v.entry_time DESC LIMIT 100';

    const connection = await pool.getConnection();
    const [vehicles] = await connection.query(query, params);
    await connection.release();

    res.status(200).json({
      message: 'Search results',
      count: vehicles.length,
      vehicles
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
