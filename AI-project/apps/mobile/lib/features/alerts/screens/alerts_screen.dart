import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:resq_mobile/features/alerts/models/alert_model.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:resq_mobile/features/alerts/providers/alerts_provider.dart';
import 'package:latlong2/latlong.dart';
import 'package:resq_mobile/features/map/screens/safe_zones_screen.dart';

class AlertsScreen extends ConsumerStatefulWidget {
  const AlertsScreen({super.key});

  @override
  ConsumerState<AlertsScreen> createState() => _AlertsScreenState();
}

class _AlertsScreenState extends ConsumerState<AlertsScreen> {
  bool _isUrdu = false;

  final List<EmergencyAlert> _staticAlerts = [
    EmergencyAlert(
      id: '1',
      title: '🚨 Severe Flood Warning',
      message: 'Flash floods expected in Lyari. Move to higher ground immediately.',
      messageUrdu: 'لیاری میں سیلاب کا خطرہ۔ فوراً اونچی جگہوں پر منتقل ہوں۔',
      level: 'EMERGENCY',
      district: 'Lyari',
      timestamp: DateTime.now().subtract(const Duration(minutes: 15)),
    ),
    EmergencyAlert(
      id: '2',
      title: '🔥 Industrial Fire',
      message: 'Major fire reported at SITE chemical plant. Avoid the area.',
      messageUrdu: 'سائٹ ایریا میں فیکٹری میں آگ۔ علاقے سے دور رہیں۔',
      level: 'WARNING',
      district: 'SITE',
      timestamp: DateTime.now().subtract(const Duration(hours: 1)),
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final liveAlerts = ref.watch(alertsProvider);
    final allAlerts = [...liveAlerts, ..._staticAlerts];

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          'EMERGENCY FEED',
          style: GoogleFonts.orbitron(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.5,
          ),
        ),
        actions: [
          _buildLanguageToggle(),
          const SizedBox(width: 16),
        ],
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(20),
        itemCount: allAlerts.length,
        itemBuilder: (context, index) {
          final alert = allAlerts[index];
          return _buildAlertCard(alert, index);
        },
      ),
    );
  }

  Widget _buildLanguageToggle() {
    return GestureDetector(
      onTap: () => setState(() => _isUrdu = !_isUrdu),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: const Color(0xFF6366F1).withOpacity(0.1),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: const Color(0xFF6366F1).withOpacity(0.3)),
        ),
        child: Row(
          children: [
            const Icon(LucideIcons.languages, size: 16, color: Color(0xFF6366F1)),
            const SizedBox(width: 8),
            Text(
              _isUrdu ? 'اردو' : 'EN',
              style: GoogleFonts.inter(
                color: const Color(0xFF6366F1),
                fontWeight: FontWeight.bold,
                fontSize: 12,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAlertCard(EmergencyAlert alert, int index) {
    final bool isEmergency = alert.level == 'EMERGENCY';
    final Color accentColor = isEmergency ? const Color(0xFFEF4444) : const Color(0xFFF59E0B);

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: accentColor.withOpacity(0.2),
          width: 1,
        ),
        boxShadow: [
          if (isEmergency)
            BoxShadow(
              color: accentColor.withOpacity(0.1),
              blurRadius: 10,
              spreadRadius: 2,
            ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: Stack(
          children: [
            if (isEmergency)
              Positioned(
                top: 0,
                left: 0,
                bottom: 0,
                width: 4,
                child: Container(color: accentColor),
              ),
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: accentColor.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          alert.level,
                          style: GoogleFonts.inter(
                            color: accentColor,
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 1,
                          ),
                        ),
                      ),
                      Text(
                        '${DateTime.now().difference(alert.timestamp).inMinutes}m ago',
                        style: GoogleFonts.inter(
                          color: const Color(0xFF64748B),
                          fontSize: 10,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    alert.title,
                    style: GoogleFonts.inter(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _isUrdu ? (alert.messageUrdu ?? alert.message) : alert.message,
                    style: _isUrdu 
                      ? GoogleFonts.notoNastaliqUrdu(color: const Color(0xFFCBD5E1), fontSize: 14, height: 1.8)
                      : GoogleFonts.inter(color: const Color(0xFFCBD5E1), fontSize: 14),
                    textAlign: _isUrdu ? TextAlign.right : TextAlign.left,
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Icon(LucideIcons.mapPin, size: 14, color: const Color(0xFF94A3B8)),
                      const SizedBox(width: 4),
                      Text(
                        alert.district,
                        style: GoogleFonts.inter(
                          color: const Color(0xFF94A3B8),
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const Spacer(),
                      TextButton(
                        onPressed: () {
                          if (alert.latitude != null && alert.longitude != null) {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => SafeZonesScreen(
                                  initialCenter: LatLng(alert.latitude!, alert.longitude!),
                                ),
                              ),
                            );
                          } else {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => const SafeZonesScreen(),
                              ),
                            );
                          }
                        },
                        style: TextButton.styleFrom(
                          foregroundColor: const Color(0xFF6366F1),
                          padding: EdgeInsets.zero,
                          minimumSize: const Size(50, 30),
                        ),
                        child: const Text('VIEW MAP'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    ).animate().fadeIn(delay: (index * 100).ms, duration: 600.ms).slideX(begin: 0.1, end: 0);
  }
}
