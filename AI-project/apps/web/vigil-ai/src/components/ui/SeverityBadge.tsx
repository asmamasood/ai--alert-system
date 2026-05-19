import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SeverityLevel } from '../../types/incident.types';
import { getSeverityConfig } from '../../utils/severity';
import { DESIGN_TOKENS } from '../../constants/mapThemes';

interface SeverityBadgeProps {
  severity: SeverityLevel;
  showDot?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  severity,
  showDot = true,
  size = 'md',
}) => {
  const config = getSeverityConfig(severity);
  const fontSize =
    size === 'sm'
      ? DESIGN_TOKENS.fontSize.xs
      : size === 'lg'
      ? DESIGN_TOKENS.fontSize.md
      : DESIGN_TOKENS.fontSize.sm;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bgColor,
          borderColor: config.color,
          shadowColor: config.color,
        },
      ]}
    >
      {showDot && (
        <View style={[styles.dot, { backgroundColor: config.color, shadowColor: config.color }]} />
      )}
      <Text style={[styles.label, { color: config.textColor, fontSize }]}>
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: DESIGN_TOKENS.borderRadius.full,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
    elevation: 4,
  },
  label: {
    fontWeight: '800',
    letterSpacing: 1.2,
  },
});
