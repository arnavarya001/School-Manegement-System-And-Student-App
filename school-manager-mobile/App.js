import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LayoutDashboard, Users, UserPlus, IndianRupee, Package } from 'lucide-react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import StudentsScreen from './src/screens/StudentsScreen';
import AdmissionScreen from './src/screens/AdmissionScreen';
import FeesScreen from './src/screens/FeesScreen';
import InventoryScreen from './src/screens/InventoryScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Dashboard') return <LayoutDashboard size={size} color={color} />;
          if (route.name === 'Students') return <Users size={size} color={color} />;
          if (route.name === 'Admission') return <UserPlus size={size} color={color} />;
          if (route.name === 'Fees') return <IndianRupee size={size} color={color} />;
          if (route.name === 'Inventory') return <Package size={size} color={color} />;
        },
        tabBarActiveTintColor: '#1e3a8a',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarStyle: { height: 60, paddingBottom: 10 },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Students" component={StudentsScreen} />
      <Tab.Screen name="Admission" component={AdmissionScreen} />
      <Tab.Screen name="Fees" component={FeesScreen} />
      <Tab.Screen name="Inventory" component={InventoryScreen} />
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
          <Stack.Screen name="Main" component={AdminTabs} />
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
