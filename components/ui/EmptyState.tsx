'use client';

import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn('flex flex-col items-center justify-center py-20 px-6 text-center', className)}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent-dim)] border border-[var(--border-accent)]">
        <Icon className="h-7 w-7 text-[var(--accent-secondary)]" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-[var(--text-secondary)] leading-relaxed">{description}</p>
      {action && <div>{action}</div>}
    </motion.div>
  );
}
