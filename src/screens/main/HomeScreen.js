import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, CATEGORIES } from '../../constants';
import { getApps } from '../../api/apps';
import AppCard from '../../components/AppCard';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [catLoading, setCatLoading] = useState(false);
  const isGrid = viewMode === 'grid';

  const fetchApps = useCallback(async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (selectedCategory !== 'all' && selectedCategory !== 'free') params.category = selectedCategory;
      const res = await getApps(params);
      let fetched = res.data.apps || [];
      if (selectedCategory === 'free') {
        fetched = fetched.filter(
          (a) => Number(a.price) === 0 || a.category === 'free' || String(a.category).toLowerCase() === 'free'
        );
      }
      setApps(fetched);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to load apps. Check your connection.');
    } finally {
      setLoading(false);
      setCatLoading(false);
      setRefreshing(false);
    }
  }, [search, selectedCategory]);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  const handleCategorySelect = (catId) => {
    if (catId === selectedCategory) return;
    setCatLoading(true);
    setSelectedCategory(catId);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchApps();
  };

  const freeApps = apps.filter(
    (a) => Number(a.price) === 0 || a.category === 'free' || String(a.category).toLowerCase() === 'free'
  );
  const featuredFreeApp = freeApps[0];
  const activeCategoryObj = CATEGORIES.find((c) => c.id === selectedCategory);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: theme.textSecondary }]}>Hello, {user?.name?.split(' ')[0]} 👋</Text>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Explore Apps</Text>
        </View>
      </View>

      {/* Search */}
      <View style={[styles.searchRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Ionicons name="search" size={18} color={theme.textMuted} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search apps..."
          placeholderTextColor={theme.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Hero Free Starter App Banner */}
      <TouchableOpacity
        style={[
          styles.heroBanner,
          {
            backgroundColor: theme.surface,
            borderColor: (theme.freeAccent || '#00E676') + '80',
          },
        ]}
        activeOpacity={0.88}
        onPress={() => {
          if (freeApps.length === 1) {
            navigation.navigate('AppDetail', { appId: freeApps[0].id });
          } else {
            handleCategorySelect('free');
          }
        }}
      >
        <View style={styles.heroHeaderRow}>
          <View style={[styles.heroGiftChip, { backgroundColor: (theme.freeAccent || '#00E676') + '22' }]}>
            <Ionicons name="gift-outline" size={14} color={theme.freeAccent || '#00E676'} />
            <Text style={[styles.heroGiftChipText, { color: theme.freeAccent || '#00E676' }]}>100% FREE STARTER APP</Text>
          </View>
          <Text style={[styles.heroPriceBadge, { color: theme.freeAccent || '#00E676' }]}>₹0 FREE</Text>
        </View>

        <Text style={[styles.heroTitle, { color: theme.text }]}>
          {featuredFreeApp ? featuredFreeApp.name : 'Personal Expense & Budget Tracker'}
        </Text>
        <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
          Test our code quality before you buy! Download full source code, APK & AAB files for free.
        </Text>

        <View style={styles.heroCtaRow}>
          <Text style={[styles.heroCtaText, { color: theme.primary }]}>
            {freeApps.length > 1 ? `Explore ${freeApps.length} Free Apps` : 'Claim Free App Now'}
          </Text>
          <Ionicons name="arrow-forward-circle" size={20} color={theme.primary} />
        </View>
      </TouchableOpacity>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContent}
      >
        {CATEGORIES.map((cat) => {
          const active = selectedCategory === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.catChip,
                { backgroundColor: theme.surface, borderColor: theme.border },
                active && { backgroundColor: theme.primary, borderColor: theme.primary }
              ]}
              onPress={() => handleCategorySelect(cat.id)}
            >
              <Text
                style={[
                  styles.catText,
                  { color: theme.textSecondary },
                  active && { color: '#FFFFFF' }
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Toolbar: result count + list/grid toggle */}
      <View style={styles.toolbar}>
        <Text style={[styles.resultCount, { color: theme.textSecondary }]}>
          {catLoading ? 'Updating category...' : `${apps.length} apps`}
        </Text>
        <View style={[styles.toggleGroup, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <TouchableOpacity
            style={[styles.toggleBtn, !isGrid && { backgroundColor: theme.primary }]}
            onPress={() => setViewMode('list')}
          >
            <Ionicons name="list" size={18} color={!isGrid ? '#FFFFFF' : theme.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, isGrid && { backgroundColor: theme.primary }]}
            onPress={() => setViewMode('grid')}
          >
            <Ionicons name="grid" size={16} color={isGrid ? '#FFFFFF' : theme.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* App List or Category Loader */}
      {loading || catLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={theme.primary} size="large" />
          <Text style={[styles.loadingCategoryText, { color: theme.textSecondary }]}>
            Loading {activeCategoryObj?.label || 'apps'}...
          </Text>
        </View>
      ) : (
        <FlatList
          key={viewMode}
          data={apps}
          keyExtractor={(item) => item.id.toString()}
          numColumns={isGrid ? 2 : 1}
          columnWrapperStyle={isGrid ? styles.gridRow : undefined}
          renderItem={({ item }) => (
            <AppCard
              app={item}
              grid={isGrid}
              onPress={() => navigation.navigate('AppDetail', { appId: item.id })}
            />
          )}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>No apps found in {activeCategoryObj?.label || 'this category'}</Text>
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
  greeting: { fontSize: 14, color: COLORS.textSecondary },
  headerTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginTop: 2 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginHorizontal: 20,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: COLORS.text, fontSize: 14, paddingVertical: 12 },
  heroBanner: {
    marginHorizontal: 20,
    marginBottom: 14,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    elevation: 3,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  heroGiftChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  heroGiftChipText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  heroPriceBadge: { fontSize: 13, fontWeight: '900' },
  heroTitle: { fontSize: 17, fontWeight: '800', marginBottom: 4 },
  heroSubtitle: { fontSize: 12, lineHeight: 17, marginBottom: 12 },
  heroCtaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heroCtaText: { fontSize: 13, fontWeight: '800' },
  categoriesScroll: { height: 56, flexGrow: 0, flexShrink: 0 },
  categoriesContent: { paddingHorizontal: 20, gap: 8, alignItems: 'center', paddingVertical: 6 },
  catChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  catChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  catTextActive: { color: COLORS.white },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 14,
    marginBottom: 2,
  },
  resultCount: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  toggleGroup: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 3,
    gap: 3,
  },
  toggleBtn: {
    width: 34,
    height: 30,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnActive: { backgroundColor: COLORS.primary },
  list: { padding: 20, paddingTop: 16 },
  gridRow: { gap: 12 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  loadingCategoryText: { marginTop: 12, fontSize: 13, fontWeight: '600' },
  emptyText: { color: COLORS.textMuted, fontSize: 15 },
});
