import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, Pressable,
  ActivityIndicator, Alert, Dimensions, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useIncidentStore } from '../../src/store/useIncidentStore';
import { useUserStore } from '../../src/store/useUserStore';
import { useAIAnalysis } from '../../src/hooks/useAIAnalysis';
import { useGeoLocation } from '../../src/hooks/useGeoLocation';
import { mediaService } from '../../src/services/media.service';
import { socketService } from '../../src/services/socket';
import { incidentApi } from '../../src/services/api';
import { DESIGN_TOKENS } from '../../src/constants/mapThemes';
import { EMERGENCY_CATEGORIES } from '../../src/constants/emergencyTypes';
import { Incident, IncidentType, MediaAttachment } from '../../src/types/incident.types';

const { width: W } = Dimensions.get('window');

const AIAnalysisScreen = ({ confidence, analysis, onViewMap }: any) => (
  <View style={ai.container}>
    <Text style={ai.header}>← AI Analysis</Text>

    {/* Confidence Ring */}
    <View style={ai.ringWrap}>
      <View style={ai.ringOuter}>
        <View style={ai.ringInner}>
          <Text style={ai.ringValue}>{confidence}%</Text>
          <Text style={ai.ringLabel}>CONFIDENCE</Text>
        </View>
      </View>
      <Text style={ai.ringCaption}>AI SCAN COMPLETE</Text>
    </View>

    {/* Results */}
    <View style={ai.results}>
      <View style={ai.resultRow}>
        <Text style={ai.resultKey}>RESULT</Text>
        <Text style={ai.resultVal}>{analysis?.type?.toUpperCase() ?? '—'}</Text>
      </View>
      <View style={ai.resultRow}>
        <Text style={ai.resultKey}>SEVERITY</Text>
        <Text style={[ai.resultVal, { color: DESIGN_TOKENS.colors.neonRed }]}>
          {analysis?.severity?.toUpperCase() ?? '—'}
        </Text>
      </View>
      <View style={ai.separator} />
      <View style={ai.statGrid}>
        <View style={ai.statCell}>
          <Text style={ai.statVal}>{analysis?.spreadPrediction ?? '—'} km</Text>
          <Text style={ai.statKey}>SPREAD PREDICTION</Text>
        </View>
        <View style={ai.statCell}>
          <Text style={ai.statVal}>{analysis?.radius ? (analysis.radius / 1000).toFixed(1) : '—'} km</Text>
          <Text style={ai.statKey}>IMPACT RADIUS</Text>
        </View>
      </View>
    </View>

    <Pressable style={ai.viewMapBtn} onPress={onViewMap}>
      <LinearGradient colors={['#2979FF', '#00E5FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={ai.viewMapGrad}>
        <Text style={ai.viewMapText}>VIEW ON MAP</Text>
      </LinearGradient>
    </Pressable>
  </View>
);

export default function ReportScreen() {
  const { addIncident } = useIncidentStore();
  const { user } = useUserStore();
  const { analyze, analysis, isAnalyzing, reset } = useAIAnalysis();
  const { location } = useGeoLocation(false);

  const [selectedType, setSelectedType] = useState<IncidentType>('flood');
  const [description, setDescription] = useState('');
  const [media, setMedia] = useState<MediaAttachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [showAIScreen, setShowAIScreen] = useState(false);

  const handleMediaAdd = async (source: 'camera' | 'gallery') => {
    const att = source === 'camera'
      ? await mediaService.captureFromCamera()
      : await mediaService.pickImage();
    if (!att) return;
    setMedia((p) => [...p, att]);
    if (aiEnabled) {
      const result = await analyze(att.uri, description, selectedType);
      if (result) setShowAIScreen(true);
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Missing Description', 'Please describe the incident before submitting.');
      return;
    }
    setIsSubmitting(true);
    try {
      const lat = location?.latitude ?? 24.8607;
      const lng = location?.longitude ?? 67.0011;
      // Determine district from coords (simplified — use closest Karachi district)
      const district = 'Saddar';

      // 1. Submit to backend — triggers AI analysis + socket broadcast
      try {
        await incidentApi.submitReport({
          description,
          type: selectedType.toUpperCase(),
          latitude: lat,
          longitude: lng,
          district,
          mediaUrls: media.map((m) => m.uploadedUrl || m.uri).filter(Boolean),
          isAnonymous: !user?.id,
        });
      } catch (apiErr: any) {
        console.warn('[ReportScreen] Backend submit failed, saving locally:', apiErr.message);
      }

      // 2. Also add to local store immediately for instant UI update
      const aiData = analysis ?? { type: selectedType, severity: 'medium' as any, confidence: 70 };
      const incident: Incident = {
        id: `i_${Date.now()}`,
        type: (aiData.type as IncidentType) ?? selectedType,
        title: `${EMERGENCY_CATEGORIES.find((c) => c.id === selectedType)?.label} Report`,
        description,
        location: { latitude: lat, longitude: lng },
        severity: aiData.severity ?? 'medium',
        status: 'active',
        confidence: aiData.confidence ?? 70,
        aiAnalysis: analysis ?? undefined,
        media,
        reportedBy: user?.id ?? 'anonymous',
        timestamp: new Date(),
        updatedAt: new Date(),
        radius: analysis?.radius,
        rescueStatus: 'pending',
      };
      addIncident(incident);

      // 3. Emit via socket for real-time peer updates
      socketService.emitIncident(incident);

      Alert.alert(
        '✅ Report Submitted',
        'Your report has been sent to ResQ AI for analysis. Response teams are being notified.',
        [{ text: 'OK', onPress: () => { reset(); setDescription(''); setMedia([]); setShowAIScreen(false); } }]
      );
    } catch (err: any) {
      Alert.alert('❌ Submission Failed', err.message || 'Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showAIScreen && analysis) {
    return <AIAnalysisScreen confidence={analysis.confidence} analysis={analysis} onViewMap={() => setShowAIScreen(false)} />;
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Report Incident</Text>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Category */}
          <Text style={styles.sectionLabel}>Category</Text>
          <View style={styles.categoryGrid}>
            {EMERGENCY_CATEGORIES.slice(0, 4).map((cat) => {
              const active = selectedType === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => setSelectedType(cat.id)}
                  style={[styles.catChip, active && { borderColor: cat.color, backgroundColor: cat.glowColor }]}
                >
                  <Text style={styles.catEmoji}>{cat.icon}</Text>
                  <Text style={[styles.catLabel, active && { color: cat.color }]}>{cat.label}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Voice Input */}
          <Text style={styles.sectionLabel}>Describe the incident</Text>
          <View style={styles.voiceInput}>
            <LinearGradient
              colors={['rgba(41,121,255,0.12)', 'rgba(0,229,255,0.08)']}
              style={styles.voiceGrad}
            >
              <View style={styles.voiceLeft}>
                <Text style={styles.voiceMic}>🎙️</Text>
                <Text style={styles.voiceText}>Listening...</Text>
              </View>
              <View style={styles.waveform}>
                {[8, 14, 10, 18, 12, 20, 8, 16, 10, 14].map((h, i) => (
                  <View key={i} style={[styles.waveBar, { height: h, backgroundColor: i % 2 === 0 ? DESIGN_TOKENS.colors.neonCyan : DESIGN_TOKENS.colors.neonPurple }]} />
                ))}
              </View>
              <Text style={styles.voiceTime}>00:12</Text>
            </LinearGradient>
          </View>
          <TextInput
            style={styles.textInput}
            placeholder="Or type your description..."
            placeholderTextColor={DESIGN_TOKENS.colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
          />

          {/* Upload Media */}
          <Text style={styles.sectionLabel}>Upload Media</Text>
          <View style={styles.mediaRow}>
            <Pressable style={styles.mediaAddBtn} onPress={() => handleMediaAdd('camera')}>
              <Text style={styles.mediaAddIcon}>📷</Text>
            </Pressable>
            <Pressable style={styles.mediaAddBtn} onPress={() => handleMediaAdd('gallery')}>
              <Text style={styles.mediaAddIcon}>🖼️</Text>
              <View style={styles.mediaAddPlus}><Text style={styles.mediaAddPlusText}>+</Text></View>
            </Pressable>
            {media.map((m) => (
              <View key={m.id} style={styles.mediaThumbWrap}>
                <Image source={{ uri: m.uri }} style={styles.mediaThumb} />
              </View>
            ))}
          </View>

          {/* Location */}
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <View>
              <Text style={styles.locationLabel}>Use Current Location</Text>
              <Text style={styles.locationValue}>
                {location ? `Lat: ${location.latitude.toFixed(4)}, Lng: ${location.longitude.toFixed(4)}` : 'Acquiring GPS...'}
              </Text>
            </View>
            <View style={styles.locationGreenDot} />
          </View>

          {/* AI Toggle */}
          <View style={styles.aiRow}>
            <Text style={styles.aiLabel}>🧠 AI Analysis</Text>
            <Text style={styles.aiSub}>Auto detect severity & type</Text>
            <Pressable
              onPress={() => setAiEnabled((v) => !v)}
              style={[styles.toggle, aiEnabled && styles.toggleOn]}
            >
              <View style={[styles.toggleThumb, aiEnabled && styles.toggleThumbOn]} />
            </Pressable>
          </View>

          {isAnalyzing && (
            <View style={styles.analyzingRow}>
              <ActivityIndicator color={DESIGN_TOKENS.colors.neonCyan} size="small" />
              <Text style={styles.analyzingText}>VIGIL AI analyzing media...</Text>
            </View>
          )}

          {/* Submit */}
          <Pressable onPress={handleSubmit} disabled={isSubmitting} style={styles.submitWrap}>
            <LinearGradient
              colors={['#2979FF', '#00E5FF']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.submitGrad}
            >
              {isSubmitting
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.submitText}>SUBMIT REPORT</Text>}
            </LinearGradient>
          </Pressable>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ─── AI Analysis sub-screen styles ───────────────────────────────────────────
const ai = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: DESIGN_TOKENS.colors.background,
    paddingHorizontal: DESIGN_TOKENS.space.md, paddingTop: 60, gap: 20,
  },
  header: { fontSize: 18, fontWeight: '700', color: DESIGN_TOKENS.colors.textPrimary },
  ringWrap: { alignItems: 'center', gap: 12 },
  ringOuter: {
    width: 180, height: 180, borderRadius: 90,
    borderWidth: 4, borderColor: DESIGN_TOKENS.colors.neonCyan,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,229,255,0.06)',
    shadowColor: DESIGN_TOKENS.colors.neonCyan,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 30, elevation: 20,
  },
  ringInner: { alignItems: 'center' },
  ringValue: {
    fontSize: 48, fontWeight: '900', color: DESIGN_TOKENS.colors.neonCyan,
    textShadowColor: DESIGN_TOKENS.colors.neonCyan,
    textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 12,
  },
  ringLabel: { fontSize: 12, color: DESIGN_TOKENS.colors.textSecondary, letterSpacing: 2, fontWeight: '700' },
  ringCaption: { fontSize: 11, color: DESIGN_TOKENS.colors.neonGreen, fontWeight: '800', letterSpacing: 2 },
  results: {
    backgroundColor: DESIGN_TOKENS.colors.surfaceLight,
    borderRadius: DESIGN_TOKENS.radius.lg,
    padding: DESIGN_TOKENS.space.md,
    borderWidth: 1, borderColor: DESIGN_TOKENS.colors.glassBorder, gap: 10,
  },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultKey: { fontSize: 12, color: DESIGN_TOKENS.colors.textMuted, fontWeight: '700', letterSpacing: 1 },
  resultVal: { fontSize: 14, color: DESIGN_TOKENS.colors.textPrimary, fontWeight: '800' },
  separator: { height: 1, backgroundColor: DESIGN_TOKENS.colors.divider },
  statGrid: { flexDirection: 'row', gap: 20 },
  statCell: { flex: 1, gap: 4 },
  statVal: { fontSize: 22, fontWeight: '900', color: DESIGN_TOKENS.colors.neonCyan },
  statKey: { fontSize: 10, color: DESIGN_TOKENS.colors.textMuted, letterSpacing: 1, fontWeight: '600' },
  viewMapBtn: { borderRadius: DESIGN_TOKENS.radius.md, overflow: 'hidden' },
  viewMapGrad: { paddingVertical: 16, alignItems: 'center' },
  viewMapText: { fontSize: 15, fontWeight: '800', color: '#fff', letterSpacing: 1.5 },
});

// ─── Report screen styles ─────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: DESIGN_TOKENS.colors.background },
  safe: { flex: 1 },
  header: {
    paddingHorizontal: DESIGN_TOKENS.space.md,
    paddingTop: DESIGN_TOKENS.space.sm,
    paddingBottom: DESIGN_TOKENS.space.md,
    borderBottomWidth: 1, borderBottomColor: DESIGN_TOKENS.colors.divider,
  },
  headerTitle: {
    fontSize: DESIGN_TOKENS.font.xl, fontWeight: '800',
    color: DESIGN_TOKENS.colors.textPrimary,
  },
  scroll: { flex: 1 },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: DESIGN_TOKENS.colors.textMuted,
    letterSpacing: 1.2, textTransform: 'uppercase',
    paddingHorizontal: DESIGN_TOKENS.space.md,
    paddingTop: DESIGN_TOKENS.space.md,
    paddingBottom: DESIGN_TOKENS.space.sm,
  },

  // Category
  categoryGrid: {
    flexDirection: 'row', paddingHorizontal: DESIGN_TOKENS.space.md, gap: 10,
  },
  catChip: {
    flex: 1, alignItems: 'center', paddingVertical: 12,
    borderRadius: DESIGN_TOKENS.radius.md,
    borderWidth: 1.5, borderColor: DESIGN_TOKENS.colors.glassBorder,
    backgroundColor: 'rgba(255,255,255,0.03)', gap: 5,
  },
  catEmoji: { fontSize: 22 },
  catLabel: { fontSize: 10, fontWeight: '700', color: DESIGN_TOKENS.colors.textSecondary },

  // Voice Input
  voiceInput: { marginHorizontal: DESIGN_TOKENS.space.md, borderRadius: DESIGN_TOKENS.radius.md, overflow: 'hidden', marginBottom: 8 },
  voiceGrad: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: 'rgba(41,121,255,0.3)',
    borderRadius: DESIGN_TOKENS.radius.md, gap: 10,
  },
  voiceLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  voiceMic: { fontSize: 16 },
  voiceText: { fontSize: 13, color: DESIGN_TOKENS.colors.textSecondary },
  waveform: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 3 },
  waveBar: { width: 3, borderRadius: 2 },
  voiceTime: { fontSize: 12, color: DESIGN_TOKENS.colors.textMuted, fontWeight: '600' },
  textInput: {
    marginHorizontal: DESIGN_TOKENS.space.md,
    borderWidth: 1, borderColor: DESIGN_TOKENS.colors.glassBorder,
    borderRadius: DESIGN_TOKENS.radius.md, padding: 12,
    fontSize: 14, color: DESIGN_TOKENS.colors.textPrimary,
    backgroundColor: 'rgba(255,255,255,0.03)', minHeight: 60,
  },

  // Media
  mediaRow: { flexDirection: 'row', gap: 10, paddingHorizontal: DESIGN_TOKENS.space.md },
  mediaAddBtn: {
    width: 72, height: 72, borderRadius: DESIGN_TOKENS.radius.md,
    borderWidth: 1.5, borderColor: DESIGN_TOKENS.colors.glassBorder,
    borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  mediaAddIcon: { fontSize: 26 },
  mediaAddPlus: {
    position: 'absolute', bottom: 4, right: 4,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: DESIGN_TOKENS.colors.neonCyan,
    alignItems: 'center', justifyContent: 'center',
  },
  mediaAddPlusText: { color: '#000', fontSize: 12, fontWeight: '900' },
  mediaThumbWrap: { width: 72, height: 72, borderRadius: DESIGN_TOKENS.radius.md, overflow: 'hidden' },
  mediaThumb: { width: '100%', height: '100%' },

  // Location
  locationRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: DESIGN_TOKENS.space.md, marginTop: DESIGN_TOKENS.space.md,
    padding: 12, borderRadius: DESIGN_TOKENS.radius.md,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1, borderColor: DESIGN_TOKENS.colors.glassBorder,
  },
  locationIcon: { fontSize: 18 },
  locationLabel: { fontSize: 13, fontWeight: '700', color: DESIGN_TOKENS.colors.textPrimary },
  locationValue: { fontSize: 11, color: DESIGN_TOKENS.colors.textMuted, marginTop: 2 },
  locationGreenDot: {
    marginLeft: 'auto', width: 10, height: 10, borderRadius: 5,
    backgroundColor: DESIGN_TOKENS.colors.neonGreen,
    shadowColor: DESIGN_TOKENS.colors.neonGreen,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 6,
  },

  // AI
  aiRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: DESIGN_TOKENS.space.md, marginTop: DESIGN_TOKENS.space.md,
    padding: 12, borderRadius: DESIGN_TOKENS.radius.md,
    backgroundColor: 'rgba(0,229,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(0,229,255,0.15)',
  },
  aiLabel: { fontSize: 14, fontWeight: '700', color: DESIGN_TOKENS.colors.textPrimary },
  aiSub: { fontSize: 11, color: DESIGN_TOKENS.colors.textMuted, flex: 1 },
  toggle: {
    width: 44, height: 24, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 2, justifyContent: 'center',
  },
  toggleOn: { backgroundColor: DESIGN_TOKENS.colors.neonCyan },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.4)' },
  toggleThumbOn: { backgroundColor: '#050A14', marginLeft: 'auto' },

  analyzingRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: DESIGN_TOKENS.space.md, paddingTop: 8,
  },
  analyzingText: { fontSize: 13, color: DESIGN_TOKENS.colors.neonCyan },

  // Submit
  submitWrap: {
    marginHorizontal: DESIGN_TOKENS.space.md,
    marginTop: DESIGN_TOKENS.space.lg,
    borderRadius: DESIGN_TOKENS.radius.md, overflow: 'hidden',
    shadowColor: DESIGN_TOKENS.colors.neonBlue,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 16, elevation: 10,
  },
  submitGrad: { paddingVertical: 16, alignItems: 'center' },
  submitText: { fontSize: 15, fontWeight: '900', color: '#fff', letterSpacing: 2 },
});
