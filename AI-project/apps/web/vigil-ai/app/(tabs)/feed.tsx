import React from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable, Image, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useIncidentStore } from '../../src/store/useIncidentStore';
import { useLiveIncidents } from '../../src/hooks/useLiveIncidents';
import { DESIGN_TOKENS, SEVERITY_STYLE } from '../../src/constants/mapThemes';
import { EMERGENCY_CATEGORIES } from '../../src/constants/emergencyTypes';
import { Incident } from '../../src/types/incident.types';
import { formatTimestamp } from '../../src/utils/severity';
import { IncidentBottomSheet } from '../../src/components/incident/IncidentBottomSheet';

const { width: W } = Dimensions.get('window');

// Placeholder images for feed cards
const PLACEHOLDER_COLORS: Record<string, string> = {
  fire: '#FF3D00',
  flood: '#0288D1',
  accident: '#FF6D00',
  collapse: '#795548',
  violence: '#D50000',
  earthquake: '#827717',
  chemical: '#76FF03',
};

function FeedCard({ incident, onPress }: { incident: Incident; onPress: () => void }) {
  const sev = SEVERITY_STYLE[incident.severity];
  const cat = EMERGENCY_CATEGORIES.find((c) => c.id === incident.type);

  return (
    <Pressable onPress={onPress} style={card.wrap}>
      <View style={card.container}>
        {/* Thumbnail */}
        <View style={[card.thumb, { backgroundColor: PLACEHOLDER_COLORS[incident.type] + '33' }]}>
          {incident.media && incident.media.length > 0 && incident.media[0].uri ? (
            <Image source={{ uri: incident.media[0].uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          ) : (
            <Text style={card.thumbEmoji}>{cat?.icon ?? '⚠️'}</Text>
          )}
          {/* Severity stripe */}
          <View style={[card.sevStripe, { backgroundColor: sev.badge }]} />
        </View>

        {/* Content */}
        <View style={card.content}>
          <View style={card.topRow}>
            <Text style={card.title} numberOfLines={1}>{incident.title}</Text>
            <Pressable><Text style={card.infoIcon}>ⓘ</Text></Pressable>
          </View>
          <Text style={card.location} numberOfLines={1}>
            {incident.location.latitude.toFixed(3)}, {incident.location.longitude.toFixed(3)}
          </Text>
          <View style={card.bottomRow}>
            <View style={[card.sevBadge, { backgroundColor: sev.badgeBg, borderColor: sev.border }]}>
              <View style={[card.sevDot, { backgroundColor: sev.dot }]} />
              <Text style={[card.sevText, { color: sev.text }]}>{sev.label}</Text>
            </View>
            <Text style={card.time}>{formatTimestamp(incident.timestamp)}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default function FeedScreen() {
  const { incidents, selectedIncident, setSelectedIncident } = useIncidentStore();
  const { isLoading, refetch } = useLiveIncidents();

  const sorted = [...incidents].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Live Feed</Text>
          <Pressable style={styles.filterBtn}>
            <Text style={styles.filterIcon}>⟁</Text>
          </Pressable>
        </View>

        <FlatList
          data={sorted}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <FeedCard incident={item} onPress={() => setSelectedIncident(item)} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🌐</Text>
              <Text style={styles.emptyText}>No active incidents</Text>
              <Text style={styles.emptyGreen}>CITY STATUS: ALL CLEAR</Text>
            </View>
          }
        />
      </SafeAreaView>

      {selectedIncident && (
        <IncidentBottomSheet
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
        />
      )}
    </View>
  );
}

const card = StyleSheet.create({
  wrap: { paddingHorizontal: DESIGN_TOKENS.space.md },
  container: {
    flexDirection: 'row', gap: 12,
    paddingVertical: 12,
  },
  thumb: {
    width: 72, height: 72, borderRadius: DESIGN_TOKENS.radius.md,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', position: 'relative',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  thumbEmoji: { fontSize: 28 },
  sevStripe: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
  },
  content: { flex: 1, justifyContent: 'space-between' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: {
    fontSize: 14, fontWeight: '700', color: DESIGN_TOKENS.colors.textPrimary,
    flex: 1, marginRight: 8,
  },
  infoIcon: { fontSize: 16, color: DESIGN_TOKENS.colors.textMuted },
  location: {
    fontSize: 11, color: DESIGN_TOKENS.colors.textMuted,
  },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sevBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: DESIGN_TOKENS.radius.full, borderWidth: 1,
  },
  sevDot: { width: 5, height: 5, borderRadius: 2.5 },
  sevText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  time: { fontSize: 11, color: DESIGN_TOKENS.colors.textMuted },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: DESIGN_TOKENS.colors.background },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: DESIGN_TOKENS.space.md,
    paddingTop: DESIGN_TOKENS.space.sm,
    paddingBottom: DESIGN_TOKENS.space.md,
    borderBottomWidth: 1, borderBottomColor: DESIGN_TOKENS.colors.divider,
  },
  headerTitle: {
    fontSize: DESIGN_TOKENS.font.xl, fontWeight: '800',
    color: DESIGN_TOKENS.colors.textPrimary,
  },
  filterBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: DESIGN_TOKENS.colors.glassBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  filterIcon: { fontSize: 16, color: DESIGN_TOKENS.colors.textSecondary },
  list: { paddingBottom: 20 },
  separator: {
    height: 1, backgroundColor: DESIGN_TOKENS.colors.dividerSubtle,
    marginHorizontal: DESIGN_TOKENS.space.md,
  },
  empty: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 16, color: DESIGN_TOKENS.colors.textSecondary },
  emptyGreen: {
    fontSize: 11, color: DESIGN_TOKENS.colors.neonGreen,
    fontWeight: '800', letterSpacing: 1.5,
  },
});
