import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { getUsers, moderateUser } from '../../api/admin';

const roleLabels = {
  farmer: '🧑‍🌾 Farmer',
  buyer_individual: '🛒 Buyer',
  buyer_business: '🏪 Business',
  admin: '★ Admin',
};

export default function AdminUsersScreen() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getUsers();
      setList(res.data ?? []);
    } catch (e) {
      setError(e.message || 'Could not load users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchList(); }, [fetchList]);

  const toggleVerified = (user) => {
    const next = !user.is_verified;
    Alert.alert(
      next ? 'Mark verified?' : 'Remove verification?',
      `${user.name} will be ${next ? 'marked as' : 'no longer'} verified.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: next ? 'Verify' : 'Unverify', onPress: () => submit(user, { is_verified: next }) },
      ],
    );
  };

  const submit = async (user, payload) => {
    setBusyId(user.id);
    try {
      const res = await moderateUser(user.id, payload);
      setList((prev) => prev.map((u) => (u.id === user.id ? (res.data ?? { ...u, ...payload }) : u)));
    } catch (e) {
      Alert.alert('Failed', e.message || 'Could not update user');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <Text style={s.title}>Users</Text>
        <Text style={s.subtitle}>Accounts & verification flags</Text>
      </View>

      {error && <View style={s.errorBox}><Text style={s.errorText}>{error}</Text></View>}

      <FlatList
        data={list}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchList(); }} />}
        ListEmptyComponent={!loading ? (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>👥</Text>
            <Text style={s.emptyText}>No users found.</Text>
          </View>
        ) : null}
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={s.rowBetween}>
              <View style={{ flexShrink: 1 }}>
                <Text style={s.name}>{item.name}</Text>
                <Text style={s.meta}>{item.email}</Text>
                <View style={s.tagRow}>
                  <View style={s.rolePill}>
                    <Text style={s.roleText}>{roleLabels[item.role] || item.role}</Text>
                  </View>
                  {item.is_verified && (
                    <View style={s.verifiedPill}>
                      <Text style={s.verifiedText}>✓ Verified</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {item.role !== 'admin' && (
              <Pressable
                style={[s.btn, item.is_verified ? s.unverifyBtn : s.verifyBtn, busyId === item.id && s.btnBusy]}
                disabled={busyId === item.id}
                onPress={() => toggleVerified(item)}
              >
                <Text style={[s.btnText, !item.is_verified && s.btnTextLight]}>
                  {item.is_verified ? 'Remove verification' : 'Mark verified'}
                </Text>
              </Pressable>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.neutralBg },
  header: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.sm },
  title: { ...typography.headingLarge, color: colors.textPrimary },
  subtitle: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  list: { padding: spacing.md, paddingTop: 0, gap: spacing.sm },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  name: { ...typography.headingSmall, color: colors.textPrimary },
  meta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  tagRow: { flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap' },
  rolePill: { backgroundColor: colors.forestGreenLight, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5 },
  roleText: { ...typography.caption, fontSize: 11, color: colors.forestGreen },
  verifiedPill: { backgroundColor: colors.harvestGoldLight, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5 },
  verifiedText: { ...typography.caption, fontSize: 11, color: colors.harvestGoldDark },
  btn: { borderRadius: radius.md, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  btnBusy: { opacity: 0.5 },
  verifyBtn: { backgroundColor: colors.forestGreen, borderColor: colors.forestGreen },
  unverifyBtn: { backgroundColor: colors.white },
  btnText: { ...typography.bodyMedium, color: colors.textSecondary },
  btnTextLight: { color: colors.white },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 6 },
  emptyIcon: { fontSize: 40 },
  emptyText: { ...typography.body, color: colors.textMuted },
  errorBox: { marginHorizontal: spacing.md, backgroundColor: '#F6E3E2', borderRadius: radius.md, padding: spacing.sm },
  errorText: { ...typography.caption, color: colors.status.cancelled },
});
