'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Unlock } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

import { updateContestStatus } from '../actions';

interface UnlockContestButtonProps {
  contestId: string;
}

export function UnlockContestButton({ contestId }: UnlockContestButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  async function handleUnlock() {
    setIsLoading(true);
    try {
      const result = await updateContestStatus(contestId, 'open');

      if (!result || result.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result?.error?.message ?? 'Failed to unlock contest',
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Contest unlocked successfully',
      });
      setOpen(false);
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline">
          <Unlock className="mr-2 h-4 w-4" />
          Unlock Contest
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Unlock Contest?</AlertDialogTitle>
          <AlertDialogDescription>
            This will allow new participants to claim squares. Are you sure?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleUnlock} disabled={isLoading}>
            {isLoading ? 'Unlocking...' : 'Confirm'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

