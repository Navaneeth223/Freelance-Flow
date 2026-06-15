'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import api from '@/lib/api';
import { GlowCard } from '@/components/ui/GlowCard';
import { CurrencyDisplay } from '@/components/ui/CurrencyDisplay';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PageHeader } from '@/components/ui/PageHeader';
import { formatDate } from '@/lib/utils';
import {
  TrendingUp, TrendingDown, DollarSign, Briefcase,
  Clock, Users, ArrowRight, AlertCircle,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import Link from 'next/link';

interface DashboardStats {
  totalRevenue: number;
  totalPending: number;
  activeProjects: number;
  totalHours: number;
  totalClients: number;
  revenueGrowth: number;
  recentInvoices: Array<{ _id: string; invoiceNumber: string; clientName: string; amount: number; status: string; dueDate: string }>;
  recentProjects: Array<{ _id: string; name: string; clientName: string; status: string; completionPercentage: number }>;
  revenueChart: Array<{ month: string; revenue: number }>;
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

function StatCard({
  label, value, icon: Icon, change, isCurrency = false, currency = 'INR',
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  change?: number;
  isCurrency?: boolean;
  currency?: string;
}) {
  const isPositive = (change ?? 0) >= 0;
  return (
    <motion.div variants={item}>
      <GlowCard className="p-5 h-full" hover>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">{label}</p>
            <div className="mt-2">
              {isCurrency ? (
                <CurrencyDisplay amount={value} currency={currency} size="xl" />
              ) : (
                <span className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                  {value.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            {change !== undefined && (
              <div className={`mt-2 flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                {isPositive ? '+' : ''}{change.toFixed(1)}% vs last month
              </div>
            )}
          </div>
          <div className="ml-4 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-dim)] border border-[var(--border-accent)]">
            <Icon className="h-5 w-5 text-[var(--accent-secondary)]" />
          </div>
        </div>
      </GlowCard>
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2 shadow-lg text-xs">
      <p className="text-[var(--text-muted)] mb-1">{label}</p>
      <p className="font-semibold text-[var(--text-primary)]">
        ₹{payload[0].value.toLocaleString('en-IN')}
      </p>
    </div>
  );
};

export default function DashboardPage() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await api.get('/dashboard');
      return res.data.data;
    },
    placeholderData: {
      totalRevenue: 0, totalPending: 0, activeProjects: 0,
      totalHours: 0, totalClients: 0, revenueGrowth: 0,
      recentInvoices: [], recentProjects: [], revenueChart: [],
    },
  });

  const stats = data!;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        description={`Here's what's happening with your business today.`}
      />

      {/* KPI Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        <StatCard label="Total Revenue" value={stats.totalRevenue} icon={DollarSign} change={stats.revenueGrowth} isCurrency currency={user?.currency} />
        <StatCard label="Pending Invoices" value={stats.totalPending} icon={AlertCircle} isCurrency currency={user?.currency} />
        <StatCard label="Active Projects" value={stats.activeProjects} icon={Briefcase} />
        <StatCard label="Hours Tracked" value={stats.totalHours} icon={Clock} />
      </motion.div>

      {/* Revenue Chart + Recent Invoices */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Revenue chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <GlowCard className="p-5 h-full">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">Revenue Trend</h2>
                <p className="text-xs text-[var(--text-muted)]">Last 6 months</p>
              </div>
            </div>
            {isLoading ? (
              <div className="h-52 flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent-primary)] border-t-transparent" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={stats.revenueChart} margin={{ top: 0, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="revenue" stroke="var(--accent-primary)" strokeWidth={2} fill="url(#revenueGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </GlowCard>
        </motion.div>

        {/* Recent Invoices */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlowCard className="p-5 h-full">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Recent Invoices</h2>
              <Link href="/dashboard/invoices" className="flex items-center gap-1 text-xs text-[var(--accent-secondary)] hover:text-[var(--accent-primary)] transition-colors">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {stats.recentInvoices.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] text-center py-8">No invoices yet</p>
            ) : (
              <div className="space-y-3">
                {stats.recentInvoices.slice(0, 5).map((inv) => (
                  <div key={inv._id} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-[var(--text-primary)] truncate">{inv.invoiceNumber}</p>
                      <p className="text-[10px] text-[var(--text-muted)] truncate">{inv.clientName}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-semibold text-[var(--text-primary)]">₹{inv.amount.toLocaleString('en-IN')}</p>
                      <StatusBadge status={inv.status} className="mt-0.5" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlowCard>
        </motion.div>
      </div>

      {/* Recent Projects */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <GlowCard className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Active Projects</h2>
              <p className="text-xs text-[var(--text-muted)]">{stats.activeProjects} projects in progress</p>
            </div>
            <Link href="/dashboard/projects" className="flex items-center gap-1 text-xs text-[var(--accent-secondary)] hover:text-[var(--accent-primary)] transition-colors">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {stats.recentProjects.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)] text-center py-8">No projects yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentProjects.map((proj) => (
                <div key={proj._id} className="flex items-center gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">{proj.name}</p>
                      <StatusBadge status={proj.status} />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-[var(--border-default)]">
                        <div
                          className="h-1.5 rounded-full bg-[var(--accent-primary)] transition-all"
                          style={{ width: `${proj.completionPercentage}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-[var(--text-muted)] shrink-0">{proj.completionPercentage}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Users className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                    <span className="text-xs text-[var(--text-muted)]">{proj.clientName}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlowCard>
      </motion.div>
    </div>
  );
}
