import React, { useRef, useMemo, useEffect } from 'react';
import { StyleSheet, View, Text, Platform, Pressable, ScrollView, Animated, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MapboxGL from '@rnmapbox/maps';
import { useIncidentStore } from '../../store/useIncidentStore';
import { useMapStore } from '../../store/useMapStore';
import { IncidentMarker } from './IncidentMarker';
import { ClusterNode } from './ClusterNode';
import { clusterIncidents } from '../../utils/clustering';
import { Incident } from '../../types/incident.types';
import { DESIGN_TOKENS, MAP_THEMES } from '../../constants/mapThemes';
import { useSharedValue, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { AnimatedView, useAnimatedStyle as useSafeAnimatedStyle } from '../../utils/reanimatedHelpers';

export const SmartMap: React.FC = () => {
  const camera = useRef<MapboxGL.Camera>(null);
  const isWeb = Platform.OS === 'web';
  const isMapboxAvailable = Boolean(MapboxGL?.MapView);
  const { incidents, selectedIncident, setSelectedIncident, heatmapPoints } = useIncidentStore();
  const {
    cameraLatitude,
    cameraLongitude,
    cameraZoom,
    mapTheme,
    setSelectedIncident: mapSetSelected,
    showClusters,
    showHeatmap,
  } = useMapStore();

  // Build clusters from incidents
  const clusters = useMemo(() => clusterIncidents(incidents), [incidents]);
  const clusteredIds = useMemo(
    () => new Set(clusters.flatMap((c) => c.incidents)),
    [clusters]
  );
  // Solo incidents = not in any cluster
  const soloIncidents = useMemo(
    () => incidents.filter((i) => !clusteredIds.has(i.id)),
    [incidents, clusteredIds]
  );

  const handleIncidentPress = (incident: Incident) => {
    setSelectedIncident(incident);
    mapSetSelected(incident);
    camera.current?.flyTo([incident.location.longitude, incident.location.latitude], 500);
  };

  const sweepAngle = useSharedValue(0);
  const ring1Rotation = useSharedValue(0);
  const ring2Rotation = useSharedValue(180);
  const pulseVal = useSharedValue(0.7);

  useEffect(() => {
    sweepAngle.value = withRepeat(
      withTiming(360, { duration: 6000, easing: Easing.linear }),
      -1,
      false
    );
    ring1Rotation.value = withRepeat(
      withTiming(360, { duration: 15000, easing: Easing.linear }),
      -1,
      false
    );
    ring2Rotation.value = withRepeat(
      withTiming(-180, { duration: 20000, easing: Easing.linear }),
      -1,
      false
    );
    pulseVal.value = withRepeat(
      withTiming(1.3, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const sweepStyle = useSafeAnimatedStyle(() => ({
    transform: [{ rotate: `${sweepAngle.value}deg` }]
  }));

  const ring1Style = useSafeAnimatedStyle(() => ({
    transform: [{ rotate: `${ring1Rotation.value}deg` }]
  }));

  const ring2Style = useSafeAnimatedStyle(() => ({
    transform: [{ rotate: `${ring2Rotation.value}deg` }]
  }));

  const pulseCircleStyle = useSafeAnimatedStyle(() => ({
    transform: [{ scale: pulseVal.value }],
    opacity: 0.15 - (pulseVal.value - 0.7) * 0.15
  }));

  // Heatmap GeoJSON
  const heatmapGeoJSON: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: heatmapPoints.map((p) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [p.longitude, p.latitude] },
      properties: { weight: p.weight },
    })),
  };

  // Map Karachi coordinates (Lat: 24.75 - 24.95, Lng: 66.90 - 67.15) to percentage (10% - 85%)
  const getCoordinatesPercent = (lat: number, lng: number) => {
    const minLat = 24.75;
    const maxLat = 24.95;
    const minLng = 66.90;
    const maxLng = 67.15;
    
    const clampedLat = Math.max(minLat, Math.min(maxLat, lat));
    const clampedLng = Math.max(minLng, Math.min(maxLng, lng));

    const top = ((maxLat - clampedLat) / (maxLat - minLat)) * 75 + 10;
    const left = ((clampedLng - minLng) / (maxLng - minLng)) * 75 + 10;
    
    return { top: `${top}%`, left: `${left}%` };
  };

  const getIncidentIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'flood': return '🌊';
      case 'fire': return '🔥';
      case 'accident': return '💥';
      case 'chemical': return '☣️';
      default: return '🚨';
    }
  };

  const getSeverityColor = (sev: string) => {
    switch (sev?.toLowerCase()) {
      case 'critical': return DESIGN_TOKENS.colors.neonRed;
      case 'high': return DESIGN_TOKENS.colors.neonYellow;
      case 'medium': return DESIGN_TOKENS.colors.neonCyan;
      default: return DESIGN_TOKENS.colors.textSecondary;
    }
  };

  if (isWeb || !isMapboxAvailable) {
    return (
      <View style={styles.webContainer}>
        {/* Top Radar Header */}
        <LinearGradient
          colors={['rgba(0, 229, 255, 0.15)', 'rgba(124, 58, 237, 0.15)']}
          style={styles.webHeader}
        >
          <View style={styles.webHeaderLeft}>
            <Text style={styles.webHeaderTitle}>📡 VIGIL AI LIVE COMMAND RADAR (WEB EDITION)</Text>
            <Text style={styles.webHeaderSub}>Connected to Backend (Port 3001) • Real-time Karachi Sector Feed</Text>
          </View>
          <View style={styles.webStatsBadge}>
            <Text style={styles.webStatsText}>{incidents.length} ACTIVE INCIDENTS</Text>
          </View>
        </LinearGradient>

        <View style={styles.webBody}>
          {/* Simulated Interactive Radar Map */}
          <View style={styles.webRadarContainer}>
            <View style={styles.webRadarGrid}>
              {/* Spinning outer grid line rings */}
              <AnimatedView style={[styles.radarCircle1, ring1Style]} />
              <AnimatedView style={[styles.radarCircle2, ring2Style]} />

              {/* Pulsating background cognitive core */}
              <AnimatedView style={[styles.radarPulseCore, pulseCircleStyle]} />

              {/* Grid Lines */}
              <View style={styles.gridLineHorizontal} />
              <View style={styles.gridLineVertical} />

              {/* Holographic revolving AI globe axis lines */}
              <AnimatedView style={[styles.globeAxis1, ring1Style]} />
              <AnimatedView style={[styles.globeAxis2, ring2Style]} />

              {/* Interactive sweeping scanline */}
              <AnimatedView style={[styles.radarSweep, sweepStyle]} />

              {/* Cybernetic Neural Threads and Dots backdrop */}
              <View style={styles.neuralThreadsWrap} pointerEvents="none">
                {/* Visual backdrop of simulated static neural connections */}
                <View style={[styles.neuralDot, { top: '30%', left: '40%' }]} />
                <View style={[styles.neuralDot, { top: '35%', left: '42%' }]} />
                <View style={[styles.neuralDot, { top: '25%', left: '60%' }]} />
                <View style={[styles.neuralDot, { top: '55%', left: '25%' }]} />
                <View style={[styles.neuralDot, { top: '65%', left: '70%' }]} />
                <View style={[styles.neuralDot, { top: '70%', left: '45%' }]} />
                <View style={[styles.neuralDot, { top: '45%', left: '65%' }]} />
                
                {/* Interconnecting thread line indicators */}
                <View style={[styles.neuralThreadLine, { top: '30%', left: '40%', width: 40, transform: [{ rotate: '45deg' }] }]} />
                <View style={[styles.neuralThreadLine, { top: '25%', left: '60%', width: 60, transform: [{ rotate: '-30deg' }] }]} />
                <View style={[styles.neuralThreadLine, { top: '55%', left: '25%', width: 80, transform: [{ rotate: '15deg' }] }]} />
                <View style={[styles.neuralThreadLine, { top: '65%', left: '70%', width: 50, transform: [{ rotate: '60deg' }] }]} />
              </View>
              
              {/* Incident Markers on Simulated Map */}
              {incidents.map((incident) => {
                const pos = getCoordinatesPercent(incident.location.latitude, incident.location.longitude);
                const color = getSeverityColor(incident.severity);
                const isSelected = selectedIncident?.id === incident.id;
                return (
                  <Pressable
                    key={incident.id}
                    style={[styles.webMapMarker, { top: pos.top as any, left: pos.left as any }]}
                    onPress={() => handleIncidentPress(incident)}
                  >
                    <View style={[styles.markerPulse, { backgroundColor: color }]} />
                    <View style={[styles.markerPin, { borderColor: color }]}>
                      <Text style={styles.markerIcon}>{getIncidentIcon(incident.type)}</Text>
                    </View>
                    {isSelected && (
                      <View style={styles.markerTooltip}>
                        {incident.media && incident.media.length > 0 && incident.media[0].uri && (
                          <Image
                            source={{ uri: incident.media[0].uri }}
                            style={styles.tooltipImage}
                            resizeMode="cover"
                          />
                        )}
                        <Text style={styles.tooltipTitle}>{incident.title}</Text>
                        <Text style={[styles.tooltipSev, { color }]}>{incident.severity.toUpperCase()}</Text>
                        {incident.description && (
                          <Text style={styles.tooltipDesc} numberOfLines={2}>
                            {incident.description}
                          </Text>
                        )}
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Live Incident Sidebar Feed */}
          <View style={styles.webSidebar}>
            <Text style={styles.sidebarTitle}>🔴 LIVE INCIDENT FEED</Text>
            <ScrollView style={styles.sidebarScroll} contentContainerStyle={{ gap: 12 }}>
              {incidents.map((incident) => {
                const color = getSeverityColor(incident.severity);
                return (
                  <Pressable
                    key={incident.id}
                    style={styles.sidebarCard}
                    onPress={() => handleIncidentPress(incident)}
                  >
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardIcon}>{getIncidentIcon(incident.type)}</Text>
                      <Text style={styles.cardTitle}>{incident.title}</Text>
                      <View style={[styles.cardSevBadge, { backgroundColor: color + '20', borderColor: color }]}>
                        <Text style={[styles.cardSevText, { color }]}>{incident.severity.toUpperCase()}</Text>
                      </View>
                    </View>
                    <Text style={styles.cardDesc} numberOfLines={2}>{incident.description}</Text>
                    <View style={styles.cardFooter}>
                      <Text style={styles.cardTime}>Live GPS: {incident.location.latitude.toFixed(4)}, {incident.location.longitude.toFixed(4)}</Text>
                      <Text style={styles.cardAction}>FLY TO MAP 🛰️</Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapboxGL.MapView
        style={styles.map}
        styleURL={MAP_THEMES[mapTheme]}
        logoEnabled={false}
        compassEnabled={true}
        compassViewPosition={2}
        attributionEnabled={false}
      >
        <MapboxGL.Camera
          ref={camera}
          centerCoordinate={[cameraLongitude, cameraLatitude]}
          zoomLevel={cameraZoom}
          animationMode="flyTo"
          animationDuration={600}
        />

        {/* User Location */}
        <MapboxGL.UserLocation visible animated />

        {/* Heatmap Layer */}
        {showHeatmap && (
          <MapboxGL.ShapeSource id="heatmapSource" shape={heatmapGeoJSON}>
            <MapboxGL.HeatmapLayer
              id="heatmapLayer"
              sourceID="heatmapSource"
              style={{
                heatmapColor: [
                  'interpolate',
                  ['linear'],
                  ['heatmap-density'],
                  0, 'rgba(0,0,0,0)',
                  0.2, 'rgba(0,229,255,0.3)',
                  0.5, 'rgba(255,109,0,0.5)',
                  0.8, 'rgba(255,23,68,0.7)',
                  1, 'rgba(255,23,68,1)',
                ],
                heatmapRadius: 60,
                heatmapOpacity: 0.6,
                heatmapIntensity: 1.5,
              }}
            />
          </MapboxGL.ShapeSource>
        )}

        {/* Solo Incident Markers */}
        {soloIncidents.map((incident) => (
          <MapboxGL.MarkerView
            key={incident.id}
            coordinate={[incident.location.longitude, incident.location.latitude]}
          >
            <IncidentMarker incident={incident} onPress={handleIncidentPress} />
          </MapboxGL.MarkerView>
        ))}

        {/* Cluster Nodes */}
        {showClusters &&
          clusters.map((cluster) => (
            <MapboxGL.MarkerView
              key={cluster.id}
              coordinate={[cluster.center.longitude, cluster.center.latitude]}
            >
              <ClusterNode cluster={cluster} onPress={() => {}} />
            </MapboxGL.MarkerView>
          ))}
      </MapboxGL.MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DESIGN_TOKENS.colors.background },
  map: { flex: 1 },
  fallbackContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DESIGN_TOKENS.colors.background,
    padding: 24,
  },
  fallbackText: {
    color: DESIGN_TOKENS.colors.textSecondary,
    textAlign: 'center',
    fontSize: DESIGN_TOKENS.fontSize.md,
  },
  webContainer: {
    flex: 1, backgroundColor: DESIGN_TOKENS.colors.background, display: 'flex', flexDirection: 'column',
  },
  webHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16,
    borderBottomWidth: 1, borderBottomColor: DESIGN_TOKENS.colors.glassBorder,
  },
  webHeaderLeft: { gap: 4 },
  webHeaderTitle: { fontSize: 18, fontWeight: '900', color: DESIGN_TOKENS.colors.neonCyan, letterSpacing: 1 },
  webHeaderSub: { fontSize: 12, color: DESIGN_TOKENS.colors.textSecondary },
  webStatsBadge: {
    backgroundColor: 'rgba(255, 23, 104, 0.2)', borderWidth: 1, borderColor: DESIGN_TOKENS.colors.neonRed,
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
  },
  webStatsText: { fontSize: 12, fontWeight: '900', color: DESIGN_TOKENS.colors.neonRed, letterSpacing: 1 },
  webBody: { flex: 1, flexDirection: Platform.OS === 'web' ? 'row' : 'column', display: 'flex' },
  webRadarContainer: {
    flex: 2, backgroundColor: '#0B0F19', padding: 20, justifyContent: 'center', alignItems: 'center',
    borderRightWidth: 1, borderRightColor: DESIGN_TOKENS.colors.glassBorder,
  },
  webRadarGrid: {
    width: '100%', height: '100%', maxWidth: 800, maxHeight: 800, borderRadius: 400,
    borderWidth: 2, borderColor: 'rgba(0, 229, 255, 0.3)', backgroundColor: 'rgba(0, 229, 255, 0.02)',
    position: 'relative', overflow: 'hidden', justifyContent: 'center', alignItems: 'center',
  },
  gridLineHorizontal: { position: 'absolute', width: '100%', height: 1, backgroundColor: 'rgba(0, 229, 255, 0.2)' },
  gridLineVertical: { position: 'absolute', height: '100%', width: 1, backgroundColor: 'rgba(0, 229, 255, 0.2)' },
  radarCircle1: { position: 'absolute', width: '70%', height: '70%', borderRadius: 1000, borderWidth: 1, borderColor: 'rgba(0, 229, 255, 0.15)' },
  radarCircle2: { position: 'absolute', width: '35%', height: '35%', borderRadius: 1000, borderWidth: 1, borderColor: 'rgba(0, 229, 255, 0.15)' },
  radarPulseCore: {
    position: 'absolute',
    width: '90%',
    height: '90%',
    borderRadius: 1000,
    borderWidth: 2,
    borderColor: 'rgba(0, 229, 255, 0.08)',
    backgroundColor: 'rgba(0, 229, 255, 0.01)',
  },
  globeAxis1: {
    position: 'absolute',
    width: '80%',
    height: '80%',
    borderRadius: 1000,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(124, 58, 237, 0.25)',
  },
  globeAxis2: {
    position: 'absolute',
    width: '50%',
    height: '50%',
    borderRadius: 1000,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(0, 229, 255, 0.25)',
  },
  radarSweep: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 1000,
    borderLeftWidth: 1.5,
    borderLeftColor: 'rgba(0, 229, 255, 0.6)',
    backgroundColor: 'transparent',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  neuralThreadsWrap: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  neuralDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00E5FF',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  neuralThreadLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
  },
  webMapMarker: { position: 'absolute', width: 36, height: 36, marginLeft: -18, marginTop: -18, alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  markerPulse: { position: 'absolute', width: 36, height: 36, borderRadius: 18, opacity: 0.3 },
  markerPin: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, backgroundColor: '#121826', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.8, shadowRadius: 4 },
  markerIcon: { fontSize: 14 },
  markerTooltip: {
    position: 'absolute',
    top: 36,
    backgroundColor: 'rgba(11, 15, 25, 0.96)',
    borderWidth: 1.5,
    borderColor: DESIGN_TOKENS.colors.glassBorder,
    borderRadius: 12,
    padding: 10,
    width: 200,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.95,
    shadowRadius: 12,
    zIndex: 100,
  },
  tooltipImage: {
    width: '100%',
    height: 90,
    borderRadius: 8,
    marginBottom: 8,
  },
  tooltipTitle: { fontSize: 11, fontWeight: '700', color: '#fff', textAlign: 'center' },
  tooltipSev: { fontSize: 9, fontWeight: '900', marginTop: 2 },
  tooltipDesc: {
    fontSize: 10,
    color: DESIGN_TOKENS.colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 14,
  },
  webSidebar: { flex: 1, minWidth: 320, backgroundColor: DESIGN_TOKENS.colors.background, padding: 16, display: 'flex', flexDirection: 'column' },
  sidebarTitle: { fontSize: 14, fontWeight: '900', color: '#fff', letterSpacing: 1.5, marginBottom: 16 },
  sidebarScroll: { flex: 1 },
  sidebarCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: DESIGN_TOKENS.colors.glassBorder, borderRadius: 12, padding: 16, gap: 8 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardIcon: { fontSize: 18 },
  cardTitle: { flex: 1, fontSize: 14, fontWeight: '700', color: '#fff' },
  cardSevBadge: { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  cardSevText: { fontSize: 9, fontWeight: '900' },
  cardDesc: { fontSize: 12, color: DESIGN_TOKENS.colors.textSecondary, lineHeight: 18 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  cardTime: { fontSize: 10, color: DESIGN_TOKENS.colors.textMuted },
  cardAction: { fontSize: 11, fontWeight: '900', color: DESIGN_TOKENS.colors.neonCyan },
});
