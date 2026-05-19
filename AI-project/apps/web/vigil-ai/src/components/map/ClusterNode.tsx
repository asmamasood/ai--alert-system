import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { IncidentCluster } from '../../types/incident.types';
import { getSeverityConfig } from '../../utils/severity';
import { DESIGN_TOKENS } from '../../constants/mapThemes';

interface ClusterNodeProps {
  cluster: IncidentCluster;
  onPress: (cluster: IncidentCluster) => void;
}

const ClusterNodeBase: React.FC<ClusterNodeProps> = ({ cluster, onPress }) => {
  const config = getSeverityConfig(cluster.dominantSeverity);
  const size = Math.min(60, 36 + cluster.count * 4);

  return (
    <Pressable onPress={() => onPress(cluster)} style={styles.container}>
      <View
        style={[
          styles.outer,
          {
            width: size + 16,
            height: size + 16,
            borderRadius: (size + 16) / 2,
            backgroundColor: config.pulseColor,
            borderColor: config.color,
          },
        ]}
      >
        <View
          style={[
            styles.inner,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: config.bgColor,
              borderColor: config.color,
              shadowColor: config.color,
            },
          ]}
        >
          <Text style={[styles.count, { color: config.textColor }]}>{cluster.count}</Text>
          <Text style={styles.label}>zones</Text>
        </View>
      </View>
    </Pressable>
  );
};

export const ClusterNode = memo(ClusterNodeBase);

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  outer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 8,
  },
  count: {
    fontSize: DESIGN_TOKENS.fontSize.lg,
    fontWeight: '900',
    lineHeight: 20,
  },
  label: {
    fontSize: 9,
    color: DESIGN_TOKENS.colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
