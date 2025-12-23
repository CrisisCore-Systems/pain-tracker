import React, { useState } from 'react';
import {
  LayoutDashboard,
  Plus,
  User,
  TrendingUp,
  Settings,
  Heart,
  Menu,
  X,
  Moon,
  Sun,
  Shield,
  Sparkles,
  Activity,
  Calendar,
  FileText,
  HelpCircle,
  Bell,
  Wind,
  Zap,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../design-system/utils';
import { Button, useTheme } from '../../design-system';
import { PanicMode } from '../accessibility/PanicMode';
import CrisisBanner from '../crisis/CrisisBanner';

interface ModernAppLayoutProps {
  children: React.ReactNode;
  onNavigate?: (view: string) => void;
  currentView?: string;
  stats?: {
    totalEntries: number;
    avgPain: number;
    streak: number;
  };
}

export function ModernAppLayout({
  children,
  onNavigate,
  currentView = 'dashboard',
  stats,
}: ModernAppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [panicModeActive, setPanicModeActive] = useState(false);
  const { mode, setMode } = useTheme();

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, badge: null, color: 'sky' },
    { id: 'new-entry', name: 'New Entry', icon: Plus, badge: null, color: 'emerald' },
    { id: 'body-map', name: 'Body Map', icon: User, badge: null, color: 'violet' },
    { id: 'fibromyalgia', name: 'Fibromyalgia Hub', icon: Heart, badge: 'New', color: 'rose' },
    { id: 'analytics', name: 'Analytics', icon: TrendingUp, badge: 'Pro', color: 'amber' },
    { id: 'calendar', name: 'Calendar', icon: Calendar, badge: null, color: 'cyan' },
    { id: 'reports', name: 'Reports', icon: FileText, badge: null, color: 'indigo' },
  ];

  const bottomNavigation = [
    { id: 'settings', name: 'Settings', icon: Settings },
    { id: 'help', name: 'Help', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      {/* Skip to Main Content Link - Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-6 focus:py-3 focus:bg-sky-500 focus:text-white focus:rounded-xl focus:shadow-lg focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-background focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Premium Glass Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo & Brand */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200"
                aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={sidebarOpen}
                aria-controls="mobile-navigation-menu"
                data-testid="nav-toggle"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

              <div className="flex items-center gap-3">
                <div 
                  className="p-2.5 rounded-xl"
                  style={{ 
                    background: 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)',
                    boxShadow: '0 8px 20px rgba(14, 165, 233, 0.3)',
                  }}
                >
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                    Pain Tracker Pro
                  </h1>
                  <p className="text-[11px] text-muted-foreground">Pain management insights</p>
                </div>
              </div>
            </div>

            {/* Quick Stats - Premium Glass Cards */}
            {stats && (
              <div className="hidden md:flex items-center gap-3">
                <div 
                  className="flex items-center gap-2 px-4 py-2 rounded-xl"
                  style={{
                    background: 'rgba(56, 189, 248, 0.1)',
                    border: '1px solid rgba(56, 189, 248, 0.2)',
                  }}
                >
                  <Activity className="h-4 w-4 text-sky-400" />
                  <span className="text-sm font-semibold text-sky-300">
                    {stats.avgPain.toFixed(1)} <span className="text-sky-400/70 font-normal">avg</span>
                  </span>
                </div>
                <div 
                  className="flex items-center gap-2 px-4 py-2 rounded-xl"
                  style={{
                    background: 'rgba(168, 85, 247, 0.1)',
                    border: '1px solid rgba(168, 85, 247, 0.2)',
                  }}
                >
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  <span className="text-sm font-semibold text-purple-300">
                    {stats.streak} <span className="text-purple-400/70 font-normal">day streak</span>
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white font-medium transition-all duration-300 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)',
                  boxShadow: '0 4px 15px rgba(14, 165, 233, 0.3)',
                }}
                onClick={() => onNavigate?.('daily-checkin')}
              >
                <Heart className="h-4 w-4" />
                Check-in
              </Button>

              <button 
                className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200"
                onClick={() => {}}
                aria-label="Notifications"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
              </button>

              <button
                className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200"
                onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
                aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
                title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
              >
                {mode === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              <div 
                className="p-2.5 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                }}
              >
                <Shield className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar - Desktop - Premium Dark Theme */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:block lg:w-72 lg:pt-16">
        <div className="h-full px-4 py-6 bg-background/95 backdrop-blur-xl border-r border-border/20">
          <nav className="space-y-1.5">
            {navigation.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              const colorMap: Record<string, { bg: string; border: string; text: string; glow: string }> = {
                sky: { bg: 'rgba(56, 189, 248, 0.15)', border: 'rgba(56, 189, 248, 0.3)', text: '#38bdf8', glow: 'rgba(56, 189, 248, 0.2)' },
                emerald: { bg: 'rgba(52, 211, 153, 0.15)', border: 'rgba(52, 211, 153, 0.3)', text: '#34d399', glow: 'rgba(52, 211, 153, 0.2)' },
                violet: { bg: 'rgba(139, 92, 246, 0.15)', border: 'rgba(139, 92, 246, 0.3)', text: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.2)' },
                rose: { bg: 'rgba(244, 63, 94, 0.15)', border: 'rgba(244, 63, 94, 0.3)', text: '#f43f5e', glow: 'rgba(244, 63, 94, 0.2)' },
                amber: { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)', text: '#f59e0b', glow: 'rgba(245, 158, 11, 0.2)' },
                cyan: { bg: 'rgba(34, 211, 238, 0.15)', border: 'rgba(34, 211, 238, 0.3)', text: '#22d3ee', glow: 'rgba(34, 211, 238, 0.2)' },
                indigo: { bg: 'rgba(99, 102, 241, 0.15)', border: 'rgba(99, 102, 241, 0.3)', text: '#6366f1', glow: 'rgba(99, 102, 241, 0.2)' },
              };
              
              const colors = colorMap[item.color] || colorMap.sky;

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate?.(item.id)}
                  data-nav-target={item.id}
                  className={cn(
                    'group flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300',
                    isActive ? '' : 'text-slate-400 hover:text-white'
                  )}
                  style={isActive ? {
                    background: colors.bg,
                    border: `1px solid ${colors.border}`,
                    boxShadow: `0 4px 20px ${colors.glow}`,
                    color: colors.text,
                  } : {
                    background: 'transparent',
                    border: '1px solid transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = 'transparent';
                    }
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div 
                      className={cn(
                        'p-2 rounded-lg transition-all duration-300 flex-shrink-0',
                        isActive ? '' : 'group-hover:scale-110'
                      )}
                      style={isActive ? {
                        background: colors.bg,
                      } : {
                        background: 'rgba(255, 255, 255, 0.05)',
                      }}
                    >
                      <Icon
                        className="h-4 w-4"
                        style={{ color: isActive ? colors.text : 'currentColor' }}
                      />
                    </div>
                    <span className="truncate">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {item.badge && (
                      <span 
                        className="px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap"
                        style={{
                          background: item.badge === 'New' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(168, 85, 247, 0.2)',
                          color: item.badge === 'New' ? '#34d399' : '#a855f7',
                          border: item.badge === 'New' ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid rgba(168, 85, 247, 0.3)',
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                    {isActive && <ChevronRight className="h-4 w-4 opacity-50" />}
                  </div>
                </button>
              );
            })}
          </nav>

          <div className="mt-8 pt-8" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <nav className="space-y-1">
              {bottomNavigation.map(item => {
                const Icon = item.icon;
                const isActive = currentView === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate?.(item.id)}
                    className={cn(
                      'group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Add Button - Premium Gradient */}
          <div className="mt-8">
            <button
              onClick={() => onNavigate?.('new-entry')}
              className="group w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-white font-medium transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)',
                boxShadow: '0 8px 25px rgba(14, 165, 233, 0.3)',
              }}
            >
              <Zap className="h-4 w-4 transition-transform group-hover:scale-110" />
              Quick Entry
            </button>
          </div>

          {/* Pro Upgrade Banner */}
          <div 
            className="mt-6 p-4 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
              border: '1px solid rgba(168, 85, 247, 0.2)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-semibold text-purple-300">Upgrade to Pro</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">Unlock AI insights, advanced analytics & more</p>
            <button 
              className="w-full py-2 rounded-lg text-xs font-medium text-purple-300 transition-colors hover:bg-purple-500/20"
              style={{ border: '1px solid rgba(168, 85, 247, 0.3)' }}
            >
              Learn More
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar - Premium Dark */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <aside 
            id="mobile-navigation-menu"
            className="fixed inset-y-0 left-0 w-72 shadow-2xl"
            style={{
              background: 'linear-gradient(180deg, #0f172a 0%, #020617 100%)',
            }}
            role="navigation"
            aria-label="Mobile navigation menu"
          >
            <div className="h-full px-4 py-6 pt-20 flex flex-col">
              <nav className="space-y-1.5 flex-1">
                {navigation.map(item => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  
                  const colorMap: Record<string, { bg: string; border: string; text: string }> = {
                    sky: { bg: 'rgba(56, 189, 248, 0.15)', border: 'rgba(56, 189, 248, 0.3)', text: '#38bdf8' },
                    emerald: { bg: 'rgba(52, 211, 153, 0.15)', border: 'rgba(52, 211, 153, 0.3)', text: '#34d399' },
                    violet: { bg: 'rgba(139, 92, 246, 0.15)', border: 'rgba(139, 92, 246, 0.3)', text: '#8b5cf6' },
                    rose: { bg: 'rgba(244, 63, 94, 0.15)', border: 'rgba(244, 63, 94, 0.3)', text: '#f43f5e' },
                    amber: { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)', text: '#f59e0b' },
                    cyan: { bg: 'rgba(34, 211, 238, 0.15)', border: 'rgba(34, 211, 238, 0.3)', text: '#22d3ee' },
                    indigo: { bg: 'rgba(99, 102, 241, 0.15)', border: 'rgba(99, 102, 241, 0.3)', text: '#6366f1' },
                  };
                  
                  const colors = colorMap[item.color] || colorMap.sky;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate?.(item.id);
                        setSidebarOpen(false);
                      }}
                      data-nav-target={item.id}
                      className={cn(
                        'group flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all',
                        isActive ? '' : 'text-slate-400'
                      )}
                      style={isActive ? {
                        background: colors.bg,
                        border: `1px solid ${colors.border}`,
                        color: colors.text,
                      } : {}}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <span className="truncate">{item.name}</span>
                      </div>
                      {item.badge && (
                        <span 
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0"
                          style={{
                            background: item.badge === 'New' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(168, 85, 247, 0.2)',
                            color: item.badge === 'New' ? '#34d399' : '#a855f7',
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Bottom Navigation (Settings, Help) in Mobile Menu */}
              <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <nav className="space-y-1">
                  {bottomNavigation.map(item => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onNavigate?.(item.id);
                          setSidebarOpen(false);
                        }}
                        data-nav-target={item.id}
                        className={cn(
                          'group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all',
                          isActive
                            ? 'bg-white/10 text-white'
                            : 'text-slate-400 hover:bg-white/5 hover:text-slate-300'
                        )}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <span>{item.name}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <CrisisBanner />
      <main id="main-content" className="lg:pl-72 pt-16 relative" tabIndex={-1}>
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-8">{children}</div>
      </main>

      {/* Floating Action Button - Mobile - Premium */}
      <button
        onClick={() => onNavigate?.('new-entry')}
        className="lg:hidden fixed bottom-6 right-6 z-50 p-4 rounded-2xl transition-all duration-300 hover:scale-110"
        style={{
          background: 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)',
          boxShadow: '0 8px 30px rgba(14, 165, 233, 0.4), 0 0 40px rgba(139, 92, 246, 0.2)',
        }}
        aria-label="Quick pain entry"
      >
        <Plus className="h-6 w-6 text-white" />
      </button>

      {/* Panic Mode Button - Floating, High Priority */}
      <button
        onClick={() => setPanicModeActive(true)}
        className={cn(
          'fixed bottom-24 right-6 z-50',
          'lg:bottom-8 lg:right-8',
          'w-14 h-14 min-w-[56px] min-h-[56px]',
          'rounded-2xl',
          'flex items-center justify-center',
          'text-white',
          'transition-all duration-300',
          'hover:scale-110',
          'focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:ring-offset-2 focus:ring-offset-slate-900'
        )}
        style={{
          background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
          boxShadow: '0 8px 30px rgba(139, 92, 246, 0.4)',
        }}
        aria-label="Activate calm breathing mode"
        title="Need a moment? Click for breathing guide"
      >
        <Wind className="h-6 w-6 animate-pulse" />
      </button>

      {/* Panic Mode Overlay */}
      <PanicMode
        isActive={panicModeActive}
        onClose={() => setPanicModeActive(false)}
        showRedactionToggle={false}
      />
    </div>
  );
}

export default ModernAppLayout;
