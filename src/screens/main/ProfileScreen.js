import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants';
import { useAuth } from '../../context/AuthContext';

function MenuItem({ icon, label, onPress, danger, color }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={[styles.menuIcon, danger && { backgroundColor: COLORS.error + '22' }, color && { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={20} color={danger ? COLORS.error : color || COLORS.primary} />
      </View>
      <Text style={[styles.menuLabel, danger && { color: COLORS.error }]}>{label}</Text>
      {!danger && <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />}
    </TouchableOpacity>
  );
}

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const handleWhatsAppSupport = () => {
    const message = encodeURIComponent(`Hi! I need support regarding the Appure app market.`);
    const phone = '919999999999';
    const url = `whatsapp://send?phone=${phone}&text=${message}`;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Linking.openURL(`https://wa.me/${phone}?text=${message}`);
      }
    }).catch(() => {
      Alert.alert('Support Contact', 'WhatsApp is not installed. Contact support at support@appure.com');
    });
  };

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Profile</Text>

      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      {/* Menu */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <MenuItem
          icon="bag-handle-outline"
          label="My Purchases"
          onPress={() => navigation.navigate('MyPurchases')}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support & Help</Text>
        <MenuItem
          icon="logo-whatsapp"
          label="Chat on WhatsApp Support"
          color={COLORS.whatsapp || '#25D366'}
          onPress={handleWhatsAppSupport}
        />
        <MenuItem icon="information-circle-outline" label="About Appure" onPress={() => navigation.navigate('About')} />
        <MenuItem icon="log-out-outline" label="Logout" onPress={handleLogout} danger />
      </View>

      <Text style={styles.version}>Appure v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingTop: 56 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: 28 },
  avatarSection: { alignItems: 'center', marginBottom: 32 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 28, fontWeight: '800', color: COLORS.white },
  name: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  email: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.primary + '22',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuLabel: { flex: 1, fontSize: 15, color: COLORS.text },
  version: { textAlign: 'center', color: COLORS.textMuted, fontSize: 12, marginTop: 20, paddingBottom: 40 },
});
