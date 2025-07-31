import express from 'express';

const router = express.Router();

// POST /api/upload/diet-sheet - Mock photo upload
router.post('/diet-sheet', async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        error: 'Session ID required'
      });
    }

    // Mock photo upload
    const mockPhotoUrl = `https://servicesync-photos.s3.amazonaws.com/diet-sheets/${sessionId}/${Date.now()}.jpg`;

    console.log(`📷 Diet sheet upload simulated for session ${sessionId}`);

    res.json({
      success: true,
      photoUrl: mockPhotoUrl,
      uploadedAt: new Date(),
      message: 'Photo upload simulated successfully'
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: 'Upload failed',
      code: 'UPLOAD_ERROR'
    });
  }
});

export default router;