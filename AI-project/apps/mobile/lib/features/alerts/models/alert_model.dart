class EmergencyAlert {
  final String id;
  final String title;
  final String message;
  final String? messageUrdu;
  final String level; // EMERGENCY, WARNING, INFO
  final String district;
  final DateTime timestamp;
  final double? latitude;
  final double? longitude;

  EmergencyAlert({
    required this.id,
    required this.title,
    required this.message,
    this.messageUrdu,
    required this.level,
    required this.district,
    required this.timestamp,
    this.latitude,
    this.longitude,
  });

  factory EmergencyAlert.fromJson(Map<String, dynamic> json) {
    double? lat;
    double? lng;
    
    if (json['location'] != null) {
      lat = (json['location']['latitude'] as num?)?.toDouble();
      lng = (json['location']['longitude'] as num?)?.toDouble();
    }

    return EmergencyAlert(
      id: json['id'] ?? 'ALT-${DateTime.now().millisecondsSinceEpoch}',
      title: json['title'] ?? '',
      message: json['message'] ?? '',
      messageUrdu: json['messageUrdu'],
      level: json['level'] ?? json['severity'] ?? 'INFO',
      district: json['district'] ?? 'Karachi',
      timestamp: json['timestamp'] != null 
        ? DateTime.parse(json['timestamp']) 
        : DateTime.now(),
      latitude: lat,
      longitude: lng,
    );
  }
}
