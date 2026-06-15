'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { useTimerStore } from '@/store/useTimerStore';
import { GlowCard } from '@/components/ui/GlowCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/utils';
import { Clock, Play, Square, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface TimeEntry {
  _id: string;
  description: string;
  projectId: { _id: string; name: string };
  startTime: string;
  endTime?: string;
  durationMinutes: number;
  isBillable: boolean;
  hourlyRate: number;
}

interface Project { _id: string; name: string; clientName: string; }

function formatSeconds(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function formatMinutes(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m > 0 ? `${m}m` : ''}`;
}

export default function TimePage() {
  const qc = useQueryClient();
  const timer = useTimerStore();
  const [description, setDescription] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [isBillable, setIsBillable] = useState(true);

  const { data: projectsData } = useQuery<{ data: Project[] }>({
    queryKey: ['projects'],
    queryFn: () => api.get('/projects').then(r => r.data),
  });

  const { data: entriesData, isLoading } = useQuery<{ data: TimeEntry[] }>({
    queryKey: ['time-entries'],
    queryFn: () => api.get('/time-entries').then(r => r.data),
  });

  useEffect(() => {
    if (!timer.isRunning) return;
    const id = setInterval(() => timer.tick(), 1000);
    return () => clearInterval(id);
  }, [timer.isRunning, timer.tick]);

  const projects = projectsData?.data ?? [];
  const entries = entriesData?.data ?? [];

  async function handleStart() {
    if (!description.trim()) { toast.error('Please enter a description'); return; }
    const project = projects.find(p => p._id === selectedProject);
    const startTime = new Date().toISOString();

    try {
      const res = await api.post('/time-entries/start', {
        description,
        projectId: selectedProject || undefined,
        isBillable,
        startTime,
      });
      timer.startTimer(
        selectedProject,
        project?.name ?? '',
        project?.clientName ?? '',
        description,
        isBillable,
        startTime,
        res.data.data._id
      );
      toast.success('Timer started!');
    } catch {
      toast.error('Failed to start timer');
    }
  }

  async function handleStop() {
    try {
      await api.patch(`/time-entries/${timer.activeTimerId}/stop`, { endTime: new Date().toISOString() });
      timer.stopTimer();
      qc.invalidateQueries({ queryKey: ['time-entries'] });
      toast.success('Time logged!');
    } catch {
      toast.error('Failed to stop timer');
    }
  }

  const totalToday = entries
    .filter(e => e.startTime && new Date(e.startTime).toDateString() === new Date().toDateString())
    .reduce((sum, e) => sum + e.durationMinutes, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Time Tracker" description="Track your billable hours in real time." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Active Timer */}
        <div className="lg:col-span-2">
          <GlowCard className="p-6" glow={timer.isRunning}>
            <div className="text-center mb-6">
              <div className={`text-6xl font-mono font-bold tracking-widest transition-colors ${timer.isRunning ? 'text-[var(--accent-secondary)]' : 'text-[var(--text-primary)]'}`}>
                {formatSeconds(timer.seconds)}
              </div>
              {timer.isRunning && timer.projectName && (
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  Tracking: <span className="text-[var(--text-secondary)]">{timer.projectName}</span>
                </p>
              )}
            </div>

            <div className="space-y-3 mb-5">
              <input
                className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-colors"
                placeholder="What are you working on?"
                value={timer.isRunning ? timer.description : description}
                disabled={timer.isRunning}
                onChange={e => setDescription(e.target.value)}
              />
              <div className="flex gap-3">
                <select
                  className="flex-1 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)] transition-colors"
                  value={selectedProject}
                  disabled={timer.isRunning}
                  onChange={e => setSelectedProject(e.target.value)}
                >
                  <option value="">No project</option>
                  {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
                <button
                  onClick={() => setIsBillable(!isBillable)}
                  disabled={timer.isRunning}
                  className={`flex items-center gap-2 rounded-[var(--radius-md)] border px-3 py-2.5 text-sm transition-colors ${isBillable ? 'border-[var(--border-accent)] bg-[var(--accent-dim)] text-[var(--accent-secondary)]' : 'border-[var(--border-default)] text-[var(--text-muted)]'}`}
                >
                  <DollarSign className="h-4 w-4" />
                  {isBillable ? 'Billable' : 'Non-billable'}
                </button>
              </div>
            </div>

            {timer.isRunning ? (
              <Button variant="danger" className="w-full" size="lg" onClick={handleStop}>
                <Square className="h-4 w-4" fill="currentColor" />
                Stop Timer
              </Button>
            ) : (
              <Button className="w-full" size="lg" onClick={handleStart}>
                <Play className="h-4 w-4" fill="white" />
                Start Timer
              </Button>
            )}
          </GlowCard>
        </div>

        {/* Stats */}
        <div className="space-y-4">
          <GlowCard className="p-5">
            <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">Today</p>
            <p className="text-3xl font-bold text-[var(--text-primary)]">{formatMinutes(totalToday)}</p>
          </GlowCard>
          <GlowCard className="p-5">
            <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">This Week</p>
            <p className="text-3xl font-bold text-[var(--text-primary)]">
              {formatMinutes(entries.filter(e => {
                const d = new Date(e.startTime);
                const now = new Date();
                const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
                return d >= weekStart;
              }).reduce((sum, e) => sum + e.durationMinutes, 0))}
            </p>
          </GlowCard>
        </div>
      </div>

      {/* Recent Entries */}
      <div>
        <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Recent Time Entries</h2>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => <div key={i} className="h-14 rounded-lg bg-[var(--bg-surface)] animate-pulse" />)}
          </div>
        ) : entries.length === 0 ? (
          <EmptyState icon={Clock} title="No time entries yet" description="Start the timer above to begin tracking your first entry." />
        ) : (
          <GlowCard>
            <div className="divide-y divide-[var(--border-subtle)]">
              {entries.slice(0, 20).map((entry, i) => (
                <motion.div
                  key={entry._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-[var(--bg-overlay)] transition-colors"
                >
                  <div className={`h-2 w-2 rounded-full shrink-0 ${entry.isBillable ? 'bg-emerald-400' : 'bg-[var(--text-muted)]'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{entry.description || 'No description'}</p>
                    <p className="text-xs text-[var(--text-muted)]">{entry.projectId?.name ?? 'No project'} · {formatDate(entry.startTime)}</p>
                  </div>
                  <span className="text-sm font-mono font-semibold text-[var(--text-secondary)] shrink-0">
                    {formatMinutes(entry.durationMinutes)}
                  </span>
                </motion.div>
              ))}
            </div>
          </GlowCard>
        )}
      </div>
    </div>
  );
}
