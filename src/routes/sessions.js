import express from 'express';
import { DeliverySession } from '../models/DeliverySession.js';

const router = express.Router();

// GET /api/sessions/wards - Get available wards for meal delivery
router.get('/wards', async (req, res) => {
  try {
    const { hospitalId } = req.query;

    const { db } = await import('../config/database.js');

    let query = db('wards')
      .select('id', 'ward_id', 'name', 'ward_type', 'bed_capacity', 'floor', 'wing', 'status')
      .where('status', 'active');

    if (hospitalId) {
      query = query.where('hospital_id', hospitalId);
    }

    const wards = await query.orderBy('ward_id');

    res.json({
      success: true,
      wards: wards.map(ward => ({
        id: ward.id,
        wardId: ward.ward_id,
        name: ward.name,
        capacity: ward.bed_capacity,
        floor: ward.floor,
        wing: ward.wing,
        type: ward.ward_type
      }))
    });

  } catch (error) {
    console.error('Get wards error:', error);
    res.status(500).json({
      error: 'Failed to fetch wards',
      code: 'WARDS_FETCH_ERROR'
    });
  }
});

// POST /api/sessions - Create new delivery session
router.post('/', async (req, res) => {
  try {
    const { hospitalId, wardId, mealType, mealCount, hostessId } = req.body;

    // Enhanced validation
    if (!hospitalId || !wardId || !mealType || !mealCount) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['hospitalId', 'wardId', 'mealType', 'mealCount']
      });
    }

    // Validate meal type
    const validMealTypes = ['breakfast', 'lunch', 'supper', 'beverages'];
    if (!validMealTypes.includes(mealType)) {
      return res.status(400).json({
        error: 'Invalid meal type',
        validTypes: validMealTypes
      });
    }

    // Validate meal count
    if (mealCount < 1 || mealCount > 50) {
      return res.status(400).json({
        error: 'Meal count must be between 1 and 50',
        provided: mealCount
      });
    }

    // Check if ward exists (optional validation)
    try {
      const { db } = await import('../config/database.js');
      const ward = await db('wards')
        .where({ id: wardId, hospital_id: hospitalId, status: 'active' })
        .first();

      if (!ward) {
        return res.status(404).json({
          error: 'Ward not found or inactive',
          wardId,
          hospitalId
        });
      }
    } catch (dbError) {
      console.warn('Ward validation skipped due to DB error:', dbError.message);
    }

    const session = await DeliverySession.create({
      hostessId: hostessId || '323e4567-e89b-12d3-a456-426614174001', // Default hostess
      hospitalId,
      wardId,
      mealType,
      mealCount
    });

    console.log(`✅ New delivery session created: ${session.session_id} (${mealType}, ${mealCount} items)`);

    res.status(201).json({
      success: true,
      session,
      message: `Session created for ${mealCount} ${mealType} items`
    });

  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({
      error: 'Failed to create session',
      code: 'SESSION_CREATE_ERROR',
      details: error.message
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