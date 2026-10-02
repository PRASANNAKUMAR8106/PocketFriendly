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

// Dev environment verified test accounts (Used ONLY when Supabase connection is offline in DEV)
const DEV_MOCK_ACCOUNTS: Record<string, { passwordHash: string; profile: UserProfile }> = {
  'admin@pocketfriendlysarees.com': {
    passwordHash: 'admin123',
    profile: {
      id: 'dev-admin-uuid-001',
      email: 'admin@pocketfriendlysarees.com',
      full_name: 'Store Administrator',
      phone: '+91 98765 43210',
      role: 'admin',
      created_at: '2026-01-01T00:00:00Z',
    },
  },
  'customer@pocketfriendlysarees.com': {
    passwordHash: 'customer123',
    profile: {
      id: 'dev-customer-uuid-001',
      email: 'customer@pocketfriendlysarees.com',
      full_name: 'Regular Customer',
      phone: '+91 98765 00000',
      role: 'customer',
      created_at: '2026-01-01T00:00:00Z',
    },
  },
};

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

    // 2. Real Supabase Authentication
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPassword,
        });

        if (error || !data.user) {
          // Standard security response: do not reveal if email exists
          return { success: false, error: 'Invalid email or password.' };
        }

        const profile = await fetchSupabaseProfile(data.user.id, data.user.email!);
        return { success: true, user: profile || undefined };
      } catch (err: any) {
        return { success: false, error: 'Authentication service temporarily unavailable.' };
      }
    }

    // 3. In production, unconfigured Supabase is an absolute block.
    if (import.meta.env.PROD) {
      return {
        success: false,
        error: 'Authentication failed. Supabase backend is not configured.',
      };
    }

    // 4. Strict Local Development Mock Mode (DEV ONLY)
    // Only exact matching credentials from DEV_MOCK_ACCOUNTS can authenticate.
    // Random emails and wrong passwords will ALWAYS fail.
    const devAccount = DEV_MOCK_ACCOUNTS[cleanEmail];
    if (!devAccount || devAccount.passwordHash !== cleanPassword) {
      return { success: false, error: 'Invalid email or password.' };
    }

    setUser(devAccount.profile);
    return { success: true, user: devAccount.profile };
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

    if (isSupabaseConfigured) {
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
      } catch (err: any) {
        return { success: false, error: err.message || 'Registration failed.' };
      }
    }

    if (import.meta.env.PROD) {
      return { success: false, error: 'Registration service not configured.' };
    }

    // Dev local signup
    const profile: UserProfile = {
      id: `usr-${Date.now()}`,
      email: cleanEmail,
      full_name: cleanName,
      phone: null,
      role: 'customer', // Security: User signups are ALWAYS 'customer'
      created_at: new Date().toISOString(),
    };
    setUser(profile);
    return { success: true, user: profile };
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
