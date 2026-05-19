import React, { useEffect } from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, ActivityIndicator, View } from 'react-native';
import {
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { AnimatedView, useAnimatedStyle as useSafeAnimatedStyle } from '../../utils/reanimatedHelpers';
import { DESIGN_TOKENS } from '../../constants/mapThemes';

interface NeonButtonProps {
  label: string;
  onPress: () => void;
  color?: string;
  style?: ViewStyle;
  loading?: boolean;
  icon?: React.ReactNode;
  variant?: 'solid' | 'outline' | 'ghost';
  disabled?: boolean;
}

export const NeonButton: React.FC<NeonButtonProps> = ({
  label,
  onPress,
  color = DESIGN_TOKENS.colors.neonCyan,
  style,
  loading = false,
  icon,
  variant = 'solid',
  disabled = false,
}) => {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0.4);
  const coreScale = useSharedValue(1);

  useEffect(() => {
    // Pulse outline glow
    glow.value = withRepeat(
      withSequence(
        withTiming(0.9, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Pulse core energy
    coreScale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.9, { duration: 800, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, []);

  const buttonStyle = useSafeAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: glow.value,
  }));

  const coreAnimStyle = useSafeAnimatedStyle(() => ({
    transform: [{ scale: coreScale.value }],
    opacity: glow.value + 0.1,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92, { damping: 10, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 200 });
  };

  const isSolid = variant === 'solid';
  const isOutline = variant === 'outline';

  const bgColor = isSolid ? 'rgba(0, 229, 255, 0.08)' : 'transparent';
  const borderColor = variant !== 'ghost' ? color : 'transparent';

  return (
    <AnimatedView
      style={[
        styles.wrapper,
        buttonStyle,
        !disabled && { shadowColor: color },
        style,
      ]}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        disabled={disabled || loading}
        style={[
          styles.button,
          {
            backgroundColor: bgColor,
            borderColor,
            opacity: disabled ? 0.4 : 1,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={color} size="small" />
        ) : (
          <View style={styles.content}>
            {/* Cyberpunk Energy Core */}
            {isSolid && (
              <AnimatedView
                style={[
                  styles.energyCore,
                  coreAnimStyle,
                  { backgroundColor: color, shadowColor: color },
                ]}
              />
            )}

            {icon && <View style={styles.iconContainer}>{icon}</View>}
            <Text style={[styles.label, { color, textShadowColor: color }]}>
              {label.toUpperCase()}
            </Text>
          </View>
        )}
      </Pressable>
    </AnimatedView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: DESIGN_TOKENS.borderRadius.md,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    elevation: 6,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: DESIGN_TOKENS.borderRadius.md,
    borderWidth: 1.5,
    position: 'relative',
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  energyCore: {
    width: 6,
    height: 6,
    borderRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
  },
  iconContainer: {
    marginRight: -2,
  },
  label: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
});

