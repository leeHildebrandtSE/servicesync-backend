import express from 'express';
import { DeliverySession } from '../models/DeliverySession.js';

const router = express.Router();

// POST /api/qr/scan - Validate and process QR code scan
router.post('/scan', async (req, res) => {
  try {
    const { qrCode, sessionId } = req.body;

    if (!qrCode || !sessionId) {
      return res.status(400).json({
        error: 'QR code and session ID required'
      });
    }

    // For now, simulate QR validation - later will connect to database
    const validQRCodes = {
      'KITCHEN_GH001_MAIN': {
        location_type: 'kitchen',
        location_name: 'Main Kitchen - General Hospital',
        timestampField: 'kitchen_exit',
        message: 'Kitchen exit confirmed'
      },
      'WARD_GH001_3A': {
        location_type: 'ward', 
        location_name: 'Ward 3A Entrance',
        timestampField: 'ward_arrival',
        message: 'Ward arrival confirmed'
      },
      'NURSE_GH001_3A': {
        location_type: 'nurse_station',
        location_name: 'Ward 3A Nurse Station', 
        timestampField: 'service_start',
        message: 'Service start confirmed'
      }
    };

    const qrRecord = validQRCodes[qrCode];
    if (!qrRecord) {
      return res.status(404).json({
        error: 'Invalid or inactive QR code',
        code: 'QR_CODE_INVALID'
      });
    }

    // Get session details
    const session = await DeliverySession.findBySessionId(sessionId);
    if (!session) {
      return res.status(404).json({
        error: 'Session not found',
        code: 'SESSION_NOT_FOUND'
      });
    }

    // Update session timestamp
    await DeliverySession.updateTimestamp(sessionId, qrRecord.timestampField);

    console.log(`✅ QR code scanned: ${qrCode} for session ${sessionId}`);

    res.json({
      success: true,
      message: qrRecord.message,
      location: {
        type: qrRecord.location_type,
        name: qrRecord.location_name
      },
      timestamp: new Date()
    });

  } catch (error) {
    console.error('QR scan error:', error);
    res.status(500).json({
      error: 'QR scan failed',
      code: 'QR_SCAN_ERROR'
    });
  }
});

export default router;