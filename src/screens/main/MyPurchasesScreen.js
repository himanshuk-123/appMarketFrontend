import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, Image, Linking,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

const FALLBACK_IMG = require('../../../assets/AppMarketIcon.png');
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants';
import { getMyPurchases, getDownloadLinks } from '../../api/purchases';

function DownloadButton({ icon, label, color, onPress }) {
  return (
    <TouchableOpacity style={[styles.dlBtn, { borderColor: color }]} onPress={onPress}>
      <Ionicons name={icon} size={16} color={color} />
      <Text style={[styles.dlText, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function PurchasedAppCard({ purchase, onDownload }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Image
          source={purchase.app?.thumbnail ? { uri: purchase.app.thumbnail } : FALLBACK_IMG}
          style={styles.thumb}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.appName}>{purchase.app?.name}</Text>
          <Text style={styles.appCategory}>{purchase.app?.category}</Text>
          <Text style={styles.purchaseDate}>
            Purchased on {new Date(purchase.purchasedAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <View style={styles.downloadRow}>
        <DownloadButton
          icon="phone-portrait-outline"
          label="APK"
          color={COLORS.success}
          onPress={() => onDownload(purchase.appId, 'apk')}
        />
        <DownloadButton
          icon="cube-outline"
          label="AAB"
          color={COLORS.warning}
          onPress={() => onDownload(purchase.appId, 'aab')}
        />
        <DownloadButton
          icon="code-slash-outline"
          label="Source Code"
          color={COLORS.primary}
          onPress={() => onDownload(purchase.appId, 'code')}
        />
      </View>
    </View>
  );
}

export default function MyPurchasesScreen({ navigation }) {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPurchases = useCallback(async () => {
    try {
      const res = await getMyPurchases();
      setPurchases(res.data.purchases);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refetch every time the tab is focused, so a fresh purchase shows up
  // immediately without needing to log out and back in.
  useFocusEffect(
    useCallback(() => {
      fetchPurchases();
    }, [fetchPurchases])
  );

  const handleDownload = async (appId, type) => {
    try {
      const res = await getDownloadLinks(appId);
      const links = res.data;
      const urlMap = {
        apk: links.apkUrl,
        aab: links.aabUrl,
        code: links.codeZipUrl,
      };
      const url = urlMap[type];
      if (url) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Not Available', 'This file has not been uploaded yet.');
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Apps</Text>
        <Text style={styles.headerSub}>{purchases.length} purchased</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={COLORS.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={purchases}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <PurchasedAppCard purchase={item} onDownload={handleDownload} />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Ionicons name="bag-handle-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No purchases yet</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                <Text style={styles.exploreLink}>Explore apps</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  headerSub: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  list: { padding: 20 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: { flexDirection: 'row', marginBottom: 14 },
  thumb: { width: 52, height: 52, borderRadius: 12, marginRight: 12, backgroundColor: COLORS.surface },
  appName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  appCategory: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  purchaseDate: { fontSize: 11, color: COLORS.textMuted, marginTop: 4 },
  downloadRow: { flexDirection: 'row', gap: 8 },
  dlBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 9,
    gap: 5,
  },
  dlText: { fontSize: 12, fontWeight: '600' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText: { fontSize: 16, color: COLORS.textMuted, marginTop: 12 },
  exploreLink: { color: COLORS.primary, fontSize: 14, marginTop: 10, fontWeight: '600' },
});
