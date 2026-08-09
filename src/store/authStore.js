import { create } from 'zustand';

/**
 * @typedef {Object} AuthState
 * @property {import('@supabase/supabase-js').User|null} user     - Supabase auth user object
 * @property {object|null}                               profile  - Public profiles row
 * @property {boolean}                                   isLoading
 * @property {boolean}                                   isAuthenticated
 */

/**
 * @typedef {Object} AuthActions
 * @property {(user: object) => void}    setUser
 * @property {(profile: object) => void} setProfile
 * @property {(loading: boolean) => void} setLoading
 * @property {() => void}                clearAuth
 */

/** @type {import('zustand').StoreApi<AuthState & AuthActions>} */
export const useAuthStore = create((set) => ({
  // ── State ────────────────────────────────────────────────
  user:            null,
  profile:         null,
  isLoading:       true,
  isAuthenticated: false,

  

  // ── Actions ──────────────────────────────────────────────

  /** Stores the Supabase auth user and marks as authenticated. */
  setUser: (user) =>
    set({ user, isAuthenticated: !!user }),

  /** Stores the public profile row fetched from the DB. */
  setProfile: (profile) => 
    set({profile}),

  /** Toggles the global loading flag used during session initialisation. */
  setLoading: (isLoading) =>
    set({ isLoading }),

  /** Resets all auth state (called on sign-out). */
  clearAuth: () =>
    set({ user: null, profile: null, isAuthenticated: false, isLoading: false }),
}));

// ── Selectors ──────────────────────────────────────────────

/**
 * Convenience selector — returns the authenticated user's role string,
 * or undefined when not logged in.
 *
 * @returns {'customer'|'vendor'|'admin'|undefined}
 */
export function useRole() {
  return useAuthStore((state) => state.profile?.role);
}
