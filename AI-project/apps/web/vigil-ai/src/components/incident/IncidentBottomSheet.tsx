import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  Dimensions, Image, Platform,
} from 'react-native';
import { useSharedValue, withSpring, withTiming, withRepeat, withSequence, Easing } from 'react-native-reanimated';
import { AnimatedView, useAnimatedStyle as useSafeAnimatedStyle } from '../../utils/reanimatedHelpers';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Incident } from '../../types/incident.types';
import { DESIGN_TOKENS, SEVERITY_STYLE } from '../../constants/mapThemes';
import { formatTimestamp } from '../../utils/severity';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.76;

interface IncidentBottomSheetProps {
  incident: Incident;
  onClose: () => void;
}

export const IncidentBottomSheet: React.FC<IncidentBottomSheetProps> = ({ incident, onClose }) => {
  const translateY = useSharedValue(SHEET_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  const scanLineY = useSharedValue(-90);
  const [activeTab, setActiveTab] = useState<'details' | 'updates'>('details');

  // Intelligent AI Scanning console text simulation
  const [aiLog, setAiLog] = useState('INITIATING RISK ASSESSMENT CORES...');
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    // Console spring slide up & focus backdrop dimming
    translateY.value = withSpring(0, { damping: 20, stiffness: 100 });
    backdropOpacity.value = withTiming(0.7, { duration: 300 });

    // Animate scanline laser continuously
    scanLineY.value = withRepeat(
      withTiming(90, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    // AI Log sequence
    const logs = [
      'ANALYZING HAZARD GRID INTERSECTION...',
      'EVALUATING THERMAL RADIUS CHANNELS...',
      'CROSS-REFERENCING INCIDENT METRICS...',
      'CALCULATING BEHAVIOR CASCADE PROFILES...',
      `OS RISK LEVEL VERIFIED: CONFIDENCE ${incident.confidence}%`
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < logs.length) {
        setAiLog(logs[currentStep]);
        currentStep++;
      } else {
        setIsScanning(false);
        clearInterval(interval);
      }
    }, 600);

    return () => clearInterval(interval);
  }, [incident]);

  const sheetStyle = useSafeAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useSafeAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const animatedScanLineStyle = useSafeAnimatedStyle(() => ({
    transform: [{ translateY: scanLineY.value }],
  }));

  const handleClose = () => {
    translateY.value = withTiming(SHEET_HEIGHT, { duration: 250 });
    backdropOpacity.value = withTiming(0, { duration: 250 });
    setTimeout(onClose, 250);
  };

  const sev = SEVERITY_STYLE[incident.severity] || SEVERITY_STYLE.medium;

  // Segmented AI energy bar elements
  const segments = Array.from({ length: 10 });
  const filledCount = Math.round(incident.confidence / 10);

  return (
    <View style={styles.overlay}>
      {/* Background Focus Dimming */}
      <AnimatedView style={[styles.backdrop, backdropStyle]} pointerEvents="auto">
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
      </AnimatedView>
      
      <AnimatedView style={[styles.sheet, sheetStyle]}>
        <BlurView intensity={35} tint="dark" style={styles.blurContainer}>
          
          {/* Bezel grab bar / HUD detail */}
          <View style={styles.grabBarRow}>
            <View style={styles.grabBar} />
          </View>

          {/* Close console button */}
          <View style={styles.header}>
            <Pressable onPress={handleClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            
            {/* Holographic Media preview window */}
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: incident.media[0]?.uri || 'https://images.unsplash.com/photo-1547683905-f686c993aae5?q=80&w=600' }} 
                style={styles.previewImage} 
                resizeMode="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(8,12,20,0.96)']}
                style={styles.imageOverlay}
              />
              {/* Vertical Sweep Holographic Laser Line */}
              <AnimatedView style={[styles.imageScanLaser, animatedScanLineStyle, { backgroundColor: sev.glow }]} />
              <View style={styles.imageOverlayCoords}>
                <Text style={styles.coordsText}>LIDAR FEED SCANNING...</Text>
                <Text style={styles.coordsText}>LAT: {incident.location.latitude.toFixed(4)}  LNG: {incident.location.longitude.toFixed(4)}</Text>
              </View>
            </View>

            {/* Info Summary Panel */}
            <View style={styles.infoPanel}>
              <View style={styles.titleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.mainTitle} numberOfLines={1}>{incident.title.toUpperCase()}</Text>
                  <Text style={styles.timeSub}>{formatTimestamp(incident.timestamp).toUpperCase()}</Text>
                </View>
                <View style={[styles.sevBadge, { backgroundColor: sev.badgeBg, borderColor: sev.border }]}>
                  <Text style={[styles.sevText, { color: sev.text }]}>{sev.label}</Text>
                </View>
              </View>

              {/* Holographic AI Status Console */}
              <View style={[styles.aiScanBox, { borderColor: isScanning ? DESIGN_TOKENS.colors.neonCyan : sev.border }]}>
                <View style={styles.aiScanHeader}>
                  <View style={[styles.glowDot, { backgroundColor: isScanning ? DESIGN_TOKENS.colors.neonCyan : sev.dot }]} />
                  <Text style={styles.aiScanTitle}>{isScanning ? 'INTELLIGENT SECTOR DISCOVERY' : 'COGNITIVE ASSESSMENT MATRIX'}</Text>
                </View>
                <Text style={styles.aiScanLog}>&gt; {aiLog}</Text>
              </View>

              {/* Navigation Tabs */}
              <View style={styles.tabsRow}>
                <Pressable onPress={() => setActiveTab('details')} style={styles.tabItem}>
                  <Text style={[styles.tabText, activeTab === 'details' && styles.tabTextActive]}>TELEMETRY</Text>
                  {activeTab === 'details' && <View style={[styles.tabIndicator, { backgroundColor: sev.border }]} />}
                </Pressable>
                <Pressable onPress={() => setActiveTab('updates')} style={styles.tabItem}>
                  <Text style={[styles.tabText, activeTab === 'updates' && styles.tabTextActive]}>LOG DETAILS</Text>
                  {activeTab === 'updates' && <View style={[styles.tabIndicator, { backgroundColor: sev.border }]} />}
                </Pressable>
              </View>

              {/* Details Content */}
              {activeTab === 'details' ? (
                <View style={styles.detailsContent}>
                  
                  {/* Segmented AI Confidence Bar */}
                  <View style={styles.dataRow}>
                    <View style={styles.confidenceLabelRow}>
                      <Text style={styles.dataLabel}>AI Confidence</Text>
                      <Text style={[styles.confidenceValue, { color: sev.text }]}>{incident.confidence}%</Text>
                    </View>
                    <View style={styles.segmentedConfidenceTrack}>
                      {segments.map((_, idx) => (
                        <View
                          key={idx}
                          style={[
                            styles.segmentFill,
                            {
                              backgroundColor: idx < filledCount 
                                ? sev.border 
                                : 'rgba(255,255,255,0.06)'
                            }
                          ]}
                        />
                      ))}
                    </View>
                  </View>

                  {/* Operational stats cells */}
                  <View style={styles.gridStats}>
                    <View style={styles.statCell}>
                      <Text style={styles.cellLabel}>Spread Prediction</Text>
                      <Text style={[styles.cellValue, { color: DESIGN_TOKENS.colors.neonCyan }]}>
                        +{incident.aiAnalysis?.spreadPrediction || '1.4'} KM/H
                      </Text>
                    </View>
                    <View style={styles.statCell}>
                      <Text style={styles.cellLabel}>Impact Radius</Text>
                      <Text style={[styles.cellValue, { color: DESIGN_TOKENS.colors.neonOrange }]}>
                        {incident.radius ? (incident.radius / 1000).toFixed(1) : '2.0'} KM
                      </Text>
                    </View>
                  </View>

                  <View style={styles.rowDivider} />

                  {/* Dispatch stats */}
                  <View style={styles.reporterRow}>
                    <Text style={styles.dataLabel}>Dispatched Nodes</Text>
                    <View style={styles.userBadge}>
                      <View style={[styles.miniAvatar, { backgroundColor: sev.border }]}>
                        <Text style={styles.miniAvatarText}>OS</Text>
                      </View>
                      <Text style={styles.userName}>Sector Drone {incident.id}</Text>
                    </View>
                  </View>

                  {/* Status Indicator */}
                  <View style={styles.reporterRow}>
                    <Text style={styles.dataLabel}>Response Status</Text>
                    <Text style={[styles.statusTextGreen, { color: sev.text }]}>
                      {incident.rescueStatus ? incident.rescueStatus.toUpperCase() : 'PENDING EVAL'}
                    </Text>
                  </View>

                </View>
              ) : (
                <View style={styles.detailsContent}>
                  <Text style={styles.updateDesc}>
                    {incident.description || 'Monitoring neural sensor array nodes. Central dispatcher command routing active.'}
                  </Text>
                  <View style={styles.gridStats}>
                    <View style={styles.statCell}>
                      <Text style={styles.cellLabel}>Affected Population</Text>
                      <Text style={styles.cellValue}>{incident.affectedCount || 150} citizens</Text>
                    </View>
                    <View style={styles.statCell}>
                      <Text style={styles.cellLabel}>Signal Strengths</Text>
                      <Text style={[styles.cellValue, { color: DESIGN_TOKENS.colors.neonGreen }]}>98.4% DECIBELS</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* Futuristic command responses */}
            <View style={styles.sheetActions}>
              <Pressable style={styles.actionNavBtn} onPress={() => {}}>
                <LinearGradient
                  colors={[sev.border, '#7C3AED']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.actionNavGrad}
                >
                  <Text style={styles.actionNavText}>ENGAGE TACTICAL RESPONDERS</Text>
                </LinearGradient>
              </Pressable>
              
              <Pressable style={styles.actionShareBtn} onPress={handleClose}>
                <Text style={styles.actionShareText}>BYPASS NODE</Text>
              </Pressable>
            </View>

            <View style={{ height: 34 }} />
          </ScrollView>
        </BlurView>
      </AnimatedView>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 100, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000' },
  sheet: {
    height: SHEET_HEIGHT,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    borderTopWidth: 2,
    borderTopColor: DESIGN_TOKENS.colors.glassBorder,
    shadowColor: DESIGN_TOKENS.colors.neonCyan,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 20,
  },
  blurContainer: { flex: 1, backgroundColor: 'rgba(5, 10, 20, 0.95)' },
  grabBarRow: {
    alignItems: 'center',
    paddingTop: 8,
  },
  grabBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  header: {
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  closeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  scroll: { flexGrow: 1 },
  imageContainer: {
    width: '100%',
    height: 160,
    position: 'relative',
    backgroundColor: DESIGN_TOKENS.colors.backgroundAlt,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  imageScanLaser: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  imageOverlayCoords: {
    position: 'absolute',
    bottom: 8,
    left: 18,
    gap: 3,
  },
  coordsText: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.8,
  },
  infoPanel: {
    paddingHorizontal: 18,
    marginTop: -8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  mainTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
  },
  timeSub: {
    fontSize: 10,
    color: DESIGN_TOKENS.colors.textMuted,
    marginTop: 4,
    fontWeight: '800',
    letterSpacing: 1,
  },
  sevBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: DESIGN_TOKENS.radius.sm,
    borderWidth: 1,
  },
  sevText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  aiScanBox: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.02)',
    marginBottom: 18,
    gap: 6,
  },
  aiScanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  glowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  aiScanTitle: {
    fontSize: 8,
    fontWeight: '900',
    color: DESIGN_TOKENS.colors.textSecondary,
    letterSpacing: 1.5,
  },
  aiScanLog: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#fff',
    opacity: 0.85,
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    marginBottom: 16,
  },
  tabItem: {
    marginRight: 24,
    paddingBottom: 8,
    position: 'relative',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '900',
    color: DESIGN_TOKENS.colors.textMuted,
    letterSpacing: 1.5,
  },
  tabTextActive: {
    color: '#fff',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  detailsContent: {
    gap: 16,
  },
  dataRow: {
    gap: 8,
  },
  confidenceLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dataLabel: {
    fontSize: 11,
    color: DESIGN_TOKENS.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '800',
  },
  segmentedConfidenceTrack: {
    flexDirection: 'row',
    gap: 4,
    height: 8,
    width: '100%',
  },
  segmentFill: {
    flex: 1,
    borderRadius: 1,
  },
  confidenceValue: {
    fontSize: 13,
    fontWeight: '900',
    width: 40,
    textAlign: 'right',
  },
  gridStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statCell: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: DESIGN_TOKENS.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    padding: 12,
    gap: 4,
  },
  cellLabel: {
    fontSize: 9,
    color: DESIGN_TOKENS.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '700',
  },
  cellValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#fff',
  },
  rowDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  reporterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  miniAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniAvatarText: {
    fontSize: 9,
    color: '#fff',
    fontWeight: '900',
  },
  userName: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '700',
  },
  statusTextGreen: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  updateDesc: {
    fontSize: 13,
    color: DESIGN_TOKENS.colors.textSecondary,
    lineHeight: 20,
  },
  sheetActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 18,
    marginTop: 24,
  },
  actionNavBtn: {
    flex: 2,
    borderRadius: DESIGN_TOKENS.radius.md,
    overflow: 'hidden',
    shadowColor: DESIGN_TOKENS.colors.neonRed,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  actionNavGrad: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionNavText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
  },
  actionShareBtn: {
    flex: 1,
    borderRadius: DESIGN_TOKENS.radius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  actionShareText: {
    fontSize: 11,
    fontWeight: '900',
    color: DESIGN_TOKENS.colors.textSecondary,
    letterSpacing: 1,
  },
});

