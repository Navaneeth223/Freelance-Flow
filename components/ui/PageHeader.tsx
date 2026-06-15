'use client';

import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">{title}</h1>
        {description && (
          <p className="mt-0.5 text-sm text-[var(--text-secondary)]">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-3 mt-3 sm:mt-0">{children}</div>
      )}
    </div>
  );
}
