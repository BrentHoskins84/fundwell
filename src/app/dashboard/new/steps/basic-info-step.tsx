'use client';

import { useFormContext } from 'react-hook-form';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CreateContestInput } from '@/features/contests/models/contest';
import { cn } from '@/utils/cn';

export function BasicInfoStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<CreateContestInput>();

  return (
    <div className="space-y-6">
      {/* Contest Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-zinc-200">
          Contest Name <span className="text-orange-500">*</span>
        </Label>
        <Input
          id="name"
          placeholder="Super Bowl Squares 2025"
          {...register('name')}
          className={cn(errors.name && 'border-red-500 focus:border-red-500 focus:ring-red-500')}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
        <p className="text-xs text-zinc-500">
          This is what participants will see when they join your contest.
        </p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-zinc-200">
          Description
        </Label>
        <Textarea
          id="description"
          placeholder="Fundraiser for our youth sports league. All proceeds go to new equipment!"
          {...register('description')}
          className={cn(errors.description && 'border-red-500 focus:border-red-500 focus:ring-red-500')}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
        <p className="text-xs text-zinc-500">
          Optional. Add context about your fundraiser or organization.
        </p>
      </div>

      {/* Team Names */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-zinc-200">Team Names</h3>
          <p className="text-xs text-zinc-500">
            Enter the teams playing in your game. Row team scores will be matched against the row axis.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Row Team */}
          <div className="space-y-2">
            <Label htmlFor="rowTeamName" className="text-zinc-200">
              Row Team (Home) <span className="text-orange-500">*</span>
            </Label>
            <Input
              id="rowTeamName"
              placeholder="Kansas City Chiefs"
              {...register('rowTeamName')}
              className={cn(errors.rowTeamName && 'border-red-500 focus:border-red-500 focus:ring-red-500')}
            />
            {errors.rowTeamName && (
              <p className="text-sm text-red-500">{errors.rowTeamName.message}</p>
            )}
          </div>

          {/* Column Team */}
          <div className="space-y-2">
            <Label htmlFor="colTeamName" className="text-zinc-200">
              Column Team (Away) <span className="text-orange-500">*</span>
            </Label>
            <Input
              id="colTeamName"
              placeholder="San Francisco 49ers"
              {...register('colTeamName')}
              className={cn(errors.colTeamName && 'border-red-500 focus:border-red-500 focus:ring-red-500')}
            />
            {errors.colTeamName && (
              <p className="text-sm text-red-500">{errors.colTeamName.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Grid Preview Hint */}
      <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-500/20">
            <span className="text-lg">🏈</span>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-200">How it works</p>
            <p className="mt-1 text-xs text-zinc-400">
              Your 10×10 grid will have the row team&apos;s last digit of their score on the left axis,
              and the column team&apos;s on the top. Winners are determined by matching the last digit
              of each team&apos;s score at the end of each quarter.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

