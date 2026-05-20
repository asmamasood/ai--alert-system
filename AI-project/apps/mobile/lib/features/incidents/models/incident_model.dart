import 'package:resq_mobile/features/alerts/models/alert_model.dart';

class Incident {
  final String id;
  final String title;
  final String description;
  final String? imageUrl;
  final String category; // FLOOD, FIRE, EARTHQUAKE, etc.
  final String severity; // LOW, MODERATE, HIGH, CRITICAL
  final double latitude;
  final double longitude;
  final DateTime createdAt;
  final DateTime? updatedAt;
  final String reporterId;
  final bool isResolved;
  final String? address;
  final String? district;

  Incident({
    required this.id,
    required this.title,
    required this.description,
    this.imageUrl,
    required this.category,
    required this.severity,
    required this.latitude,
    required this.longitude,
    required this.createdAt,
    this.updatedAt,
    required this.reporterId,
    this.isResolved = false,
    this.address,
    this.district,
  });

  factory Incident.fromJson(Map<String, dynamic> json) {
    return Incident(
      id: json['id'] ?? 'INC-${DateTime.now().millisecondsSinceEpoch}',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      imageUrl: json['imageUrl'] ?? json['image_url'],
      category: json['category'] ?? json['type'] ?? 'UNKNOWN',
      severity: json['severity'] ?? 'LOW',
      latitude: (json['latitude'] as num?)?.toDouble() ?? 0.0,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 0.0,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'])
          : null,
      reporterId: json['reporterId'] ?? json['reporter_id'] ?? 'unknown',
      isResolved: json['isResolved'] ?? json['resolved'] ?? false,
      address: json['address'],
      district: json['district'],
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'description': description,
    'imageUrl': imageUrl,
    'category': category,
    'severity': severity,
    'latitude': latitude,
    'longitude': longitude,
    'createdAt': createdAt.toIso8601String(),
    'updatedAt': updatedAt?.toIso8601String(),
    'reporterId': reporterId,
    'isResolved': isResolved,
    'address': address,
    'district': district,
  };

  // Merge data from server without losing local state
  Incident copyWith({
    String? id,
    String? title,
    String? description,
    String? imageUrl,
    String? category,
    String? severity,
    double? latitude,
    double? longitude,
    DateTime? createdAt,
    DateTime? updatedAt,
    String? reporterId,
    bool? isResolved,
    String? address,
    String? district,
  }) {
    return Incident(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      imageUrl: imageUrl ?? this.imageUrl,
      category: category ?? this.category,
      severity: severity ?? this.severity,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      reporterId: reporterId ?? this.reporterId,
      isResolved: isResolved ?? this.isResolved,
      address: address ?? this.address,
      district: district ?? this.district,
    );
  }

  // Convert to EmergencyAlert for compatibility with alerts feed
  EmergencyAlert toEmergencyAlert() {
    return EmergencyAlert(
      id: id,
      title: title,
      message: description,
      level: severity,
      district: district ?? 'Karachi',
      timestamp: createdAt,
      latitude: latitude,
      longitude: longitude,
    );
  }
}
