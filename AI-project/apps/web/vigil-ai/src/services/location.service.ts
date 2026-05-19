import * as Location from 'expo-location';
import { GeoPoint } from '../types/incident.types';

// Default fallback — city center
const FALLBACK_LOCATION: GeoPoint = { latitude: 24.8607, longitude: 67.0011, accuracy: 0 };

export const locationService = {
  /**
   * Requests foreground permission and returns high-accuracy GPS coordinates.
   */
  getCurrentLocation: async (): Promise<GeoPoint> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('[Location] Permission denied — using fallback pin');
        return FALLBACK_LOCATION;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy ?? undefined,
      };
    } catch (error) {
      console.error('[Location] Error:', error);
      return FALLBACK_LOCATION;
    }
  },

  /**
   * Fallback: user manually pins location on map.
   */
  fallbackManualPin: (): GeoPoint => {
    return FALLBACK_LOCATION;
  },

  /**
   * Validates that a coordinate pair is geographically plausible.
   */
  geoValidation: (lat: number, lng: number): boolean => {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  },

  /**
   * Returns an accuracy score 0-100 based on GPS accuracy in meters.
   * <10m = 100, 10-50m = 80, 50-200m = 50, >200m = 20
   */
  accuracyScore: (accuracyMeters: number): number => {
    if (accuracyMeters < 10) return 100;
    if (accuracyMeters < 50) return 80;
    if (accuracyMeters < 200) return 50;
    return 20;
  },

  /**
   * Watch live position updates.
   */
  watchLocation: async (callback: (point: GeoPoint) => void): Promise<Location.LocationSubscription | null> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;

    return Location.watchPositionAsync(
      { accuracy: Location.Accuracy.Balanced, distanceInterval: 10 },
      (location) => {
        callback({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy ?? undefined,
        });
      }
    );
  },
};
