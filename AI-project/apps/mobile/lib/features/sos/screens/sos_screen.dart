import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:glassmorphism/glassmorphism.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../providers/sos_provider.dart';

class SOSScreen extends ConsumerWidget {
  const SOSScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final sosState = ref.watch(sosProvider);

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          'RESQ AI',
          style: GoogleFonts.orbitron(
            letterSpacing: 2,
            fontWeight: FontWeight.bold,
            fontSize: 20,
            color: const Color(0xFF6366F1),
          ),
        ),
        actions: [
          IconButton(
            onPressed: () {
              ref.read(sosProvider.notifier).reset();
            },
            icon: const Icon(LucideIcons.refreshCcw),
          ),
        ],
      ),
      body: Stack(
        children: [
          // Background Gradient
          Container(
            decoration: const BoxDecoration(
              gradient: RadialGradient(
                center: Alignment.center,
                radius: 1.5,
                colors: [
                  Color(0xFF1E1B4B),
                  Color(0xFF0F172A),
                ],
              ),
            ),
          ),

          // Radar-like pulse in background
          Center(
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: const Color(0xFF6366F1).withOpacity(0.1),
                  width: 2,
                ),
              ),
            ).animate(onPlay: (controller) => controller.repeat()).scale(
                  begin: const Offset(1, 1),
                  end: const Offset(2, 2),
                  duration: 2.seconds,
                  curve: Curves.easeOut,
                ).fadeOut(),
          ),

          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 20),
                  // Location Status Card
                  _buildStatusCard(),
                  const Spacer(),
                  // Central SOS Button
                  Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        _buildSOSButton(context, ref),
                        const SizedBox(height: 32),
                        Text(
                          sosState.isTriggered ? 'SIGNAL ACTIVE' : 'HOLD FOR 3 SECONDS',
                          style: GoogleFonts.inter(
                            color: sosState.isTriggered ? Colors.red : const Color(0xFF94A3B8),
                            letterSpacing: 2,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ).animate(onPlay: (controller) => controller.repeat())
                            .fadeIn(duration: 1.seconds)
                            .then()
                            .fadeOut(duration: 1.seconds),
                      ],
                    ),
                  ),
                  const Spacer(),
                  // Bottom Info Grid
                  _buildQuickActions(),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusCard() {
    return GlassmorphicContainer(
      width: double.infinity,
      height: 100,
      borderRadius: 20,
      blur: 20,
      alignment: Alignment.center,
      border: 2,
      linearGradient: LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [
          Colors.white.withOpacity(0.1),
          Colors.white.withOpacity(0.05),
        ],
      ),
      borderGradient: LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [
          const Color(0xFF6366F1).withOpacity(0.5),
          const Color(0xFF10B981).withOpacity(0.5),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFF10B981).withOpacity(0.2),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                LucideIcons.mapPin,
                color: Color(0xFF10B981),
                size: 24,
              ),
            ),
            const SizedBox(width: 16),
            Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'CURRENT ZONE: CLIFTON',
                  style: GoogleFonts.inter(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                Text(
                  'STATUS: LOW RISK (SECURE)',
                  style: GoogleFonts.inter(
                    color: const Color(0xFF10B981),
                    fontWeight: FontWeight.w600,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
            const Spacer(),
            Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                const Icon(LucideIcons.satellite, color: Color(0xFF6366F1), size: 16),
                const SizedBox(height: 4),
                Text(
                  'LOCKED',
                  style: GoogleFonts.inter(
                    color: const Color(0xFF94A3B8),
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    ).animate().fadeIn(duration: 800.ms).slideX(begin: -0.2, end: 0);
  }

  Widget _buildSOSButton(BuildContext context, WidgetRef ref) {
    return GestureDetector(
      onLongPress: () {
        _triggerEmergency(context, ref);
      },
      child: Container(
        width: 220,
        height: 220,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: Colors.red.withOpacity(0.3),
              blurRadius: 40,
              spreadRadius: 10,
            ),
          ],
          gradient: const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFFEF4444),
              Color(0xFF991B1B),
            ],
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              LucideIcons.flame,
              color: Colors.white,
              size: 48,
            ),
            const SizedBox(height: 8),
            Text(
              'SOS',
              style: GoogleFonts.orbitron(
                color: Colors.white,
                fontSize: 40,
                fontWeight: FontWeight.w900,
                letterSpacing: 2,
              ),
            ),
          ],
        ),
      ).animate(onPlay: (controller) => controller.repeat(reverse: true))
          .scale(begin: const Offset(1, 1), end: const Offset(1.05, 1.05), duration: 1.seconds, curve: Curves.easeInOut),
    );
  }

  Widget _buildQuickActions() {
    return Row(
      children: [
        _quickActionItem(LucideIcons.phoneCall, 'POLICE', const Color(0xFF3B82F6)),
        const SizedBox(width: 12),
        _quickActionItem(LucideIcons.ambulance, 'AMBULANCE', const Color(0xFFEF4444)),
        const SizedBox(width: 12),
        _quickActionItem(LucideIcons.flame, 'FIRE', const Color(0xFFF59E0B)),
      ],
    ).animate().fadeIn(delay: 400.ms, duration: 600.ms).slideY(begin: 0.2, end: 0);
  }

  Widget _quickActionItem(IconData icon, String label, Color color) {
    return Expanded(
      child: GlassmorphicContainer(
        width: double.infinity,
        height: 100,
        borderRadius: 20,
        blur: 10,
        alignment: Alignment.center,
        border: 1,
        linearGradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            color.withOpacity(0.15),
            color.withOpacity(0.05),
          ],
        ),
        borderGradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            color.withOpacity(0.5),
            color.withOpacity(0.2),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 28),
            const SizedBox(height: 8),
            Text(
              label,
              style: GoogleFonts.inter(
                color: Colors.white,
                fontSize: 10,
                fontWeight: FontWeight.bold,
                letterSpacing: 1,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _triggerEmergency(BuildContext context, WidgetRef ref) {
    // Trigger real backend SOS
    ref.read(sosProvider.notifier).triggerSOS(
      description: 'Emergency reported via mobile SOS button in Clifton area.',
      lat: 24.8138,
      lng: 67.0333,
      district: 'Clifton',
    );

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      isDismissible: false,
      builder: (context) => const _EmergencyProcessingSheet(),
    );
  }
}

class _EmergencyProcessingSheet extends ConsumerWidget {
  const _EmergencyProcessingSheet();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final sosState = ref.watch(sosProvider);

    return Container(
      height: MediaQuery.of(context).size.height * 0.75,
      decoration: const BoxDecoration(
        color: Color(0xFF0F172A),
        borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
      ),
      child: Column(
        children: [
          const SizedBox(height: 12),
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: const Color(0xFF334155),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 40),
          
          // AI Processing Animation
          const Icon(LucideIcons.brainCircuit, color: Color(0xFF6366F1), size: 64)
              .animate(onPlay: (controller) => controller.repeat())
              .shimmer(duration: 2.seconds)
              .shake(hz: 2),
          
          const SizedBox(height: 24),
          Text(
            sosState.reportId != null ? 'ORCHESTRATING RESPONSE' : 'INITIALIZING SIGNAL',
            style: GoogleFonts.orbitron(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
              letterSpacing: 1.5,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            sosState.reportId != null 
              ? 'Report ID: ${sosState.reportId}' 
              : 'Establishing secure link to Command Center...',
            style: GoogleFonts.inter(color: const Color(0xFF94A3B8), fontSize: 12),
          ),
          
          const SizedBox(height: 32),
          
          // Pipeline Steps (Real Logs)
          Expanded(
            child: sosState.logs.isEmpty 
              ? Center(
                  child: Text(
                    'Waiting for agent reports...',
                    style: GoogleFonts.inter(color: const Color(0xFF475569)),
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  itemCount: sosState.logs.length,
                  itemBuilder: (context, index) {
                    final log = sosState.logs[index];
                    return _pipelineStep(
                      log['agent'] ?? 'System',
                      log['step'] ?? 'Processing...',
                      log['status'] == 'COMPLETED',
                    ).animate().fadeIn(duration: 400.ms).slideX(begin: 0.1, end: 0);
                  },
                ),
          ),

          if (sosState.error != null)
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Text(
                'Error: ${sosState.error}',
                style: const TextStyle(color: Colors.redAccent),
              ),
            ),

          Padding(
            padding: const EdgeInsets.all(24.0),
            child: Row(
              children: [
                Expanded(
                  child: SizedBox(
                    height: 60,
                    child: ElevatedButton(
                      onPressed: () {
                        ref.read(sosProvider.notifier).reset();
                        Navigator.pop(context);
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF1E293B),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleAdvanced(borderRadius: BorderRadius.circular(16)),
                      ),
                      child: const Text('CANCEL SIGNAL'),
                    ),
                  ),
                ),
                if (!sosState.isAnalyzing && sosState.logs.isNotEmpty) ...[
                  const SizedBox(width: 16),
                  Expanded(
                    child: SizedBox(
                      height: 60,
                      child: ElevatedButton(
                        onPressed: () => Navigator.pop(context),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF6366F1),
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleAdvanced(borderRadius: BorderRadius.circular(16)),
                        ),
                        child: const Text('VIEW DETAILS'),
                      ),
                    ),
                  ),
                ]
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _pipelineStep(String agent, String status, bool completed) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: completed ? const Color(0xFF10B981).withOpacity(0.1) : const Color(0xFF6366F1).withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(
              completed ? Icons.check_circle : Icons.sync,
              color: completed ? const Color(0xFF10B981) : const Color(0xFF6366F1),
              size: 18,
            ).animate(onPlay: (controller) => !completed ? controller.repeat() : null)
                .rotate(duration: 2.seconds),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  agent.replaceAll('Agent', '').toUpperCase(),
                  style: GoogleFonts.inter(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                    letterSpacing: 1,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  status,
                  style: GoogleFonts.inter(
                    color: const Color(0xFF94A3B8),
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// Helper for rounded rectangle with advanced control
class RoundedRectangleAdvanced extends OutlinedBorder {
  final BorderRadius borderRadius;
  const RoundedRectangleAdvanced({required this.borderRadius});
  @override
  OutlinedBorder copyWith({BorderSide? side, BorderRadiusGeometry? borderRadius}) {
    return RoundedRectangleAdvanced(borderRadius: borderRadius as BorderRadius);
  }
  @override
  Path getInnerPath(Rect rect, {TextDirection? textDirection}) {
    return Path()..addRRect(borderRadius.toRRect(rect).deflate(side.width));
  }
  @override
  Path getOuterPath(Rect rect, {TextDirection? textDirection}) {
    return Path()..addRRect(borderRadius.toRRect(rect));
  }
  @override
  void paint(Canvas canvas, Rect rect, {TextDirection? textDirection}) {}
  @override
  ShapeBorder scale(double t) {
    return RoundedRectangleAdvanced(borderRadius: borderRadius * t);
  }
}

