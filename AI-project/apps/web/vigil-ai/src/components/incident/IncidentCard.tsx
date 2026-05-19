import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Incident } from '../../types/incident.types';
import { SeverityBadge } from '../ui/SeverityBadge';
import { GlassCard } from '../ui/GlassCard';
import { formatTimestamp, formatRadius, getSeverityConfig } from '../../utils/severity';
import { EMERGENCY_CATEGORIES } from '../../constants/emergencyTypes';
import { DESIGN_TOKENS } from '../../constants/mapThemes';

interface IncidentCardProps {
  incident: Incident;
  onPress: (incident: Incident) => void;
}

export const IncidentCard: React.FC<IncidentCardProps> = ({ incident, onPress }) => {
  const config = getSeverityConfig(incident.severity);
  const category = EMERGENCY_CATEGORIES.find((c) => c.id === incident.type);

  return (
    <Pressable onPress={() => onPress(incident)} style={styles.pressable}>
      <GlassCard
        style={[styles.card, { shadowColor: config.color }]}
        borderColor={config.color}
        intensity={15}
      >
        <View style={styles.row}>
          {/* Icon */}
          <View style={[styles.iconBox, { backgroundColor: config.bgColor, borderColor: config.color }]}>
            <Text style={styles.icon}>{category?.icon ?? '⚠️'}</Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.topRow}>
              <SeverityBadge severity={incident.severity} size="sm" />
              <Text style={styles.time}>{formatTimestamp(incident.timestamp)}</Text>
            </View>
            <Text style={styles.title} numberOfLines={1}>{incident.title}</Text>
            <Text style={styles.meta}>
              📍 {incident.location.latitude.toFixed(4)}, {incident.location.longitude.toFixed(4)}
              {incident.radius ? `  •  ${formatRadius(incident.radius)} zone` : ''}
            </Text>

            {/* AI Confidence */}
            <View style={styles.bottomRow}>
              <Text style={styles.confidence}>
                🧠 AI {incident.confidence}% confidence
              </Text>
              {incident.affectedCount && (
                <Text style={[styles.affected, { color: config.textColor }]}>
                  👥 {incident.affectedCount} affected
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Status bar */}
        <View style={[styles.statusBar, { backgroundColor: config.color }]}>
          <Text style={styles.statusText}>{incident.status.toUpperCase()}</Text>
          {incident.rescueStatus && (
            <Text style={styles.statusText}>{incident.rescueStatus.toUpperCase()}</Text>
          )}
        </View>
      </GlassCard>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressable: { marginBottom: DESIGN_TOKENS.spacing.sm },
  card: {
    padding: 0,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  row: {
    flexDirection: 'row',
    gap: DESIGN_TOKENS.spacing.sm,
    padding: DESIGN_TOKENS.spacing.md,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    flexShrink: 0,
  },
  icon: { fontSize: 22 },
  content: { flex: 1, gap: 4 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: {
    fontSize: DESIGN_TOKENS.fontSize.md,
    fontWeight: '700',
    color: DESIGN_TOKENS.colors.textPrimary,
    letterSpacing: 0.3,
  },
  meta: {
    fontSize: DESIGN_TOKENS.fontSize.xs,
    color: DESIGN_TOKENS.colors.textSecondary,
    letterSpacing: 0.3,
  },
  time: {
    fontSize: DESIGN_TOKENS.fontSize.xs,
    color: DESIGN_TOKENS.colors.textMuted,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  confidence: {
    fontSize: DESIGN_TOKENS.fontSize.xs,
    color: DESIGN_TOKENS.colors.neonCyan,
    fontWeight: '600',
  },
  affected: {
    fontSize: DESIGN_TOKENS.fontSize.xs,
    fontWeight: '600',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: DESIGN_TOKENS.spacing.md,
    paddingVertical: 4,
    opacity: 0.9,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#000',
    letterSpacing: 1.5,
  },
});
