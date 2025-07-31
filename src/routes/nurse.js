import express from 'express';
import { DeliverySession } from '../models/DeliverySession.js';

const router = express.Router();

// POST /api/nurse/alert - Send nurse notification
router.post('/alert', async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        error: 'Session ID required'
      });
    }

    // Get session details
    const session = await DeliverySession.findBySessionId(sessionId);
    if (!session) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }

    // Update session timestamp
    await DeliverySession.updateTimestamp(sessionId, 'nurse_alerted');

    console.log(`🚨 Nurse alert sent for session ${sessionId}`);

    res.json({
      success: true,
      message: 'Nurse alert sent successfully',
      alertTime: new Date(),
      buzzerCode: 'BUZZ_3A_001'
    });

  } catch (error) {
    console.error('Nurse alert error:', error);
    res.status(500).json({
      error: 'Failed to send nurse alert',
      code: 'NURSE_ALERT_ERROR'
    });
  }
});

export default router;