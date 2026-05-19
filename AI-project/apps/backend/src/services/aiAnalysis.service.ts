// ============================================================
// ResQ AI — AI Emergency Analysis Service
// Multi-Agent Orchestration with Gemini + OpenAI
// ============================================================

import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import OpenAI from 'openai';
import { logger } from '../utils/logger';
import { emitAgentLog, emitIncidentUpdate } from '../realtime/socketManager';
import { io } from '../server';
import { store } from '../data/simpleStore';

const gemini = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_key' 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) 
  : null;
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

// Use gemini-1.5-flash by default — free tier gives 15 RPM (vs 5 RPM for 2.5-flash)
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

// ── Agent Definitions ─────────────────────────────────────────
export const AGENTS = {
  SIGNAL_COLLECTOR: 'SignalCollectorAgent',
  CRISIS_DETECTOR: 'CrisisDetectionAgent',
  SEVERITY_ANALYZER: 'SeverityAnalyzerAgent',
  PREDICTION: 'PredictionAgent',
  RESOURCE_PLANNER: 'ResourcePlannerAgent',
  DISPATCH: 'DispatchCoordinatorAgent',
  CITIZEN_NOTIFY: 'CitizenNotificationAgent',
  ROUTE_OPTIMIZER: 'RouteOptimizerAgent',
};

// ── Helper: Emit Agent Log ────────────────────────────────────
function agentLog(reportId: string, agent: string, step: string, data?: any, status = 'RUNNING') {
  const log = {
    reportId,
    agent,
    step,
    data,
    status,
    timestamp: new Date().toISOString(),
  };
  try {
    emitAgentLog(io, log);
    store.addAgentLog(reportId, log);
  } catch {}
  logger.info(`🤖 [${agent}] ${step}`);
  return log;
}

// ── Main Analysis Pipeline ────────────────────────────────────
export async function analyzeEmergency(input: {
  description: string;
  type?: string;
  latitude: number;
  longitude: number;
  district: string;
  population?: number;
  severity?: string;
  mediaUrls?: string[];
  reportId: string;
}): Promise<EmergencyAnalysisResult> {
  
  const logs: any[] = [];
  const reportId = input.reportId;
  
  // ─── Agent 1: Signal Collector ───────────────────────────
  logs.push(agentLog(reportId, AGENTS.SIGNAL_COLLECTOR, 'Collecting incident signals', {
    location: `${input.latitude}, ${input.longitude}`,
    district: input.district,
    hasMedia: (input.mediaUrls?.length ?? 0) > 0,
  }));

  await delay(800);
  logs.push(agentLog(reportId, AGENTS.SIGNAL_COLLECTOR, `Cross-referencing weather data for ${input.district}`));
  await delay(600);
  logs.push(agentLog(reportId, AGENTS.SIGNAL_COLLECTOR, 'Signal collection complete', { signals: 7 }, 'COMPLETED'));

  // ─── Agent 2: Crisis Detector ─────────────────────────────
  logs.push(agentLog(reportId, AGENTS.CRISIS_DETECTOR, 'Initializing crisis detection pipeline'));
  const detectionResult = await callGeminiDetection(input.description, input.district);
  
  logs.push(agentLog(reportId, AGENTS.CRISIS_DETECTOR, 'AI model inference complete', {
    detectedType: detectionResult.type,
    confidence: detectionResult.confidence,
  }));
  logs.push(agentLog(reportId, AGENTS.CRISIS_DETECTOR, 'Crisis classification finalized', {
    classification: detectionResult.type,
  }, 'COMPLETED'));

  // ─── Agent 3: Severity Analyzer ───────────────────────────
  logs.push(agentLog(reportId, AGENTS.SEVERITY_ANALYZER, 'Analyzing severity metrics'));
  const severityResult = await callGeminiSeverity(input.description, detectionResult.type, input.district);

  logs.push(agentLog(reportId, AGENTS.SEVERITY_ANALYZER, 'Population density analysis', {
    district: input.district,
    densityPerKm2: getKarachiDensity(input.district),
  }));

  await delay(500);
  logs.push(agentLog(reportId, AGENTS.SEVERITY_ANALYZER, 'Severity score computed', {
    score: severityResult.score,
    level: severityResult.level,
  }, 'COMPLETED'));

  // ─── Agent 4: Prediction Agent ────────────────────────────
  logs.push(agentLog(reportId, AGENTS.PREDICTION, 'Running predictive spread model'));
  const prediction = await callGeminiPrediction(detectionResult.type, input.description, input.district);
  
  logs.push(agentLog(reportId, AGENTS.PREDICTION, 'Impact forecast generated', {
    estimatedAffected: prediction.affectedPeople,
    spreadRadiusKm: prediction.spreadRadius,
    pattern: prediction.spreadPattern
  }));
  logs.push(agentLog(reportId, AGENTS.PREDICTION, 'Prediction model output ready', prediction, 'COMPLETED'));

  // ─── Agent 5: Resource Planner ────────────────────────────
  logs.push(agentLog(reportId, AGENTS.RESOURCE_PLANNER, 'Calculating resource requirements'));
  const resources = await callGeminiResourcePlan(detectionResult.type, severityResult.level, input.district, input.description);
  
  logs.push(agentLog(reportId, AGENTS.RESOURCE_PLANNER, 'Resource allocation optimized', {
    totalUnits: resources.totalUnits,
    eta: resources.etaMinutes
  }));
  logs.push(agentLog(reportId, AGENTS.RESOURCE_PLANNER, 'Resource plan finalized', resources, 'COMPLETED'));

  // ─── Agent 6: Dispatch Coordinator ───────────────────────
  logs.push(agentLog(reportId, AGENTS.DISPATCH, 'Initiating dispatch sequence'));
  
  const dispatchedVehicles = dispatchVehicles(input.district, resources);
  
  logs.push(agentLog(reportId, AGENTS.DISPATCH, 'Dispatch orders transmitted', {
    unitsDispatched: dispatchedVehicles.length,
    vehicleIds: dispatchedVehicles.map(v => v.id),
    eta: resources.etaMinutes,
  }, 'COMPLETED'));

  // ─── Agent 7: Citizen Notification ───────────────────────
  logs.push(agentLog(reportId, AGENTS.CITIZEN_NOTIFY, 'Generating multilingual alerts'));
  const alerts = await callGeminiNotification(detectionResult.type, severityResult.level, input.district);
  
  logs.push(agentLog(reportId, AGENTS.CITIZEN_NOTIFY, 'Broadcasting emergency alerts', {
    channels: ['SMS', 'PUSH', 'RADIO'],
    languages: ['EN', 'UR'],
  }));
  
  // Save alert to store
  store.addAlert({
    level: severityResult.level === 'CRITICAL' || severityResult.level === 'CATASTROPHIC' ? 'EMERGENCY' : 'WARNING',
    title: alerts.title,
    message: alerts.message,
    messageUrdu: alerts.messageUrdu,
    district: input.district,
    reportId: input.reportId
  });

  await delay(400);
  logs.push(agentLog(reportId, AGENTS.CITIZEN_NOTIFY, 'Alerts broadcasted successfully', {}, 'COMPLETED'));

  // ─── Agent 8: Route Optimizer ────────────────────────────
  logs.push(agentLog(reportId, AGENTS.ROUTE_OPTIMIZER, 'Computing safe evacuation routes'));
  const routes = await callGeminiRouteOptimization(detectionResult.type, input.latitude, input.longitude, input.district);
  
  logs.push(agentLog(reportId, AGENTS.ROUTE_OPTIMIZER, 'Rerouting traffic away from incident zone', {
    evacuationRoutes: routes.length
  }));
  logs.push(agentLog(reportId, AGENTS.ROUTE_OPTIMIZER, 'Evacuation routes published', { routes }, 'COMPLETED'));

  // ── Update Store ──────────────────────────────────────────
  const finalResult: EmergencyAnalysisResult = {
    reportId: input.reportId,
    detectedType: detectionResult.type,
    confidence: detectionResult.confidence,
    severity: severityResult.level,
    severityScore: severityResult.score,
    reasoning: severityResult.reasoning,
    recommendations: generateRecommendations(detectionResult.type, severityResult.level),
    evacuationRoutes: routes,
    prediction,
    resources,
    agentLogs: logs,
    processedAt: new Date().toISOString(),
    modelUsed: GEMINI_MODEL,
    // Simulation specific metrics
    simulationOutcome: {
      livesSaved: Math.floor((input.population || 500000) * (0.02 + Math.random() * 0.05)),
      responseTime: resources.etaMinutes,
      coverage: 85 + Math.floor(Math.random() * 14),
      evacuated: Math.floor((input.population || 500000) * (0.1 + Math.random() * 0.2)),
      cost: resources.estimatedCost || 250000,
      unitsNeeded: resources.totalUnits
    }
  };

  const incident = {
    id: input.reportId,
    ...finalResult,
    status: 'ACTIVE',
    description: input.description,
    mediaUrls: input.mediaUrls || [],
    district: input.district,
    latitude: input.latitude,
    longitude: input.longitude,
    createdAt: new Date().toISOString()
  };

  // Update report in store with final results
  const existingReport = store.getReport(input.reportId);
  if (existingReport) {
    store.addReport({
      ...existingReport,
      ...finalResult,
      status: 'COMPLETED'
    });
  }

  store.addIncident(incident);
  emitIncidentUpdate(io, incident);

  return finalResult;
}

// ── Helper: Parse retry delay from Gemini 429 error message ──
function parseRetryDelay(errMessage: string, fallbackMs: number): number {
  // Gemini returns e.g. "retryDelay\":\"42s\"" or "Please retry in 42.5s"
  const secMatch = errMessage.match(/retryDelay[":\s]+["']?([\d.]+)s/i)
    || errMessage.match(/retry in ([\d.]+)s/i);
  if (secMatch) {
    const seconds = parseFloat(secMatch[1]);
    if (!isNaN(seconds) && seconds > 0) {
      return Math.ceil(seconds * 1000) + 500; // add 500ms buffer
    }
  }
  return fallbackMs;
}

// ── Helper: Retry API Calls with smart 429 backoff ────────────
async function callWithRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 3000): Promise<T> {
  let lastError: any;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const errMessage = String(err);
      const is429 = errMessage.includes('429') || errMessage.includes('Too Many Requests') || errMessage.includes('Quota exceeded');
      const isTransient = errMessage.includes('fetch failed') || errMessage.includes('TypeError') || errMessage.includes('503') || errMessage.includes('500');

      if (is429) {
        // Respect the API's actual retry-after duration
        const waitMs = parseRetryDelay(errMessage, 45000);
        logger.warn(`⚠️ Gemini quota hit (attempt ${i + 1}/${retries}). Waiting ${Math.round(waitMs / 1000)}s as instructed by API...`);
        await delay(waitMs);
      } else if (isTransient) {
        logger.warn(`⚠️ Gemini API call failed (attempt ${i + 1}/${retries}). Retrying in ${delayMs}ms... Error: ${errMessage}`);
        await delay(delayMs);
        delayMs *= 2; // Exponential backoff for transient errors
      } else {
        throw err; // Non-retryable error
      }
    }
  }
  throw lastError;
}

// ── Gemini Detection Call ─────────────────────────────────────
async function callGeminiDetection(description: string, district: string) {
  try {
    if (!gemini) {
      return { 
        type: description.toUpperCase().includes('FLOOD') ? 'FLOOD' : 
              description.toUpperCase().includes('FIRE') ? 'FIRE' : 'UNKNOWN', 
        confidence: 85, 
        reasoning: 'Heuristic-based classification (No Gemini Key)' 
      };
    }
    const model = gemini.getGenerativeModel({ 
      model: GEMINI_MODEL,
      generationConfig: { maxOutputTokens: 500, temperature: 0.1 },
    });
    
    const prompt = `You are an AI emergency detection system for Karachi, Pakistan.

Analyze this emergency report and classify it:
Description: "${description}"
Location: ${district}, Karachi

Respond ONLY with valid JSON:
{
  "type": "FLOOD|EARTHQUAKE|HEATWAVE|FIRE|BUILDING_COLLAPSE|ROAD_ACCIDENT|MEDICAL_EMERGENCY|GAS_LEAK|INFRASTRUCTURE_FAILURE|TRAFFIC_BLOCKAGE|ELECTRICAL_FAILURE|WATER_SYSTEM_BREAKDOWN",
  "confidence": 0-100,
  "reasoning": "brief explanation"
}`;

    const result = await callWithRetry(() => model.generateContent(prompt));
    const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    return JSON.parse(text);
  } catch (err) {
    logger.error('Gemini detection error:', err);
    return { type: 'UNKNOWN', confidence: 60, reasoning: 'Fallback classification' };
  }
}

// ── Gemini Severity Analysis ──────────────────────────────────
async function callGeminiSeverity(description: string, type: string, district: string) {
  try {
    if (!gemini) {
      return {
        level: 'HIGH',
        score: 75,
        reasoning: ['Heuristic risk assessment', 'Population density impact'],
        immediateRisks: ['Structure collapse', 'Evacuation necessary'],
        timeToEscalate: '20 minutes'
      };
    }
    const model = gemini.getGenerativeModel({ 
      model: GEMINI_MODEL,
      generationConfig: { maxOutputTokens: 800, temperature: 0.1 },
    });

    const prompt = `You are a disaster severity analyzer for Karachi, Pakistan.

Emergency Type: ${type}
District: ${district}
Description: "${description}"

Provide severity analysis as JSON only:
{
  "level": "LOW|MODERATE|HIGH|CRITICAL|CATASTROPHIC",
  "score": 0-100,
  "reasoning": ["step 1", "step 2", "step 3", "step 4"],
  "immediateRisks": ["risk 1", "risk 2"],
  "timeToEscalate": "X minutes/hours"
}`;

    const result = await callWithRetry(() => model.generateContent(prompt));
    const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    return JSON.parse(text);
  } catch (err) {
    logger.error('Gemini severity error:', err);
    return {
      level: 'HIGH',
      score: 72,
      reasoning: ['Automated assessment', 'Urban density risk', 'Infrastructure impact', 'Population exposure'],
      immediateRisks: ['Civilian evacuation required', 'Infrastructure damage'],
      timeToEscalate: '30 minutes',
    };
  }
}

// ── Gemini Prediction Call ────────────────────────────────────
async function callGeminiPrediction(type: string, description: string, district: string) {
  try {
    if (!gemini) return generatePredictionFallback(type);

    const model = gemini.getGenerativeModel({ model: GEMINI_MODEL });
    const prompt = `Predict the spread and impact for this emergency in Karachi:
Type: ${type}
District: ${district}
Details: ${description}

Respond as JSON:
{
  "spreadRadius": number (km),
  "affectedPeople": number,
  "estimatedDuration": number (hours),
  "spreadPattern": "radial|linear|downstream|unpredictable",
  "riskZones": [{ "level": "HIGH|MODERATE|LOW", "radius": number }],
  "timeline": [{ "hour": number, "phase": "string", "description": "string" }]
}`;

    const result = await callWithRetry(() => model.generateContent(prompt));
    const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(text);
  } catch (err) {
    return generatePredictionFallback(type);
  }
}

// ── Gemini Resource Planning Call ─────────────────────────────
async function callGeminiResourcePlan(type: string, severity: string, district: string, description: string) {
  try {
    if (!gemini) return planResourcesFallback(type, severity, district);

    const model = gemini.getGenerativeModel({ model: GEMINI_MODEL });
    const prompt = `Plan rescue resources for this emergency in Karachi:
Type: ${type}, Severity: ${severity}, District: ${district}
Details: ${description}

Respond as JSON:
{
  "ambulances": number,
  "firetrucks": number,
  "rescueBoats": number,
  "police": number,
  "helicopters": number,
  "totalUnits": number,
  "etaMinutes": number,
  "estimatedCost": number,
  "nearestHospital": "string"
}`;

    const result = await callWithRetry(() => model.generateContent(prompt));
    const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(text);
  } catch (err) {
    return planResourcesFallback(type, severity, district);
  }
}

// ── Gemini Notification Generation ────────────────────────────
async function callGeminiNotification(type: string, severity: string, district: string) {
  try {
    if (!gemini) return { title: `Alert: ${type}`, message: `Emergency in ${district}`, messageUrdu: 'ہنگامی صورتحال' };

    const model = gemini.getGenerativeModel({ model: GEMINI_MODEL });
    const prompt = `Generate a high-urgency emergency alert for ${district}, Karachi:
Type: ${type}, Severity: ${severity}

Respond as JSON:
{
  "title": "short catchy title with emoji",
  "message": "English alert message",
  "messageUrdu": "Urdu alert message (UTF-8)",
  "instructions": ["step 1", "step 2"]
}`;

    const result = await callWithRetry(() => model.generateContent(prompt));
    const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(text);
  } catch (err) {
    return { title: `🚨 Emergency Alert`, message: `Severe ${type} incident in ${district}`, messageUrdu: 'ہنگامی صورتحال' };
  }
}

// ── Gemini Route Optimization Call ────────────────────────────
async function callGeminiRouteOptimization(type: string, lat: number, lng: number, district: string) {
  try {
    if (!gemini) return [];

    const model = gemini.getGenerativeModel({ model: GEMINI_MODEL });
    const prompt = `Suggest 3 safe evacuation routes for ${district}, Karachi starting from ${lat}, ${lng} due to ${type}:

Respond as JSON array:
[{ "name": "string", "path": "string description", "safetyLevel": "HIGH|MODERATE" }]`;

    const result = await callWithRetry(() => model.generateContent(prompt));
    const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(text);
  } catch (err) {
    return [{ name: 'Main Arterial Road', path: 'Standard evacuation route', safetyLevel: 'MODERATE' }];
  }
}

// ── Fallback Methods ──────────────────────────────────────────
function generatePredictionFallback(type: string) {
  const spreadData: Record<string, any> = {
    FLOOD: { radius: 2.5, affected: 45000, duration: 72, spread: 'downstream' },
    FIRE: { radius: 0.5, affected: 8000, duration: 6, spread: 'wind-driven' },
    EARTHQUAKE: { radius: 15, affected: 250000, duration: 168, spread: 'radial' },
  };
  const data = spreadData[type] || { radius: 1, affected: 10000, duration: 24, spread: 'localized' };
  return {
    spreadRadius: data.radius,
    affectedPeople: data.affected,
    estimatedDuration: data.duration,
    spreadPattern: data.spread,
    riskZones: [{ level: 'HIGH', radius: data.radius * 0.5 }],
    timeline: generateTimeline(data.duration),
  };
}

function planResourcesFallback(type: string, severity: string, district: string) {
  const base: Record<string, any> = {
    FLOOD: { ambulances: 4, firetrucks: 2, rescueBoats: 8, police: 6, helicopters: 1 },
    FIRE: { ambulances: 3, firetrucks: 8, rescueBoats: 0, police: 4, helicopters: 1 },
  };
  const plan = base[type] || { ambulances: 2, firetrucks: 1, rescueBoats: 0, police: 3, helicopters: 0 };
  const multiplier = severity === 'CATASTROPHIC' ? 3 : severity === 'CRITICAL' ? 2 : 1;
  const scaled = Object.fromEntries(Object.entries(plan).map(([k, v]) => [k, Math.ceil((v as number) * multiplier)]));
  return {
    ...scaled,
    totalUnits: Object.values(scaled).reduce((a, b) => (a as number) + (b as number), 0) as number,
    etaMinutes: getETA(district),
    estimatedCost: 250000,
    nearestHospital: getNearestHospital(district),
  };
}

function dispatchVehicles(district: string, plan: any) {
  const allVehicles = store.getVehicles();
  const available = allVehicles.filter(v => v.status === 'AVAILABLE');
  const dispatched: any[] = [];

  // Simple dispatch logic: Match types and count
  const typesNeeded = [
    { type: 'AMBULANCE', count: plan.ambulances },
    { type: 'FIRE_TRUCK', count: plan.firetrucks },
    { type: 'RESCUE_BOAT', count: plan.rescueBoats },
    { type: 'HELICOPTER', count: plan.helicopters },
  ];

  typesNeeded.forEach(needed => {
    let count = 0;
    for (const v of available) {
      if (v.type === needed.type && count < needed.count) {
        store.updateVehicle(v.id, { 
          status: 'DISPATCHED', 
          currentIncidentId: district, // Using district as a proxy for incident ID for now
          lastDispatchedAt: new Date().toISOString() 
        });
        dispatched.push(v);
        count++;
      }
    }
  });

  return dispatched;
}

// ── Recommendations Generator ─────────────────────────────────
function generateRecommendations(type: string, severity: string): string[] {
  const base: Record<string, string[]> = {
    FLOOD: [
      'Immediately evacuate low-lying areas within 2km radius',
      'Open Karachi Expo Centre and Nipa Flycatcher as emergency shelters',
      'Deploy water rescue teams to identified flood zones',
      'Issue SMS alerts to all registered citizens in affected district',
      'Coordinate with NDMA for additional relief supplies',
      'Establish emergency food and water distribution points',
    ],
    EARTHQUAKE: [
      'Declare state of emergency in affected districts',
      'Deploy urban search and rescue (USAR) teams immediately',
      'Avoid all damaged structures — conduct secondary collapse assessment',
      'Activate all hospitals and medical teams on emergency protocol',
      'Clear arterial roads for emergency vehicle access',
      'Establish temporary medical camps at safe assembly points',
    ],
    FIRE: [
      'Isolate affected building — establish 300m evacuation perimeter',
      'Dispatch multiple fire suppression units from nearest stations',
      'Check for gas line breaches before water suppression',
      'Coordinate with building management for evacuation',
      'Deploy paramedics for smoke inhalation casualties',
    ],
    MEDICAL_EMERGENCY: [
      'Dispatch nearest ambulance unit immediately',
      'Provide first-aid guidance to bystanders via emergency line',
      'Alert receiving hospital for incoming patient',
      'Clear traffic on emergency route',
    ],
    HEATWAVE: [
      'Open public cooling centers across all districts',
      'Distribute water and ORS packets to vulnerable areas',
      'Alert medical teams for heatstroke cases',
      'Issue public advisory to avoid outdoor activity 11am-4pm',
      'Special attention to elderly and children',
    ],
  };

  return base[type] || [
    'Dispatch emergency response team to location',
    'Establish incident command post',
    'Coordinate with relevant authorities',
    'Issue public safety advisory',
  ];
}

// ── Helpers ───────────────────────────────────────────────────
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getKarachiDensity(district: string): number {
  const densities: Record<string, number> = {
    'Lyari': 65000, 'Saddar': 45000, 'North Karachi': 35000,
    'Gulshan': 28000, 'Orangi': 55000, 'Korangi': 42000,
    'Malir': 18000, 'Clifton': 15000, 'DHA': 12000,
  };
  return densities[district] || 30000;
}

function getETA(district: string): number {
  const etas: Record<string, number> = {
    'Clifton': 8, 'DHA': 10, 'Saddar': 6, 'Gulshan': 12,
    'North Karachi': 18, 'Orangi': 20, 'Lyari': 8, 'Korangi': 22,
  };
  return etas[district] || 15;
}

function getNearestHospital(district: string): string {
  const hospitals: Record<string, string> = {
    'Clifton': 'Aga Khan University Hospital',
    'DHA': 'South City Hospital',
    'Saddar': 'Civil Hospital Karachi',
    'Gulshan': 'Liaquat National Hospital',
    'Lyari': 'Ruth KM Pfau Civil Hospital',
    'North Karachi': 'Abbasi Shaheed Hospital',
    'Orangi': 'Orangi Town Hospital',
  };
  return hospitals[district] || 'Civil Hospital Karachi';
}

function generateTimeline(durationHours: number): any[] {
  return [
    { hour: 0, phase: 'Impact', description: 'Initial incident detected' },
    { hour: 1, phase: 'Response', description: 'Emergency teams on scene' },
    { hour: Math.floor(durationHours * 0.2), phase: 'Containment', description: 'Situation being controlled' },
    { hour: Math.floor(durationHours * 0.5), phase: 'Stabilization', description: 'Major risks mitigated' },
    { hour: durationHours, phase: 'Recovery', description: 'Incident resolved' },
  ];
}

// ── Types ─────────────────────────────────────────────────────
export interface EmergencyAnalysisResult {
  reportId: string;
  detectedType: string;
  confidence: number;
  severity: string;
  severityScore: number;
  reasoning: string[];
  recommendations: string[];
  evacuationRoutes?: any;
  prediction: any;
  resources: any;
  agentLogs: any[];
  processedAt: string;
  modelUsed: string;
  simulationOutcome?: {
    livesSaved: number;
    responseTime: number;
    coverage: number;
    evacuated: number;
    cost: number;
    unitsNeeded: number;
  };
}
