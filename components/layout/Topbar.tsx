'use client';

import { useAuth } from '@/lib/auth-context';
import { useAppStore } from '@/store/useAppStore';
import { useTimerStore } from '@/store/useTimerStore';
import { Menu, Bell, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function Topbar() {
  const { user } = useAuth();
  const { setSidebarOpen, sidebarOpen } = useAppStore();
  const { isRunning, seconds, tick, projectName } = useTimerStore();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting('Good morning');
    else if (h < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => tick(), 1000);
    return () => clearInterval(interval);
  }, [isRunning, tick]);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-base)]/80 px-4 backdrop-blur-md lg:px-6">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-md p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)] transition-colors lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        {user && (
          <p className="hidden sm:block text-sm text-[var(--text-secondary)]">
            {greeting},{' '}
            <span className="font-semibold text-[var(--text-primary)]">
              {user.name.split(' ')[0]}
            </span>
          </p>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Live timer badge */}
        {isRunning && (
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-[var(--border-accent)] bg-[var(--accent-dim)] px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <Timer className="h-3.5 w-3.5 text-[var(--accent-secondary)]" />
            <span className="text-xs font-mono font-semibold text-[var(--accent-secondary)]">
              {formatTime(seconds)}
            </span>
            {projectName && (
              <span className="text-xs text-[var(--text-muted)] max-w-[100px] truncate">
                {projectName}
              </span>
            )}
          </div>
        )}

        <button className={cn(
          'relative rounded-md p-2 text-[var(--text-muted)] hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)] transition-colors'
        )}>
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[var(--accent-primary)]" />
        </button>

        {user && (
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-purple-500 flex items-center justify-center text-white text-xs font-bold cursor-pointer">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </header>
  );
}
