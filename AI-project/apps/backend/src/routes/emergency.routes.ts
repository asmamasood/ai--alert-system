// ============================================================
// ResQ AI — Emergency Routes
// ============================================================

import { Router, Request, Response } from 'express';
import { body, query, param } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { analyzeEmergency } from '../services/aiAnalysis.service';
import { emitIncidentUpdate, emitEmergencyAlert } from '../realtime/socketManager';
import { io } from '../server';
import { logger } from '../utils/logger';
import { getMockIncidents } from '../data/mockData';
import { store } from '../data/simpleStore';

import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();
const prisma = new PrismaClient();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// ── POST /emergency/upload — Upload media attachment ──────────
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    let filename = '';
    
    if (req.file) {
      filename = req.file.filename;
    } else if (req.body.file && req.body.file.startsWith('data:image')) {
      // Base64 upload
      const base64Data = req.body.file.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = req.body.ext || '.jpg';
      filename = `${uniqueSuffix}${ext}`;
      
      fs.writeFileSync(path.join(uploadsDir, filename), buffer);
    } else {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    const host = req.get('host');
    const protocol = req.protocol;
    const fileUrl = `${protocol}://${host}/uploads/${filename}`;
    
    res.json({
      success: true,
      url: fileUrl,
      filename: filename
    });
  } catch (err) {
    logger.error('Upload failed:', err);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

// ── GET /emergency/incidents — List active incidents ──────────
router.get('/incidents', async (req: Request, res: Response) => {
  try {
    const { status, district, type, limit = '20', page = '1' } = req.query;
    
    // Get from store + merge with static mock for rich demo
    const storeIncidents = store.getIncidents({ status, district, type });
    const mockIncidents = getMockIncidents({
      status: status as string,
      district: district as string,
      type: type as string,
    });

    const combined = [...storeIncidents, ...mockIncidents];

    res.json({
      success: true,
      data: combined,
      meta: {
        total: combined.length,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      },
    });
  } catch (err) {
    logger.error('Error fetching incidents:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch incidents' });
  }
});

// ── GET /emergency/incidents/:id ──────────────────────────────
router.get('/incidents/:id', param('id').notEmpty(), validate, async (req, res) => {
  try {
    const { id } = req.params;
    const incident = store.getIncidentById(id) || getMockIncidents({}).find(i => i.id === id);
    
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }
    
    res.json({ success: true, data: incident });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch incident' });
  }
});

// ── POST /emergency/reports — Create new emergency report ─────
router.post(
  '/reports',
  [
    body('description').notEmpty().withMessage('Description required'),
    body('latitude').isFloat().withMessage('Valid latitude required'),
    body('longitude').isFloat().withMessage('Valid longitude required'),
    body('district').notEmpty().withMessage('District required'),
  ],
  validate,
  async (req: Request, res: Response) => {
    try {
      const { description, type, latitude, longitude, district, mediaUrls, isAnonymous } = req.body;
      const reportId = `RPT-${Date.now()}`;

      // Create report in store
      const report = {
        id: reportId,
        description,
        type: type || 'UNKNOWN',
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        district,
        status: 'ANALYZING',
        createdAt: new Date().toISOString(),
        mediaUrls: mediaUrls || [],
        isAnonymous: isAnonymous || false,
      };

      store.addReport(report);

      // Trigger AI analysis async
      analyzeEmergency({
        description,
        type,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        district,
        mediaUrls,
        reportId,
      }).then(result => {
        // Emit realtime update when analysis completes
        emitIncidentUpdate(io, {
          ...result,
          type: 'analysis_complete',
        });

        // If high severity, emit emergency alert
        if (['CRITICAL', 'CATASTROPHIC'].includes(result.severity)) {
          emitEmergencyAlert(io, {
            title: `🚨 ${result.severity} Emergency in ${district}`,
            message: `${result.detectedType} detected. ${result.recommendations[0]}`,
            severity: result.severity,
            district,
            location: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
          });
        }
      }).catch(err => {
        logger.error('AI analysis error:', err);
        store.updateReportStatus(reportId, 'FAILED');
      });

      res.status(201).json({
        success: true,
        message: 'Emergency report created. AI analysis initiated.',
        data: { reportId, status: 'ANALYZING', estimatedAnalysisTime: '30 seconds' },
      });
    } catch (err) {
      logger.error('Error creating report:', err);
      res.status(500).json({ success: false, message: 'Failed to create emergency report' });
    }
  }
);

// ── GET /emergency/stats — Dashboard statistics ───────────────
router.get('/stats', async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      activeIncidents: 23,
      resolvedToday: 47,
      deployedUnits: 156,
      affectedCitizens: 124500,
      avgResponseTime: 8.4,
      aiAccuracy: 94.2,
      alertsIssued: 312,
      onlineResponders: 89,
      byDistrict: [
        { name: 'Lyari', incidents: 8, severity: 'HIGH' },
        { name: 'Orangi', incidents: 5, severity: 'CRITICAL' },
        { name: 'Saddar', incidents: 4, severity: 'MODERATE' },
        { name: 'Korangi', incidents: 3, severity: 'HIGH' },
        { name: 'Gulshan', incidents: 2, severity: 'LOW' },
        { name: 'DHA', incidents: 1, severity: 'LOW' },
      ],
      byType: [
        { type: 'FLOOD', count: 8 },
        { type: 'FIRE', count: 6 },
        { type: 'ROAD_ACCIDENT', count: 5 },
        { type: 'MEDICAL_EMERGENCY', count: 4 },
      ],
    },
  });
});

export default router;
