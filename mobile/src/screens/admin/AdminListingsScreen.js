import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { getListings, moderateListing } from '../../api/admin';
import { perUnit } from '../../utils/format';

const filters = ['available', 'sold_out', 'archived', 'all'];

export default function AdminListingsScreen() {
  const [list, setList] = useState([]);
  const [filter, setFilter] = useState('available');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getListings(filter === 'all' ? {} : { status: filter });
      setList(res.data ?? []);
    } catch (e) {
      setError(e.message || 'Could not load listings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => { fetchList(); }, [fetchList]);

  const moderate = (product) => {
    if (product.status === 'archived') {
      Alert.alert('Restore listing', `Make "${product.name}" available again?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Restore', onPress: () => submit(product, 'available') },
      ]);
    } else {
      Alert.alert('Archive listing', `Archive "${product.name}"? The farmer will be notified.`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Archive', style: 'destructive', onPress: () => submit(product, 'archived') },
      ]);
    }
  };

  const submit = async (product, status) => {
    setBusyId(product.id);
    try {
      await moderateListing(product.id, status);
      setList((prev) => prev.filter((p) => p.id !== product.id));
    } catch (e) {
      Alert.alert('Failed', e.message || 'Could not moderate listing');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <Text style={s.title}>Listings</Text>
        <Text style={s.subtitle}>Marketplace moderation</Text>
      </View>

      <View style={s.filters}>
        {filters.map((f) => (
          <Pressable key={f} onPress={() => setFilter(f)} style={[s.filterChip, filter === f && s.filterChipActive]}>
            <Text style={[s.filterText, filter === f && s.filterTextActive]}>{f.replace('_', ' ')}</Text>
          </Pressable>
        ))}
      </View>

      {error && <View style={s.errorBox}><Text style={s.errorText}>{error}</Text></View>}

      <FlatList
        data={list}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchList(); }} />}
        ListEmptyComponent={!loading ? (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>🌾</Text>
            <Text style={s.emptyText}>No {filter.replace('_', ' ')} listings.</Text>
          </View>
        ) : null}
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={s.rowBetween}>
              <View style={{ flexShrink: 1 }}>
                <Text style={s.name}>{item.name}</Text>
                <Text style={s.meta}>
                  {item.farmer?.name || '—'}{item.farmer?.verified ? ' ✓' : ''} · {item.category?.name || 'Uncategorized'}
                </Text>
                <Text style={s.price}>{perUnit(item.price_per_unit, item.unit_type)} · {item.available_quantity} left</Text>
              </View>
              <View style={[s.pill, item.status === 'archived' && s.pillDanger]}>
                <Text style={s.pillText}>{item.status.replace('_', ' ')}</Text>
              </View>
            </View>

            <Pressable
              style={[s.btn, item.status === 'archived' ? s.restoreBtn : s.archiveBtn, busyId === item.id && s.btnBusy]}
              disabled={busyId === item.id}
              onPress={() => moderate(item)}
            >
              <Text style={[s.btnText, item.status !== 'archived' && s.btnTextDanger]}>
                {item.status === 'archived' ? 'Restore listing' : 'Archive listing'}
              </Text>
            </Pressable>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.neutralBg },
  header: { paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  title: { ...typography.headingLarge, color: colors.textPrimary },
  subtitle: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  filters: { flexDirection: 'row', gap: 8, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  filterChip: { borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, paddingHorizontal: 14, paddingVertical: 7 },
  filterChipActive: { backgroundColor: colors.forestGreen, borderColor: colors.forestGreen },
  filterText: { ...typography.caption, color: colors.textSecondary },
  filterTextActive: { color: colors.white, fontFamily: 'Poppins_600SemiBold' },
  list: { padding: spacing.md, paddingTop: 0, gap: spacing.sm },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  name: { ...typography.headingSmall, color: colors.textPrimary },
  meta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  price: { ...typography.caption, color: colors.forestGreen, fontFamily: 'Poppins_600SemiBold', marginTop: 4 },
  pill: { alignSelf: 'flex-start', backgroundColor: colors.forestGreenLight, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5 },
  pillDanger: { backgroundColor: '#F6E3E2' },
  pillText: { ...typography.caption, fontSize: 11, color: colors.forestGreen, textTransform: 'capitalize' },
  btn: { borderRadius: radius.md, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  btnBusy: { opacity: 0.5 },
  archiveBtn: { backgroundColor: '#F6E3E2', borderColor: colors.status.cancelled },
  restoreBtn: { backgroundColor: colors.forestGreen, borderColor: colors.forestGreen },
  btnText: { ...typography.bodyMedium, color: colors.textPrimary },
  btnTextDanger: { color: colors.status.cancelled },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 6 },
  emptyIcon: { fontSize: 40 },
  emptyText: { ...typography.body, color: colors.textMuted },
  errorBox: { marginHorizontal: spacing.md, backgroundColor: '#F6E3E2', borderRadius: radius.md, padding: spacing.sm },
  errorText: { ...typography.caption, color: colors.status.cancelled },
});
