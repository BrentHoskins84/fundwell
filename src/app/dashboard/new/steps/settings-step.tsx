'use client';

import { useFormContext, useWatch } from 'react-hook-form';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreateContestInput } from '@/features/contests/models/contest';
import { cn } from '@/utils/cn';

const PAYOUT_FIELDS = [
  { name: 'payoutQ1Percent', label: 'Q1', color: 'bg-amber-500' },
  { name: 'payoutQ2Percent', label: 'Halftime', color: 'bg-orange-500' },
  { name: 'payoutQ3Percent', label: 'Q3', color: 'bg-red-500' },
  { name: 'payoutFinalPercent', label: 'Final', color: 'bg-rose-600' },
] as const;

export function SettingsStep() {
  const {
    register,
    formState: { errors },
    control,
  } = useFormContext<CreateContestInput>();

  // Watch payout values for the visual indicator
  const payoutValues = useWatch({
    control,
    name: ['payoutQ1Percent', 'payoutQ2Percent', 'payoutQ3Percent', 'payoutFinalPercent'],
  });

  const squarePrice = useWatch({ control, name: 'squarePrice' });

  const totalPayout = payoutValues.reduce((sum, val) => sum + (Number(val) || 0), 0);
  const totalPot = (Number(squarePrice) || 0) * 100;

  return (
    <div className="space-y-8">
      {/* Square Price */}
      <div className="space-y-2">
        <Label htmlFor="squarePrice" className="text-zinc-200">
          Price Per Square <span className="text-orange-500">*</span>
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">$</span>
          <Input
            id="squarePrice"
            type="number"
            min="1"
            step="1"
            placeholder="10"
            {...register('squarePrice')}
            className={cn(
              'pl-7',
              errors.squarePrice && 'border-red-500 focus:border-red-500 focus:ring-red-500'
            )}
          />
        </div>
        {errors.squarePrice && (
          <p className="text-sm text-red-500">{errors.squarePrice.message}</p>
        )}
        {totalPot > 0 && (
          <p className="text-xs text-zinc-500">
            Total pot if all squares sell: <span className="font-medium text-orange-400">${totalPot.toLocaleString()}</span>
          </p>
        )}
      </div>

      {/* Max Squares Per Person */}
      <div className="space-y-2">
        <Label htmlFor="maxSquaresPerPerson" className="text-zinc-200">
          Max Squares Per Person
        </Label>
        <Input
          id="maxSquaresPerPerson"
          type="number"
          min="1"
          max="100"
          placeholder="No limit"
          {...register('maxSquaresPerPerson')}
          className={cn(
            errors.maxSquaresPerPerson && 'border-red-500 focus:border-red-500 focus:ring-red-500'
          )}
        />
        {errors.maxSquaresPerPerson && (
          <p className="text-sm text-red-500">{errors.maxSquaresPerPerson.message}</p>
        )}
        <p className="text-xs text-zinc-500">
          Leave blank to allow unlimited squares per participant.
        </p>
      </div>

      {/* Payout Distribution */}
      <div className="space-y-4">
        <div>
          <Label className="text-zinc-200">Payout Distribution</Label>
          <p className="text-xs text-zinc-500">
            How winnings are split between quarters. The rest goes to your fundraiser.
          </p>
        </div>

        {/* Visual Progress Bar */}
        <div className="h-4 overflow-hidden rounded-full bg-zinc-800">
          <div className="flex h-full">
            {PAYOUT_FIELDS.map((field, index) => {
              const value = Number(payoutValues[index]) || 0;
              return (
                <div
                  key={field.name}
                  className={cn('h-full transition-all duration-300', field.color)}
                  style={{ width: `${value}%` }}
                />
              );
            })}
          </div>
        </div>

        {/* Payout Inputs */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {PAYOUT_FIELDS.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name} className="text-zinc-200">
                {field.label}
              </Label>
              <div className="relative">
                <Input
                  id={field.name}
                  type="number"
                  min="0"
                  max="100"
                  {...register(field.name)}
                  className={cn(
                    'pr-7',
                    errors[field.name] && 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  )}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">%</span>
              </div>
            </div>
          ))}
        </div>

        {/* Total Indicator */}
        <div
          className={cn(
            'flex items-center justify-between rounded-lg border p-3',
            totalPayout <= 100
              ? 'border-green-500/50 bg-green-500/10'
              : 'border-red-500/50 bg-red-500/10'
          )}
        >
          <span className={cn('text-sm', totalPayout <= 100 ? 'text-green-400' : 'text-red-400')}>
            Total Payouts: {totalPayout}%
          </span>
          {totalPayout <= 100 ? (
            <span className="text-xs text-green-400">✓ Valid ({100 - totalPayout}% to fundraiser)</span>
          ) : (
            <span className="text-xs text-red-400">
              {totalPayout - 100}% over limit
            </span>
          )}
        </div>

        {errors.payoutFinalPercent && (
          <p className="text-sm text-red-500">{errors.payoutFinalPercent.message}</p>
        )}
      </div>

      {/* Payout Breakdown */}
      {totalPot > 0 && totalPayout <= 100 && (
        <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
          <p className="mb-4 text-sm font-medium text-zinc-200">Payout Breakdown</p>
          
          {/* Total Pot */}
          <div className="mb-4 flex items-center justify-between border-b border-zinc-700 pb-3">
            <span className="text-sm text-zinc-400">Total Pot (100 squares × ${Number(squarePrice).toLocaleString()})</span>
            <span className="text-lg font-semibold text-white">${totalPot.toLocaleString()}</span>
          </div>
          
          {/* Quarter Payouts */}
          <div className="space-y-2">
            {PAYOUT_FIELDS.map((field, index) => {
              const percent = Number(payoutValues[index]) || 0;
              const amount = (totalPot * percent) / 100;
              return (
                <div key={field.name} className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">
                    {field.label}: {percent}%
                  </span>
                  <span className="font-medium text-orange-400">${amount.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
          
          {/* Total Payouts */}
          <div className="mt-3 flex items-center justify-between border-t border-zinc-700 pt-3">
            <span className="text-sm text-zinc-400">Total Payouts ({totalPayout}%)</span>
            <span className="font-medium text-orange-400">${((totalPot * totalPayout) / 100).toLocaleString()}</span>
          </div>
          
          {/* Fundraiser Keeps */}
          <div className="mt-2 flex items-center justify-between rounded-lg bg-green-500/10 p-3">
            <span className="text-sm font-medium text-green-400">
              🎉 Fundraiser Keeps ({100 - totalPayout}%)
            </span>
            <span className="text-lg font-bold text-green-400">
              ${((totalPot * (100 - totalPayout)) / 100).toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

