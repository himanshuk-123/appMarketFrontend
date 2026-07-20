import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants';

export default function SplashScreen() {
  const badgeScale = useRef(new Animated.Value(0.6)).current;
  const badgeOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textShift = useRef(new Animated.Value(12)).current;
  const dotPulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance: badge springs in, then the wordmark fades up.
    Animated.sequence([
      Animated.parallel([
        Animated.spring(badgeScale, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(badgeOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(textShift, {
          toValue: 0,
          duration: 350,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Continuous loading dots pulse.
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotPulse, {
          toValue: 1,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(dotPulse, {
          toValue: 0,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [badgeScale, badgeOpacity, textOpacity, textShift, dotPulse]);

  const dotStyle = () => ({
    opacity: dotPulse.interpolate({
      inputRange: [0, 1],
      outputRange: [0.25, 1],
    }),
    transform: [
      {
        scale: dotPulse.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1.15],
        }),
      },
    ],
  });

  return (
    <View style={styles.container}>
      {/* Soft glow behind the logo */}
      <View style={styles.glow} />

      <Animated.View
        style={[
          styles.badge,
          { opacity: badgeOpacity, transform: [{ scale: badgeScale }] },
        ]}
      >
        <Ionicons name="storefront" size={48} color={COLORS.white} />
      </Animated.View>

      <Animated.View
        style={{ opacity: textOpacity, transform: [{ translateY: textShift }], alignItems: 'center' }}
      >
        <Text style={styles.logo}>
          App<Text style={{ color: COLORS.secondary }}>ure</Text>
        </Text>
        <Text style={styles.tagline}>Ready-made apps, instantly yours</Text>
      </Animated.View>

      {/* Loading dots */}
      <View style={styles.dots}>
        <Animated.View style={[styles.dot, dotStyle(0)]} />
        <Animated.View style={[styles.dot, dotStyle(1)]} />
        <Animated.View style={[styles.dot, dotStyle(2)]} />
      </View>
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
  glow: {
    position: 'absolute',
    top: '34%',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: COLORS.primary,
    opacity: 0.18,
  },
  badge: {
    width: 104,
    height: 104,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  logo: {
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 10,
  },
  dots: {
    position: 'absolute',
    bottom: 80,
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
});
