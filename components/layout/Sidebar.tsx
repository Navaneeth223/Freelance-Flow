'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Briefcase, Users, Clock, FileText, Receipt,
  FileCheck2, BarChart3, Settings, ChevronLeft, Zap, LogOut,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { useAuth } from '@/lib/auth-context';

const navItems = [
  { label: 'Overview',     href: '/dashboard',           icon: LayoutDashboard },
  { label: 'Projects',     href: '/dashboard/projects',  icon: Briefcase },
  { label: 'Clients',      href: '/dashboard/clients',   icon: Users },
  { label: 'Time Tracker', href: '/dashboard/time',      icon: Clock },
  { label: 'Invoices',     href: '/dashboard/invoices',  icon: FileText },
  { label: 'Expenses',     href: '/dashboard/expenses',  icon: Receipt },
  { label: 'Proposals',    href: '/dashboard/proposals', icon: FileCheck2 },
  { label: 'Reports',      href: '/dashboard/reports',   icon: BarChart3 },
  { label: 'Settings',     href: '/dashboard/settings',  icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useAppStore();
  const { user, logout } = useAuth();

  const collapsed = !sidebarOpen;

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className={cn(
          'fixed left-0 top-0 z-50 flex h-full flex-col border-r border-[var(--border-default)]',
          'bg-[var(--bg-surface)] overflow-hidden',
          'lg:relative lg:z-auto'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-[var(--border-subtle)]">
          <AnimatePresence mode="wait">
            {!collapsed ? (
              <motion.div
                key="full"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-primary)] shadow-[var(--shadow-glow)]">
                  <Zap className="h-4 w-4 text-white" fill="white" />
                </div>
                <span className="font-bold text-[var(--text-primary)] text-base tracking-tight">FreelanceFlow</span>
              </motion.div>
            ) : (
              <motion.div
                key="icon"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-primary)] shadow-[var(--shadow-glow)] mx-auto"
              >
                <Zap className="h-4 w-4 text-white" fill="white" />
              </motion.div>
            )}
          </AnimatePresence>

          {!collapsed && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-md hover:bg-[var(--bg-overlay)] text-[var(--text-muted)] transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group relative flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5',
                  'text-sm font-medium transition-all duration-150',
                  active
                    ? 'bg-[var(--accent-dim)] text-[var(--accent-secondary)] border border-[var(--border-accent)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)]',
                  collapsed && 'justify-center px-2'
                )}
                title={collapsed ? item.label : undefined}
              >
                {active && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r-full bg-[var(--accent-primary)]"
                  />
                )}
                <item.icon className={cn('h-[18px] w-[18px] shrink-0', active && 'text-[var(--accent-primary)]')} />
                {!collapsed && <span>{item.label}</span>}

                {/* Tooltip on collapsed */}
                {collapsed && (
                  <div className="absolute left-full ml-2 z-50 hidden group-hover:flex items-center">
                    <div className="whitespace-nowrap rounded-md bg-[var(--bg-elevated)] border border-[var(--border-default)] px-2.5 py-1.5 text-xs text-[var(--text-primary)] shadow-lg">
                      {item.label}
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User + collapse toggle */}
        <div className="border-t border-[var(--border-subtle)] p-3 space-y-1">
          {!collapsed && user && (
            <div className="flex items-center gap-3 rounded-[var(--radius-md)] px-2 py-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{user.name}</p>
                <p className="text-[10px] text-[var(--text-muted)] truncate">{user.email}</p>
              </div>
            </div>
          )}

          <button
            onClick={logout}
            className={cn(
              'flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2',
              'text-xs text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-400 transition-colors',
              collapsed && 'justify-center'
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Sign out</span>}
          </button>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={cn(
              'flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2',
              'text-xs text-[var(--text-muted)] hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)] transition-colors',
              collapsed && 'justify-center'
            )}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </motion.aside>
    </>
  );
}
