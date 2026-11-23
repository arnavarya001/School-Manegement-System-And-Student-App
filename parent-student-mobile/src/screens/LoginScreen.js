import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

const LoginScreen = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (manualEmail, manualPass) => {
    const targetEmail = (manualEmail || email).trim().toLowerCase();
    const targetPass = (manualPass || password).trim();

    if (!targetEmail || !targetPass) {
      return Alert.alert('Error', 'Please fill all fields');
    }

    setLoading(true);
    try {
      const response = await axios.post('/auth/login', {
        email: targetEmail,
        password: targetPass
      });
      const { token, user } = response.data;

      if (user.role === 'parent' || user.role === 'student') {
        await login(token, user);
      } else {
        Alert.alert('Unauthorized', 'This account is not a parent or student account.');
      }
    } catch (err) {
      Alert.alert('Login Failed', err.response?.data?.error || 'Check server connection or credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white px-8 justify-center"
    >
      <View className="items-center mb-10">
        <View className="h-20 w-20 bg-primary rounded-3xl items-center justify-center mb-4 shadow-lg shadow-blue-900/30">
          <Text className="text-white text-3xl font-black">SM</Text>
        </View>
        <Text className="text-2xl font-black text-gray-900 tracking-tight">St. Michel School</Text>
        <Text className="text-gray-500 font-medium mt-1">Parent & Student Portal</Text>
      </View>

      <View className="space-y-4">
        <View>
          <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 mb-2">
            Phone Number / Email / Admission #
          </Text>
          <TextInput
            className="bg-gray-100 px-4 py-4 rounded-2xl font-bold text-gray-800"
            placeholder="e.g. 9876543210 or STU2026001"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
        </View>

        <View>
          <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 mb-2">Password</Text>
          <TextInput
            className="bg-gray-100 px-4 py-4 rounded-2xl font-bold text-gray-800"
            placeholder="password123"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          onPress={() => handleLogin()}
          disabled={loading}
          className={`bg-primary py-4 rounded-2xl shadow-lg mt-2 ${loading ? 'opacity-70' : ''}`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-bold text-base">Sign In</Text>
          )}
        </TouchableOpacity>

        <View className="pt-2 flex-row justify-between">
          <TouchableOpacity
            onPress={() => handleLogin('parent@stmichel.com', 'password123')}
            className="flex-1 mr-2 py-3 bg-blue-50 rounded-xl border border-blue-100"
          >
            <Text className="text-primary text-center font-bold text-xs">Parent Demo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleLogin('student@stmichel.com', 'password123')}
            className="flex-1 ml-2 py-3 bg-gray-50 rounded-xl border border-gray-100"
          >
            <Text className="text-gray-600 text-center font-bold text-xs">Student Demo</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
