import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

const normalizeRole = (role) => {
  if (!role) return '';
  if (typeof role === 'string') return role.toLowerCase();
  if (typeof role === 'object' && role?.value) return String(role.value).toLowerCase();
  return String(role).toLowerCase();
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token exists in localStorage
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const normalizedUser = parsedUser ? { ...parsedUser, role: normalizeRole(parsedUser.role) } : parsedUser;
        setToken(storedToken);
        setUser(normalizedUser);
      } catch (err) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        console.warn('Failed to parse stored user information, clearing auth storage.', err);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const handleExpiredSession = () => logout();
    window.addEventListener('auth:expired', handleExpiredSession);
    return () => window.removeEventListener('auth:expired', handleExpiredSession);
  }, []);

  const login = (token, user) => {
    const normalizedUser = user ? { ...user, role: normalizeRole(user.role) } : user;
    setToken(token);
    setUser(normalizedUser);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
