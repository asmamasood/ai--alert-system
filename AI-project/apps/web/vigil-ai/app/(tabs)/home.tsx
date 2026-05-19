import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, StatusBar, Pressable,
  Dimensions, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SmartMap } from '../../src/components/map/SmartMap';
import { IncidentBottomSheet } from '../../src/components/incident/IncidentBottomSheet';
import { ReportForm } from '../../src/components/report/ReportForm';
import { useIncidentStore } from '../../src/store/useIncidentStore';
import { useMapStore } from '../../src/store/useMapStore';
import { useLiveIncidents } from '../../src/hooks/useLiveIncidents';
import { DESIGN_TOKENS } from '../../src/constants/mapThemes';
import { useSharedValue, withRepeat, withSequence, withTiming, Easing } from 'react-native-reanimated';
import { AnimatedView, useAnimatedStyle as useSafeAnimatedStyle } from '../../src/utils/reanimatedHelpers';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { ENV } from '../../config/env';

const { width: W, height: H } = Dimensions.get('window');

// ── Looping Telemetry Waveform Bar Component ──
const WaveformBar = ({ color }: { color: string }) => {
  const heightVal = useSharedValue(4);

  useEffect(() => {
    heightVal.value = withRepeat(
      withSequence(
        withTiming(16 + Math.random() * 20, {
          duration: 350 + Math.random() * 250,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(4, {
          duration: 350 + Math.random() * 250,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useSafeAnimatedStyle(() => ({
    height: heightVal.value,
  }));

  return <AnimatedView style={[styles.waveBar, animatedStyle, { backgroundColor: color }]} />;
};

export default function HomeScreen() {
  const { selectedIncident, setSelectedIncident, incidents } = useIncidentStore();
  const { isLiveMode, setLiveMode, setCameraPosition, mapTheme, setMapTheme } = useMapStore();
  const { isLoading } = useLiveIncidents();
  
  // State controllers
  const [showReport, setShowReport] = useState(false);
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [godViewActive, setGodViewActive] = useState(false);

  // Animations
  const alertGlow = useSharedValue(0.15);

  useEffect(() => {
    alertGlow.value = withRepeat(
      withSequence(
        withTiming(0.65, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.15, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const screenRedAlertStyle = useSafeAnimatedStyle(() => {
    if (!isEmergencyMode) return { opacity: 0 };
    return {
      opacity: alertGlow.value,
    };
  });

  // Calculate live data
  const criticalCount = incidents.filter((i) => i.severity === 'critical').length;
  const activeCount = incidents.filter((i) => i.status === 'active').length;
  const threatLevelPercentage = activeCount > 0 ? Math.min(100, 30 + activeCount * 12) : 10;

  // Toggle tactical zoom transitions
  const handleGodViewToggle = () => {
    const nextState = !godViewActive;
    setGodViewActive(nextState);
    if (nextState) {
      setMapTheme('satellite');
      // Fly to high altitude zoom out
      setCameraPosition(24.8607, 67.0011, 9.8);
    } else {
      setMapTheme('dark');
      // Fly to close detailed zoom in
      setCameraPosition(24.8607, 67.0011, 13.5);
    }
  };

  const handleTriggerSimulation = async () => {
    try {
      console.log('Triggering Advanced Agentic Simulation...');
      await fetch(`${ENV.API_BASE_URL}/simulation/complex`, {
        method: 'POST',
      });
      console.log('Simulation triggered successfully');
    } catch (err) {
      console.error('Failed to trigger simulation:', err);
    }
  };

  const currentThemeColor = isEmergencyMode 
    ? DESIGN_TOKENS.colors.neonRed 
    : DESIGN_TOKENS.colors.neonCyan;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── Tactical Map ── */}
      <SmartMap />

      {/* ── Gradual Red Infection Edge Vignette (Emergency mode active) ── */}
      <AnimatedView style={[styles.redAlertBorder, screenRedAlertStyle]} pointerEvents="none" />

      {/* ── MISSION CONTROL BAR (Top HUD) ── */}
      <SafeAreaView style={styles.topSafe} pointerEvents="box-none">
        <GlassCard 
          intensity={32} 
          borderColor={currentThemeColor} 
          style={styles.topHudCard} 
          animateFloat={false}
        >
          {/* Mission Control Header Row */}
          <View style={styles.hudRow}>
            <View style={styles.hudBrand}>
              <Text style={[styles.hudLogo, { color: currentThemeColor, textShadowColor: currentThemeColor }]}>
                {isEmergencyMode ? 'EMERGENCY' : 'RESQ AI'}
              </Text>
              <View style={[styles.hudAiBadge, { backgroundColor: isEmergencyMode ? DESIGN_TOKENS.colors.neonRed : DESIGN_TOKENS.colors.neonPurple }]}>
                <Text style={styles.hudAiText}>OS_v4.9</Text>
              </View>
              <View style={[styles.systemStatusChip, { borderColor: currentThemeColor + '40', backgroundColor: currentThemeColor + '10' }]}>
                <View style={[styles.statusDot, { backgroundColor: currentThemeColor, shadowColor: currentThemeColor }]} />
                <Text style={[styles.statusLabel, { color: currentThemeColor }]}>
                  {isEmergencyMode ? 'ALERT MODE' : 'SCANNING'}
                </Text>
              </View>
            </View>

            {/* Sound & Signal Telemetry Waveform */}
            <View style={styles.telemetrySection}>
              <Pressable onPress={() => setSoundEnabled(!soundEnabled)} style={styles.soundSwitch}>
                <Text style={styles.soundText}>{soundEnabled ? '🔊 AUDIO ON' : '🔇 MUTED'}</Text>
              </Pressable>
              <View style={styles.waveformWrap}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <WaveformBar key={i} color={currentThemeColor} />
                ))}
              </View>
            </View>
          </View>

          {/* Tactical Threat & Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statBlock}>
              <Text style={[styles.statNum, { color: DESIGN_TOKENS.colors.neonRed, textShadowColor: DESIGN_TOKENS.colors.neonRed }]}>
                {criticalCount}
              </Text>
              <Text style={styles.statLbl}>CRITICAL NODES</Text>
            </View>
            <View style={styles.statDivider} />
            
            <View style={styles.threatGaugeContainer}>
              <Text style={styles.statLbl}>GLOBAL THREAT THRESHOLD</Text>
              <View style={styles.gaugeTrack}>
                <View 
                  style={[
                    styles.gaugeFill, 
                    { 
                      width: `${threatLevelPercentage}%`,
                      backgroundColor: currentThemeColor,
                      shadowColor: currentThemeColor,
                    }
                  ]} 
                />
              </View>
              <Text style={[styles.gaugeValText, { color: currentThemeColor }]}>{threatLevelPercentage}%</Text>
            </View>
            
            <View style={styles.statDivider} />

            {/* Live active toggle */}
            <Pressable
              onPress={() => setLiveMode(!isLiveMode)}
              style={[
                styles.liveModeBtn, 
                isLiveMode && { borderColor: currentThemeColor, backgroundColor: currentThemeColor + '20' }
              ]}
            >
              <Text style={[styles.liveModeText, isLiveMode && { color: currentThemeColor }]}>
                {isLiveMode ? '⚡ LIVE FEED' : '⏸ PAUSED'}
              </Text>
            </Pressable>
          </View>
        </GlassCard>

        {/* ── Floating Map Controls Column ── */}
        <View style={styles.mapControls} pointerEvents="box-none">
          <Pressable 
            onPress={handleGodViewToggle} 
            style={[styles.mapControlBtn, godViewActive && { borderColor: DESIGN_TOKENS.colors.neonCyan }]}
          >
            <Text style={styles.mapControlIcon}>{godViewActive ? '🛰️' : '🌍'}</Text>
            <Text style={styles.controlBtnLabel}>{godViewActive ? 'GOD VIEW' : '2D VIEW'}</Text>
          </Pressable>

          <Pressable 
            onPress={() => setIsEmergencyMode(!isEmergencyMode)} 
            style={[styles.mapControlBtn, isEmergencyMode && { borderColor: DESIGN_TOKENS.colors.neonRed }]}
          >
            <Text style={styles.mapControlIcon}>🚨</Text>
            <Text style={styles.controlBtnLabel}>ALERTS</Text>
          </Pressable>

          {/* Secret Simulation Trigger for Hackathon Demo */}
          <Pressable 
            onPress={handleTriggerSimulation} 
            style={[styles.mapControlBtn, { borderColor: DESIGN_TOKENS.colors.neonPurple }]}
          >
            <Text style={styles.mapControlIcon}>⚡</Text>
            <Text style={styles.controlBtnLabel}>SIMULATE</Text>
          </Pressable>
        </View>
      </SafeAreaView>

      {/* ── BOTTOM PREVIEW CONSOLE CARD ── */}
      {selectedIncident && !showReport && (
        <View style={styles.miniCardWrap} pointerEvents="box-none">
          <GlassCard intensity={28} borderColor={currentThemeColor} animateFloat={true} style={styles.miniCard}>
            <View style={styles.miniCardRow}>
              <View style={[styles.miniSevDot, {
                backgroundColor: selectedIncident.severity === 'critical' ? DESIGN_TOKENS.colors.neonRed
                  : selectedIncident.severity === 'high' ? DESIGN_TOKENS.colors.neonOrange
                  : DESIGN_TOKENS.colors.neonCyan,
                shadowColor: selectedIncident.severity === 'critical' ? DESIGN_TOKENS.colors.neonRed : DESIGN_TOKENS.colors.neonCyan
              }]} />
              <View style={styles.miniCardInfo}>
                <Text style={styles.miniCardTitle} numberOfLines={1}>{selectedIncident.title.toUpperCase()}</Text>
                <Text style={styles.miniCardSub}>
                  GRID LOC • {selectedIncident.type.toUpperCase()} • AI VERIFIED {selectedIncident.confidence}%
                </Text>
              </View>
              <View style={[styles.miniSevBadge, {
                backgroundColor: selectedIncident.severity === 'critical'
                  ? DESIGN_TOKENS.colors.neonRedDim
                  : selectedIncident.severity === 'high'
                  ? 'rgba(255,109,0,0.18)'
                  : DESIGN_TOKENS.colors.neonCyanDim,
                borderColor: selectedIncident.severity === 'critical' ? DESIGN_TOKENS.colors.neonRed : DESIGN_TOKENS.colors.neonCyan
              }]}>
                <Text style={[styles.miniSevText, {
                  color: selectedIncident.severity === 'critical' ? DESIGN_TOKENS.colors.neonRed
                    : selectedIncident.severity === 'high' ? DESIGN_TOKENS.colors.neonOrange
                    : DESIGN_TOKENS.colors.neonCyan,
                }]}>
                  {selectedIncident.severity.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.miniCardActions}>
              <Pressable
                style={styles.miniActionBtn}
                onPress={() => {}}
              >
                <LinearGradient
                  colors={isEmergencyMode ? ['#FF1744', '#7C3AED'] : ['#2979FF', '#00E5FF']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.miniActionGrad}
                >
                  <Text style={styles.miniActionText}>ENGAGE DISPATCH</Text>
                </LinearGradient>
              </Pressable>
              <Pressable
                style={styles.miniActionBtnOutline}
                onPress={() => setSelectedIncident(null)}
              >
                <Text style={styles.miniActionTextOutline}>STANDBY</Text>
              </Pressable>
            </View>
          </GlassCard>
        </View>
      )}

      {/* ── REPORT FLOATING ACTION SWITCH ── */}
      <View style={styles.fabWrap} pointerEvents="box-none">
        <Pressable onPress={() => setShowReport(true)} style={styles.fabOuter}>
          <LinearGradient
            colors={['#FF1744', '#7C3AED']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.fab}
          >
            <Text style={styles.fabEmoji}>🚨</Text>
            <Text style={styles.fabLabel}>INTAKE</Text>
          </LinearGradient>
        </Pressable>
      </View>

      {/* ── Slide-up Command Consoles ── */}
      {selectedIncident && !showReport && (
        <IncidentBottomSheet
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
        />
      )}
      {showReport && (
        <ReportForm
          onClose={() => setShowReport(false)}
          onSuccess={() => setShowReport(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: DESIGN_TOKENS.colors.background },

  // Red infection aura glow
  redAlertBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 10,
    borderColor: 'rgba(255, 23, 68, 0.4)',
    zIndex: 5,
  },

  // ── Mission Control Bar ──
  topSafe: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
  },
  topHudCard: {
    marginHorizontal: 12, 
    marginTop: 8,
    backgroundColor: 'rgba(5, 10, 20, 0.88)',
  },
  hudRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hudBrand: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  hudLogo: {
    fontSize: 20, fontWeight: '900',
    letterSpacing: 3,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  hudAiBadge: {
    paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4,
  },
  hudAiText: { fontSize: 8, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
  systemStatusChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 7, paddingVertical: 3,
    borderRadius: DESIGN_TOKENS.radius.full,
    borderWidth: 1,
  },
  statusDot: {
    width: 6, height: 6, borderRadius: 3,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 4,
  },
  statusLabel: { fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  telemetrySection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  soundSwitch: {
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  soundText: {
    fontSize: 8,
    fontWeight: '900',
    color: DESIGN_TOKENS.colors.textSecondary,
    letterSpacing: 0.5,
  },
  waveformWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 20,
    gap: 3,
  },
  waveBar: {
    width: 2.5,
    borderRadius: 1,
  },

  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    borderTopWidth: 1, borderTopColor: DESIGN_TOKENS.colors.divider, paddingTop: 10, gap: 16,
    marginTop: 8,
  },
  statBlock: { alignItems: 'center' },
  statNum: {
    fontSize: 20, fontWeight: '900',
    lineHeight: 24,
    textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8,
  },
  statLbl: { fontSize: 8, color: DESIGN_TOKENS.colors.textMuted, fontWeight: '800', letterSpacing: 1, marginTop: 1 },
  statDivider: { width: 1, height: 24, backgroundColor: DESIGN_TOKENS.colors.divider },
  
  threatGaugeContainer: {
    flex: 1,
    gap: 4,
  },
  gaugeTrack: {
    width: '100%',
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  gaugeFill: {
    height: '100%',
    borderRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  gaugeValText: {
    fontSize: 8,
    fontWeight: '900',
    alignSelf: 'flex-end',
    letterSpacing: 0.5,
  },

  liveModeBtn: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: DESIGN_TOKENS.radius.full,
    borderWidth: 1, borderColor: DESIGN_TOKENS.colors.divider,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  liveModeText: { fontSize: 8, fontWeight: '900', color: DESIGN_TOKENS.colors.textMuted, letterSpacing: 0.5 },

  // Map Controls
  mapControls: {
    position: 'absolute', right: 12, top: 110,
    gap: 10,
  },
  mapControlBtn: {
    backgroundColor: 'rgba(5, 10, 20, 0.9)',
    borderWidth: 1.5, borderColor: DESIGN_TOKENS.colors.glassBorder,
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 12,
    width: 60,
    gap: 4,
    shadowColor: DESIGN_TOKENS.colors.neonCyan,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  mapControlIcon: { fontSize: 18 },
  controlBtnLabel: {
    fontSize: 7,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.5,
    textAlign: 'center',
  },

  // Mini Preview Card
  miniCardWrap: {
    position: 'absolute', bottom: 90, left: 12, right: 12, zIndex: 15,
  },
  miniCard: {
    backgroundColor: 'rgba(5, 10, 20, 0.9)',
  },
  miniCardRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  miniSevDot: {
    width: 8, height: 8, borderRadius: 4,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 6,
  },
  miniCardInfo: { flex: 1 },
  miniCardTitle: { fontSize: 13, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },
  miniCardSub: { fontSize: 9, color: DESIGN_TOKENS.colors.textSecondary, marginTop: 3, letterSpacing: 0.2 },
  miniSevBadge: {
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: DESIGN_TOKENS.radius.xs,
    borderWidth: 1,
  },
  miniSevText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  miniCardActions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  miniActionBtn: { flex: 2, borderRadius: DESIGN_TOKENS.radius.sm, overflow: 'hidden' },
  miniActionGrad: { paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  miniActionText: { fontSize: 10, fontWeight: '900', color: '#fff', letterSpacing: 1 },
  miniActionBtnOutline: {
    flex: 1, paddingVertical: 12, alignItems: 'center', justifyContent: 'center',
    borderRadius: DESIGN_TOKENS.radius.sm,
    borderWidth: 1, borderColor: DESIGN_TOKENS.colors.glassBorder,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  miniActionTextOutline: { fontSize: 10, fontWeight: '800', color: DESIGN_TOKENS.colors.textSecondary, letterSpacing: 0.5 },

  // FAB
  fabWrap: { position: 'absolute', bottom: 92, right: 16, zIndex: 20 },
  fabOuter: {
    borderRadius: DESIGN_TOKENS.radius.full, overflow: 'hidden',
    shadowColor: DESIGN_TOKENS.colors.neonRed,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 20, elevation: 16,
  },
  fab: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center',
  },
  fabEmoji: { fontSize: 22 },
  fabLabel: { fontSize: 8, fontWeight: '900', color: '#fff', letterSpacing: 1.5, marginTop: 1 },
});

