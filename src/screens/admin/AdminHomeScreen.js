import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';

function StatCard({ icon, label, value, color }) {
  return (
    <View style={[styles.statCard, { borderColor: color + '40' }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function AdminHomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ apps: 0, orders: 0, users: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await client.get('/admin/stats');
      setStats(res.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Admin Panel</Text>
          <Text style={styles.name}>{user?.name}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <View style={styles.statsGrid}>
          <StatCard icon="apps" label="Total Apps" value={stats.apps} color={COLORS.primary} />
          <StatCard icon="receipt" label="Orders" value={stats.orders} color={COLORS.success} />
          <StatCard icon="people" label="Users" value={stats.users} color={COLORS.warning} />
          <StatCard icon="cash" label="Revenue ₹" value={stats.revenue} color={COLORS.secondary} />
        </View>
      )}

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <TouchableOpacity
        style={styles.actionBtn}
        onPress={() => navigation.navigate('ManageApps', { screen: 'AddApp' })}
      >
        <Ionicons name="add-circle-outline" size={22} color={COLORS.primary} />
        <Text style={styles.actionText}>Add New App</Text>
        <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.actionBtn}
        onPress={() => navigation.navigate('ManageApps', { screen: 'ManageAppsMain' })}
      >
        <Ionicons name="list-outline" size={22} color={COLORS.primary} />
        <Text style={styles.actionText}>Manage Apps</Text>
        <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.actionBtn}
        onPress={() => navigation.navigate('Orders')}
      >
        <Ionicons name="receipt-outline" size={22} color={COLORS.primary} />
        <Text style={styles.actionText}>View Orders</Text>
        <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingTop: 56 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  greeting: { fontSize: 13, color: COLORS.textSecondary },
  name: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  logoutBtn: { padding: 8 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28 },
  statCard: {
    width: '47%',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  statIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  statValue: { fontSize: 26, fontWeight: '800', color: COLORS.text },
  statLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 14 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  actionText: { flex: 1, fontSize: 15, color: COLORS.text, fontWeight: '500' },
});
