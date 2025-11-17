import React, { useState } from 'react';
import { Table, BarChart } from 'lucide-react';
import { cn } from '../../design-system/utils';
import Chart from '../../design-system/components/Chart';

/**
 * Accessible chart component with table view toggle
 * Provides dual-path access to data visualization for screen reader users
 * 
 * WCAG 2.2 AA: Complex graphics must have text alternatives
 */

export interface ChartDataPoint {
  label: string;
  value: number;
  additionalInfo?: string;
}

export interface ChartWithTableToggleProps {
  /** Chart title */
  title: string;
  /** Chart description for screen readers */
  description: string;
  /** Chart type from Chart component */
  type: 'line' | 'bar' | 'doughnut' | 'pie' | 'radar';
  /** Chart.js data object */
  chartData: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      [key: string]: unknown;
    }>;
  };
  /** Tabular data for accessible view */
  tableData: ChartDataPoint[];
  /** Icon component (Lucide) */
  icon?: React.ComponentType<{ className?: string }>;
  /** Height of chart in pixels */
  height?: number;
  /** Additional class names */
  className?: string;
  /** Optional footer content */
  footer?: React.ReactNode;
}

export function ChartWithTableToggle({
  title,
  description,
  type,
  chartData,
  tableData,
  icon: Icon,
  height = 256,
  className,
  footer
}: ChartWithTableToggleProps) {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

  return (
    <div className={cn(
      'bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-lg',
      className
    )}>
      {/* Header with Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
        
        <div className="flex items-center gap-3">
          {Icon && <Icon className="h-6 w-6 text-gray-400 dark:text-gray-500" aria-hidden="true" />}
          
          {/* View Toggle Button */}
          <button
            onClick={() => setViewMode(viewMode === 'chart' ? 'table' : 'chart')}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg transition-all',
              'min-h-[44px] min-w-[44px]',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
              'hover:bg-gray-100 dark:hover:bg-gray-800',
              'text-sm font-medium text-gray-700 dark:text-gray-300'
            )}
            aria-label={viewMode === 'chart' ? 'Switch to table view' : 'Switch to chart view'}
            aria-pressed={viewMode === 'table'}
          >
            {viewMode === 'chart' ? (
              <>
                <Table className="h-4 w-4" />
                <span className="hidden sm:inline">Table</span>
              </>
            ) : (
              <>
                <BarChart className="h-4 w-4" />
                <span className="hidden sm:inline">Chart</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div style={{ minHeight: height }}>
        {viewMode === 'chart' ? (
          <div className="h-64" role="img" aria-label={`${title}. ${description}`}>
            <Chart type={type} data={chartData} height={height} />
            {/* Screen reader summary */}
            <div className="sr-only">
              {title}. {description}.
              Data summary: {tableData.length} items.
              {tableData.slice(0, 3).map((item, i) => (
                <span key={i}>
                  {item.label}: {item.value}.
                </span>
              ))}
              {tableData.length > 3 && `And ${tableData.length - 3} more items.`}
              Use the table view button to see all data in a table format.
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                    Category
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">
                    Value
                  </th>
                  {tableData.some(d => d.additionalInfo) && (
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      Details
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {tableData.map((item, index) => (
                  <tr
                    key={index}
                    className={cn(
                      'border-b border-gray-100 dark:border-gray-800',
                      'hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors'
                    )}
                  >
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                      {item.label}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-gray-900 dark:text-white">
                      {typeof item.value === 'number' ? item.value.toFixed(1) : item.value}
                    </td>
                    {tableData.some(d => d.additionalInfo) && (
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-xs">
                        {item.additionalInfo || '—'}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
              {tableData.length > 0 && (
                <tfoot>
                  <tr>
                    <td colSpan={tableData.some(d => d.additionalInfo) ? 3 : 2} className="py-3 px-4 text-xs text-gray-500 dark:text-gray-400">
                      {tableData.length} {tableData.length === 1 ? 'row' : 'rows'} total
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>

      {/* Optional Footer */}
      {footer && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {footer}
        </div>
      )}
    </div>
  );
}
