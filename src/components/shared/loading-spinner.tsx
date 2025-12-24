import { Loader2 } from 'lucide-react';

import { cn } from '@/utils/cn';

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-10 w-10',
} as const;

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
} as const;

interface LoadingSpinnerProps {
  size?: keyof typeof sizeClasses;
  text?: string;
  className?: string;
}

export function LoadingSpinner({ size = 'md', text, className }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <Loader2
        className={cn('animate-spin text-orange-500', sizeClasses[size])}
        aria-hidden="true"
      />
      {text && (
        <p className={cn('text-zinc-400', textSizeClasses[size])}>{text}</p>
      )}
    </div>
  );
}

