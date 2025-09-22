import { useState, useEffect, createContext, useContext } from 'react';
import { useToast } from '@/components/ui/use-toast';
import api from '@/lib/api'; // Adjust path as needed

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Function to fetch current user data from API
  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/users/me');

      console.log('Fetched current user:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      throw error;
    }
  };

  // Function to fetch current user profile (more detailed)
  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      console.log('Fetched user profile:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      throw error;
    }
  };

  // Initialize auth state by checking if user is authenticated
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      
      try {
        // Try to fetch current user data from API
        // This will work if user has valid cookie/session
        const userData = await fetchCurrentUser();
        
        const user = {
          id: userData.id,
          name: userData.fullName || userData.email?.split("@")[0] || 'User',
          email: userData.email,
          phone: userData.phone,
          roles: userData.roles || [],
          role: Array.isArray(userData.roles) 
            ? userData.roles.map(role => role.authority || role).join(', ') 
            : userData.roles || "USER",
        };
        
        setSession(user);
      } catch (error) {
        // If API call fails, user is not authenticated
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth errors from API interceptor
    const handleAuthError = () => {
      setSession(null);
      toast({ 
        title: 'Session Expired', 
        description: 'Please log in again.',
        variant: 'destructive'
      });
    };

    window.addEventListener('auth-error', handleAuthError);
    
    return () => {
      window.removeEventListener('auth-error', handleAuthError);
    };
  }, [toast]);

  // Login function - after successful login, fetch user data
  const login = async () => {
    try {
      setLoading(true);
      
      // Fetch current user data from API after login
      const userData = await fetchCurrentUser();
      
      const user = {
        id: userData.id,
        name: userData.fullName || userData.email?.split("@")[0] || 'User',
        email: userData.email,
        phone: userData.phone,
        roles: userData.roles || [],
        role: Array.isArray(userData.roles) 
          ? userData.roles.map(role => role.authority || role).join(', ') 
          : userData.roles || "USER",
      };
      
      setSession(user);
      
      toast({ 
        title: 'Login Successful', 
        description: `Welcome ${user.name}!` 
      });
      
      return user;
    } catch (error) {
      console.error('Login failed:', error);
      setSession(null);
      
      toast({ 
        title: 'Login Failed', 
        description: 'Unable to fetch user data.',
        variant: 'destructive'
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function - makes API call to logout endpoint if available
  const logout = async () => {
    try {
      // You can add a logout API call here if your backend supports it
      await api.post('/auth/logout');
      
      setSession(null);
      
      toast({ 
        title: 'Logout Successful', 
        description: 'You have been logged out.' 
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout API fails, clear the session
      setSession(null);
    }
  };

  // Function to refresh user data
  const refreshUser = async () => {
    if (!session) return null;
    
    try {
      const userData = await fetchCurrentUser();
      const user = {
        id: userData.id,
        name: userData.fullName || userData.email?.split("@")[0] || 'User',
        email: userData.email,
        phone: userData.phone,
        roles: userData.roles || [],
        role: Array.isArray(userData.roles) 
          ? userData.roles.map(role => role.authority || role).join(', ') 
          : userData.roles || "USER",
      };
      
      setSession(user);
      return user;
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      // If refresh fails, user might be logged out
      setSession(null);
      return null;
    }
  };

  // Function to get detailed user profile
  const getUserProfile = async () => {
    try {
      return await fetchUserProfile();
    } catch (error) {
      console.error('Failed to get user profile:', error);
      throw error;
    }
  };

  // Function to update user profile
  const updateUserProfile = async (userData) => {
    try {
      const response = await api.put('/users/profile', userData);
      
      // Refresh session with updated data
      await refreshUser();
      
      toast({ 
        title: 'Profile Updated', 
        description: 'Your profile has been updated successfully.' 
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to update profile:', error);
      
      toast({ 
        title: 'Update Failed', 
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive'
      });
      
      throw error;
    }
  };

  const value = { 
    session, 
    login, 
    logout, 
    loading, 
    refreshUser,
    getUserProfile,
    updateUserProfile,
    isAuthenticated: !!session,
    isAdmin: session?.roles?.some(role => 
      (typeof role === 'string' ? role : role.authority)?.includes('ADMIN')
    ) || false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};