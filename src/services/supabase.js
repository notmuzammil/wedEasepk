import { supabase } from '../lib/supabaseClient';

export const signUpUser = async ({ email, password, fullName, phone, role }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: full_name,
        phone_number: phone,
        role: role
      }
    }
  });

  if (error) throw error;
  return data;
};

export const signInUser = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const signOutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUserProfile = async (userId) => {
  if (!userId) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
};

export const updateUserProfile = async (userId, { fullName, phone }) => {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      phone_number: phone
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};
