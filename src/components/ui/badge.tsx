import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-zinc-700 text-zinc-200',
        secondary: 'border-transparent bg-zinc-800 text-zinc-300',
        destructive: 'border-transparent bg-red-500/20 text-red-400',
        outline: 'border-zinc-700 text-zinc-300',
        // Contest status variants
        draft: 'border-transparent bg-zinc-600/50 text-zinc-300',
        open: 'border-transparent bg-green-500/20 text-green-400',
        locked: 'border-transparent bg-yellow-500/20 text-yellow-400',
        in_progress: 'border-transparent bg-orange-500/20 text-orange-400',
        completed: 'border-transparent bg-blue-500/20 text-blue-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

