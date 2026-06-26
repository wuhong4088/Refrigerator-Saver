import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { db } from '../db/connector.js';

const router = Router();

// GET /api/logs - Retrieve all system logs (sorted by timestamp descending)
router.get('/', async (req, res) => {
  // Suggest
  if (!db) {
    return res
      .status(500)
      .json({ error: 'Database connection is not active.' });
  }

  try {
    const logs = await db
      .collection('system_logs')
      .find({})
      .sort({ timestamp: -1 })
      .toArray();
    res.status(200).json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Failed to retrieve logs.' });
  }
});

// POST /api/logs - Create a new log entry
router.post('/', async (req, res) => {
  if (!db) {
    return res
      .status(500)
      .json({ error: 'Database connection is not active.' });
  }

  try {
    const { action, details } = req.body;

    if (!action || !details) {
      return res
        .status(400)
        .json({ error: 'Action and details are required fields.' });
    }

    const newLog = {
      action,
      details,
      timestamp: new Date(),
    };

    const result = await db.collection('system_logs').insertOne(newLog);
    res.status(201).json({
      _id: result.insertedId,
      ...newLog,
    });
  } catch (error) {
    console.error('Error creating log:', error);
    res.status(500).json({ error: 'Failed to create log.' });
  }
});

// PUT /api/logs/:id - Update an existing log's details
router.put('/:id', async (req, res) => {
  if (!db) {
    return res
      .status(500)
      .json({ error: 'Database connection is not active.' });
  }

  try {
    const { id } = req.params;
    const { details } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid log ID format.' });
    }

    if (!details) {
      return res.status(400).json({ error: 'Details is required to update.' });
    }

    const filter = { _id: new ObjectId(id) };
    const result = await db
      .collection('system_logs')
      .updateOne(filter, { $set: { details } });

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Log not found.' });
    }

    const updatedLog = await db.collection('system_logs').findOne(filter);
    res.status(200).json(updatedLog);
  } catch (error) {
    console.error('Error updating log:', error);
    res.status(500).json({ error: 'Failed to update log.' });
  }
});

// DELETE /api/logs/:id - Delete a log entry
router.delete('/:id', async (req, res) => {
  if (!db) {
    return res
      .status(500)
      .json({ error: 'Database connection is not active.' });
  }

  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid log ID format.' });
    }

    const result = await db
      .collection('system_logs')
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Log not found.' });
    }

    res.status(200).json({ message: 'Log successfully deleted.' });
  } catch (error) {
    console.error('Error deleting log:', error);
    res.status(500).json({ error: 'Failed to delete log.' });
  }
});

export default router;
