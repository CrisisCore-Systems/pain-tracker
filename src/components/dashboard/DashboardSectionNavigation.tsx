import React from 'react';
import { Button } from '../../design-system';
import { cn } from '../../design-system/utils';
import type { DashboardSection, DashboardSectionDefinition } from './dashboardSectionConfig';

interface DashboardSectionNavigationProps {
  sections: DashboardSectionDefinition[];
  activeSection: DashboardSection;
  onSectionChange: (section: DashboardSection) => void;
}

export function DashboardSectionNavigation({
  sections,
  activeSection,
  onSectionChange,
}: DashboardSectionNavigationProps) {
  return (
    <nav
      className="rounded-3xl border border-border/50 bg-muted/30 p-2"
      role="tablist"
      aria-label="Dashboard focus modes"
    >
      <div className="flex w-full gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'thin' }}>
        {sections.map(section => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          return (
            <Button
              key={section.id}
              variant={isActive ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onSectionChange(section.id)}
              aria-pressed={isActive}
              className={cn(
                'flex h-auto min-w-[180px] max-w-[260px] flex-1 items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all duration-200',
                !isActive && 'border border-border bg-background/60 hover:bg-background/80',
                isActive && 'shadow-sm shadow-primary/20'
              )}
            >
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 text-left">
                <span className="block text-sm font-semibold text-foreground text-balance">
                  {section.label}
                </span>
                <span className="block text-xs leading-tight text-muted-foreground text-pretty">
                  {section.description}
                </span>
              </div>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
