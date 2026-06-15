'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { GlowCard } from '@/components/ui/GlowCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { CurrencyDisplay } from '@/components/ui/CurrencyDisplay';
import { formatDate } from '@/lib/utils';
import { Briefcase, Plus, Search, LayoutGrid, List, Calendar, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface Project {
  _id: string;
  name: string;
  clientName: string;
  status: string;
  completionPercentage: number;
  budget: number;
  currency: string;
  deadline?: string;
  description?: string;
  tags: string[];
}

function NewProjectModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ name: '', clientName: '', budget: '', currency: 'INR', deadline: '', description: '' });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/projects', { ...form, budget: Number(form.budget) });
      toast.success('Project created successfully!');
      onCreated();
      onClose();
    } catch {
      toast.error('Failed to create project');
    } finally {
      setLoading(false);
    }
  }

  const inputCls = 'w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-colors';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-lg rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-elevated)]"
      >
        <h2 className="mb-5 text-lg font-bold text-[var(--text-primary)]">New Project</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Project Name *</label>
              <input className={inputCls} required placeholder="Website Redesign" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Client Name *</label>
              <input className={inputCls} required placeholder="Acme Corp" value={form.clientName} onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Budget</label>
              <input className={inputCls} type="number" placeholder="50000" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Currency</label>
              <select className={inputCls} value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Deadline</label>
              <input className={inputCls} type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Description</label>
              <textarea className={`${inputCls} h-20 resize-none`} placeholder="Brief project overview..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" loading={loading} className="flex-1">Create Project</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function ProjectsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading } = useQuery<{ data: Project[] }>({
    queryKey: ['projects'],
    queryFn: () => api.get('/projects').then(r => r.data),
  });

  const projects = (data?.data ?? []).filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.clientName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {showModal && (
        <NewProjectModal onClose={() => setShowModal(false)} onCreated={() => qc.invalidateQueries({ queryKey: ['projects'] })} />
      )}

      <PageHeader title="Projects" description={`${projects.length} project${projects.length !== 1 ? 's' : ''}`}>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] pl-9 pr-4 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-primary)]"
            placeholder="Search projects…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1 rounded-[var(--radius-md)] border border-[var(--border-default)] p-1">
          <button onClick={() => setView('grid')} className={`rounded-md p-1.5 transition-colors ${view === 'grid' ? 'bg-[var(--accent-dim)] text-[var(--accent-secondary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button onClick={() => setView('list')} className={`rounded-md p-1.5 transition-colors ${view === 'list' ? 'bg-[var(--accent-dim)] text-[var(--accent-secondary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className={`grid gap-4 ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 rounded-[var(--radius-lg)] bg-[var(--bg-surface)] animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No projects yet"
          description="Create your first project to start tracking progress, time, and billing."
          action={<Button onClick={() => setShowModal(true)}><Plus className="h-4 w-4" />Create Project</Button>}
        />
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => (
            <motion.div
              key={p._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <GlowCard className="p-5 h-full" hover>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-dim)] border border-[var(--border-accent)]">
                    <Briefcase className="h-4 w-4 text-[var(--accent-secondary)]" />
                  </div>
                  <StatusBadge status={p.status} />
                </div>
                <h3 className="font-semibold text-[var(--text-primary)] mb-0.5 truncate">{p.name}</h3>
                <p className="text-xs text-[var(--text-muted)] mb-3">{p.clientName}</p>

                {/* Progress */}
                <div className="space-y-1 mb-3">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-[var(--text-muted)]">Progress</span>
                    <span className="text-[var(--text-secondary)]">{p.completionPercentage}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[var(--border-default)]">
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-purple-500 transition-all"
                      style={{ width: `${p.completionPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                  {p.budget > 0 && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      <CurrencyDisplay amount={p.budget} currency={p.currency} size="sm" muted />
                    </div>
                  )}
                  {p.deadline && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(p.deadline)}
                    </div>
                  )}
                </div>
              </GlowCard>
            </motion.div>
          ))}
        </div>
      ) : (
        <GlowCard>
          <div className="divide-y divide-[var(--border-subtle)]">
            {projects.map((p, i) => (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--bg-overlay)] transition-colors"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-dim)] border border-[var(--border-accent)] shrink-0">
                  <Briefcase className="h-4 w-4 text-[var(--accent-secondary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-[var(--text-primary)] truncate">{p.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{p.clientName}</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 w-32">
                  <div className="flex-1 h-1 rounded-full bg-[var(--border-default)]">
                    <div className="h-1 rounded-full bg-[var(--accent-primary)]" style={{ width: `${p.completionPercentage}%` }} />
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)]">{p.completionPercentage}%</span>
                </div>
                {p.deadline && <span className="hidden md:block text-xs text-[var(--text-muted)]">{formatDate(p.deadline)}</span>}
                <StatusBadge status={p.status} />
              </motion.div>
            ))}
          </div>
        </GlowCard>
      )}
    </div>
  );
}
