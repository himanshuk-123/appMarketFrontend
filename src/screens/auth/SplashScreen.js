import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '../../constants';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>AppMarket</Text>
      <Text style={styles.tagline}>Ready-made apps, instantly yours</Text>
      <ActivityIndicator color={COLORS.primary} size="large" style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  loader: {
    marginTop: 40,
  },
});
