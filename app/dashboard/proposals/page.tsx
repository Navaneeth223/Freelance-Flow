'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { GlowCard } from '@/components/ui/GlowCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { CurrencyDisplay } from '@/components/ui/CurrencyDisplay';
import { formatDate } from '@/lib/utils';
import { FileCheck2, Plus, Search, Send, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface Proposal {
  _id: string;
  title: string;
  clientName: string;
  status: string;
  totalAmount: number;
  currency: string;
  validUntil?: string;
  createdAt: string;
}

function NewProposalModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ title: '', clientName: '', totalAmount: '', currency: 'INR', validUntil: '', summary: '' });
  const [loading, setLoading] = useState(false);

  const inputCls = 'w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-colors';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/proposals', { ...form, totalAmount: Number(form.totalAmount) });
      toast.success('Proposal created!');
      onCreated();
      onClose();
    } catch {
      toast.error('Failed to create proposal');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-elevated)]"
      >
        <h2 className="mb-5 text-lg font-bold text-[var(--text-primary)]">New Proposal</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--text-secondary)]">Title *</label>
            <input className={inputCls} required placeholder="Website Redesign Proposal" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--text-secondary)]">Client *</label>
            <input className={inputCls} required placeholder="Acme Corp" value={form.clientName} onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Value</label>
              <input className={inputCls} type="number" min="0" placeholder="150000" value={form.totalAmount} onChange={e => setForm(f => ({ ...f, totalAmount: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Valid Until</label>
              <input className={inputCls} type="date" value={form.validUntil} onChange={e => setForm(f => ({ ...f, validUntil: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--text-secondary)]">Summary</label>
            <textarea className={`${inputCls} h-20 resize-none`} placeholder="Brief description of the proposal scope..." value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" loading={loading} className="flex-1">Create Proposal</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function ProposalsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading } = useQuery<{ data: Proposal[] }>({
    queryKey: ['proposals'],
    queryFn: () => api.get('/proposals').then(r => r.data),
  });

  const proposals = (data?.data ?? []).filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.clientName.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    sent: proposals.filter(p => p.status === 'sent').length,
    accepted: proposals.filter(p => p.status === 'accepted').length,
    totalValue: proposals.filter(p => p.status === 'accepted').reduce((s, p) => s + p.totalAmount, 0),
  };

  return (
    <div className="space-y-6">
      {showModal && (
        <NewProposalModal onClose={() => setShowModal(false)} onCreated={() => qc.invalidateQueries({ queryKey: ['proposals'] })} />
      )}

      <PageHeader title="Proposals" description="Win more clients with beautiful proposals.">
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" />
          New Proposal
        </Button>
      </PageHeader>

      <div className="grid grid-cols-3 gap-4">
        <GlowCard className="p-4">
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">Sent</p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">{stats.sent}</p>
        </GlowCard>
        <GlowCard className="p-4">
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">Accepted</p>
          <p className="text-2xl font-bold text-emerald-400">{stats.accepted}</p>
        </GlowCard>
        <GlowCard className="p-4">
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">Won Value</p>
          <CurrencyDisplay amount={stats.totalValue} size="lg" className="text-emerald-400" />
        </GlowCard>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
        <input
          className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] pl-9 pr-4 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-primary)]"
          placeholder="Search proposals…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-lg bg-[var(--bg-surface)] animate-pulse" />)}
        </div>
      ) : proposals.length === 0 ? (
        <EmptyState
          icon={FileCheck2}
          title="No proposals yet"
          description="Create your first proposal to win new clients and projects."
          action={<Button onClick={() => setShowModal(true)}><Plus className="h-4 w-4" />Create Proposal</Button>}
        />
      ) : (
        <GlowCard>
          <div className="divide-y divide-[var(--border-subtle)]">
            {proposals.map((prop, i) => (
              <motion.div
                key={prop._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--bg-overlay)] transition-colors"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-dim)] border border-[var(--border-accent)] shrink-0">
                  <FileCheck2 className="h-4 w-4 text-[var(--accent-secondary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">{prop.title}</p>
                  <p className="text-xs text-[var(--text-muted)]">{prop.clientName} · Created {formatDate(prop.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {prop.totalAmount > 0 && <CurrencyDisplay amount={prop.totalAmount} currency={prop.currency} size="sm" muted />}
                  <StatusBadge status={prop.status} />
                </div>
              </motion.div>
            ))}
          </div>
        </GlowCard>
      )}
    </div>
  );
}
