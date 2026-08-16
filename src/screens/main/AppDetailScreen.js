import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Dimensions, Alert,
  Modal, StatusBar, FlatList, Linking, TextInput,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants';
import { getAppById, addAppReview } from '../../api/apps';
import { getMyPurchases } from '../../api/purchases';

const { width, height } = Dimensions.get('window');
const FALLBACK_IMG = require('../../../assets/AppMarketIcon.png');

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
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchAppDetails();
  }, []);

  const openViewer = (index) => {
    setViewerIndex(index);
    setViewerVisible(true);
  };

  const fetchAppDetails = async () => {
    try {
      const [appRes, purchasesRes] = await Promise.all([
        getAppById(appId),
        getMyPurchases(),
      ]);
      setApp(appRes.data.app);
      const purchased = purchasesRes.data.purchases.some(
        (p) => String(p.appId) === String(appId) && p.status === 'completed'
      );
      setIsPurchased(purchased);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!userRating || userRating < 1 || userRating > 5) {
      Alert.alert('Rating Required', 'Please select a rating between 1 and 5 stars');
      return;
    }
    setSubmittingReview(true);
    try {
      await addAppReview(appId, userRating, userComment);
      Alert.alert('Thank You! 🎉', 'Your review has been published.');
      setReviewModalVisible(false);
      setUserComment('');
      fetchAppDetails();
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setSubmittingReview(false);
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
  const mediaItems = [
    ...(app.previewUrl ? [{ type: 'video', uri: app.previewUrl }] : []),
    ...screenshots.map((s) => ({ type: 'image', uri: s.imageUrl })),
  ];

  const handleWhatsAppSupport = () => {
    const message = encodeURIComponent(`Hi! I have a question about the app "${app.name}" on Appure.`);
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

  const isFree = Number(app.price) === 0;

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
            source={app.thumbnail ? { uri: app.thumbnail } : FALLBACK_IMG}
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
              <Image source={app.thumbnail ? { uri: app.thumbnail } : FALLBACK_IMG} style={styles.iconImg} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.appName}>{app.name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{app.category}</Text>
                </View>
                {isFree && (
                  <View style={styles.freeDetailBadge}>
                    <Text style={styles.freeDetailText}>FREE STARTER APP</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Rating & Downloads Stats Bar */}
          <View style={styles.statsBar}>
            <View style={styles.statChip}>
              <Ionicons name="star" size={15} color={COLORS.warning} />
              <Text style={styles.statVal}>{app.averageRating ? Number(app.averageRating).toFixed(1) : '4.9'}</Text>
              <Text style={styles.statSub}>({app.totalReviews || app.reviews?.length || 0} reviews)</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statChip}>
              <Ionicons name="cloud-download-outline" size={15} color={COLORS.primary} />
              <Text style={styles.statVal}>{app.downloadsCount || 12}</Text>
              <Text style={styles.statSub}>downloads</Text>
            </View>
          </View>

          {/* Live Preview */}
          {app.livePreviewUrl ? (
            <TouchableOpacity
              style={styles.previewBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('LivePreview', { url: app.livePreviewUrl, name: app.name })}
            >
              <Ionicons name="play-circle" size={22} color={COLORS.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.previewBtnText}>Try Live Preview</Text>
                <Text style={styles.previewBtnHint}>Tap through the app live before buying</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          ) : null}

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

          {/* Trust & Guarantee Card */}
          <View style={styles.guaranteeCard}>
            <View style={styles.guaranteeHeader}>
              <Ionicons name="shield-checkmark" size={22} color={COLORS.success} />
              <Text style={styles.guaranteeTitle}>100% Verified Code & Guarantee</Text>
            </View>
            <View style={styles.guaranteeList}>
              <View style={styles.guaranteeItem}>
                <Ionicons name="checkmark" size={14} color={COLORS.success} />
                <Text style={styles.guaranteeItemText}>Tested & Virus-Free Clean Source Code</Text>
              </View>
              <View style={styles.guaranteeItem}>
                <Ionicons name="checkmark" size={14} color={COLORS.success} />
                <Text style={styles.guaranteeItemText}>Instant Access to APK, AAB & Source Files</Text>
              </View>
              <View style={styles.guaranteeItem}>
                <Ionicons name="checkmark" size={14} color={COLORS.success} />
                <Text style={styles.guaranteeItemText}>Full Commercial License Included</Text>
              </View>
            </View>
          </View>

          {/* Direct WhatsApp Support Button */}
          <TouchableOpacity style={styles.whatsappBtn} activeOpacity={0.85} onPress={handleWhatsAppSupport}>
            <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
            <Text style={styles.whatsappBtnText}>Chat on WhatsApp for Help & Support</Text>
          </TouchableOpacity>

          {/* Customer Reviews Section */}
          <View style={styles.reviewsHeaderRow}>
            <Text style={styles.sectionTitle}>Customer Reviews</Text>
            {isPurchased && (
              <TouchableOpacity style={styles.writeReviewBtn} onPress={() => setReviewModalVisible(true)}>
                <Ionicons name="create-outline" size={14} color={COLORS.primary} />
                <Text style={styles.writeReviewText}>Write Review</Text>
              </TouchableOpacity>
            )}
          </View>

          {app.reviews && app.reviews.length > 0 ? (
            app.reviews.map((rev) => (
              <View key={rev.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewerName}>{rev.userName}</Text>
                  <View style={styles.reviewStars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name={star <= rev.rating ? 'star' : 'star-outline'}
                        size={12}
                        color={COLORS.warning}
                      />
                    ))}
                  </View>
                </View>
                {rev.comment ? <Text style={styles.reviewComment}>{rev.comment}</Text> : null}
                <Text style={styles.reviewDate}>{new Date(rev.createdAt).toLocaleDateString()}</Text>
              </View>
            ))
          ) : (
            <View style={styles.noReviewsBox}>
              <Text style={styles.noReviewsText}>No reviews yet. Be the first to review after purchase!</Text>
            </View>
          )}

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

      {/* Write Review Modal */}
      <Modal visible={reviewModalVisible} transparent animationType="slide" onRequestClose={() => setReviewModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Rate & Review {app.name}</Text>
              <TouchableOpacity onPress={() => setReviewModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Select Star Rating</Text>
            <View style={styles.starPicker}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setUserRating(star)}>
                  <Ionicons
                    name={star <= userRating ? 'star' : 'star-outline'}
                    size={32}
                    color={COLORS.warning}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>Your Feedback (optional)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Tell us what you think of this app..."
              placeholderTextColor={COLORS.textMuted}
              value={userComment}
              onChangeText={setUserComment}
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity style={styles.submitReviewBtn} onPress={handleSubmitReview} disabled={submittingReview}>
              {submittingReview ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitReviewBtnText}>Submit Review</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
            <Text style={[styles.priceTag, isFree && { color: COLORS.freeAccent || '#00E676' }]}>
              {isFree ? 'FREE' : `₹${app.price}`}
            </Text>
            <TouchableOpacity
              style={[styles.ctaBtn, isFree && { backgroundColor: COLORS.freeAccent || '#00E676' }]}
              onPress={() => navigation.navigate('Purchase', { app })}
            >
              <Text style={[styles.ctaText, isFree && { color: '#000000' }]}>
                {isFree ? 'Get Free App' : 'Buy Now'}
              </Text>
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
  freeDetailBadge: {
    backgroundColor: (COLORS.freeAccent || '#00E676') + '20',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: COLORS.freeAccent || '#00E676',
  },
  freeDetailText: { fontSize: 10, fontWeight: '800', color: COLORS.freeAccent || '#00E676' },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'space-around',
  },
  statChip: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statVal: { fontSize: 14, fontWeight: '800', color: COLORS.text },
  statSub: { fontSize: 12, color: COLORS.textSecondary },
  statDivider: { width: 1, height: 16, backgroundColor: COLORS.border },
  previewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.primary + '15',
    borderWidth: 1,
    borderColor: COLORS.primary + '50',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  previewBtnText: { fontSize: 15, fontWeight: '700', color: COLORS.primary },
  previewBtnHint: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
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
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 10, marginTop: 12 },
  description: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },
  guaranteeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginTop: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.success + '40',
  },
  guaranteeHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  guaranteeTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  guaranteeList: { gap: 8 },
  guaranteeItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  guaranteeItemText: { fontSize: 13, color: COLORS.textSecondary },
  whatsappBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.whatsapp || '#25D366',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  whatsappBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  reviewsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 12,
  },
  writeReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primary + '18',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  writeReviewText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  reviewCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  reviewerName: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  reviewStars: { flexDirection: 'row', gap: 2 },
  reviewComment: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18, marginBottom: 6 },
  reviewDate: { fontSize: 11, color: COLORS.textMuted },
  noReviewsBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  noReviewsText: { fontSize: 13, color: COLORS.textMuted },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  modalLabel: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 10, fontWeight: '600' },
  starPicker: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 20 },
  modalInput: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 14,
    color: COLORS.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  submitReviewBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitReviewBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  metaRow: { flexDirection: 'row', marginTop: 8, gap: 16 },
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
