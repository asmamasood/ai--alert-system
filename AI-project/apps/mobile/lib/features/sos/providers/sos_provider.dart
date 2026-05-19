import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/services/api_service.dart';
import '../../../core/services/socket_service.dart';

class SOSState {
  final bool isTriggered;
  final bool isAnalyzing;
  final String? reportId;
  final List<Map<String, dynamic>> logs;
  final String? error;

  SOSState({
    this.isTriggered = false,
    this.isAnalyzing = false,
    this.reportId,
    this.logs = const [],
    this.error,
  });

  SOSState copyWith({
    bool? isTriggered,
    bool? isAnalyzing,
    String? reportId,
    List<Map<String, dynamic>>? logs,
    String? error,
  }) {
    return SOSState(
      isTriggered: isTriggered ?? this.isTriggered,
      isAnalyzing: isAnalyzing ?? this.isAnalyzing,
      reportId: reportId ?? this.reportId,
      logs: logs ?? this.logs,
      error: error ?? this.error,
    );
  }
}

class SOSNotifier extends Notifier<SOSState> {
  @override
  SOSState build() {
    // Cannot call _setupSocket() synchronously if it depends on ref, but we can do it here:
    Future.microtask(() => _setupSocket());
    return SOSState();
  }

  void _setupSocket() {
    final socketService = ref.read(socketServiceProvider);
    socketService.connect();
    socketService.subscribeToAgentLogs((log) {
      if (log['reportId'] == state.reportId || log['reportId'] == 'SYSTEM') {
        state = state.copyWith(
          logs: [...state.logs, log],
        );
      }
    });
  }

  Future<void> triggerSOS({
    required String description,
    required double lat,
    required double lng,
    required String district,
  }) async {
    state = state.copyWith(isTriggered: true, isAnalyzing: true, logs: [], error: null);

    try {
      final apiService = ref.read(apiServiceProvider);
      final response = await apiService.post('/emergency/reports', {
        'description': description,
        'latitude': lat,
        'longitude': lng,
        'district': district,
      });

      final reportId = response['data']['reportId'];
      state = state.copyWith(reportId: reportId);

      // Subscribe to logs for this report
      ref.read(socketServiceProvider).subscribeToAgents();
    } catch (e) {
      state = state.copyWith(isTriggered: false, isAnalyzing: false, error: e.toString());
    }
  }

  void reset() {
    state = SOSState();
  }
}

final apiServiceProvider = Provider((ref) => ApiService());
final socketServiceProvider = Provider((ref) => SocketService());

final sosProvider = NotifierProvider<SOSNotifier, SOSState>(() {
  return SOSNotifier();
});
