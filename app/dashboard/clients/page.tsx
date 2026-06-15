'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { GlowCard } from '@/components/ui/GlowCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Users, Plus, Search, Mail, Phone, Globe, Building2 } from 'lucide-react';
import { toast } from 'sonner';

interface Client {
  _id: string;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  website?: string;
  totalRevenue: number;
  currency: string;
}

function NewClientModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', website: '' });
  const [loading, setLoading] = useState(false);

  const inputCls = 'w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-colors';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/clients', form);
      toast.success('Client added!');
      onCreated();
      onClose();
    } catch {
      toast.error('Failed to add client');
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
        <h2 className="mb-5 text-lg font-bold text-[var(--text-primary)]">Add Client</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--text-secondary)]">Name *</label>
            <input className={inputCls} required placeholder="Jane Smith" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--text-secondary)]">Company</label>
            <input className={inputCls} placeholder="Acme Inc." value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--text-secondary)]">Email *</label>
            <input className={inputCls} required type="email" placeholder="jane@acme.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Phone</label>
              <input className={inputCls} placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--text-secondary)]">Website</label>
              <input className={inputCls} placeholder="acme.com" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" loading={loading} className="flex-1">Add Client</Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function ClientsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading } = useQuery<{ data: Client[] }>({
    queryKey: ['clients'],
    queryFn: () => api.get('/clients').then(r => r.data),
  });

  const clients = (data?.data ?? []).filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.company?.toLowerCase() ?? '').includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {showModal && (
        <NewClientModal onClose={() => setShowModal(false)} onCreated={() => qc.invalidateQueries({ queryKey: ['clients'] })} />
      )}

      <PageHeader title="Clients" description={`${clients.length} client${clients.length !== 1 ? 's' : ''}`}>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" />
          Add Client
        </Button>
      </PageHeader>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
        <input
          className="w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-surface)] pl-9 pr-4 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--accent-primary)]"
          placeholder="Search clients…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-36 rounded-[var(--radius-lg)] bg-[var(--bg-surface)] animate-pulse" />
          ))}
        </div>
      ) : clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No clients yet"
          description="Add your first client to start managing relationships, projects, and invoices."
          action={<Button onClick={() => setShowModal(true)}><Plus className="h-4 w-4" />Add Client</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((c, i) => (
            <motion.div
              key={c._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <GlowCard className="p-5 h-full" hover>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-11 w-11 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-purple-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm text-[var(--text-primary)] truncate">{c.name}</h3>
                    {c.company && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Building2 className="h-3 w-3 text-[var(--text-muted)]" />
                        <p className="text-xs text-[var(--text-muted)] truncate">{c.company}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <a href={`mailto:${c.email}`} className="flex items-center gap-2 text-xs text-[var(--text-secondary)] hover:text-[var(--accent-secondary)] transition-colors">
                    <Mail className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                    <span className="truncate">{c.email}</span>
                  </a>
                  {c.phone && (
                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                      <Phone className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                      {c.phone}
                    </div>
                  )}
                  {c.website && (
                    <a href={`https://${c.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-[var(--text-secondary)] hover:text-[var(--accent-secondary)] transition-colors">
                      <Globe className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                      {c.website}
                    </a>
                  )}
                </div>
              </GlowCard>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
