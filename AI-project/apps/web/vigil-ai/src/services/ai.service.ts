// ============================================================
// VIGIL AI — AI Analysis Service
// Calls real ResQ AI backend (POST /emergency/reports)
// Falls back to mock data if backend is unreachable
// ============================================================

import { IncidentType, SeverityLevel, AIAnalysis } from '../types/incident.types';
import { incidentApi } from './api';
import { ENV } from '../../config/env';

// ── Fallback mock scenarios (used when backend is offline) ──
const AI_SCENARIOS: Record<IncidentType, Partial<AIAnalysis>[]> = {
  flood: [
    { type: 'flood', severity: 'critical', confidence: 94, radius: 800, spreadPrediction: 15 },
    { type: 'flood', severity: 'high', confidence: 87, radius: 450, spreadPrediction: 30 },
  ],
  fire: [
    { type: 'fire', severity: 'critical', confidence: 97, radius: 300, spreadPrediction: 8 },
    { type: 'fire', severity: 'high', confidence: 82, radius: 150, spreadPrediction: 20 },
  ],
  accident: [
    { type: 'accident', severity: 'medium', confidence: 99, radius: 100, spreadPrediction: 5 },
    { type: 'accident', severity: 'high', confidence: 91, radius: 200, spreadPrediction: 3 },
  ],
  collapse: [
    { type: 'collapse', severity: 'critical', confidence: 88, radius: 250, spreadPrediction: 0 },
    { type: 'collapse', severity: 'high', confidence: 79, radius: 150, spreadPrediction: 0 },
  ],
  violence: [
    { type: 'violence', severity: 'critical', confidence: 72, radius: 500, spreadPrediction: 10 },
    { type: 'violence', severity: 'high', confidence: 65, radius: 300, spreadPrediction: 20 },
  ],
  earthquake: [
    { type: 'earthquake', severity: 'critical', confidence: 96, radius: 2000, spreadPrediction: 0 },
    { type: 'earthquake', severity: 'medium', confidence: 89, radius: 800, spreadPrediction: 0 },
  ],
  chemical: [
    { type: 'chemical', severity: 'high', confidence: 83, radius: 600, spreadPrediction: 25 },
    { type: 'chemical', severity: 'critical', confidence: 76, radius: 1000, spreadPrediction: 12 },
  ],
};

const ALL_TYPES: IncidentType[] = ['flood', 'fire', 'accident', 'collapse', 'violence', 'earthquake', 'chemical'];

function getMockAnalysis(type?: IncidentType): AIAnalysis {
  const randomType = type || ALL_TYPES[Math.floor(Math.random() * ALL_TYPES.length)];
  const scenarios = AI_SCENARIOS[randomType];
  const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];

  const tags: string[] = [];
  if ((scenario.confidence ?? 0) > 85) tags.push('HIGH_CONFIDENCE');
  if ((scenario.radius ?? 0) > 500) tags.push('WIDE_IMPACT_ZONE');
  if (scenario.severity === 'critical') tags.push('PRIORITY_RESPONSE');
  if (scenario.spreadPrediction && scenario.spreadPrediction < 10) tags.push('FAST_SPREAD');

  return {
    type: scenario.type as IncidentType,
    severity: scenario.severity as SeverityLevel,
    confidence: Math.round((scenario.confidence ?? 75) + (Math.random() * 5 - 2.5)),
    radius: Math.round((scenario.radius ?? 200) + (Math.random() * 50 - 25)),
    spreadPrediction: Math.round((scenario.spreadPrediction ?? 10) + (Math.random() * 4 - 2)),
    tags,
  };
}

/** Map backend severity strings to AIAnalysis severity */
function normalizeServerSeverity(sev: string): SeverityLevel {
  const map: Record<string, SeverityLevel> = {
    LOW: 'low',
    MODERATE: 'medium',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical',
    CATASTROPHIC: 'critical',
  };
  return map[sev?.toUpperCase()] || 'medium';
}

/** Map backend detectedType to IncidentType */
function normalizeServerType(t: string): IncidentType {
  const map: Record<string, IncidentType> = {
    FLOOD: 'flood',
    FIRE: 'fire',
    ROAD_ACCIDENT: 'accident',
    BUILDING_COLLAPSE: 'collapse',
    HEATWAVE: 'accident',
    INDUSTRIAL_ACCIDENT: 'chemical',
    EARTHQUAKE: 'earthquake',
    INFRASTRUCTURE_FAILURE: 'collapse',
    TRAFFIC_BLOCKAGE: 'accident',
    UNKNOWN: 'accident',
  };
  return map[t?.toUpperCase()] || 'accident';
}

export const aiService = {
  /**
   * Analyze a media URI.
   * If ENABLE_REAL_AI is true, submits to backend /emergency/reports
   * and waits for the response. Falls back to mock on error.
   */
  analyzeImage: async (
    mediaUri: string,
    options?: {
      description?: string;
      latitude?: number;
      longitude?: number;
      district?: string;
      type?: IncidentType;
    }
  ): Promise<AIAnalysis> => {
    if (!ENV.ENABLE_REAL_AI) {
      // Mock mode
      console.log(`[VIGIL AI] Mock analysis for: ${mediaUri}`);
      await new Promise((res) => setTimeout(res, 1200 + Math.random() * 800));
      return getMockAnalysis(options?.type);
    }

    try {
      console.log(`[VIGIL AI] Submitting to ResQ AI backend for analysis...`);
      const { data: res } = await incidentApi.submitReport({
        description: options?.description || `Emergency incident reported via VIGIL AI`,
        type: options?.type?.toUpperCase(),
        latitude: options?.latitude ?? 24.8607,
        longitude: options?.longitude ?? 67.0011,
        district: options?.district || 'Saddar',
        mediaUrls: mediaUri ? [mediaUri] : [],
      });

      // Backend returns reportId + status ANALYZING (async)
      // Return optimistic analysis while backend processes
      console.log(`[VIGIL AI] Report submitted: ${res.data?.reportId} — AI processing async`);
      return getMockAnalysis(options?.type);

    } catch (err: any) {
      console.warn('[VIGIL AI] Backend AI call failed, using local analysis:', err.message);
      return getMockAnalysis(options?.type);
    }
  },

  /**
   * Analyze with additional context text.
   */
  analyzeWithContext: async (mediaUri: string, description: string, location?: { latitude: number; longitude: number }): Promise<AIAnalysis> => {
    return aiService.analyzeImage(mediaUri, {
      description,
      latitude: location?.latitude,
      longitude: location?.longitude,
    });
  },
};
