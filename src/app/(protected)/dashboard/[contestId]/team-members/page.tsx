import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, UserPlus } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getContestById, getPlayerSalesCounts } from '@/features/contests/queries';
import { Player } from '@/features/contests/types/player';
import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';

import { TeamMembersTableClient } from './team-members-table-client';

interface TeamMembersPageProps {
  params: Promise<{ contestId: string }>;
}

export default async function TeamMembersPage({ params }: TeamMembersPageProps) {
  const { contestId } = await params;
  const supabase = await createSupabaseServerClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  // Fetch contest (RLS will ensure only owner can view)
  const contest = await getContestById(contestId);

  if (!contest) {
    notFound();
  }

  // Check if player tracking is enabled
  if (!contest.enable_player_tracking) {
    redirect(`/dashboard/${contestId}`);
  }

  // Parse players from JSONB
  const players = (contest.players as unknown as Player[]) || [];

  // Fetch sales counts
  const salesCounts = await getPlayerSalesCounts(contestId);

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href={`/dashboard/${contestId}`}
        className="inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Contest
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white lg:text-3xl">Manage Team Members</h1>
          <p className="text-sm text-zinc-400">
            {contest.name} • {players.length} member{players.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Team Members Table Card */}
      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-orange-400" />
            <div>
              <CardTitle className="text-white">Team Members</CardTitle>
              <CardDescription>View and manage team members who sell squares</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <TeamMembersTableClient
            players={players}
            salesCounts={salesCounts}
            contestId={contestId}
            contestName={contest.name}
            contestSlug={contest.slug}
          />
        </CardContent>
      </Card>
    </div>
  );
}
