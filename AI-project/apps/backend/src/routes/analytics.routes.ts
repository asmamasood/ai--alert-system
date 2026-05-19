import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger';
import { getLiveSensorReadings } from '../services/sensor.service';
import { store } from '../data/simpleStore';
import { calculateDistrictScore } from '../utils/scoring';
import { KARACHI_DISTRICTS } from '../data/mockData';

const router = Router();

// ── GET /analytics/overview — Dashboard stats ──────────────────
router.get('/overview', (req: Request, res: Response) => {
  const sensors = getLiveSensorReadings();
  const incidents = store.getIncidents();
  
  res.json({
    success: true,
    data: {
      totalIncidents: 1248 + incidents.length,
      activeEmergencies: incidents.filter(i => i.status === 'ACTIVE').length + 14,
      responseTimeAvg: '8.4m',
      livesSavedEstimated: 4500,
      resourceEfficiency: 92,
      predictedImpactAreas: sensors.filter(s => s.status === 'CRITICAL').length,
      sensors: sensors,
      trends: {
        incidents: [12, 18, 15, 25, 30, 22, 14], // last 7 days
        severity: [40, 55, 45, 70, 85, 60, 45]
      }
    }
  });
});

// ── GET /analytics/scores — Live District Safety Scores ─────────
router.get('/scores', (req: Request, res: Response) => {
  const sensors = getLiveSensorReadings();
  const incidents = store.getIncidents();
  
  const scores = KARACHI_DISTRICTS.map(d => 
    calculateDistrictScore(d.name, incidents, sensors)
  );

  res.json({
    success: true,
    data: scores
  });
});

// ── GET /analytics/sensors — Detailed sensor readings ───────────
router.get('/sensors', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: getLiveSensorReadings()
  });
});

export default router;


