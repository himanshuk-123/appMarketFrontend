import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Dimensions, Alert,
  Modal, StatusBar, FlatList,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants';
import { getAppById } from '../../api/apps';
import { getMyPurchases } from '../../api/purchases';

const { width, height } = Dimensions.get('window');

// Full screen media viewer modal
function MediaViewer({ visible, items, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex);
  const flatRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    setCurrent(startIndex);
  }, [startIndex, visible]);

  const item = items[current];
  const isVideo = item?.type === 'video';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <StatusBar hidden />
      <View style={ms.container}>
        {/* Close button */}
        <TouchableOpacity style={ms.closeBtn} onPress={onClose}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>

        {/* Counter */}
        <Text style={ms.counter}>{current + 1} / {items.length}</Text>

        {/* Media */}
        <FlatList
          ref={flatRef}
          data={items}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={startIndex}
          getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setCurrent(index);
          }}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item: mediaItem }) => (
            <View style={ms.slide}>
              {mediaItem.type === 'video' ? (
                <Video
                  ref={videoRef}
                  source={{ uri: mediaItem.uri }}
                  style={ms.video}
                  resizeMode={ResizeMode.CONTAIN}
                  useNativeControls
                  shouldPlay
                />
              ) : (
                <Image
                  source={{ uri: mediaItem.uri }}
                  style={ms.image}
                  resizeMode="contain"
                />
              )}
            </View>
          )}
        />

        {/* Dots */}
        {items.length > 1 && (
          <View style={ms.dots}>
            {items.map((_, i) => (
              <View key={i} style={[ms.dot, i === current && ms.dotActive]} />
            ))}
          </View>
        )}
      </View>
    </Modal>
  );
}

export default function AppDetailScreen({ route, navigation }) {
  const { appId } = route.params;
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPurchased, setIsPurchased] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  useEffect(() => {
    fetchAppDetails();
  }, []);

  const fetchAppDetails = async () => {
    try {
      const [appRes, purchasesRes] = await Promise.all([
        getAppById(appId),
        getMyPurchases(),
      ]);
      setApp(appRes.data.app);
      const purchased = purchasesRes.data.purchases.some(
        (p) => p.appId === appId && p.status === 'completed'
      );
      setIsPurchased(purchased);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  if (!app) return null;

  const screenshots = app.screenshots || [];

  // Build media items: video first (if exists), then screenshots
  const mediaItems = [
    ...(app.previewUrl ? [{ type: 'video', uri: app.previewUrl }] : []),
    ...screenshots.map((s) => ({ type: 'image', uri: s.imageUrl })),
  ];

  const openViewer = (index) => {
    setViewerIndex(index);
    setViewerVisible(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Back button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>

        {/* Media carousel (screenshots + video thumbnails) */}
        {mediaItems.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mediaScroll}>
            {mediaItems.map((item, i) => (
              <TouchableOpacity key={i} onPress={() => openViewer(i)} activeOpacity={0.85}>
                <View style={styles.mediaThumb}>
                  {item.type === 'video' ? (
                    <>
                      <View style={styles.videoThumbBg}>
                        <Ionicons name="play-circle" size={44} color="#fff" />
                        <Text style={styles.videoLabel}>Demo Video</Text>
                      </View>
                    </>
                  ) : (
                    <Image source={{ uri: item.uri }} style={styles.thumbImage} resizeMode="cover" />
                  )}
                  <View style={styles.thumbOverlay}>
                    <Ionicons
                      name={item.type === 'video' ? 'play-circle-outline' : 'expand-outline'}
                      size={20}
                      color="#fff"
                    />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <Image
            source={app.thumbnail ? { uri: app.thumbnail } : { uri: '' }}
            style={styles.fallbackImage}
            resizeMode="cover"
          />
        )}

        {mediaItems.length > 0 && (
          <Text style={styles.tapHint}>Tap to view full screen</Text>
        )}

        {/* App info */}
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <View style={styles.appIcon}>
              <Image source={app.thumbnail ? { uri: app.thumbnail } : { uri: '' }} style={styles.iconImg} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.appName}>{app.name}</Text>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{app.category}</Text>
              </View>
            </View>
          </View>

          {/* What you get */}
          <View style={styles.perksRow}>
            {[
              { icon: 'code-slash', label: 'Source Code' },
              { icon: 'phone-portrait', label: 'APK File' },
              { icon: 'cube', label: 'AAB File' },
            ].map((perk) => (
              <View style={styles.perk} key={perk.label}>
                <Ionicons name={perk.icon} size={20} color={COLORS.primary} />
                <Text style={styles.perkLabel}>{perk.label}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>About this app</Text>
          <Text style={styles.description}>{app.description}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Version</Text>
              <Text style={styles.metaValue}>{app.version || '1.0.0'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Category</Text>
              <Text style={styles.metaValue}>{app.category}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        {isPurchased ? (
          <TouchableOpacity
            style={[styles.ctaBtn, { backgroundColor: COLORS.success }]}
            onPress={() => navigation.navigate('MyPurchases')}
          >
            <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
            <Text style={styles.ctaText}>  View Downloads</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.ctaRow}>
            <Text style={styles.priceTag}>₹{app.price}</Text>
            <TouchableOpacity
              style={styles.ctaBtn}
              onPress={() => navigation.navigate('Purchase', { app })}
            >
              <Text style={styles.ctaText}>Buy Now</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Full screen media viewer */}
      <MediaViewer
        visible={viewerVisible}
        items={mediaItems}
        startIndex={viewerIndex}
        onClose={() => setViewerVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
    backgroundColor: COLORS.overlay,
    borderRadius: 20,
    padding: 8,
  },
  mediaScroll: { paddingTop: 10, paddingLeft: 16, paddingBottom: 4 },
  mediaThumb: {
    width: 140,
    height: 220,
    borderRadius: 14,
    marginRight: 10,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
  },
  thumbImage: { width: '100%', height: '100%' },
  videoThumbBg: {
    width: '100%',
    height: '100%',
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  videoLabel: { color: '#fff', fontSize: 12, fontWeight: '600' },
  thumbOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 4,
  },
  fallbackImage: { width, height: 220 },
  tapHint: { fontSize: 11, color: COLORS.textMuted, textAlign: 'center', marginTop: 8, marginBottom: 4 },
  body: { padding: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  appIcon: { width: 60, height: 60, borderRadius: 14, overflow: 'hidden', marginRight: 14, backgroundColor: COLORS.surface },
  iconImg: { width: 60, height: 60 },
  appName: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  categoryBadge: {
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surface,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryText: { fontSize: 12, color: COLORS.textSecondary },
  perksRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'space-around',
  },
  perk: { alignItems: 'center', gap: 6 },
  perkLabel: { fontSize: 11, color: COLORS.textSecondary, marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 10 },
  description: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },
  metaRow: { flexDirection: 'row', marginTop: 20, gap: 16 },
  metaItem: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metaLabel: { fontSize: 12, color: COLORS.textMuted },
  metaValue: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginTop: 4 },
  bottomBar: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  ctaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  priceTag: { fontSize: 26, fontWeight: '800', color: COLORS.text },
  ctaBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctaText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
});

// Full screen viewer styles
const ms = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  closeBtn: {
    position: 'absolute',
    top: 50,
    right: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  counter: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    zIndex: 10,
  },
  slide: { width, height, alignItems: 'center', justifyContent: 'center' },
  image: { width, height },
  video: { width, height: height * 0.75 },
  dots: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { backgroundColor: '#fff', width: 18 },
});
