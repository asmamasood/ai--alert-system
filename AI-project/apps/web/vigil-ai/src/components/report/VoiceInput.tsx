import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { DESIGN_TOKENS } from '../../constants/mapThemes';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscript }) => {
  // Voice recording — real implementation uses expo-av + Speech APIs
  // Simulated for dev
  const handlePress = () => {
    setTimeout(() => {
      onTranscript('There is a flood near the bridge, water level is very high');
    }, 1500);
  };

  return (
    <Pressable onPress={handlePress} style={styles.btn}>
      <Text style={styles.icon}>🎙️</Text>
      <Text style={styles.label}>Hold to Speak</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.glassBorder,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  icon: { fontSize: 18 },
  label: { fontSize: DESIGN_TOKENS.fontSize.sm, color: DESIGN_TOKENS.colors.textSecondary },
});
