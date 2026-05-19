import { Router, Request, Response } from 'express';
import { AGENTS } from '../services/aiAnalysis.service';

const router = Router();

const AGENT_REGISTRY = [
  { id: 'agt-1', name: 'Signal Collector', role: 'Data Ingestion', capabilities: ['IoT', 'Social Media', 'Weather'], status: 'OPERATIONAL', load: '12%' },
  { id: 'agt-2', name: 'Crisis Detector', role: 'Classification', capabilities: ['Vision', 'NLP', 'Pattern Match'], status: 'OPERATIONAL', load: '45%' },
  { id: 'agt-3', name: 'Severity Analyzer', role: 'Risk Assessment', capabilities: ['Geo-spatial', 'Demographics'], status: 'OPERATIONAL', load: '28%' },
  { id: 'agt-4', name: 'Prediction Agent', role: 'Forecasting', capabilities: ['ML Models', 'Physics Simulations'], status: 'OPERATIONAL', load: '67%' },
  { id: 'agt-5', name: 'Resource Planner', role: 'Optimization', capabilities: ['Unit Allocation', 'Logistics'], status: 'OPERATIONAL', load: '15%' },
  { id: 'agt-6', name: 'Dispatch Coordinator', role: 'Execution', capabilities: ['Real-time Comms', 'Unit Tracking'], status: 'OPERATIONAL', load: '8%' },
  { id: 'agt-7', name: 'Citizen Notifier', role: 'Communication', capabilities: ['Multilingual', 'Mass Broadcast'], status: 'OPERATIONAL', load: '32%' },
  { id: 'agt-8', name: 'Route Optimizer', role: 'Navigation', capabilities: ['Dynamic Rerouting', 'Safe-path Finding'], status: 'OPERATIONAL', load: '21%' },
];

// ── GET /agents — List all registered agents ───────────────────
router.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: AGENT_REGISTRY
  });
});

// ── GET /agents/:id/status — Detailed agent health ──────────────
router.get('/:id/status', (req: Request, res: Response) => {
  const agent = AGENT_REGISTRY.find(a => a.id === req.params.id);
  if (!agent) return res.status(404).json({ success: false, message: 'Agent not found' });
  
  res.json({
    success: true,
    data: {
      ...agent,
      uptime: '99.99%',
      lastInferenceTime: '420ms',
      memoryUsage: '1.2GB',
      threads: 4
    }
  });
});

export default router;

