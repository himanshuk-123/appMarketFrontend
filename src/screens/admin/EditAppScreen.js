import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, CATEGORIES } from '../../constants';
import { updateApp, addScreenshot, deleteScreenshot } from '../../api/apps';
import FileUploadField from '../../components/FileUploadField';
import ScreenshotsField from '../../components/ScreenshotsField';

export default function EditAppScreen({ route, navigation }) {
  const { app } = route.params;

  const [form, setForm] = useState({
    name: app.name || '',
    description: app.description || '',
    version: app.version || '1.0.0',
    price: app.price?.toString() || '',
    category: app.category || 'tools',
    thumbnail: app.thumbnail || '',
    previewUrl: app.previewUrl || '',
    apkUrl: app.apkUrl || '',
    aabUrl: app.aabUrl || '',
    codeZipUrl: app.codeZipUrl || '',
  });
  const [screenshots, setScreenshots] = useState(app.screenshots || []);
  const [loading, setLoading] = useState(false);

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleAddScreenshot = async (url) => {
    try {
      const res = await addScreenshot(app.id, url, screenshots.length);
      setScreenshots((prev) => [...prev, res.data.screenshot]);
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const handleDeleteScreenshot = async (index, item) => {
    try {
      if (item.id) {
        await deleteScreenshot(app.id, item.id);
      }
      setScreenshots((prev) => prev.filter((_, i) => i !== index));
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const handleUpdate = async () => {
    if (!form.name || !form.description || !form.price) {
      Alert.alert('Missing Fields', 'Name, description, and price are required');
      return;
    }

    setLoading(true);
    try {
      const payload = { ...form, price: parseFloat(form.price) };

      await updateApp(app.id, payload);
      Alert.alert('Updated! ✅', 'App updated successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.topTitle} numberOfLines={1}>Edit — {app.name}</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* App Info Section */}
        <Text style={styles.sectionTitle}>App Information</Text>

        {/* Category */}
        <Text style={styles.label}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.catChip, form.category === cat.id && styles.catChipActive]}
              onPress={() => updateField('category', cat.id)}
            >
              <Text style={[styles.catText, form.category === cat.id && styles.catTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Basic Info Fields */}
        {[
          { key: 'name', label: 'App Name' },
          { key: 'description', label: 'Description', multiline: true },
          { key: 'version', label: 'Version' },
          { key: 'price', label: 'Price (₹)', keyboardType: 'numeric' },
        ].map((field) => (
          <View key={field.key} style={styles.inputGroup}>
            <Text style={styles.label}>{field.label}</Text>
            <TextInput
              style={[styles.input, field.multiline && styles.textarea]}
              value={form[field.key]}
              onChangeText={(v) => updateField(field.key, v)}
              keyboardType={field.keyboardType || 'default'}
              multiline={field.multiline || false}
              numberOfLines={field.multiline ? 4 : 1}
              autoCapitalize="none"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>
        ))}

        {/* Files Section */}
        <Text style={styles.sectionTitle}>Files & Media</Text>
        <View style={styles.notice}>
          <Ionicons name="information-circle-outline" size={15} color={COLORS.primary} />
          <Text style={styles.noticeText}>
            Tap "Replace File" to upload a new file. Leave unchanged to keep the existing file.
          </Text>
        </View>

        <FileUploadField
          type="thumbnail"
          label="App Thumbnail"
          icon="image-outline"
          color={COLORS.primary}
          value={form.thumbnail}
          onChange={(url) => updateField('thumbnail', url)}
        />

        <ScreenshotsField
          screenshots={screenshots}
          onAdd={handleAddScreenshot}
          onDelete={handleDeleteScreenshot}
        />

        <FileUploadField
          type="apk"
          label="APK File"
          icon="phone-portrait-outline"
          color={COLORS.success}
          value={form.apkUrl}
          onChange={(url) => updateField('apkUrl', url)}
        />
        <FileUploadField
          type="aab"
          label="AAB File"
          icon="cube-outline"
          color={COLORS.warning}
          value={form.aabUrl}
          onChange={(url) => updateField('aabUrl', url)}
        />
        <FileUploadField
          type="code"
          label="Source Code (ZIP)"
          icon="code-slash-outline"
          color={COLORS.secondary}
          value={form.codeZipUrl}
          onChange={(url) => updateField('codeZipUrl', url)}
        />

        <FileUploadField
          type="video"
          label="Demo Video"
          icon="videocam-outline"
          color="#E91E8C"
          value={form.previewUrl}
          onChange={(url) => updateField('previewUrl', url)}
        />

        {/* Save Button */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="save-outline" size={20} color={COLORS.white} />
              <Text style={styles.saveBtnText}>  Save Changes</Text>
            </>
          )}
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 54,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  topTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, flex: 1, marginHorizontal: 12 },
  content: { padding: 20, paddingBottom: 50 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 16, marginTop: 8 },
  label: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 8, fontWeight: '500' },
  inputGroup: { marginBottom: 18 },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    color: COLORS.text,
    fontSize: 14,
  },
  textarea: { height: 100, textAlignVertical: 'top' },
  catScroll: { marginBottom: 20 },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  catChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catText: { fontSize: 13, color: COLORS.textSecondary },
  catTextActive: { color: COLORS.white },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.primary + '15',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  noticeText: { fontSize: 12, color: COLORS.textSecondary, flex: 1, lineHeight: 17 },
  fileCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  fileCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  fileIcon: { width: 34, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  fileLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.text },
  setbadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '22',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
  },
  setBadgeText: { fontSize: 11, color: COLORS.success, fontWeight: '600' },
  fileInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    color: COLORS.text,
    fontSize: 13,
  },
  hintRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 8, gap: 5 },
  hintText: { fontSize: 11, color: COLORS.textMuted, flex: 1, lineHeight: 16 },
  convertedRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 5 },
  convertedText: { fontSize: 11, color: COLORS.success },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  saveBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
});
