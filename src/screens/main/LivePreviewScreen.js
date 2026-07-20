import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants';

export default function LivePreviewScreen({ route, navigation }) {
  const { url, name } = route.params;
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const webRef = useRef(null);

  // Disclaimer shows briefly, then fades out so the preview feels immersive.
  const noticeOpacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.delay(600),
      Animated.timing(noticeOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(3200),
      Animated.timing(noticeOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, [noticeOpacity]);

  const reload = () => {
    setError(false);
    setLoading(true);
    webRef.current?.reload();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {!error ? (
        <WebView
          ref={webRef}
          source={{ uri: url }}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={() => { setError(true); setLoading(false); }}
          onHttpError={() => { setError(true); setLoading(false); }}
          javaScriptEnabled
          domStorageEnabled
          style={styles.webview}
        />
      ) : (
        <View style={styles.centered}>
          <Ionicons name="cloud-offline-outline" size={48} color={COLORS.textMuted} />
          <Text style={styles.errorText}>Couldn't load the preview</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={reload}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Loading overlay */}
      {loading && !error && (
        <View style={[styles.loaderOverlay, { top: insets.top }]} pointerEvents="none">
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loaderText}>Loading {name}…</Text>
        </View>
      )}

      {/* Floating exit button — the only chrome, so the app fills the screen */}
      <TouchableOpacity
        style={[styles.backFab, { top: insets.top + 10 }]}
        onPress={() => navigation.goBack()}
        activeOpacity={0.8}
      >
        <Ionicons name="chevron-back" size={22} color="#fff" />
      </TouchableOpacity>

      {/* Auto-hiding honesty label */}
      <Animated.View
        style={[styles.notice, { opacity: noticeOpacity, bottom: insets.bottom + 20 }]}
        pointerEvents="none"
      >
        <Ionicons name="eye-outline" size={13} color="#fff" />
        <Text style={styles.noticeText}>Design preview — full app included on purchase</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  webview: { flex: 1, backgroundColor: 'transparent' },
  loaderOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    gap: 12,
  },
  loaderText: { color: COLORS.textSecondary, fontSize: 13 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { color: COLORS.textSecondary, fontSize: 15 },
  retryBtn: {
    marginTop: 6,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
  },
  retryText: { color: COLORS.white, fontWeight: '600', fontSize: 14 },
  backFab: {
    position: 'absolute',
    left: 12,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notice: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  noticeText: { color: '#fff', fontSize: 11, fontWeight: '500' },
});
