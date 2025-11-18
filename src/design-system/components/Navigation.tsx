import React, { useState } from 'react';
import { ChevronRight, Home, Menu } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import { cn } from '../utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  separator?: React.ReactNode;
}

export function Breadcrumb({ items, className, separator }: BreadcrumbProps) {
  return (
    <nav className={cn('flex items-center space-x-2 text-sm text-muted-foreground', className)}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span className="text-muted-foreground/50">
              {separator || <ChevronRight className="h-4 w-4" />}
            </span>
          )}
          {item.href || item.onClick ? (
            <button
              onClick={item.onClick}
              className="hover:text-foreground transition-colors flex items-center space-x-1"
            >
              {index === 0 && <Home className="h-4 w-4" />}
              <span>{item.label}</span>
            </button>
          ) : (
            <span className="text-foreground flex items-center space-x-1">
              {index === 0 && <Home className="h-4 w-4" />}
              <span>{item.label}</span>
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullWidth?: boolean;
}

export function Tabs({
  tabs,
  activeTab,
  onTabChange,
  variant = 'default',
  size = 'md',
  className,
  fullWidth = false,
}: TabsProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const variantClasses = {
    default: 'border-b border-border',
    pills: 'bg-muted p-1 rounded-lg',
    underline: 'border-b border-border',
  };

  const tabClasses = {
    default: (isActive: boolean) =>
      cn(
        'border-b-2 transition-colors',
        isActive
          ? 'border-primary text-primary'
          : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
      ),
    pills: (isActive: boolean) =>
      cn(
        'rounded-md transition-colors',
        isActive
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground'
      ),
    underline: (isActive: boolean) =>
      cn(
        'border-b-2 transition-colors',
        isActive
          ? 'border-primary text-primary'
          : 'border-transparent text-muted-foreground hover:text-foreground'
      ),
  };

  return (
    <div className={cn(variantClasses[variant], className)}>
      <div
        className={cn(
          'flex',
          fullWidth ? 'w-full' : 'inline-flex',
          variant === 'pills' ? 'gap-0' : 'gap-0'
        )}
      >
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && onTabChange(tab.id)}
              disabled={tab.disabled}
              className={cn(
                sizeClasses[size],
                tabClasses[variant](isActive),
                fullWidth && 'flex-1 justify-center',
                tab.disabled && 'opacity-50 cursor-not-allowed',
                'flex items-center space-x-2 font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
              )}
            >
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={cn(
                    'px-2 py-0.5 text-xs rounded-full',
                    isActive
                      ? 'bg-primary-foreground text-primary'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export interface SidebarItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  badge?: string | number;
  children?: SidebarItem[];
  disabled?: boolean;
}

export interface SidebarProps {
  items: SidebarItem[];
  activeItem?: string;
  onItemClick?: (item: SidebarItem) => void;
  collapsed?: boolean;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export function Sidebar({
  items,
  activeItem,
  onItemClick,
  collapsed = false,
  className,
  header,
  footer,
}: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const renderItem = (item: SidebarItem, level = 0) => {
    const isActive = activeItem === item.id;
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id}>
        <button
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
            } else {
              item.onClick?.();
              onItemClick?.(item);
            }
          }}
          disabled={item.disabled}
          className={cn(
            'w-full flex items-center space-x-3 px-3 py-2 text-left transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            isActive && 'bg-primary/10 text-primary border-r-2 border-primary',
            item.disabled && 'opacity-50 cursor-not-allowed',
            level > 0 && 'ml-6'
          )}
        >
          {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
          {!collapsed && (
            <>
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge && (
                <span className="px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                  {item.badge}
                </span>
              )}
              {hasChildren && (
                <ChevronRight
                  className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-90')}
                />
              )}
            </>
          )}
        </button>

        {hasChildren && isExpanded && !collapsed && (
          <div className="ml-2">{item.children!.map(child => renderItem(child, level + 1))}</div>
        )}
      </div>
    );
  };

  return (
    <Card className={cn('flex flex-col h-full', className)}>
      {header && <div className="p-4 border-b">{header}</div>}

      <div className="flex-1 overflow-y-auto p-2">{items.map(item => renderItem(item))}</div>

      {footer && <div className="p-4 border-t">{footer}</div>}
    </Card>
  );
}

export interface NavigationProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  sidebarCollapsed?: boolean;
  onSidebarToggle?: () => void;
}

export function Navigation({
  children,
  sidebar,
  header,
  footer,
  className,
  sidebarCollapsed = false,
  onSidebarToggle,
}: NavigationProps) {
  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {/* Header */}
      {header && (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center px-4">
            {sidebar && onSidebarToggle && (
              <Button variant="ghost" size="sm" onClick={onSidebarToggle} className="mr-2">
                <Menu className="h-5 w-5" />
              </Button>
            )}
            {header}
          </div>
        </header>
      )}

      <div className="flex">
        {/* Sidebar */}
        {sidebar && (
          <aside
            className={cn(
              'transition-all duration-300 ease-in-out',
              sidebarCollapsed ? 'w-16' : 'w-64'
            )}
          >
            {sidebar}
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6">{children}</div>
        </main>
      </div>

      {/* Footer */}
      {footer && <footer className="border-t bg-background">{footer}</footer>}
    </div>
  );
}
