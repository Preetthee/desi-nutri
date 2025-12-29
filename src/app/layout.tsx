
import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { LanguageProvider } from '@/contexts/language-provider';
import { ProfileProvider } from '@/contexts/profile-provider';

export const metadata: Metadata = {
  title: 'দেশি নিউট্রি',
  description: 'পুষ্টি এবং ক্যালোরি ট্র্যাকিংয়ের জন্য আপনার স্মার্ট গাইড।',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;700&family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('font-body antialiased')}>
        <LanguageProvider>
          <ProfileProvider>
            <SidebarProvider>
              <div className="relative flex h-screen w-full flex-col md:flex-row">
                <AppSidebar />
                <main className="flex-1 overflow-y-auto pb-16 md:pb-0">{children}</main>
              </div>
            </SidebarProvider>
          </ProfileProvider>
        </LanguageProvider>
        <Toaster />
      </body>
    </html>
  );
}
