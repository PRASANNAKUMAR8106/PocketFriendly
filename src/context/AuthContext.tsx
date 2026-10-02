import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { UserProfile, UserRole } from '../types';
import { validateAuthInputs, isAuthorizedAdminRole } from '../utils/authSecurity';

export interface AuthResponse {
  success: boolean;
  error?: string;
  user?: UserProfile;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  signup: (email: string, password: string, fullName: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch verified profile from database
  const fetchSupabaseProfile = async (userId: string, email: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, phone, role, avatar_url, created_at')
        .eq('id', userId)
        .single();

      if (!error && data) {
        const profile: UserProfile = {
          id: data.id,
          email: data.email || email,
          full_name: data.full_name,
          phone: data.phone,
          role: data.role as UserRole,
          avatar_url: data.avatar_url,
          created_at: data.created_at,
        };
        setUser(profile);
        return profile;
      } else {
        // Self-healing attempt: if profile row is missing, insert default customer profile
        try {
          await supabase.from('profiles').insert({
            id: userId,
            email,
            full_name: email.split('@')[0],
            role: 'customer',
          });
        } catch {
          // Gracefully continue with in-memory fallback
        }

        // Fallback: Default to customer role. NEVER assign admin without verified DB record.
        const defaultProfile: UserProfile = {
          id: userId,
          email,
          full_name: email.split('@')[0],
          phone: null,
          role: 'customer',
        };
        setUser(defaultProfile);
        return defaultProfile;
      }
    } catch (e) {
      console.warn('Profile fetch error', e);
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Clean any legacy insecure localStorage user flags
    try {
      localStorage.removeItem('pfs_current_user');
    } catch {
      // Ignore
    }

    if (isSupabaseConfigured) {
      // 1. Verify active Supabase session
      supabase.auth.getSession().then(({ data: { session }, error }) => {
        if (!error && session?.user) {
          fetchSupabaseProfile(session.user.id, session.user.email!);
        } else {
          setIsLoading(false);
        }
      });

      // 2. Listen to Supabase auth state transitions
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          fetchSupabaseProfile(session.user.id, session.user.email!);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      });

      return () => subscription.unsubscribe();
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    // 1. Client-Side Input Validation
    const validation = validateAuthInputs(email, password);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    const cleanEmail = validation.cleanEmail;
    const cleanPassword = validation.cleanPassword!;

    // 2. Check if Supabase is properly configured in environment
    if (!isSupabaseConfigured) {
      return {
        success: false,
        error: 'Supabase backend is not configured. Please add valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.',
      };
    }

    // 3. Authenticate with Supabase Auth
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (error || !data.user) {
        const msg = error?.message || '';
        if (msg.toLowerCase().includes('email not confirmed')) {
          return {
            success: false,
            error: 'Email not confirmed. Please confirm your email address in Supabase (or check "Auto Confirm User" in the Supabase Dashboard).',
          };
        }
        if (msg.toLowerCase().includes('invalid login credentials') || msg.toLowerCase().includes('invalid credentials')) {
          return { success: false, error: 'Invalid email or password.' };
        }
        if (msg.toLowerCase().includes('failed to fetch') || msg.toLowerCase().includes('network')) {
          return {
            success: false,
            error: 'Unable to connect to Supabase. Please verify your project URL and network connection.',
          };
        }
        return { success: false, error: msg || 'Invalid email or password.' };
      }

      const profile = await fetchSupabaseProfile(data.user.id, data.user.email!);
      return { success: true, user: profile || undefined };
    } catch (err: any) {
      return { success: false, error: 'Authentication service temporarily unavailable. Please try again later.' };
    }
  };

  const signup = async (email: string, password: string, fullName: string): Promise<AuthResponse> => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();
    const cleanName = (fullName || '').trim();

    if (!cleanEmail || !cleanPassword || !cleanName) {
      return { success: false, error: 'All fields are required.' };
    }

    if (cleanPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    if (!isSupabaseConfigured) {
      return {
        success: false,
        error: 'Registration unavailable. Supabase backend is not configured in .env.',
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPassword,
        options: {
          data: { full_name: cleanName },
        },
      });

      if (error) return { success: false, error: error.message };

      if (data.user) {
        const profile: UserProfile = {
          id: data.user.id,
          email: cleanEmail,
          full_name: cleanName,
          phone: null,
          role: 'customer', // Security: User signups are ALWAYS 'customer'
        };
        setUser(profile);
        return { success: true, user: profile };
      }
      return { success: false, error: 'Signup did not return user details.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed.' };
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Sign out error', e);
      }
    }
    setUser(null);
    try {
      localStorage.removeItem('pfs_current_user');
    } catch {
      // Ignore
    }
  };

  // Strictly check verified database role
  const isAdmin = Boolean(
    user && isAuthorizedAdminRole(user.role)
  );

  return (
    <AuthContext.Provider value={{ user, isLoading, isAdmin, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
