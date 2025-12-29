
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, BarChart, Calculator, HeartPulse, Settings, Dumbbell, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Logo } from './logo';
import { useSidebar } from '@/components/ui/sidebar';
import { useTranslation } from '@/contexts/language-provider';
import { LanguageToggle } from './language-toggle';


export function AppSidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { state } = useSidebar();

  const links = [
    { href: '/', label: t('sidebar.home'), icon: Home },
    { href: '/food-doctor', label: t('sidebar.food_doctor'), icon: HeartPulse },
    { href: '/calorie-tracker', label: t('sidebar.calorie_tracker'), icon: Calculator },
    { href: '/analytics', label: t('sidebar.analytics'), icon: BarChart },
    { href: '/exercise', label: t('sidebar.exercise'), icon: Dumbbell },
    { href: '/profiles', label: t('sidebar.profiles'), icon: Users },
    { href: '/settings', label: t('sidebar.settings'), icon: Settings },
  ];

  function MobileNav() {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-10 border-t bg-background/95 backdrop-blur-sm md:hidden">
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

  function DesktopSidebar() {
    return (
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <Logo className="mb-2" />
          <SidebarTrigger />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {links.map((link) => (
              <SidebarMenuItem key={link.href}>
                <Link href={link.href} className="w-full">
                  <SidebarMenuButton
                    isActive={
                      pathname === link.href ||
                      (link.href !== '/' && pathname.startsWith(link.href))
                    }
                    tooltip={{
                      children: link.label,
                    }}
                  >
                    <link.icon
                      className={cn(
                        'h-5 w-5',
                        state === 'collapsed' && 'h-6 w-6'
                      )}
                    />
                    <span>{link.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className={cn("flex justify-center", state === 'collapsed' ? 'my-2' : '')}>
            <LanguageToggle />
          </div>
        </SidebarFooter>
      </Sidebar>
    );
  }

  return (
    <>
      <DesktopSidebar />
      <MobileNav />
    </>
  );
}
