import { redirect } from 'next/navigation';

import { getSession } from '@/features/account/controllers/get-session';

import { DashboardShell } from './dashboard-shell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const userEmail = session.user.email ?? 'User';

  return <DashboardShell userEmail={userEmail}>{children}</DashboardShell>;
}

