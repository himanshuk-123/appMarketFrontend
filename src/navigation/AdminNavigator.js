import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';

import AdminHomeScreen from '../screens/admin/AdminHomeScreen';
import AddAppScreen from '../screens/admin/AddAppScreen';
import ManageAppsScreen from '../screens/admin/ManageAppsScreen';
import AdminAppDetailScreen from '../screens/admin/AdminAppDetailScreen';
import EditAppScreen from '../screens/admin/EditAppScreen';
import AdminOrdersScreen from '../screens/admin/AdminOrdersScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function ManageStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ManageAppsMain" component={ManageAppsScreen} />
      <Stack.Screen name="AddApp" component={AddAppScreen} />
      <Stack.Screen name="AdminAppDetail" component={AdminAppDetailScreen} />
      <Stack.Screen name="EditApp" component={EditAppScreen} />
    </Stack.Navigator>
  );
}

export default function AdminNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
        },
        tabBarItemStyle: { paddingVertical: 4 },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Dashboard: 'grid',
            ManageApps: 'apps',
            Orders: 'receipt',
            Users: 'people',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={AdminHomeScreen} />
      <Tab.Screen name="ManageApps" component={ManageStack} options={{ tabBarLabel: 'Apps' }} />
      <Tab.Screen name="Orders" component={AdminOrdersScreen} />
      <Tab.Screen name="Users" component={AdminUsersScreen} />
    </Tab.Navigator>
  );
}
