import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants';

function InfoRow({ icon, label, value, onPress }) {
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper style={styles.row} onPress={onPress}>
      <Ionicons name={icon} size={18} color={COLORS.primary} style={styles.rowIcon} />
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, onPress && { color: COLORS.primary }]} numberOfLines={1}>
        {value}
      </Text>
    </Wrapper>
  );
}

export default function AboutScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Brand */}
        <View style={styles.brand}>
          <View style={styles.badge}>
            <Ionicons name="storefront" size={40} color={COLORS.white} />
          </View>
          <Text style={styles.appName}>
            App<Text style={{ color: COLORS.secondary }}>ure</Text>
          </Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        <Text style={styles.description}>
          Appure is a marketplace for ready-made mobile apps. Browse, preview,
          and buy production-ready apps — each purchase gives you the APK, AAB, and
          full source code, ready to publish or customize.
        </Text>

        {/* Details */}
        <View style={styles.card}>
          <InfoRow icon="cube-outline" label="Version" value="1.0.0" />
          <View style={styles.divider} />
          <InfoRow icon="code-slash-outline" label="Built with" value="React Native · Expo" />
          <View style={styles.divider} />
          <InfoRow
            icon="mail-outline"
            label="Contact"
            value="support@appure.com"
            onPress={() => Linking.openURL('mailto:support@appure.com')}
          />
        </View>

        <Text style={styles.copyright}>© 2026 Appure. All rights reserved.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 52,
    paddingBottom: 12,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  content: { padding: 20, paddingTop: 12 },
  brand: { alignItems: 'center', marginBottom: 24 },
  badge: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  appName: { fontSize: 26, fontWeight: '800', color: COLORS.text },
  version: { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  rowIcon: { marginRight: 12 },
  rowLabel: { fontSize: 14, color: COLORS.text, flex: 1 },
  rowValue: { fontSize: 13, color: COLORS.textSecondary, maxWidth: '55%' },
  divider: { height: 1, backgroundColor: COLORS.border },
  copyright: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center', marginTop: 28 },
});
