import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { User, LogOut, Phone, Mail, MapPin, ChevronRight, ShieldCheck } from 'lucide-react-native';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = () => {
  const { logout } = useAuth();
  const [user, setUser] = useState(null);

  useEffect(() => {
    SecureStore.getItemAsync('user').then(u => {
      if (u) setUser(JSON.parse(u));
    });
  }, []);

  const handleLogout = async () => {
    if (logout) {
      await logout();
    } else {
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('user');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-6 py-8 items-center">
        <View className="h-24 w-24 bg-primary rounded-[35px] items-center justify-center mb-4">
          <Text className="text-white text-4xl font-black">{user?.name ? user.name[0] : 'U'}</Text>
        </View>
        <Text className="text-2xl font-black text-gray-900">{user?.name}</Text>
        <Text className="text-gray-400 font-bold uppercase text-xs tracking-widest">{user?.role} Account</Text>

        <View className="w-full mt-10 space-y-3">
          <View className="bg-white p-5 rounded-3xl shadow-sm flex-row items-center">
            <View className="h-10 w-10 bg-gray-50 rounded-xl items-center justify-center mr-4">
              <Mail size={20} color="#94a3b8" />
            </View>
            <View>
              <Text className="text-gray-400 text-[10px] font-bold uppercase">Email</Text>
              <Text className="font-bold text-gray-800">{user?.email}</Text>
            </View>
          </View>

          <TouchableOpacity onPress={handleLogout} className="bg-red-50 p-5 rounded-3xl flex-row items-center justify-between border border-red-100">
            <View className="flex-row items-center">
              <LogOut size={20} color="#ef4444" />
              <Text className="ml-4 font-bold text-red-600">Sign Out</Text>
            </View>
            <ChevronRight size={20} color="#fecaca" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;
