'use client';

import { cn } from '@/lib/utils';

type StatusVariant = 'active' | 'completed' | 'draft' | 'overdue' | 'pending' | 'sent' | 'paid' | 'cancelled' | 'on-hold';

const variantMap: Record<StatusVariant, { label: string; bg: string; text: string; dot: string }> = {
  active:    { label: 'Active',    bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  completed: { label: 'Completed', bg: 'bg-blue-500/10',    text: 'text-blue-400',   dot: 'bg-blue-400' },
  draft:     { label: 'Draft',     bg: 'bg-zinc-500/10',    text: 'text-zinc-400',   dot: 'bg-zinc-400' },
  overdue:   { label: 'Overdue',   bg: 'bg-red-500/10',     text: 'text-red-400',    dot: 'bg-red-400' },
  pending:   { label: 'Pending',   bg: 'bg-amber-500/10',   text: 'text-amber-400',  dot: 'bg-amber-400' },
  sent:      { label: 'Sent',      bg: 'bg-purple-500/10',  text: 'text-purple-400', dot: 'bg-purple-400' },
  paid:      { label: 'Paid',      bg: 'bg-emerald-500/10', text: 'text-emerald-400',dot: 'bg-emerald-400' },
  cancelled: { label: 'Cancelled', bg: 'bg-red-500/10',     text: 'text-red-400',    dot: 'bg-red-400' },
  'on-hold': { label: 'On Hold',   bg: 'bg-orange-500/10',  text: 'text-orange-400', dot: 'bg-orange-400' },
};

interface StatusBadgeProps {
  status: StatusVariant | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = variantMap[status as StatusVariant] ?? {
    label: status,
    bg: 'bg-zinc-500/10',
    text: 'text-zinc-400',
    dot: 'bg-zinc-400',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        variant.bg,
        variant.text,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', variant.dot)} />
      {variant.label}
    </span>
  );
}
