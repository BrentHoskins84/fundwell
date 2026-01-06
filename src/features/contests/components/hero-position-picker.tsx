'use client';

import { cn } from '@/utils/cn';

const POSITIONS = [
  ['top-left', 'top-center', 'top-right'],
  ['center-left', 'center', 'center-right'],
  ['bottom-left', 'bottom-center', 'bottom-right'],
] as const;

export type HeroImagePosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

interface HeroPositionPickerProps {
  value: HeroImagePosition;
  onChange: (position: HeroImagePosition) => void;
  disabled?: boolean;
}

const positionLabels: Record<HeroImagePosition, string> = {
  'top-left': 'Top Left',
  'top-center': 'Top Center',
  'top-right': 'Top Right',
  'center-left': 'Center Left',
  'center': 'Center',
  'center-right': 'Center Right',
  'bottom-left': 'Bottom Left',
  'bottom-center': 'Bottom Center',
  'bottom-right': 'Bottom Right',
};

export function HeroPositionPicker({ value, onChange, disabled }: HeroPositionPickerProps) {
  return (
    <div
      className={cn(
        'relative grid h-32 w-32 grid-cols-3 place-items-center gap-3 rounded-lg border border-zinc-700 bg-zinc-800/50 p-4',
        disabled && 'opacity-50'
      )}
      role="radiogroup"
      aria-label="Hero image position"
    >
      {POSITIONS.map((row, rowIndex) =>
        row.map((position) => {
          const isSelected = value === position;
          return (
            <button
              key={position}
              type="button"
              onClick={() => !disabled && onChange(position)}
              disabled={disabled}
              aria-label={positionLabels[position]}
              aria-checked={isSelected}
              role="radio"
              className={cn(
                'flex items-center justify-center rounded-full transition-all',
                'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-zinc-800',
                !disabled && 'cursor-pointer hover:scale-110',
                isSelected
                  ? 'h-3.5 w-3.5 bg-orange-500 ring-2 ring-orange-500 ring-offset-1 ring-offset-zinc-800'
                  : 'h-2 w-2 bg-zinc-500 hover:bg-zinc-400'
              )}
            />
          );
        })
      )}
    </div>
  );
}

