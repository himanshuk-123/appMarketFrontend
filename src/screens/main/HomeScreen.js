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

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const isGrid = viewMode === 'grid';

  const fetchApps = useCallback(async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (selectedCategory !== 'all') params.category = selectedCategory;
      const res = await getApps(params);
      setApps(res.data.apps);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to load apps. Check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, selectedCategory]);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchApps();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0]} 👋</Text>
          <Text style={styles.headerTitle}>Explore Apps</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color={COLORS.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search apps..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContent}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.catChip, selectedCategory === cat.id && styles.catChipActive]}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <Text style={[styles.catText, selectedCategory === cat.id && styles.catTextActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Toolbar: result count + list/grid toggle */}
      <View style={styles.toolbar}>
        <Text style={styles.resultCount}>{apps.length} apps</Text>
        <View style={styles.toggleGroup}>
          <TouchableOpacity
            style={[styles.toggleBtn, !isGrid && styles.toggleBtnActive]}
            onPress={() => setViewMode('list')}
          >
            <Ionicons name="list" size={18} color={!isGrid ? COLORS.white : COLORS.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, isGrid && styles.toggleBtnActive]}
            onPress={() => setViewMode('grid')}
          >
            <Ionicons name="grid" size={16} color={isGrid ? COLORS.white : COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* App List */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={COLORS.primary} size="large" />
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
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyText}>No apps found</Text>
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
    marginBottom: 16,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: COLORS.text, fontSize: 14, paddingVertical: 12 },
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
  emptyText: { color: COLORS.textMuted, fontSize: 15 },
});
