import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:latlong2/latlong.dart';

class SafeZonesScreen extends StatelessWidget {
  final LatLng? initialCenter;
  
  const SafeZonesScreen({super.key, this.initialCenter});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          FlutterMap(
            options: MapOptions(
              initialCenter: initialCenter ?? const LatLng(24.8607, 67.0011), // Karachi Central
              initialZoom: initialCenter != null ? 15.0 : 12.0,
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
                subdomains: const ['a', 'b', 'c', 'd'],
              ),
              MarkerLayer(
                markers: [
                  _buildSafeZoneMarker(const LatLng(24.8934, 67.0732), 'Karachi Expo Centre'),
                  _buildSafeZoneMarker(const LatLng(24.8214, 67.0253), 'Clifton Community Center'),
                  _buildSafeZoneMarker(const LatLng(24.9462, 67.0624), 'NIPA Shelter'),
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
            'SAFE ZONES & SHELTERS',
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
          _legendItem(Icons.shield, 'Verified Safe Zone', const Color(0xFF10B981)),
          const SizedBox(height: 8),
          _legendItem(Icons.home, 'Emergency Shelter', const Color(0xFF3B82F6)),
          const SizedBox(height: 8),
          _legendItem(Icons.warning, 'Active Incident Area', const Color(0xFFEF4444)),
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
