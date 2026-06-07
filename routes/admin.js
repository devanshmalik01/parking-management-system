const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

// Get all parked vehicles
router.get('/vehicles', authenticate, authorize('admin'), async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [vehicles] = await connection.query(`
      SELECT 
        v.*,
        u.name as assistant_name,
        TIMESTAMPDIFF(MINUTE, v.entry_time, NOW()) as parking_duration_minutes
      FROM vehicles v
      JOIN users u ON v.allowed_by = u.id
      WHERE v.status = 'parked'
      ORDER BY v.entry_time DESC
    `);

    await connection.release();

    res.status(200).json({
      message: 'Parked vehicles retrieved',
      count: vehicles.length,
      vehicles
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all exited vehicles
router.get('/vehicles/exited', authenticate, authorize('admin'), async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [vehicles] = await connection.query(`
      SELECT 
        v.*,
        u.name as assistant_name,
        TIMESTAMPDIFF(MINUTE, v.entry_time, v.exit_time) as parking_duration_minutes
      FROM vehicles v
      JOIN users u ON v.allowed_by = u.id
      WHERE v.status = 'left'
      ORDER BY v.exit_time DESC
    `);

    await connection.release();

    res.status(200).json({
      message: 'Exited vehicles retrieved',
      count: vehicles.length,
      vehicles
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
