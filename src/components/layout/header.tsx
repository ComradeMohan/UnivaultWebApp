'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Menu, Bell, User as UserIcon, KeyRound } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSession } from '@/context/SessionContext';
import { ThemeToggle } from './theme-toggle';

const navLinks = [
  { href: '/courses', label: 'Courses' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/grades', label: 'Grades' },
  { href: '/tests', label: 'Tests' },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useSession();
  const [open, setOpen] = useState(false);

  const authRoutes = ['/', '/login', '/signup', '/forgot-password'];
  if (authRoutes.includes(pathname)) return null;



  const handleLogout = () => {
    logout();
    router.push('/login');
  };
  
  const renderNavLinks = (isMobile: boolean) =>
    navLinks.map((link) => (
      <Link
        key={link.href}
        href={link.href}
        onClick={() => {
          if (isMobile) {
            setOpen(false);
          }
        }}
        className={cn(
          isMobile 
            ? 'block py-3 text-lg px-4 rounded-xl text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all duration-200' 
            : 'text-xs md:text-sm font-medium transition-all duration-300 rounded-full px-4 py-1.5 relative border border-transparent',
          !isMobile && (pathname === link.href 
            ? 'text-primary dark:text-white bg-slate-900/[0.04] dark:bg-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] border-slate-200/50 dark:border-white/5 font-semibold text-shadow-[0_0_10px_rgba(0,188,211,0.2)]' 
            : 'text-muted-foreground hover:text-slate-900 dark:hover:text-white hover:bg-slate-950/[0.02] dark:hover:bg-white/5'),
          isMobile && pathname === link.href && 'text-primary bg-primary/10 font-semibold'
        )}
      >
        {link.label}
      </Link>
    ));

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300 px-4 md:px-6 py-4 bg-transparent pointer-events-none">
      <div className="mx-auto max-w-7xl w-full rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/75 dark:bg-[#091328]/75 backdrop-blur-xl shadow-lg px-6 h-14 flex items-center justify-between transition-all duration-300 pointer-events-auto hover:border-slate-300/80 dark:hover:border-white/20 dark:hover:shadow-[0_8px_30px_rgb(0,188,211,0.08)] relative">
        <div className="absolute inset-x-1/4 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        
        {/* Left Side: Logo & Navigation */}
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/images/logo.png" alt="UniVault Logo" width={28} height={28} />
            <span className="hidden font-bold sm:inline-block font-poppins text-base bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              UniVault
            </span>
          </Link>
          <nav className="hidden md:flex items-center space-x-1 text-sm font-medium">
            {user && renderNavLinks(false)}
          </nav>
        </div>

        {/* Right Side: ThemeToggle, Notifications, User Profile & Mobile Menu */}
        <div className="flex items-center space-x-2 pointer-events-auto">
          <ThemeToggle />
          
          {user ? (
            <>
              <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                <Link href="/notifications">
                  <Bell className="h-4 w-4" />
                  <span className="sr-only">Notifications</span>
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                    <Avatar className="h-9 w-9 border border-slate-200 dark:border-white/10 hover:border-primary transition-colors">
                      <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${user.full_name}`} alt={user.full_name} />
                      <AvatarFallback>{user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mt-2" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.full_name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/profile')} className="cursor-pointer">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/profile/change-password')} className="cursor-pointer">
                    <KeyRound className="mr-2 h-4 w-4" />
                    <span>Change Password</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/20">
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Button asChild variant="ghost" size="sm" className="rounded-full">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild size="sm" className="rounded-full bg-gradient-to-r from-[#6ab2ff] to-[#00bcd3] text-white border-0 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu Trigger at the far right */}
          <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 hover:bg-slate-100 dark:hover:bg-white/10">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-background/95 backdrop-blur-xl border-r border-border/40">
                <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                <SheetDescription className="sr-only">Mobile navigation drawer for UniVault platform.</SheetDescription>
                <div className="p-4">
                  <Link href="/" onClick={() => setOpen(false)} className="mb-8 flex items-center space-x-2">
                    <Image src="/images/logo.png" alt="UniVault Logo" width={32} height={32} />
                    <span className="font-bold font-poppins text-lg bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">UniVault</span>
                  </Link>
                  <nav className="flex flex-col space-y-3">
                    {user ? renderNavLinks(true) : (
                      <>
                        <Link href="/login" onClick={() => setOpen(false)} className="text-lg font-medium px-4 py-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl block">Login</Link>
                        <Link href="/signup" onClick={() => setOpen(false)} className="text-lg font-medium px-4 py-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl block">Sign Up</Link>
                      </>
                    )}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
