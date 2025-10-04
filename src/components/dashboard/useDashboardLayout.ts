import { useState, useEffect, useCallback } from 'react';
import type { DashboardLayout } from './constants';
import { DEFAULT_DASHBOARD_LAYOUT, DASHBOARD_LAYOUT_KEY } from './constants';

export function useDashboardLayout() {
  const [layout, setLayout] = useState<DashboardLayout>(DEFAULT_DASHBOARD_LAYOUT);
  const [isLoaded, setIsLoaded] = useState(false);

  const normalizeColumns = useCallback((value: DashboardLayout['columns'] | number | undefined): DashboardLayout['columns'] => {
    return value === 1 ? 1 : 2;
  }, []);

  const normalizeLayout = useCallback((rawLayout: DashboardLayout): DashboardLayout => ({
    ...rawLayout,
    columns: normalizeColumns(rawLayout.columns)
  }), [normalizeColumns]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DASHBOARD_LAYOUT_KEY);
      if (saved) {
        const parsedLayout = JSON.parse(saved) as DashboardLayout;
        setLayout(normalizeLayout(parsedLayout));
      }
    } catch (error) {
      console.warn('Failed to load dashboard layout from localStorage:', error);
    } finally {
      setIsLoaded(true);
    }
  }, [normalizeLayout]);

  const saveLayout = useCallback((newLayout: DashboardLayout) => {
    try {
      const normalized = normalizeLayout(newLayout);
      localStorage.setItem(DASHBOARD_LAYOUT_KEY, JSON.stringify(normalized));
      setLayout(normalized);
    } catch (error) {
      console.error('Failed to save dashboard layout:', error);
    }
  }, [normalizeLayout]);

  const resetLayout = useCallback(() => {
    saveLayout(DEFAULT_DASHBOARD_LAYOUT);
  }, [saveLayout]);

  const toggleWidget = useCallback((widgetId: string) => {
    const newLayout = {
      ...layout,
      widgets: layout.widgets.map(widget =>
        widget.id === widgetId
          ? { ...widget, visible: !widget.visible }
          : widget
      )
    };
    saveLayout(newLayout);
  }, [layout, saveLayout]);

  const updateWidgetSize = useCallback((widgetId: string, size: 'small' | 'medium' | 'large' | 'full') => {
    const newLayout = {
      ...layout,
      widgets: layout.widgets.map(widget =>
        widget.id === widgetId
          ? { ...widget, size }
          : widget
      )
    };
    saveLayout(newLayout);
  }, [layout, saveLayout]);

  const reorderWidgets = useCallback((startIndex: number, endIndex: number) => {
    const newWidgets = Array.from(layout.widgets);
    const [removed] = newWidgets.splice(startIndex, 1);
    newWidgets.splice(endIndex, 0, removed);

    const updatedWidgets = newWidgets.map((widget, index) => ({
      ...widget,
      position: index
    }));

    const newLayout = {
      ...layout,
      widgets: updatedWidgets
    };
    saveLayout(newLayout);
  }, [layout, saveLayout]);

  const updateLayoutSettings = useCallback((settings: Partial<DashboardLayout>) => {
    const newLayout = {
      ...layout,
      ...settings
    };

    if (settings.columns !== undefined) {
      newLayout.columns = normalizeColumns(settings.columns);
    }

    saveLayout(newLayout);
  }, [layout, normalizeColumns, saveLayout]);

  return {
    layout,
    isLoaded,
    saveLayout,
    resetLayout,
    toggleWidget,
    updateWidgetSize,
    reorderWidgets,
    updateLayoutSettings
  };
}
