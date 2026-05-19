// ============================================================
// VIGIL AI — Axios API Client + Backend Service Layer
// All endpoints match ResQ AI backend (apps/backend/src/routes/)
// ============================================================

import axios, { AxiosInstance } from 'axios';
import { ENV } from '../../config/env';
import { useUserStore } from '../store/useUserStore';
import { Incident } from '../types/incident.types';

// ── Axios Instance ──────────────────────────────────────────
const api: AxiosInstance = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach live JWT token from Zustand store
api.interceptors.request.use((config) => {
  const token = useUserStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — unwrap success payload, handle errors
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    const msg = error?.response?.data?.message || error.message;

    if (status === 401) {
      // Auto-logout on token expiry
      useUserStore.getState().logout();
    }

    console.error(`[API Error] ${status ?? 'network'}: ${msg}`);
    return Promise.reject(error);
  }
);

// ── Auth API ────────────────────────────────────────────────
// POST /auth/login  → { success, data: { token, refreshToken, user } }
// POST /auth/signup → { success, data: { token, user } }
// POST /auth/refresh → { success, data: { token } }
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ success: boolean; data: { token: string; refreshToken: string; user: any } }>(
      '/auth/login',
      { email, password }
    ),

  signup: (email: string, password: string, name: string, phone?: string) =>
    api.post<{ success: boolean; data: { token: string; user: any } }>(
      '/auth/signup',
      { email, password, name, phone }
    ),

  me: () => api.get('/auth/me'),

  refresh: (refreshToken: string) =>
    api.post<{ success: boolean; data: { token: string } }>(
      '/auth/refresh',
      { refreshToken }
    ),
};

// ── Emergency / Incident API ────────────────────────────────
// GET  /emergency/incidents         → list
// GET  /emergency/incidents/:id     → single
// POST /emergency/reports           → create + trigger AI
// GET  /emergency/stats             → dashboard stats
export const incidentApi = {
  /** List incidents — filters: status, district, type */
  getAll: (params?: { status?: string; district?: string; type?: string }) =>
    api.get<{ success: boolean; data: Incident[]; meta: any }>(
      '/emergency/incidents',
      { params }
    ),

  getById: (id: string) =>
    api.get<{ success: boolean; data: Incident }>(`/emergency/incidents/${id}`),

  /** Submit a new emergency report — triggers backend AI analysis */
  submitReport: (payload: {
    description: string;
    type?: string;
    latitude: number;
    longitude: number;
    district: string;
    mediaUrls?: string[];
    isAnonymous?: boolean;
  }) => api.post<{ success: boolean; data: { reportId: string; status: string } }>(
    '/emergency/reports',
    payload
  ),

  getStats: () =>
    api.get<{ success: boolean; data: any }>('/emergency/stats'),

  getNearby: (lat: number, lng: number, radiusKm: number) =>
    api.get<{ success: boolean; data: Incident[] }>('/emergency/incidents/nearby', {
      params: { lat, lng, radius: radiusKm },
    }),
};

// ── AI / Agent API ──────────────────────────────────────────
// GET /ai/agents  → list of agents + status
// GET /ai/status  → model status, uptime
// GET /ai/logs/:reportId → agent execution logs
export const aiApi = {
  getAgents: () =>
    api.get<{ success: boolean; data: any[] }>('/ai/agents'),

  getStatus: () =>
    api.get<{ success: boolean; data: any }>('/ai/status'),

  getLogs: (reportId: string) =>
    api.get<{ success: boolean; data: any[] }>(`/ai/logs/${reportId}`),
};

// ── Alerts API ──────────────────────────────────────────────
// GET /alerts
export const alertsApi = {
  getAll: () => api.get<{ success: boolean; data: any[] }>('/alerts'),
  getByDistrict: (district: string) =>
    api.get<{ success: boolean; data: any[] }>('/alerts', { params: { district } }),
};

// ── Analytics API ───────────────────────────────────────────
export const analyticsApi = {
  getOverview: () => api.get<{ success: boolean; data: any }>('/analytics'),
};

// ── Map API ─────────────────────────────────────────────────
// GET /maps/districts → district risk data
export const mapApi = {
  getDistricts: () => api.get<{ success: boolean; data: any[] }>('/maps/districts'),
  getVehicles: () => api.get<{ success: boolean; data: any[] }>('/maps/vehicles'),
};

export default api;
