import React, { useEffect, memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSharedValue, withRepeat, withSequence, withTiming, withSpring, Easing } from 'react-native-reanimated';
import { AnimatedView, useAnimatedStyle as useSafeAnimatedStyle } from '../../utils/reanimatedHelpers';
import { Incident } from '../../types/incident.types';
import { getSeverityConfig } from '../../utils/severity';
import { EMERGENCY_CATEGORIES } from '../../constants/emergencyTypes';
import { DESIGN_TOKENS } from '../../constants/mapThemes';

interface IncidentMarkerProps {
  incident: Incident;
  onPress: (incident: Incident) => void;
}

const IncidentMarkerBase: React.FC<IncidentMarkerProps> = ({ incident, onPress }) => {
  const config = getSeverityConfig(incident.severity);
  const category = EMERGENCY_CATEGORIES.find((c) => c.id === incident.type);

  const isCritical = incident.severity === 'critical';
  const isHigh = incident.severity === 'high';
  const isMedium = incident.severity === 'medium';
  const isLow = incident.severity === 'low';

  // 1. Gravity drop animation when mounting
  const dropY = useSharedValue(-80);
  const dropOpacity = useSharedValue(0);

  // 2. Dual expanding ripple shockwaves
  const ripple1Scale = useSharedValue(0.8);
  const ripple1Opacity = useSharedValue(0.8);
  const ripple2Scale = useSharedValue(0.8);
  const ripple2Opacity = useSharedValue(0.8);

  // 3. AI Scan beam sweep overlay
  const scanSweep = useSharedValue(-15);

  // 4. Severity Tension shake (Critical heartbeat structural vibration)
  const shakeX = useSharedValue(0);
  const glowPulse = useSharedValue(1);

  useEffect(() => {
    // Trigger entry gravity drop
    dropY.value = withSpring(0, { damping: 10, stiffness: 120 });
    dropOpacity.value = withTiming(1, { duration: 400 });

    // Loop expanding ripple rings
    ripple1Scale.value = withRepeat(
      withTiming(1.8, { duration: 2000, easing: Easing.out(Easing.quad) }),
      -1,
      false
    );
    ripple1Opacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 0 }),
        withTiming(0, { duration: 2000, easing: Easing.out(Easing.linear) })
      ),
      -1,
      false
    );

    // Ripple 2 is delayed slightly
    setTimeout(() => {
      ripple2Scale.value = withRepeat(
        withTiming(1.8, { duration: 2000, easing: Easing.out(Easing.quad) }),
        -1,
        false
      );
      ripple2Opacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 0 }),
          withTiming(0, { duration: 2000, easing: Easing.out(Easing.linear) })
        ),
        -1,
        false
      );
    }, 1000);

    // AI Scanner reflection sweep
    scanSweep.value = withRepeat(
      withTiming(45, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    // Severity behavior
    if (isCritical) {
      // Heartbeat pulse + Tension shake
      glowPulse.value = withRepeat(
        withSequence(
          withTiming(1.22, { duration: 300, easing: Easing.out(Easing.sin) }),
          withTiming(1.0, { duration: 250, easing: Easing.in(Easing.sin) }),
          withTiming(1.15, { duration: 200, easing: Easing.out(Easing.sin) }),
          withTiming(1.0, { duration: 600, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      );
      shakeX.value = withRepeat(
        withSequence(
          withTiming(-1.5, { duration: 60 }),
          withTiming(1.5, { duration: 60 }),
          withTiming(0, { duration: 60 })
        ),
        -1,
        true
      );
    } else if (isHigh) {
      // Burning deep glow
      glowPulse.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 900, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.95, { duration: 900, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else if (isMedium) {
      // Soft scanning aura
      glowPulse.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
          withTiming(0.98, { duration: 1400, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        true
      );
    } else {
      // Calm static glow
      glowPulse.value = 1.0;
    }
  }, [incident.severity]);

  // Master container animated style (Gravity drop + shake)
  const containerStyle = useSafeAnimatedStyle(() => ({
    transform: [
      { translateY: dropY.value },
      { translateX: shakeX.value },
    ],
    opacity: dropOpacity.value,
  }));

  // Ripple animated styles
  const ripple1Style = useSafeAnimatedStyle(() => ({
    transform: [{ scale: ripple1Scale.value }],
    opacity: ripple1Opacity.value,
  }));

  const ripple2Style = useSafeAnimatedStyle(() => ({
    transform: [{ scale: ripple2Scale.value }],
    opacity: ripple2Opacity.value,
  }));

  // Glowing core style
  const coreStyle = useSafeAnimatedStyle(() => ({
    transform: [{ scale: glowPulse.value }],
  }));

  // Laser scanner overlay line
  const scanStyle = useSafeAnimatedStyle(() => ({
    transform: [{ translateX: scanSweep.value }],
  }));

  const markerSize = isCritical ? 46 : isHigh ? 40 : 34;
  const rippleSize = markerSize * 1.8;

  return (
    <AnimatedView style={[styles.container, containerStyle]}>
      {/* Dynamic expanding neon ripples */}
      {!isLow && (
        <>
          <AnimatedView
            style={[
              styles.ripple,
              ripple1Style,
              {
                width: rippleSize,
                height: rippleSize,
                borderRadius: rippleSize / 2,
                borderColor: config.color,
              },
            ]}
          />
          <AnimatedView
            style={[
              styles.ripple,
              ripple2Style,
              {
                width: rippleSize,
                height: rippleSize,
                borderRadius: rippleSize / 2,
                borderColor: config.color,
              },
            ]}
          />
        </>
      )}

      {/* Volumetric severity aura glow */}
      <AnimatedView
        style={[
          styles.marker,
          coreStyle,
          {
            width: markerSize,
            height: markerSize,
            borderRadius: markerSize / 2,
            backgroundColor: config.bgColor,
            borderColor: config.color,
            shadowColor: config.color,
          },
        ]}
      >
        {/* Futuristic scanbeam reflecting overlay */}
        <AnimatedView style={[styles.scanLineOverlay, scanStyle]} />

        {/* Tactical Category Icon */}
        <Text style={styles.icon}>{category?.icon ?? '⚠️'}</Text>
      </AnimatedView>

      {/* Cyber Pin Bezel */}
      <View style={[styles.pin, { backgroundColor: config.color, shadowColor: config.color }]} />
    </AnimatedView>
  );
};

export const IncidentMarker = memo(IncidentMarkerBase);

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', position: 'relative' },
  ripple: {
    position: 'absolute',
    borderWidth: 1.5,
    opacity: 0,
  },
  marker: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 14,
    elevation: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  scanLineOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    transform: [{ rotate: '25deg' }],
    opacity: 0.7,
  },
  icon: { fontSize: 16 },
  pin: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
});

