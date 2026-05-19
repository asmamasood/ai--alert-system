import 'dart:developer' as dev;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:resq_mobile/features/alerts/models/alert_model.dart';
import 'package:resq_mobile/features/sos/providers/sos_provider.dart';

final alertsProvider = NotifierProvider<AlertsNotifier, List<EmergencyAlert>>(() {
  return AlertsNotifier();
});

class AlertsNotifier extends Notifier<List<EmergencyAlert>> {
  @override
  List<EmergencyAlert> build() {
    // Run setup after build or asynchronously to avoid side effects during construction
    Future.microtask(() => _init());
    return [];
  }

  void _init() {
    dev.log('Initializing AlertsNotifier');
    
    // Listen for real-time alerts using the central socketServiceProvider
    final socketSvc = ref.read(socketServiceProvider);
    socketSvc.subscribeToEmergencyAlerts((data) {
      dev.log('New alert received in notifier: $data');
      final newAlert = EmergencyAlert.fromJson(data);
      
      // Add to beginning of list
      state = [newAlert, ...state];
    });
  }

  void setAlerts(List<EmergencyAlert> alerts) {
    state = alerts;
  }
}
