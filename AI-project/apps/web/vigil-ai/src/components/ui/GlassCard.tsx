import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSharedValue, withRepeat, withSequence, withTiming, Easing } from 'react-native-reanimated';
import { AnimatedView, useAnimatedStyle as useSafeAnimatedStyle } from '../../utils/reanimatedHelpers';
import { DESIGN_TOKENS } from '../../constants/mapThemes';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  borderColor?: string;
  noBorder?: boolean;
  animateFloat?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity = 24,
  borderColor = DESIGN_TOKENS.colors.glassBorder,
  noBorder = false,
  animateFloat = true,
}) => {
  const floatVal = useSharedValue(0);

  useEffect(() => {
    if (animateFloat) {
      floatVal.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    }
  }, [animateFloat]);

  const animatedStyle = useSafeAnimatedStyle(() => {
    if (!animateFloat) return {};
    return {
      transform: [
        {
          translateY: floatVal.value * -6, // Gentle bobbing motion
        },
      ],
      shadowOpacity: 0.2 + floatVal.value * 0.1,
    };
  });

  return (
    <AnimatedView style={[styles.container, animatedStyle, style]}>
      <BlurView intensity={intensity} tint="dark" style={styles.blur}>
        <View
          style={[
            styles.inner,
            !noBorder && { borderColor, borderWidth: 1 },
          ]}
        >
          {/* Subtle neon corner ticks for cyberpunk grid OS look */}
          {!noBorder && (
            <>
              <View style={[styles.cornerTick, { top: 0, left: 0, borderTopWidth: 2, borderLeftWidth: 2, borderColor }]} />
              <View style={[styles.cornerTick, { top: 0, right: 0, borderTopWidth: 2, borderRightWidth: 2, borderColor }]} />
              <View style={[styles.cornerTick, { bottom: 0, left: 0, borderBottomWidth: 2, borderLeftWidth: 2, borderColor }]} />
              <View style={[styles.cornerTick, { bottom: 0, right: 0, borderBottomWidth: 2, borderRightWidth: 2, borderColor }]} />
            </>
          )}
          {children}
        </View>
      </BlurView>
    </AnimatedView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: DESIGN_TOKENS.borderRadius.lg,
    overflow: 'hidden',
    shadowColor: DESIGN_TOKENS.colors.neonCyan,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 8,
  },
  blur: {
    flex: 1,
  },
  inner: {
    backgroundColor: 'rgba(8, 16, 28, 0.65)',
    borderRadius: DESIGN_TOKENS.borderRadius.lg,
    padding: DESIGN_TOKENS.spacing.md,
    flex: 1,
    position: 'relative',
  },
  cornerTick: {
    position: 'absolute',
    width: 6,
    height: 6,
    opacity: 0.8,
  },
});

