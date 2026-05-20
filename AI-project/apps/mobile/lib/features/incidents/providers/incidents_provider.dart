import 'dart:developer' as dev;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:resq_mobile/features/incidents/models/incident_model.dart';
import 'package:resq_mobile/core/services/api_service.dart';
import 'package:resq_mobile/core/services/socket_service.dart';
import 'package:resq_mobile/features/sos/providers/sos_provider.dart';

final incidentsProvider = NotifierProvider<IncidentsNotifier, List<Incident>>(() {
  return IncidentsNotifier();
});

class IncidentsNotifier extends Notifier<List<Incident>> {
  @override
  List<Incident> build() {
    // Initialize realtime subscriptions
    Future.microtask(() => _init());
    return [];
  }

  void _init() {
    dev.log('Initializing IncidentsNotifier');
    
    // Listen for new incidents via websocket
    final socketSvc = ref.read(socketServiceProvider);
    socketSvc.subscribeToIncidents((data) {
      dev.log('New incident received in notifier: $data');
      final newIncident = Incident.fromJson(data);
      
      // Add to beginning of list
      state = [newIncident, ...state];
    });

    // Load initial incidents from API
    _loadIncidents();
  }

  Future<void> _loadIncidents() async {
    try {
      final apiService = ref.read(apiServiceProvider);
      final response = await apiService.get('/emergency/incidents');
      
      final List<dynamic> data = response['data'] ?? [];
      final incidents = data
          .map((item) => Incident.fromJson(item as Map<String, dynamic>))
          .toList();
      
      state = incidents;
      dev.log('✅ Loaded ${incidents.length} incidents');
    } catch (e) {
      dev.log('❌ Error loading incidents: $e');
    }
  }

  Future<void> addIncident(Incident incident) async {
    try {
      // Optimistically add to UI
      state = [incident, ...state];
      
      // Persist to backend
      final apiService = ref.read(apiServiceProvider);
      await apiService.post('/incidents/report', incident.toJson());
      
      dev.log('✅ Incident created: ${incident.id}');
    } catch (e) {
      dev.log('❌ Error adding incident: $e');
      // Remove from UI on error
      state = state.where((i) => i.id != incident.id).toList();
      rethrow;
    }
  }

  void updateIncident(Incident updatedIncident) {
    state = state.map((incident) {
      return incident.id == updatedIncident.id ? updatedIncident : incident;
    }).toList();
  }

  void removeIncident(String incidentId) {
    state = state.where((incident) => incident.id != incidentId).toList();
  }

  void handleRealtimeUpdate(Map<String, dynamic> data) {
    dev.log('Realtime incident update: $data');
    final incident = Incident.fromJson(data);
    
    // Check if it's an update or new incident
    final existingIndex = state.indexWhere((i) => i.id == incident.id);
    if (existingIndex >= 0) {
      // Update existing
      final updated = [...state];
      updated[existingIndex] = incident;
      state = updated;
    } else {
      // New incident
      state = [incident, ...state];
    }
  }
}
