'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, BarChart, Calculator, HeartPulse } from 'lucide-react';
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';

const links = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/food-doctor', label: 'Food Doctor', icon: HeartPulse },
  { href: '/calorie-tracker', label: 'Calorie Tracker', icon: Calculator },
  { href: '/analytics', label: 'Analytics', icon: BarChart },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="text-xl font-semibold font-headline group-data-[collapsible=icon]:hidden">
            Nutrition Navigator
          </span>
        </div>
      </SidebarHeader>
      <SidebarMenu className="flex-1">
        {links.map((link) => (
          <SidebarMenuItem key={link.href}>
            <SidebarMenuButton
              asChild
              isActive={pathname === link.href}
              tooltip={link.label}
              className="justify-start"
            >
              <Link href={link.href}>
                <link.icon className="h-5 w-5" />
                <span>{link.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </div>
  );
}
