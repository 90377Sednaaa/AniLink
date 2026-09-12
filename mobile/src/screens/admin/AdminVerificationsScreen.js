import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { getVerifications, decideVerification } from '../../api/admin';

const filters = ['pending', 'approved', 'rejected'];

export default function AdminVerificationsScreen() {
  const [list, setList] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getVerifications({ status: filter });
      setList(res.data ?? []);
    } catch (e) {
      setError(e.message || 'Could not load verifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => { fetchList(); }, [fetchList]);

  const decide = (profile, status) => {
    Alert.prompt?.(
      status === 'approved' ? 'Approve farm?' : 'Reject with note',
      status === 'approved'
        ? `Verify ${profile.farm_name || profile.user?.name} — listings get the verified badge.`
        : 'Tell the farmer what to fix:',
      status === 'approved'
        ? [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Approve', onPress: (note) => submit(profile, status, note || undefined) },
          ]
        : [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Reject', style: 'destructive', onPress: (note) => submit(profile, status, note || 'Please re-upload a clearer photo.') },
          ],
      'plain-text',
    ) ?? submit(profile, status); // Alert.prompt unsupported (Android) → decide directly
  };

  const submit = async (profile, status, note) => {
    setBusyId(profile.id);
    try {
      await decideVerification(profile.id, status, note);
      setList((prev) => prev.filter((p) => p.id !== profile.id));
    } catch (e) {
      Alert.alert('Failed', e.message || 'Could not save decision');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']} >
      <View style={s.header}>
        <Text style={s.title}>Verifications</Text>
        <Text style={s.subtitle}>Farm review queue</Text>
      </View>

      <View style={s.filters}>
        {filters.map((f) => (
          <Pressable key={f} onPress={() => setFilter(f)} style={[s.filterChip, filter === f && s.filterChipActive]}>
            <Text style={[s.filterText, filter === f && s.filterTextActive]}>{f}</Text>
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
            <Text style={s.emptyIcon}>🪪</Text>
            <Text style={s.emptyText}>No {filter} verifications.</Text>
          </View>
        ) : null}
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={s.rowBetween}>
              <View style={{ flexShrink: 1 }}>
                <Text style={s.farmName}>{item.farm_name || 'Unnamed farm'}</Text>
                <Text style={s.meta}>{item.user?.name} · {item.user?.email}</Text>
                <Text style={s.meta}>{[item.barangay, item.municipality, item.province].filter(Boolean).join(', ') || 'Location not set'}</Text>
              </View>
              <View style={s.pill}><Text style={s.pillText}>{item.verification_status}</Text></View>
            </View>

            {filter === 'pending' && (
              <View style={s.actions}>
                <Pressable
                  style={[s.btn, s.approveBtn, busyId === item.id && s.btnBusy]}
                  disabled={busyId === item.id}
                  onPress={() => decide(item, 'approved')}
                >
                  <Text style={s.btnTextLight}>✓ Approve</Text>
                </Pressable>
                <Pressable
                  style={[s.btn, s.rejectBtn, busyId === item.id && s.btnBusy]}
                  disabled={busyId === item.id}
                  onPress={() => decide(item, 'rejected')}
                >
                  <Text style={s.btnTextDanger}>✕ Reject</Text>
                </Pressable>
              </View>
            )}
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
  filterText: { ...typography.caption, color: colors.textSecondary, textTransform: 'capitalize' },
  filterTextActive: { color: colors.white, fontFamily: 'Poppins_600SemiBold' },
  list: { padding: spacing.md, paddingTop: 0, gap: spacing.sm },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  farmName: { ...typography.headingSmall, color: colors.textPrimary },
  meta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  pill: { alignSelf: 'flex-start', backgroundColor: colors.harvestGoldLight, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5 },
  pillText: { ...typography.caption, fontSize: 11, color: colors.harvestGoldDark, textTransform: 'capitalize' },
  actions: { flexDirection: 'row', gap: spacing.sm },
  btn: { flex: 1, borderRadius: radius.md, paddingVertical: 12, alignItems: 'center' },
  btnBusy: { opacity: 0.5 },
  approveBtn: { backgroundColor: colors.forestGreen },
  rejectBtn: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.status.cancelled },
  btnTextLight: { ...typography.bodyMedium, color: colors.white },
  btnTextDanger: { ...typography.bodyMedium, color: colors.status.cancelled },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 6 },
  emptyIcon: { fontSize: 40 },
  emptyText: { ...typography.body, color: colors.textMuted },
  errorBox: { marginHorizontal: spacing.md, backgroundColor: '#F6E3E2', borderRadius: radius.md, padding: spacing.sm },
  errorText: { ...typography.caption, color: colors.status.cancelled },
});
