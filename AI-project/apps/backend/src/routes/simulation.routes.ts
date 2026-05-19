import { Router, Request, Response } from 'express';
import { analyzeEmergency } from '../services/aiAnalysis.service';
import { runComplexSimulation } from '../services/complexSimulation.service';
import { store } from '../data/simpleStore';
import { logger } from '../utils/logger';

const router = Router();

const SCENARIOS = {
  FLOOD: {
    description: 'Flash flooding reported in Lyari basin after heavy rains. Water levels rising rapidly near residential areas.',
    district: 'Lyari',
    latitude: 24.8607,
    longitude: 67.0011,
    type: 'FLOOD'
  },
  FIRE: {
    description: 'Large scale industrial fire at SITE chemical factory. Multiple explosions heard. Black smoke visible for miles.',
    district: 'SITE',
    latitude: 24.9008,
    longitude: 67.0174,
    type: 'FIRE'
  },
  HEATWAVE: {
    description: 'Temperatures reaching 47°C. High humidity. Multiple reports of heat exhaustion across the city.',
    district: 'City Wide',
    latitude: 24.8607,
    longitude: 67.0011,
    type: 'HEATWAVE'
  }
};

// ── POST /simulation/trigger — Trigger a disaster scenario ──────
router.post('/trigger', async (req: Request, res: Response) => {
  const { scenario, type, district, severity, population } = req.body;
  
  // Use provided data or fallback to predefined scenario
  const scenarioData = (SCENARIOS as any)[scenario || type] || SCENARIOS.FLOOD;
  
  const data = {
    type: type || scenarioData.type,
    district: district || scenarioData.district,
    description: scenarioData.description,
    latitude: scenarioData.latitude,
    longitude: scenarioData.longitude,
    severity: severity || 'HIGH',
    population: population || 500000
  };

  const reportId = `SIM-${Date.now()}`;
  
  // Create report
  const report = {
    id: reportId,
    ...data,
    status: 'ANALYZING',
    createdAt: new Date().toISOString(),
    isSimulation: true
  };
  
  store.addReport(report);

  // Run AI analysis
  // Note: We don't await this as we want the client to receive the reportId immediately 
  // while the simulation runs in the background emitting socket events.
  analyzeEmergency({
    description: data.description,
    type: data.type,
    district: data.district,
    latitude: data.latitude,
    longitude: data.longitude,
    population: data.population,
    severity: data.severity,
    reportId
  }).catch(err => logger.error('Simulation analysis failed:', err));

  res.json({
    success: true,
    message: `Simulation scenario ${scenario || type} triggered`,
    data: { 
      reportId,
      parameters: data
    }
  });
});

// ── POST /simulation/trigger-complex — Trigger advanced multi-crisis scenario ──
router.post('/trigger-complex', async (req: Request, res: Response) => {
  // Run the complex simulation asynchronously
  runComplexSimulation().catch(err => logger.error('Complex simulation failed:', err));

  res.json({
    success: true,
    message: 'Advanced multi-crisis simulation scenario triggered'
  });
});

// ── GET /simulation — List recent simulations ────────────────────
router.get('/', (req: Request, res: Response) => {
  const simulations = store.getSimulations();
  res.json({
    success: true,
    data: simulations
  });
});

// ── GET /simulation/:id — Get specific simulation details ─────────
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const report = store.getReport(id);
  
  if (!report) {
    return res.status(404).json({ success: false, message: 'Simulation not found' });
  }

  const logs = store.getAgentLogs(id);
  
  res.json({
    success: true,
    data: {
      ...report,
      logs
    }
  });
});

export default router;

