import { Router, Request, Response } from 'express';
import { AGENTS } from '../services/aiAnalysis.service';
import { logger } from '../utils/logger';
import { store } from '../data/simpleStore';

const router = Router();

// ── GET /ai/agents — List all active agents in the orchestration ──
router.get('/agents', (req: Request, res: Response) => {
  const agentsList = Object.entries(AGENTS).map(([key, name]) => ({
    id: key.toLowerCase().replace(/_/g, '-'),
    name: name.replace(/([A-Z])/g, ' $1').trim(),
    codeName: key,
    status: 'OPERATIONAL',
    description: getAgentDescription(key),
  }));

  res.json({
    success: true,
    data: agentsList
  });
});

// ── GET /ai/status — System health and model info ───────────────
router.get('/status', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: 'OPERATIONAL',
      activeModel: 'Gemini 1.5 Flash',
      secondaryModel: 'Gemini 1.5 Pro',
      orchestrationMode: 'Multi-Agent Autonomous',
      uptime: process.uptime(),
      connectedSensors: 47,
      karachiNodes: 12
    }
  });
});

// ── GET /ai/logs/:reportId — Get agent execution logs ───────────
router.get('/logs/:reportId', (req: Request, res: Response) => {
  const { reportId } = req.params;
  const logs = store.getAgentLogs(reportId);
  
  res.json({
    success: true,
    data: logs
  });
});

// ── Helper: Agent Descriptions ──────────────────────────────────
function getAgentDescription(key: string): string {
  const descriptions: Record<string, string> = {
    SIGNAL_COLLECTOR: 'Collects and normalizes signals from IoT and social media',
    CRISIS_DETECTOR: 'Classifies emergency types using Gemini vision/text models',
    SEVERITY_ANALYZER: 'Computes severity scores based on population density',
    PREDICTION: 'Predicts disaster spread and impact radius',
    RESOURCE_PLANNER: 'Allocates units and optimizes resource distribution',
    DISPATCH: 'Handles unit transmission and team assignments',
    CITIZEN_NOTIFY: 'Broadcasts multilingual alerts to citizens',
    ROUTE_OPTIMIZER: 'Calculates safe evacuation routes and reroutes traffic',
  };
  return descriptions[key] || 'Autonomous AI Agent';
}

export default router;
