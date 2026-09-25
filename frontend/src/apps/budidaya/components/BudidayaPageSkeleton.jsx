import React from 'react'
import { BudidayaTableSkeleton } from './BudidayaTableSkeleton'

/**
 * BudidayaPageSkeleton
 * High-fidelity, zero-layout-shift (CLS = 0) loading screen for AquaGrow / Budidaya module.
 * Features:
 * - Branded Forest Emerald shimmer waves (#1B4332 / #059669 / #10B981)
 * - Sticky top micro-progress glider bar
 * - Multi-layout support: 'table' | 'dashboard' | 'detail' | 'reports' | 'settings'
 */
export function BudidayaPageSkeleton({
  variant = 'table',
  kpiCount = 4,
  rows = 6,
  cols = 6,
  showTopBar = true,
  message = null
}) {
  return (
    <div className="relative w-full min-h-[calc(100vh-60px)]">
      {/* 1. Sticky Top Micro-Progress Glider (Linear / Vercel style) */}
      {showTopBar && (
        <div className="aq-top-loader-container">
          <div className="aq-top-loader-bar" />
        </div>
      )}

      {/* 2. Content Container */}
      <div className="aq-container animate-fade-in" style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {variant === 'dashboard' && <DashboardSkeleton />}
        {variant === 'detail' && <DetailSkeleton />}
        {variant === 'reports' && <ReportsSkeleton />}
        {variant === 'settings' && <SettingsSkeleton />}
        {variant === 'table' && <TablePageSkeleton kpiCount={kpiCount} rows={rows} cols={cols} />}

        {/* 3. Subtle Status Watermark */}
        <div className="flex items-center justify-center gap-2.5 py-6 text-xs text-slate-400 font-medium font-['Inter']">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
          </span>
          <span>{message || 'Memuat data budidaya...'}</span>
        </div>
      </div>
    </div>
  )
}

/**
 * ── Standard Table / List Page Skeleton ──
 * For Ponds, Cycles, Feeds, Inventory, Expenses, Master Data, Users, Roles
 */
function TablePageSkeleton({ kpiCount = 4, rows = 6, cols = 6 }) {
  return (
    <>
      {/* Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="h-3.5 w-24 rounded-md aq-shimmer-subtle mb-2" />
          <div className="h-7 w-48 rounded-xl aq-shimmer mb-1.5" />
          <div className="h-3.5 w-64 rounded-md aq-shimmer-subtle" />
        </div>
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
          <div className="h-10 w-28 rounded-xl aq-shimmer-subtle" />
          <div className="h-10 w-36 rounded-xl aq-shimmer" />
        </div>
      </div>

      {/* KPI Cards Row (Responsive 4 or 3 cards) */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${Math.min(4, Math.max(2, kpiCount))} gap-4 mb-5`}>
        {[...Array(kpiCount)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col justify-between gap-3 min-h-[110px]"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-28 rounded-md aq-shimmer-subtle" />
              <div className="w-10 h-10 rounded-xl aq-shimmer shrink-0" />
            </div>
            <div>
              <div className="h-7 w-24 rounded-lg aq-shimmer mb-1.5" />
              <div className="h-3 w-32 rounded-md aq-shimmer-subtle" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Table Container */}
      <BudidayaTableSkeleton standalone rows={rows} cols={cols} />
    </>
  )
}

/**
 * ── Dashboard Page Skeleton ──
 * Matches the deep emerald hero banner, 3 KPI cards, 2-column chart grid, and cycles table
 */
function DashboardSkeleton() {
  return (
    <>
      {/* Dark Forest Emerald Hero Banner Placeholder */}
      <div
        className="relative overflow-hidden rounded-2xl p-5 sm:p-6 text-white shadow-lg border border-emerald-500/15 mb-5"
        style={{ background: 'linear-gradient(135deg, #05281d 0%, #032017 50%, #02150f 100%)' }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="h-7 w-56 rounded-lg aq-shimmer-dark mb-2.5" />
            <div className="h-4 w-72 rounded-md aq-shimmer-dark mb-3.5" />
            <div className="flex items-center gap-2">
              <div className="h-6 w-24 rounded-lg aq-shimmer-dark" />
              <div className="h-6 w-36 rounded-lg aq-shimmer-dark" />
            </div>
          </div>
          <div className="w-14 h-16 rounded-2xl bg-white/10 border border-emerald-400/20 shrink-0 self-start md:self-center aq-shimmer-dark" />
        </div>
      </div>

      {/* 3 KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between gap-3 min-h-[120px]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl aq-shimmer shrink-0" />
                <div className="h-3 w-28 rounded-md aq-shimmer-subtle" />
              </div>
              <div className="h-5 w-16 rounded-full aq-shimmer" />
            </div>
            <div>
              <div className="h-8 w-24 rounded-lg aq-shimmer mb-1.5" />
              <div className="h-3.5 w-36 rounded-md aq-shimmer-subtle" />
            </div>
          </div>
        ))}
      </div>

      {/* 2-Column Analytics & Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Main Chart Card (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 flex-wrap gap-2">
            <div>
              <div className="h-5 w-40 rounded-lg aq-shimmer mb-1" />
              <div className="h-3 w-56 rounded-md aq-shimmer-subtle" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-16 rounded-lg aq-shimmer-subtle" />
              <div className="h-8 w-16 rounded-lg aq-shimmer" />
              <div className="h-8 w-16 rounded-lg aq-shimmer-subtle" />
            </div>
          </div>
          {/* Simulated Bar Chart Canvas */}
          <div className="h-56 flex items-end justify-between gap-4 px-4 py-2 bg-slate-50/50 rounded-xl">
            {[45, 65, 35, 80, 55, 95, 70, 85].map((val, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div
                  className="w-full max-w-[36px] rounded-t-lg aq-shimmer"
                  style={{ height: `${val}%`, minHeight: '24px' }}
                />
                <div className="h-2.5 w-8 rounded aq-shimmer-subtle" />
              </div>
            ))}
          </div>
        </div>

        {/* Side Actions & Alerts Card (1 Col) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div className="h-5 w-32 rounded-lg aq-shimmer" />
            <div className="w-6 h-6 rounded-lg aq-shimmer-subtle" />
          </div>
          <div className="flex flex-col gap-3 flex-1 justify-around">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50/80">
                <div className="w-9 h-9 rounded-xl aq-shimmer shrink-0" />
                <div className="flex-1">
                  <div className="h-3.5 w-32 rounded aq-shimmer mb-1" />
                  <div className="h-2.5 w-44 rounded aq-shimmer-subtle" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Cycles Table Shimmer */}
      <BudidayaTableSkeleton standalone rows={4} cols={5} />
    </>
  )
}

/**
 * ── Detail Page Skeleton ──
 * For PondDetail and CycleDetail
 */
function DetailSkeleton() {
  return (
    <>
      {/* Top Navigation & Actions Bar */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="h-9 w-36 rounded-xl aq-shimmer-subtle" />
        <div className="flex items-center gap-2">
          <div className="h-9 w-28 rounded-xl aq-shimmer-subtle" />
          <div className="h-9 w-32 rounded-xl aq-shimmer" />
        </div>
      </div>

      {/* Main Detail Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="h-7 w-48 rounded-xl aq-shimmer" />
              <div className="h-6 w-20 rounded-full aq-shimmer" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-3.5 w-32 rounded-md aq-shimmer-subtle" />
              <div className="h-3.5 w-24 rounded-md aq-shimmer-subtle" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-28 rounded-xl aq-shimmer-subtle" />
            <div className="h-10 w-36 rounded-xl aq-shimmer" />
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="h-3 w-20 rounded aq-shimmer-subtle" />
              <div className="w-8 h-8 rounded-lg aq-shimmer" />
            </div>
            <div className="h-6 w-24 rounded-lg aq-shimmer mb-1" />
            <div className="h-2.5 w-28 rounded aq-shimmer-subtle" />
          </div>
        ))}
      </div>

      {/* Segmented Tabs Bar */}
      <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
        {[80, 110, 120, 90, 80].map((w, idx) => (
          <div
            key={idx}
            className={`h-10 rounded-xl shrink-0 ${idx === 0 ? 'aq-shimmer' : 'aq-shimmer-subtle'}`}
            style={{ width: `${w}px` }}
          />
        ))}
      </div>

      {/* Tab Content Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs mb-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100">
                <div className="h-3.5 w-32 rounded aq-shimmer-subtle" />
                <div className="h-4 w-40 rounded aq-shimmer" />
              </div>
            ))}
          </div>
          <div className="h-48 rounded-xl bg-slate-50/60 p-4 flex flex-col justify-between">
            <div className="h-4 w-36 rounded aq-shimmer mb-2" />
            <div className="flex-1 flex items-end gap-3 pt-4">
              {[40, 60, 75, 50, 85, 70].map((h, i) => (
                <div key={i} className="flex-1 rounded-t-md aq-shimmer" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

/**
 * ── Reports / Finance Skeleton ──
 * For Reports and BudidayaFinanceSummary
 */
function ReportsSkeleton() {
  return (
    <>
      {/* Date Filter & Export Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <div className="h-7 w-48 rounded-xl aq-shimmer mb-1.5" />
          <div className="h-3.5 w-64 rounded-md aq-shimmer-subtle" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-10 w-44 rounded-xl aq-shimmer-subtle" />
          <div className="h-10 w-32 rounded-xl aq-shimmer" />
        </div>
      </div>

      {/* 4 Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="h-3 w-24 rounded aq-shimmer-subtle" />
              <div className="w-10 h-10 rounded-xl aq-shimmer" />
            </div>
            <div>
              <div className="h-7 w-32 rounded-lg aq-shimmer mb-1.5" />
              <div className="h-3 w-40 rounded aq-shimmer-subtle" />
            </div>
          </div>
        ))}
      </div>

      {/* 2 Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="h-4 w-36 rounded aq-shimmer" />
            <div className="h-7 w-20 rounded-lg aq-shimmer-subtle" />
          </div>
          <div className="h-48 rounded-xl bg-slate-50/50 p-4 flex items-end gap-3">
            {[50, 70, 45, 90, 65, 80].map((h, i) => (
              <div key={i} className="flex-1 rounded-t-md aq-shimmer" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="h-4 w-40 rounded aq-shimmer" />
            <div className="h-7 w-20 rounded-lg aq-shimmer-subtle" />
          </div>
          <div className="h-48 rounded-xl bg-slate-50/50 flex items-center justify-around p-4">
            <div className="w-32 h-32 rounded-full border-8 border-slate-200/60 aq-shimmer" />
            <div className="space-y-2">
              <div className="h-3 w-24 rounded aq-shimmer" />
              <div className="h-3 w-28 rounded aq-shimmer-subtle" />
              <div className="h-3 w-20 rounded aq-shimmer-subtle" />
            </div>
          </div>
        </div>
      </div>

      {/* Financial Ledger Table */}
      <BudidayaTableSkeleton standalone rows={5} cols={5} />
    </>
  )
}

/**
 * ── Settings & Backup Skeleton ──
 * For Settings and BudidayaBackup
 */
function SettingsSkeleton() {
  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="h-7 w-48 rounded-xl aq-shimmer mb-1.5" />
          <div className="h-3.5 w-60 rounded-md aq-shimmer-subtle" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-3">
        <div className="h-9 w-28 rounded-lg aq-shimmer" />
        <div className="h-9 w-28 rounded-lg aq-shimmer-subtle" />
        <div className="h-9 w-36 rounded-lg aq-shimmer-subtle" />
      </div>

      {/* Settings Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-3xl space-y-6">
        <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
          <div className="w-20 h-20 rounded-2xl aq-shimmer shrink-0" />
          <div className="space-y-2">
            <div className="h-4 w-32 rounded aq-shimmer" />
            <div className="h-3 w-48 rounded aq-shimmer-subtle" />
            <div className="h-8 w-24 rounded-lg aq-shimmer-subtle" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-24 rounded aq-shimmer-subtle" />
              <div className="h-10 w-full rounded-xl aq-shimmer" />
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
          <div className="h-10 w-24 rounded-xl aq-shimmer-subtle" />
          <div className="h-10 w-36 rounded-xl aq-shimmer" />
        </div>
      </div>
    </>
  )
}

export default BudidayaPageSkeleton
