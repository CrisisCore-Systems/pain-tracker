import React from 'react';
import { ListFilter, Settings, Calendar, Activity } from 'lucide-react';

interface DashboardHeaderProps {
  totalEntries: number;
  visibleEntries: number;
  activeFilterCount: number;
  filterSummary: string | null;
  onOpenFilters: () => void;
  onOpenCustomize: () => void;
}

export function DashboardHeader({
  totalEntries,
  visibleEntries,
  activeFilterCount,
  filterSummary,
  onOpenFilters,
  onOpenCustomize,
}: DashboardHeaderProps) {
  const hasFiltersActive = activeFilterCount > 0 || visibleEntries !== totalEntries;
  const showingPercentage =
    totalEntries === 0 ? 100 : Math.round((visibleEntries / totalEntries) * 100);
  const safeFilterCount = activeFilterCount > 99 ? '99+' : activeFilterCount;

  const stats = [
    {
      label: 'Entries tracked',
      value: totalEntries,
      sublabel: totalEntries === 0 ? 'Start with your first entry' : 'All time',
      icon: Calendar,
      color: 'sky',
    },
    {
      label: 'Currently showing',
      value: visibleEntries,
      sublabel: `Focus view • ${showingPercentage}%`,
      icon: Activity,
      color: 'emerald',
    },
    {
      label: 'Filters active',
      value: activeFilterCount,
      sublabel: hasFiltersActive ? 'Tap to adjust' : 'None applied',
      icon: ListFilter,
      color: 'purple',
    },
  ];

  const colorMap: Record<string, { bg: string; border: string; text: string; icon: string }> = {
    sky: { 
      bg: 'rgba(56, 189, 248, 0.1)', 
      border: 'rgba(56, 189, 248, 0.2)', 
      text: '#38bdf8',
      icon: '#0ea5e9',
    },
    emerald: { 
      bg: 'rgba(52, 211, 153, 0.1)', 
      border: 'rgba(52, 211, 153, 0.2)', 
      text: '#34d399',
      icon: '#10b981',
    },
    purple: { 
      bg: 'rgba(168, 85, 247, 0.1)', 
      border: 'rgba(168, 85, 247, 0.2)', 
      text: '#a855f7',
      icon: '#8b5cf6',
    },
  };

  const filterLabel =
    filterSummary ?? `${activeFilterCount} active filter${activeFilterCount === 1 ? '' : 's'}`;

  return (
    <section className="space-y-6">
      {/* Main Header Card */}
      <div 
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Gradient accent line at top */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-500/50 to-transparent" />
        
        {/* Background decorative elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative p-6 lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Text Content */}
            <div className="max-w-2xl space-y-4">
              <div className="flex items-center gap-2">
                <div 
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{
                    background: 'rgba(56, 189, 248, 0.1)',
                    border: '1px solid rgba(56, 189, 248, 0.2)',
                    color: '#7dd3fc',
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                  Personalized overview
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-white leading-tight">
                  Your dashboard,{' '}
                  <span className="bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                    intentionally calmer
                  </span>
                </h2>
                <p className="text-slate-400 leading-relaxed">
                  Reduce overwhelm with curated widgets, flexible focus modes, and trauma-informed
                  pacing designed for your wellbeing.
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="w-full max-w-xl grid gap-3 sm:grid-cols-3">
              {stats.map((stat) => {
                const colors = colorMap[stat.color];
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="relative rounded-xl p-4 transition-all duration-300 hover:-translate-y-1"
                    style={{
                      background: colors.bg,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-3.5 w-3.5" style={{ color: colors.icon }} />
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        {stat.label}
                      </p>
                    </div>
                    <p 
                      className="text-2xl font-bold"
                      style={{ color: colors.text }}
                    >
                      {stat.label === 'Filters active' ? safeFilterCount : stat.value}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{stat.sublabel}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Filter Status Banner */}
          {hasFiltersActive && (
            <div 
              className="mt-6 flex flex-wrap items-center gap-4 p-3 rounded-xl"
              style={{
                background: 'rgba(168, 85, 247, 0.1)',
                border: '1px solid rgba(168, 85, 247, 0.2)',
              }}
            >
              <span 
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
                style={{
                  background: 'rgba(168, 85, 247, 0.2)',
                  color: '#c084fc',
                }}
              >
                <ListFilter className="h-4 w-4" />
                {filterLabel}
              </span>
              <button
                type="button"
                onClick={onOpenFilters}
                className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
              >
                Adjust filters →
              </button>
              <span className="text-sm text-slate-500">
                Showing {visibleEntries} of {totalEntries} entries
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={onOpenFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-[1.02]"
              style={activeFilterCount > 0 ? {
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                color: 'white',
                boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)',
              } : {
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#94a3b8',
              }}
            >
              <ListFilter className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span 
                  className="px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                  }}
                >
                  {safeFilterCount}
                </span>
              )}
            </button>
            <button
              onClick={onOpenCustomize}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#94a3b8',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.color = '#e2e8f0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.color = '#94a3b8';
              }}
            >
              <Settings className="h-4 w-4" />
              Customize
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
