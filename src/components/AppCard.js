import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants';
import { toImageLink } from '../utils/gdrive';

export default function AppCard({ app, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <Image
        source={{ uri: toImageLink(app.thumbnail) || 'https://placehold.co/120x120/1A1A2E/6C63FF?text=App' }}
        style={styles.thumbnail}
      />
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
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
  },
  info: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
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
  },
  categoryText: { fontSize: 11, color: COLORS.textSecondary },
  price: { fontSize: 15, fontWeight: '800', color: COLORS.primary },
});
