import React from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable, Animated, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMapStore } from '../../src/store/useMapStore';
import { useIncidentStore } from '../../src/store/useIncidentStore';
import { DESIGN_TOKENS, SEVERITY_STYLE } from '../../src/constants/mapThemes';
import { EMERGENCY_CATEGORIES } from '../../src/constants/emergencyTypes';
import { Incident } from '../../src/types/incident.types';
import { formatTimestamp } from '../../src/utils/severity';

function EvacuateBanner() {
  return (
    <View style={ban.wrap}>
      <LinearGradient
        colors={['rgba(255,23,68,0.22)', 'rgba(255,109,0,0.12)']}
        style={ban.grad}
      >
        <View style={ban.left}>
          <View style={ban.iconWrap}>
            <Text style={ban.icon}>🚨</Text>
          </View>
          <View>
            <Text style={ban.title}>EVACUATE NOW!</Text>
            <Text style={ban.sub}>Flood happening in your area.</Text>
            <Text style={ban.sub}>Sector 11-C, Karachi</Text>
          </View>
        </View>
        <Text style={ban.arrow}>›</Text>
      </LinearGradient>
    </View>
  );
}

const NearbyAlertItem = React.memo(function NearbyAlertItem({ incident, onPress }: { incident: Incident; onPress: () => void }) {
  const sev = SEVERITY_STYLE[incident.severity] || SEVERITY_STYLE.medium;
  const cat = EMERGENCY_CATEGORIES.find((c) => c.id === incident.type);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && { backgroundColor: 'rgba(255,255,255,0.04)' }]}>
      <View style={nb.item}>
        <View style={[nb.iconBox, { backgroundColor: sev.badgeBg, borderColor: sev.border, overflow: 'hidden', position: 'relative' }]}>
          {incident.media && incident.media.length > 0 && incident.media[0].uri ? (
            <Image source={{ uri: incident.media[0].uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          ) : (
            <Text style={nb.icon}>{cat?.icon ?? '⚠️'}</Text>
          )}
        </View>
        <View style={nb.content}>
          <Text style={nb.title}>{incident.title}</Text>
          <Text style={nb.location}>
            GPS: {incident.location.latitude.toFixed(3)}, {incident.location.longitude.toFixed(3)}
          </Text>
        </View>
        <View style={nb.right}>
          <View style={[nb.sev, { backgroundColor: sev.badgeBg, borderColor: sev.border, borderWidth: 1 }]}>
            <Text style={[nb.sevText, { color: sev.text }]}>{sev.label.toUpperCase()}</Text>
          </View>
          <Text style={nb.time}>{formatTimestamp(incident.timestamp)}</Text>
        </View>
      </View>
    </Pressable>
  );
});

export default function AlertsScreen() {
  const router = useRouter();
  const { incidents, setSelectedIncident } = useIncidentStore();
  
  const sorted = [...incidents].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );

  const handleAlertPress = (incident: Incident) => {
    // Zoom/pan map to this incident's location
    useMapStore.getState().setCameraPosition(
      incident.location.latitude,
      incident.location.longitude,
      14.5
    );
    // Open sheet & highlight marker
    useMapStore.getState().setSelectedIncident(incident);
    setSelectedIncident(incident);
    
    // Switch to Home tab (the Map Screen)
    router.replace('/(tabs)/home');
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Alerts</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{incidents.length}</Text>
          </View>
        </View>

        <FlatList
          data={sorted}
          keyExtractor={(i) => i.id}
          ListHeaderComponent={() => (
            <View style={styles.listHeader}>
              {/* EVACUATE banner */}
              <EvacuateBanner />

              {/* Section */}
              <Text style={styles.sectionLbl}>Live Tactical Alerts</Text>
            </View>
          )}
          renderItem={({ item }) => <NearbyAlertItem incident={item} onPress={() => handleAlertPress(item)} />}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          getItemLayout={(data, index) => ({ length: 69, offset: 69 * index, index })}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={5}
          removeClippedSubviews={true}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No active alerts found</Text>
            </View>
          }
        />
      </SafeAreaView>
    </View>
  );
}

const ban = StyleSheet.create({
  wrap: {
    marginHorizontal: DESIGN_TOKENS.space.md,
    marginTop: DESIGN_TOKENS.space.md,
    borderRadius: DESIGN_TOKENS.radius.md,
    overflow: 'hidden',
    borderWidth: 1.5, borderColor: DESIGN_TOKENS.colors.neonRed,
    shadowColor: DESIGN_TOKENS.colors.neonRed,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8,
  },
  grad: { padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  left: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconWrap: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,23,68,0.2)',
    borderWidth: 2, borderColor: DESIGN_TOKENS.colors.neonRed,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: DESIGN_TOKENS.colors.neonRed,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 8,
  },
  icon: { fontSize: 22 },
  title: {
    fontSize: 15, fontWeight: '900', color: DESIGN_TOKENS.colors.neonRed, letterSpacing: 1,
    textShadowColor: DESIGN_TOKENS.colors.neonRed,
    textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 6,
  },
  sub: { fontSize: 12, color: DESIGN_TOKENS.colors.textSecondary, marginTop: 2 },
  arrow: { fontSize: 24, color: DESIGN_TOKENS.colors.neonRed, fontWeight: '300' },
});

const nb = StyleSheet.create({
  item: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: DESIGN_TOKENS.space.md, paddingVertical: 12,
  },
  iconBox: {
    width: 44, height: 44, borderRadius: DESIGN_TOKENS.radius.md,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5,
  },
  icon: { fontSize: 20 },
  content: { flex: 1 },
  title: { fontSize: 13, fontWeight: '700', color: DESIGN_TOKENS.colors.textPrimary },
  location: { fontSize: 11, color: DESIGN_TOKENS.colors.textMuted, marginTop: 2 },
  right: { alignItems: 'flex-end', gap: 4 },
  sev: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: DESIGN_TOKENS.radius.full },
  sevText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  time: { fontSize: 10, color: DESIGN_TOKENS.colors.textMuted },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: DESIGN_TOKENS.colors.background },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: DESIGN_TOKENS.space.md,
    paddingTop: DESIGN_TOKENS.space.sm,
    paddingBottom: DESIGN_TOKENS.space.md,
    borderBottomWidth: 1, borderBottomColor: DESIGN_TOKENS.colors.divider,
  },
  headerTitle: {
    fontSize: DESIGN_TOKENS.font.xl, fontWeight: '800',
    color: DESIGN_TOKENS.colors.textPrimary,
  },
  countBadge: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: DESIGN_TOKENS.colors.neonRed,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: DESIGN_TOKENS.colors.neonRed,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 8,
  },
  countText: { fontSize: 12, fontWeight: '900', color: '#fff' },
  listHeader: { gap: 0 },
  sectionLbl: {
    fontSize: 11, fontWeight: '800', color: DESIGN_TOKENS.colors.textMuted,
    letterSpacing: 1.5, textTransform: 'uppercase',
    paddingHorizontal: DESIGN_TOKENS.space.md,
    paddingTop: DESIGN_TOKENS.space.lg,
    paddingBottom: DESIGN_TOKENS.space.sm,
  },
  list: { paddingBottom: 20 },
  sep: {
    height: 1, backgroundColor: DESIGN_TOKENS.colors.dividerSubtle,
    marginHorizontal: DESIGN_TOKENS.space.md,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textSecondary,
  },
});
