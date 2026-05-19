// ============================================================
// ResQ AI — Socket.IO Realtime Manager
// ============================================================

import { Server, Socket } from 'socket.io';
import { logger } from '../utils/logger';
import { verifyToken } from '../utils/jwt';

interface ConnectedUser {
  socketId: string;
  userId: string;
  role: string;
  district?: string;
  lat?: number;
  lng?: number;
}

const connectedUsers = new Map<string, ConnectedUser>();
const districtRooms = new Map<string, Set<string>>();

export function initSocketIO(io: Server) {
  // ── Auth Middleware ────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || 
                    socket.handshake.headers.authorization?.split(' ')[1];
      
      if (token) {
        const decoded = verifyToken(token);
        socket.data.user = decoded;
      }
      next();
    } catch (err) {
      // Allow unauthenticated for public feeds
      next();
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = socket.data.user;
    logger.info(`⚡ Client connected: ${socket.id} | User: ${user?.id || 'anonymous'}`);

    // ── Register User ────────────────────────────────────────
    if (user) {
      connectedUsers.set(socket.id, {
        socketId: socket.id,
        userId: user.id,
        role: user.role,
      });
    }

    // ── Join District Room ───────────────────────────────────
    socket.on('join:district', (district: string) => {
      socket.join(`district:${district}`);
      if (!districtRooms.has(district)) districtRooms.set(district, new Set());
      districtRooms.get(district)!.add(socket.id);
      logger.info(`📍 ${socket.id} joined district: ${district}`);
    });

    // ── Join Command Room (Admins/Responders) ────────────────
    socket.on('join:command', () => {
      if (user && ['ADMIN', 'SUPER_ADMIN', 'RESPONDER', 'ANALYST'].includes(user.role)) {
        socket.join('command:center');
        logger.info(`🎯 Command center joined by: ${user.id}`);
      }
    });

    // ── Real-time Location Update ────────────────────────────
    socket.on('location:update', (data: { lat: number; lng: number; district: string }) => {
      if (user) {
        const userData = connectedUsers.get(socket.id);
        if (userData) {
          userData.lat = data.lat;
          userData.lng = data.lng;
          userData.district = data.district;
        }
        
        // Broadcast responder location to command center
        if (['RESPONDER'].includes(user.role)) {
          io.to('command:center').emit('responder:location', {
            userId: user.id,
            lat: data.lat,
            lng: data.lng,
            timestamp: new Date().toISOString(),
          });
        }
      }
    });

    // ── Subscribe to AI Agent Logs ───────────────────────────
    socket.on('subscribe:agents', () => {
      socket.join('ai:agents');
    });

    // ── Disconnect ───────────────────────────────────────────
    socket.on('disconnect', () => {
      connectedUsers.delete(socket.id);
      logger.info(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  logger.info('✅ Socket.IO realtime engine initialized');
}

// ── Emitter Functions ─────────────────────────────────────────

export function emitEmergencyAlert(io: Server, alert: any) {
  io.emit('emergency-alert', { ...alert, timestamp: new Date().toISOString() });
}

export function emitIncidentUpdate(io: Server, incident: any) {
  io.emit('incident-update', { ...incident, timestamp: new Date().toISOString() });
  io.to('command:center').emit('incident-update:detailed', incident);
}

export function emitAgentLog(io: Server, log: any) {
  io.to('ai:agents').emit('agent-status', { ...log, timestamp: new Date().toISOString() });
}

export function emitDistrictAlert(io: Server, district: string, alert: any) {
  io.to(`district:${district}`).emit('district:alert', alert);
}

export function emitVehicleUpdate(io: Server, vehicle: any) {
  io.to('command:center').emit('vehicle:update', vehicle);
}

export function emitAIStreaming(io: Server, data: { chunk: string; done: boolean; sessionId: string }) {
  io.emit(`ai:stream:${data.sessionId}`, data);
}

export function emitSensorReadings(io: Server, readings: any[]) {
  io.emit('sensor:readings', readings);
}

export function emitSafetyScoreUpdate(io: Server, scores: any[]) {
  io.emit('district-risk', scores);
}

export function getConnectedCount(): number {
  return connectedUsers.size;
}
