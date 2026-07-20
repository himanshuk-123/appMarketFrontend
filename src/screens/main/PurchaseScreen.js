import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants';
import { purchaseApp } from '../../api/purchases';

const FALLBACK_IMG = require('../../../assets/AppMarketIcon.png');

export default function PurchaseScreen({ route, navigation }) {
  const { app } = route.params;
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      await purchaseApp(app.id);
      Alert.alert(
        'Purchase Successful! 🎉',
        'You can now download the APK, AAB, and source code from My Apps.',
        [{ text: 'Go to My Apps', onPress: () => navigation.navigate('MyPurchases') }]
      );
    } catch (err) {
      Alert.alert('Purchase Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={22} color={COLORS.text} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Order Summary</Text>

        {/* App preview */}
        <View style={styles.appCard}>
          <Image
            source={app.thumbnail ? { uri: app.thumbnail } : FALLBACK_IMG}
            style={styles.appThumb}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.appName}>{app.name}</Text>
            <Text style={styles.appCategory}>{app.category}</Text>
          </View>
        </View>

        {/* What you get */}
        <Text style={styles.sectionTitle}>What's included</Text>
        {[
          { icon: 'code-slash-outline', text: 'Full Source Code (ZIP)', color: COLORS.primary },
          { icon: 'phone-portrait-outline', text: 'APK File (Android Install)', color: COLORS.success },
          { icon: 'cube-outline', text: 'AAB File (Play Store Ready)', color: COLORS.warning },
          { icon: 'infinite-outline', text: 'Lifetime Access', color: COLORS.secondary },
        ].map((item) => (
          <View style={styles.includeRow} key={item.text}>
            <View style={[styles.includeIcon, { backgroundColor: item.color + '22' }]}>
              <Ionicons name={item.icon} size={18} color={item.color} />
            </View>
            <Text style={styles.includeText}>{item.text}</Text>
          </View>
        ))}

        {/* Price breakdown */}
        <View style={styles.priceBox}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>App Price</Text>
            <Text style={styles.priceValue}>₹{app.price}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { fontWeight: '700', color: COLORS.text }]}>Total</Text>
            <Text style={styles.totalPrice}>₹{app.price}</Text>
          </View>
        </View>

        {/* Payment note */}
        <View style={styles.dummyNotice}>
          <Ionicons name="information-circle-outline" size={16} color={COLORS.warning} />
          <Text style={styles.dummyText}>  Demo mode — payment gateway will be integrated soon</Text>
        </View>
      </ScrollView>

      {/* CTA */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.payBtn} onPress={handlePurchase} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="lock-closed" size={18} color={COLORS.white} />
              <Text style={styles.payText}>  Confirm Purchase — ₹{app.price}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  backBtn: { position: 'absolute', top: 50, left: 16, zIndex: 10, padding: 8 },
  content: { padding: 20, paddingTop: 100 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: 24 },
  appCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 14,
  },
  appThumb: { width: 60, height: 60, borderRadius: 12, backgroundColor: COLORS.surface },
  appName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  appCategory: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 14 },
  includeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  includeIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  includeText: { fontSize: 14, color: COLORS.text },
  priceBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  priceLabel: { fontSize: 14, color: COLORS.textSecondary },
  priceValue: { fontSize: 14, color: COLORS.text },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 8 },
  totalPrice: { fontSize: 20, fontWeight: '800', color: COLORS.primary },
  dummyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: COLORS.warning + '15',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.warning + '40',
  },
  dummyText: { fontSize: 12, color: COLORS.warning, flex: 1 },
  bottomBar: { padding: 16, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.surface },
  payBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  payText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
});
