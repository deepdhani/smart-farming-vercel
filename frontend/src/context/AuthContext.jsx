// context/AuthContext.jsx — Global auth state with localStorage persistence
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedUser  = localStorage.getItem('sf_user');
    const savedToken = localStorage.getItem('sf_token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
    setLoading(false);
  }, []);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('sf_user', JSON.stringify(userData));
    localStorage.setItem('sf_token', authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('sf_user');
    localStorage.removeItem('sf_token');
  };

  const lang = user?.language || 'hi';

  return (
    <AuthContext.Provider value={{ user, token, lang, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
