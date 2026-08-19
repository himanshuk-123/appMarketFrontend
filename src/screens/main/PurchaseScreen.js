import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants';
import { purchaseApp } from '../../api/purchases';
import { useTheme } from '../../context/ThemeContext';

const FALLBACK_IMG = require('../../../assets/AppMarketIcon.png');

export default function PurchaseScreen({ route, navigation }) {
  const { app } = route.params;
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const isFree = Number(app.price) === 0;

  const handlePurchase = async () => {
    setLoading(true);
    try {
      await purchaseApp(app.id);
      Alert.alert(
        isFree ? 'App Claimed! 🎉' : 'Purchase Successful! 🎉',
        'You can now download the APK, AAB, and source code from My Apps.',
        [{ text: 'Go to My Apps', onPress: () => navigation.navigate('MyPurchases') }]
      );
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={22} color={theme.text} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Order Summary</Text>

        {/* App preview */}
        <View style={[styles.appCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Image
            source={app.thumbnail ? { uri: app.thumbnail } : FALLBACK_IMG}
            style={[styles.appThumb, { backgroundColor: theme.surface }]}
          />
          <View style={{ flex: 1 }}>
            <Text style={[styles.appName, { color: theme.text }]}>{app.name}</Text>
            <Text style={[styles.appCategory, { color: theme.textSecondary }]}>{app.category}</Text>
          </View>
        </View>

        {/* What you get */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>What's included</Text>
        {[
          { icon: 'code-slash-outline', text: 'Full Source Code (ZIP)', color: theme.primary },
          { icon: 'phone-portrait-outline', text: 'APK File (Android Install)', color: theme.success },
          { icon: 'cube-outline', text: 'AAB File (Play Store Ready)', color: theme.warning },
          { icon: 'infinite-outline', text: 'Lifetime Access & Commercial License', color: theme.secondary },
        ].map((item) => (
          <View style={styles.includeRow} key={item.text}>
            <View style={[styles.includeIcon, { backgroundColor: item.color + '22' }]}>
              <Ionicons name={item.icon} size={18} color={item.color} />
            </View>
            <Text style={[styles.includeText, { color: theme.text }]}>{item.text}</Text>
          </View>
        ))}

        {/* Price breakdown */}
        <View style={[styles.priceBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: theme.textSecondary }]}>App Price</Text>
            <Text style={[styles.priceValue, { color: theme.text }, isFree && { color: theme.freeAccent, fontWeight: '700' }]}>
              {isFree ? 'FREE' : `₹${app.price}`}
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { fontWeight: '700', color: theme.text }]}>Total</Text>
            <Text style={[styles.totalPrice, { color: theme.primary }, isFree && { color: theme.freeAccent }]}>
              {isFree ? 'FREE' : `₹${app.price}`}
            </Text>
          </View>
        </View>

        {/* Trust Guarantee Notice */}
        <View style={[styles.trustBox, { backgroundColor: theme.success + '15', borderColor: theme.success + '40' }]}>
          <Ionicons name="shield-checkmark-outline" size={18} color={theme.success} />
          <Text style={[styles.trustText, { color: theme.success }]}>
            100% Guaranteed Working Code. Instant delivery to My Apps tab.
          </Text>
        </View>

        {/* Payment note for non-free apps */}
        {!isFree && (
          <View style={[styles.dummyNotice, { backgroundColor: theme.warning + '15', borderColor: theme.warning + '40' }]}>
            <Ionicons name="information-circle-outline" size={16} color={theme.warning} />
            <Text style={[styles.dummyText, { color: theme.warning }]}>  Demo mode — payment gateway integration active</Text>
          </View>
        )}
      </ScrollView>

      {/* CTA */}
      <View style={[styles.bottomBar, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.payBtn, { backgroundColor: theme.primary }, isFree && { backgroundColor: theme.freeAccent }]}
          onPress={handlePurchase}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={isFree ? '#000000' : '#FFFFFF'} />
          ) : (
            <>
              <Ionicons name={isFree ? 'download-outline' : 'lock-closed'} size={18} color={isFree ? '#000000' : '#FFFFFF'} />
              <Text style={[styles.payText, { color: '#FFFFFF' }, isFree && { color: '#000000' }]}>
                {isFree ? '  Get Free App Now' : `  Confirm Purchase — ₹${app.price}`}
              </Text>
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
  trustBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: COLORS.success + '15',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.success + '40',
    gap: 8,
  },
  trustText: { fontSize: 12, color: COLORS.success, flex: 1, fontWeight: '500' },
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
