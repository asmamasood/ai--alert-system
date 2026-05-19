// ============================================================
// VIGIL AI — useAIAnalysis hook
// Wraps ai.service and passes geolocation context to backend
// ============================================================

import { useState, useCallback } from 'react';
import { aiService } from '../services/ai.service';
import { useGeoLocation } from './useGeoLocation';
import { AIAnalysis, IncidentType } from '../types/incident.types';

export const useAIAnalysis = () => {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { location } = useGeoLocation(false);

  const analyze = useCallback(
    async (mediaUri: string, description?: string, incidentType?: IncidentType) => {
      setIsAnalyzing(true);
      setError(null);
      setAnalysis(null);

      try {
        const result = await aiService.analyzeImage(mediaUri, {
          description,
          type: incidentType,
          // Pass real GPS so backend geolocalizes the report
          latitude: location?.latitude,
          longitude: location?.longitude,
        });
        setAnalysis(result);
        return result;
      } catch (err: any) {
        const msg = err.message ?? 'AI analysis failed';
        setError(msg);
        return null;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [location]
  );

  const reset = useCallback(() => {
    setAnalysis(null);
    setError(null);
  }, []);

  return { analysis, isAnalyzing, error, analyze, reset };
};
