import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Database } from '@/libs/supabase/types';

type ContestStatus = Database['public']['Enums']['contest_status'];

type NextStepInfo = {
  message: string;
  actionLink: string | null;
} | null;

function getNextStep(
  status: ContestStatus,
  hasPaymentOptions: boolean,
  hasNumbers: boolean,
  contestId: string
): NextStepInfo {
  if (status === 'in_progress' || status === 'completed') return null;

  if (status === 'draft') {
    return !hasPaymentOptions
      ? { message: 'Add payment options so participants can pay for their squares', actionLink: `/dashboard/${contestId}/settings` }
      : { message: 'Open your contest to allow participants to claim squares', actionLink: null };
  }

  if (status === 'open') {
    return !hasNumbers
      ? { message: 'Enter numbers or let them auto-generate when you lock the contest', actionLink: null }
      : { message: 'Lock the contest to prevent new claims and prepare for game day', actionLink: null };
  }

  if (status === 'locked') {
    return !hasNumbers
      ? { message: 'Enter numbers before starting the game', actionLink: null }
      : { message: 'Start the game to begin tracking scores', actionLink: null };
  }

  return null;
}

interface NextStepsCardProps {
  contestId: string;
  status: ContestStatus;
  hasPaymentOptions: boolean;
  hasNumbers: boolean;
}

export function NextStepsCard({
  contestId,
  status,
  hasPaymentOptions,
  hasNumbers,
}: NextStepsCardProps) {
  const nextStep = getNextStep(status, hasPaymentOptions, hasNumbers, contestId);

  if (!nextStep) return null;

  return (
    <Card className="border-zinc-800 border-l-2 border-l-orange-400 bg-zinc-900">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            Next Step
            <ArrowRight className="h-4 w-4 text-orange-400" />
          </CardTitle>
          <CardDescription>{nextStep.message}</CardDescription>
        </div>
        {nextStep.actionLink && (
          <Button variant="outline" size="sm" asChild>
            <Link href={nextStep.actionLink}>Go to Settings</Link>
          </Button>
        )}
      </CardHeader>
    </Card>
  );
}
