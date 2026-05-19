import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { logger } from '../utils/logger';
import { emitEmergencyAlert } from '../realtime/socketManager';
import { io } from '../server';
import { store } from '../data/simpleStore';

const router = Router();

// ── GET /alerts — Fetch active emergency alerts ────────────────
router.get('/', (req: Request, res: Response) => {
  // Get from store + merge with static mock for rich demo
  const storeAlerts = store.getAlerts();
  const mockAlerts = [
    {
      id: 'ALT-001',
      level: 'EMERGENCY',
      title: 'Severe Flood Warning: Lyari District',
      message: 'Rising water levels detected in Lyari basin. Residents are advised to move to higher ground immediately.',
      district: 'Lyari',
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      isAiGenerated: true,
    },
    {
      id: 'ALT-002',
      level: 'CRITICAL',
      title: 'Heatwave Advisory: Saddar & Clifton',
      message: 'Temperatures expected to exceed 42°C. Cooling centers are open at Karachi Expo Centre.',
      district: 'Saddar',
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      isAiGenerated: true,
    }
  ];

  res.json({
    success: true,
    data: [...storeAlerts, ...mockAlerts]
  });
});

// ── POST /alerts — Manually trigger an emergency alert ─────────
router.post(
  '/',
  [
    body('title').notEmpty(),
    body('message').notEmpty(),
    body('level').isIn(['INFO', 'WARNING', 'CRITICAL', 'EMERGENCY']),
    body('district').optional(),
  ],
  validate,
  async (req: Request, res: Response) => {
    try {
      const { title, message, level, district, location } = req.body;
      
      // Emit realtime alert
      emitEmergencyAlert(io, {
        title,
        message,
        severity: level,
        district: district || 'City-wide',
        location: location || { latitude: 24.8607, longitude: 67.0011 }
      });

      // Save to store
      store.addAlert({
        level,
        title,
        message,
        district: district || 'City-wide',
        isAiGenerated: false
      });

      res.status(201).json({
        success: true,
        message: 'Alert broadcasted successfully'
      });
    } catch (err) {
      logger.error('Error broadcasting alert:', err);
      res.status(500).json({ success: false, message: 'Failed to broadcast alert' });
    }
  }
);

export default router;
