'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TrendingUp, BarChart3, Users, Grid3X3, Play, Swords, FileText, BookOpen, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Leaderboard', href: '/', icon: TrendingUp },
  { name: 'Players', href: '/players', icon: Users },
  { name: 'Stocks', href: '/stocks', icon: Grid3X3 },
  { name: 'Race', href: '/race', icon: Play },
  { name: 'Compare', href: '/compare', icon: Swords },
  { name: 'Draft', href: '/draft', icon: FileText },
  { name: 'Rules', href: '/rules', icon: BookOpen },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-1.5 sm:gap-2">
          <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          <div className="flex flex-col">
            <span className="font-bold text-sm sm:text-lg leading-tight">All-In Stock Pool</span>
            <span className="text-xs text-muted-foreground">2026</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Mobile hamburger menu button */}
        <button
          type="button"
          className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-t bg-background/95 backdrop-blur">
          <div className="container px-4 py-2 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
