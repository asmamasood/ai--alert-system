// ============================================================
// ResQ AI — Virtual Sensor Service
// Simulates live IoT sensor data for Karachi districts
// ============================================================

import { KARACHI_DISTRICTS } from '../data/mockData';

export interface SensorReading {
  district: string;
  type: 'WATER_LEVEL' | 'TEMPERATURE' | 'AIR_QUALITY' | 'TRAFFIC_DENSITY';
  value: number;
  unit: string;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  timestamp: string;
}

export function getLiveSensorReadings(): SensorReading[] {
  const readings: SensorReading[] = [];
  
  KARACHI_DISTRICTS.forEach(district => {
    // Temperature Sensor (Simulating Karachi heat)
    const temp = 32 + Math.random() * 12;
    readings.push({
      district: district.name,
      type: 'TEMPERATURE',
      value: parseFloat(temp.toFixed(1)),
      unit: '°C',
      status: temp > 40 ? 'CRITICAL' : temp > 36 ? 'WARNING' : 'NORMAL',
      timestamp: new Date().toISOString()
    });

    // Water Level Sensor (Relevant for Lyari/Malir/Drainage)
    if (['Lyari', 'Malir', 'Korangi'].includes(district.name)) {
      const level = Math.random() * 5;
      readings.push({
        district: district.name,
        type: 'WATER_LEVEL',
        value: parseFloat(level.toFixed(2)),
        unit: 'm',
        status: level > 4 ? 'CRITICAL' : level > 2.5 ? 'WARNING' : 'NORMAL',
        timestamp: new Date().toISOString()
      });
    }

    // Traffic Density (Saddar, Clifton, etc.)
    const traffic = Math.random() * 100;
    readings.push({
      district: district.name,
      type: 'TRAFFIC_DENSITY',
      value: Math.floor(traffic),
      unit: '%',
      status: traffic > 85 ? 'CRITICAL' : traffic > 60 ? 'WARNING' : 'NORMAL',
      timestamp: new Date().toISOString()
    });
  });

  return readings;
}
