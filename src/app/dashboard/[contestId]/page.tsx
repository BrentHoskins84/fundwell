import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  IoArrowBack,
  IoCopy,
  IoEye,
  IoGameController,
  IoPeople,
  IoPlay,
  IoSettings,
} from 'react-icons/io5';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createSupabaseServerClient } from '@/libs/supabase/supabase-server-client';
import { Database } from '@/libs/supabase/types';
import { cn } from '@/utils/cn';
import { getURL } from '@/utils/get-url';

import { CopyLinkButton } from './copy-link-button';
import { OpenContestButton } from './open-contest-button';

type ContestStatus = Database['public']['Enums']['contest_status'];
type PaymentStatus = Database['public']['Enums']['payment_status'];

interface Square {
  id: string;
  row_index: number;
  col_index: number;
  payment_status: PaymentStatus;
  claimant_first_name: string | null;
  claimant_last_name: string | null;
}

interface ContestDetailPageProps {
  params: Promise<{ contestId: string }>;
}

const STATUS_LABELS: Record<ContestStatus, string> = {
  draft: 'Draft',
  open: 'Open',
  locked: 'Locked',
  in_progress: 'In Progress',
  completed: 'Completed',
};

export default async function ContestDetailPage({ params }: ContestDetailPageProps) {
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
  const { data: contest, error: contestError } = await supabase
    .from('contests')
    .select('*')
    .eq('id', contestId)
    .single();

  if (contestError || !contest) {
    notFound();
  }

  // Fetch squares for the grid
  const { data: squares } = await supabase
    .from('squares')
    .select('id, row_index, col_index, payment_status, claimant_first_name, claimant_last_name')
    .eq('contest_id', contestId)
    .order('row_index')
    .order('col_index');

  // Calculate stats
  const squaresList = (squares || []) as Square[];
  const claimedSquares = squaresList.filter((s) => s.payment_status !== 'available');
  const paidSquares = squaresList.filter((s) => s.payment_status === 'paid');
  const revenue = paidSquares.length * Number(contest.square_price);

  // Create 10x10 grid
  const grid: Square[][] = Array.from({ length: 10 }, () => Array(10).fill(null));
  squaresList.forEach((square) => {
    if (square.row_index >= 0 && square.row_index <= 9 && square.col_index >= 0 && square.col_index <= 9) {
      grid[square.row_index][square.col_index] = square;
    }
  });

  const publicUrl = getURL(`/c/${contest.code}`);

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
      >
        <IoArrowBack className="h-4 w-4" />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white lg:text-3xl">{contest.name}</h1>
            <Badge variant={contest.status as ContestStatus}>{STATUS_LABELS[contest.status]}</Badge>
          </div>
          <p className="text-sm text-zinc-400">
            {contest.row_team_name} vs {contest.col_team_name}
          </p>
          {contest.description && <p className="text-sm text-zinc-500">{contest.description}</p>}
        </div>

        <div className="flex flex-wrap gap-2">
          <CopyLinkButton url={publicUrl} code={contest.code} />
          <Button variant="default" size="sm" asChild>
            <Link href={`/dashboard/${contestId}/settings`}>
              <IoSettings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="pb-2">
            <CardDescription className="text-zinc-500">Total Squares</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-white">100</p>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="pb-2">
            <CardDescription className="text-zinc-500">Claimed</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-400">{claimedSquares.length}</p>
            <p className="text-xs text-zinc-500">{100 - claimedSquares.length} available</p>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="pb-2">
            <CardDescription className="text-zinc-500">Paid</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-400">{paidSquares.length}</p>
            <p className="text-xs text-zinc-500">
              {claimedSquares.length - paidSquares.length} pending payment
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="pb-2">
            <CardDescription className="text-zinc-500">Revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-400">${revenue.toLocaleString()}</p>
            <p className="text-xs text-zinc-500">
              ${(100 * Number(contest.square_price)).toLocaleString()} max
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Grid Preview */}
      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-white">Grid Preview</CardTitle>
          <CardDescription>10×10 squares grid • Click to manage squares</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto p-12 pt-6">
            <div className="min-w-[400px]">
              {/* Column team header */}
              <div className="mb-3 ml-8 text-center text-sm font-medium text-zinc-400">
                {contest.col_team_name}
              </div>

              <div className="flex items-center">
                {/* Row team label - vertical */}
                <div className="flex w-8 flex-shrink-0 items-center justify-center">
                  <span
                    className="whitespace-nowrap text-sm font-medium text-zinc-400"
                    style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}
                  >
                    {contest.row_team_name}
                  </span>
                </div>

                {/* Grid */}
                <div className="flex-1">
                  <div className="grid grid-cols-10 gap-1">
                    {grid.map((row, rowIndex) =>
                      row.map((square, colIndex) => (
                        <div
                          key={`${rowIndex}-${colIndex}`}
                          className={cn(
                            'aspect-square rounded-sm transition-colors',
                            square?.payment_status === 'available' && 'bg-zinc-700 hover:bg-zinc-600',
                            square?.payment_status === 'pending' && 'bg-yellow-500/30',
                            square?.payment_status === 'paid' && 'bg-green-500/30',
                            !square && 'bg-zinc-800'
                          )}
                          title={
                            square
                              ? square.payment_status === 'available'
                                ? 'Available'
                                : `${square.claimant_first_name} ${square.claimant_last_name} (${square.payment_status})`
                              : 'Loading...'
                          }
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="ml-8 mt-4 flex flex-wrap justify-center gap-4 text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-sm bg-zinc-700" />
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-sm bg-yellow-500/30" />
                  <span>Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-sm bg-green-500/30" />
                  <span>Paid</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
          <CardDescription>Manage your contest</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {contest.status === 'draft' && <OpenContestButton contestId={contestId} />}

            <Button variant="default" asChild>
              <Link href={`/c/${contest.code}`} target="_blank">
                <IoEye className="mr-2 h-4 w-4" />
                View Public Page
              </Link>
            </Button>

            <Button variant="default" asChild>
              <Link href={`/dashboard/${contestId}/scores`}>
                <IoGameController className="mr-2 h-4 w-4" />
                Enter Scores
              </Link>
            </Button>

            <Button variant="default" asChild>
              <Link href={`/dashboard/${contestId}/participants`}>
                <IoPeople className="mr-2 h-4 w-4" />
                Manage Participants
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

