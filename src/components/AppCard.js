import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import { toImageLink } from '../utils/gdrive';

function PreviewBadge() {
  return (
    <View style={styles.previewBadge}>
      <Ionicons name="play" size={9} color={COLORS.white} />
      <Text style={styles.previewBadgeText}>Preview</Text>
    </View>
  );
}

export default function AppCard({ app, onPress, grid }) {
  const thumbSource = {
    uri: toImageLink(app.thumbnail) || 'https://placehold.co/120x120/1A1A2E/6C63FF?text=App',
  };
  const hasPreview = !!app.livePreviewUrl;

  if (grid) {
    return (
      <TouchableOpacity style={styles.gridCard} onPress={onPress} activeOpacity={0.85}>
        <View style={styles.gridThumbWrap}>
          <Image source={thumbSource} style={styles.gridThumb} />
          {hasPreview ? <PreviewBadge /> : null}
        </View>
        <View style={styles.gridInfo}>
          <Text style={styles.name} numberOfLines={1}>{app.name}</Text>
          <Text style={styles.desc} numberOfLines={2}>{app.description}</Text>
          <View style={styles.gridFooter}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText} numberOfLines={1}>{app.category}</Text>
            </View>
            <Text style={styles.price}>₹{app.price}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.thumbWrap}>
        <Image source={thumbSource} style={styles.thumbnail} />
        {hasPreview ? <PreviewBadge /> : null}
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{app.name}</Text>
        <Text style={styles.desc} numberOfLines={2}>{app.description}</Text>
        <View style={styles.footer}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{app.category}</Text>
          </View>
          <Text style={styles.price}>₹{app.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    flexDirection: 'row',
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  thumbWrap: { width: 80, height: 80 },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
  },
  info: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },

  // Grid variant
  gridCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  gridThumbWrap: { width: '100%', height: 130 },
  gridThumb: {
    width: '100%',
    height: 130,
    backgroundColor: COLORS.surface,
  },
  gridInfo: { padding: 10 },
  gridFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },

  // "Preview" badge overlay
  previewBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  previewBadgeText: { fontSize: 9, color: COLORS.white, fontWeight: '700' },

  name: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  desc: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4, lineHeight: 17 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  categoryBadge: {
    backgroundColor: COLORS.surface,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexShrink: 1,
  },
  categoryText: { fontSize: 11, color: COLORS.textSecondary },
  price: { fontSize: 15, fontWeight: '800', color: COLORS.primary, marginLeft: 6 },
});
