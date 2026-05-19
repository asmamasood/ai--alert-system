import 'package:socket_io_client/socket_io_client.dart' as io;
import 'dart:developer' as dev;
import 'package:flutter_dotenv/flutter_dotenv.dart';

class SocketService {
  static final String serverUrl = dotenv.get('SOCKET_URL', fallback: 'http://192.168.1.39:3001');
  io.Socket? _socket;

  io.Socket get socket {
    if (_socket == null) {
      _init();
    }
    return _socket!;
  }

  void _init() {
    dev.log('Initializing socket connection to $serverUrl');
    _socket = io.io(serverUrl, <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': true,
      'reconnection': true,
      'reconnectionDelay': 1000,
      'reconnectionDelayMax': 5000,
      'reconnectionAttempts': 99999,
    });

    _socket!.onConnect((_) {
      dev.log('✅ Connected to Socket.IO server');
    });

    _socket!.onDisconnect((_) {
      dev.log('❌ Disconnected from Socket.IO server');
    });

    _socket!.onConnectError((err) {
      dev.log('⚠️ Socket connect error: $err');
    });
    
    _socket!.onReconnect((attempt) {
      dev.log('🔄 Reconnected to Socket.IO server after $attempt attempts');
    });
  }

  void connect() {
    socket.connect();
  }

  void disconnect() {
    _socket?.disconnect();
  }

  void subscribeToEmergencyAlerts(Function(Map<String, dynamic>) handler) {
    socket.on('emergency-alert', (data) {
      dev.log('🚨 Emergency Alert received: $data');
      handler(Map<String, dynamic>.from(data));
    });
  }

  void subscribeToIncidentUpdates(Function(Map<String, dynamic>) handler) {
    socket.on('incident-update', (data) {
      dev.log('📊 Incident Update received: $data');
      handler(Map<String, dynamic>.from(data));
    });
  }

  void subscribeToAgents() {
    dev.log('Subscribing to ai:agents');
    socket.emit('subscribe:agents');
  }

  void subscribeToAgentLogs(Function(Map<String, dynamic>) handler) {
    socket.on('agent-status', (data) {
      dev.log('Agent Log received: $data');
      handler(Map<String, dynamic>.from(data));
    });
  }

  void subscribeToDistrictRisk(Function(List<dynamic>) handler) {
    socket.on('district-risk', (data) {
      dev.log('District Risk received');
      handler(data as List<dynamic>);
    });
  }
}

final socketService = SocketService();
