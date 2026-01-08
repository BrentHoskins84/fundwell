'use server';

import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';

/**
 * Get count of squares sold per player (referred_by) for a contest
 */
export async function getPlayerSalesCounts(contestId: string): Promise<Record<string, number>> {
  const supabase = await createSupabaseServerClient();

  const { data: squares } = await supabase
    .from('squares')
    .select('referred_by')
    .eq('contest_id', contestId)
    .not('referred_by', 'is', null)
    .not('claimant_first_name', 'is', null);

  if (!squares) return {};

  const counts: Record<string, number> = {};
  for (const square of squares) {
    if (square.referred_by) {
      counts[square.referred_by] = (counts[square.referred_by] || 0) + 1;
    }
  }

  return counts;
}

