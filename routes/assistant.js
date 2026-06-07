const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

const BILLING_RATE = 10; // ₹10 per minute

// Vehicle entry
router.post('/vehicle/entry', authenticate, authorize('assistant'), async (req, res) => {
  try {
    const { vehicleNo, vehicleType } = req.body;
    const userId = req.user.userId;

    if (!vehicleNo || !vehicleType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const connection = await pool.getConnection();

    // Check if vehicle already exists as parked
    const [existingVehicle] = await connection.query(
      'SELECT * FROM vehicles WHERE vehicle_no = ? AND status = "parked"',
      [vehicleNo]
    );

    if (existingVehicle.length > 0) {
      await connection.release();
      return res.status(409).json({ error: 'Vehicle already parked' });
    }

    // Insert vehicle entry
    const [result] = await connection.query(
      'INSERT INTO vehicles (vehicle_no, vehicle_type, entry_time, status, allowed_by) VALUES (?, ?, NOW(), "parked", ?)',
      [vehicleNo, vehicleType, userId]
    );

    await connection.release();

    res.status(201).json({
      message: 'Vehicle entry recorded',
      vehicleId: result.insertId,
      vehicleNo,
      vehicleType,
      entryTime: new Date()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Vehicle exit
router.post('/vehicle/exit', authenticate, authorize('assistant'), async (req, res) => {
  try {
    const { vehicleNo } = req.body;

    if (!vehicleNo) {
      return res.status(400).json({ error: 'Vehicle number is required' });
    }

    const connection = await pool.getConnection();

    // Get vehicle entry
    const [vehicles] = await connection.query(
      'SELECT * FROM vehicles WHERE vehicle_no = ? AND status = "parked"',
      [vehicleNo]
    );

    if (vehicles.length === 0) {
      await connection.release();
      return res.status(404).json({ error: 'Vehicle not found or already exited' });
    }

    const vehicle = vehicles[0];
    const exitTime = new Date();
    const entryTime = new Date(vehicle.entry_time);
    const durationMinutes = (exitTime - entryTime) / (1000 * 60);
    const billAmount = Math.ceil(durationMinutes) * BILLING_RATE;

    // Update vehicle exit
    await connection.query(
      'UPDATE vehicles SET exit_time = NOW(), status = "left", bill_amount = ? WHERE id = ?',
      [billAmount, vehicle.id]
    );

    await connection.release();

    res.status(200).json({
      message: 'Vehicle exit recorded',
      vehicleNo,
      entryTime: vehicle.entry_time,
      exitTime,
      durationMinutes: Math.ceil(durationMinutes),
      billAmount: `₹${billAmount}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get assistant's entries
router.get('/vehicles', authenticate, authorize('assistant'), async (req, res) => {
  try {
    const userId = req.user.userId;
    const connection = await pool.getConnection();

    const [vehicles] = await connection.query(
      'SELECT * FROM vehicles WHERE allowed_by = ? ORDER BY entry_time DESC',
      [userId]
    );

    await connection.release();

    res.status(200).json({
      message: 'Assistant vehicles retrieved',
      count: vehicles.length,
      vehicles
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
