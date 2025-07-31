import express from 'express';
import { DeliverySession } from '../models/DeliverySession.js';

const router = express.Router();

// POST /api/sessions - Create new delivery session
router.post('/', async (req, res) => {
  try {
    const { hospitalId, wardId, mealType, mealCount, hostessId } = req.body;

    if (!hospitalId || !wardId || !mealType || !mealCount) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['hospitalId', 'wardId', 'mealType', 'mealCount']
      });
    }

    const session = await DeliverySession.create({
      hostessId: hostessId || '323e4567-e89b-12d3-a456-426614174001', // Default hostess
      hospitalId,
      wardId,
      mealType,
      mealCount
    });

    console.log(`✅ New delivery session created: ${session.session_id}`);

    res.status(201).json({
      success: true,
      session
    });

  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({
      error: 'Failed to create session',
      code: 'SESSION_CREATE_ERROR'
    });
  }
});

// GET /api/sessions/:sessionId - Get specific session
router.get('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await DeliverySession.findBySessionId(sessionId);

    if (!session) {
      return res.status(404).json({
        error: 'Session not found',
        code: 'SESSION_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      session
    });

  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({
      error: 'Failed to get session',
      code: 'SESSION_GET_ERROR'
    });
  }
});

export default router;