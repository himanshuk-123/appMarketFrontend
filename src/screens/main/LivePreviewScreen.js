import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants';
import { useTheme } from '../../context/ThemeContext';

export default function LivePreviewScreen({ route, navigation }) {
  const { url, name } = route.params;
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [viewportMode, setViewportMode] = useState('full'); // 'full' | 'frame' | 'desktop'
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
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.background }]}>
      {/* Top Device Switcher Header Toolbar */}
      <View style={[styles.topToolbar, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.toolBtn, { backgroundColor: theme.border + '60' }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={22} color={theme.text} />
        </TouchableOpacity>

        <Text style={[styles.appNameTitle, { color: theme.text }]} numberOfLines={1}>{name}</Text>

        {/* Viewport Switcher Controls */}
        <View style={[styles.switcherPill, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <TouchableOpacity
            style={[styles.switchBtn, viewportMode === 'full' && { backgroundColor: theme.primary }]}
            onPress={() => setViewportMode('full')}
          >
            <Ionicons name="phone-portrait" size={14} color={viewportMode === 'full' ? '#fff' : theme.textMuted} />
            <Text style={[styles.switchText, { color: theme.textMuted }, viewportMode === 'full' && styles.switchTextActive]}>Full</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.switchBtn, viewportMode === 'frame' && { backgroundColor: theme.primary }]}
            onPress={() => setViewportMode('frame')}
          >
            <Ionicons name="hardware-chip-outline" size={14} color={viewportMode === 'frame' ? '#fff' : theme.textMuted} />
            <Text style={[styles.switchText, { color: theme.textMuted }, viewportMode === 'frame' && styles.switchTextActive]}>Frame</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.switchBtn, viewportMode === 'desktop' && { backgroundColor: theme.primary }]}
            onPress={() => setViewportMode('desktop')}
          >
            <Ionicons name="desktop-outline" size={14} color={viewportMode === 'desktop' ? '#fff' : theme.textMuted} />
            <Text style={[styles.switchText, { color: theme.textMuted }, viewportMode === 'desktop' && styles.switchTextActive]}>Desktop</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.toolBtn, { backgroundColor: theme.border + '60' }]} onPress={reload} activeOpacity={0.8}>
          <Ionicons name="refresh-outline" size={18} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Main Preview Container */}
      <View style={styles.previewStage}>
        {!error ? (
          <View
            style={[
              styles.webviewWrapper,
              viewportMode === 'frame' && styles.frameWrapper,
              viewportMode === 'desktop' && styles.desktopWrapper,
            ]}
          >
            {viewportMode === 'frame' && (
              <View style={styles.phoneNotch}>
                <View style={styles.phoneSpeaker} />
              </View>
            )}

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
          </View>
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
          <View style={styles.loaderOverlay} pointerEvents="none">
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loaderText}>Loading {name} preview…</Text>
          </View>
        )}
      </View>

      {/* Auto-hiding honesty label */}
      <Animated.View
        style={[styles.notice, { opacity: noticeOpacity, bottom: insets.bottom + 16 }]}
        pointerEvents="none"
      >
        <Ionicons name="eye-outline" size={13} color="#fff" />
        <Text style={styles.noticeText}>Live preview — full app source code included on purchase</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0B14' },
  topToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 8,
  },
  toolBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appNameTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text, flex: 1 },
  switcherPill: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 3,
  },
  switchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 16,
  },
  switchBtnActive: { backgroundColor: COLORS.primary },
  switchText: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
  switchTextActive: { color: '#FFFFFF' },

  previewStage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B0B14',
    paddingVertical: 10,
  },
  webviewWrapper: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  frameWrapper: {
    width: 320,
    height: '92%',
    borderRadius: 36,
    borderWidth: 8,
    borderColor: '#252542',
    backgroundColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  desktopWrapper: {
    width: '96%',
    height: '88%',
    borderRadius: 16,
    borderWidth: 6,
    borderColor: '#1E1E36',
    backgroundColor: '#000',
  },
  phoneNotch: {
    width: 100,
    height: 18,
    backgroundColor: '#252542',
    alignSelf: 'center',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  phoneSpeaker: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  webview: { flex: 1, backgroundColor: 'transparent' },

  loaderOverlay: {
    position: 'absolute',
    left: 0, right: 0, top: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B0B14',
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

  notice: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  noticeText: { color: '#fff', fontSize: 11, fontWeight: '500' },
});
