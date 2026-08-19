import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Linking, Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

function MenuItem({ icon, label, onPress, danger, color, rightElement, theme }) {
  return (
    <TouchableOpacity
      style={[
        styles.menuItem,
        { backgroundColor: theme.card, borderColor: theme.border }
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.menuIcon, danger && { backgroundColor: theme.error + '22' }, color && { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={20} color={danger ? theme.error : color || theme.primary} />
      </View>
      <Text style={[styles.menuLabel, { color: danger ? theme.error : theme.text }]}>{label}</Text>
      {rightElement ? rightElement : (!danger && <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />)}
    </TouchableOpacity>
  );
}

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const handleWhatsAppSupport = () => {
    const message = encodeURIComponent(`Hi! I need support regarding the Appure app market.`);
    const phone = '918468087211';
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
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.headerTitle, { color: theme.text }]}>Profile</Text>

      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={[styles.name, { color: theme.text }]}>{user?.name}</Text>
        <Text style={[styles.email, { color: theme.textSecondary }]}>{user?.email}</Text>
      </View>

      {/* Account */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>Account</Text>
        <MenuItem
          icon="bag-handle-outline"
          label="My Purchases"
          theme={theme}
          onPress={() => navigation.navigate('MyPurchases')}
        />
      </View>

      {/* Appearance */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>Appearance</Text>
        <MenuItem
          icon={isDark ? "moon-outline" : "sunny-outline"}
          label={isDark ? "Dark Theme" : "Light Theme"}
          color={isDark ? "#9C27B0" : "#FF9800"}
          theme={theme}
          rightElement={
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#D1D5DB', true: theme.primary }}
              thumbColor={isDark ? '#FFFFFF' : '#F3F4F6'}
            />
          }
        />
      </View>

      {/* Support */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>Support & Help</Text>
        <MenuItem
          icon="logo-whatsapp"
          label="Chat on WhatsApp Support"
          color={theme.whatsapp || '#25D366'}
          theme={theme}
          onPress={handleWhatsAppSupport}
        />
        <MenuItem icon="information-circle-outline" label="About Appure" theme={theme} onPress={() => navigation.navigate('About')} />
        <MenuItem icon="log-out-outline" label="Logout" theme={theme} onPress={handleLogout} danger />
      </View>

      <Text style={[styles.version, { color: theme.textMuted }]}>Appure v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 56 },
  headerTitle: { fontSize: 24, fontWeight: '800', marginBottom: 28 },
  avatarSection: { alignItems: 'center', marginBottom: 32 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 28, fontWeight: '800', color: '#FFFFFF' },
  name: { fontSize: 20, fontWeight: '700' },
  email: { fontSize: 14, marginTop: 4 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 12, fontWeight: '600', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuLabel: { flex: 1, fontSize: 15 },
  version: { textAlign: 'center', fontSize: 12, marginTop: 20, paddingBottom: 40 },
});
