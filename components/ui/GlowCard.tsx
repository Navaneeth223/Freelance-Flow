'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

export function GlowCard({ children, className, hover = false, glow = false }: GlowCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      whileHover={hover ? { y: -2, scale: 1.005 } : undefined}
      className={cn(
        'rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)]',
        'shadow-[var(--shadow-card)]',
        hover && 'cursor-pointer transition-shadow hover:shadow-[var(--shadow-elevated)] hover:border-[var(--border-accent)]',
        glow && 'shadow-[var(--shadow-glow)]',
        className
      )}
    >
      {children}
    </motion.div>
  );
}
