import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, StatusBar, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSharedValue, withTiming, withRepeat, withSequence, Easing, withSpring } from 'react-native-reanimated';
import { AnimatedView, useAnimatedStyle as useSafeAnimatedStyle } from '../src/utils/reanimatedHelpers';
import { DESIGN_TOKENS } from '../src/constants/mapThemes';
import { BlurView } from 'expo-blur';
import { RevolvingGlobe } from '../src/components/ui/RevolvingGlobe';
import { NeuralNetworkGrid } from '../src/components/ui/NeuralNetworkGrid';
import { GlassCard } from '../src/components/ui/GlassCard';

const { width: W, height: H } = Dimensions.get('window');

const BOOT_LOGS = [
  'Establishing secure satellite link...',
  'Synchronizing neural mesh net...',
  'Resolving municipal GIS coordinates...',
  'Deploying AI predictive spread models...',
  'Initializing cognitive sector scan...',
  'VIGIL DISASTER OS ONLINE.',
];

interface NodeHUDProps {
  top: any;
  left: any;
  color: string;
  icon: string;
  label: string;
  pulseScale: any;
}

const NodeHUD: React.FC<NodeHUDProps> = ({ top, left, color, icon, label, pulseScale }) => {
  const animatedRingStyle = useSafeAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: 1 - (pulseScale.value - 1) * 2.8,
  }));

  return (
    <View style={[styles.hudContainer, { top, left }]}>
      {/* Expanding shockwave ripple */}
      <AnimatedView style={[styles.hudPulseRing, { borderColor: color }, animatedRingStyle]} />

      {/* Dashed outer scanner circle */}
      <View style={[styles.hudDashedRing, { borderColor: color + '30' }]} />

      {/* Concentric tick ring */}
      <View style={[styles.hudTickRing, { borderColor: color + '50' }]}>
        <View style={[styles.hudTick, { top: -2, left: '50%', width: 1, height: 5, backgroundColor: color }]} />
        <View style={[styles.hudTick, { bottom: -2, left: '50%', width: 1, height: 5, backgroundColor: color }]} />
        <View style={[styles.hudTick, { left: -2, top: '50%', width: 5, height: 1, backgroundColor: color }]} />
        <View style={[styles.hudTick, { right: -2, top: '50%', width: 5, height: 1, backgroundColor: color }]} />
      </View>

      {/* Main Glass Center Node */}
      <View style={[styles.hudCenterNode, { borderColor: color, shadowColor: color }]}>
        <Text style={styles.hudNodeIcon}>{icon}</Text>
        <View style={[styles.hudBadge, { backgroundColor: 'rgba(5, 10, 20, 0.95)', borderColor: color }]}>
          <Text style={[styles.hudBadgeText, { color }]}>{label}</Text>
        </View>
      </View>
    </View>
  );
};

export default function EntryScreen() {
  const router = useRouter();
  const [percent, setPercent] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [step, setStep] = useState<'splash' | 'onboarding'>('splash');
  const [logIndex, setLogIndex] = useState(0);
  const [diagnosticVal, setDiagnosticVal] = useState(482.91);

  // Dynamic system telemetry simulation
  useEffect(() => {
    if (step === 'splash') {
      const interval = setInterval(() => {
        setDiagnosticVal(parseFloat((350 + Math.random() * 300).toFixed(2)));
      }, 400);
      return () => clearInterval(interval);
    }
  }, [step]);

  // Loading animation simulation
  useEffect(() => {
    if (step === 'splash') {
      const interval = setInterval(() => {
        setPercent((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsLoaded(true);
            setTimeout(() => {
              setStep('onboarding');
            }, 1200);
            return 100;
          }
          const increment = Math.floor(Math.random() * 10) + 4;
          return Math.min(prev + increment, 100);
        });
      }, 180);
      return () => clearInterval(interval);
    }
  }, [step]);

  // Rotate log indexing
  useEffect(() => {
    if (step === 'splash' && percent < 100) {
      const interval = setInterval(() => {
        setLogIndex((prev) => (prev + 1) % BOOT_LOGS.length);
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [step, percent]);

  // Cyber sweep scanline & pulse animations
  const ringScale = useSharedValue(1);
  const ringOpacity = useSharedValue(0.7);
  const scanLineY = useSharedValue(0);
  const globePulse = useSharedValue(1);
  const nodePulse = useSharedValue(1);

  useEffect(() => {
    ringScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.0, { duration: 1600, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    
    ringOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1600 }),
        withTiming(0.3, { duration: 1600 })
      ),
      -1,
      true
    );

    // Continuous top-to-bottom scanline sweep
    scanLineY.value = withRepeat(
      withTiming(H, { duration: 4000, easing: Easing.linear }),
      -1,
      false
    );

    // Globe breathing pulse
    globePulse.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.95, { duration: 1000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );

    // Live holographic HUD node expanding pulse
    nodePulse.value = withRepeat(
      withTiming(1.35, { duration: 1800, easing: Easing.out(Easing.ease) }),
      -1,
      false
    );
  }, []);

  const animatedRingStyle = useSafeAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  const animatedScanLineStyle = useSafeAnimatedStyle(() => ({
    transform: [{ translateY: scanLineY.value - H / 2 }],
  }));

  const animatedGlobeStyle = useSafeAnimatedStyle(() => ({
    transform: [{ scale: globePulse.value }],
  }));

  if (step === 'splash') {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor="#050A14" />
        
        {/* Holographic Matrix Grid Background */}
        <View style={styles.gridOverlay} />
        
        {/* Sweeping Laser Scan Line */}
        <AnimatedView style={[styles.scanLine, animatedScanLineStyle]} />

        <View style={styles.splashContent}>
          {/* Top telemetry specs */}
          <View style={styles.telemetryHeader}>
            <Text style={styles.telemetryText}>SYSTEM: RESQ_AI_OS_V4.9</Text>
            <Text style={styles.telemetryText}>LOC: CENTRAL_COMMAND_GRID</Text>
          </View>

          {/* Logo Brand Title with holographic glow chromatic aberration */}
          <View style={styles.logoContainer}>
            <View style={styles.hologramWrap}>
              <Text style={[styles.splashBrand, { opacity: 0.16, position: 'absolute', top: -1, left: -2, color: DESIGN_TOKENS.colors.neonCyan }]}>RESQ AI</Text>
              <Text style={[styles.splashBrand, { opacity: 0.16, position: 'absolute', top: 1, left: 2, color: DESIGN_TOKENS.colors.neonRed }]}>RESQ AI</Text>
              <Text style={styles.splashBrand}>RESQ AI</Text>
            </View>
            <Text style={styles.splashSubtitle}>TACTICAL DISASTER OPERATING INTERFACE</Text>
          </View>

          {/* Futuristic Globe Scan Sphere */}
          <View style={styles.globeContainer}>
            <AnimatedView style={[styles.glowRing, animatedRingStyle]} />
            <RevolvingGlobe size={210} />
          </View>

          {/* Live system boot logger */}
          <BlurView intensity={22} tint="dark" style={styles.logConsole}>
            <View style={styles.consoleHeader}>
              <View style={styles.consoleStatusDot} />
              <Text style={styles.consoleTitle}>SECURE COMMAND TERMINAL</Text>
            </View>
            <View style={styles.consoleBody}>
              <Text style={styles.consoleText}>&gt; {BOOT_LOGS[logIndex]}</Text>
              <Text style={styles.consoleSubText}>
                NET_GRID: {percent}%  •  CORE_TEMP: 34°C  •  SYNAPSE: {diagnosticVal} MHz
              </Text>
              <Text style={styles.consoleSubText}>
                LINK_STAT: ACTIVE [SYNC_OK]  •  CPU_GRID: [████████░░]
              </Text>
            </View>
          </BlurView>

          {/* Core initializing progress bar */}
          <View style={styles.loadingWrap}>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBarFill, { width: `${percent}%` }]} />
            </View>
            <View style={styles.progressLabelRow}>
              <Text style={styles.loadingText}>INITIALIZING SYSTEM CORES...</Text>
              <Text style={styles.percentageText}>{percent}%</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // Onboarding Screen (Futuristic cyber OS presentation)
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#050A14" />
      <View style={styles.gridOverlay} />
      
      {/* Background Holographic revolving world watermark */}
      <View style={styles.bgGlobeContainer} pointerEvents="none">
        <RevolvingGlobe size={440} />
      </View>
      
      <AnimatedView style={[styles.scanLine, animatedScanLineStyle]} />

      <SafeAreaViewCover>
        <View style={[styles.onboardingContainer, { zIndex: 10 }]}>
          <View style={styles.onboardingHeader}>
            <GlassCard intensity={30} borderColor="rgba(0, 229, 255, 0.16)" animateFloat={true} style={styles.headerGlass}>
              <View style={styles.osBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.osBadgeText}>COGNITIVE DEFENSE IN EFFECT</Text>
              </View>
              <Text style={styles.onboardingTitle}>AUTONOMOUS</Text>
              <Text style={styles.onboardingTitleBlue}>DISASTER INTELLIGENCE.</Text>
              <Text style={styles.onboardingDesc}>
                Real-time multi-layered battlefield telemetry, AI risk analysis, and high-fidelity rescue drone dispatch maps.
              </Text>
            </GlassCard>
          </View>

          {/* Holographic Tactical Node Grid Network visualization */}
          <View style={styles.visualGrid}>
            {/* Underlying 3D grid squares mesh lines */}
            <View style={styles.gridLinesContainer} pointerEvents="none">
              {Array.from({ length: 9 }).map((_, i) => (
                <View key={`h-${i}`} style={[styles.gridLineH, { top: `${(i + 1) * 10}%` }]} />
              ))}
              {Array.from({ length: 9 }).map((_, i) => (
                <View key={`v-${i}`} style={[styles.gridLineV, { left: `${(i + 1) * 10}%` }]} />
              ))}
            </View>

            {/* Fully animated neural network synaptical mapping layer */}
            <NeuralNetworkGrid />

            {/* Node HUDs matching isometric layout reference exactly */}
            <NodeHUD
              top="22%"
              left="22%"
              color={DESIGN_TOKENS.colors.neonRed}
              icon="⚠️"
              label="CRITICAL"
              pulseScale={nodePulse}
            />
            <NodeHUD
              top="50%"
              left="72%"
              color={DESIGN_TOKENS.colors.neonOrange}
              icon="🔥"
              label="HIGH RISK"
              pulseScale={nodePulse}
            />
            <NodeHUD
              top="75%"
              left="28%"
              color={DESIGN_TOKENS.colors.neonCyan}
              icon="🌊"
              label="MONITORED"
              pulseScale={nodePulse}
            />
          </View>

          {/* Glassmorphic Footer Console Controls */}
          <BlurView intensity={20} tint="dark" style={styles.onboardingFooter}>
            <Pressable onPress={() => router.replace('/(auth)/login')} style={styles.skipBtnWrap}>
              <Text style={styles.skipBtn}>BYPASS</Text>
            </Pressable>

            {/* Tactical dot selectors */}
            <View style={styles.dotsRow}>
              <View style={[styles.dot, styles.dotActive]} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>

            <Pressable style={styles.nextBtnWrap} onPress={() => router.replace('/(auth)/login')}>
              <LinearGradient
                colors={['#FF1744', '#7C3AED']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.nextBtnGrad}
              >
                <Text style={styles.nextBtnText}>ENGAGE OS</Text>
              </LinearGradient>
            </Pressable>
          </BlurView>
        </View>
      </SafeAreaViewCover>
    </View>
  );
}

// Simple platform-safe cover wrapper
const SafeAreaViewCover = ({ children }: { children: React.ReactNode }) => (
  <View style={{ flex: 1, paddingTop: Platform.OS === 'ios' ? 44 : 20, paddingBottom: 24 }}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050A14' },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.08,
    borderWidth: 0.5,
    borderColor: DESIGN_TOKENS.colors.neonCyan,
    backgroundColor: '#050A14',
    // Cyberpunk pattern texture simulated with borders
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(0, 229, 255, 0.4)',
    shadowColor: DESIGN_TOKENS.colors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    zIndex: 10,
  },
  telemetryHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    opacity: 0.6,
  },
  telemetryText: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: DESIGN_TOKENS.colors.neonCyan,
    letterSpacing: 1,
  },
  splashContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 48,
  },
  logoContainer: {
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
  },
  splashBrand: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 12,
    textShadowColor: DESIGN_TOKENS.colors.neonRed,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  splashSubtitle: {
    fontSize: 9,
    fontWeight: '800',
    color: DESIGN_TOKENS.colors.neonCyan,
    letterSpacing: 2.5,
  },
  globeContainer: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 20,
  },
  glowRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: DESIGN_TOKENS.colors.neonCyan,
    shadowColor: DESIGN_TOKENS.colors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 20,
  },
  globeSphere: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(0, 229, 255, 0.04)',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 229, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  radarDot: {
    position: 'absolute',
    top: 30,
    right: 35,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: DESIGN_TOKENS.colors.neonRed,
    shadowColor: DESIGN_TOKENS.colors.neonRed,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  radarRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.1)',
    borderStyle: 'dashed',
  },
  globeIcon: { fontSize: 50 },
  logConsole: {
    width: '94%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: 'rgba(0,229,255,0.16)',
    backgroundColor: 'rgba(5, 10, 20, 0.78)',
  },
  consoleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderBottomWidth: 0.8,
    borderBottomColor: 'rgba(0,229,255,0.12)',
    paddingBottom: 6,
    marginBottom: 6,
  },
  consoleStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: DESIGN_TOKENS.colors.neonGreen,
    shadowColor: DESIGN_TOKENS.colors.neonGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  consoleTitle: {
    fontSize: 8,
    fontWeight: '800',
    color: DESIGN_TOKENS.colors.neonCyan,
    letterSpacing: 1.5,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  consoleBody: {
    alignItems: 'center',
    gap: 3,
  },
  consoleText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#fff',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    textAlign: 'center',
    letterSpacing: 0.8,
  },
  consoleSubText: {
    fontSize: 7.5,
    fontWeight: '500',
    color: DESIGN_TOKENS.colors.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    textAlign: 'center',
    letterSpacing: 0.5,
    lineHeight: 10,
  },
  hologramWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerGlass: {
    padding: 0,
    borderRadius: 18,
    overflow: 'hidden',
  },
  loadingWrap: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },
  progressLabelRow: {
    flexDirection: 'row',
    width: '92%',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  loadingText: {
    fontSize: 9,
    fontWeight: '800',
    color: DESIGN_TOKENS.colors.textMuted,
    letterSpacing: 1.5,
  },
  progressBarContainer: {
    width: '92%',
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(0, 229, 255, 0.15)',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: DESIGN_TOKENS.colors.neonCyan,
    shadowColor: DESIGN_TOKENS.colors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  percentageText: {
    fontSize: 11,
    color: DESIGN_TOKENS.colors.neonCyan,
    fontWeight: '900',
  },

  // Onboarding Screen
  onboardingContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  onboardingHeader: {
    marginTop: 20,
    gap: 6,
  },
  osBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,23,68,0.1)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,23,68,0.25)',
    marginBottom: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: DESIGN_TOKENS.colors.neonRed,
    marginRight: 6,
  },
  osBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: DESIGN_TOKENS.colors.neonRed,
    letterSpacing: 1.5,
  },
  onboardingTitle: {
    fontSize: 38,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
  },
  onboardingTitleBlue: {
    fontSize: 38,
    fontWeight: '900',
    color: DESIGN_TOKENS.colors.neonCyan,
    letterSpacing: 1,
    marginTop: -8,
  },
  onboardingDesc: {
    fontSize: 13,
    color: DESIGN_TOKENS.colors.textSecondary,
    lineHeight: 20,
    marginTop: 10,
  },
  visualGrid: {
    flex: 1,
    position: 'relative',
    marginVertical: 10,
    // PERFECT ISOMETRIC 3D PERSPECTIVE ANGLE
    transform: [
      { perspective: 1200 },
      { rotateX: '60deg' },
      { rotateZ: '-42deg' },
      { scale: 0.95 }
    ],
  },
  gridLinesContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
  },
  // Glowing tracks
  pathLineH: {
    position: 'absolute',
    height: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  pathLineV: {
    position: 'absolute',
    width: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  signalRelay: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
    marginLeft: -3,
    marginTop: -3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
  },
  // Concentric HUD node styling
  hudContainer: {
    position: 'absolute',
    width: 100,
    height: 100,
    marginLeft: -50,
    marginTop: -50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hudPulseRing: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1.5,
  },
  hudDashedRing: {
    position: 'absolute',
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  hudTickRing: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 0.8,
  },
  hudTick: {
    position: 'absolute',
  },
  hudCenterNode: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    backgroundColor: 'rgba(5, 10, 20, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  hudNodeIcon: {
    fontSize: 16,
  },
  hudBadge: {
    position: 'absolute',
    bottom: -15,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
    borderWidth: 1,
    backgroundColor: 'rgba(5,10,20,0.95)',
  },
  hudBadgeText: {
    fontSize: 6,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  onboardingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.glassBorder,
    backgroundColor: 'rgba(8,12,20,0.6)',
    shadowColor: DESIGN_TOKENS.colors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  skipBtnWrap: {
    padding: 8,
  },
  skipBtn: {
    fontSize: 10,
    fontWeight: '900',
    color: DESIGN_TOKENS.colors.textMuted,
    letterSpacing: 1.5,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dotActive: {
    backgroundColor: DESIGN_TOKENS.colors.neonCyan,
    width: 16,
  },
  nextBtnWrap: {
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: DESIGN_TOKENS.colors.neonRed,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },
  nextBtnGrad: {
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  nextBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1.5,
  },
  bgGlobeContainer: {
    position: 'absolute',
    top: '32%',
    left: '-24%',
    opacity: 0.14,
    zIndex: 1,
  },
});

