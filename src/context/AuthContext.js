import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { loginUser, registerUser, getProfile } from '../api/auth';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        SecureStore.getItemAsync('authToken'),
        SecureStore.getItemAsync('authUser'),
      ]);

      if (!storedToken) return; // logged out → fall through to finally

      setToken(storedToken);

      if (storedUser) {
        // We have a cached user — show the app immediately, no network wait.
        setUser(JSON.parse(storedUser));
        setLoading(false);
        // Refresh in the background; keep the cached session if it fails
        // (e.g. offline / backend down) instead of logging the user out.
        try {
          const res = await getProfile();
          setUser(res.data.user);
          await SecureStore.setItemAsync('authUser', JSON.stringify(res.data.user));
        } catch {
          /* stay logged in with the cached user */
        }
        return;
      }

      // No cached user (older session) — must fetch before routing.
      const res = await getProfile();
      setUser(res.data.user);
      await SecureStore.setItemAsync('authUser', JSON.stringify(res.data.user));
    } catch {
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('authUser');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await loginUser({ email, password });
    const { token: newToken, user: newUser } = res.data;
    await SecureStore.setItemAsync('authToken', newToken);
    await SecureStore.setItemAsync('authUser', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const register = async (name, email, password) => {
    const res = await registerUser({ name, email, password });
    const { token: newToken, user: newUser } = res.data;
    await SecureStore.setItemAsync('authToken', newToken);
    await SecureStore.setItemAsync('authUser', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('authToken');
    await SecureStore.deleteItemAsync('authUser');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
