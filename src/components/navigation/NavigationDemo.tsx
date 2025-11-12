import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Plus,
  TrendingUp,
  Calendar,
  Settings,
  FileText,
  HelpCircle,
  Save,
  Download,
  Trash,
  Copy,
  Edit,
} from 'lucide-react';
import {
  EnhancedNav,
  Breadcrumbs,
  CommandPalette,
  DropdownMenu,
  useNavigationHistory,
  type NavItem,
  type BreadcrumbItem,
  type CommandItem,
  type MenuItem,
} from './index';

/**
 * Enhanced Navigation Demo
 * 
 * Demonstrates all navigation components working together
 * 
 * Features demonstrated:
 * - Sidebar navigation with keyboard shortcuts
 * - Breadcrumb trail
 * - Command palette (⌘K / Ctrl+K)
 * - Navigation history with quick-switch (Alt+Tab)
 * - Dropdown menus
 */
export function NavigationDemo() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [commandOpen, setCommandOpen] = useState(false);

  // Navigation history
  const {
    pushHistory,
    canGoBack,
    canGoForward,
    goBack,
    goForward,
    getRecentItems,
  } = useNavigationHistory({
    maxHistory: 50,
    persistKey: 'pain-tracker-nav-demo',
    enableQuickSwitch: true,
  });

  // Navigation items
  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: LayoutDashboard,
      description: 'View your pain tracking overview',
    },
    {
      id: 'new-entry',
      name: 'New Entry',
      icon: Plus,
      badge: 'New',
      description: 'Create a new pain entry',
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: TrendingUp,
      badge: 'Pro',
      description: 'View detailed pain analytics',
    },
    {
      id: 'calendar',
      name: 'Calendar',
      icon: Calendar,
      description: 'View pain calendar',
    },
    {
      id: 'reports',
      name: 'Reports',
      icon: FileText,
      description: 'Generate WorkSafeBC reports',
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: Settings,
      description: 'App settings and preferences',
    },
    {
      id: 'help',
      name: 'Help',
      icon: HelpCircle,
      shortcut: '?',
      description: 'Get help and support',
    },
  ];

  // Breadcrumb items (dynamic based on current view)
  const breadcrumbItems: BreadcrumbItem[] = [
    { id: 'dashboard', label: 'Dashboard' },
    ...(currentView === 'analytics'
      ? [
          { id: 'analytics', label: 'Analytics' },
          { id: 'charts', label: 'Pain Charts', isCurrent: true },
        ]
      : currentView === 'reports'
      ? [
          { id: 'reports', label: 'Reports' },
          { id: 'worksafebc', label: 'WorkSafeBC', isCurrent: true },
        ]
      : [{ id: currentView, label: navItems.find((i) => i.id === currentView)?.name || currentView, isCurrent: true }]),
  ];

  // Command palette items
  const commandItems: CommandItem[] = [
    ...navItems.map((item) => ({
      id: item.id,
      label: item.name,
      description: item.description,
      icon: item.icon,
      category: 'Navigation',
      action: () => handleNavigate(item.id),
    })),
    {
      id: 'new-pain-entry',
      label: 'New Pain Entry',
      description: 'Quick pain logging',
      icon: Plus,
      category: 'Actions',
      shortcut: '⌘N',
      action: () => console.log('New entry'),
    },
    {
      id: 'export-pdf',
      label: 'Export PDF Report',
      description: 'Download clinical report',
      icon: Download,
      category: 'Actions',
      action: () => console.log('Export PDF'),
    },
    {
      id: 'copy-data',
      label: 'Copy Data',
      description: 'Copy pain data to clipboard',
      icon: Copy,
      category: 'Actions',
      action: () => console.log('Copy data'),
    },
  ];

  // Dropdown menu items
  const dropdownItems: MenuItem[] = [
    {
      id: 'edit',
      label: 'Edit Entry',
      icon: Edit,
      shortcut: '⌘E',
      action: () => console.log('Edit'),
    },
    {
      id: 'duplicate',
      label: 'Duplicate',
      icon: Copy,
      action: () => console.log('Duplicate'),
    },
    { id: 'divider-1', divider: true },
    {
      id: 'save',
      label: 'Save',
      icon: Save,
      shortcut: '⌘S',
      selected: true,
      action: () => console.log('Save'),
    },
    {
      id: 'download',
      label: 'Download',
      icon: Download,
      action: () => console.log('Download'),
    },
    { id: 'divider-2', divider: true },
    {
      id: 'delete',
      label: 'Delete',
      icon: Trash,
      danger: true,
      action: () => console.log('Delete'),
    },
  ];

  // Handle navigation
  const handleNavigate = (viewId: string) => {
    const item = navItems.find((i) => i.id === viewId);
    if (item) {
      setCurrentView(viewId);
      pushHistory({
        id: viewId,
        label: item.name,
      });
    }
  };

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘K / Ctrl+K - Command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen(true);
      }

      // ? - Help
      if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        handleNavigate('help');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with Breadcrumbs */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Pain Tracker
              </h1>

              {/* Breadcrumbs */}
              <Breadcrumbs
                items={breadcrumbItems}
                onNavigate={handleNavigate}
                showHome
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Navigation history buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    const prev = goBack();
                    if (prev) setCurrentView(prev.id);
                  }}
                  disabled={!canGoBack}
                  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Go back"
                  title="Go back (Alt+←)"
                >
                  ←
                </button>
                <button
                  onClick={() => {
                    const next = goForward();
                    if (next) setCurrentView(next.id);
                  }}
                  disabled={!canGoForward}
                  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Go forward"
                  title="Go forward (Alt+→)"
                >
                  →
                </button>
              </div>

              {/* Command palette trigger */}
              <button
                onClick={() => setCommandOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-sm"
              >
                <span className="text-gray-600 dark:text-gray-400">Search...</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-xs font-mono">
                  ⌘K
                </kbd>
              </button>

              {/* Dropdown menu */}
              <DropdownMenu
                trigger={
                  <span className="px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700">
                    Actions
                  </span>
                }
                items={dropdownItems}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-64 flex-shrink-0">
            <div className="sticky top-24">
              <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Navigation
              </h2>
              <EnhancedNav
                items={navItems}
                activeId={currentView}
                onNavigate={handleNavigate}
                orientation="vertical"
                size="md"
                variant="default"
                showShortcuts
                enableKeyboardNav
              />

              {/* Recent navigation */}
              {getRecentItems(3).length > 0 && (
                <div className="mt-8">
                  <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Recent
                  </h2>
                  <div className="space-y-1">
                    {getRecentItems(3).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleNavigate(item.id)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {navItems.find((i) => i.id === currentView)?.name || 'Unknown View'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Current view: <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">{currentView}</code>
              </p>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Keyboard Shortcuts
                </h3>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li><kbd>⌘K</kbd> or <kbd>Ctrl+K</kbd> - Open command palette</li>
                  <li><kbd>1-7</kbd> - Quick navigate to menu items</li>
                  <li><kbd>Alt+←</kbd> - Go back in history</li>
                  <li><kbd>Alt+→</kbd> - Go forward in history</li>
                  <li><kbd>Alt+Tab</kbd> - Quick switch between views</li>
                  <li><kbd>↑</kbd> <kbd>↓</kbd> - Navigate menu items</li>
                  <li><kbd>?</kbd> - Open help</li>
                </ul>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandOpen}
        onClose={() => setCommandOpen(false)}
        items={commandItems}
        recentItems={getRecentItems(5).map((item) => ({
          id: item.id,
          label: item.label,
          category: 'Recent',
          recent: true,
          action: () => handleNavigate(item.id),
        }))}
      />
    </div>
  );
}

export default NavigationDemo;
