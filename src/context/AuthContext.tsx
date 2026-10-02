import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password?: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = 'pfs_current_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    // Default guest or customer demo
    return null;
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isSupabaseConfigured) {
      // Check active Supabase session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          fetchSupabaseProfile(session.user.id, session.user.email!);
        } else {
          setIsLoading(false);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          fetchSupabaseProfile(session.user.id, session.user.email!);
        } else {
          setUser(null);
          localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
          setIsLoading(false);
        }
      });

      return () => subscription.unsubscribe();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchSupabaseProfile = async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setUser(data as UserProfile);
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(data));
      } else {
        // Fallback default customer profile
        const fallbackProfile: UserProfile = {
          id: userId,
          email,
          full_name: email.split('@')[0],
          phone: null,
          role: email.includes('admin') ? 'admin' : 'customer',
        };
        setUser(fallbackProfile);
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(fallbackProfile));
      }
    } catch (e) {
      console.warn('Profile fetch error', e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password?: string, role: UserRole = 'customer') => {
    if (isSupabaseConfigured && password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { success: false, error: error.message };
        if (data.user) {
          await fetchSupabaseProfile(data.user.id, data.user.email!);
          return { success: true };
        }
      } catch (err: any) {
        return { success: false, error: err.message || 'Login failed' };
      }
    }

    // Local authentication / instant reviewer login
    const isMockAdmin = email.toLowerCase().includes('admin') || role === 'admin';
    const profile: UserProfile = {
      id: `usr-${Date.now()}`,
      email,
      full_name: isMockAdmin ? 'Store Administrator' : email.split('@')[0],
      phone: '+91 98765 43210',
      role: isMockAdmin ? 'admin' : role,
      created_at: new Date().toISOString(),
    };
    setUser(profile);
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profile));
    return { success: true };
  };

  const signup = async (email: string, password: string, fullName: string) => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, role: 'customer' },
          },
        });
        if (error) return { success: false, error: error.message };
        if (data.user) {
          const profile: UserProfile = {
            id: data.user.id,
            email,
            full_name: fullName,
            phone: null,
            role: 'customer',
          };
          setUser(profile);
          localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profile));
          return { success: true };
        }
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    // Local signup
    const profile: UserProfile = {
      id: `usr-${Date.now()}`,
      email,
      full_name: fullName,
      phone: null,
      role: 'customer',
      created_at: new Date().toISOString(),
    };
    setUser(profile);
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(profile));
    return { success: true };
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
  };

  const switchRole = (newRole: UserRole) => {
    if (user) {
      const updated: UserProfile = { ...user, role: newRole };
      setUser(updated);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updated));
    } else {
      // Create guest logged in with requested role
      const guestProfile: UserProfile = {
        id: `demo-${newRole}`,
        email: `${newRole}@pocketfriendlysarees.com`,
        full_name: newRole === 'admin' ? 'Store Administrator' : 'Privileged Customer',
        phone: '+91 98765 43210',
        role: newRole,
      };
      setUser(guestProfile);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(guestProfile));
    }
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'manager';

  return (
    <AuthContext.Provider value={{ user, isLoading, isAdmin, login, signup, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
