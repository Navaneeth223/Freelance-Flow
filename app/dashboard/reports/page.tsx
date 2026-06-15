'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { GlowCard } from '@/components/ui/GlowCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { CurrencyDisplay } from '@/components/ui/CurrencyDisplay';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#6C63FF', '#A78BFA', '#22C55E', '#F59E0B', '#EF4444', '#3B82F6'];

interface ReportData {
  revenue: { month: string; amount: number }[];
  expensesByCategory: { category: string; total: number }[];
  summary: {
    totalRevenue: number;
    totalExpenses: number;
    totalHours: number;
    netProfit: number;
    avgHourlyRate: number;
    currency: string;
  };
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name?: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-2 shadow-lg text-xs">
      <p className="text-[var(--text-muted)] mb-1">{label}</p>
      <p className="font-semibold text-[var(--text-primary)]">₹{payload[0].value.toLocaleString('en-IN')}</p>
    </div>
  );
};

export default function ReportsPage() {
  const { data, isLoading } = useQuery<ReportData>({
    queryKey: ['reports'],
    queryFn: async () => {
      const res = await api.get('/reports');
      return res.data.data;
    },
    placeholderData: {
      revenue: [],
      expensesByCategory: [],
      summary: { totalRevenue: 0, totalExpenses: 0, totalHours: 0, netProfit: 0, avgHourlyRate: 0, currency: 'INR' },
    },
  });

  const report = data!;

  const summaryCards = [
    { label: 'Total Revenue', value: report.summary.totalRevenue, color: 'text-[var(--text-primary)]' },
    { label: 'Total Expenses', value: report.summary.totalExpenses, color: 'text-red-400' },
    { label: 'Net Profit', value: report.summary.netProfit, color: 'text-emerald-400' },
    { label: 'Avg. Hourly Rate', value: report.summary.avgHourlyRate, color: 'text-[var(--accent-secondary)]' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Insights into your freelance business performance." />

      {/* KPI Summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summaryCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <GlowCard className="p-5">
              <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">{card.label}</p>
              {isLoading ? (
                <div className="h-8 w-24 rounded bg-[var(--bg-elevated)] animate-pulse" />
              ) : (
                <CurrencyDisplay amount={card.value} currency={report.summary.currency} size="xl" className={card.color} />
              )}
            </GlowCard>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Revenue Bar Chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <GlowCard className="p-5 h-full">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Monthly Revenue</h2>
            {isLoading ? (
              <div className="h-56 flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent-primary)] border-t-transparent" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={report.revenue} margin={{ top: 0, right: 4, left: -20, bottom: 0 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="amount" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </GlowCard>
        </motion.div>

        {/* Expenses Pie */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <GlowCard className="p-5 h-full">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Expenses by Category</h2>
            {isLoading || report.expensesByCategory.length === 0 ? (
              <div className="h-56 flex items-center justify-center">
                {isLoading ? (
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent-primary)] border-t-transparent" />
                ) : (
                  <p className="text-sm text-[var(--text-muted)]">No expense data yet</p>
                )}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={report.expensesByCategory}
                    dataKey="total"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {report.expensesByCategory.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => `₹${v.toLocaleString('en-IN')}`} />
                  <Legend
                    formatter={(value) => <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </GlowCard>
        </motion.div>
      </div>

      {/* Hours summary */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <GlowCard className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Total Hours Tracked</h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Across all projects</p>
            </div>
            <div className="text-right">
              <span className="text-4xl font-bold text-[var(--accent-secondary)]">{report.summary.totalHours}</span>
              <span className="ml-1 text-lg text-[var(--text-muted)]">hrs</span>
            </div>
          </div>
        </GlowCard>
      </motion.div>
    </div>
  );
}
