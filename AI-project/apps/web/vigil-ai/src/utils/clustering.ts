import { Incident, IncidentCluster, GeoPoint } from '../types/incident.types';

const CLUSTER_RADIUS_KM = 0.5;

function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLng = ((b.longitude - a.longitude) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const chord =
    sinLat * sinLat +
    Math.cos((a.latitude * Math.PI) / 180) *
      Math.cos((b.latitude * Math.PI) / 180) *
      sinLng *
      sinLng;
  return R * 2 * Math.atan2(Math.sqrt(chord), Math.sqrt(1 - chord));
}

export const clusterIncidents = (incidents: Incident[]): IncidentCluster[] => {
  const visited = new Set<string>();
  const clusters: IncidentCluster[] = [];

  for (const incident of incidents) {
    if (visited.has(incident.id)) continue;
    const nearby = incidents.filter(
      (other) =>
        other.id !== incident.id &&
        !visited.has(other.id) &&
        haversineKm(incident.location, other.location) <= CLUSTER_RADIUS_KM
    );

    if (nearby.length === 0) continue;

    const group = [incident, ...nearby];
    group.forEach((i) => visited.add(i.id));

    const centerLat = group.reduce((sum, i) => sum + i.location.latitude, 0) / group.length;
    const centerLng = group.reduce((sum, i) => sum + i.location.longitude, 0) / group.length;

    const sorted = [...group].sort((a, b) => {
      const scores = { critical: 4, high: 3, medium: 2, low: 1 };
      return scores[b.severity] - scores[a.severity];
    });

    clusters.push({
      id: `cluster_${incident.id}`,
      center: { latitude: centerLat, longitude: centerLng },
      incidents: group.map((i) => i.id),
      dominantType: sorted[0].type,
      dominantSeverity: sorted[0].severity,
      count: group.length,
    });
  }

  return clusters;
};
