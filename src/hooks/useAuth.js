import { useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';
import { 
  onAuthStateChange, 
  fetchProfile, 
  getCurrentSession,
  signInWithEmail,
  signUpWithEmail,
  updateProfile,
  changePassword
} from '../services/authService';

/**
 * Bootstraps auth state on mount by:
 *   1. Checking for an existing session (page refresh / returning user)
 *   2. Subscribing to all future auth-state changes
 *   3. Fetching the profile row whenever a session is detected
 *
 * Mount this hook **once** at the top of the component tree (e.g. in App.jsx).
 *
 * @returns {{ user, profile, role, isLoading, isAuthenticated }}
 */
let isAuthSetupStarted = false;

export function useAuth() {
  const {
    user,
    profile,
    isLoading,
    isAuthenticated,
    setUser,
    setProfile,
    setLoading,
    clearAuth,
  } = useAuthStore();

  useEffect(() => {
    if (isAuthSetupStarted) return;
    isAuthSetupStarted = true;

    let isMounted = true;

    // Explicitly set isLoading = true on mount
    setLoading(true);

    /** Loads a session + profile and syncs them into the store. */
    async function syncSession(session) {
      if (!isMounted) return;

      if (!session?.user) {
        clearAuth();
        return;
      }

      setLoading(true);
      setUser(session.user);

      try {
        // Fetch profile from Supabase
        const profileData = await fetchProfile(session.user.id);
        // Store profile (with role) in the Zustand store
        if (isMounted) setProfile(profileData);
      } catch (err) {
        // Profile may not exist yet (e.g. during email confirmation)
        if (isMounted) setProfile(null);
      } finally {
        // Only set isLoading = false AFTER profile is fetched or failed
        if (isMounted) setLoading(false);
      }
    }

    // ── 1. Hydrate from existing session ──────────────────
    getCurrentSession()
      .then(syncSession)
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    // ── 2. Subscribe to future auth events ────────────────
    const subscription = onAuthStateChange((_event, session) => {
      if (session) {
        syncSession(session);
      } else {
        if (isMounted) clearAuth();
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      isAuthSetupStarted = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    user,
    profile,
    role:            profile?.role,
    isLoading,
    isAuthenticated,
  };
}

/**
 * Mutation hook for logging in.
 */
export function useLogin() {
  const showToast = useUiStore((state) => state.showToast);

  return useMutation({
    mutationFn: ({ email, password }) => signInWithEmail(email, password),
    onSuccess: () => {
      showToast('Welcome back!', 'success');
    },
    onError: (error) => {
      showToast(error.message || 'Login failed', 'error');
    },
  });
}

/**
 * Mutation hook for registering a new user.
 */
export function useRegister() {
  const showToast = useUiStore((state) => state.showToast);

  return useMutation({
    mutationFn: ({ email, password, full_name, role, phone_number }) =>
      signUpWithEmail(email, password, full_name, role, phone_number),
    onSuccess: () => {
      showToast('Registration successful!', 'success');
    },
    onError: (error) => {
      showToast(error.message || 'Registration failed', 'error');
    },
  });
}

/**
 * Mutation hook for updating profile settings.
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const showToast = useUiStore((state) => state.showToast);
  const { user, setProfile } = useAuthStore();

  return useMutation({
    mutationFn: (data) => updateProfile(user.id, data),
    onSuccess: (updatedProfile) => {
      setProfile(updatedProfile);
      showToast('Profile updated successfully!', 'success');
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
    onError: (error) => {
      showToast(error.message || 'Failed to update profile', 'error');
    },
  });
}

/**
 * Mutation hook for changing the current user's password.
 */
export function useChangePassword() {
  const showToast = useUiStore((state) => state.showToast);

  return useMutation({
    mutationFn: ({ newPassword }) => changePassword(newPassword),
    onSuccess: () => {
      showToast('Password changed successfully!', 'success');
    },
    onError: (error) => {
      showToast(error.message || 'Failed to change password', 'error');
    },
  });
}
