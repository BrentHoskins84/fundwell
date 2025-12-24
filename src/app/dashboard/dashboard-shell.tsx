'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { IoCardOutline, IoGridOutline, IoLogOutOutline, IoMenuOutline, IoPersonOutline } from 'react-icons/io5';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/components/ui/use-toast';
import { signOut } from '@/features/auth/auth-actions';
import { cn } from '@/utils/cn';

const navItems = [
  { href: '/dashboard', label: 'My Contests', icon: IoGridOutline },
  { href: '/dashboard/account', label: 'Account', icon: IoPersonOutline },
  { href: '/dashboard/billing', label: 'Billing', icon: IoCardOutline },
];

interface DashboardShellProps {
  children: React.ReactNode;
  userEmail: string;
}

export function DashboardShell({ children, userEmail }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  async function handleLogout() {
    const response = await signOut();

    if (response?.error) {
      toast({
        variant: 'destructive',
        description: 'An error occurred while logging out. Please try again.',
      });
    } else {
      router.push('/');
      router.refresh();
      toast({
        description: 'You have been logged out.',
      });
    }
  }

  return (
    <div className='flex min-h-screen flex-col bg-zinc-900'>
      <div className='flex flex-1'>
        {/* Desktop Sidebar */}
        <aside className='sticky top-0 hidden h-screen w-64 flex-shrink-0 border-r border-zinc-800 bg-zinc-950 lg:block'>
          <div className='flex h-full flex-col'>
            {/* Logo */}
            <div className='flex h-16 items-center border-b border-zinc-800 px-6'>
              <Link href='/dashboard' className='flex items-center gap-2'>
                <Image src='/logo.png' width={32} height={32} priority quality={100} alt='Griddo logo' />
                <span className='font-alt text-xl font-semibold text-white'>Griddo</span>
              </Link>
            </div>

            {/* Navigation */}
            <nav className='flex-1 space-y-1 px-3 py-4'>
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-orange-500/10 text-orange-500'
                        : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                    )}
                  >
                    <item.icon className='h-5 w-5' />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Sidebar Footer */}
            <div className='border-t border-zinc-800 p-4'>
              <button
                onClick={handleLogout}
                className='flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white'
              >
                <IoLogOutOutline className='h-5 w-5' />
                Log out
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className='flex flex-1 flex-col overflow-y-auto'>
          {/* Header */}
          <header className='sticky top-0 z-40 flex h-16 flex-shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/60 lg:px-6'>
            {/* Mobile Menu Button */}
            <div className='flex items-center gap-4 lg:hidden'>
              <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                <SheetTrigger asChild>
                  <button className='rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white'>
                    <IoMenuOutline className='h-6 w-6' />
                    <span className='sr-only'>Open menu</span>
                  </button>
                </SheetTrigger>
                <SheetContent side='left' className='w-72 border-zinc-800 bg-zinc-950 p-0'>
                  <SheetHeader className='border-b border-zinc-800 px-6 py-4'>
                    <SheetTitle className='flex items-center gap-2'>
                      <Image src='/logo.png' width={32} height={32} priority quality={100} alt='Griddo logo' />
                      <span className='font-alt text-xl font-semibold text-white'>Griddo</span>
                    </SheetTitle>
                  </SheetHeader>
                  <nav className='flex-1 space-y-1 px-3 py-4'>
                    {navItems.map((item) => {
                      const isActive =
                        pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileNavOpen(false)}
                          className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                            isActive
                              ? 'bg-orange-500/10 text-orange-500'
                              : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                          )}
                        >
                          <item.icon className='h-5 w-5' />
                          {item.label}
                        </Link>
                      );
                    })}
                  </nav>
                  <div className='border-t border-zinc-800 p-4'>
                    <button
                      onClick={() => {
                        setMobileNavOpen(false);
                        handleLogout();
                      }}
                      className='flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white'
                    >
                      <IoLogOutOutline className='h-5 w-5' />
                      Log out
                    </button>
                  </div>
                </SheetContent>
              </Sheet>
              <Link href='/dashboard' className='flex items-center gap-2'>
                <Image src='/logo.png' width={28} height={28} priority quality={100} alt='Griddo logo' />
                <span className='font-alt text-lg font-semibold text-white'>Griddo</span>
              </Link>
            </div>

            {/* Desktop: Empty space or breadcrumbs */}
            <div className='hidden lg:block' />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className='flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/20 text-orange-500'>
                    <span className='text-sm font-medium uppercase'>{userEmail.charAt(0)}</span>
                  </div>
                  <span className='hidden max-w-[150px] truncate md:inline'>{userEmail}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-56 border-zinc-700 bg-zinc-800'>
                <DropdownMenuLabel className='text-zinc-400'>
                  <span className='block truncate text-sm font-normal'>{userEmail}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className='bg-zinc-700' />
                <DropdownMenuItem asChild className='cursor-pointer text-zinc-300 focus:bg-zinc-700 focus:text-white'>
                  <Link href='/dashboard/account'>Account</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className='cursor-pointer text-zinc-300 focus:bg-zinc-700 focus:text-white'>
                  <Link href='/dashboard/billing'>Billing</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className='bg-zinc-700' />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className='cursor-pointer text-zinc-300 focus:bg-zinc-700 focus:text-white'
                >
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          {/* Page Content */}
          <main className='flex-1 p-4 lg:p-6'>{children}</main>
        </div>
      </div>
    </div>
  );
}
