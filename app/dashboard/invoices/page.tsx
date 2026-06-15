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
import { FileText, Plus, Search, Send } from 'lucide-react';
import { toast } from 'sonner';

interface Invoice {
  _id: string;
  invoiceNumber: string;
  clientId: { _id: string; name: string };
  status: string;
  subtotal: number;
  total: number;
  currency: string;
  issueDate: string;
  dueDate: string;
  items: Array<{ description: string; quantity: number; rate: number; amount: number }>;
}

function NewInvoiceModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    clientName: '',
    dueDate: '',
    currency: 'INR',
    notes: '',
    items: [{ description: '', quantity: 1, rate: 0 }],
  });
  const [loading, setLoading] = useState(false);

  const inputCls = 'w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-colors';

  const updateItem = (i: number, field: string, value: string | number) => {
    setForm(f => ({
      ...f,
      items: f.items.map((item, idx) => idx === i ? { ...item, [field]: value } : item),
    }));
  };

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { description: '', quantity: 1, rate: 0 }] }));

  const subtotal = form.items.reduce((sum, it) => sum + it.quantity * it.rate, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/invoices', {
        ...form,
        items: form.items.map(it => ({ ...it, amount: it.quantity * it.rate })),
        subtotal,
        total: subtotal,
        issueDate: new Date().toISOString(),
      });
      toast.success('Invoice created!');
      onCreated();
      onClose();
    } catch {
      toast.error('Failed to create invoice');
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
        className="relative w-full max-w-2xl rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-elevated)] max-h-[90vh] overflow-y-auto"
      >
        <h2 className="mb-5 text-lg font-bold text-[var(--text-primary)]">New Invoice</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Client Name *</label>
              <input className={inputCls} required placeholder="Acme Corp" value={form.clientName} onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Due Date *</label>
              <input className={inputCls} required type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
            </div>
          </div>

          {/* Line items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Line Items</label>
              <button type="button" onClick={addItem} className="text-xs text-[var(--accent-secondary)] hover:text-[var(--accent-primary)] transition-colors">+ Add item</button>
            </div>
            <div className="rounded-lg border border-[var(--border-default)] overflow-hidden">
              <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-[var(--bg-elevated)] text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">
                <div className="col-span-6">Description</div>
                <div className="col-span-2 text-right">Qty</div>
                <div className="col-span-2 text-right">Rate</div>
                <div className="col-span-2 text-right">Amount</div>
              </div>
              {form.items.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 px-3 py-2 border-t border-[var(--border-subtle)]">
                  <input
                    className="col-span-6 bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder-[var(--text-muted)]"
                    placeholder="Design services…"
                    value={item.description}
                    onChange={e => updateItem(i, 'description', e.target.value)}
                  />
                  <input
                    className="col-span-2 bg-transparent text-sm text-right text-[var(--text-primary)] outline-none"
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={e => updateItem(i, 'quantity', Number(e.target.value))}
                  />
                  <input
                    className="col-span-2 bg-transparent text-sm text-right text-[var(--text-primary)] outline-none"
                    type="number"
                    min="0"
                    value={item.rate}
                    onChange={e => updateItem(i, 'rate', Number(e.target.value))}
                  />
                  <p className="col-span-2 text-sm text-right text-[var(--text-secondary)] font-medium">
                    {(item.quantity * item.rate).toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
              <div className="flex justify-end px-3 py-3 border-t border-[var(--border-default)] bg-[var(--bg-elevated)]">
                <div className="text-sm">
                  <span className="text-[var(--text-muted)]">Total: </span>
                  <span className="font-bold text-[var(--text-primary)]">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" type="button" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" loading={loading} className="flex-1">Create Invoice</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function InvoicesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading } = useQuery<{ data: Invoice[] }>({
    queryKey: ['invoices'],
    queryFn: () => api.get('/invoices').then(r => r.data),
  });

  const invoices = (data?.data ?? []).filter(inv =>
    inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
    inv.clientId?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const totals = {
    paid: invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0),
    pending: invoices.filter(i => ['sent', 'overdue'].includes(i.status)).reduce((s, i) => s + i.total, 0),
  };

  return (
    <div className="space-y-6">
      {showModal && (
        <NewInvoiceModal onClose={() => setShowModal(false)} onCreated={() => qc.invalidateQueries({ queryKey: ['invoices'] })} />
      )}

      <PageHeader title="Invoices" description={`${invoices.length} total invoices`}>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" />
          New Invoice
        </Button>
      </PageHeader>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <GlowCard className="p-4">
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">Paid</p>
          <CurrencyDisplay amount={totals.paid} size="lg" className="text-emerald-400" />
        </GlowCard>
        <GlowCard className="p-4">
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">Outstanding</p>
          <CurrencyDisplay amount={totals.pending} size="lg" className="text-amber-400" />
        </GlowCard>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
        <input
          className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] pl-9 pr-4 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-primary)]"
          placeholder="Search invoices…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-lg bg-[var(--bg-surface)] animate-pulse" />)}
        </div>
      ) : invoices.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No invoices yet"
          description="Create your first invoice to start getting paid for your work."
          action={<Button onClick={() => setShowModal(true)}><Plus className="h-4 w-4" />Create Invoice</Button>}
        />
      ) : (
        <GlowCard>
          <div className="divide-y divide-[var(--border-subtle)]">
            {invoices.map((inv, i) => (
              <motion.div
                key={inv._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--bg-overlay)] transition-colors"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent-dim)] border border-[var(--border-accent)] shrink-0">
                  <FileText className="h-4 w-4 text-[var(--accent-secondary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{inv.invoiceNumber}</p>
                  <p className="text-xs text-[var(--text-muted)]">{inv.clientId?.name ?? 'Unknown client'} · Due {formatDate(inv.dueDate)}</p>
                </div>
                <div className="text-right shrink-0">
                  <CurrencyDisplay amount={inv.total} currency={inv.currency} size="md" className="font-semibold" />
                  <div className="mt-0.5"><StatusBadge status={inv.status} /></div>
                </div>
              </motion.div>
            ))}
          </div>
        </GlowCard>
      )}
    </div>
  );
}
