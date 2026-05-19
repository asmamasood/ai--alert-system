import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import { HeatmapPoint } from '../../types/incident.types';

interface HeatmapLayerProps {
  points: HeatmapPoint[];
}

export const HeatmapLayer: React.FC<HeatmapLayerProps> = ({ points }) => {
  const geoJSON: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: points.map((p) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [p.longitude, p.latitude] },
      properties: { weight: p.weight },
    })),
  };

  // Mapbox native components are not available on web. Render a tiny placeholder on web.
  if (Platform.OS === 'web' || !MapboxGL?.ShapeSource) {
    return (
      <View style={styles.fallbackContainer} />
    );
  }

  return (
    <MapboxGL.ShapeSource id="heatmapLayerSource" shape={geoJSON}>
      <MapboxGL.HeatmapLayer
        id="vigilHeatmap"
        sourceID="heatmapLayerSource"
        style={{
          heatmapColor: [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(0,0,0,0)',
            0.2, 'rgba(0,229,255,0.3)',
            0.5, 'rgba(255,171,0,0.6)',
            0.8, 'rgba(255,109,0,0.7)',
            1, 'rgba(255,23,68,1)',
          ],
          heatmapRadius: 55,
          heatmapOpacity: 0.65,
          heatmapIntensity: 1.5,
          heatmapWeight: ['get', 'weight'],
        }}
      />
    </MapboxGL.ShapeSource>
  );
};

const styles = StyleSheet.create({
  fallbackContainer: { width: '100%', height: 1 },
});
