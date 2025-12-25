'use client';

import Link from 'next/link';
import { Grid3X3 } from 'lucide-react';
import { IoAmericanFootball, IoBaseball } from 'react-icons/io5';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { Database } from '@/libs/supabase/types';

type Contest = Database['public']['Tables']['contests']['Row'] & {
  sport_type?: 'football' | 'baseball';
  squares?: { payment_status: string }[];
};

type ContestStatus = Database['public']['Enums']['contest_status'];

const statusLabels: Record<ContestStatus, string> = {
  draft: 'Draft',
  open: 'Open',
  locked: 'Locked',
  in_progress: 'In Progress',
  completed: 'Completed',
};

interface ContestCardProps {
  contest: Contest;
  claimedCount?: number;
}

export function ContestCard({ contest, claimedCount = 0 }: ContestCardProps) {
  const sportType = contest.sport_type ?? 'football';
  const SportIcon = sportType === 'baseball' ? IoBaseball : IoAmericanFootball;

  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(contest.created_at));

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(contest.square_price);

  return (
    <Link href={`/dashboard/${contest.id}`} className="group block">
      <Card className="h-full border-zinc-800 bg-zinc-800/50 transition-all duration-200 hover:border-orange-500/50 hover:bg-zinc-800/80">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10">
                <SportIcon className="h-5 w-5 text-orange-500" />
              </div>
              <h3 className="line-clamp-1 font-semibold text-white group-hover:text-orange-400 transition-colors">
                {contest.name}
              </h3>
            </div>
            <Badge variant={contest.status}>{statusLabels[contest.status]}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {/* Teams */}
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <span className="font-medium text-zinc-300">{contest.row_team_name}</span>
            <span className="text-zinc-600">vs</span>
            <span className="font-medium text-zinc-300">{contest.col_team_name}</span>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between border-t border-zinc-700/50 pt-3">
            <div className="flex items-center gap-4">
              {/* Square price */}
              <div className="text-sm">
                <span className="text-orange-400 font-semibold">{formattedPrice}</span>
                <span className="text-zinc-500 ml-1">/sq</span>
              </div>
              {/* Progress */}
              <div className="flex items-center gap-1.5 text-sm text-zinc-400">
                <Grid3X3 className="h-3.5 w-3.5" />
                <span>
                  <span className="font-medium text-zinc-300">{claimedCount}</span>
                  <span className="text-zinc-500">/100</span>
                </span>
              </div>
            </div>
            {/* Date */}
            <div className="text-xs text-zinc-500">{formattedDate}</div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

