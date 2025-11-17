import React, { useState } from 'react';
import { Settings, Eye, EyeOff, RotateCcw, Save, Layout } from 'lucide-react';
import {
  Modal,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
} from '../../design-system';
import { cn } from '../../design-system/utils';
import type { DashboardLayout, WidgetType } from './constants';
import { AVAILABLE_WIDGETS } from './constants';

type WidgetCategory = 'all' | 'core' | 'analytics' | 'reports' | 'utilities';

type LayoutSettings = Partial<Pick<DashboardLayout, 'layout' | 'columns'>> & {
  widgets?: DashboardLayout['widgets'];
};

export interface WidgetManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  layout: DashboardLayout;
  onToggleWidget: (widgetId: string) => void;
  onResetLayout: () => void;
  onUpdateLayoutSettings: (settings: LayoutSettings) => void;
}

const CATEGORY_LABELS: Record<Exclude<WidgetCategory, 'all'>, string> = {
  core: 'Core',
  analytics: 'Analytics',
  reports: 'Reports',
  utilities: 'Utilities',
};

function getCategoryCount(layout: DashboardLayout, category: WidgetCategory) {
  if (category === 'all') {
    return layout.widgets.length;
  }

  return layout.widgets.filter(widget => AVAILABLE_WIDGETS[widget.type].category === category)
    .length;
}

function getWidgetsForCategory(layout: DashboardLayout, category: WidgetCategory) {
  if (category === 'all') {
    return layout.widgets;
  }

  return layout.widgets.filter(widget => AVAILABLE_WIDGETS[widget.type].category === category);
}

export function WidgetManagementModal({
  isOpen,
  onClose,
  layout,
  onToggleWidget,
  onResetLayout,
  onUpdateLayoutSettings,
}: WidgetManagementModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<WidgetCategory>('all');

  const categories: { id: WidgetCategory; label: string; count: number }[] = [
    { id: 'all', label: 'All Widgets', count: getCategoryCount(layout, 'all') },
    { id: 'core', label: CATEGORY_LABELS.core, count: getCategoryCount(layout, 'core') },
    {
      id: 'analytics',
      label: CATEGORY_LABELS.analytics,
      count: getCategoryCount(layout, 'analytics'),
    },
    { id: 'reports', label: CATEGORY_LABELS.reports, count: getCategoryCount(layout, 'reports') },
    {
      id: 'utilities',
      label: CATEGORY_LABELS.utilities,
      count: getCategoryCount(layout, 'utilities'),
    },
  ];

  const filteredWidgets = getWidgetsForCategory(layout, selectedCategory);

  const handleLayoutChange = (
    property: 'layout' | 'columns',
    value: DashboardLayout['layout'] | DashboardLayout['columns']
  ) => {
    if (property === 'columns') {
      const normalized = value === 1 ? 1 : 2;
      onUpdateLayoutSettings({ columns: normalized });
      return;
    }

    onUpdateLayoutSettings({ [property]: value } as LayoutSettings);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Settings className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-xl font-semibold">Customize Dashboard</h2>
              <p className="text-sm text-muted-foreground">
                Add, remove, and rearrange your dashboard widgets
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        {/* Layout Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Layout className="h-5 w-5" />
              <span>Layout Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Layout Style</label>
                <select
                  value={layout.layout}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    handleLayoutChange('layout', e.target.value as DashboardLayout['layout'])
                  }
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="grid">Grid</option>
                  <option value="masonry">Masonry</option>
                  <option value="list">List</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Columns</label>
                <select
                  value={layout.columns}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    handleLayoutChange(
                      'columns',
                      parseInt(e.target.value, 10) as DashboardLayout['columns']
                    )
                  }
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value={1}>1 Column</option>
                  <option value={2}>2 Columns</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Widget Categories */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                'px-3 py-2 text-sm rounded-full border transition-colors',
                selectedCategory === category.id
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-foreground border-border hover:border-primary/50'
              )}
            >
              {category.label} ({category.count})
            </button>
          ))}
        </div>

        {/* Widget List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredWidgets.map(widget => {
            const config = AVAILABLE_WIDGETS[widget.type];
            return (
              <Card
                key={widget.id}
                className={cn(
                  'transition-all',
                  widget.visible ? 'border-primary/20 bg-primary/5' : 'opacity-60'
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="text-primary mt-1">{config.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-medium">{config.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{config.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {config.category}
                          </Badge>
                          {config.canRemove && (
                            <Badge variant="secondary" className="text-xs">
                              Removable
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggleWidget(widget.id)}
                        className="p-2"
                        aria-label={widget.visible ? 'Hide widget' : 'Show widget'}
                      >
                        {widget.visible ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="outline" onClick={onResetLayout}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Default
          </Button>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onClose}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
