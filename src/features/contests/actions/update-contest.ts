'use server';

import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';
import { Database } from '@/libs/supabase/types';
import { ActionResponse } from '@/types/action-response';

type ContestUpdate = Database['public']['Tables']['contests']['Update'];

/**
 * Updates a contest. Only the owner can update their contest.
 */
export async function updateContest(
  contestId: string,
  updates: ContestUpdate
): Promise<ActionResponse<{ id: string }>> {
  const supabase = await createSupabaseServerClient();

  // Verify user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: null, error: { message: 'You must be logged in' } };
  }

  // Validate status transitions
  if (updates.status === 'in_progress') {
    const { data: contest } = await supabase
      .from('contests')
      .select('row_numbers')
      .eq('id', contestId)
      .eq('owner_id', user.id)
      .single();

    if (contest?.row_numbers === null) {
      return { data: null, error: { message: 'Please enter numbers before starting the game' } };
    }
  }

  if (updates.status === 'open') {
    // Check if unlocking from locked - scores must not exist
    const { data: contest } = await supabase
      .from('contests')
      .select('status')
      .eq('id', contestId)
      .eq('owner_id', user.id)
      .single();

    if (contest?.status === 'locked') {
      const { count: scoresCount } = await supabase
        .from('scores')
        .select('*', { count: 'exact', head: true })
        .eq('contest_id', contestId);

      if (scoresCount && scoresCount > 0) {
        return { data: null, error: { message: 'Cannot unlock contest after scores have been entered' } };
      }
    }

    // Opening from draft - payment options required
    const { count } = await supabase
      .from('payment_options')
      .select('*', { count: 'exact', head: true })
      .eq('contest_id', contestId);

    if (!count || count === 0) {
      return { data: null, error: { message: 'Please add payment options before opening the contest' } };
    }
  }

  // Update contest (RLS ensures only owner can update)
  const { data, error } = await supabase
    .from('contests')
    .update(updates)
    .eq('id', contestId)
    .eq('owner_id', user.id)
    .select('id')
    .single();

  if (error) {
    return { data: null, error: { message: `Failed to update contest: ${error.message}` } };
  }

  return { data: { id: data.id }, error: null };
}
