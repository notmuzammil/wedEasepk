import { supabase } from '../lib/supabaseClient';

/**
 * Creates a new auth user and upserts their profile row.
 * The DB trigger auto-creates a profile, but we upsert here
 * to ensure role and full_name are set immediately.
 *
 * @param {string} email
 * @param {string} password
 * @param {string} fullName
 * @param {'customer'|'vendor'} role
 * @returns {Promise<{ user: object, session: object }>}
 */
export async function signUpWithEmail(email, password, fullName, role = 'customer', phone = null) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    // The handle_new_auth_user() trigger reads these to populate the profile
    // row, so role and phone must travel with the signup — not be patched
    // afterwards, which the anon user has no permission to do.
    options: { data: { full_name: fullName, role, phone } },
  });
  if (error) throw error;

  return data;
}

export async function signInWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  // The profile is a convenience for the caller; useAuth() loads it properly.
  // A missing row must not block an otherwise valid sign-in.
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .maybeSingle();

  return { ...data, profile: profile || null };
}

/**
 * Signs out the currently authenticated user.
 *
 * @returns {Promise<void>}
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Returns the current active session, or null if unauthenticated.
 *
 * @returns {Promise<import('@supabase/supabase-js').Session|null>}
 */
export async function getCurrentSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

/**
 * Subscribes to auth state changes (LOGIN, LOGOUT, TOKEN_REFRESHED, etc.)
 *
 * @param {(event: string, session: object|null) => void} callback
 * @returns {{ unsubscribe: () => void }} — call unsubscribe() on cleanup
 */
export function onAuthStateChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return subscription;
}

/**
 * Fetches the public profile row for a given user id.
 *
 * @param {string} userId
 * @returns {Promise<object>} profile row
 */
export async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

/**
 * Updates a profile row in profiles table.
 *
 * @param {string} userId
 * @param {{ fullName: string, phone: string }} updateData
 * @returns {Promise<object>} updated profile
 */
export async function updateProfile(userId, { fullName, phone }) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ full_name: fullName, phone })
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Changes the current user's password.
 *
 * @param {string} newPassword
 * @returns {Promise<object>}
 */
export async function changePassword(newPassword) {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
  return data;
}
