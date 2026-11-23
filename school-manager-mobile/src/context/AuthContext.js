import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStorageData = async () => {
      try {
        const token = await SecureStore.getItemAsync('token');
        const user = await SecureStore.getItemAsync('user');
        if (token) setUserToken(token);
        if (user) setUserData(JSON.parse(user));
      } catch (e) {
        console.error('Failed to load auth data', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadStorageData();
  }, []);

  const login = async (token, user) => {
    await SecureStore.setItemAsync('token', token);
    await SecureStore.setItemAsync('user', JSON.stringify(user));
    setUserToken(token);
    setUserData(user);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('user');
    setUserToken(null);
    setUserData(null);
  };

  return (
    <AuthContext.Provider value={{ userToken, userData, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
