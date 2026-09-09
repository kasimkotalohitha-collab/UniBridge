import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile, UserRole } from '../types/database.types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  role: UserRole | null;
  loading: boolean;
  profileLoading: boolean;
  profileLoaded: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    user?: User | null;
    profile?: Profile | null;
    role?: UserRole | null;
  }>;
  signUp: (params: {
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
    studentIdNumber?: string;
    phone?: string;
    departmentId?: string;
  }) => Promise<{ error: Error | null; user?: User | null; session?: Session | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, department:departments!profiles_department_id_fkey(*)')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('[UniBridge] Profile fetch warning (may not be created yet):', error.message);
        return null;
      }
      return data as Profile;
    } catch (err) {
      console.error('[UniBridge] Error in fetchProfile:', err);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      setProfileLoading(true);
      const prof = await fetchProfile(user.id);
      if (prof) setProfile(prof);
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    // Initial session check: keep loading=true until session AND profile are resolved
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!isMounted) return;
      if (session?.user) {
        setProfileLoading(true);
        const prof = await fetchProfile(session.user.id);
        if (isMounted) {
          setUser(session.user);
          setProfile(prof);
          setProfileLoading(false);
          setProfileLoaded(true);
          setLoading(false);
        }
      } else {
        if (isMounted) {
          setUser(null);
          setProfile(null);
          setProfileLoading(false);
          setProfileLoaded(true);
          setLoading(false);
        }
      }
    }).catch(() => {
      if (isMounted) {
        setProfileLoading(false);
        setProfileLoaded(true);
        setLoading(false);
      }
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (event === 'SIGNED_OUT' || !session?.user) {
        setUser(null);
        setProfile(null);
        setProfileLoading(false);
        setProfileLoaded(true);
        setLoading(false);
        return;
      }

      if (session?.user) {
        setProfileLoading(true);
        const prof = await fetchProfile(session.user.id);
        if (isMounted) {
          setUser(session.user);
          setProfile(prof);
          setProfileLoading(false);
          setProfileLoaded(true);
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setProfileLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setLoading(false);
        setProfileLoading(false);
        throw error;
      }

      if (data.user) {
        const prof = await fetchProfile(data.user.id);
        setUser(data.user);
        setProfile(prof);
        setProfileLoading(false);
        setProfileLoaded(true);
        setLoading(false);
        const rawRole = prof?.role ?? (data.user.user_metadata?.role as string | undefined);
        const resolvedRole: UserRole | null = (rawRole ? rawRole.toLowerCase().trim() : null) as UserRole | null;
        return { error: null, user: data.user, profile: prof, role: resolvedRole };
      }

      setProfileLoading(false);
      setProfileLoaded(true);
      setLoading(false);
      return { error: null, user: null, profile: null, role: null };
    } catch (err: any) {
      setProfileLoading(false);
      setProfileLoaded(true);
      setLoading(false);
      return { error: err, user: null, profile: null, role: null };
    }
  };

  const signUp = async ({
    email,
    password,
    fullName,
    role,
    studentIdNumber,
    phone,
    departmentId,
  }: {
    email: string;
    password: string;
    fullName: string;
    role: UserRole;
    studentIdNumber?: string;
    phone?: string;
    departmentId?: string;
  }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
            student_id_number: studentIdNumber,
            phone,
            department_id: departmentId,
          },
        },
      });

      if (error) throw error;

      // If user was created and session established, hydrate profile
      if (data.user) {
        const prof = await fetchProfile(data.user.id);
        if (prof) setProfile(prof);
        setProfileLoaded(true);
      }

      return { error: null, user: data.user, session: data.session };
    } catch (err: any) {
      return { error: err, user: null, session: null };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setProfileLoading(false);
    setProfileLoaded(true);
    setLoading(false);
  };

  const rawRole = profile?.role ?? (user?.user_metadata?.role as string | undefined);
  const activeRole: UserRole | null = (rawRole ? rawRole.toLowerCase().trim() : null) as UserRole | null;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role: activeRole,
        loading,
        profileLoading,
        profileLoaded,
        isConfigured: isSupabaseConfigured,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
