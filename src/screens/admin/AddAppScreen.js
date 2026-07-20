import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, CATEGORIES } from '../../constants';
import { createApp, addScreenshot } from '../../api/apps';
import FileUploadField from '../../components/FileUploadField';
import ScreenshotsField from '../../components/ScreenshotsField';

const EMPTY_FORM = {
  name: '', description: '', version: '1.0.0', price: '',
  category: 'tools', thumbnail: '', previewUrl: '', livePreviewUrl: '',
  apkUrl: '', aabUrl: '', codeZipUrl: '',
};

export default function AddAppScreen({ navigation }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [screenshots, setScreenshots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeUploads, setActiveUploads] = useState(0);

  const onUploadStart = () => setActiveUploads((n) => n + 1);
  const onUploadEnd   = () => setActiveUploads((n) => Math.max(0, n - 1));

  // Reset form every time screen is opened
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setForm(EMPTY_FORM);
      setScreenshots([]);
      setActiveUploads(0);
    });
    return unsubscribe;
  }, [navigation]);

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (activeUploads > 0) {
      Alert.alert('Upload In Progress', 'Please wait for all files to finish uploading before publishing.');
      return;
    }
    if (!form.name || !form.description || !form.price) {
      Alert.alert('Missing Fields', 'App name, description, and price are required');
      return;
    }
    if (!form.thumbnail) {
      Alert.alert('Missing Thumbnail', 'Please upload a thumbnail image');
      return;
    }
    // APK / AAB / source code are optional — you can publish a design-only
    // listing now and add the real files later when the app is built.

    setLoading(true);
    try {
      const res = await createApp({ ...form, price: parseFloat(form.price) });
      const appId = res.data.app.id;

      // Save screenshots linked to the new app
      await Promise.all(
        screenshots.map((s, i) => addScreenshot(appId, s.imageUrl, i))
      );

      Alert.alert('App Added! 🎉', 'The app is now live in the marketplace.', [
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
        <Text style={styles.topTitle}>Add New App</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* App Info */}
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

        {[
          { key: 'name', label: 'App Name', placeholder: 'e.g. Restaurant Booking App' },
          { key: 'description', label: 'Description', placeholder: 'Describe the app in detail...', multiline: true },
          { key: 'version', label: 'Version', placeholder: '1.0.0' },
          { key: 'price', label: 'Price (₹)', placeholder: '999', keyboardType: 'numeric' },
        ].map((field) => (
          <View key={field.key} style={styles.inputGroup}>
            <Text style={styles.label}>{field.label}</Text>
            <TextInput
              style={[styles.input, field.multiline && styles.textarea]}
              placeholder={field.placeholder}
              placeholderTextColor={COLORS.textMuted}
              value={form[field.key]}
              onChangeText={(v) => updateField(field.key, v)}
              keyboardType={field.keyboardType || 'default'}
              multiline={field.multiline || false}
              numberOfLines={field.multiline ? 4 : 1}
              autoCapitalize="none"
            />
          </View>
        ))}

        {/* Live Preview URL */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Live Preview Link (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="https://preview.appure.com/your-app"
            placeholderTextColor={COLORS.textMuted}
            value={form.livePreviewUrl}
            onChangeText={(v) => updateField('livePreviewUrl', v)}
            autoCapitalize="none"
            keyboardType="url"
          />
          <Text style={styles.fieldHint}>
            Paste the hosted interactive preview link. Buyers tap "Try Live Preview" to explore the app before buying.
          </Text>
        </View>

        {/* Files & Media */}
        <Text style={styles.sectionTitle}>Files & Media</Text>

        <FileUploadField
          type="thumbnail"
          label="App Thumbnail"
          icon="image-outline"
          color={COLORS.primary}
          value={form.thumbnail}
          onChange={(url) => updateField('thumbnail', url)}
          onUploadStart={onUploadStart}
          onUploadEnd={onUploadEnd}
          required
        />

        <ScreenshotsField
          screenshots={screenshots}
          onAdd={(url) => setScreenshots((prev) => [...prev, { imageUrl: url }])}
          onDelete={(index) => setScreenshots((prev) => prev.filter((_, i) => i !== index))}
          onUploadStart={onUploadStart}
          onUploadEnd={onUploadEnd}
        />

        <FileUploadField
          type="apk"
          label="APK File"
          icon="phone-portrait-outline"
          color={COLORS.success}
          value={form.apkUrl}
          onChange={(url) => updateField('apkUrl', url)}
          onUploadStart={onUploadStart}
          onUploadEnd={onUploadEnd}
        />

        <FileUploadField
          type="aab"
          label="AAB File"
          icon="cube-outline"
          color={COLORS.warning}
          value={form.aabUrl}
          onChange={(url) => updateField('aabUrl', url)}
          onUploadStart={onUploadStart}
          onUploadEnd={onUploadEnd}
        />

        <FileUploadField
          type="code"
          label="Source Code (ZIP)"
          icon="code-slash-outline"
          color={COLORS.secondary}
          value={form.codeZipUrl}
          onChange={(url) => updateField('codeZipUrl', url)}
          onUploadStart={onUploadStart}
          onUploadEnd={onUploadEnd}
        />

        <FileUploadField
          type="video"
          label="Demo Video"
          icon="videocam-outline"
          color="#E91E8C"
          value={form.previewUrl}
          onChange={(url) => updateField('previewUrl', url)}
          onUploadStart={onUploadStart}
          onUploadEnd={onUploadEnd}
        />

        {activeUploads > 0 && (
          <View style={styles.uploadingBanner}>
            <ActivityIndicator size="small" color={COLORS.warning} />
            <Text style={styles.uploadingText}>
              {'  '}Uploading {activeUploads} file{activeUploads > 1 ? 's' : ''}... please wait
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.submitBtn, (loading || activeUploads > 0) && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading || activeUploads > 0}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="cloud-done-outline" size={20} color={COLORS.white} />
              <Text style={styles.submitText}>  Add App to Marketplace</Text>
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
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  topTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
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
  fieldHint: { fontSize: 11, color: COLORS.textMuted, marginTop: 6, lineHeight: 16 },
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
  uploadingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '18',
    borderWidth: 1,
    borderColor: COLORS.warning + '40',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  uploadingText: { fontSize: 13, color: COLORS.warning, fontWeight: '600' },
  submitBtnDisabled: { backgroundColor: COLORS.textMuted },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
});
