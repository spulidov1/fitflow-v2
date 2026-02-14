// ============================================================================
// AUTH SERVICE - Handle all authentication operations
// ============================================================================

import { supabase } from './supabase';

class AuthService {
  /**
   * Sign up new user with email and password
   */
  async signUp(email, password, name) {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }, // Store name in user metadata
        },
      });

      if (authError) throw authError;

      // Create profile if user was created
      if (authData.user) {
        const { error: profileError } = await supabase.from('profiles').insert([{
          id: authData.user.id,
          name: name,
          target_weight: 0,
          start_weight: 0,
          height_inches: 70,
          daily_calorie_goal: 2000,
          unit_preference: 'lbs',
          preferences: {
            darkMode: false,
            notifications: true,
          },
          privacy_settings: {
            weight: 'private',
            calories: 'private',
            photos: 'private',
            mood: 'private',
            wellness: 'private',
          },
        }]);

        if (profileError) throw profileError;
      }

      return { data: authData, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(email, password, rememberMe = false) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Handle remember me
      if (rememberMe) {
        localStorage.setItem('fitflow_remember', 'true');
      } else {
        localStorage.removeItem('fitflow_remember');
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Sign in with Google OAuth
   */
  async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Sign out current user
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear remember me
      localStorage.removeItem('fitflow_remember');
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { user, error: null };
    } catch (error) {
      return { user: null, error };
    }
  }

  /**
   * Send password reset email
   */
  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Update password (after reset)
   */
  async updatePassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(email) {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  /**
   * Check if user email is verified
   */
  async isEmailVerified() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.email_confirmed_at !== null;
    } catch {
      return false;
    }
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  }

  /**
   * Get session
   */
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return { session, error: null };
    } catch (error) {
      return { session: null, error };
    }
  }

  /**
   * Refresh session
   */
  async refreshSession() {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}

export default new AuthService();
