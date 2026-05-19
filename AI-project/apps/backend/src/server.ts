// ============================================================
// ResQ AI — Main Express Server
// ============================================================

import 'express-async-errors';
import dotenv from 'dotenv';
dotenv.config();

import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import { Server } from 'socket.io';

import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { initSocketIO } from './realtime/socketManager';

// Routes
import authRoutes from './routes/auth.routes';
import emergencyRoutes from './routes/emergency.routes';
import aiRoutes from './routes/ai.routes';
import alertRoutes from './routes/alert.routes';
import analyticsRoutes from './routes/analytics.routes';
import mapRoutes from './routes/map.routes';
import notificationRoutes from './routes/notification.routes';
import infrastructureRoutes from './routes/infrastructure.routes';
import simulationRoutes from './routes/simulation.routes';
import agentRoutes from './routes/agent.routes';

// Fleet Utils
import { getMockVehicles } from './data/mockData';

// Real-time Simulation Utils
import { getLiveSensorReadings } from './services/sensor.service';
import { calculateDistrictScore } from './utils/scoring';
import { store } from './data/simpleStore';
import { KARACHI_DISTRICTS } from './data/mockData';
import { emitSensorReadings, emitSafetyScoreUpdate, emitAgentLog } from './realtime/socketManager';
import { analyzeEmergency } from './services/aiAnalysis.service';

const app = express();
const httpServer = http.createServer(app);

// ── Socket.IO Setup ──────────────────────────────────────────
export const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => callback(null, true),
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// ── Middleware ───────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: (origin, callback) => callback(null, true),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
}));

app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('combined', { stream: { write: (msg) => logger.http(msg.trim()) } }));
app.use(rateLimiter);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Health Check ─────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'operational',
      service: 'ResQ AI Backend',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    }
  });
});

// ── API Routes ───────────────────────────────────────────────
const API = '/api/v1';
app.use(`${API}/auth`, authRoutes);
app.use(`${API}/emergency`, emergencyRoutes);
app.use(`${API}/ai`, aiRoutes);
app.use(`${API}/alerts`, alertRoutes);
app.use(`${API}/analytics`, analyticsRoutes);
app.use(`${API}/maps`, mapRoutes);
app.use(`${API}/notifications`, notificationRoutes);
app.use(`${API}/infrastructure`, infrastructureRoutes);
app.use(`${API}/simulations`, simulationRoutes);
app.use(`${API}/agents`, agentRoutes);

// ── Error Handler ─────────────────────────────────────────────
app.use(errorHandler);

// ── Initialize WebSocket Manager ─────────────────────────────
initSocketIO(io);

// ── Initialize Fleet ─────────────────────────────────────────
if (store.getVehicles().length === 0) {
  logger.info('🚛 Initializing vehicle fleet from mock data');
  getMockVehicles().forEach(v => store.addVehicle(v));
}

// ── Start Server (Only if NOT on Vercel) ──────────────────────
const PORT = process.env.PORT || 3001;

if (!process.env.VERCEL) {
  httpServer.listen(PORT, () => {
    logger.info(`🚨 ResQ AI Backend running on port ${PORT}`);
    logger.info(`🤖 AI Agent System initialized`);
    logger.info(`⚡ WebSocket server ready`);
    logger.info(`📡 Emergency event streaming active`);

    // Track pending and cooling down auto-detections to avoid parallel API spam
    const pendingDetections = new Set<string>();

    // ── Start Sensor & Analytics Loop ─────────────────────────
    setInterval(() => {
      try {
        const readings = getLiveSensorReadings();
        emitSensorReadings(io, readings);

        const activeIncidents = store.getIncidents({ status: 'ACTIVE' });
        const scores = KARACHI_DISTRICTS.map(d => 
          calculateDistrictScore(d.name, activeIncidents, readings)
        );
        emitSafetyScoreUpdate(io, scores);
        
        // ── Background Agent Heartbeat ───────────────────────────
        const backgroundLogs = [
          { agent: 'SignalCollectorAgent', step: 'Monitoring social media feeds for Karachi' },
          { agent: 'CrisisDetectionAgent', step: 'Scanning satellite imagery for thermal anomalies' },
          { agent: 'SignalCollectorAgent', step: 'Syncing with local weather station APIs' },
          { agent: 'PredictionAgent', step: 'Updating long-term flood probability maps' },
          { agent: 'SignalCollectorAgent', step: 'Processing citizen reports via WhatsApp bot' },
          { agent: 'ResourcePlannerAgent', step: 'Auditing available ambulances in District South' },
        ];
        
        const randomLog = backgroundLogs[Math.floor(Math.random() * backgroundLogs.length)];
        emitAgentLog(io, {
          reportId: 'SYSTEM',
          ...randomLog,
          status: 'RUNNING',
          data: { uptime: process.uptime() }
        });

        // ── Proactive Auto-Detection ──────────────────────────
        readings.forEach(reading => {
          if (reading.status === 'CRITICAL') {
            const getExpectedType = (type: string) => {
              switch(type) {
                case 'WATER_LEVEL': return 'FLOOD';
                case 'TEMPERATURE': return 'HEATWAVE';
                case 'TRAFFIC_DENSITY': return 'TRAFFIC_BLOCKAGE';
                case 'AIR_QUALITY': return 'INFRASTRUCTURE_FAILURE';
                default: return 'UNKNOWN';
              }
            };
            
            const getHazard = (type: string) => {
              switch(type) {
                case 'WATER_LEVEL': return 'flooding';
                case 'TEMPERATURE': return 'extreme heat';
                case 'TRAFFIC_DENSITY': return 'severe traffic blockage';
                case 'AIR_QUALITY': return 'toxic air quality';
                default: return 'unknown';
              }
            };

            const expectedType = getExpectedType(reading.type);
            const hazard = getHazard(reading.type);

            // Check if we already have an active incident for this in this district
            const existing = activeIncidents.find(i => 
              i.district === reading.district && 
              i.detectedType === expectedType
            );

            const detectionKey = `${reading.district}-${expectedType}`;

            if (!existing && !pendingDetections.has(detectionKey)) {
              pendingDetections.add(detectionKey);
              logger.warn(`🚨 AUTO-DETECTION: Critical ${reading.type} in ${reading.district}. Triggering AI analysis...`);
              const reportId = `AUTO-${Date.now()}`;
              
              analyzeEmergency({
                description: `AUTOMATED ALERT: Critical ${reading.type} reading of ${reading.value}${reading.unit} detected by IoT sensors in ${reading.district}. Potential ${hazard} hazard.`,
                district: reading.district,
                latitude: KARACHI_DISTRICTS.find(d => d.name === reading.district)?.lat || 24.86,
                longitude: KARACHI_DISTRICTS.find(d => d.name === reading.district)?.lng || 67.00,
                reportId
              })
              .catch(err => logger.error('Auto-detection analysis failed:', err))
              .finally(() => {
                // Cool-down period of 45 seconds to prevent spamming the rate-limited API
                setTimeout(() => {
                  pendingDetections.delete(detectionKey);
                }, 45000);
              });
            }
          }
        });
      } catch (err) {
        logger.error('Error in background simulation loop:', err);
      }
    }, 5000); // Update every 5 seconds
  });
}

export default app;
