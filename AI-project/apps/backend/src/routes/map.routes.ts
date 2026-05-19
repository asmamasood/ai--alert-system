import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger';
import { HOSPITALS, FIRE_STATIONS, SHELTERS } from '../data/karachiAssets';
import { getLiveSensorReadings } from '../services/sensor.service';

const router = Router();

// ── GET /map/layers — Geospatial data layers ───────────────────
router.get('/layers', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: [
      { id: 'flood-zones', name: 'Flood Risk Zones', visible: true, color: '#00D4FF', type: 'POLYGON' },
      { id: 'heat-hotspots', name: 'Heatwave Hotspots', visible: false, color: '#FF6B2B', type: 'HEATMAP' },
      { id: 'shelters', name: 'Emergency Shelters', visible: true, color: '#FFE500', type: 'POINT' },
      { id: 'hospitals', name: 'Tertiary Hospitals', visible: true, color: '#00FF88', type: 'POINT' },
      { id: 'fire-stations', name: 'Fire Stations', visible: true, color: '#FF3B30', type: 'POINT' },
      { id: 'traffic', name: 'Live Traffic Flow', visible: false, color: '#FFFFFF', type: 'LINE' },
    ]
  });
});

// ── GET /map/hotspots — Current high-risk areas ────────────────
router.get('/hotspots', (req: Request, res: Response) => {
  const sensors = getLiveSensorReadings();
  const criticalSensors = sensors.filter(s => s.status === 'CRITICAL' || s.status === 'WARNING');
  
  const sensorHotspots = criticalSensors.map(s => ({
    id: `sensor-${s.district}-${s.type}`,
    name: `${s.district} ${s.type}`,
    risk: s.status,
    type: s.type,
    value: s.value,
    unit: s.unit,
    // Note: In a real app, we'd lookup lat/lng for the district
    lat: 24.8 + Math.random() * 0.2,
    lng: 67.0 + Math.random() * 0.2,
    radius: s.status === 'CRITICAL' ? 1500 : 800
  }));

  res.json({
    success: true,
    data: [
      ...sensorHotspots,
      { id: 'hs-1', name: 'Lyari Basin', risk: 'CRITICAL', type: 'FLOOD', lat: 24.8824, lng: 66.9856, radius: 1200 },
    ]
  });
});

// ── GET /map/assets — Infrastructure locations ──────────────────
router.get('/assets', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      hospitals: HOSPITALS,
      fireStations: FIRE_STATIONS,
      shelters: SHELTERS
    }
  });
});

export default router;

