'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, BarChart, Calculator, HeartPulse } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/food-doctor', label: 'Food Doctor', icon: HeartPulse },
  { href: '/calorie-tracker', label: 'Calorie Tracker', icon: Calculator },
  { href: '/analytics', label: 'Analytics', icon: BarChart },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 border-t bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around">
        {links.map((link) => (
          <Link
            href={link.href}
            key={link.href}
            className={cn(
              'flex flex-col items-center gap-1 rounded-md p-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
              pathname === link.href && 'text-primary'
            )}
          >
            <link.icon className="h-5 w-5" />
            <span>{link.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
