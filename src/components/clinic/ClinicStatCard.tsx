/**
 * Clinic Stat Card - Statistical overview card for clinical dashboard
 */

import { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ClinicStatCardProps {
  title: string;
  value: number | string;
  change?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down';
  iconColor?: string;
}

export function ClinicStatCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  trend,
  iconColor = 'bg-blue-500' 
}: ClinicStatCardProps) {
  const isPositiveTrend = trend === 'up';
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {title}
          </p>
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">
            {value}
          </p>
          {change && (
            <div className="flex items-center gap-1 mt-2">
              {isPositiveTrend ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <span 
                className={`text-sm font-medium ${
                  isPositiveTrend ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {change}
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                vs last week
              </span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg ${iconColor} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}
