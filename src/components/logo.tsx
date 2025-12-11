import { cn } from '@/lib/utils';
import { HeartPulse } from 'lucide-react';

export function Logo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground',
        className
      )}
    >
      <HeartPulse className="h-6 w-6" />
    </div>
  );
}
