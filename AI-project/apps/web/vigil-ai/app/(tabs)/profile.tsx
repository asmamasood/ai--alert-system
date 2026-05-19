import React from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView, Pressable, Image
} from 'react-native';
import { useUserStore } from '../../src/store/useUserStore';
import { DESIGN_TOKENS } from '../../src/constants/mapThemes';
import { LinearGradient } from 'expo-linear-gradient';

interface ProfileOptionProps {
  icon: string;
  label: string;
  isLogout?: boolean;
  onPress?: () => void;
}

const ProfileOption: React.FC<ProfileOptionProps> = ({ icon, label, isLogout = false, onPress }) => (
  <Pressable onPress={onPress} style={styles.optionItem}>
    <View style={styles.optionLeft}>
      <Text style={[styles.optionIcon, isLogout && { color: DESIGN_TOKENS.colors.neonRed }]}>{icon}</Text>
      <Text style={[styles.optionLabel, isLogout && { color: DESIGN_TOKENS.colors.neonRed, fontWeight: '700' }]}>
        {label}
      </Text>
    </View>
    {!isLogout && <Text style={styles.chevron}>›</Text>}
  </Pressable>
);

export default function ProfileScreen() {
  const { user, logout } = useUserStore();

  // Reference image details: Muhammad Ali
  const profileName = user?.name ?? "Muhammad Ali";
  const profileHandle = "@muhammadali";
  const stats = {
    reports: 24,
    helped: 156,
    score: "4.8 ★"
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={DESIGN_TOKENS.colors.background} />
      <SafeAreaView style={styles.safe}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* User Info Header */}
          <View style={styles.header}>
            <View style={styles.avatarWrap}>
              <LinearGradient
                colors={['#7C3AED', '#00E5FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarGrad}
              >
                <View style={styles.avatarInner}>
                  <Text style={styles.avatarText}>MA</Text>
                </View>
              </LinearGradient>
            </View>
            <Text style={styles.name}>{profileName}</Text>
            <Text style={styles.handle}>{profileHandle}</Text>
          </View>

          {/* Stats Bar */}
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{stats.reports}</Text>
              <Text style={styles.statLabel}>Reports</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{stats.helped}</Text>
              <Text style={styles.statLabel}>Helped</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={[styles.statVal, { color: DESIGN_TOKENS.colors.neonAmber }]}>{stats.score}</Text>
              <Text style={styles.statLabel}>Score</Text>
            </View>
          </View>

          {/* Menu Options */}
          <View style={styles.menuCard}>
            <ProfileOption icon="📝" label="Report History" />
            <View style={styles.divider} />
            <ProfileOption icon="📍" label="Saved Locations" />
            <View style={styles.divider} />
            <ProfileOption icon="🔔" label="Notification Settings" />
            <View style={styles.divider} />
            <ProfileOption icon="🧠" label="AI Preferences" />
            <View style={styles.divider} />
            <ProfileOption icon="ℹ️" label="About VIGIL AI" />
            <View style={styles.divider} />
            <ProfileOption icon="🚪" label="Logout" isLogout={true} onPress={logout} />
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: DESIGN_TOKENS.colors.background },
  safe: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  header: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 20,
    gap: 6,
  },
  avatarWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    padding: 3,
    shadowColor: DESIGN_TOKENS.colors.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 10,
  },
  avatarGrad: {
    flex: 1,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInner: {
    width: '92%',
    height: '92%',
    borderRadius: 48,
    backgroundColor: DESIGN_TOKENS.colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1.5,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: DESIGN_TOKENS.colors.textPrimary,
    marginTop: 8,
  },
  handle: {
    fontSize: 13,
    color: DESIGN_TOKENS.colors.textMuted,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: DESIGN_TOKENS.space.md,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: DESIGN_TOKENS.radius.md,
    borderWidth: 1,
    borderColor: DESIGN_TOKENS.colors.glassBorder,
    paddingVertical: 14,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 18,
    fontWeight: '900',
    color: DESIGN_TOKENS.colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: DESIGN_TOKENS.colors.textMuted,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: DESIGN_TOKENS.colors.divider,
  },
  menuCard: {
    marginHorizontal: DESIGN_TOKENS.space.md,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: DESIGN_TOKENS.radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  optionIcon: {
    fontSize: 18,
    color: DESIGN_TOKENS.colors.textSecondary,
  },
  optionLabel: {
    fontSize: 14,
    color: DESIGN_TOKENS.colors.textPrimary,
    fontWeight: '500',
  },
  chevron: {
    fontSize: 20,
    color: DESIGN_TOKENS.colors.textMuted,
    fontWeight: '300',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 20,
  },
});
