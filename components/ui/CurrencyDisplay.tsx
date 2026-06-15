'use client';

import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface CurrencyDisplayProps {
  amount: number;
  currency?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  muted?: boolean;
}

const sizeMap = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl font-semibold',
  xl: 'text-3xl font-bold tracking-tight',
};

export function CurrencyDisplay({
  amount,
  currency = 'INR',
  className,
  size = 'md',
  muted = false,
}: CurrencyDisplayProps) {
  return (
    <span
      className={cn(
        sizeMap[size],
        muted ? 'text-[var(--text-secondary)]' : 'text-[var(--text-primary)]',
        className
      )}
    >
      {formatCurrency(amount, currency)}
    </span>
  );
}
