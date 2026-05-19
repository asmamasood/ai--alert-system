// ============================================================
// ResQ AI — Karachi Mock Data (Realistic Demo Dataset)
// ============================================================

export function getMockIncidents(filters: {
  status?: string;
  district?: string;
  type?: string;
  limit?: number;
  page?: number;
}) {
  const incidents = [
    {
      id: 'INC-001',
      reportNumber: 'RPT-2024-001',
      title: 'Severe Flooding in Lyari Basin',
      type: 'FLOOD',
      severity: 'CATASTROPHIC',
      status: 'ACTIVE',
      district: 'Lyari',
      latitude: 24.8607,
      longitude: 67.0011,
      address: 'Lyari River Basin, near Lyari Expressway',
      description: 'Flash flooding reported following intense monsoon rainfall. Multiple roads submerged, residents trapped on upper floors.',
      aiConfidence: 97.3,
      affectedPeople: 45000,
      responseTeams: 12,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 900000).toISOString(),
      aiRecommendations: [
        'Deploy water rescue teams immediately',
        'Open Karachi Expo Centre as emergency shelter',
        'Issue district-wide evacuation order',
      ],
      media: ['https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400'],
    },
    {
      id: 'INC-002',
      reportNumber: 'RPT-2024-002',
      title: 'Industrial Fire at SITE Area',
      type: 'FIRE',
      severity: 'CRITICAL',
      status: 'RESPONDING',
      district: 'SITE',
      latitude: 24.9008,
      longitude: 67.0174,
      address: 'SITE Industrial Area, Block 7',
      description: 'Massive fire engulfing a chemical warehouse. Toxic smoke spreading towards residential areas.',
      aiConfidence: 95.1,
      affectedPeople: 8000,
      responseTeams: 8,
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      updatedAt: new Date(Date.now() - 300000).toISOString(),
      aiRecommendations: [
        'Evacuate 500m radius immediately',
        'Hazmat teams required',
        'Monitor wind direction for smoke spread',
      ],
      media: [],
    },
    {
      id: 'INC-003',
      reportNumber: 'RPT-2024-003',
      title: 'Building Collapse — Orangi Town',
      type: 'BUILDING_COLLAPSE',
      severity: 'CRITICAL',
      status: 'ACTIVE',
      district: 'Orangi',
      latitude: 24.9600,
      longitude: 66.9858,
      address: 'Sector 11C, Orangi Town',
      description: 'Multi-storey residential building partially collapsed. Estimated 30-50 residents trapped inside.',
      aiConfidence: 91.8,
      affectedPeople: 200,
      responseTeams: 6,
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      updatedAt: new Date(Date.now() - 600000).toISOString(),
      aiRecommendations: [
        'Deploy USAR teams with search equipment',
        'Ensure structural stability before entry',
        'Establish triage area 200m from collapse',
      ],
      media: [],
    },
    {
      id: 'INC-004',
      reportNumber: 'RPT-2024-004',
      title: 'Heatwave Alert — City Wide',
      type: 'HEATWAVE',
      severity: 'HIGH',
      status: 'ACTIVE',
      district: 'City Wide',
      latitude: 24.8607,
      longitude: 67.0011,
      address: 'Karachi Metropolitan Area',
      description: 'Temperature recorded at 48°C. Heat index exceeds 55°C. Vulnerable populations at extreme risk.',
      aiConfidence: 99.0,
      affectedPeople: 500000,
      responseTeams: 20,
      createdAt: new Date(Date.now() - 14400000).toISOString(),
      updatedAt: new Date(Date.now() - 1800000).toISOString(),
      aiRecommendations: [
        'Open 50 cooling centers across all districts',
        'Distribute ORS and water packets',
        'Alert medical centers for heatstroke cases',
      ],
      media: [],
    },
    {
      id: 'INC-005',
      reportNumber: 'RPT-2024-005',
      title: 'Gas Leak — Saddar Commercial District',
      type: 'GAS_LEAK',
      severity: 'HIGH',
      status: 'RESPONDING',
      district: 'Saddar',
      latitude: 24.8607,
      longitude: 67.0368,
      address: 'Zaibunissa Street, Saddar',
      description: 'Strong gas smell reported from underground pipeline. Potential explosion risk.',
      aiConfidence: 88.5,
      affectedPeople: 3000,
      responseTeams: 4,
      createdAt: new Date(Date.now() - 900000).toISOString(),
      updatedAt: new Date(Date.now() - 180000).toISOString(),
      aiRecommendations: [
        'Shut down gas supply to affected block',
        'Evacuate 300m radius',
        'No open flames or electrical switches in area',
      ],
      media: [],
    },
    {
      id: 'INC-006',
      reportNumber: 'RPT-2024-006',
      title: 'Multi-Vehicle Accident — Super Highway',
      type: 'ROAD_ACCIDENT',
      severity: 'HIGH',
      status: 'RESPONDING',
      district: 'Korangi',
      latitude: 24.8288,
      longitude: 67.1273,
      address: 'M-9 Super Highway, KM 45',
      description: '12-vehicle pileup during dust storm. Multiple casualties reported. Road completely blocked.',
      aiConfidence: 93.2,
      affectedPeople: 150,
      responseTeams: 5,
      createdAt: new Date(Date.now() - 2700000).toISOString(),
      updatedAt: new Date(Date.now() - 420000).toISOString(),
      aiRecommendations: [
        'Deploy 6 ambulances immediately',
        'Activate trauma unit at JPMC',
        'Reroute traffic to alternate routes',
      ],
      media: [],
    },
  ];

  let filtered = [...incidents];
  if (filters.status) filtered = filtered.filter(i => i.status === filters.status);
  if (filters.district) filtered = filtered.filter(i => i.district.toLowerCase().includes(filters.district!.toLowerCase()));
  if (filters.type) filtered = filtered.filter(i => i.type === filters.type);
  
  const limit = filters.limit || 20;
  const page = filters.page || 1;
  const start = (page - 1) * limit;
  
  return filtered.slice(start, start + limit);
}

export function getMockVehicles() {
  return [
    { id: 'VEH-001', type: 'AMBULANCE', status: 'DISPATCHED', lat: 24.8700, lng: 67.0200, district: 'Lyari', eta: 4 },
    { id: 'VEH-002', type: 'FIRE_TRUCK', status: 'ON_SCENE', lat: 24.9008, lng: 67.0174, district: 'SITE', eta: 0 },
    { id: 'VEH-003', type: 'RESCUE_BOAT', status: 'DISPATCHED', lat: 24.8500, lng: 67.0100, district: 'Lyari', eta: 8 },
    { id: 'VEH-004', type: 'AMBULANCE', status: 'AVAILABLE', lat: 24.9200, lng: 67.0800, district: 'North Karachi', eta: null },
    { id: 'VEH-005', type: 'HELICOPTER', status: 'DISPATCHED', lat: 24.8800, lng: 67.1600, district: 'DHA', eta: 12 },
    { id: 'VEH-006', type: 'POLICE', status: 'ON_SCENE', lat: 24.9600, lng: 66.9858, district: 'Orangi', eta: 0 },
  ];
}

export function getMockAlerts() {
  return [
    {
      id: 'ALT-001',
      level: 'EMERGENCY',
      title: '🚨 Flash Flood Warning — Lyari',
      message: 'Immediate evacuation required for all low-lying areas near Lyari River. Water level rising rapidly.',
      messageUrdu: 'لیاری ندی کے قریب تمام نشیبی علاقوں کو فوری طور پر خالی کریں۔',
      district: 'Lyari',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      isActive: true,
      targetedPeople: 45000,
    },
    {
      id: 'ALT-002',
      level: 'CRITICAL',
      title: '🔥 Industrial Fire — SITE Area',
      message: 'Toxic smoke hazard. Avoid SITE Industrial area. All windows shut. Evacuate if in 1km radius.',
      district: 'SITE',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      isActive: true,
      targetedPeople: 25000,
    },
    {
      id: 'ALT-003',
      level: 'WARNING',
      title: '🌡️ Extreme Heat Alert — All Districts',
      message: 'Temperature 48°C. Avoid outdoor activity 11AM-5PM. Stay hydrated. Cooling centers open.',
      district: null,
      createdAt: new Date(Date.now() - 14400000).toISOString(),
      isActive: true,
      targetedPeople: 16000000,
    },
  ];
}

export function getMockAgentWorkflow() {
  return {
    sessionId: `AGT-${Date.now()}`,
    startTime: new Date().toISOString(),
    agents: [
      {
        id: 'agent-1',
        name: 'Signal Collector Agent',
        icon: '📡',
        status: 'COMPLETED',
        purpose: 'Collect and normalize emergency signals from all data sources',
        steps: [
          { step: 'Connecting to 47 city sensors', duration: 320, status: 'done' },
          { step: 'Ingesting weather data from PMD', duration: 180, status: 'done' },
          { step: 'Parsing social media signals', duration: 250, status: 'done' },
          { step: 'Aggregating 12 incoming SOS reports', duration: 150, status: 'done' },
        ],
        output: { signalsCollected: 247, dataPoints: 8432, sources: 7 },
        durationMs: 1240,
      },
      {
        id: 'agent-2',
        name: 'Crisis Detection Agent',
        icon: '🔍',
        status: 'COMPLETED',
        purpose: 'AI-powered disaster pattern recognition and classification',
        steps: [
          { step: 'Running Gemini 1.5 Pro inference', duration: 890, status: 'done' },
          { step: 'Cross-referencing historical patterns', duration: 340, status: 'done' },
          { step: 'Finalizing crisis classification', duration: 120, status: 'done' },
        ],
        output: { detected: 'FLOOD', confidence: 97.3, modelUsed: 'gemini-1.5-pro' },
        durationMs: 1890,
      },
      {
        id: 'agent-3',
        name: 'Severity Analyzer',
        icon: '⚡',
        status: 'COMPLETED',
        purpose: 'Multi-factor severity assessment using population density, infrastructure data',
        steps: [
          { step: 'Loading population density maps', duration: 280, status: 'done' },
          { step: 'Analyzing infrastructure vulnerability', duration: 420, status: 'done' },
          { step: 'Computing composite severity score', duration: 195, status: 'done' },
        ],
        output: { severity: 'CATASTROPHIC', score: 94.2, affectedPeople: 45000 },
        durationMs: 1520,
      },
      {
        id: 'agent-4',
        name: 'Prediction Agent',
        icon: '🔮',
        status: 'COMPLETED',
        purpose: 'Forecast disaster spread and impact using ML models',
        steps: [
          { step: 'Running hydrological model', duration: 650, status: 'done' },
          { step: 'Computing 6-hour spread prediction', duration: 480, status: 'done' },
          { step: 'Generating risk zone maps', duration: 220, status: 'done' },
        ],
        output: { spreadRadius: 2.5, duration: '72 hours', peakRisk: '4 hours' },
        durationMs: 2180,
      },
      {
        id: 'agent-5',
        name: 'Resource Planner',
        icon: '🗺️',
        status: 'RUNNING',
        purpose: 'Optimize rescue resource allocation across all districts',
        steps: [
          { step: 'Querying available units inventory', duration: 180, status: 'done' },
          { step: 'Running allocation optimization algorithm', duration: 0, status: 'running' },
        ],
        output: null,
        durationMs: null,
      },
      {
        id: 'agent-6',
        name: 'Dispatch Coordinator',
        icon: '🚁',
        status: 'WAITING',
        purpose: 'Coordinate and dispatch emergency response teams',
        steps: [],
        output: null,
        durationMs: null,
      },
      {
        id: 'agent-7',
        name: 'Citizen Notification Agent',
        icon: '📢',
        status: 'WAITING',
        purpose: 'Broadcast multilingual emergency alerts to citizens',
        steps: [],
        output: null,
        durationMs: null,
      },
      {
        id: 'agent-8',
        name: 'Route Optimizer',
        icon: '🛣️',
        status: 'WAITING',
        purpose: 'Calculate safe evacuation routes and reroute traffic',
        steps: [],
        output: null,
        durationMs: null,
      },
    ],
  };
}

export const KARACHI_DISTRICTS = [
  { id: 1, name: 'Lyari', lat: 24.8607, lng: 67.0011, riskLevel: 'HIGH', population: 850000 },
  { id: 2, name: 'Saddar', lat: 24.8600, lng: 67.0368, riskLevel: 'MODERATE', population: 620000 },
  { id: 3, name: 'Orangi', lat: 24.9600, lng: 66.9858, riskLevel: 'HIGH', population: 2400000 },
  { id: 4, name: 'Gulshan-e-Iqbal', lat: 24.9208, lng: 67.0870, riskLevel: 'LOW', population: 780000 },
  { id: 5, name: 'North Karachi', lat: 24.9874, lng: 67.0674, riskLevel: 'MODERATE', population: 1100000 },
  { id: 6, name: 'DHA', lat: 24.8046, lng: 67.0718, riskLevel: 'LOW', population: 420000 },
  { id: 7, name: 'Clifton', lat: 24.8025, lng: 67.0238, riskLevel: 'LOW', population: 180000 },
  { id: 8, name: 'Korangi', lat: 24.8288, lng: 67.1273, riskLevel: 'MODERATE', population: 2100000 },
  { id: 9, name: 'Malir', lat: 24.8847, lng: 67.2003, riskLevel: 'LOW', population: 1600000 },
  { id: 10, name: 'SITE', lat: 24.9008, lng: 67.0174, riskLevel: 'HIGH', population: 450000 },
];
