import { create } from 'zustand';
import { Incident, IncidentCluster, HeatmapPoint, SeverityLevel } from '../types/incident.types';

// Mock seed incidents for development
const MOCK_INCIDENTS: Incident[] = [
  {
    id: '1',
    type: 'flood',
    title: 'Flash Flood — Downtown Bridge',
    description: 'Water level rising rapidly near the central bridge. Road submerged.',
    location: { latitude: 24.8607, longitude: 67.0011 },
    severity: 'critical',
    status: 'active',
    confidence: 94,
    media: [],
    reportedBy: 'citizen_001',
    timestamp: new Date(Date.now() - 5 * 60000),
    updatedAt: new Date(),
    radius: 800,
    affectedCount: 340,
    rescueStatus: 'dispatched',
  },
  {
    id: '2',
    type: 'fire',
    title: 'Structure Fire — Market District',
    description: 'Multi-story commercial building engulfed. Spreading to adjacent units.',
    location: { latitude: 24.8715, longitude: 67.0099 },
    severity: 'high',
    status: 'active',
    confidence: 88,
    media: [],
    reportedBy: 'citizen_002',
    timestamp: new Date(Date.now() - 12 * 60000),
    updatedAt: new Date(),
    radius: 400,
    affectedCount: 120,
    rescueStatus: 'on-scene',
  },
  {
    id: '3',
    type: 'accident',
    title: 'Multi-Vehicle Pile-up — Highway 4',
    description: '6+ vehicles involved. Lane blockage. Casualties reported.',
    location: { latitude: 24.855, longitude: 67.015 },
    severity: 'medium',
    status: 'escalated',
    confidence: 99,
    media: [],
    reportedBy: 'citizen_003',
    timestamp: new Date(Date.now() - 20 * 60000),
    updatedAt: new Date(),
    radius: 200,
    affectedCount: 30,
    rescueStatus: 'dispatched',
  },
  {
    id: '4',
    type: 'chemical',
    title: 'Gas Leak — Industrial Zone',
    description: 'Strong sulfur smell. Residents evacuating. HAZMAT requested.',
    location: { latitude: 24.878, longitude: 67.025 },
    severity: 'high',
    status: 'active',
    confidence: 76,
    media: [],
    reportedBy: 'citizen_004',
    timestamp: new Date(Date.now() - 8 * 60000),
    updatedAt: new Date(),
    radius: 600,
    affectedCount: 200,
    rescueStatus: 'pending',
  },
];

interface IncidentState {
  incidents: Incident[];
  clusters: IncidentCluster[];
  heatmapPoints: HeatmapPoint[];
  selectedIncident: Incident | null;
  isLoading: boolean;

  addIncident: (incident: Incident) => void;
  updateIncident: (id: string, data: Partial<Incident>) => void;
  removeIncident: (id: string) => void;
  setSelectedIncident: (incident: Incident | null) => void;
  setCluster: (clusters: IncidentCluster[]) => void;
  setHeatmap: (points: HeatmapPoint[]) => void;
  setLoading: (loading: boolean) => void;
  getIncidentsBySeverity: (severity: SeverityLevel) => Incident[];
}

export const useIncidentStore = create<IncidentState>((set, get) => ({
  incidents: MOCK_INCIDENTS,
  clusters: [],
  heatmapPoints: MOCK_INCIDENTS.map(i => ({
    latitude: i.location.latitude,
    longitude: i.location.longitude,
    weight: i.severity === 'critical' ? 1 : i.severity === 'high' ? 0.7 : i.severity === 'medium' ? 0.4 : 0.2,
  })),
  selectedIncident: null,
  isLoading: false,

  addIncident: (incident) =>
    set((state) => ({
      incidents: [incident, ...state.incidents],
      heatmapPoints: [
        { latitude: incident.location.latitude, longitude: incident.location.longitude, weight: 1 },
        ...state.heatmapPoints,
      ],
    })),

  updateIncident: (id, data) =>
    set((state) => ({
      incidents: state.incidents.map((inc) => (inc.id === id ? { ...inc, ...data, updatedAt: new Date() } : inc)),
    })),

  removeIncident: (id) =>
    set((state) => ({ incidents: state.incidents.filter((inc) => inc.id !== id) })),

  setSelectedIncident: (incident) => set({ selectedIncident: incident }),

  setCluster: (clusters) => set({ clusters }),

  setHeatmap: (points) => set({ heatmapPoints: points }),

  setLoading: (loading) => set({ isLoading: loading }),

  getIncidentsBySeverity: (severity) =>
    get().incidents.filter((inc) => inc.severity === severity),
}));
