import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { DESIGN_TOKENS } from '../../src/constants/mapThemes';
import { useIncidentStore } from '../../src/store/useIncidentStore';

const TabIcon = ({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) => (
  <View style={[styles.tabItem, focused && styles.tabItemFocused]}>
    <Text style={[styles.tabEmoji, { opacity: focused ? 1 : 0.55 }]}>{emoji}</Text>
    <Text style={[styles.tabLabel, { color: focused ? DESIGN_TOKENS.colors.neonCyan : DESIGN_TOKENS.colors.textMuted }]}>
      {label}
    </Text>
  </View>
);

export default function TabsLayout() {
  const { incidents } = useIncidentStore();
  const criticalCount = incidents.filter((i) => i.severity === 'critical').length;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🗺️" label="MAP" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="📡" label="FEED" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.reportTab}>
              <Text style={styles.reportEmoji}>🚨</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          tabBarIcon: ({ focused }) => (
            <View>
              <TabIcon emoji="⚠️" label="ALERTS" focused={focused} />
              {criticalCount > 0 && (
                <View style={styles.alertBadge}>
                  <Text style={styles.alertBadgeText}>{criticalCount}</Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="PROFILE" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'rgba(5,10,20,0.95)',
    borderTopWidth: 1,
    borderTopColor: DESIGN_TOKENS.colors.glassBorder,
    height: 72,
    paddingBottom: 8,
  },
  tabItem: { alignItems: 'center', gap: 3, paddingTop: 8 },
  tabItemFocused: {},
  tabEmoji: { fontSize: 22 },
  tabLabel: { fontSize: 8, fontWeight: '800', letterSpacing: 0.8 },
  reportTab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: DESIGN_TOKENS.colors.neonRed,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: DESIGN_TOKENS.colors.neonRed,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 16,
    elevation: 12,
  },
  reportEmoji: { fontSize: 26 },
  alertBadge: {
    position: 'absolute', top: 0, right: -4,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: DESIGN_TOKENS.colors.neonRed,
    alignItems: 'center', justifyContent: 'center',
  },
  alertBadgeText: { color: '#fff', fontSize: 9, fontWeight: '900' },
});
