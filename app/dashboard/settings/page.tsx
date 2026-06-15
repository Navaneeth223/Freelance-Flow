'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import api from '@/lib/api';
import { GlowCard } from '@/components/ui/GlowCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { User, DollarSign, Bell, Shield, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'billing', label: 'Billing', icon: DollarSign },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
];

function ProfileTab() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    hourlyRate: user?.hourlyRate ?? 0,
    currency: user?.currency ?? 'INR',
    timezone: user?.timezone ?? 'Asia/Kolkata',
  });
  const [loading, setLoading] = useState(false);

  const inputCls = 'w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-colors';

  async function handleSave() {
    setLoading(true);
    try {
      const res = await api.put('/users/profile', form);
      updateUser(res.data.data);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <GlowCard className="p-6">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--text-secondary)]">Full Name</label>
            <input className={inputCls} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--text-secondary)]">Email</label>
            <input className={inputCls} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--text-secondary)]">Default Hourly Rate</label>
            <input className={inputCls} type="number" min="0" value={form.hourlyRate} onChange={e => setForm(f => ({ ...f, hourlyRate: Number(e.target.value) }))} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--text-secondary)]">Currency</label>
            <select className={inputCls} value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
              <option value="INR">INR — Indian Rupee</option>
              <option value="USD">USD — US Dollar</option>
              <option value="EUR">EUR — Euro</option>
              <option value="GBP">GBP — British Pound</option>
            </select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-medium text-[var(--text-secondary)]">Timezone</label>
            <select className={inputCls} value={form.timezone} onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))}>
              <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
              <option value="America/New_York">America/New_York (EST)</option>
              <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
              <option value="Europe/Berlin">Europe/Berlin (CET)</option>
              <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
            </select>
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <Button onClick={handleSave} loading={loading}>Save Changes</Button>
        </div>
      </GlowCard>
    </div>
  );
}

function PlaceholderTab({ title, description }: { title: string; description: string }) {
  return (
    <GlowCard className="p-6">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">{title}</h3>
      <p className="text-sm text-[var(--text-muted)]">{description}</p>
    </GlowCard>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your account preferences." />

      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Sidebar nav */}
        <div className="lg:w-56 shrink-0">
          <GlowCard className="overflow-hidden">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center justify-between px-4 py-3 text-sm transition-colors border-b border-[var(--border-subtle)] last:border-0 ${
                  activeTab === tab.id
                    ? 'bg-[var(--accent-dim)] text-[var(--accent-secondary)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)] hover:text-[var(--text-primary)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </div>
                <ChevronRight className="h-3.5 w-3.5 opacity-50" />
              </button>
            ))}
          </GlowCard>
        </div>

        {/* Content */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'profile' && <ProfileTab />}
            {activeTab === 'billing' && (
              <PlaceholderTab
                title="Billing & Subscription"
                description="Manage your FreelanceFlow plan. Upgrade to Pro for unlimited clients, projects, and priority support."
              />
            )}
            {activeTab === 'notifications' && (
              <PlaceholderTab
                title="Notification Preferences"
                description="Configure email notifications for invoice due dates, timer reminders, and weekly summaries."
              />
            )}
            {activeTab === 'security' && (
              <PlaceholderTab
                title="Security Settings"
                description="Update your password, manage active sessions, and configure two-factor authentication."
              />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
