import { Router, Request, Response } from 'express';
import { HOSPITALS, FIRE_STATIONS, SHELTERS, POLICE_STATIONS } from '../data/karachiAssets';

const router = Router();

// ── GET /infrastructure/status — Get status of all assets ────────
router.get('/status', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      hospitals: HOSPITALS,
      fireStations: FIRE_STATIONS,
      shelters: SHELTERS,
      policeStations: POLICE_STATIONS,
      summary: {
        totalHospitals: HOSPITALS.length,
        totalFireStations: FIRE_STATIONS.length,
        totalShelters: SHELTERS.length,
        totalBeds: HOSPITALS.reduce((acc, h) => acc + h.capacity, 0),
        availableBeds: HOSPITALS.reduce((acc, h) => acc + h.bedsAvailable, 0),
      }
    }
  });
});

// ── GET /infrastructure/hospitals ──────────────────────────────
router.get('/hospitals', (req, res) => {
  res.json({ success: true, data: HOSPITALS });
});

// ── GET /infrastructure/fire-stations ──────────────────────────
router.get('/fire-stations', (req, res) => {
  res.json({ success: true, data: FIRE_STATIONS });
});

export default router;

