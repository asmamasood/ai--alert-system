export type IncidentType = 'flood' | 'fire' | 'accident' | 'collapse' | 'violence' | 'earthquake' | 'chemical';
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'active' | 'contained' | 'resolved' | 'escalated';

export interface GeoPoint {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface AIAnalysis {
  type: IncidentType;
  severity: SeverityLevel;
  confidence: number;       // 0–100
  radius: number;           // meters
  spreadPrediction: number; // minutes until area impact
  tags: string[];
}

export interface MediaAttachment {
  id: string;
  uri: string;
  type: 'image' | 'video';
  thumbnailUri?: string;
  uploadedUrl?: string;
}

export interface Incident {
  id: string;
  type: IncidentType;
  title: string;
  description?: string;
  location: GeoPoint;
  severity: SeverityLevel;
  status: IncidentStatus;
  confidence: number;
  aiAnalysis?: AIAnalysis;
  media: MediaAttachment[];
  reportedBy: string;
  timestamp: Date;
  updatedAt: Date;
  radius?: number;
  affectedCount?: number;
  rescueStatus?: 'pending' | 'dispatched' | 'on-scene' | 'resolved';
  clusterIds?: string[];
}

export interface IncidentCluster {
  id: string;
  center: GeoPoint;
  incidents: string[];
  dominantType: IncidentType;
  dominantSeverity: SeverityLevel;
  count: number;
}

export interface HeatmapPoint {
  latitude: number;
  longitude: number;
  weight: number;
}
