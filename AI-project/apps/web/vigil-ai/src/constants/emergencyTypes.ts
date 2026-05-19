import { IncidentType } from '../types/incident.types';

export interface EmergencyCategory {
  id: IncidentType;
  label: string;
  icon: string;
  color: string;
  glowColor: string;
  description: string;
}

export const EMERGENCY_CATEGORIES: EmergencyCategory[] = [
  {
    id: 'flood',
    label: 'Flood',
    icon: '🌊',
    color: '#0288D1',
    glowColor: 'rgba(2, 136, 209, 0.4)',
    description: 'Rising water, flash floods, drainage overflow',
  },
  {
    id: 'fire',
    label: 'Fire',
    icon: '🔥',
    color: '#FF3D00',
    glowColor: 'rgba(255, 61, 0, 0.4)',
    description: 'Building fire, wildfire, gas explosion',
  },
  {
    id: 'accident',
    label: 'Accident',
    icon: '🚗',
    color: '#FF6D00',
    glowColor: 'rgba(255, 109, 0, 0.4)',
    description: 'Vehicle collision, road hazard, injury',
  },
  {
    id: 'collapse',
    label: 'Collapse',
    icon: '🏚️',
    color: '#795548',
    glowColor: 'rgba(121, 85, 72, 0.4)',
    description: 'Building/structure collapse, landslide',
  },
  {
    id: 'violence',
    label: 'Violence',
    icon: '⚠️',
    color: '#D50000',
    glowColor: 'rgba(213, 0, 0, 0.4)',
    description: 'Active threat, civil unrest, armed conflict',
  },
  {
    id: 'earthquake',
    label: 'Earthquake',
    icon: '🌍',
    color: '#827717',
    glowColor: 'rgba(130, 119, 23, 0.4)',
    description: 'Seismic activity, aftershocks, tremors',
  },
  {
    id: 'chemical',
    label: 'Chemical',
    icon: '☣️',
    color: '#76FF03',
    glowColor: 'rgba(118, 255, 3, 0.4)',
    description: 'Gas leak, toxic spill, hazardous material',
  },
];

export const SEVERITY_CONFIG = {
  critical: {
    label: 'CRITICAL',
    color: '#FF1744',
    glowColor: 'rgba(255, 23, 68, 0.6)',
    pulseColor: 'rgba(255, 23, 68, 0.3)',
    textColor: '#FF1744',
    bgColor: 'rgba(255, 23, 68, 0.15)',
  },
  high: {
    label: 'HIGH',
    color: '#FF6D00',
    glowColor: 'rgba(255, 109, 0, 0.5)',
    pulseColor: 'rgba(255, 109, 0, 0.25)',
    textColor: '#FF6D00',
    bgColor: 'rgba(255, 109, 0, 0.12)',
  },
  medium: {
    label: 'MEDIUM',
    color: '#00E5FF',
    glowColor: 'rgba(0, 229, 255, 0.4)',
    pulseColor: 'rgba(0, 229, 255, 0.2)',
    textColor: '#00E5FF',
    bgColor: 'rgba(0, 229, 255, 0.1)',
  },
  low: {
    label: 'LOW',
    color: 'rgba(255,255,255,0.7)',
    glowColor: 'rgba(255,255,255,0.2)',
    pulseColor: 'rgba(255,255,255,0.1)',
    textColor: 'rgba(255,255,255,0.7)',
    bgColor: 'rgba(255,255,255,0.05)',
  },
};
