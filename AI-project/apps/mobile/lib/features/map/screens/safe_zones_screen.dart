import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:latlong2/latlong.dart';
import 'package:resq_mobile/features/incidents/providers/incidents_provider.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

class SafeZonesScreen extends ConsumerStatefulWidget {
  final LatLng? initialCenter;
  
  const SafeZonesScreen({super.key, this.initialCenter});

  @override
  ConsumerState<SafeZonesScreen> createState() => _SafeZonesScreenState();
}

class _SafeZonesScreenState extends ConsumerState<SafeZonesScreen> {
  bool _hasAutoShown = false;

  @override
  void initState() {
    super.initState();
    if (widget.initialCenter != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _checkAndShowInitialIncident();
      });
    }
  }

  void _checkAndShowInitialIncident() {
    if (_hasAutoShown) return;
    final incidents = ref.read(incidentsProvider);
    final targetCenter = widget.initialCenter;
    if (targetCenter == null) return;

    final matchingIncidents = incidents.where((inc) {
      final latDiff = (inc.latitude - targetCenter.latitude).abs();
      final lngDiff = (inc.longitude - targetCenter.longitude).abs();
      return latDiff < 0.0001 && lngDiff < 0.0001;
    }).toList();

    if (matchingIncidents.isNotEmpty) {
      final target = matchingIncidents.first;
      setState(() {
        _hasAutoShown = true;
      });
      _showIncidentPopup(
        context,
        target.title,
        target.description,
        target.severity,
        target.imageUrl,
        target.createdAt,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final incidents = ref.watch(incidentsProvider);

    if (widget.initialCenter != null && !_hasAutoShown && incidents.isNotEmpty) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _checkAndShowInitialIncident();
      });
    }

    return Scaffold(
      body: Stack(
        children: [
          FlutterMap(
            options: MapOptions(
              initialCenter: widget.initialCenter ?? const LatLng(24.8607, 67.0011), // Karachi Central
              initialZoom: widget.initialCenter != null ? 15.0 : 12.0,
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
                subdomains: const ['a', 'b', 'c', 'd'],
              ),
              MarkerLayer(
                markers: [
                  // Safe Zone Markers (existing)
                  _buildSafeZoneMarker(const LatLng(24.8934, 67.0732), 'Karachi Expo Centre'),
                  _buildSafeZoneMarker(const LatLng(24.8214, 67.0253), 'Clifton Community Center'),
                  _buildSafeZoneMarker(const LatLng(24.9462, 67.0624), 'NIPA Shelter'),
                  
                  // Incident Markers (new - realtime)
                  ...incidents.map((incident) => 
                    _buildIncidentMarker(
                      context, 
                      incident.latitude, 
                      incident.longitude, 
                      incident.title,
                      incident.severity,
                      incident.imageUrl,
                      incident.description,
                      incident.createdAt,
                    )
                  ),
                ],
              ),
            ],
          ),

          // Header
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                children: [
                  _buildMapHeader(),
                  const Spacer(),
                  _buildMapLegend(),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Marker _buildSafeZoneMarker(LatLng point, String name) {
    return Marker(
      point: point,
      width: 80,
      height: 80,
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: const Color(0xFF10B981).withOpacity(0.2),
              shape: BoxShape.circle,
              border: Border.all(color: const Color(0xFF10B981), width: 2),
            ),
            child: const Icon(Icons.shield, color: Color(0xFF10B981), size: 20),
          ).animate(onPlay: (controller) => controller.repeat(reverse: true))
              .scale(begin: const Offset(1, 1), end: const Offset(1.2, 1.2), duration: 1.seconds),
          const SizedBox(height: 4),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: Colors.black87,
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
              name,
              style: const TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
          ),
        ],
      ),
    );
  }

  Marker _buildIncidentMarker(
    BuildContext context,
    double latitude,
    double longitude,
    String title,
    String severity,
    String? imageUrl,
    String description,
    DateTime createdAt,
  ) {
    final Color severityColor = {
      'LOW': const Color(0xFF10B981),
      'MODERATE': const Color(0xFFF59E0B),
      'HIGH': const Color(0xFFEF4444),
      'CRITICAL': const Color(0xFF7C3AED),
    }[severity] ?? const Color(0xFFEF4444);

    return Marker(
      point: LatLng(latitude, longitude),
      width: 60,
      height: 60,
      child: GestureDetector(
        onTap: () => _showIncidentPopup(
          context,
          title,
          description,
          severity,
          imageUrl,
          createdAt,
        ),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: severityColor.withOpacity(0.2),
                shape: BoxShape.circle,
                border: Border.all(color: severityColor, width: 2),
                boxShadow: [
                  BoxShadow(
                    color: severityColor.withOpacity(0.3),
                    blurRadius: 8,
                    spreadRadius: 2,
                  ),
                ],
              ),
              child: const Icon(LucideIcons.alertTriangle, color: Color(0xFFEF4444), size: 18),
            ).animate(onPlay: (controller) => controller.repeat(reverse: true))
                .scale(begin: const Offset(1, 1), end: const Offset(1.15, 1.15), duration: 1.seconds),
            const SizedBox(height: 4),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: Colors.black87,
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                'INC',
                style: const TextStyle(color: Colors.white, fontSize: 7, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showIncidentPopup(
    BuildContext context,
    String title,
    String description,
    String severity,
    String? imageUrl,
    DateTime createdAt,
  ) {
    final Color severityColor = {
      'LOW': const Color(0xFF10B981),
      'MODERATE': const Color(0xFFF59E0B),
      'HIGH': const Color(0xFFEF4444),
      'CRITICAL': const Color(0xFF7C3AED),
    }[severity] ?? const Color(0xFFEF4444);

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        decoration: const BoxDecoration(
          color: Color(0xFF0F172A),
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              // Image
              if (imageUrl != null && imageUrl.isNotEmpty)
                Column(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(16),
                      child: Image.network(
                        imageUrl,
                        height: 240,
                        width: double.infinity,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => Container(
                          height: 240,
                          color: const Color(0xFF1E293B),
                          child: const Center(
                            child: Icon(LucideIcons.imageOff, color: Color(0xFF64748B)),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],
                ),

              // Title
              Text(
                title,
                style: GoogleFonts.inter(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),

              // Severity badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: severityColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: severityColor),
                ),
                child: Text(
                  severity,
                  style: GoogleFonts.inter(
                    color: severityColor,
                    fontWeight: FontWeight.bold,
                    fontSize: 11,
                  ),
                ),
              ),
              const SizedBox(height: 12),

              // Description
              Text(
                description,
                style: GoogleFonts.inter(
                  color: const Color(0xFF94A3B8),
                  fontSize: 14,
                ),
              ),
              const SizedBox(height: 12),

              // Timestamp
              Row(
                children: [
                  const Icon(LucideIcons.clock, color: Color(0xFF64748B), size: 14),
                  const SizedBox(width: 8),
                  Text(
                    'Reported: ${createdAt.hour}:${createdAt.minute.toString().padLeft(2, '0')}',
                    style: GoogleFonts.inter(
                      color: const Color(0xFF64748B),
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Close button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF6366F1),
                    foregroundColor: Colors.white,
                  ),
                  child: const Text('CLOSE'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMapHeader() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A).withOpacity(0.9),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: Row(
        children: [
          const Icon(Icons.map, color: Color(0xFF6366F1), size: 20),
          const SizedBox(width: 12),
          Text(
            'SAFE ZONES & INCIDENTS',
            style: GoogleFonts.orbitron(
              color: Colors.white,
              fontSize: 14,
              fontWeight: FontWeight.bold,
            ),
          ),
          const Spacer(),
          const Icon(Icons.filter_alt, color: Color(0xFF64748B), size: 18),
        ],
      ),
    ).animate().fadeIn().slideY(begin: -0.2, end: 0);
  }

  Widget _buildMapLegend() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A).withOpacity(0.9),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _legendItem(Icons.shield, 'Safe Zone', const Color(0xFF10B981)),
          const SizedBox(height: 8),
          _legendItem(LucideIcons.alertTriangle, 'Incident', const Color(0xFFEF4444)),
          const SizedBox(height: 8),
          _legendItem(Icons.warning, 'Critical Area', const Color(0xFF7C3AED)),
        ],
      ),
    ).animate().fadeIn().slideY(begin: 0.2, end: 0);
  }

  Widget _legendItem(IconData icon, String label, Color color) {
    return Row(
      children: [
        Icon(icon, color: color, size: 16),
        const SizedBox(width: 12),
        Text(
          label,
          style: GoogleFonts.inter(color: Colors.white, fontSize: 12),
        ),
      ],
    );
  }
}
