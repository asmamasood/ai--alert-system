import { SeverityLevel } from '../types/incident.types';
import { SEVERITY_CONFIG } from '../constants/emergencyTypes';

export const getSeverityConfig = (severity: SeverityLevel) => SEVERITY_CONFIG[severity];

export const getSeverityScore = (severity: SeverityLevel): number => {
  const scores: Record<SeverityLevel, number> = { low: 1, medium: 2, high: 3, critical: 4 };
  return scores[severity];
};

export const compareSeverity = (a: SeverityLevel, b: SeverityLevel): number =>
  getSeverityScore(b) - getSeverityScore(a);

export const getGlowShadow = (severity: SeverityLevel, size: 'sm' | 'md' | 'lg' = 'md') => {
  const config = SEVERITY_CONFIG[severity];
  const sizes = { sm: 4, md: 8, lg: 16 };
  const offset = sizes[size];
  return {
    shadowColor: config.color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: offset,
    elevation: offset,
  };
};

export const formatTimestamp = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return date.toLocaleDateString();
};

export const formatRadius = (meters: number): string => {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${meters} m`;
};
