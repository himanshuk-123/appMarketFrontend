import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

import HomeScreen from '../screens/main/HomeScreen';
import AppDetailScreen from '../screens/main/AppDetailScreen';
import PurchaseScreen from '../screens/main/PurchaseScreen';
import MyPurchasesScreen from '../screens/main/MyPurchasesScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import AboutScreen from '../screens/main/AboutScreen';
import LivePreviewScreen from '../screens/main/LivePreviewScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="AppDetail" component={AppDetailScreen} />
      <Stack.Screen name="Purchase" component={PurchaseScreen} />
      <Stack.Screen name="LivePreview" component={LivePreviewScreen} />
    </Stack.Navigator>
  );
}

function PurchasesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PurchasesMain" component={MyPurchasesScreen} />
      <Stack.Screen name="AppDetail" component={AppDetailScreen} />
      <Stack.Screen name="LivePreview" component={LivePreviewScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
    </Stack.Navigator>
  );
}

export default function MainNavigator() {
  const { theme } = useTheme();

  const tabBarBarStyle = {
    backgroundColor: theme.surface,
    borderTopColor: theme.border,
  };

  const getTabBarOptions = (route) => {
    const focused = getFocusedRouteNameFromRoute(route);
    return {
      tabBarStyle: focused === 'LivePreview' ? { display: 'none' } : tabBarBarStyle,
    };
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: tabBarBarStyle,
        tabBarItemStyle: { paddingVertical: 4 },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Home: 'home',
            MyPurchases: 'bag-handle',
            Profile: 'person',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={(props) => ({ tabBarLabel: 'Explore', ...getTabBarOptions(props.route) })}
      />
      <Tab.Screen
        name="MyPurchases"
        component={PurchasesStack}
        options={(props) => ({ tabBarLabel: 'My Apps', ...getTabBarOptions(props.route) })}
      />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}
