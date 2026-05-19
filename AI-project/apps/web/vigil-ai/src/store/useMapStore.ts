import { create } from 'zustand';
import { MapTheme } from '../constants/mapThemes';
import { Incident } from '../types/incident.types';

interface MapState {
  cameraLatitude: number;
  cameraLongitude: number;
  cameraZoom: number;
  selectedIncident: Incident | null;
  mapTheme: MapTheme;
  isLiveMode: boolean;
  showHeatmap: boolean;
  showClusters: boolean;

  setCameraPosition: (lat: number, lng: number, zoom?: number) => void;
  setSelectedIncident: (incident: Incident | null) => void;
  setMapTheme: (theme: MapTheme) => void;
  setLiveMode: (live: boolean) => void;
  toggleHeatmap: () => void;
  toggleClusters: () => void;
}

export const useMapStore = create<MapState>((set) => ({
  cameraLatitude: 24.8607,
  cameraLongitude: 67.0011,
  cameraZoom: 12,
  selectedIncident: null,
  mapTheme: 'dark',
  isLiveMode: true,
  showHeatmap: true,
  showClusters: true,

  setCameraPosition: (lat, lng, zoom = 14) =>
    set({ cameraLatitude: lat, cameraLongitude: lng, cameraZoom: zoom }),

  setSelectedIncident: (incident) => set({ selectedIncident: incident }),

  setMapTheme: (theme) => set({ mapTheme: theme }),

  setLiveMode: (live) => set({ isLiveMode: live }),

  toggleHeatmap: () => set((s) => ({ showHeatmap: !s.showHeatmap })),

  toggleClusters: () => set((s) => ({ showClusters: !s.showClusters })),
}));
