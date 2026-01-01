'use server';

import { ActionResponse } from '@/types/action-response';

import { withContestOwnership } from '../middleware/auth-middleware';

/**
 * Soft deletes a contest by setting deleted_at timestamp.
 * Only the owner can delete their contest.
 */
export async function deleteContest(contestId: string): Promise<ActionResponse<null>> {
  return withContestOwnership<null>(contestId, async (user, supabase) => {
    const { error: deleteError } = await supabase
      .from('contests')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', contestId)
      .eq('owner_id', user.id);

    if (deleteError) {
      throw new Error('Failed to delete');
    }

    return null;
  })();
}

