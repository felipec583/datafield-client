import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return sessionStorage.getItem('datafield_auth') === 'true';
  });

  const login = () => {
    sessionStorage.setItem('datafield_auth', 'true');
    setIsLoggedIn(true);
  };

  const logout = () => {
    sessionStorage.removeItem('datafield_auth');
    setIsLoggedIn(false);
    toast.success('Sesión cerrada');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
