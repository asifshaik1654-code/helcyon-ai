import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseFrontendConfigured } from '../services/supabase';
import { UserProfile } from '../types';
import { mockProfile } from '../data/mockData';

export interface AuthContextType {
  user: any | null;
  session: any | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password?: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(mockProfile);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseFrontendConfigured) {
      // In local development / demo mode, auto-initialize with demo user
      setUser({
        id: mockProfile.id,
        email: mockProfile.email,
        user_metadata: { full_name: mockProfile.fullName },
      });
      setSession({ access_token: 'demo-session-token' });
      setProfile(mockProfile);
      setIsLoading(false);
      return;
    }

    // Check active live session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile({
          id: data.id,
          email: user?.email || '',
          fullName: data.full_name,
          preferredCurrency: data.preferred_currency,
          monthlyIncome: Number(data.monthly_income),
          onboardingCompleted: data.onboarding_completed,
        });
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  };

  const signIn = async (email: string, password?: string) => {
    // Fast path demo login
    if (!isSupabaseFrontendConfigured || email === 'asif.shaik@helcyon.ai') {
      setUser({
        id: mockProfile.id,
        email: mockProfile.email,
        user_metadata: { full_name: mockProfile.fullName },
      });
      setSession({ access_token: 'demo-session-token' });
      setProfile(mockProfile);
      return {};
    }

    if (!password) {
      return { error: 'Password required' };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    setSession(data.session);
    setUser(data.user);
    if (data.user) {
      fetchUserProfile(data.user.id);
    }
    return {};
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!isSupabaseFrontendConfigured) {
      const demoUser = {
        id: 'usr_' + Date.now(),
        email,
        user_metadata: { full_name: fullName },
      };
      setUser(demoUser);
      setSession({ access_token: 'demo-session-token' });
      setProfile({
        id: demoUser.id,
        email,
        fullName,
        preferredCurrency: 'INR',
        monthlyIncome: 0,
        onboardingCompleted: false,
      });
      return {};
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          preferred_currency: 'INR',
        },
      },
    });

    if (error) {
      return { error: error.message };
    }

    setSession(data.session);
    setUser(data.user);
    return {};
  };

  const signOut = async () => {
    if (isSupabaseFrontendConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (profile) {
      const updated = { ...profile, ...updates };
      setProfile(updated);

      if (isSupabaseFrontendConfigured && user) {
        await supabase
          .from('profiles')
          .update({
            full_name: updates.fullName,
            preferred_currency: updates.preferredCurrency,
            monthly_income: updates.monthlyIncome,
            onboarding_completed: updates.onboardingCompleted,
          })
          .eq('id', user.id);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        signIn,
        signUp,
        signOut,
        updateProfile,
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
