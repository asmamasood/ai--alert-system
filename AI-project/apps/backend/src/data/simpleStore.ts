// ============================================================
// ResQ AI — Simple In-Memory Store
// Fallback for when Prisma/Postgres is unavailable
// ============================================================

import { logger } from '../utils/logger';
import { saveStore, loadStore } from '../utils/persistence';

class SimpleStore {
  private incidents: any[] = [];
  private alerts: any[] = [];
  private vehicles: any[] = [];
  private agentLogs: Map<string, any[]> = new Map();
  private reports: Map<string, any> = new Map();

  constructor() {
    const saved = loadStore();
    if (saved) {
      this.incidents = saved.incidents || [];
      this.alerts = saved.alerts || [];
      this.vehicles = saved.vehicles || [];
      this.reports = new Map(Object.entries(saved.reports || {}));
      this.agentLogs = new Map(Object.entries(saved.agentLogs || {}));
    }
    logger.info('📦 SimpleStore initialized');
  }

  private persist() {
    saveStore({
      incidents: this.incidents,
      alerts: this.alerts,
      vehicles: this.vehicles,
      reports: Object.fromEntries(this.reports),
      agentLogs: Object.fromEntries(this.agentLogs),
    });
  }

  // ── Incidents ──────────────────────────────────────────────
  addIncident(incident: any) {
    this.incidents.unshift(incident);
    this.persist();
    return incident;
  }

  getIncidents(filters: any = {}) {
    let filtered = [...this.incidents];
    if (filters.status) filtered = filtered.filter(i => i.status === filters.status);
    if (filters.district) filtered = filtered.filter(i => i.district === filters.district);
    return filtered;
  }

  getIncidentById(id: string) {
    return this.incidents.find(i => i.id === id);
  }

  updateIncident(id: string, updates: any) {
    const index = this.incidents.findIndex(i => i.id === id);
    if (index !== -1) {
      this.incidents[index] = { ...this.incidents[index], ...updates, updatedAt: new Date().toISOString() };
      this.persist();
      return this.incidents[index];
    }
    return null;
  }

  // ── Reports ────────────────────────────────────────────────
  addReport(report: any) {
    this.reports.set(report.id, report);
    this.persist();
    return report;
  }

  getReport(id: string) {
    return this.reports.get(id);
  }

  getReports() {
    return Array.from(this.reports.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getSimulations() {
    return this.getReports().filter(r => r.isSimulation);
  }

  updateReportStatus(id: string, status: string) {
    const report = this.reports.get(id);
    if (report) {
      report.status = status;
      report.updatedAt = new Date().toISOString();
      this.reports.set(id, report);
      this.persist();
    }
  }

  // ── Alerts ─────────────────────────────────────────────────
  addAlert(alert: any) {
    this.alerts.unshift({ ...alert, id: `ALT-${Date.now()}`, createdAt: new Date().toISOString() });
    this.persist();
    return alert;
  }

  getAlerts() {
    return this.alerts;
  }

  // ── Agent Logs ─────────────────────────────────────────────
  addAgentLog(reportId: string, log: any) {
    if (!this.agentLogs.has(reportId)) {
      this.agentLogs.set(reportId, []);
    }
    this.agentLogs.get(reportId)?.push(log);
    this.persist();
  }

  getAgentLogs(reportId: string) {
    return this.agentLogs.get(reportId) || [];
  }

  // ── Vehicles ───────────────────────────────────────────────
  addVehicle(vehicle: any) {
    this.vehicles.push(vehicle);
    this.persist();
    return vehicle;
  }

  getVehicles() {
    return this.vehicles;
  }

  updateVehicle(id: string, updates: any) {
    const index = this.vehicles.findIndex(v => v.id === id);
    if (index !== -1) {
      this.vehicles[index] = { ...this.vehicles[index], ...updates };
      this.persist();
      return this.vehicles[index];
    }
    return null;
  }
}

export const store = new SimpleStore();

