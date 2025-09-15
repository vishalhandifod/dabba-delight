import { useState, useEffect, createContext, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setSession(JSON.parse(user));
    }
  }, []);

  const login = (token) => {
    const decoded = jwtDecode(token);
    const user = {
      name: decoded.name || decoded.sub?.split("@")[0],
      role: decoded.role || "USER",
      email: decoded.sub,
    };
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('dabba_delight_token', token);
    setSession(user);
    toast({ title: 'Login Successful', description: `Welcome ${user.name}!` });
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('dabba_delight_token');
    setSession(null);
    toast({ title: 'Logout Successful', description: 'You have been logged out.' });
  };

  const value = { session, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};