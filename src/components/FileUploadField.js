import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Image, ActivityIndicator, Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import client from '../api/client';

/**
 * FileUploadField
 *
 * Props:
 *   type       — 'thumbnail' | 'apk' | 'aab' | 'code'
 *   label      — display label
 *   icon       — Ionicons icon name
 *   color      — accent color
 *   value      — current URL (if already uploaded)
 *   onChange   — callback(url) when upload completes
 *   required   — show Required badge
 */
export default function FileUploadField({ type, label, icon, color, value, onChange, required, onUploadStart, onUploadEnd }) {
  const [uploading, setUploading] = useState(false);

  const isImage = type === 'thumbnail';
  const isVideo = type === 'video';

  const pickAndUpload = async () => {
    try {
      let result;

      if (isImage || isVideo) {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Please allow access to your gallery.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: isVideo ? ['videos'] : ['images'],
          allowsEditing: isImage,
          aspect: isImage ? [1, 1] : undefined,
          quality: isImage ? 0.8 : 1,
          videoMaxDuration: 120, // 2 min max
        });
      } else {
        // Document picker for APK / AAB / ZIP
        const mimeMap = {
          code: ['application/zip', 'application/x-zip-compressed', 'application/x-zip'],
        };
        result = await DocumentPicker.getDocumentAsync({
          type: mimeMap[type] || ['*/*'],
          copyToCacheDirectory: true,
        });
      }

      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];
      setUploading(true);
      onUploadStart?.();

      const formData = new FormData();
      formData.append('file', {
        uri: asset.uri,
        name: asset.fileName || asset.name || `upload.${isImage ? 'jpg' : isVideo ? 'mp4' : type}`,
        type: asset.mimeType || (isImage ? 'image/jpeg' : isVideo ? 'video/mp4' : 'application/octet-stream'),
      });

      const res = await client.post(`/upload?type=${type}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 300000, // 5 min for large video files
      });

      onChange(res.data.url);
    } catch (err) {
      Alert.alert('Upload Failed', err.message || 'Could not upload file');
    } finally {
      setUploading(false);
      onUploadEnd?.();
    }
  };

  const hasFile = !!value;
  const fileName = value ? value.split('/').pop() : null;

  return (
    <View style={styles.card}>
      {/* Header Row */}
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: (color || COLORS.primary) + '22' }]}>
          <Ionicons name={icon} size={18} color={color || COLORS.primary} />
        </View>
        <Text style={styles.label}>{label}</Text>
        {required && !hasFile && (
          <View style={styles.requiredBadge}>
            <Text style={styles.requiredText}>Required</Text>
          </View>
        )}
        {hasFile && (
          <View style={styles.doneBadge}>
            <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
            <Text style={styles.doneText}>Uploaded</Text>
          </View>
        )}
      </View>

      {/* Thumbnail preview */}
      {isImage && hasFile && (
        <Image source={{ uri: value }} style={styles.preview} resizeMode="cover" />
      )}

      {/* File name for non-images */}
      {!isImage && hasFile && (
        <View style={styles.fileNameRow}>
          <Ionicons name="document-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.fileName} numberOfLines={1}>{fileName}</Text>
        </View>
      )}

      {/* Upload Button */}
      <TouchableOpacity
        style={[styles.uploadBtn, hasFile && styles.uploadBtnReplace]}
        onPress={pickAndUpload}
        disabled={uploading}
      >
        {uploading ? (
          <>
            <ActivityIndicator size="small" color={hasFile ? COLORS.primary : COLORS.white} />
            <Text style={[styles.uploadText, hasFile && styles.uploadTextReplace]}>
              {'  '}Uploading...
            </Text>
          </>
        ) : (
          <>
            <Ionicons
              name={hasFile ? 'refresh-outline' : isImage ? 'image-outline' : isVideo ? 'videocam-outline' : 'cloud-upload-outline'}
              size={18}
              color={hasFile ? COLORS.primary : COLORS.white}
            />
            <Text style={[styles.uploadText, hasFile && styles.uploadTextReplace]}>
              {'  '}{hasFile ? 'Replace File' : isImage ? 'Choose Image' : isVideo ? 'Choose Video' : 'Choose File'}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.text },
  requiredBadge: {
    backgroundColor: COLORS.error + '22',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  requiredText: { fontSize: 11, color: COLORS.error, fontWeight: '600' },
  doneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '22',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
  },
  doneText: { fontSize: 11, color: COLORS.success, fontWeight: '600' },
  preview: {
    width: '100%',
    height: 140,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: COLORS.surface,
  },
  fileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    gap: 8,
  },
  fileName: { fontSize: 12, color: COLORS.textSecondary, flex: 1 },
  uploadBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadBtnReplace: {
    backgroundColor: COLORS.primary + '18',
    borderWidth: 1,
    borderColor: COLORS.primary + '50',
  },
  uploadText: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  uploadTextReplace: { color: COLORS.primary },
});
