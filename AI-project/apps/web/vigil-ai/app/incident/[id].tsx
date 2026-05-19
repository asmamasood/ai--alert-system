import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { useIncidentStore } from '../../src/store/useIncidentStore';
import { IncidentBottomSheet } from '../../src/components/incident/IncidentBottomSheet';
import { DESIGN_TOKENS } from '../../src/constants/mapThemes';
import { useRouter } from 'expo-router';

export default function IncidentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { incidents } = useIncidentStore();
  const router = useRouter();

  const incident = incidents.find((i) => i.id === id);
  if (!incident) return null;

  return (
    <View style={styles.container}>
      <IncidentBottomSheet
        incident={incident}
        onClose={() => router.back()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
});
