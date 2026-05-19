// ============================================================
// ResQ AI — District Scoring Utility
// Computes live Risk & Safety scores based on multiple factors
// ============================================================

import { SensorReading } from '../services/sensor.service';

export interface DistrictScore {
  district: string;
  safetyScore: number; // 0-100 (100 is perfectly safe)
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  factors: {
    incidentImpact: number;
    sensorAnomalies: number;
    infrastructureLoad: number;
  };
}

export function calculateDistrictScore(
  district: string, 
  activeIncidents: any[], 
  sensors: SensorReading[]
): DistrictScore {
  const districtSensors = sensors.filter(s => s.district === district);
  const districtIncidents = activeIncidents.filter(i => i.district === district);

  // 1. Incident Impact (0-40 points)
  let incidentImpact = 0;
  districtIncidents.forEach(inc => {
    if (inc.severity === 'CATASTROPHIC') incidentImpact += 40;
    else if (inc.severity === 'CRITICAL') incidentImpact += 30;
    else if (inc.severity === 'HIGH') incidentImpact += 20;
    else incidentImpact += 10;
  });
  incidentImpact = Math.min(incidentImpact, 40);

  // 2. Sensor Anomalies (0-30 points)
  let sensorAnomalies = 0;
  districtSensors.forEach(s => {
    if (s.status === 'CRITICAL') sensorAnomalies += 10;
    else if (s.status === 'WARNING') sensorAnomalies += 5;
  });
  sensorAnomalies = Math.min(sensorAnomalies, 30);

  // 3. Infrastructure Load (Mocked for now, 0-30 points)
  const infrastructureLoad = Math.floor(Math.random() * 30);

  const totalRisk = incidentImpact + sensorAnomalies + infrastructureLoad;
  const safetyScore = Math.max(0, 100 - totalRisk);

  let riskLevel: DistrictScore['riskLevel'] = 'LOW';
  if (totalRisk > 70) riskLevel = 'CRITICAL';
  else if (totalRisk > 40) riskLevel = 'HIGH';
  else if (totalRisk > 20) riskLevel = 'MODERATE';

  return {
    district,
    safetyScore,
    riskLevel,
    factors: {
      incidentImpact,
      sensorAnomalies,
      infrastructureLoad
    }
  };
}
