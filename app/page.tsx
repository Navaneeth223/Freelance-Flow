'use client';

import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  Zap, ArrowRight, Clock, FileText, BarChart3, Users,
  CheckCircle2, Shield, Globe, Star,
} from 'lucide-react';

const features = [
  { icon: Clock, title: 'Smart Time Tracking', desc: 'One-click timer with project tagging, billable hours, and automatic calculation.' },
  { icon: FileText, title: 'Professional Invoices', desc: 'Create beautiful invoices in seconds with line items, taxes, and instant PDF export.' },
  { icon: BarChart3, title: 'Revenue Analytics', desc: 'Understand your income trends, profit margins, and top clients at a glance.' },
  { icon: Users, title: 'Client Management', desc: 'Keep all your client data, project history, and communication in one place.' },
  { icon: Shield, title: 'Secure & Private', desc: 'Your data is encrypted at rest and in transit. You own everything.' },
  { icon: Globe, title: 'Multi-Currency', desc: 'Invoice clients in INR, USD, EUR, GBP — with automatic formatting.' },
];

const testimonials = [
  { name: 'Priya Sharma', role: 'UI/UX Designer', text: 'FreelanceFlow saved me 4+ hours every week on admin work. I finally feel like a real business.', stars: 5 },
  { name: 'Arjun Mehta', role: 'Full-Stack Developer', text: 'The time tracker + invoice combo is seamless. I went from chasing payments to getting paid on time.', stars: 5 },
  { name: 'Sneha Kapoor', role: 'Brand Consultant', text: 'The proposals feature alone is worth it. My win rate went up the moment I started using it.', stars: 5 },
];

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-base)]/80 px-6 backdrop-blur-md lg:px-12">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-primary)] shadow-[var(--shadow-glow)]">
            <Zap className="h-4 w-4 text-white" fill="white" />
          </div>
          <span className="font-bold text-[var(--text-primary)] tracking-tight">FreelanceFlow</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-4 py-2">
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-[var(--radius-md)] bg-[var(--accent-primary)] px-4 py-2 text-sm font-semibold text-white shadow-[0_0_20px_var(--accent-glow)] hover:bg-indigo-500 transition-all"
          >
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-screen items-center justify-center px-6 pt-16">
        {/* Background blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/3 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent-primary)] opacity-[0.07] blur-[140px]" />
          <div className="absolute right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-purple-500 opacity-[0.05] blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border-accent)] bg-[var(--accent-dim)] px-4 py-1.5 text-xs font-medium text-[var(--accent-secondary)]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Now in early access — free for independent freelancers
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 text-5xl font-bold leading-tight tracking-tight text-[var(--text-primary)] sm:text-6xl lg:text-7xl"
          >
            Run your freelance
            <br />
            <span className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] bg-clip-text text-transparent">
              business like a studio
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-10 mx-auto max-w-2xl text-lg text-[var(--text-secondary)] leading-relaxed"
          >
            FreelanceFlow brings time tracking, invoicing, client management, proposals, and analytics into one elegant workspace — built for developers and creative professionals.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <Link
              href="/register"
              className="flex items-center gap-2 rounded-[var(--radius-lg)] bg-[var(--accent-primary)] px-8 py-3.5 text-base font-semibold text-white shadow-[0_0_40px_var(--accent-glow)] hover:bg-indigo-500 transition-all hover:scale-[1.02]"
            >
              Start for free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)] px-8 py-3.5 text-base font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-all"
            >
              Sign in
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-5 text-xs text-[var(--text-muted)]"
          >
            No credit card required · Cancel anytime · Your data, your rules
          </motion.p>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-3">Everything you need, nothing you don&apos;t</h2>
            <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
              Stop juggling spreadsheets, apps, and sticky notes. FreelanceFlow is the all-in-one workspace your freelance business deserves.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feat, i) => (
              <FadeIn key={feat.title} delay={i * 0.08}>
                <div className="group rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 transition-all hover:border-[var(--border-accent)] hover:shadow-[var(--shadow-elevated)]">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-dim)] border border-[var(--border-accent)] group-hover:shadow-[var(--shadow-glow)] transition-all">
                    <feat.icon className="h-5 w-5 text-[var(--accent-secondary)]" />
                  </div>
                  <h3 className="mb-2 font-semibold text-[var(--text-primary)]">{feat.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{feat.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 lg:px-12 border-t border-[var(--border-subtle)]">
        <div className="mx-auto max-w-6xl">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-3">Freelancers love it</h2>
            <p className="text-[var(--text-secondary)]">Join hundreds of independent professionals running smarter businesses.</p>
          </FadeIn>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <FadeIn key={t.name} delay={i * 0.1}>
                <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-6">
                  <div className="flex mb-3">
                    {[...Array(t.stars)].map((_, j) => (
                      <Star key={j} className="h-4 w-4 text-amber-400" fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[var(--accent-primary)] to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{t.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">{t.role}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="py-24 px-6 lg:px-12">
        <div className="mx-auto max-w-2xl text-center">
          <FadeIn>
            <div className="rounded-[var(--radius-2xl)] border border-[var(--border-accent)] bg-gradient-to-b from-[var(--bg-surface)] to-[var(--bg-elevated)] p-10 shadow-[var(--shadow-glow)]">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--accent-dim)] border border-[var(--border-accent)] px-3 py-1 text-xs text-[var(--accent-secondary)]">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Free forever for solo freelancers
              </div>
              <h2 className="text-4xl font-bold text-[var(--text-primary)] mb-3">Start today. Grow forever.</h2>
              <p className="text-[var(--text-secondary)] mb-8 leading-relaxed">
                FreelanceFlow is free for your first 10 clients and 5 active projects. Upgrade to Pro as your business grows.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-[var(--radius-lg)] bg-[var(--accent-primary)] px-10 py-3.5 text-base font-semibold text-white shadow-[0_0_40px_var(--accent-glow)] hover:bg-indigo-500 transition-all hover:scale-[1.02]"
              >
                Create your free account
                <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="mt-4 text-xs text-[var(--text-muted)]">No credit card required</p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border-subtle)] py-8 px-6 text-center lg:px-12">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--accent-primary)]">
            <Zap className="h-3 w-3 text-white" fill="white" />
          </div>
          <span className="text-sm font-semibold text-[var(--text-primary)]">FreelanceFlow</span>
        </div>
        <p className="text-xs text-[var(--text-muted)]">© 2026 FreelanceFlow. Built for independent professionals.</p>
      </footer>
    </div>
  );
}
