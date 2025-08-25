
import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signOut: () => Promise<any>;
  resetPassword: (email: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for demo mode first
    const demoUser = localStorage.getItem('demoUser');
    if (demoUser) {
      try {
        const demoUserData = JSON.parse(demoUser);
        console.log('🚀 Demo mode activated:', demoUserData);
        setUser(demoUserData as any);
        setLoading(false);
        return;
      } catch (err) {
        console.error('Failed to parse demo user:', err);
        localStorage.removeItem('demoUser');
      }
    }

    // Test Supabase connection first
    const testConnection = async () => {
      try {
        console.log('🔍 Testing Supabase connection...');
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('❌ Supabase connection error:', error);
        } else {
          console.log('✅ Supabase connection successful');
        }
      } catch (err) {
        console.error('❌ Failed to connect to Supabase:', err);
      }
    };

    testConnection();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('📱 Initial session:', session);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch(err => {
      console.error('❌ Error getting initial session:', err);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('🔄 Auth state change:', _event, session);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData: any) => {
    console.log('🚀 Attempting signup for:', email);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });
      
      if (error) {
        console.error('❌ Signup error:', error);
      } else {
        console.log('✅ Signup successful:', data);
      }
      
      return { data, error };
    } catch (err) {
      console.error('❌ Signup exception:', err);
      return { data: null, error: err };
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔑 Attempting signin for:', email);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('❌ Signin error:', error);
      } else {
        console.log('✅ Signin successful:', data);
      }
      
      return { data, error };
    } catch (err) {
      console.error('❌ Signin exception:', err);
      return { data: null, error: err };
    }
  };

  const signInWithGoogle = async () => {
    console.log('🌐 Attempting Google OAuth signin');
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) {
        console.error('❌ Google OAuth error:', error);
      } else {
        console.log('✅ Google OAuth initiated:', data);
      }
      
      return { data, error };
    } catch (err) {
      console.error('❌ Google OAuth exception:', err);
      return { data: null, error: err };
    }
  };

  const signOut = async () => {
    console.log('🚪 Attempting signout');
    
    // Handle demo mode signout
    if (user?.id === 'demo-user-123') {
      localStorage.removeItem('demoUser');
      setUser(null);
      setSession(null);
      console.log('✅ Demo mode signout successful');
      return { error: null };
    }
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Signout error:', error);
      } else {
        console.log('✅ Signout successful');
      }
      return { error };
    } catch (err) {
      console.error('❌ Signout exception:', err);
      return { error: err };
    }
  };

  const resetPassword = async (email: string) => {
    console.log('🔐 Attempting password reset for:', email);
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) {
        console.error('❌ Password reset error:', error);
      } else {
        console.log('✅ Password reset email sent:', data);
      }
      
      return { data, error };
    } catch (err) {
      console.error('❌ Password reset exception:', err);
      return { data: null, error: err };
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
