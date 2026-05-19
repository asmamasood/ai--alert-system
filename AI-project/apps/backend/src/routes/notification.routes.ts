import { Router, Request, Response } from 'express';
import { store } from '../data/simpleStore';

const router = Router();

// ── GET /notifications — Get all alerts ────────────────────────
router.get('/', (req: Request, res: Response) => {
  const alerts = store.getAlerts();
  res.json({
    success: true,
    data: alerts
  });
});

// ── GET /notifications/active — Only active alerts ─────────────
router.get('/active', (req: Request, res: Response) => {
  const alerts = store.getAlerts();
  res.json({
    success: true,
    data: alerts.filter((a: any) => a.isActive !== false)
  });
});

export default router;

