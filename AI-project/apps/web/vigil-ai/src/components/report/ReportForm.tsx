import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  Pressable, ActivityIndicator, Alert, Platform,
} from 'react-native';
import { useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { AnimatedView, useAnimatedStyle as useSafeAnimatedStyle } from '../../utils/reanimatedHelpers';
import { BlurView } from 'expo-blur';
import { useIncidentStore } from '../../store/useIncidentStore';
import { useUserStore } from '../../store/useUserStore';
import { useAIAnalysis } from '../../hooks/useAIAnalysis';
import { useGeoLocation } from '../../hooks/useGeoLocation';
import { mediaService } from '../../services/media.service';
import { socketService } from '../../services/socket';
import { incidentApi } from '../../services/api';
import { NeonButton } from '../ui/NeonButton';
import { SeverityBadge } from '../ui/SeverityBadge';
import { AIConfidenceBar } from '../ui/AIConfidenceBar';
import { EMERGENCY_CATEGORIES } from '../../constants/emergencyTypes';
import { DESIGN_TOKENS } from '../../constants/mapThemes';
import { Incident, MediaAttachment, IncidentType } from '../../types/incident.types';
import { MediaUploader } from './MediaUploader';

interface ReportFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const ReportForm: React.FC<ReportFormProps> = ({ onClose, onSuccess }) => {
  const { addIncident } = useIncidentStore();
  const { user } = useUserStore();
  const { analyze, analysis, isAnalyzing, reset } = useAIAnalysis();
  const { location } = useGeoLocation(false);

  const [selectedType, setSelectedType] = useState<IncidentType>('flood');
  const [description, setDescription] = useState('');
  const [media, setMedia] = useState<MediaAttachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);

  const translateY = useSharedValue(600);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withSpring(0, { damping: 20, stiffness: 100 });
    backdropOpacity.value = withTiming(0.7, { duration: 300 });
  }, []);

  const sheetStyle = useSafeAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useSafeAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const handleClose = () => {
    translateY.value = withTiming(600, { duration: 250 });
    backdropOpacity.value = withTiming(0, { duration: 250 });
    setTimeout(onClose, 250);
  };

  const handleMediaAdd = async (source: 'camera' | 'gallery') => {
    const attachment =
      source === 'camera'
        ? await mediaService.captureFromCamera()
        : await mediaService.pickImage();
    if (!attachment) return;

    setMedia((prev) => [...prev, attachment]);

    // Background upload to backend
    try {
      const uploadedUrl = await mediaService.uploadImage(attachment.uri, `temp_${Date.now()}`);
      if (uploadedUrl) {
        setMedia((prev) =>
          prev.map((m) => (m.id === attachment.id ? { ...m, uploadedUrl } : m))
        );
      }
    } catch (uploadErr) {
      console.warn('Background upload failed:', uploadErr);
    }

    if (aiEnabled) {
      await analyze(attachment.uri, description, selectedType);
    }
  };

  const handleSubmit = async () => {
    if (!location) {
      Alert.alert('GPS Required', 'Central grid coordinates unavailable. Please enable GPS.');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Missing Description', 'Please describe the incident before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      let uploadFailed = false;
      const finalMedia = await Promise.all(
        media.map(async (m) => {
          if (m.uploadedUrl) return m;
          try {
            const url = await mediaService.uploadImage(m.uri, `temp_${Date.now()}`);
            return { ...m, uploadedUrl: url };
          } catch (err) {
            console.warn('Fallback media upload failed', err);
            uploadFailed = true;
            return m;
          }
        })
      );
      
      if (uploadFailed) {
        Alert.alert('Upload Failed', 'Could not upload media to the server. Please check your connection and try again.');
        setIsSubmitting(false);
        return;
      }
      setMedia(finalMedia);

      const lat = location.latitude;
      const lng = location.longitude;
      const district = 'Saddar';
      
      let reportId = `incident_${Date.now()}`;

      try {
        const res = await incidentApi.submitReport({
          description,
          type: selectedType.toUpperCase(),
          latitude: lat,
          longitude: lng,
          district,
          mediaUrls: finalMedia.map((m) => m.uploadedUrl || m.uri).filter(Boolean),
          isAnonymous: !user?.id,
        });
        if (res.data?.data?.reportId) {
          reportId = res.data.data.reportId;
        }
      } catch (apiErr: any) {
        console.warn('[ReportForm] Backend submit failed, saving locally:', apiErr.message);
      }

      const aiData = analysis ?? { type: selectedType, severity: 'medium', confidence: 70 };

      const incident: Incident = {
        id: reportId,
        type: (aiData.type as IncidentType) ?? selectedType,
        title: `${EMERGENCY_CATEGORIES.find((c) => c.id === selectedType)?.label} — Tactical Incident`,
        description,
        location,
        severity: aiData.severity ?? 'medium',
        status: 'active',
        confidence: aiData.confidence ?? 70,
        aiAnalysis: analysis ?? undefined,
        media: finalMedia,
        reportedBy: user?.id ?? 'anonymous',
        timestamp: new Date(),
        updatedAt: new Date(),
        radius: analysis?.radius || 1500,
        rescueStatus: 'pending',
      };

      addIncident(incident);
      socketService.emitIncident(incident);

      Alert.alert(
        '🚨 COGNITIVE BROADCAST ACTIVE',
        'Incident logged successfully. ResQ OS drone pathing resolved.',
        [{ text: 'OK', onPress: () => { onSuccess?.(); handleClose(); } }]
      );
    } catch (err) {
      Alert.alert('System Error', 'Failed to dispatch report. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.overlay}>
      <AnimatedView style={[styles.backdrop, backdropStyle]} pointerEvents="auto">
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
      </AnimatedView>

      <AnimatedView style={[styles.sheet, sheetStyle]}>
        <BlurView intensity={35} tint="dark" style={styles.blur}>

          <View style={styles.header}>
            <View style={styles.handleBar} />
            <Text style={styles.title}>TACTICAL EMERGENCY INTAKE</Text>
            <Pressable onPress={handleClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

            <Text style={styles.sectionLabel}>INCIDENT TYPE CATEGORY</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesRow}>
              {EMERGENCY_CATEGORIES.map((cat) => {
                const active = selectedType === cat.id;
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => setSelectedType(cat.id)}
                    style={[
                      styles.catChip,
                      active && { 
                        backgroundColor: 'rgba(0, 229, 255, 0.08)', 
                        borderColor: cat.color,
                        shadowColor: cat.color,
                      },
                    ]}
                  >
                    <Text style={styles.catIcon}>{cat.icon}</Text>
                    <Text style={[styles.catLabel, active && { color: cat.color, fontWeight: '900' }]}>
                      {cat.label.toUpperCase()}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text style={styles.sectionLabel}>TACTICAL EVIDENCE FEED</Text>
            <MediaUploader
              media={media}
              onAddCamera={() => handleMediaAdd('camera')}
              onAddGallery={() => handleMediaAdd('gallery')}
              onRemove={(id) => setMedia((prev) => prev.filter((m) => m.id !== id))}
            />

            <Text style={styles.sectionLabel}>TACTICAL DESCRIPTIONS</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Describe incident spread, visual blockages, or citizens trapped..."
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <View style={styles.aiRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.aiToggleLabel}>🧠 COGNITIVE VIGIL AI ENGINE</Text>
                <Text style={styles.aiToggleSub}>Auto-detect threat level & impact zones</Text>
              </View>
              <Pressable
                onPress={() => setAiEnabled((v) => !v)}
                style={[styles.toggle, aiEnabled && styles.toggleActive]}
              >
                <Text style={styles.toggleText}>{aiEnabled ? 'ACTIVE' : 'BYPASS'}</Text>
              </Pressable>
            </View>

            {isAnalyzing && (
              <View style={styles.aiLoading}>
                <ActivityIndicator color={DESIGN_TOKENS.colors.neonCyan} size="small" />
                <Text style={styles.aiLoadingText}>AI DISCOVERY ORCHESTRATION IN PROGRESS...</Text>
              </View>
            )}

            {analysis && !isAnalyzing && (
              <View style={styles.aiResult}>
                <Text style={styles.aiResultTitle}>AI SATELLITE DISCOVERY RESULT</Text>
                <View style={styles.aiResultRow}>
                  <SeverityBadge severity={analysis.severity} size="sm" />
                  <Text style={styles.aiResultType}>
                    {EMERGENCY_CATEGORIES.find((c) => c.id === analysis.type)?.label.toUpperCase() ?? analysis.type.toUpperCase()}
                  </Text>
                </View>
                <AIConfidenceBar confidence={analysis.confidence} />
                <Text style={styles.aiSpread}>
                  PREDICTED IMPACT: ZONE {analysis.radius}M RADIUS • SPREAD RATE +{analysis.spreadPrediction || '1.4'} KM/H
                </Text>
              </View>
            )}

            <View style={styles.gpsRow}>
              <View style={styles.gpsPulseRing}>
                <View style={styles.gpsPulseDot} />
              </View>
              <Text style={styles.gpsText}>
                {location
                  ? `SATELLITE COORDINATES LOCATED • LAT: ${location.latitude.toFixed(5)}  LNG: ${location.longitude.toFixed(5)}`
                  : 'RESOLVING SATELLITE GNSS FEED...'}
              </Text>
            </View>

            <NeonButton
              label={isSubmitting ? 'ENGAGING SYSTEM CORES...' : 'DISPATCH COGNITIVE BROADCAST'}
              color={DESIGN_TOKENS.colors.neonRed}
              onPress={handleSubmit}
              loading={isSubmitting}
              style={styles.submitBtn}
            />

            <View style={{ height: 40 }} />
          </ScrollView>
        </BlurView>
      </AnimatedView>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 100, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000' },
  sheet: {
    height: '84%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    borderTopWidth: 2,
    borderTopColor: DESIGN_TOKENS.colors.glassBorder,
  },
  blur: { flex: 1, backgroundColor: 'rgba(5,10,20,0.96)' },
  header: {
    alignItems: 'center',
    padding: DESIGN_TOKENS.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: DESIGN_TOKENS.colors.divider,
    position: 'relative',
  },
  handleBar: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '900',
    color: DESIGN_TOKENS.colors.neonRed,
    letterSpacing: 2,
    textShadowColor: DESIGN_TOKENS.colors.neonRed,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  closeBtn: {
    position: 'absolute', right: 16, top: 18,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  closeText: { color: DESIGN_TOKENS.colors.textSecondary, fontSize: 11, fontWeight: '700' },
  scroll: { flex: 1 },
  sectionLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: DESIGN_TOKENS.colors.textMuted,
    letterSpacing: 1.5,
    paddingHorizontal: DESIGN_TOKENS.spacing.md,
    paddingTop: 16,
    paddingBottom: 8,
  },
  categoriesRow: { paddingHorizontal: DESIGN_TOKENS.spacing.md, marginBottom: 4 },
  catChip: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: DESIGN_TOKENS.radius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.06)',
    marginRight: 8,
    backgroundColor: 'rgba(255,255,255,0.02)',
    minWidth: 84,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  catIcon: { fontSize: 20 },
  catLabel: {
    fontSize: 8,
    color: DESIGN_TOKENS.colors.textMuted,
    marginTop: 4,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  textInput: {
    marginHorizontal: DESIGN_TOKENS.spacing.md,
    borderWidth: 1.5,
    borderColor: DESIGN_TOKENS.colors.glassBorder,
    borderRadius: DESIGN_TOKENS.radius.md,
    padding: 12,
    fontSize: 12,
    color: '#fff',
    backgroundColor: 'rgba(255,255,255,0.02)',
    minHeight: 76,
  },
  aiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: DESIGN_TOKENS.spacing.md,
    marginTop: 18,
    marginBottom: 12,
    padding: 12,
    borderRadius: DESIGN_TOKENS.radius.md,
    backgroundColor: 'rgba(0,229,255,0.03)',
    borderWidth: 1.5,
    borderColor: 'rgba(0,229,255,0.12)',
  },
  aiToggleLabel: {
    fontSize: 11,
    color: DESIGN_TOKENS.colors.neonCyan,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  aiToggleSub: {
    fontSize: 8,
    color: DESIGN_TOKENS.colors.textMuted,
    marginTop: 2,
    fontWeight: '700',
  },
  toggle: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  toggleActive: {
    backgroundColor: 'rgba(0,229,255,0.1)',
    borderColor: DESIGN_TOKENS.colors.neonCyan,
  },
  toggleText: { color: '#fff', fontWeight: '900', fontSize: 9, letterSpacing: 1 },
  aiLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: DESIGN_TOKENS.spacing.md,
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.15)',
    backgroundColor: 'rgba(0,229,255,0.02)',
  },
  aiLoadingText: { 
    color: DESIGN_TOKENS.colors.neonCyan, 
    fontSize: 9,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 0.5,
  },
  aiResult: {
    marginHorizontal: DESIGN_TOKENS.spacing.md,
    padding: DESIGN_TOKENS.spacing.md,
    borderRadius: DESIGN_TOKENS.radius.md,
    backgroundColor: 'rgba(0,229,255,0.03)',
    borderWidth: 1.5,
    borderColor: DESIGN_TOKENS.colors.neonCyan,
    gap: 8,
    marginBottom: 16,
  },
  aiResultTitle: {
    fontSize: 9,
    fontWeight: '900',
    color: DESIGN_TOKENS.colors.neonCyan,
    letterSpacing: 1.5,
  },
  aiResultRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  aiResultType: {
    fontSize: 14,
    fontWeight: '900',
    color: '#fff',
  },
  aiSpread: { 
    fontSize: 9, 
    color: DESIGN_TOKENS.colors.textMuted,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  gpsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: DESIGN_TOKENS.spacing.md,
    marginBottom: 20,
    padding: 8,
  },
  gpsPulseRing: {
    width: 12,
    height: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,229,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.3)',
  },
  gpsPulseDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: DESIGN_TOKENS.colors.neonCyan,
  },
  gpsText: { 
    fontSize: 9, 
    color: DESIGN_TOKENS.colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  submitBtn: { marginHorizontal: DESIGN_TOKENS.spacing.md },
});
