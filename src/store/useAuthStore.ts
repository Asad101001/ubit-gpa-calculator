import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  seat_no: string | null;
  is_admin: boolean;
  is_verified: boolean;
  show_results_publicly: boolean;
  created_at: string;
}

interface AuthState {
  user: any | null;
  session: any | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'signin' | 'signup';

  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string, seatNo: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  fetchProfile: (userId?: string) => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: string | null }>;
  openAuthModal: (mode?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  isAuthModalOpen: false,
  authModalMode: 'signin',

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        set({ user: session.user, session });
        await get().fetchProfile(session.user.id);
      }
    } catch (e) {
      console.error('Auth init error:', e);
    } finally {
      set({ isLoading: false });
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      set({ user: session?.user ?? null, session });
      if (session?.user) {
        await get().fetchProfile(session.user.id);
      } else {
        set({ profile: null });
      }
    });
  },

  signIn: async (email, password) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          return { error: 'Invalid email or password. Please check your credentials and try again.' };
        }
        return { error: error.message };
      }
      return { error: null };
    } catch (e: any) {
      return { error: e.message || 'Connection failed. Please retry.' };
    }
  },

  signUp: async (email, password, fullName, seatNo) => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanSeatNo = seatNo.toUpperCase().trim();

      // 1. Account Deduplication Check: Ensure Seat No is not claimed by another user
      if (cleanSeatNo) {
        const { data: existingSeat } = await supabase
          .from('profiles')
          .select('id, seat_no')
          .eq('seat_no', cleanSeatNo)
          .maybeSingle();

        if (existingSeat) {
          return {
            error: `Seat number ${cleanSeatNo} is already registered to another account. If this is your seat number, please sign in or contact the administrator.`
          };
        }
      }

      // 2. Perform Supabase Sign Up
      const { data, error } = await supabase.auth.signUp({ 
        email: cleanEmail, 
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            seat_no: cleanSeatNo || null
          }
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          return { error: 'An account with this email address already exists. Please sign in.' };
        }
        return { error: error.message };
      }

      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          email: cleanEmail,
          full_name: fullName.trim(),
          seat_no: cleanSeatNo || null,
          is_admin: false,
          is_verified: false,
          show_results_publicly: true,
        });

        if (profileError && !profileError.message.includes('duplicate key')) {
          console.error('Profile creation error:', profileError);
          return { error: 'Account created, but failed to link seat number. You can link it later in your profile.' };
        }
      }

      return { error: null };
    } catch (e: any) {
      return { error: e.message || 'Registration failed. Please check your network and retry.' };
    }
  },


  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, profile: null });
  },

  fetchProfile: async (userId) => {
    const id = userId || get().user?.id;
    if (!id) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (!error && data) {
      set({ profile: data as Profile });
    }
  },

  updateProfile: async (updates) => {
    const userId = get().user?.id;
    if (!userId) return { error: 'Not authenticated' };

    const previousProfile = get().profile;
    if (previousProfile) {
      set({ profile: { ...previousProfile, ...updates } });
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) {
        // Fallback for visibility toggle
        if (updates.show_results_publicly !== undefined) {
          const { data: { session } } = await supabase.auth.getSession();
          const res = await fetch('/api/update-visibility', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
            body: JSON.stringify({ show_results_publicly: updates.show_results_publicly }),
          });
          if (res.ok) {
            await get().fetchProfile(userId);
            return { error: null };
          }
        }
        if (previousProfile) set({ profile: previousProfile });
        return { error: error.message };
      }
      await get().fetchProfile(userId);
      return { error: null };
    } catch (e: any) {
      if (previousProfile) set({ profile: previousProfile });
      return { error: e.message || 'Update failed' };
    }
  },



  openAuthModal: (mode = 'signin') => set({ isAuthModalOpen: true, authModalMode: mode }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
}));
