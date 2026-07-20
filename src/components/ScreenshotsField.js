import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Image, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import client from '../api/client';

const MAX_SCREENSHOTS = 5;

// Upload that retries once on a transient failure (the first request in a
// session sometimes fails on a cold connection, then succeeds immediately).
async function uploadWithRetry(url, formData, timeout, attempts = 2) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      return await client.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout,
      });
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1) await new Promise((r) => setTimeout(r, 800));
    }
  }
  throw lastErr;
}

/**
 * ScreenshotsField
 *
 * Props:
 *   screenshots  — array of { id?, imageUrl } objects (existing screenshots)
 *   onAdd        — callback(imageUrl) when a new screenshot is uploaded
 *   onDelete     — callback(index, item) when a screenshot is removed
 */
export default function ScreenshotsField({ screenshots = [], onAdd, onDelete, onUploadStart, onUploadEnd }) {
  const [uploading, setUploading] = useState(false);

  const pickAndUpload = async () => {
    if (screenshots.length >= MAX_SCREENSHOTS) {
      Alert.alert('Limit Reached', `You can upload up to ${MAX_SCREENSHOTS} screenshots.`);
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.85,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    setUploading(true);
    onUploadStart?.();
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: asset.uri,
        name: asset.fileName || `screenshot_${Date.now()}.jpg`,
        type: asset.mimeType || 'image/jpeg',
      });

      const res = await uploadWithRetry('/upload?type=screenshot', formData, 60000);

      onAdd(res.data.url);
    } catch (err) {
      Alert.alert('Upload Failed', err.message || 'Could not upload screenshot');
    } finally {
      setUploading(false);
      onUploadEnd?.();
    }
  };

  const confirmDelete = (index, item) => {
    Alert.alert('Remove Screenshot', 'Remove this screenshot?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => onDelete(index, item) },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>Screenshots</Text>
        <Text style={styles.count}>{screenshots.length}/{MAX_SCREENSHOTS}</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        {screenshots.map((item, index) => (
          <View key={index} style={styles.thumbWrap}>
            <Image source={{ uri: item.imageUrl }} style={styles.thumb} resizeMode="cover" />
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => confirmDelete(index, item)}
            >
              <Ionicons name="close-circle" size={22} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        ))}

        {screenshots.length < MAX_SCREENSHOTS && (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={pickAndUpload}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : (
              <>
                <Ionicons name="add" size={28} color={COLORS.primary} />
                <Text style={styles.addText}>Add</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>

      <Text style={styles.hint}>Screenshots are shown in the app detail carousel (max {MAX_SCREENSHOTS})</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  count: { fontSize: 12, color: COLORS.textMuted },
  scroll: { marginBottom: 8 },
  thumbWrap: {
    position: 'relative',
    marginRight: 10,
  },
  thumb: {
    width: 100,
    height: 160,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
  },
  deleteBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.card,
    borderRadius: 11,
  },
  addBtn: {
    width: 100,
    height: 160,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary + '10',
  },
  addText: { fontSize: 12, color: COLORS.primary, fontWeight: '600', marginTop: 4 },
  hint: { fontSize: 11, color: COLORS.textMuted },
});
