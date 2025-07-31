import express from 'express';

const router = express.Router();

// GET /api/reports/dashboard - Get dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    // Mock dashboard data for now
    const dashboardData = {
      summary: {
        totalSessions: 15,
        completedSessions: 12,
        completionRate: '80.0',
        totalMealsServed: 180,
        avgTravelTime: 205,
        avgNurseResponse: 85
      },
      recentSessions: [
        {
          session_id: 'SS1234567890ABCD',
          meal_type: 'breakfast',
          meal_count: 12,
          status: 'completed',
          hostess_first_name: 'Sarah',
          ward_name: 'Ward 3A'
        }
      ],
      mealTypeStats: [
        {
          mealType: 'breakfast',
          sessionCount: 8,
          totalMeals: 96,
          avgEfficiency: '85.5'
        }
      ]
    };

    res.json({
      success: true,
      dashboard: dashboardData
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      error: 'Failed to get dashboard data',
      code: 'DASHBOARD_ERROR'
    });
  }
});

export default router;