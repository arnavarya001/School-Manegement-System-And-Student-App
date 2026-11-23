import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, IndianRupee, Calendar, Bell, Package, User } from 'lucide-react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import FeesScreen from './src/screens/FeesScreen';
import AttendanceScreen from './src/screens/AttendanceScreen';
import NoticesScreen from './src/screens/NoticesScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import MaterialsScreen from './src/screens/MaterialsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Home') return <Home size={size} color={color} />;
          if (route.name === 'Fees') return <IndianRupee size={size} color={color} />;
          if (route.name === 'Materials') return <Package size={size} color={color} />;
          if (route.name === 'Attendance') return <Calendar size={size} color={color} />;
          if (route.name === 'Profile') return <User size={size} color={color} />;
        },
        tabBarActiveTintColor: '#1e3a8a',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarStyle: { height: 62, paddingBottom: 10 }
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Fees" component={FeesScreen} />
      <Tab.Screen name="Materials" component={MaterialsScreen} />
      <Tab.Screen name="Attendance" component={AttendanceScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function NavigationRoot() {
  const { userToken, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1e3a8a" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userToken == null ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="Notices" component={NoticesScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationRoot />
    </AuthProvider>
  );
}
