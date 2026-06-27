import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants';
import { getAppById, deleteApp } from '../../api/apps';

function ConfigRow({ icon, label, value, color, onOpen }) {
  const hasValue = value && value !== 'null' && value !== 'undefined';
  return (
    <View style={styles.configRow}>
      <View style={[styles.configIcon, { backgroundColor: (color || COLORS.primary) + '22' }]}>
        <Ionicons name={icon} size={18} color={color || COLORS.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.configLabel}>{label}</Text>
        <Text style={[styles.configValue, !hasValue && styles.configEmpty]} numberOfLines={1}>
          {hasValue ? value : 'Not set'}
        </Text>
      </View>
      {hasValue && onOpen && (
        <TouchableOpacity onPress={onOpen} style={styles.openBtn}>
          <Ionicons name="open-outline" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      )}
      {hasValue && !onOpen && (
        <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
      )}
      {!hasValue && (
        <Ionicons name="alert-circle-outline" size={18} color={COLORS.warning} />
      )}
    </View>
  );
}

export default function AdminAppDetailScreen({ route, navigation }) {
  const { appId } = route.params;
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchApp = useCallback(async () => {
    try {
      const res = await getAppById(appId);
      setApp(res.data.app);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }, [appId]);

  useEffect(() => {
    fetchApp();
  }, [fetchApp]);

  // Refresh app data when coming back from EditAppScreen
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (app) fetchApp();
    });
    return unsubscribe;
  }, [navigation, app]);

  const handleDelete = () => {
    Alert.alert(
      'Remove App',
      `"${app?.name}" will be hidden from the marketplace. Existing buyers can still download it.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteApp(appId);
              navigation.goBack();
            } catch (err) {
              Alert.alert('Error', err.message);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  if (!app) return null;

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.topTitle} numberOfLines={1}>App Details</Text>
        <View style={styles.topActions}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate('EditApp', { app })}
          >
            <Ionicons name="pencil" size={16} color={COLORS.white} />
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={18} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Thumbnail */}
        <Image
          source={app.thumbnail ? { uri: app.thumbnail } : { uri: '' }}
          style={styles.thumbnail}
        />

        {/* App Name & Category */}
        <View style={styles.titleSection}>
          <Text style={styles.appName}>{app.name}</Text>
          <View style={styles.badges}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{app.category}</Text>
            </View>
            <View style={[styles.categoryBadge, { backgroundColor: COLORS.success + '22', borderColor: COLORS.success + '40' }]}>
              <Text style={[styles.categoryText, { color: COLORS.success }]}>v{app.version}</Text>
            </View>
            <View style={[styles.categoryBadge, { backgroundColor: COLORS.primary + '22', borderColor: COLORS.primary + '40' }]}>
              <Text style={[styles.categoryText, { color: COLORS.primary }]}>₹{app.price}</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{app.description}</Text>
        </View>

        {/* Files Configuration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Files & Configuration</Text>
          <View style={styles.configCard}>
            <ConfigRow
              icon="phone-portrait-outline"
              label="APK File"
              value={app.apkUrl ? 'Uploaded ✓' : null}
              color={COLORS.success}
              onOpen={app.apkUrl ? () => Linking.openURL(app.apkUrl) : null}
            />
            <View style={styles.divider} />
            <ConfigRow
              icon="cube-outline"
              label="AAB File"
              value={app.aabUrl ? 'Uploaded ✓' : null}
              color={COLORS.warning}
              onOpen={app.aabUrl ? () => Linking.openURL(app.aabUrl) : null}
            />
            <View style={styles.divider} />
            <ConfigRow
              icon="code-slash-outline"
              label="Source Code (ZIP)"
              value={app.codeZipUrl ? 'Uploaded ✓' : null}
              color={COLORS.secondary}
              onOpen={app.codeZipUrl ? () => Linking.openURL(app.codeZipUrl) : null}
            />
            <View style={styles.divider} />
            <ConfigRow
              icon="eye-outline"
              label="Live Preview URL"
              value={app.previewUrl || null}
              color={COLORS.textSecondary}
              onOpen={app.previewUrl ? () => Linking.openURL(app.previewUrl) : null}
            />
          </View>
        </View>

        {/* Meta Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meta</Text>
          <View style={styles.configCard}>
            <ConfigRow icon="calendar-outline" label="Created" value={new Date(app.createdAt).toLocaleDateString()} />
            <View style={styles.divider} />
            <ConfigRow
              icon="eye-outline"
              label="Status"
              value={app.isActive ? 'Active — visible to users' : 'Hidden'}
              color={app.isActive ? COLORS.success : COLORS.error}
            />
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 54,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 10,
  },
  iconBtn: { padding: 4 },
  topTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: COLORS.text },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    gap: 5,
  },
  editBtnText: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  deleteBtn: {
    backgroundColor: COLORS.error + '22',
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: COLORS.error + '40',
  },
  content: { paddingBottom: 40 },
  thumbnail: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    backgroundColor: COLORS.surface,
  },
  titleSection: { padding: 20, paddingBottom: 8 },
  appName: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginBottom: 10 },
  badges: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  categoryBadge: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
  section: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.6 },
  description: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },
  configCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  configRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  configIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  configLabel: { fontSize: 12, color: COLORS.textMuted, marginBottom: 2 },
  configValue: { fontSize: 14, color: COLORS.text, fontWeight: '500' },
  configEmpty: { color: COLORS.textMuted, fontStyle: 'italic' },
  openBtn: {
    backgroundColor: COLORS.primary + '22',
    borderRadius: 8,
    padding: 6,
  },
  divider: { height: 1, backgroundColor: COLORS.border, marginLeft: 62 },
});
