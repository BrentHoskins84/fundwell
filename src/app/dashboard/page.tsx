import Link from 'next/link';
import { IoAddCircleOutline } from 'react-icons/io5';

import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-white lg:text-3xl">My Contests</h1>
        <Button variant="orange" asChild>
          <Link href="/dashboard/new">
            <IoAddCircleOutline className="mr-2 h-5 w-5" />
            Create Contest
          </Link>
        </Button>
      </div>
      <div className="rounded-lg border border-zinc-800 bg-zinc-800/50 p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-700/50">
          <IoAddCircleOutline className="h-8 w-8 text-zinc-400" />
        </div>
        <p className="text-zinc-400">You haven&apos;t created any contests yet.</p>
        <p className="mt-2 text-sm text-zinc-500">
          Create your first game day squares contest to get started!
        </p>
        <Button variant="orange" asChild className="mt-6">
          <Link href="/dashboard/new">Create Your First Contest</Link>
        </Button>
      </div>
    </div>
  );
}

