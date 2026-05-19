import { useState, useEffect, useRef } from 'react';
import { locationService } from '../services/location.service';
import { GeoPoint } from '../types/incident.types';
import * as Location from 'expo-location';

export const useGeoLocation = (watch = false) => {
  const [location, setLocation] = useState<GeoPoint | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const watchSub = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        const point = await locationService.getCurrentLocation();
        setLocation(point);

        if (watch) {
          watchSub.current = await locationService.watchLocation((updated) => {
            setLocation(updated);
          });
        }
      } catch (err: any) {
        setError(err.message ?? 'Location error');
        setLocation(locationService.fallbackManualPin());
      } finally {
        setIsLoading(false);
      }
    };

    init();

    return () => {
      watchSub.current?.remove();
    };
  }, [watch]);

  const accuracyScore = location?.accuracy
    ? locationService.accuracyScore(location.accuracy)
    : 0;

  return { location, error, isLoading, accuracyScore };
};
