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
import { Receipt, Plus, Search, Tag } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = ['Software', 'Hardware', 'Travel', 'Meals', 'Marketing', 'Office', 'Learning', 'Other'];

interface Expense {
  _id: string;
  title: string;
  amount: number;
  currency: string;
  category: string;
  date: string;
  isBillable: boolean;
  isReimbursable: boolean;
}

function NewExpenseModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ title: '', amount: '', currency: 'INR', category: 'Other', date: new Date().toISOString().split('T')[0], isBillable: false, isReimbursable: false });
  const [loading, setLoading] = useState(false);

  const inputCls = 'w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-colors';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/expenses', { ...form, amount: Number(form.amount) });
      toast.success('Expense logged!');
      onCreated();
      onClose();
    } catch {
      toast.error('Failed to log expense');
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
        <h2 className="mb-5 text-lg font-bold text-[var(--text-primary)]">Log Expense</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--text-secondary)]">Title *</label>
            <input className={inputCls} required placeholder="Adobe CC Subscription" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Amount *</label>
              <input className={inputCls} required type="number" min="0" placeholder="5000" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Category</label>
              <select className={inputCls} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--text-secondary)]">Date</label>
            <input className={inputCls} type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] cursor-pointer">
              <input type="checkbox" checked={form.isBillable} onChange={e => setForm(f => ({ ...f, isBillable: e.target.checked }))}
                className="rounded border-[var(--border-default)] accent-[var(--accent-primary)]" />
              Billable to client
            </label>
            <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] cursor-pointer">
              <input type="checkbox" checked={form.isReimbursable} onChange={e => setForm(f => ({ ...f, isReimbursable: e.target.checked }))}
                className="rounded border-[var(--border-default)] accent-[var(--accent-primary)]" />
              Reimbursable
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" loading={loading} className="flex-1">Log Expense</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function ExpensesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading } = useQuery<{ data: Expense[] }>({
    queryKey: ['expenses'],
    queryFn: () => api.get('/expenses').then(r => r.data),
  });

  const expenses = (data?.data ?? []).filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-6">
      {showModal && (
        <NewExpenseModal onClose={() => setShowModal(false)} onCreated={() => qc.invalidateQueries({ queryKey: ['expenses'] })} />
      )}

      <PageHeader title="Expenses" description="Track your business spending.">
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" />
          Log Expense
        </Button>
      </PageHeader>

      <GlowCard className="p-4">
        <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">Total Expenses</p>
        <CurrencyDisplay amount={totalSpent} size="xl" />
      </GlowCard>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
        <input
          className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] pl-9 pr-4 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-primary)]"
          placeholder="Search expenses…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <div key={i} className="h-14 rounded-lg bg-[var(--bg-surface)] animate-pulse" />)}
        </div>
      ) : expenses.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No expenses logged"
          description="Track your business expenses to stay on top of your finances."
          action={<Button onClick={() => setShowModal(true)}><Plus className="h-4 w-4" />Log Expense</Button>}
        />
      ) : (
        <GlowCard>
          <div className="divide-y divide-[var(--border-subtle)]">
            {expenses.map((exp, i) => (
              <motion.div
                key={exp._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--bg-overlay)] transition-colors"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] shrink-0">
                  <Tag className="h-4 w-4 text-[var(--text-muted)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">{exp.title}</p>
                  <p className="text-xs text-[var(--text-muted)]">{exp.category} · {formatDate(exp.date)}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {exp.isBillable && <StatusBadge status="active" className="!text-[10px]" />}
                  <CurrencyDisplay amount={exp.amount} currency={exp.currency} size="md" className="font-semibold" />
                </div>
              </motion.div>
            ))}
          </div>
        </GlowCard>
      )}
    </div>
  );
}
