import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

const LoginScreen = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState('Checking...');

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const res = await axios.get('/');
        if (res.data.status === 'Online' || res.data.message) {
          setServerStatus('Online (Port 5001)');
        }
      } catch (err) {
        setServerStatus('Offline (Backend Not Started)');
      }
    };
    checkConnection();
  }, []);

  const handleLogin = async (manualEmail, manualPass) => {
    const cleanEmail = (manualEmail || email).trim().toLowerCase();
    const cleanPassword = (manualPass || password).trim();

    if (!cleanEmail || !cleanPassword) {
      return Alert.alert('Error', 'Please enter both email and password');
    }

    setLoading(true);
    try {
      const response = await axios.post('/auth/login', {
        email: cleanEmail,
        password: cleanPassword
      });

      const { token, user } = response.data;
      const managerRoles = ['admin', 'super-admin', 'manager'];

      if (managerRoles.includes(user.role)) {
        await login(token, user);
      } else {
        Alert.alert('Unauthorized', 'This account does not have management permissions.');
      }
    } catch (err) {
      console.log('Login Error Message:', err.message);

      let errorMsg = 'Invalid credentials.';
      if (!err.response) {
        errorMsg = 'NETWORK ERROR: The app cannot reach the server on port 5001.';
      } else if (err.response.data && err.response.data.error) {
        errorMsg = err.response.data.error;
      }

      Alert.alert('Login Failed', errorMsg);
    } finally {
      setLoading(false);
    }
  };


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white px-8 justify-center"
    >
      <View className="items-center mb-12">
        <View className="h-24 w-24 bg-primary rounded-[35px] items-center justify-center mb-4 shadow-xl shadow-blue-900/40">
          <Text className="text-white text-4xl font-black">SM</Text>
        </View>
        <Text className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Manager Portal</Text>
        <View className="mt-2 px-3 py-1 bg-gray-50 rounded-full flex-row items-center border border-gray-100">
           <View className={`h-2 w-2 rounded-full mr-2 ${serverStatus.includes('Online') ? 'bg-green-500' : 'bg-red-500'}`} />
           <Text className="text-gray-400 font-bold uppercase text-[8px] tracking-widest">
             System Status: {serverStatus}
           </Text>
        </View>
      </View>

      <View className="space-y-4">
        <TextInput
          className="bg-gray-100 px-5 py-4 rounded-2xl font-bold text-gray-700"
          placeholder="admin@stmichel.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          className="bg-gray-100 px-5 py-4 rounded-2xl font-bold text-gray-700"
          placeholder="password123"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          onPress={() => handleLogin()}
          disabled={loading}
          className={`bg-primary py-5 rounded-2xl shadow-lg mt-4 ${loading ? 'opacity-70' : ''}`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-black uppercase tracking-widest">Sign In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleLogin('admin@stmichel.com', 'password123')}
          className="mt-4 py-3 border border-gray-100 rounded-2xl"
        >
          <Text className="text-gray-400 text-center font-bold text-xs uppercase tracking-widest">
            One-Tap Admin Login
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
