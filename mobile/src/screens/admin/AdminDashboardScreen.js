import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { getAnalytics } from '../../api/admin';
import { peso } from '../../utils/format';

// Admin control tower per spec: GMV, users, verifications queue at a glance
export default function AdminDashboardScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAnalytics();
      setStats(res);
    } catch (e) {
      setError(e.message || 'Could not load analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const tiles = stats ? [
    { label: 'GMV (non-cancelled)', value: peso(stats.gmv), accent: colors.harvestGold },
    { label: 'Total orders', value: String(stats.total_orders), accent: colors.forestGreen },
    { label: 'Active farmers', value: String(stats.active_farmers), accent: colors.forestGreenSoft },
    { label: 'Buyers', value: String(stats.buyers), accent: colors.forestGreenSoft },
    { label: 'Live listings', value: `${stats.available_products} / ${stats.total_products}`, accent: colors.forestGreen },
  ] : [];

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={s.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStats(); }} />}
      >
        <View style={s.headerRow}>
          <View>
            <Text style={s.title}>Admin Dashboard</Text>
            <Text style={s.subtitle}>AniLink control tower</Text>
          </View>
          <Text style={s.badge}>★ Admin</Text>
        </View>

        {error && <View style={s.errorBox}><Text style={s.errorText}>{error}</Text></View>}

        {loading && !stats ? (
          <View style={s.card}><Text style={s.muted}>Loading analytics…</Text></View>
        ) : (
          <>
            <View style={s.tileGrid}>
              {tiles.map((t) => (
                <View key={t.label} style={[s.tile, { borderLeftColor: t.accent }]}>
                  <Text style={s.tileValue}>{t.value}</Text>
                  <Text style={s.tileLabel}>{t.label}</Text>
                </View>
              ))}
            </View>

            <View style={s.card}>
              <Text style={s.cardTitle}>Verification queue</Text>
              <Text style={s.muted}>{stats?.pending_verifications ?? 0} farm(s) awaiting review</Text>
              <Pressable style={s.actionBtn} onPress={() => navigation.navigate('AdminVerifications')}>
                <Text style={s.actionText}>Review verifications →</Text>
              </Pressable>
            </View>

            {!!stats?.top_farmers?.length && (
              <View style={s.card}>
                <Text style={s.cardTitle}>Top farmers by GMV</Text>
                {stats.top_farmers.map((f, i) => (
                  <View key={i} style={s.row}>
                    <Text style={s.rowMain} numberOfLines={1}>{i + 1}. {f.farm_name || f.farmer || '—'}</Text>
                    <Text style={s.rowValue}>{peso(f.gmv)} · {f.orders} order(s)</Text>
                  </View>
                ))}
              </View>
            )}

            {!!stats?.by_status && Object.keys(stats.by_status).length > 0 && (
              <View style={s.card}>
                <Text style={s.cardTitle}>Orders by status</Text>
                <View style={s.chipWrap}>
                  {Object.entries(stats.by_status).map(([status, count]) => (
                    <View key={status} style={s.statusChip}>
                      <Text style={s.statusChipText}>{status}: {count}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={s.card}>
              <Text style={s.cardTitle}>Marketplace listings</Text>
              <Text style={s.muted}>Archive listings that violate marketplace rules.</Text>
              <Pressable style={s.actionBtn} onPress={() => navigation.navigate('AdminListings')}>
                <Text style={s.actionText}>Moderate listings →</Text>
              </Pressable>
              <Pressable style={[s.actionBtn, s.actionBtnAlt]} onPress={() => navigation.navigate('AdminUsers')}>
                <Text style={s.actionText}>Manage users →</Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.neutralBg },
  content: { padding: spacing.md, paddingBottom: spacing.xl, gap: spacing.sm },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  title: { ...typography.headingLarge, color: colors.textPrimary },
  subtitle: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  badge: { ...typography.caption, fontFamily: 'Poppins_600SemiBold', color: colors.forestGreen, backgroundColor: colors.forestGreenLight, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5, overflow: 'hidden' },
  tileGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tile: { flexGrow: 1, minWidth: '46%', backgroundColor: colors.white, borderRadius: radius.md, borderLeftWidth: 4, padding: spacing.sm, gap: 4 },
  tileValue: { ...typography.priceLarge, color: colors.textPrimary },
  tileLabel: { ...typography.caption, color: colors.textMuted },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, marginTop: spacing.xs, gap: spacing.xs },
  cardTitle: { ...typography.heading, color: colors.textPrimary },
  muted: { ...typography.caption, color: colors.textSecondary },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm, paddingVertical: 4 },
  rowMain: { ...typography.body, color: colors.textPrimary, flexShrink: 1 },
  rowValue: { ...typography.caption, color: colors.textSecondary },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  statusChip: { backgroundColor: colors.forestGreenLight, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5 },
  statusChipText: { ...typography.caption, color: colors.forestGreen, fontSize: 11 },
  actionBtn: { backgroundColor: colors.forestGreen, borderRadius: radius.md, paddingVertical: 12, alignItems: 'center', marginTop: spacing.xs },
  actionBtnAlt: { backgroundColor: colors.harvestGold },
  actionText: { ...typography.body, fontFamily: 'Poppins_600SemiBold', color: colors.white },
  errorBox: { backgroundColor: '#F6E3E2', borderRadius: radius.md, padding: spacing.sm },
  errorText: { ...typography.caption, color: colors.status.cancelled },
});
