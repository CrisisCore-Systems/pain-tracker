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
  Wind
} from 'lucide-react';
import { cn } from '../../design-system/utils';
import { Button, Badge, useTheme } from '../../design-system';
import { PanicMode } from '../accessibility/PanicMode';

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
  stats
}: ModernAppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [panicModeActive, setPanicModeActive] = useState(false);
  const { mode, setMode } = useTheme();

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'new-entry', name: 'New Entry', icon: Plus, badge: null },
    { id: 'body-map', name: 'Body Map', icon: User, badge: null },
    { id: 'fibromyalgia', name: 'Fibromyalgia Hub', icon: Heart, badge: 'New' },
    { id: 'analytics', name: 'Analytics', icon: TrendingUp, badge: 'Pro' },
    { id: 'calendar', name: 'Calendar', icon: Calendar, badge: null },
    { id: 'reports', name: 'Reports', icon: FileText, badge: null },
  ];

  const bottomNavigation = [
    { id: 'settings', name: 'Settings', icon: Settings },
    { id: 'help', name: 'Help', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">
      {/* Skip to Main Content Link - Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-6 focus:py-3 focus:bg-primary-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Modern Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo & Brand */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
                data-testid="nav-toggle"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/30">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                    Pain Tracker Pro
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Empathy-Driven Care</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            {stats && (
              <div className="hidden md:flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                  <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    {stats.avgPain.toFixed(1)} avg
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800">
                  <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                    {stats.streak} day streak
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-xl"
                onClick={() => {}}
              >
                <Bell className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="rounded-xl"
                onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
              >
                {mode === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>

              <div className="p-2 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl cursor-pointer hover:shadow-lg hover:shadow-green-500/30 transition-all">
                <Shield className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:block lg:w-64 lg:pt-16">
        <div className="h-full px-4 py-6 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-r border-gray-200/50 dark:border-gray-700/50">
          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate?.(item.id)}
                  data-nav-target={item.id}
                  className={cn(
                    'group flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn(
                      'h-5 w-5 transition-transform group-hover:scale-110',
                      isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'
                    )} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <Badge variant="outline" className="rounded-full text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <nav className="space-y-1">
              {bottomNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate?.(item.id)}
                    className={cn(
                      'group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all',
                      isActive
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Add Button */}
          <div className="mt-8">
            <Button
              onClick={() => onNavigate?.('new-entry')}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40"
            >
              <Plus className="h-4 w-4 mr-2" />
              Quick Entry
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 shadow-xl">
            <div className="h-full px-4 py-6 pt-20">
              <nav className="space-y-1">
                {navigation.map((item) => {
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
                        'group flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all',
                        isActive
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <Badge variant="outline" className="rounded-full text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main id="main-content" className="lg:pl-64 pt-16" tabIndex={-1}>
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      {/* Floating Action Button - Mobile */}
      <button
        onClick={() => onNavigate?.('new-entry')}
        className="lg:hidden fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/70 transition-all hover:scale-110"
        aria-label="Quick pain entry"
      >
        <Plus className="h-6 w-6 text-white" />
      </button>

      {/* Panic Mode Button - Floating, High Priority */}
      <button
        onClick={() => setPanicModeActive(true)}
        className={cn(
          'fixed bottom-6 left-6 z-50',
          'w-14 h-14 min-w-[56px] min-h-[56px]',
          'bg-gradient-to-br from-purple-500 to-indigo-600',
          'rounded-full shadow-2xl shadow-purple-500/50',
          'flex items-center justify-center',
          'text-white',
          'transition-all duration-300',
          'hover:scale-110 hover:shadow-purple-500/70',
          'focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-offset-2',
          'lg:bottom-8 lg:left-8'
        )}
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
