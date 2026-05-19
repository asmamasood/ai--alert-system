// ============================================================
// ResQ AI — Advanced Hackathon Scenario Simulation Service
// ============================================================

import { logger } from '../utils/logger';
import { emitAgentLog, emitIncidentUpdate, emitEmergencyAlert } from '../realtime/socketManager';
import { io } from '../server';
import { store } from '../data/simpleStore';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const AGENTS = {
  SIGNAL_COLLECTOR: 'SignalCollectorAgent',
  CRISIS_DETECTOR: 'CrisisDetectionAgent',
  SEVERITY_ANALYZER: 'SeverityAnalyzerAgent',
  PREDICTION: 'PredictionAgent',
  RESOURCE_PLANNER: 'ResourcePlannerAgent',
  DISPATCH: 'DispatchCoordinatorAgent',
  CITIZEN_NOTIFY: 'CitizenNotificationAgent',
  ROUTE_OPTIMIZER: 'RouteOptimizerAgent',
};

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
  } catch (err) {
    logger.error('Failed to emit/store agent log:', err);
  }
  logger.info(`🤖 [${agent}] [${reportId}] ${step}`);
  return log;
}

export async function runComplexSimulation() {
  logger.info('🚀 Starting Advanced Hackathon Multi-Crisis Simulation');

  const lyariId = `COMPLEX-LYARI-${Date.now()}`;
  const siteId = `COMPLEX-SITE-${Date.now()}`;
  const cliftonId = `COMPLEX-CLIFTON-${Date.now()}`;

  // ============================================================
  // PHASE 1: Lyari Flood Report & Official Sensor Failure (Signal Fusion)
  // ============================================================
  
  // 1. Register Lyari Report
  const lyariReport = {
    id: lyariId,
    type: 'FLOOD',
    district: 'Lyari',
    description: 'Heavy rainfall causing severe water accumulation in streets. Water level rising fast near Lyari River bank. Multiple tweets and images posted by local residents.',
    latitude: 24.8607,
    longitude: 67.0011,
    status: 'ANALYZING',
    createdAt: new Date().toISOString(),
    isSimulation: true
  };
  store.addReport(lyariReport);
  store.addIncident(lyariReport);
  emitIncidentUpdate(io, lyariReport);

  agentLog(lyariId, AGENTS.SIGNAL_COLLECTOR, 'Ingesting emergency reports from multiple sources...');
  await delay(1200);

  agentLog(lyariId, AGENTS.SIGNAL_COLLECTOR, 'Attempting to query official Lyari riverbed ultrasonic sensors...', null, 'RUNNING');
  await delay(1500);

  // official sensor API failed/down
  agentLog(lyariId, AGENTS.SIGNAL_COLLECTOR, 'WARNING: Official Sensor API returned [500 Server Unreachable]. Official sensor reading unavailable.', {
    sensorId: 'LY-US-09',
    error: 'TIMEOUT_ERR',
    status: 'OFFLINE'
  }, 'WARNING');
  await delay(1500);

  // Fallback to social media signal fusion
  agentLog(lyariId, AGENTS.SIGNAL_COLLECTOR, 'Executing Fallback: Social Media Signal Fusion & Keyword Scraping Pipeline...', null, 'RUNNING');
  await delay(1500);

  const socialMediaData = {
    tweetsCount: 47,
    hasImages: true,
    keywordMatch: ['flood', 'toofan', 'paani', 'rain', 'lyari expressway'],
    userConfidenceWeight: 0.92
  };
  const confidenceScore = 0.89; // 89% confidence
  agentLog(lyariId, AGENTS.SIGNAL_COLLECTOR, 'Fused 47 distinct citizen reports. Signal confidence score: 89%. Consolidating results.', {
    socialMediaSignals: socialMediaData,
    calculatedConfidence: `${confidenceScore * 100}%`,
    verdict: 'TRUST_CITIZEN_REPORTS'
  }, 'COMPLETED');
  await delay(1500);

  // 2. Crisis Detector & Severity Analysis for Lyari
  agentLog(lyariId, AGENTS.CRISIS_DETECTOR, 'Classifying incident type & verifying crisis state...', null, 'RUNNING');
  await delay(1200);
  agentLog(lyariId, AGENTS.CRISIS_DETECTOR, 'Crisis classified: URBAN FLOODING.', { type: 'FLOOD', confidence: 0.94 }, 'COMPLETED');
  await delay(1000);

  agentLog(lyariId, AGENTS.SEVERITY_ANALYZER, 'Evaluating population risk and vulnerability metrics...', null, 'RUNNING');
  await delay(1200);
  agentLog(lyariId, AGENTS.SEVERITY_ANALYZER, 'Severity calculated: CRITICAL. Heavy urban congestion & river overflowing risks identified.', {
    score: 8.5,
    riskLevel: 'CRITICAL',
    vulnerabilities: ['Lyari Expressway access point', 'Lyari River overflow']
  }, 'COMPLETED');
  await delay(1000);

  // Update Lyari status
  const lyariUpdated = {
    ...lyariReport,
    status: 'ACTIVE',
    severity: 'CRITICAL',
    confidence: confidenceScore,
    severityScore: 8.5
  };
  store.updateIncident(lyariId, lyariUpdated);
  emitIncidentUpdate(io, lyariUpdated);


  // ============================================================
  // PHASE 2: Competing Crisis (SITE Chemical Fire) within 30 min
  // ============================================================
  await delay(2000);

  const siteReport = {
    id: siteId,
    type: 'FIRE',
    district: 'SITE',
    description: 'Industrial chemical explosion reported at SITE factory. High probability of toxic smoke spreading. Immediate evacuation required.',
    latitude: 24.9008,
    longitude: 67.0174,
    status: 'ANALYZING',
    createdAt: new Date().toISOString(),
    isSimulation: true
  };
  store.addReport(siteReport);
  store.addIncident(siteReport);
  emitIncidentUpdate(io, siteReport);

  agentLog(siteId, AGENTS.SIGNAL_COLLECTOR, 'New signal detected in SITE district. Parsing fire alarm triggers...');
  await delay(1000);
  agentLog(siteId, AGENTS.CRISIS_DETECTOR, 'Crisis classified: CHEMICAL INDUSTRIAL FIRE.', { type: 'FIRE', confidence: 0.98 }, 'COMPLETED');
  await delay(1000);
  agentLog(siteId, AGENTS.SEVERITY_ANALYZER, 'Severity calculated: CATASTROPHIC due to active chemical storage leakage and threat of cascading explosions.', {
    score: 9.8,
    riskLevel: 'CATASTROPHIC'
  }, 'COMPLETED');

  const siteUpdated = {
    ...siteReport,
    status: 'ACTIVE',
    severity: 'CATASTROPHIC',
    severityScore: 9.8
  };
  store.updateIncident(siteId, siteUpdated);
  emitIncidentUpdate(io, siteUpdated);
  await delay(1500);


  // ============================================================
  // PHASE 3: Resource Allocation & Trade-offs (Competing for Ambulances)
  // ============================================================
  agentLog(lyariId, AGENTS.RESOURCE_PLANNER, 'Initiating resource planning...', null, 'RUNNING');
  agentLog(siteId, AGENTS.RESOURCE_PLANNER, 'Initiating resource planning...', null, 'RUNNING');
  await delay(1500);

  agentLog(siteId, AGENTS.RESOURCE_PLANNER, 'COMPETING CRISIS DETECTED: SITE Chemical Fire and Lyari Flood are active simultaneously.', null, 'WARNING');
  await delay(1500);

  const resourceTradeoff = {
    limitedResource: 'Ambulance Units',
    availableTotal: 5,
    lyariDemand: 4,
    siteDemand: 3,
    tradeoffStrategy: {
      siteAllocation: 3, // CATASTROPHIC priority
      lyariAllocation: 2, // CRITICAL (remaining allocated, requesting external backup)
      backupRequestSent: 'Requesting 2 additional ambulance units from Saddar Central Hub'
    }
  };

  agentLog(siteId, AGENTS.RESOURCE_PLANNER, 'Executing Resource Optimization Trade-off: Priority given to SITE (CATASTROPHIC, toxic smoke inhalation).', resourceTradeoff, 'COMPLETED');
  await delay(1500);

  agentLog(lyariId, AGENTS.RESOURCE_PLANNER, 'Resource plan finalized with backup units incoming from Saddar Hub.', {
    allocatedAmbulances: 2,
    allocatedRescueBoats: 4, // unique resource, no conflict
    backupUnitsRequested: 2
  }, 'COMPLETED');
  await delay(1500);

  // Dispatch vehicles
  agentLog(siteId, AGENTS.DISPATCH, 'Dispatching 3 SITE Ambulance Units & 4 Fire Trucks...', {
    vehicles: ['AMB-03', 'AMB-04', 'AMB-05', 'FT-01', 'FT-02']
  }, 'COMPLETED');
  
  agentLog(lyariId, AGENTS.DISPATCH, 'Dispatching 2 Lyari Ambulance Units & 4 Rescue Boats...', {
    vehicles: ['AMB-01', 'AMB-02', 'RB-01', 'RB-02', 'RB-03', 'RB-04']
  }, 'COMPLETED');
  await delay(2000);


  // ============================================================
  // PHASE 4: Route Optimization API Fails Mid-Response & Evacuation Congestion
  // ============================================================
  agentLog(lyariId, AGENTS.ROUTE_OPTIMIZER, 'Calculating evacuation routes for Lyari residents...', null, 'RUNNING');
  await delay(1500);

  // Routing API Fails
  agentLog(lyariId, AGENTS.ROUTE_OPTIMIZER, 'ERROR: Routing API (Google Maps Matrix Service) failed to respond. Status 503 Service Unavailable.', null, 'WARNING');
  await delay(1500);

  // Fallback to local cache route matrices
  agentLog(lyariId, AGENTS.ROUTE_OPTIMIZER, 'Executing Fallback: Loading local cached road-network route matrices & static emergency lanes...', null, 'RUNNING');
  await delay(2000);

  const cachedRoutes = [
    { name: 'Evacuation Route 1 (Mauripur Rd)', status: 'CLEAR', safetyScore: 8.2 },
    { name: 'Evacuation Route 2 (Lyari Expressway Northbound)', status: 'WARNING (CONGESTION RISK)', safetyScore: 5.4 }
  ];
  agentLog(lyariId, AGENTS.ROUTE_OPTIMIZER, 'Cached route alternatives loaded successfully.', { cachedRoutes }, 'COMPLETED');
  await delay(1500);

  // Evacuation Congestion & Staged Alerting
  agentLog(lyariId, AGENTS.PREDICTION, 'Analyzing traffic flow & congestion risk on Lyari Expressway...', null, 'RUNNING');
  await delay(1500);
  
  agentLog(lyariId, AGENTS.PREDICTION, 'TRAFFIC ALERT: High risk of gridlock / congestion on Lyari Expressway if blanket evacuation is issued immediately.', {
    projectedCongestionIndex: '94%',
    danger: 'Trapped citizens on flooded highway'
  }, 'WARNING');
  await delay(1800);

  agentLog(lyariId, AGENTS.CITIZEN_NOTIFY, 'Formulating STAGED ALERTING PLAN to prevent evacuation congestion.', null, 'RUNNING');
  await delay(2000);

  const stagedNotification = {
    stagedStrategy: [
      { target: 'Lyari Zone A (Waterfront / Low-lying)', timing: 'IMMEDIATE', message: 'Evacuate immediately via Mauripur Rd' },
      { target: 'Lyari Zone B (High-ground)', timing: 'WAIT_15_MINS', message: 'Move to top floors. Evacuate only when instructed.' }
    ]
  };
  agentLog(lyariId, AGENTS.CITIZEN_NOTIFY, 'Broadcasted Staged Alerts to respective zones. Congestion minimized.', stagedNotification, 'COMPLETED');
  
  // Register Alerts in store
  store.addAlert({
    level: 'EMERGENCY',
    title: '🚨 STAGED EVACUATION: Lyari Zone A',
    message: 'Zone A low-lying areas must evacuate immediately via Mauripur Rd. Do not use Lyari Expressway.',
    district: 'Lyari',
    reportId: lyariId
  });
  
  store.addAlert({
    level: 'WARNING',
    title: '⚠️ ALERT: Lyari Zone B',
    message: 'Zone B high-ground residents, stay indoors/upper floors. Wait for Zone A clearance before evacuating.',
    district: 'Lyari',
    reportId: lyariId
  });

  // Update incident with routes
  store.updateIncident(lyariId, {
    ...store.getIncidentById(lyariId),
    evacuationRoutes: cachedRoutes,
  });
  emitIncidentUpdate(io, store.getIncidentById(lyariId));
  await delay(2000);


  // ============================================================
  // PHASE 5: False Alarm Clifton Gas Leak (Apology & Retraction)
  // ============================================================
  const cliftonReport = {
    id: cliftonId,
    type: 'GAS',
    district: 'Clifton',
    description: 'Gas leak smell spreading near Block 5 Clifton. Residents panicking.',
    latitude: 24.8239,
    longitude: 67.0345,
    status: 'ANALYZING',
    createdAt: new Date().toISOString(),
    isSimulation: true
  };
  store.addReport(cliftonReport);
  store.addIncident(cliftonReport);
  emitIncidentUpdate(io, cliftonReport);

  agentLog(cliftonId, AGENTS.SIGNAL_COLLECTOR, 'Ingesting Clifton Gas Leak alert signals...');
  await delay(1200);

  agentLog(cliftonId, AGENTS.SIGNAL_COLLECTOR, 'Verifying gas detection sensors & local SSGC (Sui Southern Gas Company) emergency desk...', null, 'RUNNING');
  await delay(1500);

  // False Alarm Verification
  agentLog(cliftonId, AGENTS.CRISIS_DETECTOR, 'Analyzing reports. Official SSGC desk confirmed: No active transmission line leaks. Local pressure gauges normal. Smell was traced to an isolated residential cylinder leak already repaired.', {
    verdict: 'FALSE_ALARM_VERIFIED',
    sensorConfirmation: 'NORMAL_PRESSURE',
    suiGasStatus: 'RESOLVED_LOCAL'
  }, 'COMPLETED');
  await delay(1500);

  // Retract Incident
  agentLog(cliftonId, AGENTS.DISPATCH, 'Cancelling Clifton gas emergency dispatch order. Returning units.', null, 'COMPLETED');
  await delay(1000);

  const cliftonRetracted = {
    ...cliftonReport,
    status: 'RETRACTED',
    severity: 'NONE',
    severityScore: 0,
    description: '[FALSE ALARM RETRACTED] Gas leak smell reported in Clifton Block 5 was a false alarm caused by a minor household cylinder leak which was resolved immediately.'
  };
  store.updateIncident(cliftonId, cliftonRetracted);
  emitIncidentUpdate(io, cliftonRetracted);

  // Broadcast apology/retraction alert
  agentLog(cliftonId, AGENTS.CITIZEN_NOTIFY, 'Formulating and broadcasting retraction/apology notice...', null, 'RUNNING');
  await delay(1500);

  const apologyAlert = {
    level: 'RETRACTED',
    title: 'Apology & Retraction: Clifton Gas Leak',
    message: 'The previously reported gas leak in Clifton Block 5 has been verified as a FALSE ALARM. The area is completely safe. We apologize for any panic or inconvenience caused.',
    messageUrdu: 'معذرت اور واپسی: کلفٹن بلاک 5 میں گیس کے اخراج کی اطلاع غلط ثابت ہوئی ہے۔ علاقہ مکمل طور پر محفوظ ہے۔ پریشانی کے لیے معذرت خواہ ہیں۔',
    district: 'Clifton',
    reportId: cliftonId
  };
  store.addAlert(apologyAlert);
  emitEmergencyAlert(io, apologyAlert);

  agentLog(cliftonId, AGENTS.CITIZEN_NOTIFY, 'Broadcasted apology and retraction alert to all Clifton devices. System audit logs updated.', apologyAlert, 'COMPLETED');

  // Complete other incidents
  await delay(1500);
  store.updateIncident(lyariId, { ...store.getIncidentById(lyariId), status: 'COMPLETED' });
  store.updateIncident(siteId, { ...store.getIncidentById(siteId), status: 'COMPLETED' });
  emitIncidentUpdate(io, store.getIncidentById(lyariId));
  emitIncidentUpdate(io, store.getIncidentById(siteId));

  logger.info('✅ Advanced Multi-Crisis Simulation Completed Successfully');
}
