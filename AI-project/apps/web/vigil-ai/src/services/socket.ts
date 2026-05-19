// ============================================================
// VIGIL AI — Socket.IO Realtime Service
// Connected to ResQ AI backend websocket events
//
// Backend emits (socketManager.ts):
//   emergency-alert         → io.emit
//   incident-update         → io.emit
//   agent-status            → io.to('ai:agents').emit
//   district-risk           → io.emit
//   sensor:readings         → io.emit
//   vehicle:update          → io.to('command:center').emit
//   responder:location      → io.to('command:center').emit
//
// Client emits to backend:
//   join:district           → join district room
//   join:command            → join command room (admin/responder)
//   location:update         → send responder position
//   subscribe:agents        → subscribe to ai:agents room
//   incident:new            → broadcast new incident
// ============================================================

import { io, Socket } from 'socket.io-client';
import { ENV } from '../../config/env';
import { useIncidentStore } from '../store/useIncidentStore';
import { useUserStore } from '../store/useUserStore';
import { Incident } from '../types/incident.types';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  /** Connect and attach all backend event handlers */
  connect(token?: string) {
    if (this.socket?.connected) return;

    const authToken = token || useUserStore.getState().token || undefined;

    this.socket = io(ENV.SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 2000,
      timeout: 10000,
      auth: authToken ? { token: authToken } : undefined,
    });

    // ── Connection lifecycle ───────────────────────────────
    this.socket.on('connect', () => {
      console.log('[Socket] ✅ Connected to ResQ AI server');
      this.reconnectAttempts = 0;
      // Subscribe to agent logs room after connecting
      this.socket?.emit('subscribe:agents');
    });

    this.socket.on('disconnect', (reason) => {
      console.warn(`[Socket] Disconnected: ${reason}`);
    });

    this.socket.on('connect_error', (err) => {
      this.reconnectAttempts++;
      console.warn(
        `[Socket] Connection error (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}):`,
        err.message
      );
    });

    // ── Backend → App events ───────────────────────────────

    /**
     * New or updated incident broadcast
     * Backend emits: 'incident-update'
     */
     this.socket.on('incident-update', (payload: any) => {
      console.log('[Socket] incident-update →', payload?.reportId || payload?.id);
      const store = useIncidentStore.getState();

      const incidentId = payload?.reportId || payload?.id;
      if (incidentId) {
        // AI analysis completion or live update — create/update incident
        const rawMedia = payload.mediaUrls || payload.media || [];
        const mappedMedia = rawMedia.map((m: any, idx: number) => {
          if (typeof m === 'string') {
            return {
              id: `m-${incidentId}-${idx}-${Date.now()}`,
              uri: m,
              type: 'image',
            };
          }
          return m;
        });

        const incident: Incident = {
          id: incidentId,
          type: (payload.type?.toLowerCase() || payload.detectedType?.toLowerCase() || 'accident') as any,
          title: payload.title || (payload.detectedType
            ? `${payload.detectedType} — ${payload.district || 'Karachi'}`
            : 'Emergency Alert'),
          description: payload.description || payload.recommendations?.[0] || '',
          location: {
            latitude: payload.latitude ?? payload.location?.latitude ?? 24.8607,
            longitude: payload.longitude ?? payload.location?.longitude ?? 67.0011,
          },
          severity: (payload.severity?.toLowerCase() || 'medium') as any,
          status: 'active',
          confidence: payload.confidence ?? 75,
          media: mappedMedia,
          reportedBy: payload.reportedBy || 'ai-system',
          timestamp: new Date(payload.timestamp || payload.createdAt || Date.now()),
          updatedAt: new Date(),
          affectedCount: payload.affectedCount || payload.affectedPopulation || 0,
          rescueStatus: payload.rescueStatus || 'pending',
        };

        // Check if already in store
        const existing = store.incidents.find((i) => i.id === incident.id);
        if (existing) {
          store.updateIncident(incident.id, {
            ...existing,
            ...incident,
            media: mappedMedia.length > 0 ? mappedMedia : existing.media,
          });
        } else {
          store.addIncident(incident);
        }
      }
    });

    /**
     * High-severity emergency alert
     * Backend emits: 'emergency-alert'
     */
    this.socket.on('emergency-alert', (alert: any) => {
      console.warn('[Socket] 🚨 emergency-alert →', alert?.title);
      // Store in incidents if we have location data
      if (alert?.location) {
        const store = useIncidentStore.getState();
        const incident: Incident = {
          id: `alert-${Date.now()}`,
          type: 'accident',
          title: alert.title || '🚨 Emergency Alert',
          description: alert.message || '',
          location: alert.location,
          severity: (alert.severity?.toLowerCase() || 'high') as any,
          status: 'active',
          confidence: 90,
          media: [],
          reportedBy: 'ai-system',
          timestamp: new Date(alert.timestamp || Date.now()),
          updatedAt: new Date(),
          rescueStatus: 'pending',
        };
        store.addIncident(incident);
      }
    });

    /**
     * District risk score updates
     * Backend emits: 'district-risk'  (scores array)
     */
    this.socket.on('district-risk', (scores: any[]) => {
      // Store map store update could go here
      // console.log('[Socket] district-risk →', scores?.length, 'districts');
    });

    /**
     * Live IoT sensor readings
     * Backend emits: 'sensor:readings'
     */
    this.socket.on('sensor:readings', (_readings: any[]) => {
      // Used by map heatmap layer — forwarded via store if needed
    });

    /**
     * AI agent status updates (only in ai:agents room)
     * Backend emits: 'agent-status'
     */
    this.socket.on('agent-status', (log: any) => {
      console.log(`[Socket] 🤖 [${log.agent}] ${log.step}`);
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  // ── Emit helpers ──────────────────────────────────────────

  /** Emit a new citizen incident to the server for relay */
  emitIncident(incident: Incident) {
    if (!this.socket?.connected) {
      console.warn('[Socket] Not connected — incident not emitted');
      return;
    }
    this.socket.emit('incident:new', incident);
  }

  /** Join a district room to receive district-specific alerts */
  joinDistrict(district: string) {
    this.socket?.emit('join:district', district);
  }

  /** Join command center (for admins/responders) */
  joinCommandCenter() {
    this.socket?.emit('join:command');
  }

  /** Update responder's live GPS location */
  updateLocation(lat: number, lng: number, district: string) {
    this.socket?.emit('location:update', { lat, lng, district });
  }

  /** Subscribe to raw custom events */
  on(event: string, callback: (...args: any[]) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string) {
    this.socket?.off(event);
  }

  isConnected() {
    return this.socket?.connected ?? false;
  }
}

export const socketService = new SocketService();
