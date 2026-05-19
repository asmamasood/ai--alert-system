import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import { AnimatedView, useAnimatedStyle as useSafeAnimatedStyle } from '../../utils/reanimatedHelpers';
import { DESIGN_TOKENS } from '../../constants/mapThemes';

interface AIConfidenceBarProps {
  confidence: number; // 0–100
  color?: string;
  label?: string;
  showPercentage?: boolean;
}

export const AIConfidenceBar: React.FC<AIConfidenceBarProps> = ({
  confidence,
  color = DESIGN_TOKENS.colors.neonCyan,
  label = 'AI Confidence',
  showPercentage = true,
}) => {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(confidence, {
      duration: 1200,
      easing: Easing.out(Easing.exp),
    });
  }, [confidence]);

  const barStyle = useSafeAnimatedStyle(() => ({
    width: `${width.value}%` as any,
  }));

  const barColor =
    confidence >= 85 ? DESIGN_TOKENS.colors.neonGreen :
    confidence >= 65 ? DESIGN_TOKENS.colors.neonCyan :
    confidence >= 45 ? DESIGN_TOKENS.colors.neonAmber :
    DESIGN_TOKENS.colors.neonRed;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        {showPercentage && (
          <Text style={[styles.percent, { color: barColor }]}>{confidence}%</Text>
        )}
      </View>
      <View style={styles.track}>
        <AnimatedView
          style={[
            styles.fill,
            barStyle,
            { backgroundColor: barColor, shadowColor: barColor },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 6 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: DESIGN_TOKENS.fontSize.xs,
    color: DESIGN_TOKENS.colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  percent: {
    fontSize: DESIGN_TOKENS.fontSize.sm,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
});
