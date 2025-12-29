import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';

export async function getUserProfile() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.from('users').select('*').single();

  if (error) {
    // TODO: Replace with proper error handling
    console.error(error);
  }

  return data;
}

