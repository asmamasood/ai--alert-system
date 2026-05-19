import React from 'react';
import {
  View, Text, StyleSheet, Pressable, Image,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { MediaAttachment } from '../../types/incident.types';
import { DESIGN_TOKENS } from '../../constants/mapThemes';

interface MediaUploaderProps {
  media: MediaAttachment[];
  onAddCamera: () => void;
  onAddGallery: () => void;
  onRemove: (id: string) => void;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  media, onAddCamera, onAddGallery, onRemove,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
        {/* Camera button */}
        <Pressable onPress={onAddCamera} style={styles.addBtn}>
          <Text style={styles.addIcon}>📷</Text>
          <Text style={styles.addLabel}>Camera</Text>
        </Pressable>

        {/* Gallery button */}
        <Pressable onPress={onAddGallery} style={styles.addBtn}>
          <Text style={styles.addIcon}>🖼️</Text>
          <Text style={styles.addLabel}>Gallery</Text>
        </Pressable>

        {/* Previews */}
        {media.map((m) => (
          <View key={m.id} style={styles.preview}>
            <Image source={{ uri: m.uri }} style={styles.thumb} />
            <Pressable onPress={() => onRemove(m.id)} style={styles.removeBtn}>
              <Text style={styles.removeText}>✕</Text>
            </Pressable>
            {m.type === 'video' && (
              <View style={styles.videoBadge}>
                <Text style={styles.videoBadgeText}>▶</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: DESIGN_TOKENS.spacing.md, marginBottom: 4 },
  row: { flexDirection: 'row' },
  addBtn: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: DESIGN_TOKENS.colors.glassBorder,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  addIcon: { fontSize: 24 },
  addLabel: { fontSize: 10, color: DESIGN_TOKENS.colors.textMuted, marginTop: 4 },
  preview: {
    width: 80, height: 80, borderRadius: 12,
    marginRight: 10, overflow: 'hidden', position: 'relative',
  },
  thumb: { width: '100%', height: '100%' },
  removeBtn: {
    position: 'absolute', top: 2, right: 2,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center', justifyContent: 'center',
  },
  removeText: { color: '#fff', fontSize: 10 },
  videoBadge: {
    position: 'absolute', bottom: 4, left: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 4, padding: 2,
  },
  videoBadgeText: { color: '#fff', fontSize: 9 },
});
