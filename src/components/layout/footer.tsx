'use client';

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  const authRoutes = ['/', '/login', '/signup', '/forgot-password'];
  if (authRoutes.includes(pathname)) return null;


  return (
    <footer className="border-t bg-background">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/images/logo.png" alt="UniVault Logo" width={24} height={24} />
            <span className="font-bold sm:inline-block font-poppins">
              UniVault
            </span>
          </Link>
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {new Date().getFullYear()} UniVault. All rights reserved.
          </p>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/about" className="text-sm text-muted-foreground hover:text-primary">About</Link>
          <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">Contact</Link>
          <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">Privacy</Link>
          <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">Terms</Link>
        </nav>
      </div>
    </footer>
  );
}
