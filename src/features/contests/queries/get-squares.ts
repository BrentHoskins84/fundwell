import { Square } from '@/features/contests/components';
import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';

/**
 * Fetches all 100 squares for a contest, ordered by position
 */
export async function getSquaresForContest(contestId: string): Promise<Square[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('squares')
    .select('id, row_index, col_index, payment_status, claimant_first_name, claimant_last_name')
    .eq('contest_id', contestId)
    .order('row_index')
    .order('col_index');

  if (error) {
    throw new Error(`Failed to fetch squares: ${error.message}`);
  }

  return data ?? [];
}
