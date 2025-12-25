'use server';

import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';

/**
 * Returns true if the given owner has an active or trialing subscription.
 */
export async function hasActiveSubscription(userId: string | null): Promise<boolean> {
  if (!userId) return false;

  const supabase = await createSupabaseServerClient();

  const { count } = await supabase
    .from('subscriptions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .in('status', ['active', 'trialing']);

  return Boolean(count && count > 0);
}
