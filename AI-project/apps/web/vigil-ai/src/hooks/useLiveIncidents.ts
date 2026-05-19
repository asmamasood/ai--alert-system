// ============================================================
// VIGIL AI — useLiveIncidents hook
// Fetches real incident data from ResQ AI backend
// + keeps store live via Socket.IO
// ============================================================

import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useIncidentStore } from '../store/useIncidentStore';
import { socketService } from '../services/socket';
import { incidentApi } from '../services/api';
import { Incident } from '../types/incident.types';
import { ENV } from '../../config/env';

/** Normalize backend incident (snake_case + different field names) to frontend type */
function normalizeIncident(raw: any): Incident {
  return {
    id: raw.id,
    type: (raw.type?.toLowerCase() || raw.detectedType?.toLowerCase() || 'accident') as any,
    title: raw.title || raw.detectedType || 'Emergency',
    description: raw.description || raw.recommendations?.[0] || '',
    location: {
      latitude: raw.latitude ?? raw.location?.latitude ?? 24.8607,
      longitude: raw.longitude ?? raw.location?.longitude ?? 67.0011,
    },
    severity: (raw.severity?.toLowerCase() || 'medium') as any,
    status: (raw.status?.toLowerCase() || 'active') as any,
    confidence: raw.confidence ?? 80,
    media: (raw.mediaUrls || raw.media || []).map((m: any, idx: number) => {
      if (typeof m === 'string') {
        return {
          id: `m-${raw.id || 'raw'}-${idx}`,
          uri: m,
          type: 'image',
        };
      }
      return m;
    }),
    reportedBy: raw.reportedBy || raw.createdBy || 'system',
    timestamp: new Date(raw.timestamp || raw.createdAt || Date.now()),
    updatedAt: new Date(raw.updatedAt || Date.now()),
    radius: raw.radius,
    affectedCount: raw.affectedPopulation || raw.affectedCount,
    rescueStatus: raw.rescueStatus || 'pending',
  };
}

export const useLiveIncidents = () => {
  const { incidents, addIncident, updateIncident, setLoading } = useIncidentStore();
  const socketConnected = useRef(false);

  // ── Fetch initial incident list from backend ─────────────
  const query = useQuery<Incident[]>({
    queryKey: ['incidents'],
    queryFn: async () => {
      if (!ENV.ENABLE_REAL_SOCKET) {
        // Dev mode: return store state (mock data)
        return useIncidentStore.getState().incidents;
      }

      try {
        const res = await incidentApi.getAll({ status: 'ACTIVE' });
        const normalized = (res.data?.data || []).map(normalizeIncident);

        // Seed store with real data
        normalized.forEach((incident) => {
          const exists = useIncidentStore.getState().incidents.find((i) => i.id === incident.id);
          if (!exists) addIncident(incident);
        });

        return normalized;
      } catch (err: any) {
        console.warn('[useLiveIncidents] Backend fetch failed, using mock data:', err.message);
        return useIncidentStore.getState().incidents;
      }
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  // ── Connect Socket.IO for live updates ───────────────────
  useEffect(() => {
    if (!socketConnected.current) {
      socketService.connect();
      socketConnected.current = true;
    }

    return () => {
      socketService.disconnect();
      socketConnected.current = false;
    };
  }, []);

  return {
    incidents,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
